import { boot } from 'quasar/wrappers'
import { LocalStorage } from 'quasar'
import { createI18n } from 'vue-i18n'
import { Locale } from '../i18n'
import messages from '../i18n'

export type MessageLanguages = keyof typeof messages
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
export type MessageSchema = (typeof messages)[Locale['ru-RU']]

// See https://vue-i18n.intlify.dev/guide/advanced/typescript.html#global-resource-schema-type-definition
/* eslint-disable @typescript-eslint/no-empty-interface */
declare module 'vue-i18n' {
  // define the locale messages schema
  export interface DefineLocaleMessage extends MessageSchema {}

  // define the datetime format schema
  export interface DefineDateTimeFormat {}

  // define the number format schema
  export interface DefineNumberFormat {}
}
/* eslint-enable @typescript-eslint/no-empty-interface */

export default boot(({ app }) => {
  const locale = LocalStorage.has('locale')
    ? String(LocalStorage.getItem('locale'))
    : navigator.language ?? Locale['ru-RU']

  const i18n = createI18n({
    locale: locale,
    fallbackLocale: Locale['en-US'],
    legacy: false,
    messages,
  })

  // Set i18n instance on app
  app.use(i18n)
})
