/**
 * Observable Implementation
 *
 * A simple Observable for reactive data streams.
 */
class Observable {
  /**
   * Create an Observable
   * @param {Function} subscribeFn - Function called with subscriber on subscribe
   */
  constructor(subscribeFn) {
    this._subscribeFn = subscribeFn;
  }

  /**
   * Subscribe to the Observable
   * @param {Object|Function} observer - Observer object or next callback
   * @returns {Object} Subscription with unsubscribe method
   */
  subscribe(observer) {
    if (typeof observer === "function") observer = { next: observer };

    let isActive = true;
    const subscriber = {
      next(value) {
        if (!isActive) return;

        observer.next(value);
      },
      error(err) {
        if (!isActive) return;

        isActive = false;
        if (typeof observer.error === "function") observer.error(err);
      },
      complete() {
        if (!isActive) return;

        isActive = false;
        if (typeof observer.complete === "function") observer.complete();
      },
    };

    const cleanupFn = this._subscribeFn(subscriber);

    return {
      unsubscribe: () => {
        if (typeof cleanupFn === "function") cleanupFn();
        isActive = false;
      },
    };
  }

  /**
   * Transform each emitted value
   * @param {Function} fn - Transform function
   * @returns {Observable} New Observable with transformed values
   */
  map(fn) {
    const source = this;
    return new Observable((subscriber) => {
      const sourceSubscription = source.subscribe({
        next(value) {
          subscriber.next(fn(value));
        },
        error(err) {
          subscriber.error(err);
        },
        complete() {
          subscriber.complete();
        },
      });

      return () => sourceSubscription.unsubscribe();
    });
  }

  /**
   * Filter emitted values
   * @param {Function} predicate - Filter function
   * @returns {Observable} New Observable with filtered values
   */
  filter(predicate) {
    const source = this;
    return new Observable((subscriber) => {
      const sourceSubscription = source.subscribe({
        next(value) {
          if (predicate(value)) subscriber.next(value);
        },
        error(err) {
          subscriber.error(err);
        },
        complete() {
          subscriber.complete();
        },
      });

      return () => sourceSubscription.unsubscribe();
    });
  }

  /**
   * Take only first n values
   * @param {number} count - Number of values to take
   * @returns {Observable} New Observable limited to count values
   */
  take(count) {
    const source = this;
    let emittedCount = 0;
    return new Observable((subscriber) => {
      const sourceSubscription = source.subscribe({
        next(value) {
          if (emittedCount === count) {
            this.complete();
          } else {
            emittedCount++;
            subscriber.next(value);
          }
        },
        error(err) {
          subscriber.error(err);
        },
        complete() {
          subscriber.complete();
        },
      });

      return () => sourceSubscription.unsubscribe();
    });
  }

  /**
   * Skip first n values
   * @param {number} count - Number of values to skip
   * @returns {Observable} New Observable that skips first count values
   */
  skip(count) {
    const source = this;
    let skippedCount = 0;
    return new Observable((subscriber) => {
      const sourceSubscription = source.subscribe({
        next(value) {
          if (skippedCount === count) {
            subscriber.next(value);
          } else {
            skippedCount++;
          }
        },
        error(err) {
          subscriber.error(err);
        },
        complete() {
          subscriber.complete();
        },
      });

      return () => sourceSubscription.unsubscribe();
    });
  }

  /**
   * Create Observable from array
   * @param {Array} array - Array of values
   * @returns {Observable} Observable that emits array values
   */
  static from(array) {
    return new Observable((subscriber) => {
      array.forEach((value) => subscriber.next(value));
      subscriber.complete();
    });
  }

  /**
   * Create Observable from single value
   * @param {*} value - Value to emit
   * @returns {Observable} Observable that emits single value
   */
  static of(...values) {
    return Observable.from(values);
  }
}

module.exports = { Observable };
