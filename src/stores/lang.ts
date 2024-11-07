import { LocalStorage } from 'quasar'
import { defineStore } from 'pinia'
import { useI18n } from 'vue-i18n'

interface Store {
  lang: string
}

export default defineStore('lang', {
  state: (): Store => ({
    lang: LocalStorage.getItem('locale') ?? null,
  }),
  actions: {
    setLang(lang: string) {
      switch (lang) {
        case 'en': {
          this.lang = 'en-US'
          break
        }
        case 'ru': {
          this.lang = 'ru-RU'
          break
        }
        default: {
          this.lang = lang
          break
        }
      }
      LocalStorage.set('locale', this.lang)
    },
  },
  getters: {
    language(): string {
      if (this.lang) {
        return this.lang
      }
      const i18n = useI18n()
      return i18n.locale.value
    },
  },
})
