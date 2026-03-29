#!/usr/bin/env node

const https = require('https');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const OWNER = 'sahuljr7';
const REPO = 'v0-ai-prompt-optimizer';
const HEAD_BRANCH = 'v0/freelancesahul-3804-dae9465b';
const BASE_BRANCH = 'main';

if (!GITHUB_TOKEN) {
  console.error('[v0] Error: GITHUB_TOKEN environment variable is not set');
  process.exit(1);
}

function makeGitHubRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.github.com',
      port: 443,
      path,
      method,
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'v0-pr-automation',
        'Content-Type': 'application/json',
      },
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const parsed = data ? JSON.parse(data) : {};
          if (res.statusCode >= 400) {
            reject(new Error(`GitHub API error (${res.statusCode}): ${data}`));
          } else {
            resolve(parsed);
          }
        } catch (e) {
          reject(new Error(`Failed to parse response: ${e.message}`));
        }
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function createAndMergePR() {
  try {
    console.log('[v0] Creating PR from', HEAD_BRANCH, 'to', BASE_BRANCH);

    // Create the PR
    const prBody = {
      title: 'feat: Add session persistence for Optimizer and Transcript features',
      body: `## Changes

### Features Added
- **Session Persistence for Optimizer**: Users can now save and reload multiple optimization sessions with different prompts, tones, and styles
- **Session Persistence for Transcript**: Users can now save and reload multiple transcript analysis sessions with file uploads and analysis results
- **Generic Sessions Hook**: Created a reusable session management system with localStorage integration
- **Language Handling**: Enhanced transcript analyzer to handle multi-language inputs and output in user's preferred language (English by default)

### Implementation Details
- Created \`use-sessions.ts\` - Generic session management hook with full localStorage integration
- Created \`use-optimizer-sessions.ts\` - Type-safe wrapper for optimizer sessions
- Created \`use-transcript-sessions.ts\` - Type-safe wrapper for transcript sessions
- Updated \`prompt-optimizer-panel.tsx\` - Added collapsible sessions sidebar
- Updated \`transcript-analyzer-panel.tsx\` - Added collapsible sessions sidebar
- Updated \`app/api/transcript/route.ts\` - Enhanced language handling instructions

### Storage Structure
- Sessions are stored with unique IDs combining timestamps and random suffixes
- Each session maintains consistent structure across features
- Auto-save/load functionality on state changes
- No manual save button required

### Testing
- Verified session creation, switching, deletion
- Tested data persistence across page refreshes
- Confirmed localStorage structure consistency`,
      head: HEAD_BRANCH,
      base: BASE_BRANCH,
    };

    const prResponse = await makeGitHubRequest(
      'POST',
      `/repos/${OWNER}/${REPO}/pulls`,
      prBody
    );

    const prNumber = prResponse.number;
    console.log('[v0] PR created successfully! PR #' + prNumber);
    console.log('[v0] PR URL:', prResponse.html_url);

    // Wait a moment for PR to be fully created
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Merge the PR
    console.log('[v0] Merging PR #' + prNumber);

    const mergeBody = {
      commit_title: 'feat: Add session persistence for Optimizer and Transcript features',
      commit_message: 'Implement session persistence system for optimizer and transcript features with multi-language support',
      merge_method: 'squash',
    };

    const mergeResponse = await makeGitHubRequest(
      'PUT',
      `/repos/${OWNER}/${REPO}/pulls/${prNumber}/merge`,
      mergeBody
    );

    if (mergeResponse.merged) {
      console.log('[v0] PR #' + prNumber + ' merged successfully!');
      console.log('[v0] Merge commit SHA:', mergeResponse.sha);
      console.log('[v0] All changes have been merged into', BASE_BRANCH);
    } else {
      console.error('[v0] PR merge failed');
      console.error('[v0] Response:', mergeResponse);
      process.exit(1);
    }

  } catch (error) {
    console.error('[v0] Error:', error.message);
    process.exit(1);
  }
}

createAndMergePR();
