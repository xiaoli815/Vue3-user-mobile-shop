<template>
  <div class="product-detail-page">
    <!-- 顶部导航 -->
    <van-nav-bar
      title="商品详情"
      left-arrow
      @click-left="$router.back()"
      fixed
      placeholder
    >
    <!-- 收藏 -->
      <template #right>
        <van-icon 
          :name="isFavorite ? 'like' : 'like-o'"
          size="20" 
          :color="isFavorite ? '#ee0a24' : '#999'"
          @click="getFavorite"
          
        />
      </template>
    </van-nav-bar>

    <!-- 商品图片轮播 -->
    <van-swipe :autoplay="3000" indicator-color="#ee0a24" class="detail-swipe">
      <van-swipe-item v-for="i in productDetail?.mainImages || seckillProductDetail?.mainImages || []" :key="i">
        <div class="image-placeholder">
          <span> <img :src="i" alt=""></span>
        </div>
      </van-swipe-item>
    </van-swipe>

    <!-- 秒杀条 -->
    <div class="seckill-bar" v-if="route.query.type === 'seckill'">
      <div class="seckill-left" >
        <div class="price-drop">
          <span class="label">秒杀价</span>
          <span class="currency">¥</span>
          <span class="amount">{{seckillProductDetail?.seckillPrice || 0}}</span>
          <span class="tag">共优惠{{(seckillProductDetail?.originalPrice || 0) - (seckillProductDetail?.seckillPrice || 0)}}</span>
        </div>
        <div class="sold-info">
          <span class="sold-label">已抢</span>
          <span class="sold-count">{{seckillProductDetail?.soldCount || 0}}</span>
          <span class="sold-unit">件</span>
        </div>
      </div>
      <div class="seckill-right">
        <div class="subsidy-label">百亿补贴</div>
        <div class="subsidy-desc">限量低价</div>
      </div>
    </div>

    <!-- 价格信息 -->
    <div class="price-section card">
      <div class="price-row">
        <span class="price" style="font-size:24px">{{productDetail?.price || seckillProductDetail?.seckillPrice || 0}}</span>
        <span class="original-price">¥{{productDetail?.originalPrice || seckillProductDetail?.originalPrice || 0}}</span>
      </div>
      <h2 class="product-name">{{productDetail?.name || seckillProductDetail?.title || ''}}</h2>
      <div class="product-desc">
        {{productDetail?.description || seckillProductDetail?.description || '暂无商品描述'}}
      </div>
      <div class="info-tags">
        <span>库存 {{productDetail?.stock || seckillProductDetail?.remainStock || 0}}</span>
        <span>已售 {{productDetail?.salesCount || seckillProductDetail?.soldCount || 0}}</span>
      </div>
    </div>

    

    <!-- 规格选择 -->
    <div class="spec-bar card">
      <span class="spec-label">已选</span>
      <span class="spec-text">{{ selectedSpecText || '颜色: 黑色 / 尺码: M' }}</span>
      <van-icon name="arrow" @click="showSpec = !showSpec" />
    </div>
    <!-- 底部弹出 -->
    <SkuPopUp
      v-if="productDetail || (route.query.type === 'seckill' && seckillProductDetail)"
      v-model="showSpec"
      :product="(route.query.type === 'seckill' ? seckillProductDetail : productDetail) as Product"
      :confirm-text="text"
      :discount-price="discountedPrice"
      confirm-type="danger"
      @confirm="handleBuy"
    />

    <!-- 优惠券入口 -->
    <div class="coupon-tip card" @click="handleCouponClick">
      <van-icon name="coupon-o" color="#ee0a24" />
      <span v-if="selectedCoupon">
        已选优惠券：¥{{ discountedPrice }}
      </span>
      <span v-else>店铺领券享优惠</span>
      <van-icon name="arrow" />
    </div>

    <!-- 优惠券弹窗 -->
    <CouponPopUp
      v-model:show="showCouponPopUp"
      :coupons="couponList"
      :selected-index="selectedCouponIndex"
      :order-amount="productDetail?.price || seckillProductDetail?.seckillPrice || 0"
      :product-id="id"
      @select="onCouponSelect"
      @clear="onCouponClear"
    />

    <!-- 商品详情 -->
    <div class="detail-content card">
      <h3>商品详情</h3>
      <p>{{productDetail?.description || seckillProductDetail?.description || '暂无商品描述'}}</p>
    </div>

    <!-- 底部操作栏 -->
    <van-action-bar safe-area-inset-bottom>
      <van-action-bar-icon icon="chat-o" text="客服" />
      <van-action-bar-icon icon="cart-o" text="购物车" :badge="cartStore.items.length" @click="$router.push('/cart')" />
      <van-action-bar-icon icon="like-o" text="收藏" />
      <van-action-bar-button type="warning" text="加入购物车" @click="handleAddCart" />
      <van-action-bar-button type="danger" text="立即购买" @click="handleDirectBuy" />
    </van-action-bar>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { showToast } from 'vant'
