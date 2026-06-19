import type { Directive, App } from 'vue'

/** 图片懒加载指令 v-lazy */
const lazyDirective: Directive<HTMLImageElement, string> = {
  mounted(el: HTMLImageElement, binding) {
    // 设置占位样式
    el.style.opacity = '0'
    el.style.transition = 'opacity 0.3s ease'

    // 使用 IntersectionObserver 监听元素可见性
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement
            const src = binding.value

            if (src) {
              img.src = src
              img.onload = () => {
                img.style.opacity = '1'
              }
              img.onerror = () => {
                // 加载失败时显示占位色
                img.style.opacity = '1'
                img.style.background = '#f5f5f5'
              }
            }

            observer.unobserve(img)
          }
        })
      },
      {
        rootMargin: '50px', // 提前 50px 开始加载
        threshold: 0.01,
      },
    )

    observer.observe(el)

    // 存储 observer 方便后续清理
    ;(el as any)._lazyObserver = observer
  },

  unmounted(el: HTMLImageElement) {
    const observer = (el as any)._lazyObserver
    if (observer) {
      observer.disconnect()
    }
  },
}

/** 注册全局懒加载指令 */
export function registerLazyDirective(app: App) {
  app.directive('lazy', lazyDirective)
}