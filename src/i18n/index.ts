import ru from './ru'
import en from './en'

// https://schedule-x.dev/docs/calendar/supported-languages
export enum Locale {
  'ru-RU',
  'en-GB',
  'en-US',
}

export default {
  [Locale['ru-RU']]: ru,
  [Locale['en-GB']]: en,
  [Locale['en-US']]: en,
}
