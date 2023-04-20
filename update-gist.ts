import * as logger from "https://deno.land/std@0.183.0/log/mod.ts";
import { Octokit } from "npm:@octokit/rest@19"
import {posix as paths, posix} from "https://deno.land/std@0.182.0/path/mod.ts";

export const createOrUpdateGist = async(args: {filePaths: string[], secretGist: boolean, gistDescription: string, gistDescriptionFilterablePhrase: string, log: logger.Logger}): Promise<void> => {
  const log = args.log
  log.info(`Finding existing GitHub Gist if one has previously been created...`)

  const githubAuthToken = assertAndGetEnvVar("GIST_PERSONAL_ACCESS_TOKEN")
  const octokit = new Octokit({
    auth: githubAuthToken
  });

  const gists = await octokit.paginate(
    "GET /gists",
    (response, done) => {
      if (response.data.find((gist) => gist.description?.includes(args.gistDescriptionFilterablePhrase))) {
        done()
      }
      return response.data;
    }
  );
  const gist = gists.find((gist) => gist.description?.includes(args.gistDescriptionFilterablePhrase))
  
  log.debug(`Gist: ${gist}`)

  const fileAbsolutePaths = args.filePaths.map(filePath => paths.resolve(filePath))
  const files: { [key: string]: { content: string }} = {}
  fileAbsolutePaths.forEach(filePath => {
    const fileName = posix.basename(filePath)
    files[fileName] = {
      content: Deno.readTextFileSync(filePath)
    }
  })
  
  const gistCreateUpdatePayload: {
    description: string,
    public: boolean,
    files: {
      [key: string]: {
        content: string 
      }
    }
  } = {
    description: `${args.gistDescription} ${args.gistDescriptionFilterablePhrase}`,
    public: !args.secretGist,
    files
  }

  log.debug(`Gist create/update payload: ${gistCreateUpdatePayload}`)
  
  if (gist) {
    log.info(`Found existing Gist.`)

    await octokit.rest.gists.update({
      gist_id: gist.id,
      ...gistCreateUpdatePayload
    });
  } else {
    log.info(`Previously created Gist not found. We will create a new one.`)

    await octokit.rest.gists.create(gistCreateUpdatePayload)
  }
  
  log.info(`Success!`)
}

const assertAndGetEnvVar = (key: string): string => {
  let value = Deno.env.get(key)
  if (!value || value == "") {
    //log.error(`Forgot to set ${key}. I cannot run without it, exiting.`) 
    Deno.exit(1)
  }
  return value.trim()
}





