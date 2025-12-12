/**
 * Debounce Implementation
 *
 * Creates a debounced function that delays invoking `fn` until after `delay`
 * milliseconds have elapsed since the last time the debounced function was called.
 *
 * @param {Function} fn - The function to debounce
 * @param {number} delay - The delay in milliseconds
 * @returns {Function} The debounced function with a cancel() method
 */
function debounce(fn, delay) {
  let timerId;

  function wrapper(...args) {
    clearTimeout(timerId);
    timerId = setTimeout(() => fn.apply(this, args), delay);
  }

  wrapper.cancel = function () {
    clearTimeout(timerId);
  };

  return wrapper;
}

/**
 * Throttle Implementation
 *
 * Creates a throttled function that only invokes `fn` at most once per
 * every `limit` milliseconds.
 *
 * @param {Function} fn - The function to throttle
 * @param {number} limit - The time limit in milliseconds
 * @returns {Function} The throttled function with a cancel() method
 */
function throttle(fn, limit) {
  let isThrottled = false;
  let lastThis = null;
  let lastArgs = null;
  let timerId;

  function wrapper(...args) {
    lastThis = this;
    lastArgs = args;

    if (isThrottled) return;

    fn.apply(lastThis, lastArgs);
    lastThis = lastArgs = null;
    isThrottled = true;

    timerId = setTimeout(() => {
      isThrottled = false;
      if (lastThis !== null) wrapper.apply(lastThis, lastArgs);
    }, limit);
  }

  wrapper.cancel = function () {
    clearTimeout(timerId);
    lastThis = lastArgs = null;
    isThrottled = false;
  };

  return wrapper;
}

module.exports = { debounce, throttle };
