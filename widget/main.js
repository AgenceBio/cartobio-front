import { defineCustomElement } from 'vue'
import { createPinia, setActivePinia } from 'pinia'
import NotificationCartobio from './Notification.ce.vue'

// Pinia has to be setup in order to use it in subcomponents
// the following line is a way to setup Pinia without using Vue's `app.use(pinia)`
// @see https://github.com/vuejs/pinia/discussions/1085#discussioncomment-2851876
setActivePinia(createPinia())

const NotificationCartobioElement = defineCustomElement({
  ...NotificationCartobio,
  styles: NotificationCartobio.styles.map(style => style.replace(/:root/g, ':host')),
})

customElements.define('notification-cartobio', NotificationCartobioElement)

