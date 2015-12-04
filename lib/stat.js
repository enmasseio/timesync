// basic statistical functions

export function compare (a, b) {
  return a > b ? 1 : a < b ? -1 : 0;
}

export function add (a, b) {
  return a + b;
}

export function sum (arr) {
  return arr.reduce(add);
}

export function mean (arr) {
  return sum(arr) / arr.length;
}

export function std (arr) {
  return Math.sqrt(variance(arr));
}

export function variance (arr) {
  if (arr.length < 2) return 0;

  var _mean = mean(arr);
  return arr
          .map(x => Math.pow(x - _mean, 2))
          .reduce(add) / (arr.length - 1);
}

export function median (arr) {
  if (arr.length < 2) return arr[0];

  var sorted = arr.slice().sort(compare);
  if (sorted.length % 2 === 0) {
    // even
    return (sorted[arr.length / 2 - 1] + sorted[arr.length / 2]) / 2;
  }
  else {
    // odd
    return sorted[(arr.length - 1) / 2];
  }
}
