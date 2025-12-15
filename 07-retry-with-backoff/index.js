/**
 * Retry with Backoff Implementation
 *
 * Retries a failing async operation with configurable backoff strategy.
 *
 * @param {Function} fn - Async function to retry
 * @param {Object} [options] - Retry options
 * @param {number} [options.maxRetries=3] - Maximum retry attempts
 * @param {number} [options.initialDelay=1000] - Initial delay in ms
 * @param {number} [options.maxDelay=30000] - Maximum delay cap in ms
 * @param {string} [options.backoff='exponential'] - Backoff strategy
 * @param {boolean} [options.jitter=false] - Add randomness to delay
 * @param {Function} [options.retryIf] - Function to decide if should retry
 * @param {Function} [options.onRetry] - Called before each retry
 * @returns {Promise} Result of fn or throws last error
 */
async function retry(fn, options = {}) {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 30000,
    backoff = "exponential",
    jitter = false,
    retryIf = () => true,
    onRetry = () => {},
  } = options;

  for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (!retryIf(error) || attempt === maxRetries + 1) throw error;

      onRetry(error, attempt);

      let delay = calculateDelay(backoff, attempt, initialDelay);
      delay = Math.min(delay, maxDelay);
      if (jitter) delay = applyJitter(delay);

      await sleep(delay);
    }
  }
}

/**
 * Calculate delay based on backoff strategy
 *
 * @param {string} strategy - 'fixed', 'linear', or 'exponential'
 * @param {number} attempt - Current attempt number (1-based)
 * @param {number} initialDelay - Base delay in ms
 * @returns {number} Calculated delay in ms
 */
function calculateDelay(strategy, attempt, initialDelay) {
  switch (strategy) {
    case "fixed":
      return initialDelay;
    case "linear":
      return initialDelay * attempt;
    case "exponential":
      return initialDelay * Math.pow(2, attempt - 1);
    default:
      throw new Error(`Unknown backoff strategy: ${strategy}`);
  }
}

/**
 * Apply jitter to delay
 *
 * @param {number} delay - Base delay in ms
 * @returns {number} Delay with random jitter (0-25% added)
 */
function applyJitter(delay) {
  return delay * (1 + Math.random() * 0.25);
}

/**
 * Helper: Sleep for specified milliseconds
 *
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise} Resolves after delay
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

module.exports = { retry, calculateDelay, applyJitter, sleep };
