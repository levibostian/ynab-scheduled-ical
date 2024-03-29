export { parse as flagsParse } from "https://deno.land/std@0.185.0/flags/mod.ts";
export * as logger from "https://deno.land/std@0.185.0/log/mod.ts";
import ical from "npm:ical-generator@4.0.0"; 
export {ical};
export type {ICalEventData} from "npm:ical-generator@4.0.0"
export { Octokit } from "npm:@octokit/rest@19.0.7"
export {posix as paths, posix} from "https://deno.land/std@0.185.0/path/mod.ts";