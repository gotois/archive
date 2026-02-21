import { LocalStorage } from 'quasar'
import { defineStore } from 'pinia'
import { normalizeLocale } from '../i18n'

export default defineStore('lang', {
  actions: {
    setLang(lang: string) {
      LocalStorage.set('locale', normalizeLocale(lang))
    },
  },
  getters: {
    language(): string {
      if (LocalStorage.hasItem('locale')) {
        return LocalStorage.getItem('locale')
      }
      return navigator.language
    },
    isRussian(): boolean {
      return this.language.startsWith('ru') ?? false
    },
  },
})
