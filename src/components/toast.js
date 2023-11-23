import { toast as toastify } from "vue3-toastify"
import Toast from "@/components/Toast.vue"
import { h } from "vue"

const toastComponent = (message, actionLabel, actionCb) => {
  return ({ closeToast, toastProps }) => h(Toast, { actionLabel, actionCb, closeToast, toastProps }, [ message ])
}

const toast = (message, actionLabel, actionCb) => {
  toastify(toastComponent(message, actionLabel, actionCb))
}

toast.success = (message, actionLabel, actionCb) => {
  toastify.success(toastComponent(message, actionLabel, actionCb))
}

toast.info = (message, actionLabel, actionCb) => {
  toastify.info(toastComponent(message, actionLabel, actionCb))
}

toast.warning = (message, actionLabel, actionCb) => {
  toastify.warning(toastComponent(message, actionLabel, actionCb))
}

toast.error = (message, actionLabel, actionCb) => {
  toastify.error(toastComponent(message, actionLabel, actionCb))
}
export default toast


