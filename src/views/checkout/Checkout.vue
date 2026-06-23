<template>
  <div class="checkout-page">
    <van-nav-bar title="确认订单" left-arrow fixed placeholder @click-left="$router.back()" />

    <div v-if="address" class="address-section card" @click="router.push({ path: '/address' })">
      <div class="address-info" >
        <van-icon name="location-o" size="20" color="#ee0a24" />
        <div class="address-text">
          <p class="address-user">
            {{ address.receiverName }} <span>{{ address.phone }}</span>
          </p>
          <p class="address-detail">
            {{ address.province }} {{ address.city }} {{ address.district }} {{ address.detail }}
          </p>
        </div>
      </div>
      <van-icon name="arrow" />
    </div>

    <div v-if="orderGoods.length" class="goods-section card">
      <div v-for="item in orderGoods" :key="item.goodsId" class="goods-item">
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

    <div v-else class="goods-section card">
      <van-empty description="暂无商品信息" />
    </div>

    <div v-if="appliedCoupons.store" class="coupon-section card">
      <span>店铺优惠券</span>
      <span class="coupon-value">
        -{{ formatPrice(appliedCoupons.store.discount) }}
        <van-icon name="cross" class="coupon-remove" @click.stop="removeStoreCoupon" />
      </span>
    </div>

    <div v-if="appliedCoupons.brand" class="coupon-section card">
      <span>品牌优惠券</span>
      <span class="coupon-value">
        -{{ formatPrice(appliedCoupons.brand.discount) }}
      </span>
    </div>

    <div class="coupon-section card" @click="showCouponPopUp = true">
      <span>平台优惠券</span>
      <span v-if="appliedCoupons.platform" class="coupon-value">
        -{{ formatPrice(appliedCoupons.platform.discount) }} <van-icon name="arrow" />
      </span>
      <span v-else class="coupon-value">领券享优惠 <van-icon name="arrow" /></span>
    </div>

    <CouponPopUp
      v-model:show="showCouponPopUp"
      :coupons="usableCoupons"
      :selected-index="selectedCouponIndex"
      :order-amount="totalOriginalPrice"
      @select="onCouponSelect"
    />

    <div class="price-section card">
      <div class="price-row">
        <span>商品合计</span>
        <span class="price">{{ formatPrice(totalOriginalPrice) }}</span>
      </div>
      <div v-if="priceBreakdown.storeDiscount > 0" class="price-row">
        <span>店铺券</span>
        <span class="price discount">-{{ formatPrice(priceBreakdown.storeDiscount) }}</span>
      </div>
      <div v-if="priceBreakdown.brandDiscount > 0" class="price-row">
        <span>品牌券</span>
        <span class="price discount">-{{ formatPrice(priceBreakdown.brandDiscount) }}</span>
      </div>
      <div v-if="priceBreakdown.platformDiscount > 0" class="price-row">
        <span>平台券</span>
        <span class="price discount">-{{ formatPrice(priceBreakdown.platformDiscount) }}</span>
      </div>
      <div class="price-row">
        <span>运费</span>
        <span v-if="freeAmount > 0" class="shipping-tip">
          <span class="price">{{ formatPrice(shippingFee) }}</span>
          <span class="free-tip">（再买{{ formatPrice(freeAmount) }}包邮）</span>
        </span>
        <span v-else class="shipping-free">免运费</span>
      </div>
      <div class="price-row total">
        <span>实付金额</span>
        <span class="price" style="font-size: 18px">{{ formatPrice(priceBreakdown.finalPrice) }}</span>
      </div>
    </div>

    <div class="remark-section card">
      <van-field v-model="remark" placeholder="订单备注（选填）" />
    </div>

    <van-submit-bar
      :price="priceBreakdown.finalPrice * 100"
      button-text="立即支付"
      safe-area-inset-bottom
      :loading="submitting"
      @submit="handleSubmit"
    >
      <span class="submit-bar-price">实付：<span class="price">{{formatPrice(priceBreakdown.finalPrice)}}</span></span>
    </van-submit-bar>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { showToast, showLoadingToast, closeToast } from 'vant'
