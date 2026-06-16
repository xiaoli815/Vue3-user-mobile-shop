<template>
  <div class="checkout-page">
    <van-nav-bar title="确认订单" left-arrow @click-left="$router.back()" fixed placeholder />

    <!-- 收货地址 -->
    <div class="address-section card" v-if="address">
      <div class="address-info">
        <van-icon name="location-o" size="20" color="#ee0a24" />
        <div class="address-text">
          <p class="address-user">{{ address.receiverName }} <span>{{ address.phone }}</span></p>
          <p class="address-detail">{{ address.province }} {{ address.city }} {{ address.district }} {{ address.detail }}</p>
        </div>
      </div>
      <van-icon name="arrow" />
    </div>

    <!-- 商品列表 -->
    <div class="goods-section card" v-if="orderGoods.length">
      <div class="goods-item" v-for="item in orderGoods" :key="item.goodsId">
        <div class="goods-img-wrapper">
          <img v-if="item.image" :src="item.image" class="goods-img" />
          <div v-else class="goods-img-placeholder">商品图</div>
        </div>
        <div class="goods-info">
          <p class="goods-name">{{ item.name }}</p>
          <p class="goods-specs">{{ item.specText || '暂无规格' }}</p>
          <div class="goods-bottom">
            <span class="price">{{ formatPrice(getDiscountedPrice(item)) }}</span>
            <span class="count">x{{ item.count }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 商品列表占位（无数据时） -->
    <div class="goods-section card" v-else>
      <van-empty description="暂无商品信息" />
    </div>

    <!-- 店铺优惠券（从商品详情页带入，支持与平台券叠加） -->
    <div class="coupon-section card" v-if="storeCoupon">
      <span>店铺优惠券</span>
      <span class="coupon-value">
        -{{ formatPrice(storeCouponAmount) }}
        <van-icon name="cross" class="coupon-remove" @click.stop="removeStoreCoupon" />
      </span>
    </div>

    <!-- 平台优惠券 -->
    <div class="coupon-section card" @click="showCouponPopUp = true">
      <span>平台优惠券</span>
      <span class="coupon-value" v-if="platformCouponAmount > 0">
        -{{ formatPrice(platformCouponAmount) }} <van-icon name="arrow" />
      </span>
      <span class="coupon-value" v-else>领券享优惠 <van-icon name="arrow" /></span>
    </div>

    <!-- 优惠券弹窗 -->
    <CouponPopUp
      v-model:show="showCouponPopUp"
      :coupons="couponList"
      :selected-index="selectedCouponIndex"
      :order-amount="totalOriginalPrice"
      @select="onCouponSelect"
      @clear="onCouponClear"
    />

    <!-- 价格明细 -->
    <div class="price-section card">
      <div class="price-row">
        <span>商品合计</span>
        <span class="price">{{ formatPrice(totalOriginalPrice) }}</span>
      </div>
      <div class="price-row">
        <span>优惠券减免</span>
        <span class="price" style="color:#07c160" v-if="totalCouponAmount > 0">-{{ formatPrice(totalCouponAmount) }}</span>
        <span v-else>¥0.00</span>
      </div>
      <div class="price-row">
        <span>运费</span>
        <span>免运费</span>
      </div>
      <div class="price-row total">
        <span>实付金额</span>
        <span class="price" style="font-size:18px">{{ formatPrice(finalPayPrice) }}</span>
      </div>
    </div>

    <!-- 备注 -->
    <div class="remark-section card">
      <van-field v-model="remark" placeholder="订单备注（选填）" />
    </div>

    <!-- 底部提交 -->
    <van-submit-bar 
      :price="finalPayPrice * 100" 
      button-text="立即支付" 
      safe-area-inset-bottom
      :loading="submitting"
      @submit="handleSubmit"
    >
      <span>实付：<span class="price" style="font-size:14px">{{ formatPrice(finalPayPrice) }}</span></span>
    </van-submit-bar>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { showToast, showLoadingToast, closeToast } from 'vant'
import { useRoute, useRouter } from 'vue-router'
import { getProductDetail } from '@/api/product'
import { getSeckillProductDetail } from '@/api/seckill'
import { getAddressList } from '@/api/address'
import { preOrder } from '@/api/order'
import { getCouponList } from '@/api/coupon'
import type { OrderGoods } from '@/types/order'
import type { Address } from '@/types/address'
import type { Coupon } from '@/types/coupon'
import type { SkuListItem } from '@/types/product'
import CouponPopUp from '@/components/CouponPopUp.vue'
import { useOrderStore } from '@/stores/order'
import { useCartStore } from '@/stores/cart'
import { formatPrice, calculateTotalPrice } from '@/utils/price'
import { calculateCouponDiscount, calculateItemDiscountedPrice } from '@/utils/coupon'
import { getSessionStorage, removeSessionStorage, setSessionStorage } from '@/utils/storage'

const orderStore = useOrderStore()
const cartStore = useCartStore()

const route = useRoute()
const router = useRouter()

// 订单商品列表
const orderGoods = ref<OrderGoods[]>([])
const address = ref<Address | null>(null)
const remark = ref('')
const submitting = ref(false)
const loading = ref(true)
const totalOriginalPrice = ref(0)

// 优惠券相关
const showCouponPopUp = ref(false)
const allCoupons = ref<Coupon[]>([])
const selectedCouponIndex = ref(-1)
const selectedCoupon = ref<Coupon | null>(null)
const platformCouponAmount = ref(0)

// 店铺券（从商品详情页带入，与平台券叠加）
const storeCoupon = ref<Coupon | null>(null)
const storeCouponAmount = ref(0)

// 平台券列表（仅平台券）
const couponList = computed(() => {
  return allCoupons.value.filter(c => !c.category || c.category === '平台券')
})

// 价格计算（仅用于商品详情页直接结算）
const computedTotalPrice = computed(() => {
  return orderGoods.value.reduce((sum, item) => sum + (item.price * item.count), 0)
})

// 计算总优惠金额（店铺券 + 平台券叠加）
const totalCouponAmount = computed(() => storeCouponAmount.value + platformCouponAmount.value)

// 计算最终支付金额
const finalPayPrice = computed(() => {
  return Math.max(totalOriginalPrice.value - totalCouponAmount.value, 0)
})

// 计算单个商品经过店铺优惠后的价格
const getDiscountedPrice = (item: OrderGoods): number => {
  return calculateItemDiscountedPrice(
    item.price,
    item.count,
    totalOriginalPrice.value,
    storeCouponAmount.value
  )
}

// 获取优惠券列表
const fetchCouponList = async () => {
  try {
    const res = await getCouponList()
    allCoupons.value = Array.isArray(res) ? res : (res as unknown as { data: Coupon[] }).data || []
  } catch (error) {
    console.error('获取优惠券列表失败:', error)
  }
}

// 选择优惠券（平台券）
const onCouponSelect = (coupon: Coupon, index: number) => {
  selectedCouponIndex.value = index
  selectedCoupon.value = coupon
  
  // 使用工具函数计算平台券优惠金额
  platformCouponAmount.value = calculateCouponDiscount(coupon, totalOriginalPrice.value)
  showToast(`已选择平台券：${coupon.name}`)
}

// 取消选择优惠券
const onCouponClear = () => {
  selectedCouponIndex.value = -1
  selectedCoupon.value = null
  platformCouponAmount.value = 0
  showToast('已取消使用平台券')
}

// 店铺券相关
const calcStoreCouponAmount = (coupon: Coupon) => {
  return calculateCouponDiscount(coupon, totalOriginalPrice.value)
}

const removeStoreCoupon = () => {
  storeCoupon.value = null
  storeCouponAmount.value = 0
  removeSessionStorage('storeCoupon')
  showToast('已移除店铺券')
}

// 从 sessionStorage 读取店铺券
const loadStoreCoupon = () => {
  const stored = getSessionStorage<Coupon>('storeCoupon')
  if (stored) {
    storeCoupon.value = stored
    storeCouponAmount.value = calcStoreCouponAmount(stored)
  }
}

// 获取商品详情数据
const fetchGoodsDetail = async (goodsId: number, skuId: number, count: number) => {
  try {
    loading.value = true
    const response = await getProductDetail(goodsId)
    const res = response
    
    if (res && res.id) {
      let sku: SkuListItem | undefined
      if (skuId && res.skuList?.length) {
        sku = res.skuList.find(s => s.skuId === Number(skuId) || (s as { id?: number }).id === Number(skuId))
      }
      const specs = sku?.specs?.map(s => `${s.specName}: ${s.specValue}`).join(' / ') || ''
      
      orderGoods.value = [{
        goodsId: res.id,
        name: res.name || '未命名商品',
        image: res.mainImages?.[0] || res.image || '',
        price: sku?.price || res.price || 0,
        count: count || 1,
        specText: specs || '暂无规格'
      }]
      
      // 自动计算价格
      totalOriginalPrice.value = computedTotalPrice.value
    }
  } catch (error) {
    showToast('获取商品信息失败')
  } finally {
    loading.value = false
  }
}

// 获取秒杀商品详情数据
const fetchSeckillGoodsDetail = async (seckillId: number, skuId: number, count: number) => {
  try {
    loading.value = true
    const res = await getSeckillProductDetail(seckillId)
    
    if (res && res.seckillId) {
      let sku: SkuListItem | undefined
      if (skuId && res.skuList?.length) {
        sku = res.skuList.find(s => s.skuId === Number(skuId) || (s as { id?: number }).id === Number(skuId))
      }
      
      const specs = sku?.specs?.map(s => `${s.specName}: ${s.specValue}`).join(' / ') || ''
      
      orderGoods.value = [{
        goodsId: res.seckillId,
        name: res.title || '未命名商品',
        image: res.mainImages?.[0] || res.image || '',
        price: sku?.seckillPrice || res.seckillPrice || 0,
        count: count || 1,
        specText: specs || '暂无规格'
      }]
      
      // 自动计算价格
      totalOriginalPrice.value = computedTotalPrice.value
    }
  } catch (error) {
    showToast('获取秒杀商品信息失败')
  } finally {
    loading.value = false
  }
}

// 获取地址列表
const fetchAddressList = async () => {
  try {
    const res = await getAddressList()
    if (res && Array.isArray(res)) {
      address.value = res[0] || null
    }
  } catch (error) {
    showToast('获取地址列表失败')
  }
}

// 从购物车删除已购买的商品
const removePurchasedItemsFromCart = () => {
  const cartIds = route.query.cartIds
  if (cartIds) {
    const cartIdStr = Array.isArray(cartIds) ? cartIds[0] : cartIds
    if (cartIdStr) {
      const purchasedCartIds = cartIdStr.split(',').map(Number)
      
      // 使用 cartStore 删除已购买的商品
      purchasedCartIds.forEach(cartId => {
        if (cartId) {
          cartStore.removeItem(cartId)
        }
      })
    }
  }
}

// 提交订单
const handleSubmit = async () => {
  if (!address.value) {
    showToast('请选择收货地址')
    return
  }
  if (orderGoods.value.length === 0) {
    showToast('订单商品不能为空')
    return
  }

  submitting.value = true
  showLoadingToast({ message: '提交中...', forbidClick: true })

  // 模拟提交订单
  setTimeout(() => {
    closeToast()
    submitting.value = false
    showToast('订单提交成功')
    
    // 删除购物车中已购买的商品
    removePurchasedItemsFromCart()
    
    // 生成订单数据
    const orderData = {
      orderId: 'SK' + Date.now(),
      createTime: new Date().toLocaleString(),
      status: '待付款',
      goods: orderGoods.value,
      totalAmount: finalPayPrice.value,
      address: address.value
    }
    
    // 1. 保存到 orderStore（会自动同步到 localStorage）
    orderStore.addOrder(orderData)
    
    // 2. 使用 sessionStorage 传递订单数据（用于页面跳转）
    setSessionStorage('recentOrder', orderData)
    
    router.replace({
      path: '/orders'
    })
  }, 1000)
}

onMounted(async () => {
  // 读取从商品详情页带入的店铺券
  loadStoreCoupon()
  // 先获取地址列表
  await fetchAddressList()
  // 获取优惠券列表
  await fetchCouponList()

  // 从商品详情页跳转来 - 同时支持路径参数和查询参数
  const goodsId = route.params.id || route.query.goodsId
  const skuId = route.query.skuId
  const count = route.query.count
  const type = route.query.type
  const cartIds = route.query.cartIds

  if (cartIds) {
    // 从购物车结算，调用订单预览接口
    try {
      const cartIdStr = Array.isArray(cartIds) ? cartIds[0] : cartIds
      if (cartIdStr) {
        const res = await preOrder({
          cartIds: cartIdStr.split(',').map(Number),
          addressId: address.value?.id
        })
        
        if (res) {
          orderGoods.value = res.goodsList || []
          totalOriginalPrice.value = res.totalOriginalPrice || 0
          platformCouponAmount.value = res.discountPrice || 0
        }
      }
    } catch (error) {
      showToast('获取订单预览失败')
    }
  } else if (goodsId) {
    // 从商品详情页跳转，根据类型判断是秒杀商品还是普通商品
    if (type === 'seckill') {
      await fetchSeckillGoodsDetail(Number(goodsId), Number(skuId), Number(count) || 1)
    } else {
      await fetchGoodsDetail(Number(goodsId), Number(skuId), Number(count) || 1)
    }
  } else {
    loading.value = false
  }
})
</script>

<style scoped>
.checkout-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 50px;
}

