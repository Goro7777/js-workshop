/**
 * State Machine Implementation
 */
class StateMachine {
  /**
   * Create a state machine
   * @param {Object} config - Machine configuration
   * @param {string} config.initial - Initial state
   * @param {Object} config.states - State definitions
   * @param {Object} [config.context] - Initial context data
   */
  constructor(config) {
    if (!config.initial || !config.states)
      throw new Error(
        "State machine config must include 'initial' and 'states'"
      );

    this.config = config;
    this.currentState = config.initial;
    this.context = config.context || {};

    if (!config.states[config.initial])
      throw new Error(`Initial state '${config.initial}' not found in states`);
  }

  /**
   * Get current state
   * @returns {string}
   */
  get state() {
    return this.currentState;
  }

  /**
   * Attempt a state transition
   * @param {string} event - Event name
   * @param {Object} [payload] - Optional data for the transition
   * @returns {boolean} Whether transition was successful
   */
  transition(event, payload) {
    const currentStateConfig = this.config.states[this.currentState];

    if (!currentStateConfig.on?.[event]) return false;

    const transitionConfig = currentStateConfig.on[event];

    let target, guard, action;
    if (typeof transitionConfig === "string") {
      target = transitionConfig;
    } else {
      target = transitionConfig.target;
      guard = transitionConfig.guard;
      action = transitionConfig.action;
    }

    if (guard && !guard(this.context)) return false;

    this.currentState = target;

    if (action) action(this.context);

    return true;
  }

  /**
   * Check if a transition is possible
   * @param {string} event - Event name
   * @returns {boolean}
   */
  can(event) {
    const transitionConfig = this.config.states[this.currentState]?.on[event];
    if (!transitionConfig) return false;

    if (
      typeof transitionConfig === "object" &&
      transitionConfig.guard &&
      !transitionConfig(guard(this.context))
    )
      return false;

    return true;
  }

  /**
   * Get available transitions from current state
   * @returns {string[]} Array of event names
   */
  getAvailableTransitions() {
    return Object.keys(this.config.states[this.currentState].on || {});
  }

  /**
   * Get the context data
   * @returns {Object}
   */
  getContext() {
    return this.context;
  }

  /**
   * Update context data
   * @param {Object|Function} updater - New context or updater function
   */
  updateContext(updater) {
    if (typeof updater === "function") this.context = updater(this.context);
    if (typeof updater === "object" && updater !== null)
      this.context = { ...this.context, ...updater };
  }

  /**
   * Check if machine is in a final state (no transitions out)
   * @returns {boolean}
   */
  isFinal() {
    return this.getAvailableTransitions().length === 0;
  }

  /**
   * Reset machine to initial state
   * @param {Object} [newContext] - Optional new context
   */
  reset(newContext) {
    this.currentState = this.config.initial;
    if (newContext) this.updateContext(newContext);
  }
}

/**
 * Create a state machine factory
 *
 * @param {Object} config - Machine configuration
 * @returns {Function} Factory function that creates machines
 */
function createMachine(config) {
  return () => new StateMachine(config);
}

module.exports = { StateMachine, createMachine };
