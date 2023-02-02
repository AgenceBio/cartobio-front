import { defineCustomElement } from 'vue'
import NotificationCartobio from './Notification.ce.vue'

const NotificationCartobioElement = defineCustomElement({
  ...NotificationCartobio,
  styles: NotificationCartobio.styles.map(style => style.replace(/:root/g, ':host')),
  ShadowRoot: false
})

customElements.define('notification-cartobio', NotificationCartobioElement)

