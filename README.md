# GitHub Contribution Server (GCS)

A Model Context Protocol (MCP) server for interacting with GitHub.

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. **Create a GitHub Personal Access Token**:
   - Go to [GitHub Settings > Developer Settings > Personal Access Tokens](https://github.com/settings/tokens)
   - Click "Generate new token" (classic)
   - Give it a meaningful name like "GitHub Contribution Server"
   - Select the following scopes:
     - `repo` (Full control of private repositories)
     - `user` (Read and write user profile data)
   - Click "Generate token"
   - **⚠️ Copy your token immediately!** GitHub will only show it once.

3. Set up your environment variables:
   - Copy the provided `.env` file template
   - Replace `your_github_token_here` with your actual token:
   ```
   GITHUB_PERSONAL_ACCESS_TOKEN=your_actual_token_here
   ```

4. Test your token:
   ```
   npm run test-token
   ```
   You should see a success message confirming that your token is working.

5. Build the server:
   ```
   npm run build
   ```

## Using the Server

This MCP server provides several GitHub operations:

### Today's GitHub Contribution

Creates a new private repository for today's (${new Date().toISOString().split('T')[0]}) GitHub contribution.

Usage:
```
do_my_todays_github_contribution
```

Optional parameters:
- `prefix`: Customize the repository name prefix (default is "daily-contribution")

### Search Repositories 

Search for GitHub repositories using GitHub's search syntax.

Usage:
```
search_repositories
  query: "topic:typescript stars:>100"
  page: 1
  perPage: 10
```

### File Operations

- Get file contents: `get_file_contents`
- Create or update a file: `create_or_update_file`
- Push multiple files: `push_files`

## Troubleshooting

If you encounter authentication errors:

1. Check that your `.env` file exists and contains the correct token
2. Verify your token is valid using `npm run test-token`
3. Ensure your token has the required scopes
4. If your token has expired, generate a new one and update your `.env` file

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.