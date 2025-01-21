[![Netlify Status](https://api.netlify.com/api/v1/badges/f467de0f-4773-4f8a-ac3b-5d4aeca0ea83/deploy-status)](https://app.netlify.com/sites/my-archive/deploys)

# Секретарь WebApp
> Ваша персональная криптобезопасная база обязательств.

[![Android TWA](https://img.shields.io/badge/Android-Install-green?logo=android&style=for-the-badge&link=https://play.google.com/store/apps/details?id=ru.baskovsky.archive.twa)](https://play.google.com/store/apps/details?id=ru.baskovsky.archive.twa)
[![TMA](https://img.shields.io/badge/Telegram-gray?logo=telegram&style=for-the-badge&link=https://t.me/gotois_bot/App)](https://t.me/gotois_bot/App)
[![PWA](https://img.shields.io/website/https/archive.gotointeractive.com.svg?link=https://archive.gotointeractive.com)](https://archive.gotointeractive.com/)

## Описание продукта

- Боитесь хранить свои договоры в неконтролиуемых облачных сервисах, вроде DropBox, Yandex Disk, Google Drive?
- Надоело хранить свои договоры в специальных папочках на компьютере?
- Трудно найти потерявшийся документ?

> Сервис "Мои договоры" решил все эти проблемы!

- Надежное хранение и контроль договоров на вашем сервере или полностью офлайн.
- Легкий доступ к личным договорам: всегда под рукой в вашем любимом браузере.
- Удобный клиент и поиск.

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

## Установка

### Установка из исходников
```bash
git clone git@github.com:gotois/archive.git && cd archive
npm i
```

### Сборка и запуск

- Обязательно установите `SERVER_HOST` в качестве переменной среды вашего сервера.
- Опционально установите `GOOGLE_CLIENT_ID` ([google-one-tap](https://developers.google.com/identity/gsi/web/guides/display-google-one-tap)) в качестве переменной среды.
- Опционально установите `GOOGLE_REDIRECT_URI` необходимый в качестве переменной среды.
- Опционально установите `TELEGRAM_BOT_NAME` в качестве переменной среды вашего телеграм бота.

#### Запуск в режиме локальной разработки
> hot-code reloading, error reporting, etc.

```bash
npm run dev
```

#### Сборка PWA

```bash
npm run build
```

#### Сборка TWA

- Установите в `twa-manifest.json` свой `signingKey`:
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
