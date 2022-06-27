import { defineCustomElement } from 'vue'
import NotificationCartobio from './App.ce.vue'

const NotificationCartobioElement = defineCustomElement({
  ...NotificationCartobio,
  styles: NotificationCartobio.styles.map(style => style.replace(/:root/g, ':host'))
})

customElements.define('notification-cartobio', NotificationCartobioElement)

