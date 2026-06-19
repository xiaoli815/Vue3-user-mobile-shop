<template>
  <div class="product-list-page">
    <!-- 搜索栏 -->
    <van-search v-model="keyword" placeholder="搜索商品" shape="round" @search="onSearch" />

    <!-- 筛选栏 -->
    <div class="filter-bar">
      <div
        class="filter-item"
        :class="{ active: sortType === 'default' }"
        @click="sortType = 'default'"
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
        @click="sortType = 'sales'"
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

    <!-- 加载状态 -->
    <van-loading v-if="loading" class="loading-center" />
  </div>
  <Tabbar></Tabbar>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { getCategoryGoods } from '@/api/category'
import Tabbar from '@/components/Tabbar.vue'
import { useRoute, useRouter } from 'vue-router'
import { Product } from '@/types/index'
import { getProductList } from '@/api/product'
import { searchProducts } from '@/api/search'
import { useLoading } from '@/composables/useLoading'

const route = useRoute()
const router = useRouter()

const keyword = ref((route.query.keyword as string) || '')
const categoryId = ref(Number(route.query.categoryId) || 0)
const sortType = ref('default')
const productList = ref<Product[]>([])
const { loading, withLoading } = useLoading()

// 监听路由变化
watch(
  () => route.query,
  query => {
    keyword.value = (query.keyword as string) || ''
    categoryId.value = Number(query.categoryId) || 0
    loadProducts()
  },
  { immediate: false }
)

// 搜索
function onSearch(val: string) {
  router.push(`/product/list?keyword=${encodeURIComponent(val)}`)
}
// 点击价格时切换排序状态
const togglePriceSort = () => {
  if (sortType.value === 'default' || sortType.value === 'price_desc') {
    sortType.value = 'price_asc'
  } else {
    sortType.value = 'price_desc'
  }
}

// 根据排序类型对商品列表进行排序
// 使用 toSorted 避免产生不必要的数组拷贝（ES2023）
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
  await withLoading(async () => {
    if (categoryId.value > 0) {
      const res = await getCategoryGoods({ categoryId: categoryId.value })
      productList.value = (res as unknown as { list: Product[] }).list || []
    } else if (keyword.value) {
      const res = await searchProducts(keyword.value)
      productList.value = res.list || []
    } else {
      const res = await getProductList('')
      const data = (res as unknown as { data: { list: Product[] } }).data
      productList.value = data.list || []
    }
  })
}

onMounted(() => {
  loadProducts()
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
  -webkit-line-clamp: 2;
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
</style>
