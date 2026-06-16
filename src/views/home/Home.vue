<template>
  <div class="home-page">
    <!-- 搜索栏 -->
    <van-search
      v-model="keyword"
      placeholder="搜索商品"
      shape="round"
      @search="onSearch"
    />

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
      <van-grid-item v-for="item in categoryList" :key="item.id" :icon="item.icon || 'shop-o'" :text="item.name" @click="goCategory(item.id)" />
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
        <div class="flash-item" v-for="i in seckillList" :key="i.seckillId" @click="goSeckillDetail(i.seckillId)">
          <div class="flash-img-placeholder">
            <img :src="i.image" alt="秒杀商品图" />
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
        <div class="coupon-card" v-for="i in 3" :key="i">
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
      <div class="recommend-grid" v-infinite-scroll="load">
        <div class="recommend-item" v-for="item in hotProducts" :key="item.id">
          <div class="product-card" @click="goDetail(item.id)">
            <div class="product-img-placeholder">
              <img :src="item.image" alt="商品图" />
            </div>
            <div class="product-info">
              <p class="product-name">{{ item.name }}</p>
              <p class="product-price">
                <span class="price">{{ item.price }}</span>
                <span class="sales">已售{{ item.sales }}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <tabbar></tabbar>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Tabbar from '@/components/tabbar.vue'
import { getCategoryList } from '@/api/category'
import { getBannersList, getHotProducts } from '@/api/home'
import { Product } from '@/types/index'
import { Banner, CategoryItem } from '@/types/home'
import { SeckillItem } from '@/types/seckill'
import { getSeckillList } from '@/api/seckill'



const router = useRouter()
const keyword = ref('')

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

// 分页加载热门商品
const page = ref(1)
const pageSize = ref(10)
const load = async () => {
  const res = await getHotProducts({ page: hotProducts.value.length / 10 + 1, pageSize: pageSize.value })
  if (res?.list) {
    hotProducts.value.push(...res.list)
  }
}

const banners = ref<Banner[]>([])
const hotProducts = ref<Product[]>([])

const categoryList = ref<CategoryItem[]>([])

// 获取热门商品
const fetchHotProducts = async () => {
    try {
      const res = await getHotProducts({ page: page.value, pageSize: pageSize.value })
      hotProducts.value = res?.list || []
    } catch (e) {
      console.error('获取热门商品失败:', e)
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
  

onMounted(async () => {
 fetchHotProducts()
 fetchBanners()
 fetchCategoryList()
 fetchSeckillList()
})

const onSearch=(val: string)=> {
  router.push(`/product/list?keyword=${val}`)
}

const goDetail=(id: number)=> {
  router.push({
  path: '/product/detail',
  query: {
    id: id,
    type: 'normal'  
  }
})
}


const goCategory=(id: number)=> {
  router.push(`/product/list?categoryId=${id}`)
}

const goSeckill = () => {
  router.push('/seckill')
}
const goSeckillDetail=(id: number)=> {
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

.banner-swipe {
  margin: 8px 12px;
  border-radius: 8px;
  overflow: hidden;
  height: 160px;
}

.banner-placeholder {
  width: 100%;
  height: 160px;
  background: linear-gradient(135deg, #ff6b6b, #ffd93d);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 14px;
}

.banner-img {
  width: 100%;
  height: 160px;
  object-fit: cover;
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

.recommend-item {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
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

.product-img {
  width: 100%;
  height: 160px;
  object-fit: cover;
  border-radius: 4px;
  display: block;
}



.product-name {
  font-size: 13px;
  margin: 6px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-price {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sales {
  font-size: 11px;
  color: #999;
}
</style>