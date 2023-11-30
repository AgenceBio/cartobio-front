import { toast as toastify } from "vue3-toastify"
import Toast from "@/components/Toast.vue"
import { h } from "vue"

const toastComponent = (message, actionLabel, actionCb) => {
  return ({ closeToast, toastProps }) => h(Toast, { message, actionLabel, actionCb, closeToast, toastProps })
}

const toast = (message, actionLabel, actionCb) => {
  toastify(toastComponent(message, actionLabel, actionCb), { toastId: message })
}

toast.success = (message, actionLabel, actionCb) => {
  toastify.success(toastComponent(message, actionLabel, actionCb), { toastId: message })
}

toast.info = (message, actionLabel, actionCb) => {
  toastify.info(toastComponent(message, actionLabel, actionCb), { toastId: message })
}

toast.warning = (message, actionLabel, actionCb) => {
  toastify.warning(toastComponent(message, actionLabel, actionCb), { toastId: message })
}

toast.error = (message, actionLabel, actionCb) => {
  toastify.error(toastComponent(message, actionLabel, actionCb), { toastId: message })
}
export default toast


