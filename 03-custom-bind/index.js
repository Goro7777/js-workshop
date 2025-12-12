/**
 * Custom Bind Implementation
 *
 * Creates a new function that, when called, has its `this` keyword set to
 * the provided context, with a given sequence of arguments preceding any
 * provided when the new function is called.
 *
 * @param {Function} fn - The function to bind
 * @param {*} context - The value to bind as `this`
 * @param {...*} boundArgs - Arguments to prepend to the bound function
 * @returns {Function} A new bound function
 */
function customBind(fn, context, ...boundArgs) {
  if (typeof fn !== "function")
    throw new TypeError("First argument must be a function.");

  function wrapper(...runtimeArgs) {
    const args = [...boundArgs, ...runtimeArgs];

    // Handle constructor calls
    if (this instanceof wrapper) return fn.apply(this, args);

    return fn.apply(context, args);
  }

  if (fn.prototype !== undefined)
    wrapper.prototype = Object.create(fn.prototype);

  return wrapper;
}

/**
 * BONUS: Prototype Method Implementation
 *
 * Add customBind to Function.prototype so it can be called as:
 * myFunction.customBind(context, ...args)
 */
Function.prototype.customBind = function (context, ...boundArgs) {
  return customBind(this, context, ...boundArgs);
};

module.exports = { customBind };
