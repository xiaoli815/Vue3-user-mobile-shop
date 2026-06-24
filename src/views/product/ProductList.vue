<template>
  <div class="product-list-page">
    <!-- 搜索栏 -->
    <van-search v-model="keyword" placeholder="搜索商品" shape="round" @search="onSearch" />

    <!-- 筛选栏 -->
    <div class="filter-bar">
      <div
        class="filter-item"
        :class="{ active: sortType === 'default' }"
        @click="handleSortChange('default')"
      >
        综合
      </div>
      <div class="filter-item" @click="togglePriceSort">
        <span :class="{ active: sortType === 'price_desc' || sortType === 'price_asc' }">价格</span>
        <div class="van-icon">
          <van-icon name="arrow-up" size="12" :class="{ active: sortType === 'price_asc' }" />
          <van-icon name="arrow-down" size="12" :class="{ active: sortType === 'price_desc' }" />
        </div>
      </div>
      <div
        class="filter-item"
        :class="{ active: sortType === 'sales' }"
        @click="handleSortChange('sales')"
      >
        销量
      </div>
    </div>

    <!-- 商品列表 -->
    <div v-if="sortedProductList.length > 0" class="product-grid">
      <div
        v-for="item in sortedProductList"
        :key="item.id"
        class="product-item"
        @click="goDetail(item.id)"
      >
        <div class="product-img-placeholder">
          <img :src="item.image" alt="商品图" />
        </div>
        <div class="product-info">
          <p class="product-name">{{ item.name }}</p>
          <p class="product-tags">
            <van-tag v-for="tag in item.tags" :key="tag" type="primary" plain>{{ tag }}</van-tag>
          </p>
          <p class="product-price-row">
            <span class="price">{{ item.price }}</span>
            <span class="original">￥{{ item.originalPrice }}</span>
          </p>
          <p class="product-sales">已售 {{ item.sales }}</p>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <van-empty v-if="productList.length === 0 && !loading" description="暂无商品" />

    <!-- 首次加载 -->
    <van-loading v-if="loading && productList.length === 0" class="loading-center" />

    <!-- 加载更多 -->
    <div v-if="loading && productList.length > 0" class="loading-more">
      <van-loading type="spinner" size="20" />
      <span>加载中...</span>
    </div>

    <!-- 没有更多 -->
    <div v-if="finished && productList.length > 0" class="no-more">
      没有更多了
    </div>
  </div>
  <Tabbar></Tabbar>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import { getCategoryGoods } from '@/api/category'
import Tabbar from '@/components/Tabbar.vue'
import { useRoute, useRouter } from 'vue-router'
import { Product } from '@/types/index'
import { getProductList } from '@/api/product'
import { searchProducts } from '@/api/search'
import { usePagination } from '@/composables/usePagination'

const route = useRoute()
const router = useRouter()

const keyword = ref((route.query.keyword as string) || '')
const categoryId = ref(Number(route.query.categoryId) || 0)
const sortType = ref('default')

// 使用 usePagination 管理商品分页
const {
  list: productList,
  loading,
  finished,
  loadMore,
  reset
} = usePagination<Product>({ pageSize: 4 })

// 监听路由变化
watch(
  () => route.query,
  query => {
    keyword.value = (query.keyword as string) || ''
    categoryId.value = Number(query.categoryId) || 0
    reset()
    loadProducts()
  },
  { immediate: false }
)

// 搜索
function onSearch(val: string) {
  router.push(`/product/list?keyword=${encodeURIComponent(val)}`)
}

// 切换价格排序
const togglePriceSort = () => {
  if (sortType.value === 'default' || sortType.value === 'price_desc') {
    sortType.value = 'price_asc'
  } else {
    sortType.value = 'price_desc'
  }
  reset()
  loadProducts()
}

// 切换排序
const handleSortChange = (type: string) => {
  if (sortType.value === type) return
  sortType.value = type
  reset()
  loadProducts()
}

// 根据排序类型对商品列表进行排序
const sortedProductList = computed(() => {
  switch (sortType.value) {
    case 'price_asc':
      return productList.value.toSorted((a, b) => (a.price || 0) - (b.price || 0))
    case 'price_desc':
      return productList.value.toSorted((a, b) => (b.price || 0) - (a.price || 0))
    case 'sales':
      return productList.value.toSorted((a, b) => (b.sales || 0) - (a.sales || 0))
    default:
      return productList.value.toSorted((a, b) => a.id - b.id)
  }
})

// 跳转详情
function goDetail(id: number) {
  router.push({
    path: '/product/detail',
    query: { id, type: 'normal' },
  })
}

// 加载商品
async function loadProducts() {
  await loadMore(async (params) => {
    let res: any
    let list: Product[] = []
    let total = 0

    if (categoryId.value > 0) {
      res = await getCategoryGoods({ categoryId: categoryId.value, ...params })
      list = res?.list || []
      total = res?.total || 0
    } else if (keyword.value) {
      res = await searchProducts(keyword.value)
      list = res?.list || []
      total = res?.total || 0
    } else {
      res = await getProductList('')
      const data = (res as unknown as { data: { list: Product[]; total: number } }).data
      list = data.list || []
      total = data.total || 0
    }

    return { list, total }
  })
}

// 监听滚动到底部加载更多
const handleScroll = () => {
  const scrollTop = window.scrollY || document.documentElement.scrollTop
  const windowHeight = window.innerHeight
  const documentHeight = document.documentElement.scrollHeight

  // 距离底部 100px 时触发加载
  if (scrollTop + windowHeight >= documentHeight - 100) {
    if (!loading.value && !finished.value) {
      loadProducts()
    }
  }
}

onMounted(() => {
  loadProducts()
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
.product-list-page {
  background: #f5f5f5;
  min-height: 100vh;
  padding-bottom: 50px;
}

.filter-bar {
  display: flex;
  background: #fff;
  padding: 0 16px;
  border-bottom: 1px solid #eee;
  position: sticky;
  top: 0;
  z-index: 10;
}

.filter-item {
  display: flex;
  justify-content: center;
  flex: 1;
  text-align: center;
  padding: 10px 0;
  font-size: 14px;
  color: #666;
  cursor: pointer;
}

.van-icon {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 0;
}
.van-icon.active {
  color: #ee0a24;
}

span.active {
  color: #ee0a24;
  font-weight: bold;
}

.filter-item.active {
  color: #ee0a24;
  font-weight: bold;
}

.product-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  padding: 8px;
}

.product-item {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
}

.product-img-placeholder {
  width: 100%;
  height: 180px;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
}

.product-img-placeholder img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-info {
  padding: 8px 10px;
}

.product-name {
  font-size: 13px;
  line-height: 1.4;
  display: -webkit-box;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-tags {
  border-color: #ee0a24;
  color: #ee0a24;
  margin: 4px 0;
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.product-price-row {
  display: flex;
  align-items: baseline;
  gap: 6px;
  margin-top: 4px;
}

.original {
  font-size: 11px;
  color: #999;
  text-decoration: line-through;
}

.product-sales {
  font-size: 11px;
  color: #999;
  margin-top: 2px;
}

.loading-center {
  display: flex;
  justify-content: center;
  padding: 20px;
}

.loading-more {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px;
  color: #999;
  font-size: 14px;
}

.no-more {
  text-align: center;
  padding: 16px;
  color: #ccc;
  font-size: 13px;
}

Tabbar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
}
</style>