/**
 * Async Queue Implementation
 *
 * A queue that processes async tasks with concurrency control.
 */
class AsyncQueue {
  /**
   * Create an async queue
   * @param {Object} options - Queue options
   * @param {number} [options.concurrency=1] - Maximum concurrent tasks
   * @param {boolean} [options.autoStart=true] - Start processing immediately
   */
  constructor(options = {}) {
    this.concurrency = options.concurrency || 1;
    this.autoStart = options.autoStart !== false;
    this.queue = []; // Pending tasks
    this.running = 0; // Currently running count
    this.paused = false; // Paused state
    this.emptyCallbacks = []; // Callbacks for empty event
  }

  /**
   * Add a task to the queue
   * @param {Function} task - Async function to execute
   * @param {Object} [options] - Task options
   * @param {number} [options.priority=0] - Task priority (higher = sooner)
   * @returns {Promise} Resolves when task completes
   */
  add(task, options = {}) {
    let resolve, reject;
    const promise = new Promise((res, rej) => {
      resolve = res;
      reject = rej;
    })
      .catch((error) => {
        if (!(error instanceof QueueClearError)) throw error;
      })
      .finally(() => {
        this.running--;
        this._checkEmpty();
        this._process();
      });

    const { priority } = options;
    this._insertWithPriority({ task, priority, resolve, reject });

    if (this.autoStart) this._process();

    return promise;
  }

  /**
   * Start processing the queue
   */
  start() {
    this.paused = false;
    this._process();
  }

  /**
   * Pause the queue (running tasks will complete)
   */
  pause() {
    this.paused = true;
  }

  /**
   * Clear all pending tasks
   */
  clear() {
    this.queue.forEach(({ reject }) => reject(new QueueClearError()));
    this.queue = [];
  }

  /**
   * Register callback for when queue becomes empty
   * @param {Function} callback - Called when queue is empty
   */
  onEmpty(callback) {
    this.emptyCallbacks.push(callback);
  }

  /**
   * Number of pending tasks
   * @returns {number}
   */
  get size() {
    return this.queue.length;
  }

  /**
   * Number of currently running tasks
   * @returns {number}
   */
  get pending() {
    return this.running;
  }

  /**
   * Whether queue is paused
   * @returns {boolean}
   */
  get isPaused() {
    return this.paused;
  }

  /**
   * Internal: Process next tasks from queue
   * @private
   */
  _process() {
    if (
      this.running >= this.concurrency ||
      this.paused ||
      this.queue.length === 0
    )
      return;

    const { task, resolve, reject } = this.queue.pop();
    this.running++;
    task().then(resolve).catch(reject);
  }

  /**
   * Internal: Check and trigger empty callbacks
   * @private
   */
  _checkEmpty() {
    if (this.queue.length === 0 && this.running === 0)
      this.emptyCallbacks.forEach((callback) => callback());
  }

  /**
   * Internal: Insert tasks with higher priority at end of queue
   * @private
   */
  _insertWithPriority(entry) {
    this.queue.push(entry);
    let i = this.queue.length - 2;
    while (i >= 0 && this.queue[i].priority >= this.queue[i + 1].priority) {
      [this.queue[i], this.queue[i + 1]] = [this.queue[i + 1], this.queue[i]];
      i--;
    }
  }
}

/**
 * Error thrown when queue is cleared
 * @class QueueClearError
 * @extends Error
 */
class QueueClearError extends Error {
  constructor() {
    super("Clearing the queue");
  }
}

module.exports = { AsyncQueue };