import { toggleFavorite as apiToggleFavorite, getProductDetail } from '@/api/product'
import { getSeckillProductDetail } from '@/api/seckill'
import type { SeckillItem } from '@/types/seckill'
import { useRoute, useRouter } from 'vue-router'
import type { Product, Sku, SpecItem, SkuListItem } from '@/types/index'
import SkuPopUp from '@/components/skuPopUp.vue'
import CouponPopUp from '@/components/CouponPopUp.vue'
import { useUserStore } from '@/stores/user'
import { useFavoriteStore } from '@/stores/favorite'
import { useCartStore } from '@/stores/cart'
import { getProductCoupons, collectCoupon } from '@/api/coupon'
import type { Coupon } from '@/types/coupon'
import type { CartItem } from '@/types/cart'
import { calculateCouponDiscount } from '@/utils/coupon'
import { setSessionStorage, removeSessionStorage } from '@/utils/storage'

const router = useRouter()
const showSpec = ref(false)
const route = useRoute()
const id = Number(route.query.id)  
const productDetail = ref<Product>()
const seckillProductDetail = ref<SeckillItem>()
const selectedSpecText = ref('')
const currentAction = ref<'buy' | 'cart'>('buy') // 标记当前操作类型
const userStore = useUserStore()
const favoriteStore = useFavoriteStore()
const cartStore = useCartStore()
const showCouponPopUp = ref(false)
const couponList = ref<Coupon[]>([])
const selectedCouponIndex = ref(-1) // 选中的优惠券索引
const selectedCoupon = ref<Coupon | null>(null) // 选中的优惠券
const text = ref('立即购买')

// 收藏
const isFavorite=ref<boolean>(false)
const getFavorite=async()=>{
  if (!productDetail.value) {
    showToast('商品信息未加载')
    return
  }
  
  // 调用后端接口
  await apiToggleFavorite(productDetail.value.id)
  
  // 更新 store（会自动持久化到 localStorage）
  const newState = favoriteStore.toggleFavorite(productDetail.value)
  isFavorite.value = newState
  
  showToast(newState ? '收藏成功' : '取消收藏成功')
}

// 计算优惠价格
const discountedPrice = computed(() => {
  if (!selectedCoupon.value) return 0
  
  const originalPrice = productDetail.value?.price || seckillProductDetail.value?.seckillPrice || 0
  return calculateCouponDiscount(selectedCoupon.value, originalPrice)
})

// 获取该商品可用的店铺券/品牌券/品类券/单品券
const fetchCouponList = async () => {
  if (isNaN(id) || !id) return
  try {
    const res = await getProductCoupons(id)
    couponList.value = Array.isArray(res) ? res : (res as { data: Coupon[] }).data || []
  } catch (error) {
    console.error('获取优惠券列表失败:', error)
  }
}
// 点击优惠券入口
const handleCouponClick = () => {
  showCouponPopUp.value = true
}

