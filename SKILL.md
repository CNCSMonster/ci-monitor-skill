---
name: ci-monitor
description: 智能 CI 构建监控 - 根据历史构建时间动态调整检查间隔。Monitor CI builds with adaptive check intervals based on historical build times.
---

## Usage

Monitor the CI build for a branch with adaptive check intervals:
- 0-25% progress: check every 60 seconds
- 25-75% progress: check every 30 seconds
- 75-100% progress: check every 15 seconds
- Over 100%: check every 5 seconds

## Examples

- "Monitor CI build"
- "Check CI status for main branch"
- "Watch the build and report when done"

## Reference

See `index.js` for the implementation details.
