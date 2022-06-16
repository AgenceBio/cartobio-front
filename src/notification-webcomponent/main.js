import { defineCustomElement } from 'vue'
import App from './App.ce.vue'

customElements.define('notification-cartobio', defineCustomElement(App))
