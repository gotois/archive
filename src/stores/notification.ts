import { defineStore } from 'pinia'

interface Store {
  data: { title: string }[]
}

export default defineStore('notification', {
  state: (): Store => ({
    data: [],
  }),
  actions: {
    add(elem: { title: string }) {
      this.data.push(elem)
    },
    check() {
      if (Notification.permission === 'granted' && this.data.length > 0) {
        new Notification(this.data[0].title, {
          tag: 'contract',
        })
        this.data.shift()
      }
    },
  },
})
