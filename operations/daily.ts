// filepath: d:\My Data\MCP servers\gcs\operations\daily.ts
import { createDailyContribution, CreateDailyContributionSchema, CreateDailyContributionOptions } from "./repository.js";
import { GitHubRepositorySchema } from "../common/types.js";

/**
 * Creates a daily contribution repository on GitHub
 */
export const createDailyContributionOperation = {
  id: "do_my_todays_github_contribution",
  schema: CreateDailyContributionSchema,
  description: "Creates a new private repository for today's GitHub contribution",
  parameters: {
    prefix: {
      description: "Optional prefix for repository name (default: 'daily-contribution')"
    }
  },
  result: {
    schema: GitHubRepositorySchema,
    description: "Newly created repository information"
  },
  execute: async (options: CreateDailyContributionOptions) => {
    return await createDailyContribution(options);
  }
};