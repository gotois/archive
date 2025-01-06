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
      console.log('11')
      if (this.lang) {
        return this.lang
      }
      try {
        // todo - по какой-то непонятной причине из геттера не могу извлечь загрузку локали
        // поэтому этот код неработает
        const i18n = useI18n()
        return String(i18n.locale.value)
      } catch (e) {
        return 'en'
      }
    },
    isRussian(): boolean {
      return this.lang?.startsWith('ru') ?? false
    },
  },
})
