---
name: ci-monitor
description: 智能 CI 构建监控 - 根据历史构建时间动态调整检查间隔。Monitor CI builds with adaptive check intervals based on historical build times.
---

## Usage

When user asks to monitor CI builds, run the script in this skill directory:

```bash
node index.js [branch]
```

**Parameters:**
- `branch` (optional): Branch to monitor, defaults to `main`

**Check interval strategy:**
- 0-25% progress: check every 60 seconds
- 25-75% progress: check every 30 seconds
- 75-100% progress: check every 15 seconds
- Over 100%: check every 5 seconds

## Examples

- "Monitor CI build" → `node index.js main`
- "Check CI status for main branch" → `node index.js main`
- "Watch the build on feature-x" → `node index.js feature-x`

## Implementation

See `index.js` for the full implementation. It uses `gh run list` to:
1. Calculate average build time from history
2. Poll current build status with adaptive intervals
3. Report completion or failure with error details
