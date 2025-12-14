/**
 * Proxy Pattern Implementation
 */

/**
 * Create a validating proxy
 *
 * @param {Object} target - Target object
 * @param {Object} validators - Map of property name to validator function
 * @returns {Proxy} Proxy that validates on set
 */
function createValidatingProxy(target, validators) {
  return new Proxy(target, {
    set(obj, prop, value) {
      if (validators[prop] && !validators[prop](value))
        throw new Error(`Invalid value for ${prop}: ${JSON.stringify(value)}`);

      obj[prop] = value;
      return true;
    },

    get(obj, prop) {
      return obj[prop];
    },
  });
}

/**
 * Create a logging proxy
 *
 * @param {Object} target - Target object
 * @param {Function} logger - Logging function (action, prop, value) => void
 * @returns {Proxy} Proxy that logs all operations
 */
function createLoggingProxy(target, logger) {
  return new Proxy(target, {
    get(obj, prop) {
      logger("get", prop, obj[prop]);
      return obj[prop];
    },

    set(obj, prop, value) {
      logger("set", prop, value);
      obj[prop] = value;
      return true;
    },

    deleteProperty(obj, prop) {
      logger("delete", prop, obj[prop]);
      delete obj[prop];
      return true;
    },

    has(obj, prop) {
      logger("has", prop, obj[prop]);
      return obj.hasOwnProperty(prop);
    },
  });
}

/**
 * Create a caching proxy for methods
 *
 * @param {Object} target - Target object with methods
 * @param {string[]} methodNames - Names of methods to cache
 * @returns {Proxy} Proxy that caches method results
 */
function createCachingProxy(target, methodNames) {
  const methodCache = new Map();
  const methodNamesSet = new Set(methodNames);

  return new Proxy(target, {
    get(obj, prop) {
      if (!methodNamesSet.has(prop) || typeof obj[prop] !== "function")
        return obj[prop];

      if (!methodCache.has(prop)) {
        const callsCache = new Map();

        function wrapper(...args) {
          const key = JSON.stringify(args);
          if (!callsCache.has(key)) {
            const value = obj[prop](...args);
            callsCache.set(key, value);
          }
          return callsCache.get(key);
        }

        methodCache.set(prop, wrapper);
      }

      return methodCache.get(prop);
    },
  });
}

/**
 * Create an access control proxy
 *
 * @param {Object} target - Target object
 * @param {Object} permissions - Access permissions
 * @param {string[]} permissions.readable - Properties that can be read
 * @param {string[]} permissions.writable - Properties that can be written
 * @returns {Proxy} Proxy that enforces access control
 */
function createAccessProxy(target, permissions) {
  const { readable = [], writable = [] } = permissions;
  const readableSet = new Set(readable);
  const writableSet = new Set(writable);

  return new Proxy(target, {
    get(obj, prop) {
      if (!readableSet.has(prop))
        throw new Error(`Access denied: Cannot read property '${prop}'`);

      return obj[prop];
    },

    set(obj, prop, value) {
      if (!writableSet.has(prop))
        throw new Error(`Access denied: Cannot write to property '${prop}`);

      obj[prop] = value;
      return true;
    },

    deleteProperty(obj, prop) {
      if (!writableSet.has(prop))
        throw new Error(`Access denied: Cannot delete property '${prop}`);

      delete obj[prop];
      return true;
    },
  });
}

/**
 * Create a lazy loading proxy
 *
 * @param {Function} loader - Function that returns the real object
 * @returns {Proxy} Proxy that loads object on first access
 */
function createLazyProxy(loader) {
  let instance = null;
  let loaded = false;

  return new Proxy(
    {},
    {
      get(obj, prop) {
        if (!loaded) {
          instance = loader();
          loaded = true;
        }
        return instance[prop];
      },

      set(obj, prop, value) {
        if (!loaded) {
          instance = loader();
          loaded = true;
        }

        instance[prop] = value;
        return true;
      },
    }
  );
}

/**
 * Create an observable proxy
 *
 * @param {Object} target - Target object
 * @param {Function} onChange - Callback when property changes
 * @returns {Proxy} Proxy that notifies on changes
 */
function createObservableProxy(target, onChange) {
  return new Proxy(target, {
    set(obj, prop, value) {
      const oldValue = obj[prop];
      if (value !== oldValue) onChange(prop, value, oldValue);

      obj[prop] = value;
      return true;
    },

    deleteProperty(obj, prop) {
      if (obj.hasOwnProperty(prop)) {
        const oldValue = obj[prop];
        onChange(prop, undefined, oldValue);
      }

      delete obj[prop];
      return true;
    },
  });
}

module.exports = {
  createValidatingProxy,
  createLoggingProxy,
  createCachingProxy,
  createAccessProxy,
  createLazyProxy,
  createObservableProxy,
};
