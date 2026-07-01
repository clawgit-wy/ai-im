import 'uno.css'
import '@unocss/reset/eric-meyer.css'
import { pinia } from '@/stores'
import router from '@/router'
import App from '@/App.vue'

const app = createApp(App)
app.use(pinia).use(router)

app.mount('#app')
