<template>
  <div class="product-list-page">
    <!-- 搜索栏 -->
    <van-search v-model="keyword" placeholder="搜索商品" shape="round" @search="onSearch" />

    <!-- 筛选栏 -->
    <div class="filter-bar">
      <div class="filter-item" :class="{ active: sortType === 'default' }" @click="sortType = 'default'">综合</div>
      <div class="filter-item"  @click="togglePriceSort" >
        <span :class="{ active: sortType === 'price_desc' || sortType === 'price_asc' }">价格</span>
        <div class="van-icon">
          <van-icon name="arrow-up" size="12" :class="{active:sortType==='price_asc'}"/>
          <van-icon name="arrow-down" size="12" :class="{active:sortType==='price_desc'}"/>
        </div>
      </div>
      <div class="filter-item" :class="{ active: sortType === 'sales' }" @click="sortType = 'sales'">
        销量 
      </div>
    </div>

    <!-- 商品列表 -->
    <div class="product-grid" v-if="sortedProductList.length > 0">
      <div class="product-item" v-for="item in sortedProductList" :key="item.id" @click="goDetail(item.id)">
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
            <span class="original" >￥{{ item.originalPrice }}</span>
          </p>
          <p class="product-sales">已售 {{ item.sales }}</p>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <van-empty description="暂无商品" v-if="productList.length === 0 && !loading" />

    <!-- 加载状态 -->
    <van-loading class="loading-center" v-if="loading" />
  </div>
  <Tabbar></Tabbar>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { getCategoryGoods } from '@/api/category'
import Tabbar from '@/components/tabbar.vue'
import { useRoute, useRouter } from 'vue-router'
import { Product } from '@/types/index'
import { getProductList } from '@/api/product'

const route = useRoute()
const router = useRouter()

const keyword = ref(route.query.keyword as string || '')
const categoryId = ref(Number(route.query.categoryId) || 0)
const sortType = ref('default')
const productList = ref<Product[]>([])
const loading = ref(false)

// 监听路由变化
watch(() => route.query, (query) => {
  keyword.value = query.keyword as string || ''
  categoryId.value = Number(query.categoryId) || 0
  loadProducts()
}, { immediate: false })

// 搜索
function onSearch(val: string) {
  router.push(`/product/list?keyword=${val}`)

}
// 点击价格时切换排序状态
const togglePriceSort = () => {
  if (sortType.value === 'default' || sortType.value === 'price_desc') {
    sortType.value = 'price_asc'  // 升序
  } else {
    sortType.value = 'price_desc' // 降序
  }
}

// 根据排序类型对商品列表进行排序
const sortedProductList = computed(() => {
  const list = [...productList.value]
  
  switch (sortType.value) {
    case 'price_asc':
      // 价格升序
      return list.sort((a, b) => (a.price || 0) - (b.price || 0))
    case 'price_desc':
      // 价格降序
      return list.sort((a, b) => (b.price || 0) - (a.price || 0))
    case 'sales':
      // 销量排序
      return list.sort((a, b) => (b.sales || 0) - (a.sales || 0))
    default:
      // 默认排序（按ID）
      return list.sort((a, b) => a.id - b.id)
  }
})

// 跳转详情
function goDetail(id: number) {
  router.push(`/product/${id}`)
}

// 加载商品
async function loadProducts() {
  loading.value = true
  try {
    if (categoryId.value > 0) {
      const res: any = await getCategoryGoods({ categoryId: categoryId.value })
      productList.value = res?.list || []
      console.log(productList.value)
    } else if (keyword.value) {
      // TODO: 搜索接口
      const res: any = await getProductList(keyword.value)
      console.log(res)
      productList.value = res?.list || []
    }
  } catch (error) {
    console.error('获取商品失败:', error)
  } finally {
    loading.value = false
  }
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