/**
 * Singleton Pattern Implementation
 */

/**
 * Basic Singleton Class
 *
 * A class that only allows one instance to exist.
 */
class Singleton {
  static #instance = null;

  static getInstance() {
    if (!Singleton.#instance) Singleton.#instance = new Singleton();
    return Singleton.#instance;
  }

  constructor() {
    if (Singleton.#instance) {
      throw new Error("Use Singleton.getInstance()");
    }
  }

  static resetInstance() {
    Singleton.#instance = null;
  }
}

/**
 * Singleton Factory
 *
 * Converts any class into a singleton.
 *
 * @param {Function} Class - The class to make singleton
 * @returns {Object} Object with getInstance method
 */
function createSingleton(Class) {
  let instance = null;

  return {
    getInstance: (...args) => {
      if (!instance) instance = new Class(...args);
      return instance;
    },
    resetInstance: () => {
      instance = null;
    },
  };
}

/**
 * Example: Database Connection Singleton
 *
 * A practical example of a singleton for database connections.
 */
class DatabaseConnection {
  constructor(connectionString) {
    this.connectionString = connectionString;
    this.connected = false;
  }

  connect() {
    if (!this.connected) {
      // Simulate connection
      this.connected = true;
      console.log(`Connected to ${this.connectionString}`);
    }
    return this;
  }

  query(sql) {
    if (!this.connected) {
      throw new Error("Not connected");
    }
    return `Executing: ${sql}`;
  }

  disconnect() {
    this.connected = false;
  }
}

/**
 * Example: Configuration Singleton
 *
 * A practical example of a singleton for app configuration.
 */
class AppConfig {
  constructor() {
    this.settings = {};
  }

  set(key, value) {
    this.settings[key] = value;
    return this;
  }

  get(key) {
    return this.settings[key];
  }

  getAll() {
    return { ...this.settings };
  }
}

module.exports = {
  Singleton,
  createSingleton,
  DatabaseConnection,
  AppConfig,
};
