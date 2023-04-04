import { LocalStorage } from 'quasar'
import { defineStore } from 'pinia'

export default defineStore('tutorial', {
  state: () => ({
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    tutorialCompleted: LocalStorage.getItem('tutorialCompleted') ?? false,
  }),
  actions: {
    tutorialComplete() {
      LocalStorage.set('tutorialCompleted', true)
      this.tutorialCompleted = true
    },
  },
})
