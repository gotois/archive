import { ref, computed } from 'vue'
import { Notify } from 'quasar'
import { requestWebPushPermission } from '../services/webPushService'

export function useWebPush() {
  const isLoading = ref(false)

  const permission = computed<NotificationPermission>(() => {
    if (!('Notification' in window)) {
      return 'denied'
    }
    return Notification.permission
  })

  async function enable(): Promise<void> {
    isLoading.value = true
    try {
      await requestWebPushPermission()
    } catch (error) {
      Notify.create({
        message: 'Нет доступа к WebPush',
        type: 'warning',
      })
      console.warn(error)
    } finally {
      isLoading.value = false
    }
  }

  return {
    permission,
    isLoading,
    enable,
  }
}
