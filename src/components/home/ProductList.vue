<template>
  <div class="product-list">
    <div v-for="item in productList" :key="item.id" class="product-item" @click="goDetail(item.id)">
      <div class="product-img-wrapper">
        <img v-lazy="item.image" alt="商品图片" />
      </div>
      <div class="product-info">
        <p class="product-name">{{ item.name }}</p>
        <div class="product-bottom">
          <span class="product-price price">¥{{ item.price }}</span>
          <span v-if="item.sales" class="product-sales">{{ item.sales }}人已购</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Product } from '@/types/index'
import { PropType } from 'vue'

const props = defineProps({
  productList: {
    type: Array as PropType<Product[]>,
    default: () => []
  }
})

const emit = defineEmits<{
  click: [id: number]
}>()

const goDetail = (id: number) => {
  emit('click', id)
}
</script>

<style scoped>
.product-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  padding: 0 8px;
}

.product-item {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
}

.product-img-wrapper {
  width: 100%;
  aspect-ratio: 1;
  overflow: hidden;
}

.product-img-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-info {
  padding: 8px;
}

.product-name {
  font-size: 13px;
  color: #333;
  margin: 0 0 6px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.product-price {
  font-size: 16px;
  color: #ee0a24;
}

.product-sales {
  font-size: 11px;
  color: #999;
}
</style>
