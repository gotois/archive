import { LocalStorage } from 'quasar'
import { boot } from 'quasar/wrappers'
import { createI18n } from 'vue-i18n'
import { Locale, normalizeLocale } from '../i18n'
import messages from '../i18n'

export type MessageLanguages = keyof typeof messages
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
export type MessageSchema = (typeof messages)[Locale['ru-RU']]

export default boot(({ app }) => {
  const locale = LocalStorage.has('locale')
    ? String(LocalStorage.getItem('locale'))
    : navigator.language

  const i18n = createI18n({
    locale: normalizeLocale(locale),
    fallbackLocale: Locale['en-US'],
    legacy: false,
    messages,
  })

  // Set i18n instance on app
  app.use(i18n)
})
