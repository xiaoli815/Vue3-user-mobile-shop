<template>
  <div class="cart-page">
    <van-nav-bar title="购物车" fixed placeholder>
      <template #right>
        <span class="edit-btn" @click="toggleEdit">{{ isEdit ? '完成' : '管理' }}</span>
      </template>
    </van-nav-bar>

    <!-- 加载状态 -->
    <van-loading v-if="cartStore.loading" class="loading" />

    <!-- 购物车列表 -->
    <div v-else-if="cartStore.items.length > 0" class="cart-list">
      <div v-for="item in cartStore.items" :key="item.goodsId + '-' + item.skuId" class="cart-item">
        <!-- 商品复选框 -->
        <van-checkbox v-model="item.checked" class="cart-checkbox" @change="onCheckChange" />
        <img v-if="item.image" :src="item.image" class="cart-img" />
        <div v-else class="cart-img-placeholder">商品图</div>
        <div class="cart-info">
          <p class="cart-name">{{ item.name }}</p>
          <p class="cart-specs">{{ item.specText || '暂无规格' }}</p>
          <div class="cart-bottom">
            <span class="price">{{ formatPrice(item.price) }}</span>
            <van-stepper v-model="item.count" :min="1" integer @change="onCountChange(item)" />
          </div>
        </div>
        <van-icon v-if="isEdit" name="delete" class="delete-icon" @click="removeItem(item)" />
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else class="cart-empty">
      <van-empty description="购物车空空如也" />
    </div>

    <!-- 底部结算栏 -->
    <van-submit-bar
      v-if="cartStore.items.length > 0 && !cartStore.loading"
      :price="cartStore.totalPrice * 100"
      button-text="去结算"
      safe-area-inset-bottom
      @submit="goCheckout"
    >
      <!-- 全选按钮 -->
      <van-checkbox v-model="isAllChecked">全选</van-checkbox>
    </van-submit-bar>
  </div>
  <Tabbar></Tabbar>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast } from 'vant'
import Tabbar from '@/components/Tabbar.vue'
import { getProductDetail } from '@/api/product'
import { getSeckillProductDetail } from '@/api/seckill'
import type { CartItem } from '@/types/cart'
import type { SkuListItem } from '@/types/product'
import { useCartStore } from '@/stores/cart'
import { formatPrice } from '@/utils/price'

const route = useRoute()
const router = useRouter()
const isEdit = ref(false)
const cartStore = useCartStore()

// 切换编辑模式
const toggleEdit = () => {
  isEdit.value = !isEdit.value
}

// 全选状态
const isAllChecked = computed({
  get: () => cartStore.isAllChecked,
  set: val => {
    cartStore.toggleAllCheck(val)
  }
})

// 数量变化处理（纯本地操作）
const onCountChange = (item: CartItem) => {
  if (item.cartId) {
    cartStore.updateCount(item.cartId, item.count)
  }
}

// 选中状态变化处理
const onCheckChange = () => {
  // store 会自动保存到 localStorage
}

// 删除商品（纯本地操作）
const removeItem = (item: CartItem) => {
  if (item.cartId) {
    cartStore.removeItem(item.cartId)
    showToast('已删除')
  }
}

// 去结算
const goCheckout = () => {
  const selectedIds = cartStore.checkedItems.map(item => item.cartId).filter(id => id !== undefined)

  router.push({
    path: '/checkout',
    query: { cartIds: selectedIds.join(',') }
  })
}

// 获取商品详情并添加到购物车
const addToCart = async (goodsId: number, skuId: number, count: number, type: string) => {
  try {
    let newItem: CartItem | null = null

    if (type === 'seckill') {
      const res = await getSeckillProductDetail(goodsId)

      if (res && res.seckillId) {
        let sku: SkuListItem | undefined
        if (skuId && res.skuList?.length) {
          sku = res.skuList.find(
            s => s.skuId === Number(skuId) || (s as { id?: number }).id === Number(skuId)
          )
        }
        if (!sku && res.skuList?.length) {
          sku = res.skuList[0]
        }

        const specs = sku?.specs?.map(s => `${s.specName}: ${s.specValue}`).join(' / ') || ''

        newItem = {
          cartId: Date.now(),
          goodsId: res.seckillId,
          skuId: sku?.skuId || (sku as { id?: number })?.id || 0,
          name: res.title || '未命名商品',
          image: res.mainImages?.[0] || res.image || '',
          price: sku?.seckillPrice || res.seckillPrice || 0,
          count: count || 1,
          specText: specs || '暂无规格',
          checked: true
        }
      }
    } else {
      const res = await getProductDetail(goodsId)

      if (res && res.id) {
        let sku: SkuListItem | undefined
        if (skuId && res.skuList?.length) {
          sku = res.skuList.find(
            s => s.skuId === Number(skuId) || (s as { id?: number }).id === Number(skuId)
          )
        }
        if (!sku && res.skuList?.length) {
          sku = res.skuList[0]
        }
        const specs = sku?.specs?.map(s => `${s.specName}: ${s.specValue}`).join(' / ') || ''

        newItem = {
          cartId: Date.now(),
          goodsId: res.id,
          skuId: sku?.skuId || 0,
          name: res.name || '未命名商品',
          image: res.mainImages?.[0] || res.image || '',
          price: sku?.price || res.price || 0,
          count: count || 1,
          specText: specs || '暂无规格',
          checked: true
        }
      }
    }

    if (newItem) {
      await cartStore.addToCart(newItem)
      showToast('添加购物车成功')
    }
  } catch {
    showToast('添加购物车失败')
  }
}

onMounted(() => {
  // 检查是否有路由参数（从商品详情页跳转过来添加商品）
  const goodsId = route.query.goodsId
  const skuId = route.query.skuId
  const count = route.query.count
  const type = route.query.type

  if (goodsId) {
    addToCart(Number(goodsId), Number(skuId), Number(count) || 1, type as string)
  }
})
</script>

<style scoped>
.cart-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 50px;
}

.loading {
  padding: 40px 0;
}

.edit-btn {
  font-size: 14px;
  color: #666;
}

.cart-item {
  display: flex;
  align-items: center;
  padding: 12px;
  background: #fff;
  margin-bottom: 1px;
}

.cart-checkbox {
  margin-right: 10px;
}

.cart-img-placeholder {
  width: 80px;
  height: 80px;
  background: #f5f5f5;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  color: #999;
}

.cart-img {
  width: 80px;
  height: 80px;
  border-radius: 4px;
  object-fit: cover;
}

.cart-info {
  flex: 1;
  margin-left: 10px;
  overflow: hidden;
}

.cart-name {
  font-size: 14px;
  font-weight: 500;
  display: -webkit-box;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.cart-specs {
  font-size: 12px;
  color: #999;
  margin: 4px 0;
}

.cart-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
}

.van-submit-bar {
  bottom: 50px;
}

.delete-icon {
  font-size: 20px;
  color: #999;
  margin-left: 10px;
}

.delete-icon:active {
  color: #ee0a24;
}

.cart-empty {
  padding: 40px 0;
}
</style>
