<template>
  <div class="favorite-page">
    <!-- 顶部导航 -->
    <van-nav-bar title="我的收藏" left-arrow @click-left="$router.back()" />

    <!-- 收藏列表 -->
    <ul class="favorite-list" v-if="favoriteList.length > 0">
      <li class="favorite-item" v-for="item in favoriteList" :key="item.id" @click="goDetail(item.id)">
        <!-- 商品图片 -->
        <div class="item-image">
          <img :src="item.image" :alt="item.name" />
        </div>
        <!-- 商品信息 -->
        <div class="item-info">
          <p class="item-name">{{ item.name }}</p>
          <p class="item-tags">
            <van-tag v-for="tag in item.tags" :key="tag" type="primary" plain>{{ tag }}</van-tag>
          </p>
          <p class="item-price-row">
            <span class="item-price">¥{{ item.price }}</span>
            <span class="item-original" v-if="item.originalPrice">¥{{ item.originalPrice }}</span>
          </p>
          <p class="item-sales">已售 {{ item.sales }}</p>
        </div>
        <!-- 取消收藏 -->
        <div class="item-action" @click.stop="removeFavorite(item.id)">
          <van-icon name="delete-o" size="20" color="#999" />
        </div>
      </li>
    </ul>

    <!-- 空状态 -->
    <van-empty description="暂无收藏商品" v-else />

    <!-- 底部导航 -->
    <Tabbar />
  </div>
</template>

<script setup lang="ts">
import { } from 'vue'
import { useRouter } from 'vue-router'
import Tabbar from '@/components/tabbar.vue'
import { useFavoriteStore } from '@/stores/favorite'
import {Product} from '@/types/product'

const router = useRouter()
const favoriteStore = useFavoriteStore()

// 使用 store 中的收藏列表（会自动从 localStorage 加载）
const favoriteList = favoriteStore.favoriteList

// 跳转商品详情
const goDetail = (id: number) => {
  router.push(`/product/detail/${id}`)
}

// 取消收藏
const removeFavorite = (id: number) => {
  favoriteStore.removeFavorite(id)
}


</script>

<style scoped>
.favorite-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 50px;
}

.favorite-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.favorite-item {
  display: flex;
  align-items: center;
  background: #fff;
  margin: 8px 12px;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
}

.favorite-item:active {
  background: #f9f9f9;
}

.item-image {
  width: 100px;
  height: 100px;
  flex-shrink: 0;
  border-radius: 6px;
  overflow: hidden;
  background: #f5f5f5;
}

.item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-info {
  flex: 1;
  margin-left: 12px;
  overflow: hidden;
}

.item-name {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin: 0 0 6px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-tags {
  margin: 0 0 6px 0;
}

.item-tags .van-tag {
  margin-right: 4px;
}

.item-price-row {
  margin: 0 0 4px 0;
}

.item-price {
  font-size: 16px;
  font-weight: 600;
  color: #ee0a24;
}

.item-original {
  font-size: 12px;
  color: #999;
  text-decoration: line-through;
  margin-left: 6px;
}

.item-sales {
  font-size: 12px;
  color: #999;
  margin: 0;
}

.item-action {
  padding: 8px;
  flex-shrink: 0;
}
</style>