import { LocalStorage } from 'quasar'
import { defineStore } from 'pinia'
import { useI18n } from 'vue-i18n'
import { normalizeLocale } from '../i18n'

interface Store {
  lang: string
}

export default defineStore('lang', {
  state: (): Store => ({
    lang: LocalStorage.getItem('locale') ?? null,
  }),
  actions: {
    setLang(lang: string) {
      this.lang = normalizeLocale(lang)
      LocalStorage.set('locale', this.lang)
    },
  },
  getters: {
    language(): string {
      if (this.lang) {
        return this.lang
      }
      const i18n = useI18n()
      return String(i18n.locale.value)
    },
    isRussian(): boolean {
      return this.lang?.startsWith('ru') ?? false
    },
  },
})
