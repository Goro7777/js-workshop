/**
 * Memoization Implementation
 *
 * Creates a memoized version of a function that caches results based on arguments.
 *
 * @param {Function} fn - The function to memoize
 * @param {Object} [options] - Optional configuration
 * @param {number} [options.maxSize] - Maximum number of cached entries
 * @param {number} [options.ttl] - Time-to-live for cache entries in milliseconds
 * @param {Function} [options.keyGenerator] - Custom function to generate cache keys
 * @returns {Function} Memoized function with cache control methods
 */
function memoize(fn, options = {}) {
  const cache = new Map();
  const {
    maxSize,
    ttl,
    keyGenerator = (args) => JSON.stringify(args),
  } = options;

  const deleteFromCache = (key) => {
    const { timerId } = cache.get(key) || {};
    clearTimeout(timerId);
    cache.delete(key);
  };

  const addToCache = (key, val) => {
    let timerId;
    if (ttl) timerId = setTimeout(() => deleteFromCache(key), ttl);
    cache.set(key, { val, timerId });
  };

  function wrapper(...args) {
    const key = keyGenerator(args);

    if (!cache.has(key)) {
      if (maxSize && cache.size === maxSize) {
        const oldestKey = cache.keys().next().value;
        deleteFromCache(oldestKey);
      }

      const val = fn.apply(this, args);
      addToCache(key, val);
    }

    return cache.get(key).val;
  }

  wrapper.cache = {
    clear: () => {
      const keys = [...cache.keys()];
      for (const key of keys) deleteFromCache(key);
    },
    delete: (key) => deleteFromCache(key),
    has: (key) => cache.has(key),
    get size() {
      return cache.size;
    },
  };

  return wrapper;
}

module.exports = { memoize };
