import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './style.css'
import 'vant/lib/index.css'
import 'element-plus/dist/index.css'

// 加载Mock
import './mock'

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')