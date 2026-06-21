<template>
  <!-- 骨架屏组件 -->
  <div class="skeleton-card" :style="{ width: width, height: height }">
    <div class="skeleton-shimmer" />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  width?: string
  height?: string
}>()
</script>

<style scoped>
.skeleton-card {
  background: #f0f0f0;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
}

.skeleton-shimmer {
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    #f0f0f0 25%,
    #e0e0e0 50%,
    #f0f0f0 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}
</style>