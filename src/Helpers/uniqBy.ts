export function uniqBy<T>(arr: T[], key: (value: T) => string) {
  if (Array.isArray(arr)) {
    const seen = {} as any
    return arr.filter((item) => {
      const k = key(item)
      if (seen[k]) {
        return false
      }
      seen[k] = true
      return true
    })
  }
  return arr
}