// 优惠券选择回调
const onCouponSelect = async (coupon: Coupon, index: number) => {
  try {
    // 先调用接口领取优惠券（如果未领取）
    if (!coupon.collected) {
      const res: any = await collectCoupon(coupon.id)
      console.log('领取优惠券结果:', res)
      
      // 更新优惠券为已领取状态
      const couponIndex = couponList.value.findIndex((c) => c.id === coupon.id)
      if (couponIndex !== -1) {
        couponList.value[couponIndex].collected = true
      }
    }
    
    // 更新选择状态
    selectedCouponIndex.value = index
    selectedCoupon.value = coupon
    
    showToast(`已选择优惠券：${coupon.name}`)
    showCouponPopUp.value = false
    
  } catch (error: unknown) {
    console.error('领取优惠券失败:', error)
    const errorData = error as { code?: number; msg?: string }
    
    // 检查是否是未登录（401）
    if (errorData.code === 401) {
      showToast('请先登录')
      router.push({
        path: '/login',
        query: { redirect: router.currentRoute.value.fullPath }
      })
    } else {
      showToast(errorData.msg || '领取优惠券失败')
    }
  }
}

// 清除优惠券选择
const onCouponClear = () => {
  selectedCouponIndex.value = -1
  selectedCoupon.value = null
  showToast('已取消使用优惠券')
}

// 获取商品详情
const fetchProductDetail = async () => {
  try {
    if (isNaN(id)) {
      console.warn('商品ID无效:', id)
      return
    }
    const res = await getProductDetail(id)
    productDetail.value = res || undefined
    
    // 从 store 获取收藏状态（基于 localStorage 持久化）
    isFavorite.value = favoriteStore.isFavorite(productDetail.value?.id || 0)
  } catch (error) {
    console.error('获取商品详情失败:', error)
    showToast('获取商品详情失败')
  }
}

// 获取秒杀商品详情
const fetchSeckillProductDetail = async () => {
  try {
    if (isNaN(id)) {
      console.warn('秒杀商品 ID 无效:', id)
      return
    }
    const res = await getSeckillProductDetail(id)
    seckillProductDetail.value = res || undefined
  } catch (error) {
    console.error('获取秒杀商品详情失败:', error)
    showToast('获取秒杀商品详情失败')
  }
}

// 点击"立即购买" - 先打开规格选择弹窗
const handleDirectBuy = () => {
  currentAction.value = 'buy'
  showSpec.value = true
}

// 点击"加入购物车" - 先打开规格选择弹窗
const handleAddCart = () => {
  currentAction.value = 'cart'
  showSpec.value = true
  text.value = '加入购物车'
}

// 确认规格选择后处理
const handleBuy = async (data: { sku: Sku; quantity: number }) => {
  // 检查登录状态
  if (!userStore.isLoggedIn) {
    showToast('请先登录')
    router.push({
      path: '/login',
      query: {
        redirect: route.fullPath
      }
    })
    return
  }

  // 更新已选规格文本
  const specText = data.sku.specs?.map((spec: SpecItem) => `${spec.name}: ${spec.value}`).join(' / ') || ''
  selectedSpecText.value = specText

  if (currentAction.value === 'buy') {
    // 存储选中的店铺券到 sessionStorage，结算页可叠加平台券
    if (selectedCoupon.value) {
      setSessionStorage('storeCoupon', selectedCoupon.value)
    } else {
      removeSessionStorage('storeCoupon')
    }
    // 立即购买 - 跳转到结算页，携带商品信息
    router.push({
      path: '/checkout',
      query: {
        goodsId: (route.query.type === 'seckill' ? seckillProductDetail.value?.seckillId : productDetail.value?.id)?.toString() || '',
        skuId: data.sku.id?.toString() || '',
        count: data.quantity.toString(),
        type: route.query.type
      }
    })
  } else {
    // 加入购物车 - 直接调用 API 添加
    try {
      const goodsId = route.query.type === 'seckill' 
        ? (seckillProductDetail.value?.seckillId || 0)
        : (productDetail.value?.id || 0)
      
      const cartItem: CartItem = {
        cartId: Date.now(),
        goodsId: goodsId,
        skuId: data.sku.id || 0,
        name: route.query.type === 'seckill' 
          ? (seckillProductDetail.value?.title || '未命名商品')
          : (productDetail.value?.name || '未命名商品'),
        image: route.query.type === 'seckill'
          ? (seckillProductDetail.value?.mainImages?.[0] || seckillProductDetail.value?.image || '')
          : (productDetail.value?.mainImages?.[0] || productDetail.value?.image || ''),
        price: data.sku.price || 0,
        count: data.quantity,
        specText: specText,
        checked: true
      }
      
      await cartStore.addToCart(cartItem)
      showToast('加入购物车成功')
      showSpec.value = false
    } catch (error) {
      showToast('加入购物车失败')
    }
  }
}

