#!/usr/bin/env node
import 'dotenv/config'; // Load environment variables from .env file
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import fetch, { Request, Response } from 'node-fetch';

// Import only the needed operations modules
import * as repository from './operations/repository.js';
import * as files from './operations/files.js';
import * as daily from './operations/daily.js';
import {
    GitHubError,
    GitHubValidationError,
    GitHubResourceNotFoundError,
    GitHubAuthenticationError,
    GitHubPermissionError,
    GitHubRateLimitError,
    GitHubConflictError,
    isGitHubError,
} from './common/errors.js';
import { VERSION } from "./common/version.js";

// If fetch doesn't exist in global scope, add it
if (!globalThis.fetch) {
    globalThis.fetch = fetch as unknown as typeof global.fetch;
}

const server = new Server(
    {
        name: "github-contribution-server",
        version: VERSION,
    },
    {
        capabilities: {
            tools: {},
        },
    }
);

function formatGitHubError(error: GitHubError): string {
    let message = `GitHub API Error: ${error.message}`;

    if (error instanceof GitHubValidationError) {
        message = `Validation Error: ${error.message}`;
        if (error.response) {
            message += `\nDetails: ${JSON.stringify(error.response)}`;
        }
    } else if (error instanceof GitHubResourceNotFoundError) {
        message = `Not Found: ${error.message}`;
    } else if (error instanceof GitHubAuthenticationError) {
        message = `Authentication Failed: ${error.message}`;
    } else if (error instanceof GitHubPermissionError) {
        message = `Permission Denied: ${error.message}`;
    } else if (error instanceof GitHubRateLimitError) {
        message = `Rate Limit Exceeded: ${error.message}\nResets at: ${error.resetAt.toISOString()}`;
    } else if (error instanceof GitHubConflictError) {
        message = `Conflict: ${error.message}`;
    }

    return message;
}

server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: "do_my_todays_github_contribution",
                description: "Creates a new private repository for today's GitHub contribution",
                inputSchema: zodToJsonSchema(repository.CreateDailyContributionSchema),
            },
            {
                name: "search_repositories",
                description: "Search for GitHub repositories",
                inputSchema: zodToJsonSchema(repository.SearchRepositoriesSchema),
            },
            {
                name: "get_file_contents",
                description: "Get the contents of a file or directory from a GitHub repository",
                inputSchema: zodToJsonSchema(files.GetFileContentsSchema),
            },
            {
                name: "create_or_update_file",
                description: "Create or update a single file in a GitHub repository",
                inputSchema: zodToJsonSchema(files.CreateOrUpdateFileSchema),
            },
            {
                name: "push_files",
                description: "Push multiple files to a GitHub repository in a single commit",
                inputSchema: zodToJsonSchema(files.PushFilesSchema),
            },
        ],
    };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
    try {
        if (!request.params.arguments) {
            throw new Error("Arguments are required");
        }

        switch (request.params.name) {
            case "do_my_todays_github_contribution": {
                const args = repository.CreateDailyContributionSchema.parse(request.params.arguments);
                const result = await repository.createDailyContribution(args);
                return {
                    content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
                };
            }
            case "search_repositories": {
                const args = repository.SearchRepositoriesSchema.parse(request.params.arguments);
                const results = await repository.searchRepositories(
                    args.query,
                    args.page,
                    args.perPage
                );
                return {
                    content: [{ type: "text", text: JSON.stringify(results, null, 2) }],
                };
            }
            case "get_file_contents": {
                const args = files.GetFileContentsSchema.parse(request.params.arguments);
                const contents = await files.getFileContents(
                    args.owner,
                    args.repo,
                    args.path,
                    args.branch
                );
                return {
                    content: [{ type: "text", text: JSON.stringify(contents, null, 2) }],
                };
            }
            case "create_or_update_file": {
                const args = files.CreateOrUpdateFileSchema.parse(request.params.arguments);
                const result = await files.createOrUpdateFile(
                    args.owner,
                    args.repo,
                    args.path,
                    args.content,
                    args.message,
                    args.branch,
                    args.sha
                );
                return {
                    content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
                };
            }
            case "push_files": {
                const args = files.PushFilesSchema.parse(request.params.arguments);
                const result = await files.pushFiles(
                    args.owner,
                    args.repo,
                    args.branch,
                    args.files,
                    args.message
                );
                return {
                    content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
                };
            }
            default:
                throw new Error(`Unknown tool: ${request.params.name}`);
        }
    } catch (error) {
        if (error instanceof z.ZodError) {
            throw new Error(`Invalid input: ${JSON.stringify(error.errors)}`);
        }
        if (isGitHubError(error)) {
            throw new Error(formatGitHubError(error));
        }
        throw error;
    }
});

async function runServer() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("GitHub MCP Server running on stdio");
}

runServer().catch((error) => {
    console.error("Fatal error in main():", error);
    process.exit(1);
});