// A simple script to test if your GitHub Personal Access Token is working correctly
import 'dotenv/config';
import { githubRequest } from './common/utils.js';

async function testGitHubToken() {
  console.log('Testing GitHub Personal Access Token...');
  
  if (!process.env.GITHUB_PERSONAL_ACCESS_TOKEN) {
    console.error('❌ ERROR: GITHUB_PERSONAL_ACCESS_TOKEN not found in environment variables.');
    console.error('Please add your token to the .env file in the project root:');
    console.error('GITHUB_PERSONAL_ACCESS_TOKEN=your_github_token_here');
    return;
  }

  try {
    // Get the authenticated user info to test the token
    const userData = await githubRequest('https://api.github.com/user');
    console.log('✅ Success! Your GitHub token is valid.');
    console.log(`Authenticated as: ${(userData as any).login}`);
    console.log(`Token has access to ${(userData as any).public_repos} public repositories and ${(userData as any).total_private_repos} private repositories.`);
  } catch (error) {
    console.error('❌ ERROR: Failed to authenticate with GitHub API.');
    console.error('Error details:', error);
    console.error('Please check that your token is correct and has the necessary permissions.');
  }
}

testGitHubToken().catch(error => {
  console.error('Unexpected error:', error);
  process.exit(1);
});