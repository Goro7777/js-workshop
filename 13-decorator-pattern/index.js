/**
 * Decorator Pattern Implementation
 */

/**
 * Logging Decorator
 *
 * Wraps a function to log its calls and return values.
 *
 * @param {Function} fn - Function to decorate
 * @returns {Function} Decorated function
 */
function withLogging(fn) {
  return function (...args) {
    console.log(`${fn.name}(${args.join(", ")})`);
    const result = fn.apply(this, args);
    console.log(`Result: ${result}`);
    return result;
  };
}

/**
 * Timing Decorator
 *
 * Wraps a function to measure and log execution time.
 *
 * @param {Function} fn - Function to decorate
 * @returns {Function} Decorated function
 */
function withTiming(fn) {
  return function (...args) {
    const startTime = Date.now();
    const result = fn.apply(this, args);
    const duration = Date.now() - startTime;
    console.log(`Duration: ${duration} ms`);
    return result;
  };
}

/**
 * Retry Decorator
 *
 * Wraps a function to retry on failure.
 *
 * @param {Function} fn - Function to decorate
 * @param {number} maxRetries - Maximum retry attempts
 * @returns {Function} Decorated function
 */
function withRetry(fn, maxRetries = 3) {
  return function (...args) {
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return fn.apply(this, args);
      } catch (err) {
        if (attempt === maxRetries) throw err;
      }
    }
  };
}

/**
 * Memoize Decorator
 *
 * Wraps a function to cache results based on arguments.
 *
 * @param {Function} fn - Function to decorate
 * @returns {Function} Decorated function with cache
 */
function withMemoize(fn) {
  const cache = new Map();

  return function (...args) {
    const key = JSON.stringify(args);

    if (!cache.has(key)) {
      const value = fn.apply(this, args);
      cache.set(key, value);
    }

    return cache.get(key);
  };
}

/**
 * Validation Decorator
 *
 * Wraps a function to validate arguments before calling.
 *
 * @param {Function} fn - Function to decorate
 * @param {Function} validator - Validation function (returns boolean)
 * @returns {Function} Decorated function
 */
function withValidation(fn, validator) {
  return function (...args) {
    if (!validator(...args)) throw new Error("Validation failure.");

    return fn.apply(this, args);
  };
}

/**
 * Cache Object Method Decorator
 *
 * Decorates an object method to cache its results.
 *
 * @param {Object} obj - Object containing the method
 * @param {string} methodName - Name of method to cache
 * @returns {Object} Object with cached method
 */
function withCache(obj, methodName) {
  const method = obj[methodName];
  const cache = new Map();

  obj[methodName] = function (...args) {
    const key = JSON.stringify(args);
    if (!cache.has(key)) {
      const value = method.apply(this, args);
      cache.set(key, value);
    }
    return cache.get(key);
  };

  return obj;
}

/**
 * Compose Decorators
 *
 * Composes multiple decorators into one.
 * Decorators are applied right-to-left.
 *
 * @param {...Function} decorators - Decorator functions
 * @returns {Function} Composed decorator
 */
function compose(...decorators) {
  return function (fn) {
    return decorators.reduceRight((acc, decorator) => decorator(acc), fn);
  };
}

/**
 * Pipe Decorators
 *
 * Like compose but applies left-to-right.
 *
 * @param {...Function} decorators - Decorator functions
 * @returns {Function} Piped decorator
 */
function pipe(...decorators) {
  return function (fn) {
    return decorators.reduce((acc, decorator) => decorator(acc), fn);
  };
}

// Storage for logs (used in tests)
const logs = [];

function log(message) {
  logs.push(message);
  // console.log(message); // Uncomment for debugging
}

function clearLogs() {
  logs.length = 0;
}

function getLogs() {
  return [...logs];
}

module.exports = {
  withLogging,
  withTiming,
  withRetry,
  withMemoize,
  withValidation,
  withCache,
  compose,
  pipe,
  log,
  clearLogs,
  getLogs,
};
