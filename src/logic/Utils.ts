export function expectNever(val: never): never {
  throw new Error(`Unexpected never: ${val}`);
}

export function sum(...nums: Array<number>): number {
  let sum = 0;
  for (const num of nums) {
    sum += num;
  }
  return sum;
}

export function arrayShallowEqual<T>(left: Array<T>, right: Array<T>): boolean {
  if (left.length !== right.length) {
    return false;
  }
  return left.every((v, i) => v === right[i]);
}
