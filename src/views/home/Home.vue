<template>
  <div class="home-page">
    <!-- 搜索栏 -->
    <div class="search-container">
      <form action="javascript:void(0)" @submit.prevent="onSearch(keyword)">
        <van-search
          v-model="keyword"
          placeholder="搜索商品"
          shape="round"
          @search="onSearch(keyword)"
          @focus="showSuggestions = !!(suggestions.length || searchHistory.length)"
          @clear="onCancelSearch"
        >
          <template v-if="keyword" #action>
            <div @click="onCancelSearch">取消</div>
          </template>
        </van-search>
      </form>

      <!-- 搜索建议 / 历史记录 -->
      <div v-if="showSuggestions" class="search-panel">
        <!-- 搜索建议 -->
        <div v-if="suggestions.length > 0" class="suggestions-section">
          <div class="suggestion-title">搜索建议</div>
          <div
            v-for="item in suggestions"
            :key="item.keyword"
            class="suggestion-item"
            @click="onSelectSuggestion(item.keyword)"
          >
            <van-icon name="search" size="14" color="#999" />
            <span>{{ item.keyword }}</span>
            <span class="suggestion-count">约{{ item.count }}件</span>
          </div>
        </div>

        <!-- 搜索历史 -->
        <div v-if="searchHistory.length > 0" class="history-section">
          <div class="history-header">
            <span class="history-title">搜索历史</span>
            <van-icon name="delete-o" size="16" color="#999" @click="clearHistory" />
          </div>
          <div class="history-tags">
            <van-tag
              v-for="item in searchHistory"
              :key="item"
              closeable
              size="medium"
              type="default"
              @click="onSelectSuggestion(item)"
              @close="removeSearch(item)"
            >
              {{ item }}
            </van-tag>
          </div>
        </div>
      </div>
    </div>

    <!-- 轮播图 -->
    <van-swipe :autoplay="3000" indicator-color="#ee0a24" class="banner-swipe">
      <van-swipe-item v-for="item in banners" :key="item.id">
        <div class="banner-placeholder">
          <div class="banner-img">
            <img :src="item.imageUrl" alt="轮播图" />
          </div>
        </div>
      </van-swipe-item>
    </van-swipe>

    <!-- 分类导航 -->
    <van-grid :column-num="4" :border="false" class="category-grid">
      <van-grid-item
        v-for="item in categoryList"
        :key="item.id"
        :icon="item.icon || 'shop-o'"
        :text="item.name"
        @click="goCategory(item.id)"
      />
    </van-grid>

    <!-- 秒杀专区 -->
    <div class="section flash-sale-section">
      <div class="section-header">
        <span class="section-title">
          <van-icon name="clock-o" color="#ee0a24" />
          限时秒杀
        </span>
        <span class="section-more" @click="goSeckill">查看更多 <van-icon name="arrow" /></span>
      </div>
      <div class="flash-list">
        <div
          v-for="i in seckillList"
          :key="i.seckillId"
          class="flash-item"
          @click="goSeckillDetail(i.seckillId)"
        >
          <div class="flash-img-placeholder">
            <img v-lazy="i.image" alt="秒杀商品图" />
          </div>
          <div class="flash-info">
            <p class="flash-name">{{ i.title }}</p>
            <span class="flash-price price">{{ i.seckillPrice }}</span>
            <span class="flash-original">{{ i.originalPrice }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 优惠券活动 -->
    <div class="section coupon-section">
      <div class="section-header" @click="goCoupon">
        <span class="section-title">
          <van-icon name="coupon-o" color="#ee0a24" />
          领券中心
        </span>
      </div>
      <div class="coupon-scroll">
        <div v-for="i in 3" :key="i" class="coupon-card">
          <div class="coupon-left">
            <span class="coupon-value">¥20</span>
            <span class="coupon-condition">满100可用</span>
          </div>
          <div class="coupon-right">
            <span>立即领取</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 推荐商品 -->
    <div class="section recommend-section">
      <div class="section-header">
        <span class="section-title">为你推荐</span>
      </div>
      <!-- 骨架屏 -->
      <div v-if="hotLoading" class="recommend-grid">
        <Skeleton v-for="i in 4" :key="i" width="100%" height="240px" />
      </div>
      <!-- 商品列表 -->
      <AsyncProductList :product-list="hotProducts" @click="goDetail" />
    </div>
  </div>
  <tabbar></tabbar>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, defineAsyncComponent } from 'vue'
import { useRouter } from 'vue-router'
import Tabbar from '@/components/Tabbar.vue'
import { getCategoryList } from '@/api/category'
import { getBannersList, getHotProducts } from '@/api/home'
import { Product } from '@/types/index'
import { Banner, CategoryItem } from '@/types/home'
import { SeckillItem } from '@/types/seckill'
import { getSeckillList } from '@/api/seckill'
import { getSearchSuggestions } from '@/api/search'
import { useDebounce } from '@/composables/useDebounce'
import { useSearchHistory } from '@/composables/useSearchHistory'
import Skeleton from '@/components/Skeleton.vue'


const router = useRouter()
const keyword = ref('')
const suggestions = ref<{ keyword: string; count: number }[]>([])
const showSuggestions = ref(false)

// 异步组件加载
const AsyncProductList = defineAsyncComponent(() => import('@/components/home/ProductList.vue'))

// 搜索历史
const { history: searchHistory, addSearch, removeSearch, clearHistory } = useSearchHistory()

