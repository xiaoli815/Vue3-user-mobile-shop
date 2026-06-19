import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './style.css'
// Vant CSS 由 unplugin-vue-components 按需自动引入，无需全量导入

// 仅开发环境加载Mock
if (import.meta.env.DEV) {
  import('./mock')
}

// 注册自定义指令
import { registerLazyDirective } from './directives/lazy'

const app = createApp(App)
app.use(createPinia())
app.use(router)
registerLazyDirective(app)
app.mount('#app')
