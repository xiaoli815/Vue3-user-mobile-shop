const memoryStorage = new Map<string, string>()

export function getItem(key: string): string | null {
  if (typeof window !== 'undefined' && window.localStorage) {
    return localStorage.getItem(key)
  }
  return memoryStorage.get(key) || null
}

export function setItem(key: string, value: string): void {
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.setItem(key, value)
  } else {
    memoryStorage.set(key, value)
  }
}

export function removeItem(key: string): void {
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.removeItem(key)
  } else {
    memoryStorage.delete(key)
  }
}

export function clear(): void {
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.clear()
  } else {
    memoryStorage.clear()
  }
}