import { useRoute, useRouter } from 'vue-router'
import { getProductDetail } from '@/api/product'
import { getSeckillProductDetail } from '@/api/seckill'
import { getAddressList } from '@/api/address'
import {  submitOrder } from '@/api/order'
import { calculateShipping } from '@/api/shipping'
import { getCouponList } from '@/api/coupon'
import type { OrderGoods } from '@/types/order'
import type { Address } from '@/types/address'
import type { Coupon } from '@/types/coupon'
import type { SkuListItem } from '@/types/product'
import CouponPopUp from '@/components/CouponPopUp.vue'
import { useOrderStore } from '@/stores/order'
import { useCartStore } from '@/stores/cart'
import { formatPrice } from '@/utils/price'
import {
  calculateItemDiscountedPrice,
  applySingleCoupon,
  calculatePriceBreakdown,
  getGoodsIdsFromOrder,
  filterUsableCoupons,
  type AppliedCoupons,
  type PriceBreakdown,
 
} from '@/utils/coupon'
import { getSessionStorage, removeSessionStorage } from '@/utils/storage'

const orderStore = useOrderStore()
const cartStore = useCartStore()
const route = useRoute()
const router = useRouter()

const orderGoods = ref<OrderGoods[]>([])
const address = ref<Address | null>(null)
const remark = ref('')
const submitting = ref(false)
const loading = ref(true)
const totalOriginalPrice = ref(0)

const showCouponPopUp = ref(false)
const allCoupons = ref<Coupon[]>([])
const selectedCouponIndex = ref(-1)

// 运费相关
const shippingFee = ref(0)        // 运费（分）
const freeAmount = ref(0)         // 还差多少包邮（分）

