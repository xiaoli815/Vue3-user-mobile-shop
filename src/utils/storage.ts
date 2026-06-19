/**
 * 本地存储工具函数
 */

/**
 * 存储数据到 localStorage
 * @param key 存储键名
 * @param value 存储值
 */
export const setLocalStorage = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.error('localStorage 存储失败:', error)
  }
}

/**
 * 从 localStorage 读取数据
 * @param key 存储键名
 * @returns 存储值（解析后的对象）或 null
 */
export const getLocalStorage = <T>(key: string): T | null => {
  try {
    const stored = localStorage.getItem(key)
    if (stored) {
      return JSON.parse(stored) as T
    }
    return null
  } catch (error) {
    console.error('localStorage 读取失败:', error)
    return null
  }
}

/**
 * 从 localStorage 删除数据
 * @param key 存储键名
 */
export const removeLocalStorage = (key: string): void => {
  try {
    localStorage.removeItem(key)
  } catch (error) {
    console.error('localStorage 删除失败:', error)
  }
}

/**
 * 存储数据到 sessionStorage
 * @param key 存储键名
 * @param value 存储值
 */
export const setSessionStorage = <T>(key: string, value: T): void => {
  try {
    sessionStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.error('sessionStorage 存储失败:', error)
  }
}

/**
 * 从 sessionStorage 读取数据
 * @param key 存储键名
 * @returns 存储值（解析后的对象）或 null
 */
export const getSessionStorage = <T>(key: string): T | null => {
  try {
    const stored = sessionStorage.getItem(key)
    if (stored) {
      return JSON.parse(stored) as T
    }
    return null
  } catch (error) {
    console.error('sessionStorage 读取失败:', error)
    return null
  }
}

/**
 * 从 sessionStorage 删除数据
 * @param key 存储键名
 */
export const removeSessionStorage = (key: string): void => {
  try {
    sessionStorage.removeItem(key)
  } catch (error) {
    console.error('sessionStorage 删除失败:', error)
  }
}
