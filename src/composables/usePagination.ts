import { ref, computed, type Ref } from 'vue'

interface PaginationOptions {
  /** 初始页码，默认 1 */
  page?: number
  /** 每页数量，默认 10 */
  pageSize?: number
}

/**
 * 分页逻辑组合式函数
 * 封装分页状态、加载更多、刷新等通用逻辑
 */
export function usePagination<T>(options: PaginationOptions = {}) {
  const { page: initialPage = 1, pageSize: initialPageSize = 10 } = options

  const page = ref<number>(initialPage)
  const pageSize = ref<number>(initialPageSize)
  const total = ref<number>(0)
  const list = ref<T[]>([]) as Ref<T[]>
  const loading = ref<boolean>(false)
  const finished = ref<boolean>(false)
  const refreshing = ref<boolean>(false)

  /** 是否还有更多数据 */
  const hasMore = computed(() => !finished.value && list.value.length < total.value)

  /** 总页数 */
  const totalPages = computed(() => Math.ceil(total.value / pageSize.value))

  /**
   * 加载数据（追加模式）
   * @param fetchFn 获取数据的函数，返回 { list, total } 或直接返回数组
   */
  async function loadMore(
    fetchFn: (params: { page: number; pageSize: number }) => Promise<{ list: T[]; total: number }>,
  ): Promise<void> {
    if (loading.value || finished.value) return

    loading.value = true
    try {
      const res = await fetchFn({ page: page.value, pageSize: pageSize.value })
      list.value = list.value.concat(res.list || [])
      total.value = res.total || 0
      page.value++

      if (list.value.length >= total.value) {
        finished.value = true
      }
    } finally {
      loading.value = false
    }
  }

  /**
   * 刷新数据（重置到第一页）
   */
  async function refresh(
    fetchFn: (params: { page: number; pageSize: number }) => Promise<{ list: T[]; total: number }>,
  ): Promise<void> {
    refreshing.value = true
    page.value = 1
    finished.value = false

    try {
      const res = await fetchFn({ page: 1, pageSize: pageSize.value })
      list.value = res.list || []
      total.value = res.total || 0
      page.value = 2

      if (list.value.length >= total.value) {
        finished.value = true
      }
    } finally {
      refreshing.value = false
    }
  }

  /** 重置分页状态 */
  function reset(): void {
    page.value = initialPage
    list.value = []
    total.value = 0
    finished.value = false
    loading.value = false
  }

  return {
    page,
    pageSize,
    total,
    list,
    loading,
    finished,
    refreshing,
    hasMore,
    totalPages,
    loadMore,
    refresh,
    reset,
  }
}