.address-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 8px;
}

.address-info {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  flex: 1;
}

.address-user {
  font-size: 14px;
  font-weight: bold;
}

.address-user span {
  font-weight: normal;
  font-size: 12px;
  color: #666;
  margin-left: 8px;
}

.address-detail {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

.goods-section {
  margin-top: 8px;
}

.goods-item {
  display: flex;
  gap: 10px;
  padding: 8px 0;
  border-bottom: 1px solid #f5f5f5;
}

.goods-item:last-child {
  border-bottom: none;
}

.goods-img-placeholder {
  width: 70px;
  height: 70px;
  background: #f5f5f5;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  color: #999;
}

.goods-img {
  width: 70px;
  height: 70px;
  border-radius: 4px;
  object-fit: cover;
}

.goods-info {
  flex: 1;
}

.goods-name {
  font-size: 13px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.goods-specs {
  font-size: 11px;
  color: #999;
  margin: 4px 0;
}

.goods-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.coupon-section {
  margin-top: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
}

.coupon-value {
  color: #ee0a24;
}

.coupon-remove {
  margin-left: 4px;
  font-size: 12px;
  color: #999;
  cursor: pointer;
}

.price-section {
  margin-top: 8px;
}

.price-row {
  display: flex;
  justify-content: space-between;
  padding: 4px 0;
  font-size: 13px;
}

.price-row.total {
  font-weight: bold;
  font-size: 14px;
  border-top: 1px solid #eee;
  padding-top: 8px;
  margin-top: 4px;
}

.remark-section {
  margin-top: 8px;
}

.van-submit-bar {
  bottom: 0px;
}
</style>