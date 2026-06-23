import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './style.css'

if (import.meta.env.VITE_USE_MOCK === 'true') {
  import('./mock')
}

import { registerLazyDirective } from './directives/lazy'

const app = createApp(App)
app.use(createPinia())
app.use(router)
registerLazyDirective(app)
app.mount('#app')