onMounted(() => {
  if (route.query.type === 'seckill') {
    fetchSeckillProductDetail()
  } else {
    fetchProductDetail()
  }
  fetchCouponList()
})
</script>

<style scoped>
van-nav-bar .van-icon.active {
  color: #ee0a24;
}


.product-detail-page {
  padding-bottom: 100px;
  background: #f5f5f5;
}

.detail-swipe {
  height: 375px;
}

img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 14px;
}

/* 价格区域 */
.price-section {
  margin: 8px 0;
}

.price-row {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.original-price {
  font-size: 13px;
  color: #999;
  text-decoration: line-through;
}

.product-name {
  font-size: 16px;
  margin: 8px 0;
  font-weight: bold;
}

.product-desc {
  font-size: 12px;
  color: #999;
  margin-bottom: 8px;
}

.info-tags {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #666;
}

/* 秒杀条 */
.seckill-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(90deg, #ff4d4f 0%, #ff7875 100%);
  padding: 12px 16px;
  border-radius: 8px;
  color: #fff;
  margin: 8px 12px;
}

.seckill-left {
  flex: 1;
}

.price-drop {
  display: flex;
  align-items: baseline;
  gap: 4px;
  margin-bottom: 8px;
}

.price-drop .label {
  font-size: 14px;
  font-weight: 500;
}

.price-drop .currency {
  font-size: 18px;
  font-weight: bold;
}

.price-drop .amount {
  font-size: 28px;
  font-weight: bold;
  line-height: 1;
}

.price-drop .tag {
  background: #ffc53d;
  color: #ad6800;
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 500;
  margin-left: 4px;
}

.sold-info {
  display: flex;
  align-items: center;
  gap: 4px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  padding: 4px 10px;
  font-size: 13px;
}

.sold-label {
  color: rgba(255, 255, 255, 0.9);
}

.sold-count {
  font-weight: bold;
  font-size: 15px;
}

.sold-unit {
  color: rgba(255, 255, 255, 0.9);
}

.seckill-right {
  text-align: right;
  padding-left: 16px;
  border-left: 2px solid rgba(255, 255, 255, 0.3);
}

.subsidy-label {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 2px;
}

.subsidy-desc {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
}

/* 规格栏 */
.spec-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
}

.spec-label {
  color: #999;
  font-size: 13px;
}

.spec-text {
  flex: 1;
  font-size: 13px;
}

/* 优惠券提示 */
.coupon-tip {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
  font-size: 13px;
  color: #ee0a24;
}

/* 详情内容 */
.detail-content {
  margin-top: 8px;
}

.detail-content h3 {
  font-size: 15px;
  margin-bottom: 8px;
}

.detail-content p {
  font-size: 13px;
  color: #666;
  line-height: 1.8;
}
</style>
