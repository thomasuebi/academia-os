/**
 * Loops asynchronously through an array. Make sure to await this method.
 *
 * @param array Array
 * @param callback An asynchronous function that accepts up to three arguments. It is called for every element in the specified array.
 */
export async function asyncForEach<T>(
  array: T[],
  callback: (value: T, index: number, array: T[]) => Promise<any>
) {
  if (Array.isArray(array)) {
    // eslint-disable-next-line no-plusplus
    for (let index = 0; index < array.length; index++) {
      // eslint-disable-next-line no-await-in-loop
      await callback(array[index], index, array)
    }
  }
}
