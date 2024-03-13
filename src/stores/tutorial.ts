import { LocalStorage } from 'quasar'
import { defineStore } from 'pinia'

interface State {
  tutorialCompleted: boolean
}

const tutorialKey = 'tutorialCompleted'

export default defineStore('tutorial', {
  state: (): State => ({
    tutorialCompleted: LocalStorage.getItem(tutorialKey) ?? false,
  }),
  actions: {
    tutorialComplete(value: boolean) {
      LocalStorage.set(tutorialKey, value)
      this.tutorialCompleted = value
    },
  },
})
