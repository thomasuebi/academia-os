/**
 * Maps asynchronously through an array. Make sure to await this method
 *
 * @param arr Array
 * @param callbackfn An asynchronous function that accepts up to three arguments. The map method calls the callbackfn function one time for each element in the array.
 * @param thisArg An object to which the this keyword can refer in the callbackfn function. If thisArg is omitted, undefined is used as the this value.
 */
export async function asyncMap<T, U>(
  arr: T[],
  callbackfn: (value: T, index: number, array: T[]) => Promise<U>,
  thisArg?: any
): Promise<any[]> {
  if (Array.isArray(arr)) {
    return Promise.all(
      arr.map(
        async (value, index, array) => callbackfn(value, index, array),
        thisArg
      )
    )
  }
  return arr
}
