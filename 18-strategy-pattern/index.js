/**
 * Strategy Pattern Implementation
 */

// ============================================
// SORTING STRATEGIES
// ============================================

/**
 * Sort Context
 *
 * Delegates sorting to a strategy.
 */
class SortContext {
  constructor(strategy) {
    this.strategy = strategy;
  }

  setStrategy(strategy) {
    this.strategy = strategy;
  }

  sort(array) {
    return this.strategy.sort([...array]);
  }
}

/**
 * Bubble Sort Strategy
 */
class BubbleSort {
  sort(array) {
    for (let i = 0; i < array.length; i++) {
      for (let j = 0; j < array.length - i - 1; j++) {
        if (array[j] > array[j + 1]) {
          [array[j], array[j + 1]] = [array[j + 1], array[j]];
        }
      }
    }
    return array;
  }
}

/**
 * Quick Sort Strategy
 */
class QuickSort {
  sort(array) {
    this._quickSort3(array);
    return array;
  }

  _quickSort3(array, l = 0, r = array.length - 1) {
    if (l >= r) return;

    let randInd = this._getRandInt(l, r);
    [array[l], array[randInd]] = [array[randInd], array[l]];

    let [lastSmallerInd, firstLargerInd] = this._partition3(array, l, r);
    this._quickSort3(array, l, lastSmallerInd);
    this._quickSort3(array, firstLargerInd, r);
  }

  _partition3(array, l = 0, r = array.length) {
    let i = l,
      j = l;

    let pivot = array[l];

    for (let ind = l + 1; ind <= r; ind++) {
      if (array[ind] < pivot) {
        j++;
        i++;
        [array[i], array[j]] = [array[j], array[i]];
        if (ind !== j) [array[i], array[ind]] = [array[ind], array[i]];
      } else if (array[ind] === pivot) {
        j++;
        [array[j], array[ind]] = [array[ind], array[j]];
      }
    }
    [array[l], array[i]] = [array[i], array[l]];
    return [i - 1, j + 1];
  }

  _getRandInt(from, to) {
    return Math.floor(Math.random() * (to + 1 - from) + from);
  }
}

/**
 * Merge Sort Strategy
 */
class MergeSort {
  sort(array) {
    const buffer = new Array(array.length);
    this._mergeSortBetween(array, buffer);
    return array;
  }

  _mergeSortBetween(array, buffer, i = 0, j = array.length - 1) {
    if (i >= j) return array;

    let m = Math.floor((i + j) / 2);
    this._mergeSortBetween(array, buffer, i, m);
    this._mergeSortBetween(array, buffer, m + 1, j);
    this._merge(array, buffer, i, m, m + 1, j);

    return array;
  }

  _merge(nums, buffer, iL, jL, iR, jR) {
    let i1 = iL,
      i2 = iR;
    let ind;
    for (ind = iL; i1 <= jL && i2 <= jR; ind++) {
      if (nums[i1] < nums[i2]) buffer[ind] = nums[i1++];
      else buffer[ind] = nums[i2++];
    }
    while (i1 <= jL) buffer[ind++] = nums[i1++];
    while (i2 <= jR) buffer[ind++] = nums[i2++];

    for (let ind = iL; ind <= jR; ind++) nums[ind] = buffer[ind];
  }
}

// ============================================
// PRICING STRATEGIES
// ============================================

/**
 * Pricing Context
 *
 * Calculates prices using a strategy.
 */
class PricingContext {
  constructor(strategy) {
    this.strategy = strategy;
  }

  setStrategy(strategy) {
    this.strategy = strategy;
  }

  calculateTotal(items) {
    return this.strategy.calculate([...items]);
  }
}

/**
 * Regular Pricing (no discount)
 */
class RegularPricing {
  calculate(items) {
    const total = items.reduce((sum, { price }) => sum + price, 0);
    return total;
  }
}

/**
 * Percentage Discount
 */
class PercentageDiscount {
  constructor(percentage) {
    this.percentage = percentage;
  }

  calculate(items) {
    const subtotal = items.reduce((sum, { price }) => sum + price, 0);
    const total = subtotal * (1 - this.percentage / 100);
    return total;
  }
}

/**
 * Fixed Discount
 */
class FixedDiscount {
  constructor(amount) {
    this.amount = amount;
  }

  calculate(items) {
    const subtotal = items.reduce((sum, { price }) => sum + price, 0);
    const total = Math.max(subtotal - this.amount, 0);
    return total;
  }
}

/**
 * Buy One Get One Free
 */
class BuyOneGetOneFree {
  calculate(items) {
    const sortedItems = items.sort((i1, i2) => i2.price - i1.price);
    const total = sortedItems.reduce(
      (total, { price }, i) => (i % 2 === 0 ? total + price : total),
      0
    );
    return total;
  }
}

/**
 * Tiered Discount
 *
 * Different discount based on total.
 */
class TieredDiscount {
  constructor(tiers) {
    // tiers = [{ threshold: 100, discount: 10 }, { threshold: 200, discount: 20 }]
    this.tiers = tiers;
  }

  calculate(items) {
    const subtotal = items.reduce((sum, { price }) => sum + price, 0);
    let discountPercantage = 0;
    for (const { threshold, discount } of this.tiers) {
      if (subtotal >= threshold)
        discountPercantage = Math.max(discount, discountPercantage);
    }
    const total = subtotal * (1 - discountPercantage / 100);
    return total;
  }
}

// ============================================
// VALIDATION STRATEGIES
// ============================================

/**
 * Validation Context
 */
class ValidationContext {
  constructor(strategy) {
    this.strategy = strategy;
  }

  setStrategy(strategy) {
    this.strategy = strategy;
  }

  validate(data) {
    return this.strategy.validate(data);
  }
}

/**
 * Strict Validation
 *
 * Requires all three fields to be present and valid:
 * - name: must be a non-empty string
 * - email: must be a non-empty string (no regex validation required)
 * - age: must be a number (any number is valid, no range check required)
 */
class StrictValidation {
  validate(data) {
    const errors = [];
    const { name, email, age } = data;

    if (typeof name !== "string" || name.trim() === "")
      errors.push("Name must not be empty.");
    if (typeof email !== "string" || email.trim() === "")
      errors.push("Email must not be empty");
    if (!Number.isFinite(age)) errors.push("Age must be a number.");

    return {
      valid: !errors.length,
      errors,
    };
  }
}

/**
 * Lenient Validation
 *
 * Accepts any data, including empty objects.
 * No validation rules - always passes.
 */
class LenientValidation {
  validate(data) {
    return {
      valid: true,
      errors: [],
    };
  }
}

// ============================================
// STRATEGY REGISTRY
// ============================================

/**
 * Strategy Registry
 *
 * Register and retrieve strategies by name.
 */
class StrategyRegistry {
  constructor() {
    this.strategies = new Map();
  }

  register(name, strategy) {
    this.strategies.set(name, strategy);
  }

  get(name) {
    if (!this.has(name)) return null;
    return this.strategies.get(name);
  }

  has(name) {
    return this.strategies.has(name);
  }
}

module.exports = {
  // Sorting
  SortContext,
  BubbleSort,
  QuickSort,
  MergeSort,
  // Pricing
  PricingContext,
  RegularPricing,
  PercentageDiscount,
  FixedDiscount,
  BuyOneGetOneFree,
  TieredDiscount,
  // Validation
  ValidationContext,
  StrictValidation,
  LenientValidation,
  // Registry
  StrategyRegistry,
};
