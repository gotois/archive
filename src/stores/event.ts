import { defineStore } from 'pinia'
import useSecretaryStore from 'stores/secretary'
import useGeoStore from 'stores/geo'

interface TelegramGroup {
  id: number
  title: string
  type: 'group' | 'supergroup'
}

export default defineStore('event', {
  actions: {
    async getTelegramGroups(query?: string) {
      const secretaryStore = useSecretaryStore()

      const headers = new Headers()
      if (secretaryStore.auth) {
        headers.set('Authorization', secretaryStore.auth)
      }

      const params = new URLSearchParams()
      if (query?.trim()) {
        params.set('query', query.trim())
      }

      const response = await fetch(
        import.meta.env.server + '/groups?' + params.toString(),
        {
          method: 'GET',
          headers,
          credentials: 'include',
        },
      )
      if (!response.ok) {
        throw new Error('Response groups failed')
      }
      const groups = await response.json()
      return groups as TelegramGroup[]
    },
    async getEvent(taskId: number | string) {
      const secretaryStore = useSecretaryStore()

      const headers = new Headers({
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      })
      if (secretaryStore.auth) {
        headers.set('Authorization', secretaryStore.auth)
      }

      const response = await fetch(import.meta.env.server + `/event/${taskId}`, {
        method: 'GET',
        headers,
        credentials: 'include',
      })
      if (!response.ok) {
        throw new Error('Unable to load task')
      }
      const result = await response.json()
      return result
    },
    async createEvent(body: any) {
      const {...event} = body;
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
      const response = await fetch(import.meta.env.server + '/event', {
        method: 'POST',
        headers,
        body: JSON.stringify(event),
        credentials: 'include',
      })
      if (!response.ok) {
        throw new Error('Response event failed')
      }
      console.log('Данные успешно добавлены')
    },
    async editEvent(body: any) {
      const {...event} = body;
      // TODO: После GET /event/:taskId передавать Telegram-метаданные события в PUT,
      // пока TG-сервер не начнёт получать их сам из SQLite по id_task.
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
      const response = await fetch(import.meta.env.server + '/event', {
        method: 'PUT',
        headers,
        body: JSON.stringify(event),
        credentials: 'include',
      })
      if (!response.ok) {
        throw new Error('Response failed')
      }
      console.log('Данные успешно изменены')
    },
    async deleteEvent(body: unknown) {
      // TODO: Передавать только ids после переноса поиска chatId в SQLite на TG-сервере.
      const secretaryStore = useSecretaryStore()

      const headers = new Headers({
        'Content-Type': 'application/json',
      })
      if (secretaryStore.auth) {
        headers.set('Authorization', secretaryStore.auth)
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
