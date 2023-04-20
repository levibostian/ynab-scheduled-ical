# ynab-scheduled-ical

More easily see your upcoming YNAB scheduled transactions. 

This project generates a calendar you can subscribe to using the calendar app you're already using that displays all of the scheduled transactions in your YNAB budget. 

# Why did you create this? 

I create my month's YNAB budget at the beginning of each month. One step in creating my budget is to view upcoming events in my calendar to see if I planned for those events in my budget. Then, I check my scheduled transactions for the month in YNAB to see if there are any I should delete or modify. 

Because I am swapping between my YNAB budget and my calendar app, I figured being able to see both at once would make the task easier. 

# Getting started 

Want to use this project yourself? Follow these steps. 

* Fork this repo. 
* In the repository settings, set these GitHub Action Secrets: 
1. `YNAB_PERSONAL_ACCESS_TOKEN` - Generate a new YNAB personal access token. Follow [the YNAB API docs](https://api.ynab.com/) *Quick Start* section for the most up-to-date method on how to generate this token. 
2. `YNAB_BUDGET_NAME` - The name of your budget in YNAB. 
3. `GIST_PERSONAL_ACCESS_TOKEN` - A GitHub personal access token with the permissions `gist` enabled. 

* Run the GitHub Action workflow manually to have the calendar created. 
* Open the newly created Gist and get the Gist ID. Put that ID into this URL: 

```
https://gist.githubusercontent.com/<your-github-username>/<gist-id>/raw/ynab_scheduled.ics
```

* Open your calendar app and subscribe to this `ical` URL. 

> Tip: Keep this URL a secret. Unless you want others to view your upcoming transactions, don't share the URL. If you do share the URL by accident, just delete the Gist and the next time this project runs, a new Gist will be created. 

# Contribute 

Want to contribute to this project? 

Dev setup
* Install Deno. 
* Run the `deno run` script that's located in `./.github/workflows/update-gist-ical.yml`. It's recommended to run with `--debug` at the end of the command during local development. 

