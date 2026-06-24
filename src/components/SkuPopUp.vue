<template>
  <van-popup
    v-model:show="visible"
    position="bottom"
    round
    close-on-click-overlay
    @click-overlay="onClose"
  >
    <div class="sku-popup">
      <!-- 顶部商品信息 -->
      <div class="sku-header">
        <div class="sku-image">
          <img :src="product.image" alt="" />
        </div>
        <div class="sku-info">
          <p class="sku-price">
            <span class="price-symbol">¥</span>
            <span class="price-value">{{ finalPrice }}</span>
            <span v-if="discountPrice > 0" class="price-discount">已优惠 ¥{{ discountPrice }}</span>
          </p>
          <p v-if="selectedSku" class="sku-stock">库存：{{ selectedSku.stock }}件</p>
          <p v-if="selectedSpecText" class="sku-selected">已选：{{ selectedSpecText }}</p>
        </div>
        <van-icon name="close" class="close-btn" @click="onClose" />
      </div>

      <!-- 规格选择 -->
      <div class="sku-body">
        <div v-for="group in specGroups" :key="group.name" class="spec-group">
          <p class="spec-group-name">{{ group.name }}</p>
          <div class="spec-tags">
            <span
              v-for="val in group.values"
              :key="val"
              class="spec-tag"
              :class="{
                active: selectedSpecs[group.name] === val,
                disabled: !isSpecAvailable(group.name, val)
              }"
              @click="selectSpec(group.name, val)"
            >
              {{ val }}
            </span>
          </div>
        </div>

        <!-- 数量选择 -->
        <div class="quantity-row">
          <span class="quantity-label">数量</span>
          <div class="quantity-control">
            <van-icon
              name="minus"
              class="qty-btn"
              :class="{ disabled: quantity <= 1 }"
              @click="quantity > 1 && quantity--"
            />
            <span class="qty-value">{{ quantity }}</span>
            <van-icon
              name="plus"
              class="qty-btn"
              :class="{
                disabled:
                  selectedSku &&
                  quantity >=
                    (isSeckill ? Math.min(limitCount, selectedSku.stock) : selectedSku.stock)
              }"
              @click="onIncrease"
            />
          </div>
        </div>
        <!-- 限购提示 -->
        <div v-if="isSeckill" class="limit-tip">
          <span class="limit-text">限购 {{ limitCount }} 件</span>
        </div>
      </div>

      <!-- 确认按钮 -->
      <div class="sku-footer">
        <van-button type="danger" round block :disabled="!selectedSku" @click="onConfirm">
          {{ confirmText }}
        </van-button>
      </div>
    </div>
  </van-popup>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { Sku } from '@/types/index'

import type { skuProduct } from '@/types/product'

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    product: skuProduct
    confirmText: string
    discountPrice?: number
  }>(),
  {
    discountPrice: 0
  }
)

// confirmText 的默认值
const confirmText = computed(() => {
  return props.confirmText || '加入购物车'
})

const emit = defineEmits<{
  (_: 'update:modelValue', __: boolean): void
  (_: 'confirm', __: { sku: Sku; quantity: number }): void
  (_: 'select', __: string): void
}>()

// 使用计算属性处理 v-model
const visible = computed({
  get: () => props.modelValue,
  set: val => emit('update:modelValue', val)
})

// 获取 SKU 列表（兼容普通商品和秒杀商品数据格式）
const skuList = computed(() => {
  if (props.product.skus?.length) return props.product.skus
  if (props.product.skuList?.length) {
    return props.product.skuList.map(sl => ({
      id: sl.skuId,
      productId: props.product.id || props.product.seckillId || 0,
      specs: sl.specs.map(s => ({ name: s.specName, value: s.specValue })),
      price: sl.price || sl.seckillPrice || props.product.price || props.product.seckillPrice || 0,
      stock: sl.stock || sl.remainStock || 0,
      image: props.product.image
    }))
  }
  return []
})

// 提取所有规格分组
const specGroups = computed(() => {
  const map = new Map<string, Set<string>>()
  skuList.value.forEach(sku => {
    sku.specs.forEach(spec => {
      if (!map.has(spec.name)) map.set(spec.name, new Set())
      map.get(spec.name)!.add(spec.value)
    })
  })
  return Array.from(map.entries()).map(([name, values]) => ({
    name,
    values: Array.from(values)
  }))
})

// 当前选中的规格
const selectedSpecs = ref<Record<string, string>>({})
const quantity = ref(1)

// 判断是否为秒杀商品
const isSeckill = computed(() => {
  return !!props.product.seckillId || !!props.product.seckillPrice
})

// 获取限购数量
const limitCount = computed(() => {
  return props.product.limitCount || 1
})

