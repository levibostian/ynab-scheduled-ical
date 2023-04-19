import { parse } from "https://deno.land/std@0.182.0/flags/mod.ts";
import * as logger from "https://deno.land/std@0.183.0/log/mod.ts";
import ical, { ICalEventData } from "npm:ical-generator@4"

const flags = parse(Deno.args, {
  boolean: ["debug"],
  default: { debug: false },
})

logger.setup({  
  handlers: {
    console: new logger.handlers.ConsoleHandler(flags.debug ? "DEBUG" : "INFO", {
      formatter: "{msg}"
    }),
  },
  loggers: {
    default: {
      level: flags.debug ? "DEBUG" : "INFO",
      handlers: ["console"],
    },
  }
})
const log = logger.getLogger()

log.debug(`CLI args passed: ${JSON.stringify(flags)}`)

// First, we need to get the Budget ID that you want to create a calendar with. 
// We get the list of budget IDs from YNAB, then we filter those by some info that is provided to the tool. 

const assertAndGetEnvVar = (key: string): string => {
  let value = Deno.env.get(key)
  if (!value || value == "") {
    log.error(`Forgot to set ${key}. I cannot run without it, exiting.`) 
    Deno.exit(1)
  }
  return value.trim()
}

const ynabPersonalAccessToken = assertAndGetEnvVar("YNAB_PERSONAL_ACCESS_TOKEN")
const ynabBudgetId = assertAndGetEnvVar("YNAB_BUDGET_ID")

const ynabFetch = async<T>(path: string): Promise<T> => {
  const res = await fetch(`https://api.ynab.com${path}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${ynabPersonalAccessToken}`,
      accept: 'application/json'
    }
  })

  const responseString = await res.text()

  return JSON.parse(responseString) as T 
}

log.info("Finding your budget...")

const ynabBudgets: {
  data: {
    budgets: {
      id: string,
      name: string 
    }[]
  }
} = await ynabFetch('/v1/budgets?include_accounts=false')

log.debug(`Budgets from API: ${JSON.stringify(ynabBudgets)}`)

let budget = ynabBudgets.data.budgets.find(budget =>
  budget.name == ynabBudgetId
)
if (!budget) {
  log.error(`Couldn't find budget that you specified by name or ID`)
  Deno.exit(1)
}
log.debug(`Found budget: ${JSON.stringify(budget)}`)
budget = budget!

log.info("Getting all scheduled transactions for budget...")

// use ynab api to get all scheduled transactions list. 

interface YnabTransaction {
  id: string 
  date_next: string
  amount: number
  memo: string
  payee_name: string
  account_name: string
  category_name: string 
}

const ynabScheduledTransactions: {
  data: {
    scheduled_transactions: YnabTransaction[]
  }
} = await ynabFetch(`/v1/budgets/${budget.id}/scheduled_transactions`)

log.debug(`ynab scheduled transactions ${JSON.stringify(ynabScheduledTransactions)}`)

// iterate all future transactions and create ical from it. 

const icalCalendar = ical({name: "YNAB Scheduled"})
ynabScheduledTransactions.data.scheduled_transactions.forEach(transaction => {
  // Example amount value: -98990 which is supposed to be: 98.99. So, we have some modifications to do.   
  let amount = transaction.amount / 10 // not sure why, but YNAB buts a "0" at the end of every transaction amount. Remove the last character from string. 
  amount = amount / 100 // This will give the decimal value. 
  const amountString = String(amount).replace("-", "") // remove leading "-" 

  const calendarEvent: ICalEventData = {
    id: transaction.id,
    summary: `${transaction.payee_name} $${amountString}`,
    start: transaction.date_next,
    end: transaction.date_next,
    description: transaction.memo,
    allDay: true    
  }

  icalCalendar.createEvent(calendarEvent)
})

log.info("Saving .ics calendar file...")

icalCalendar.saveSync("./ynab_scheduled.ics")

log.info("Success!")

