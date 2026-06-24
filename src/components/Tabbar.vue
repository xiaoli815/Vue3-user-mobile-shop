<template>
  <van-tabbar v-model="active" route safe-area-inset-bottom class="fixed-tabbar">
    <van-tabbar-item icon="home-o" to="/home">首页</van-tabbar-item>
    <van-tabbar-item icon="search" to="/product/list">分类</van-tabbar-item>
    <van-tabbar-item icon="cart-o" :badge="cartCount" to="/cart">购物车</van-tabbar-item>
    <van-tabbar-item icon="user-o" to="/user">我的</van-tabbar-item>
  </van-tabbar>
</template>
<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { computed } from 'vue'

const route = useRoute()
const cartStore = useCartStore()
const active = ref(0)

const cartCount = computed(() => cartStore.totalCount || '')

// 根据路由同步tabbar
const tabRoutes = ['/home', '/product/list', '/cart', '/user']
watch(
  () => route.path,
  path => {
    const idx = tabRoutes.indexOf(path)
    if (idx > -1) active.value = idx
  },
  { immediate: true }
)
</script>
<style scoped>
.fixed-tabbar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 999;
}
</style>
