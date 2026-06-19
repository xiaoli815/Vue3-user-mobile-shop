import { describe, it, expect, beforeEach } from 'vitest'
import { setLocalStorage, getLocalStorage, removeLocalStorage } from '@/utils/storage'

describe('storage.ts', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('setLocalStorage / getLocalStorage', () => {
    it('应该存储和读取字符串', () => {
      setLocalStorage('test_str', 'hello')
      expect(getLocalStorage<string>('test_str')).toBe('hello')
    })

    it('应该存储和读取对象', () => {
      const obj = { name: 'test', value: 123 }
      setLocalStorage('test_obj', obj)
      expect(getLocalStorage<typeof obj>('test_obj')).toEqual(obj)
    })

    it('不存在的 key 返回 null', () => {
      expect(getLocalStorage('nonexistent')).toBeNull()
    })
  })

  describe('removeLocalStorage', () => {
    it('应该删除指定 key', () => {
      setLocalStorage('to_remove', 'data')
      removeLocalStorage('to_remove')
      expect(getLocalStorage('to_remove')).toBeNull()
    })
  })
})
