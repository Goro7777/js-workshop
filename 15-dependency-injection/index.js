/**
 * Dependency Injection Container Implementation
 */
class Container {
  constructor() {
    this.registry = new Map();
  }

  /**
   * Register a class with the container
   * @param {string} name - Service name
   * @param {Function} Class - Constructor function
   * @param {string[]} [dependencies=[]] - Names of dependencies
   * @param {Object} [options={}] - Registration options
   * @param {boolean} [options.singleton=false] - Whether to create singleton
   */
  register(name, Class, dependencies = [], options = {}) {
    const { singleton = false } = options;
    this.registry.set(name, {
      type: "class",
      Class,
      dependencies,
      singleton,
      instance: null,
    });
  }

  /**
   * Register an existing instance
   * @param {string} name - Service name
   * @param {*} instance - Instance to register
   */
  registerInstance(name, instance) {
    this.registry.set(name, { type: "instance", instance });
  }

  /**
   * Register a factory function
   * @param {string} name - Service name
   * @param {Function} factory - Factory function
   * @param {string[]} [dependencies=[]] - Names of dependencies
   * @param {Object} [options={}] - Registration options
   */
  registerFactory(name, factory, dependencies = [], options = {}) {
    const { singleton = false } = options;
    this.registry.set(name, {
      type: "factory",
      factory,
      dependencies,
      singleton,
      instance: null,
    });
  }

  /**
   * Resolve a service by name
   * @param {string} name - Service name
   * @param {Set} [resolutionStack] - Stack for circular dependency detection
   * @returns {*} The resolved instance
   */
  resolve(name, resolutionStack = new Set()) {
    if (!this.has(name)) throw new Error(`Service not found: ${name}`);

    if (resolutionStack.has(name))
      throw new Error(`Circular dependency detected`);

    const registration = this.registry.get(name);

    if (registration.type === "instance") return registration.instance;

    if (registration.singleton && registration.instance)
      return registration.instance;

    resolutionStack.add(name);

    const deps = [];
    for (const depName of registration.dependencies)
      deps.push(this.resolve(depName, resolutionStack));

    let instance;
    if (registration.type === "class")
      instance = new registration.Class(...deps);
    if (registration.type === "factory")
      instance = registration.factory(...deps);

    resolutionStack.delete(name);

    if (registration.singleton) registration.instance = instance;

    return instance;
  }

  /**
   * Check if a service is registered
   * @param {string} name - Service name
   * @returns {boolean}
   */
  has(name) {
    return this.registry.has(name);
  }

  /**
   * Unregister a service
   * @param {string} name - Service name
   * @returns {boolean} true if was registered
   */
  unregister(name) {
    if (this.registry.has(name)) {
      this.registry.delete(name);
      return true;
    }
    return false;
  }

  /**
   * Clear all registrations
   */
  clear() {
    this.registry.clear();
  }

  /**
   * Get all registered service names
   * @returns {string[]}
   */
  getRegistrations() {
    return Array.from(this.registry.keys());
  }
}

/**
 * Create a child container that inherits from parent
 *
 * @param {Container} parent - Parent container
 * @returns {Container} Child container
 */
function createChildContainer(parent) {
  const child = new Container();
  const originalResolve = child.resolve.bind(child);
  child.resolve = function (name, resolutionStack = new Set()) {
    if (child.has(name)) return originalResolve(name, resolutionStack);
    else return parent.resolve(name, resolutionStack);
  };
  return child;
}

// Example classes for testing
class Logger {
  constructor() {
    this.logs = [];
  }

  log(message) {
    this.logs.push(message);
  }

  getLogs() {
    return [...this.logs];
  }
}

class Database {
  constructor(logger) {
    this.logger = logger;
    this.connected = false;
  }

  connect() {
    this.logger.log("Database connected");
    this.connected = true;
  }

  query(sql) {
    this.logger.log(`Query: ${sql}`);
    return [];
  }
}

class UserRepository {
  constructor(database, logger) {
    this.database = database;
    this.logger = logger;
  }

  findById(id) {
    this.logger.log(`Finding user ${id}`);
    return this.database.query(`SELECT * FROM users WHERE id = ${id}`);
  }
}

class UserService {
  constructor(userRepository, logger) {
    this.userRepository = userRepository;
    this.logger = logger;
  }

  getUser(id) {
    this.logger.log(`Getting user ${id}`);
    return this.userRepository.findById(id);
  }
}

module.exports = {
  Container,
  createChildContainer,
  Logger,
  Database,
  UserRepository,
  UserService,
};
