/**
 * CI Build Monitor Skill
 * 
 * Monitors CI builds with adaptive check intervals based on historical build times.
 * 
 * Usage: Monitor CI build [branch]
 */

// Check interval strategy (in milliseconds)
const CHECK_INTERVALS = {
  EARLY: 60000,    // 0-25%: check every 60 seconds
  MIDDLE: 30000,   // 25-75%: check every 30 seconds
  LATE: 15000,     // 75-100%: check every 15 seconds
  OVERTIME: 5000   // >100%: check every 5 seconds
};

/**
 * Calculate average build time from historical data
 * @param {string} workflow - Workflow name
 * @returns {Promise<number>} Average build time in seconds
 */
async function calculateAverageBuildTime(workflow) {
  // Use gh CLI to get build history
  const { execSync } = require('child_process');
  try {
    const output = execSync(
      `gh run list --workflow "${workflow}" --limit 20 --json conclusion,displayTitle`,
      { encoding: 'utf-8' }
    );
    const runs = JSON.parse(output);
    
    // Filter successful builds and extract elapsed time
    const successfulRuns = runs.filter(r => r.conclusion === 'success');
    if (successfulRuns.length === 0) return 1440; // Default 24 minutes
    
    // Parse elapsed time from displayTitle (format: "title (XXm YYs)")
    const times = successfulRuns.map(run => {
      const match = run.displayTitle.match(/\((\d+)m(\d+)s\)/);
      if (match) {
        return parseInt(match[1]) * 60 + parseInt(match[2]);
      }
      return 1440;
    });
    
    const avg = times.reduce((a, b) => a + b, 0) / times.length;
    console.log(`Average build time: ${Math.round(avg)}s (${Math.round(avg/60)}m)`);
    return avg;
  } catch (error) {
    console.error('Failed to get build history:', error.message);
    return 1440; // Default 24 minutes
  }
}

/**
 * Get current build status
 * @returns {Promise<object>} Build status object
 */
async function getCurrentBuildStatus() {
  const { execSync } = require('child_process');
  try {
    const output = execSync('gh run list --limit 1', { encoding: 'utf-8' });
    const lines = output.trim().split('\n').filter(l => l.trim());
    
    if (lines.length < 2) return null;
    
    // Parse the table format
    const headers = lines[0].split(/\s{2,}/).map(h => h.trim().toLowerCase());
    const values = lines[1].split(/\s{2,}/).map(v => v.trim());
    
    const status = {};
    headers.forEach((h, i) => {
      status[h] = values[i] || '';
    });
    
    return {
      status: status.status || '*',
      title: status.title || '',
      branch: status.branch || '',
      elapsed: status.elapsed || '',
      id: status.id || ''
    };
  } catch (error) {
    console.error('Failed to get build status:', error.message);
    return null;
  }
}

/**
 * Determine check interval based on progress
 * @param {number} elapsedSeconds - Elapsed time in seconds
 * @param {number} averageSeconds - Average build time in seconds
 * @returns {number} Check interval in milliseconds
 */
function getCheckInterval(elapsedSeconds, averageSeconds) {
  const progress = elapsedSeconds / averageSeconds;
  
  if (progress < 0.25) return CHECK_INTERVALS.EARLY;
  if (progress < 0.75) return CHECK_INTERVALS.MIDDLE;
  if (progress < 1.0) return CHECK_INTERVALS.LATE;
  return CHECK_INTERVALS.OVERTIME;
}

/**
 * Parse elapsed time string to seconds
 * @param {string} elapsed - Elapsed time string (e.g., "25m30s")
 * @returns {number} Elapsed time in seconds
 */
function parseElapsedTime(elapsed) {
  const match = elapsed.match(/(\d+)m(\d+)s/);
  if (match) {
    return parseInt(match[1]) * 60 + parseInt(match[2]);
  }
  return 0;
}

/**
 * Main monitoring function
 * @param {object} options - Monitor options
 * @param {string} options.branch - Branch to monitor (default: current)
 * @param {string} options.workflow - Workflow name (default: "Dockerfile Build Check")
 */
async function monitorCI(options = {}) {
  const { branch = 'main', workflow = 'Dockerfile Build Check' } = options;
  
  console.log('🔍 Starting CI Build Monitor...\n');
  
  // Step 1: Calculate average build time
  const avgSeconds = await calculateAverageBuildTime(workflow);
  
  // Step 2: Get current build status
  let lastStatus = await getCurrentBuildStatus();
  if (!lastStatus) {
    console.log('No running build found.');
    return;
  }
  
  console.log(`📊 Monitoring build ${lastStatus.id} on ${lastStatus.branch}`);
  console.log(`⏱️  Expected duration: ~${Math.round(avgSeconds/60)} minutes\n`);
  
  // Step 3: Monitor with adaptive intervals
  let startTime = Date.now();
  
  while (lastStatus && (lastStatus.status === '*' || lastStatus.status === 'in_progress')) {
    const interval = getCheckInterval(parseElapsedTime(lastStatus.elapsed), avgSeconds);
    
    await new Promise(resolve => setTimeout(resolve, interval));
    
    const newStatus = await getCurrentBuildStatus();
    
    if (!newStatus) break;
    
    // Check for status change
    if (newStatus.status !== '*' && newStatus.status !== 'in_progress') {
      const elapsed = parseElapsedTime(newStatus.elapsed);
      const emoji = newStatus.status === '✓' ? '✅' : '❌';
      const statusText = newStatus.status === '✓' ? 'SUCCESS' : 'FAILURE';
      
      console.log(`\n${emoji} Build ${newStatus.status === '✓' ? 'completed' : 'failed'} in ${newStatus.elapsed}`);
      console.log(`   Status: ${statusText}`);
      
      if (newStatus.status === 'X' || newStatus.status === 'failure') {
        console.log('\n💡 To see error details, run:');
        console.log(`   gh run view ${newStatus.id} --log-failed`);
      }
      
      break;
    }
    
    lastStatus = newStatus;
  }
  
  console.log('\n✅ Monitoring complete.');
}

// Export for use as module
module.exports = { monitorCI, getCurrentBuildStatus, calculateAverageBuildTime };

// Run if called directly
if (require.main === module) {
  const args = process.argv.slice(2);
  const branch = args[0] || 'main';
  monitorCI({ branch }).catch(console.error);
}
