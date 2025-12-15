/**
 * Promise.all Implementation
 *
 * Returns a promise that resolves when all promises resolve,
 * or rejects when any promise rejects.
 *
 * @param {Iterable} promises - An iterable of promises (or values)
 * @returns {Promise} A promise that resolves to an array of results
 */
function promiseAll(promises) {
  const promiseArray = Array.from(promises);

  if (promiseArray.length === 0) return Promise.resolve([]);

  return new Promise((resolve, reject) => {
    const results = new Array(promiseArray.length);
    let completed = 0;

    promiseArray.forEach((item, index) =>
      Promise.resolve(item)
        .then((result) => {
          results[index] = result;
          completed++;
          if (completed === results.length) resolve(results);
        })
        .catch(reject)
    );
  });
}

/**
 * Promise.race Implementation
 *
 * Returns a promise that settles with the first promise to settle.
 *
 * @param {Iterable} promises - An iterable of promises (or values)
 * @returns {Promise} A promise that settles with the first result
 */
function promiseRace(promises) {
  const promiseArray = Array.from(promises);

  if (promiseArray.length === 0) return new Promise(() => {});

  return new Promise((resolve, reject) =>
    promiseArray.forEach((item) =>
      Promise.resolve(item).then(resolve).catch(reject)
    )
  );
}

/**
 * Promise.allSettled Implementation
 *
 * Returns a promise that resolves when all promises have settled.
 * Never rejects.
 *
 * @param {Iterable} promises - An iterable of promises (or values)
 * @returns {Promise} A promise that resolves to an array of settlement objects
 */
function promiseAllSettled(promises) {
  const promiseArray = Array.from(promises);

  if (promiseArray.length === 0) return Promise.resolve([]);

  return new Promise((resolve, reject) => {
    const results = new Array(promiseArray.length);
    let completed = 0;

    const handleSettle = (result, index) => {
      results[index] = result;
      completed++;

      if (completed === results.length) resolve(results);
    };

    promiseArray.forEach((item, index) => {
      Promise.resolve(item)
        .then((value) => handleSettle({ status: "fulfilled", value }, index))
        .catch((reason) => handleSettle({ status: "rejected", reason }, index));
    });
  });
}

/**
 * Promise.any Implementation
 *
 * Returns a promise that resolves with the first fulfilled promise,
 * or rejects with an AggregateError if all reject.
 *
 * @param {Iterable} promises - An iterable of promises (or values)
 * @returns {Promise} A promise that resolves with the first fulfilled value
 */
function promiseAny(promises) {
  const promiseArray = Array.from(promises);

  if (promiseArray.length === 0)
    return Promise.reject(new AggregateError([], "No promises"));

  return new Promise((resolve, reject) => {
    const errors = new Array(promiseArray.length);
    let rejectedCount = 0;

    promiseArray.forEach((item, index) =>
      Promise.resolve(item)
        .then(resolve)
        .catch((error) => {
          errors[index] = error;
          rejectedCount++;
          if (rejectedCount === errors.length)
            reject(new AggregateError(errors, "All promises were rejected"));
        })
    );
  });
}

module.exports = { promiseAll, promiseRace, promiseAllSettled, promiseAny };
