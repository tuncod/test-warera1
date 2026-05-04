import { createApp } from 'vue'
import App from './App.vue'
import { ofetch } from 'ofetch'

import './styles.css'

console.log(
  'good'
)

createApp(App).mount('#app')

function testErawar() {
  ofetch('/api')
}