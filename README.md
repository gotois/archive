[![Website](https://img.shields.io/website/https/archive.gotointeractive.com.svg?link=https://archive.gotointeractive.com)](https://archive.gotointeractive.com)
[![Netlify Status](https://api.netlify.com/api/v1/badges/f467de0f-4773-4f8a-ac3b-5d4aeca0ea83/deploy-status)](https://app.netlify.com/sites/my-archive/deploys)

# Секретарь App
> Ваша персональная криптобезопасная база договоров.

[![Android](https://img.shields.io/badge/Android-Install-green?logo=android&style=for-the-badge&link=https://play.google.com/store/apps/details?id=ru.baskovsky.archive.twa)](https://play.google.com/store/apps/details?id=ru.baskovsky.archive.twa)
[![Telegram](https://img.shields.io/badge/Telegram-gray?logo=telegram&style=for-the-badge&link=https://t.me/gotois_bot/App)](https://t.me/gotois_bot/App)

## Описание продукта

[![Документация](https://img.shields.io/badge/%D0%94%D0%BE%D0%BA%D1%83%D0%BC%D0%B5%D0%BD%D1%82%D0%B0%D1%86%D0%B8%D1%8F-gray?style=for-the-badge&link=https://baskovsky.ru/2021/09/my-archive/)](https://baskovsky.ru/2021/09/my-archive/)

- Боитесь хранить свои договоры в неконтролиуемых облачных сервисах, вроде DropBox, Yandex Disk, Google Drive, etc?
- Надоело хранить свои договоры в специальных папочках на компьютере?
- Трудно найти потерявшийся документ?

> Сервис "Мои договоры" решил все эти проблемы!

- Надежное хранение и контроль договоров на вашем сервере или полностью офлайн.
- Легкий доступ к личным договорам: всегда под рукой в вашем любимом браузере.
- Удобный клиент и поиск.

## Попробовать демонстрацию

- [PWA](https://archive.gotointeractive.com/)
- [TMA](https://t.me/gotois_bot/App)

---

## Технические возможности
Сервис использует последние криптографические стандарты LinkedData Signature и предоставляет клиентам следующие возможности:

- Адаптивный дизайн для мобильной, таблет и десктопной версий в версиях `Trusted Web Activity`, `Progressive Web App` и `Telegram Mini Apps`;
- Доступ в режиме `Offline`;
- Хранения документов в семантическом формате `ActivityStreams 2.0`;
- Локальное хранилище в `IndexDB`;
- Передача данных через `HTTPS`;
- Цифровая подпись с помощью `W3C Verifiable Credential`;
- Оплата договоров через блокчейн-кошелек `Phantom` или нативный ключ в блокчейне `Solana`;
- `Полнотекстовый поиск` по календарю;
- Подключение внешних календаре `Google Calendar`;
- Поиск документа через `OpenSearch`;
- Поддержка импорта документов в форматах `PDF, PNG, JPG`;
- Генерация договора в формате `PDF`;
- Выгрузка событий в формате `ical`;
- Шеринг договора через `navigator.share`
- Безопасный вход через `2FA`;
- i18n мультиязычность `русский` и `английский` языки;
- Быстрая связь с агентом по `e-mail`, `tel`;
- Открытие гео-меток через `map`;
- Импорт/Экспорт базы данных в `zip`;
- Загрузка/Выгрузка календаря на собственный `Pod`;
- Распознавание текста `OCR`;
- Искусственный интеллект `Секретарь`;
- Открытый код под лицензией `GPLv3`;
- Отсутствие телеметрии;

## Самостоятельная установка

### Установка
```bash
git clone git@github.com:gotois/archive.git && cd archive
npm i
```

### Сборка и запуск

- Опционально установите `GOOGLE_CLIENT_ID` ([google-one-tap](https://developers.google.com/identity/gsi/web/guides/display-google-one-tap)) в качестве переменной среды.
- Опционально установите `GOOGLE_REDIRECT_URI` необходимый в качестве переменной среды.
- Опционально установите `TELEGRAM_BOT_NAME` в качестве переменной среды.
- Опционально установите `SERVER_HOST` в качестве переменной среды вашего сервера.

#### Запуск в режиме разработки
> hot-code reloading, error reporting, etc.

```bash
npm run dev
```

#### Создание сборки для продакшена
```bash
npm run build
```

#### Сборка и запуск TWA

- Установите в twa-manifest.json свой signingKey:
```json5
{
  // ...
  "signingKey": {
    "path": "PATH_FOR_KEYSTORE",
    "alias": "ALIAS_NAME"
  },
  // ...
}
```

- Выполните команду:
```bash
npm run build:apk
```
- Откройте проект в `Android Studio`
- Установите `Gradle`
- Выполните шаги по сборке соответствующие настройке настоящего build.gradle

##### Запуск TWA в эмуляторе
```bash
bubblewrap install
```

---
Сделано на принципах [GIC DAO](https://gotointeractive.com/manifest).