// 防抖搜索建议
const fetchSuggestions = async (val: string) => {
  if (!val.trim()) {
    suggestions.value = []
    return
  }
  try {
    const res = await getSearchSuggestions(val)
    suggestions.value = res || []
    showSuggestions.value = true
  } catch {
    suggestions.value = []
  }
}
const debouncedFetch = useDebounce(fetchSuggestions, 300)

// 监听输入变化
watch(keyword, (val) => {
  debouncedFetch(val)
  if (!val.trim()) {
    suggestions.value = []
    showSuggestions.value = false
  }
})

// 执行搜索
const onSearch = (val: string) => {
  if (!val.trim()) return
  addSearch(val.trim())
  showSuggestions.value = false
  router.push(`/product/list?keyword=${encodeURIComponent(val.trim())}`)
}

// 点击搜索建议
const onSelectSuggestion = (kw: string) => {
  keyword.value = kw
  onSearch(kw)
}

// 取消搜索
const onCancelSearch = () => {
  keyword.value = ''
  suggestions.value = []
  showSuggestions.value = false
}

// 优惠券中心
const goCoupon = () => {
  router.push('/coupon')
}

// seckill 秒杀专区
const seckillList = ref<SeckillItem[]>([])
// 获取秒杀列表
const fetchSeckillList = async () => {
  try {
    const res = await getSeckillList()
    if (res && Array.isArray(res.data)) {
      seckillList.value = res.data || []
    }
  } catch (e) {
    console.error('获取秒杀列表失败:', e)
  }
}

const banners = ref<Banner[]>([])
const hotProducts = ref<Product[]>([])
const hotLoading = ref(false)

const categoryList = ref<CategoryItem[]>([])

// 获取热门商品
const fetchHotProducts = async () => {
  hotLoading.value = true
  try {
    const res = await getHotProducts({ page: 1, pageSize: 10 })
    hotProducts.value = res?.list || []
  } catch (e) {
    console.error('获取热门商品失败:', e)
  } finally {
    hotLoading.value = false
  }
}

// banner 轮播图数据
const fetchBanners = async () => {
  try {
    const res = await getBannersList()
    banners.value = Array.isArray(res) ? res : []
  } catch (e) {
    console.error('获取轮播图数据失败:', e)
  }
}

// 获取分类
const fetchCategoryList = async () => {
  try {
    const res = await getCategoryList()
    if (Array.isArray(res)) {
      categoryList.value = res.slice(0, 8)
    }
  } catch (e) {
    console.error('获取分类失败:', e)
  }
}

onMounted(() => {
  fetchHotProducts()
  fetchBanners()
  fetchCategoryList()
  fetchSeckillList()
})

const goDetail = (id: number) => {
  router.push({
    path: '/product/detail',
    query: {
      id: id,
      type: 'normal'
    }
  })
}

const goCategory = (id: number) => {
  router.push(`/product/list?categoryId=${id}`)
}

const goSeckill = () => {
  router.push('/seckill')
}
const goSeckillDetail = (id: number) => {
  router.push({
    path: '/product/detail',
    query: {
      id: id,
      type: 'seckill'
    }
  })
}
</script>

<style scoped>
.home-page {
  padding-bottom: 50px;
}

.search-container {
  position: relative;
  background: #fff;
}

.search-panel {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: #fff;
  z-index: 100;
  padding: 8px 16px 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.suggestions-section {
  margin-bottom: 12px;
}

.suggestion-title,
.history-title {
  font-size: 13px;
  color: #999;
  margin-bottom: 8px;
}

.suggestion-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 0;
  font-size: 14px;
  color: #333;
  border-bottom: 1px solid #f5f5f5;
}

.suggestion-item:active {
  background: #f9f9f9;
}

.suggestion-count {
  margin-left: auto;
  font-size: 12px;
  color: #ccc;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.history-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.history-tags .van-tag {
  cursor: pointer;
}

.banner-swipe {
  margin: 8px 12px;
  border-radius: 8px;
  overflow: hidden;
  aspect-ratio: 16/9;
}

.banner-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #ff6b6b, #ffd93d);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 14px;
}

.banner-img {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.banner-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.category-grid {
  background: #fff;
  margin: 8px 12px;
  border-radius: 8px;
}

.section {
  background: #fff;
  margin: 8px 12px;
  border-radius: 8px;
  padding: 12px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.section-title {
  font-size: 16px;
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 4px;
}

.section-more {
  font-size: 12px;
  color: #999;
}

.flash-list {
  display: flex;
  gap: 8px;
  overflow-x: auto;
}

.flash-item {
  flex-shrink: 0;
  width: 100px;
  text-align: center;
}

.flash-img-placeholder {
  width: 80px;
  height: 80px;
  background: #f5f5f5;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  color: #999;
  margin: 0 auto;
}

.flash-img-placeholder img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.flash-name {
  font-size: 12px;
  margin: 6px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.flash-price {
  font-size: 14px;
}

.flash-original {
  font-size: 11px;
  color: #999;
  text-decoration: line-through;
  margin-left: 4px;
}

.coupon-scroll {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 4px;
}

.coupon-card {
  flex-shrink: 0;
  width: 140px;
  display: flex;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #ee0a24;
}

.coupon-left {
  background: #ee0a24;
  color: #fff;
  padding: 8px 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 80px;
}

.coupon-value {
  font-size: 20px;
  font-weight: bold;
}

.coupon-condition {
  font-size: 10px;
  opacity: 0.8;
}

.coupon-right {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  font-size: 12px;
  color: #ee0a24;
  background: #fff3f3;
}

.recommend-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  padding: 0 8px;
}

.product-card {
  width: 100%;
}

.product-img-placeholder {
  width: 100%;
  height: 160px;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: #999;
  border-radius: 4px;
}

.product-img-placeholder img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
