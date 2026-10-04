const { supportedCityNames } = require('../config/cities');

let lastSyncTimestamp = null;
let lastSyncStatus = 'Initialized';
let syncIntervalMinutes = parseInt(process.env.DATA_COLLECTION_INTERVAL, 10) || 30;
let isCollectorRunning = false;
let timerId = null;

/**
 * Perform single telemetry sync cycle for all supported cities
 */
async function performCollectionCycle(fetchFn) {
  console.log(`[DataCollector] 🔄 Running scheduled telemetry sync for ${supportedCityNames.length} cities...`);
  let successCount = 0;
  let failCount = 0;

  for (const city of supportedCityNames) {
    try {
      if (typeof fetchFn === 'function') {
        await fetchFn(city);
        successCount++;
      }
    } catch (err) {
      console.warn(`[DataCollector] Sync warning for ${city}:`, err.message);
      failCount++;
    }
  }

  lastSyncTimestamp = new Date();
  lastSyncStatus = failCount === 0 
    ? `Successful (${successCount}/${supportedCityNames.length} cities synchronized)`
    : `Partial (${successCount} succeeded, ${failCount} failed)`;

  console.log(`[DataCollector] ✅ Sync completed at ${lastSyncTimestamp.toLocaleTimeString()}: ${lastSyncStatus}`);
}

/**
 * Start periodic data collection scheduler
 */
function startDataCollector(fetchFn) {
  if (isCollectorRunning) return;
  isCollectorRunning = true;

  console.log(`[DataCollector] ⏱️ Scheduler started with interval: ${syncIntervalMinutes} minutes (configured via DATA_COLLECTION_INTERVAL).`);

  // Initial trigger after short delay (5 seconds after boot)
  setTimeout(() => {
    performCollectionCycle(fetchFn);
  }, 5000);

  // Periodic interval
  const intervalMs = syncIntervalMinutes * 60 * 1000;
  timerId = setInterval(() => {
    performCollectionCycle(fetchFn);
  }, intervalMs);
}

/**
 * Get collector health metadata
 */
function getDataCollectorStatus() {
  return {
    isActive: isCollectorRunning,
    intervalMinutes: syncIntervalMinutes,
    lastSync: lastSyncTimestamp ? lastSyncTimestamp.toISOString() : null,
    lastSyncHuman: lastSyncTimestamp ? lastSyncTimestamp.toLocaleTimeString() : 'Pending initial cycle',
    status: lastSyncStatus
  };
}

module.exports = {
  startDataCollector,
  performCollectionCycle,
  getDataCollectorStatus
};
