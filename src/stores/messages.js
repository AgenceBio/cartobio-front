import { defineStore } from "pinia"
import { ref } from "vue"


/**
 * @typedef {Object} Message
 * @property {String} type
 * @property {String} text
 */

export const useMessages = defineStore('messages', () => {
  /**
   * Messages queue. Watch this if you want to get new messages.
   *
   * @type {Ref<UnwrapRef<*[]>>}
   */
  const queue = ref([])

  /**
   * Add a message to the stack
   *
   * @param {Message} message
   */
  function addMessage(message) {
    queue.value.push(message)
  }

  /**
   * Get all messages and remove them from the stack
   *
   * @returns {Message[]}
   */
  function popMessages() {
    if (queue.value.length === 0) return []

    const displayMessages = queue.value
    queue.value = []

    return displayMessages
  }

  return {
    addMessage,
    queue,
    popMessages,
  }
})