// 匹配当前选中规格对应的 SKU
const selectedSku = computed(() => {
  const selected = selectedSpecs.value
  const keys = Object.keys(selected)
  if (keys.length === 0) return null
  return (
    skuList.value.find(sku => {
      return sku.specs.every(spec => selected[spec.name] === spec.value)
    }) || null
  )
})

// 计算最终价格（原价 - 优惠金额）
const finalPrice = computed(() => {
  const originalPrice =
    selectedSku.value?.price || props.product.price || props.product.seckillPrice || 0
  return Math.max(originalPrice - props.discountPrice, 0)
})

// 已选规格文本
const selectedSpecText = computed(() => {
  return Object.entries(selectedSpecs.value)
    .map(([name, val]) => `${name}: ${val}`)
    .join(' / ')
})

// 判断某个规格值是否可选
function isSpecAvailable(specName: string, specValue: string) {
  const current = { ...selectedSpecs.value, [specName]: specValue }
  const otherKeys = Object.keys(current).filter(k => k !== specName)
  return skuList.value.some(sku => {
    const matchCurrent = sku.specs.some(s => s.name === specName && s.value === specValue)
    const matchOthers = otherKeys.every(key => {
      const val = current[key]
      if (!val) return true
      return sku.specs.some(s => s.name === key && s.value === val)
    })
    return matchCurrent && matchOthers
  })
}

// 选择规格
function selectSpec(name: string, value: string) {
  if (!isSpecAvailable(name, value)) return
  if (selectedSpecs.value[name] === value) {
    const newSpecs = { ...selectedSpecs.value }
    delete newSpecs[name]
    selectedSpecs.value = newSpecs
  } else {
    selectedSpecs.value = { ...selectedSpecs.value, [name]: value }
  }
  // 实时通知父组件当前选中的规格文本
  emit('select', selectedSpecText.value)
}

// 增加数量
function onIncrease() {
  const maxStock = selectedSku.value?.stock || 1
  const max = isSeckill.value ? Math.min(limitCount.value, maxStock) : maxStock
  if (quantity.value < max) quantity.value++
}

// 关闭弹窗
function onClose() {
  emit('update:modelValue', false)
}

// 确认选择
function onConfirm() {
  if (!selectedSku.value) return
  emit('confirm', { sku: selectedSku.value, quantity: quantity.value })
  emit('update:modelValue', false)
}

// 弹窗打开时重置
watch(
  () => props.modelValue,
  val => {
    if (val) {
      selectedSpecs.value = {}
      quantity.value = 1
    }
  }
)
</script>

<style scoped>
.sku-popup {
  padding: 16px;
  max-height: 70vh;
  display: flex;
  flex-direction: column;
}

.sku-header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding-bottom: 16px;
  border-bottom: 1px solid #eee;
  position: relative;
}

.sku-image {
  width: 90px;
  height: 90px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
  background: #f5f5f5;
}

.sku-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.sku-info {
  flex: 1;
  min-width: 0;
}

.sku-price {
  margin: 0;
  color: #ee0a24;
  font-weight: bold;
}

.price-symbol {
  font-size: 14px;
}

.price-value {
  font-size: 22px;
}

.price-discount {
  font-size: 12px;
  color: #07c160;
  margin-left: 8px;
  font-weight: normal;
}

.sku-stock {
  font-size: 12px;
  color: #999;
  margin: 4px 0 0;
}

.sku-selected {
  font-size: 12px;
  color: #666;
  margin: 2px 0 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.close-btn {
  font-size: 20px;
  color: #999;
  flex-shrink: 0;
  margin-top: 4px;
}

.sku-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px 0;
}

.spec-group {
  margin-bottom: 16px;
}

.spec-group-name {
  font-size: 14px;
  color: #333;
  margin: 0 0 10px;
  font-weight: 500;
}

.spec-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.spec-tag {
  display: inline-block;
  padding: 6px 16px;
  border-radius: 4px;
  font-size: 13px;
  background: #f7f8fa;
  color: #333;
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.2s;
}

.spec-tag.active {
  background: #fff0f0;
  color: #ee0a24;
  border-color: #ee0a24;
}

.spec-tag.disabled {
  background: #f5f5f5;
  color: #ccc;
  cursor: not-allowed;
}

.quantity-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
}

.quantity-label {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

.quantity-control {
  display: flex;
  align-items: center;
  gap: 12px;
}

.qty-btn {
  font-size: 18px;
  color: #333;
  padding: 4px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.qty-btn.disabled {
  color: #ccc;
  border-color: #eee;
}

.qty-value {
  font-size: 16px;
  font-weight: bold;
  min-width: 30px;
  text-align: center;
  color: #333;
}

.limit-tip {
  padding: 8px 0;
}

.limit-text {
  font-size: 12px;
  color: #ee0a24;
  background: #fff0f0;
  padding: 4px 10px;
  border-radius: 4px;
}

.sku-footer {
  padding-top: 12px;
  border-top: 1px solid #eee;
}
</style>
