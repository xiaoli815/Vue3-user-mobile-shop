import { ref, watch, type Ref } from 'vue'

/**
 * 防抖函数
 * @param fn 需要防抖的函数
 * @param delay 延迟时间（毫秒），默认 300ms
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useDebounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number = 300,
) {
  let timer: ReturnType<typeof setTimeout> | null = null

  const debouncedFn = (...args: Parameters<T>): void => {
    if (timer) {
      clearTimeout(timer)
    }
    timer = setTimeout(() => {
      fn(...args)
    }, delay)
  }

  return debouncedFn
}

/**
 * 防抖 ref（对 ref 值变化做防抖处理）
 * @param source 源 ref
 * @param delay 延迟时间（毫秒）
 */
export function useDebouncedRef<T>(source: Ref<T>, delay: number = 300): Ref<T> {
  const debounced = ref<T>(source.value) as Ref<T>
  let timer: ReturnType<typeof setTimeout>

  watch(source, (val) => {
    clearTimeout(timer)
    timer = setTimeout(() => {
      debounced.value = val
    }, delay)
  })

  return debounced
}