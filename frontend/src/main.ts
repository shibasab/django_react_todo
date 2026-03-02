import { createPinia } from 'pinia'
import { createApp } from 'vue'

import App from './App.vue'
import router from './router'
// eslint-disable-next-line no-unassigned-import
import './styles/index.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
