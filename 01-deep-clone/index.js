/**
 * Deep Clone Implementation
 *
 * Create a deep copy of any JavaScript value, including nested objects,
 * arrays, and special types like Date, RegExp, Map, and Set.
 *
 * @param {*} value - The value to clone
 * @param {WeakMap} [visited] - WeakMap to track circular references (used internally)
 * @returns {*} A deep clone of the input value
 */
function deepClone(value, visited = new WeakMap()) {
  // Primitives
  if (typeof value !== "object" || value === null) return value;

  // Circular references
  if (visited.has(value)) return visited.get(value);

  if (value instanceof Date) return new Date(value);
  if (value instanceof RegExp) return new RegExp(value);

  if (value instanceof Map) {
    const copy = new Map();
    visited.set(value, copy);
    for (const [key, elem] of value) {
      copy.set(deepClone(key, visited), deepClone(elem, visited));
    }
    return copy;
  }

  if (value instanceof Set) {
    const copy = new Set();
    visited.set(value, copy);
    for (const elem of value) {
      copy.add(deepClone(elem, visited));
    }
    return copy;
  }

  if (Array.isArray(value)) {
    const copy = [];
    visited.set(value, copy);
    for (const elem of value) {
      copy.push(deepClone(elem, visited));
    }
    return copy;
  }

  // Plain object
  const copy = Object.create(Object.getPrototypeOf(value));
  visited.set(value, copy);
  for (const [key, elem] of Object.entries(value)) {
    copy[key] = deepClone(elem, visited);
  }
  return copy;
}

module.exports = { deepClone };
