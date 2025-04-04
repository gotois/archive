import ru from './ru-RU'
import en from './en-US'

// https://schedule-x.dev/docs/calendar/supported-languages
export enum Locale {
  'ru-RU' = 'ru-RU',
  'en-GB' = 'en-US',
  // eslint-disable-next-line @typescript-eslint/no-duplicate-enum-values
  'en-US' = 'en-US',
}

export function normalizeLocale(lang: string) {
  switch (lang.toLowerCase()) {
    case 'ru':
    case 'ru-ru': {
      return Locale['ru-RU']
    }
    case 'en':
    case 'en-us':
    case 'en-gb': {
      return Locale['en-US']
    }
    default: {
      return Locale['en-US']
    }
  }
}

export default {
  [Locale['ru-RU']]: ru,
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  [Locale['en-GB']]: en,
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/ban-ts-comment
  // @ts-expect-error
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  [Locale['en-US']]: en,
}
