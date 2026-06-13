import { defineStore } from 'pinia'
import useSecretaryStore from 'stores/secretary'
import useGeoStore from 'stores/geo'

export default defineStore('event', {
  actions: {
    async createEvent(body, tgGroupChatId, tgGroupMessageId) {
      const secretaryStore = useSecretaryStore()
      const geoStore = useGeoStore()

      const headers = new Headers({
        'Content-Type': 'application/json',
      })
      if (secretaryStore.auth) {
        headers.set('Authorization', secretaryStore.auth)
      }
      if (geoStore.geolocation) {
        headers.set('Geolocation', geoStore.geolocation)
      }
      if (geoStore.timezone) {
        headers.set('Timezone', geoStore.timezone)
      }
      if (tgGroupChatId) {
        headers.set('X-Telegram-Chat-Id', tgGroupChatId)
      }
      if (tgGroupMessageId) {
        headers.set(
          'X-Telegram-Message-Id',
          tgGroupMessageId,
        )
      }
      const response = await fetch(import.meta.env.server + '/event', {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
        credentials: 'include',
      })
      if (!response.ok) {
        throw new Error('Response failed')
      }
      console.log('Данные успешно добавлены')
    },
    async editEvent(body, tgGroupChatId, tgGroupMessageId) {
      const secretaryStore = useSecretaryStore()
      const geoStore = useGeoStore()

      const headers = new Headers({
        'Content-Type': 'application/json',
      })
      if (secretaryStore.auth) {
        headers.set('Authorization', secretaryStore.auth)
      }
      if (geoStore.timezone) {
        headers.set('Timezone', geoStore.timezone)
      }
      if (tgGroupChatId) {
        headers.set('X-Telegram-Chat-Id', tgGroupChatId)
      }
      if (tgGroupMessageId) {
        headers.set(
          'X-Telegram-Message-Id',
          tgGroupMessageId,
        )
      }
      const response = await fetch(import.meta.env.server + '/event', {
        method: 'PUT',
        headers,
        body: JSON.stringify(body),
        credentials: 'include',
      })
      if (!response.ok) {
        throw new Error('Response failed')
      }
      console.log('Данные успешно изменены')
    },
    async deleteEvent(body, tgGroupChatId, tgGroupMessageId) {
      const secretaryStore = useSecretaryStore()

      const headers = new Headers({
        'Content-Type': 'application/json',
      })
      if (secretaryStore.auth) {
        headers.set('Authorization', secretaryStore.auth)
      }
      if (tgGroupChatId) {
        headers.set('X-Telegram-Chat-Id', tgGroupChatId)
      }
      if (tgGroupMessageId) {
        headers.set(
          'X-Telegram-Message-Id',
          tgGroupMessageId,
        )
      }
      const response = await fetch(import.meta.env.server + '/event', {
        method: 'DELETE',
        headers,
        body: JSON.stringify(body),
        credentials: 'include',
      })
      if (!response.ok) {
        throw new Error('Response failed')
      }
      console.log('Данные успешно удалены')
    }
  },
})
