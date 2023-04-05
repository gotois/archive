import { LocalStorage } from 'quasar'
import { defineStore } from 'pinia'

interface State {
  tutorialCompleted: boolean
}

export default defineStore('tutorial', {
  state: (): State => ({
    tutorialCompleted: LocalStorage.getItem('tutorialCompleted') ?? false,
  }),
  actions: {
    tutorialComplete() {
      LocalStorage.set('tutorialCompleted', true)
      this.tutorialCompleted = true
    },
  },
})