const appliedCoupons = ref<AppliedCoupons>({
  store: null,
  platform: null,
  brand: null,
  category: null
})
// 计算商品ID列表
const goodsIds = computed(() => getGoodsIdsFromOrder(orderGoods.value))
// 过滤可用优惠券
const usableCoupons = computed(() => {
  return filterUsableCoupons(allCoupons.value, totalOriginalPrice.value, goodsIds.value)
})
// 计算订单价格（含运费）
const priceBreakdown = computed<PriceBreakdown>(() => {
  const base = calculatePriceBreakdown(totalOriginalPrice.value, appliedCoupons.value)
  return {
    ...base,
    shipping: shippingFee.value,
    finalPrice: base.finalPrice + shippingFee.value
  }
})
// 计算商品折扣后的价格
const getDiscountedPrice = (item: OrderGoods): number => {
  return calculateItemDiscountedPrice(
    item.price,
    item.count,
    totalOriginalPrice.value,
    priceBreakdown.value.totalDiscount
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
// 选择优惠券
const onCouponSelect = (coupon: Coupon, index: number) => {
  selectedCouponIndex.value = index
  const result = applySingleCoupon(coupon, totalOriginalPrice.value, goodsIds.value)

  if (!result.valid) {
    showToast(result.reason || '优惠券不可用')
    return
  }

  appliedCoupons.value.platform = result
  showToast(`已选择平台券：${coupon.name}`)
}

// 加载店铺优惠券
const loadStoreCoupon = () => {
  const stored = getSessionStorage<Coupon>('storeCoupon')
  if (stored) {
    const result = applySingleCoupon(stored, totalOriginalPrice.value, goodsIds.value)
    if (result.valid) {
      appliedCoupons.value.store = result
    } else {
      removeSessionStorage('storeCoupon')
      showToast('店铺优惠券已失效')
    }
  }
}
// 移除店铺优惠券
const removeStoreCoupon = () => {
  appliedCoupons.value.store = null
  removeSessionStorage('storeCoupon')
  showToast('已移除店铺券')
}

// 计算运费
const fetchShippingFee = async () => {
  if (!address.value || orderGoods.value.length === 0) return
  try {
    const res = await calculateShipping({
      addressId: address.value.id,
      items: orderGoods.value.map(item => ({
        goodsId: item.goodsId || 0,
        skuId: 0,
        count: item.count,
        price: item.price
      }))
    })
    if (res && res.code === 200 && res.data) {
      shippingFee.value = res.data.fee / 100       // 后端返回分，转为元
      freeAmount.value = res.data.freeAmount / 100
    }
  } catch {
    console.error('获取运费失败')
  }
}

// 监听地址变化 → 重新计算运费
watch(() => address.value?.id, () => {
  fetchShippingFee()
})

// 监听商品变化 → 重新计算运费
watch(() => orderGoods.value.map(g => g.goodsId + '_' + g.count).join(','), () => {
  fetchShippingFee()
})
// 监听订单价格变化
watch([totalOriginalPrice, goodsIds], () => {
  // 应用店铺优惠券
  if (appliedCoupons.value.store) {
    const result = applySingleCoupon(
      appliedCoupons.value.store.coupon,
      totalOriginalPrice.value,
      goodsIds.value
    )
    if (!result.valid) {
      appliedCoupons.value.store = null
      removeSessionStorage('storeCoupon')
      showToast('店铺优惠券已失效')
    } else {
      appliedCoupons.value.store = result
    }
  }
  // 应用平台优惠券
  if (appliedCoupons.value.platform) {
    const result = applySingleCoupon(
      appliedCoupons.value.platform.coupon,
      totalOriginalPrice.value,
      goodsIds.value
    )
    if (!result.valid) {
      appliedCoupons.value.platform = null
      selectedCouponIndex.value = -1
      showToast('平台优惠券已失效')
    } else {
      appliedCoupons.value.platform = result
    }
  }
})
// 获取商品详情
const fetchGoodsDetail = async (goodsId: number, skuId: number, count: number) => {
  try {
    loading.value = true
    const res = await getProductDetail(goodsId)
    if (res && res.id) {
      let sku: SkuListItem | undefined
      if (skuId && res.skuList?.length) {
        // 查找指定SKU
        sku = res.skuList.find(
          s => s.skuId === Number(skuId) || (s as { id?: number }).id === Number(skuId)
        )
      }
      // 处理规格
      const specs = sku?.specs?.map(s => `${s.specName}: ${s.specValue}`).join(' / ') || ''
      orderGoods.value = [
        {
          goodsId: res.id,
          name: res.name || '未命名商品',
          image: res.mainImages?.[0] || res.image || '',
          price: sku?.price || res.price || 0,
          count: count || 1,
          specText: specs || '暂无规格'
        }
      ]
      // 计算订单总金额
      totalOriginalPrice.value = orderGoods.value.reduce((sum, item) => sum + item.price * item.count, 0)
    }
  } catch {
    showToast('获取商品信息失败')
  } finally {
    loading.value = false
  }
}
// 获取秒杀商品详情
const fetchSeckillGoodsDetail = async (seckillId: number, skuId: number, count: number) => {
  try {
    loading.value = true
    const res = await getSeckillProductDetail(seckillId)
    // 处理秒杀商品详情
    if (res && res.seckillId) {
      let sku: SkuListItem | undefined
      if (skuId && res.skuList?.length) {
        // 查找指定SKU
        sku = res.skuList.find(
          s => s.skuId === Number(skuId) || (s as { id?: number }).id === Number(skuId)
        )
      }
      // 处理规格
      const specs = sku?.specs?.map(s => `${s.specName}: ${s.specValue}`).join(' / ') || ''
      orderGoods.value = [
        {
          goodsId: res.seckillId,
          name: res.title || '未命名商品',
          image: res.mainImages?.[0] || res.image || '',
          price: sku?.seckillPrice || res.seckillPrice || 0,
          count: count || 1,
          specText: specs || '暂无规格'
        }
      ]
        // 计算订单总金额
      totalOriginalPrice.value = orderGoods.value.reduce((sum, item) => sum + item.price * item.count, 0)
    }
  } catch {
    showToast('获取秒杀商品信息失败')
  } finally {
    loading.value = false
  }
}
// 获取地址列表
const fetchAddressList = async () => {
  try {
    const res = await getAddressList()
      const list = (res as any).data as Address[]
      // 优先取默认地址，否则取第一个
      address.value = list.find(a => a.isDefault) || list[0] || null
  
  } catch {
    showToast('获取地址列表失败')
  }
}
// 移除已购买商品从购物车
const removePurchasedItemsFromCart = () => {
  const cartIds = route.query.cartIds
  if (cartIds) {
    const cartIdStr = Array.isArray(cartIds) ? cartIds[0] : cartIds
    if (cartIdStr) {
      const purchasedCartIds = cartIdStr.split(',').map(Number)
      purchasedCartIds.forEach(cartId => {
        if (cartId) {
          cartStore.removeItem(cartId)
        }
      })
    }
  }
}

const handleSubmit = async () => {
  if (!address.value) {
    showToast('请选择收货地址')
    return
  }
  if (orderGoods.value.length === 0) {
    showToast('请选择商品')
    return
  }

  submitting.value = true
  showLoadingToast({ message: '提交中...', forbidClick: true })

  try {
    // 应用优惠券
    const couponIds: number[] = []
    if (appliedCoupons.value.store) couponIds.push(appliedCoupons.value.store.coupon.id)
    if (appliedCoupons.value.platform) couponIds.push(appliedCoupons.value.platform.coupon.id)
    if (appliedCoupons.value.brand) couponIds.push(appliedCoupons.value.brand.coupon.id)
      // 提交订单
    const submitResult = await submitOrder({
      goods: orderGoods.value.map(item => ({
        goodsId: item.goodsId,
        name: item.name,
        image: item.image,
        price: item.price,
        count: item.count,
        specText: item.specText || '暂无规格'
      })),
      addressId: address.value.id,
      totalAmount: priceBreakdown.value.finalPrice,
      remark: remark.value
    })

    if (submitResult) {
      const orderData = {
        orderId: String(submitResult.orderId),
        createTime: new Date().toISOString(),
        status: 'pending_pay',
        goods: orderGoods.value,
        totalAmount: priceBreakdown.value.finalPrice,
        address: address.value
      }
      orderStore.addOrder(orderData)
    }

    removePurchasedItemsFromCart()
    removeSessionStorage('storeCoupon')

    showToast({ message: '下单成功', type: 'success' })

    setTimeout(() => {
      router.push('/orders')
    }, 1500)
  } catch {
    showToast('提交订单失败')
  } finally {
    submitting.value = false
    closeToast()
  }
}

onMounted(async () => {
  // 初始化地址列表和优惠券列表
  await Promise.allSettled([fetchAddressList(), fetchCouponList()])

  const type = route.query.type
  const cartIds = route.query.cartIds

  if (cartIds) {
    // 从购物车结算
    const cartIdStr = Array.isArray(cartIds) ? cartIds[0] : cartIds
    if (cartIdStr) {
      const ids = cartIdStr.split(',').map(Number)
      // 确保购物车数据已加载
      await cartStore.loadFromServer()
      const selectedItems = cartStore.items.filter(item => ids.includes(item.cartId || 0))
      orderGoods.value = selectedItems.map(item => ({
        goodsId: item.goodsId || 0,
        skuId: item.skuId || 0,
        name: item.name || '未命名商品',
        image: item.image || '',
        price: item.price || 0,
        count: item.count || 1,
        specText: item.specText || '暂无规格'
      }))
      totalOriginalPrice.value = orderGoods.value.reduce((sum, item) => sum + item.price * item.count, 0)
    }
  } else if (type === 'seckill') {
    const seckillId = Number(route.query.goodsId)
    const skuId = Number(route.query.skuId)
    const count = Number(route.query.count) || 1
    await fetchSeckillGoodsDetail(seckillId, skuId, count)
  } else if (route.query.goodsId) {
    const goodsId = Number(route.query.goodsId)
    const skuId = Number(route.query.skuId)
    const count = Number(route.query.count) || 1
    await fetchGoodsDetail(goodsId, skuId, count)
  }
// 加载店铺优惠券
  loadStoreCoupon()
  // 地址和商品都加载完成后，计算运费
  fetchShippingFee()
})
</script>

<style scoped>
.checkout-page {
  padding-top: 46px;
  padding-bottom: 100px;
  background: #f5f5f5;
}

.card {
  background: #fff;
  margin: 8px;
  border-radius: 8px;
  padding: 12px;
}

.address-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.address-info {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.address-text {
  flex: 1;
}

.address-user {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 4px;
}

.address-user span {
  margin-left: 8px;
  font-weight: normal;
  font-size: 14px;
  color: #666;
}

.address-detail {
  font-size: 14px;
  color: #666;
  line-height: 1.5;
}

.goods-section {
  padding: 0;
}

.goods-item {
  display: flex;
  padding: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.goods-item:last-child {
  border-bottom: none;
}

.goods-img-wrapper {
  width: 80px;
  height: 80px;
  flex-shrink: 0;
}

.goods-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 4px;
}

.goods-img-placeholder {
  width: 100%;
  height: 100%;
  background: #f5f5f5;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: #999;
}

.goods-info {
  flex: 1;
  margin-left: 12px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.goods-name {
  font-size: 14px;
  font-weight: bold;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  line-clamp: 2;
  -webkit-box-orient: vertical;
}

.goods-specs {
  font-size: 12px;
  color: #999;
}

.goods-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.price {
  color: #ee0a24;
  font-weight: bold;
}

.discount {
  color: #07c160;
}

.count {
  font-size: 12px;
  color: #999;
}

.coupon-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.coupon-value {
  color: #ee0a24;
  font-size: 14px;
}

.coupon-remove {
  margin-left: 8px;
}

.price-section {
  padding: 12px;
}

.price-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-size: 14px;
}

.price-row:last-child {
  margin-bottom: 0;
}

.price-row.total {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px dashed #e0e0e0;
}

.remark-section {
  margin-bottom: 8px;
}

.submit-bar-price {
  display: flex;
  align-items: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 14px;
  max-width: 160px;
  flex-shrink: 1;
  min-width: 0;
}

.submit-bar-price .price {
  font-size: clamp(12px, 3vw, 18px);
  font-weight: bold;
  color: #ee0a24;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}

:deep(.van-submit-bar__text) {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>