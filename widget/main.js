import { defineCustomElement } from 'vue'
import { createPinia, setActivePinia } from 'pinia'
import NotificationCartobio from './Notification.ce.vue'

setActivePinia(createPinia())

const NotificationCartobioElement = defineCustomElement({
  ...NotificationCartobio,
  styles: NotificationCartobio.styles.map(style => style.replace(/:root/g, ':host')),
  ShadowRoot: false
})

customElements.define('notification-cartobio', NotificationCartobioElement)

