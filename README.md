[![Website](https://img.shields.io/website/https/archive.gotointeractive.com.svg?link=https://archive.gotointeractive.com)](https://archive.gotointeractive.com)
[![Netlify Status](https://api.netlify.com/api/v1/badges/f467de0f-4773-4f8a-ac3b-5d4aeca0ea83/deploy-status)](https://app.netlify.com/sites/my-archive/deploys)

# Мои договоры
> Ваша персональная криптобезопасная база договоров.

[![Android](https://img.shields.io/badge/Android-Install-green?style=for-the-badge&link=https://play.google.com/store/apps/details?id=ru.baskovsky.archive.twa)](https://play.google.com/store/apps/details?id=ru.baskovsky.archive.twa)
[![Документация](https://img.shields.io/badge/%D0%94%D0%BE%D0%BA%D1%83%D0%BC%D0%B5%D0%BD%D1%82%D0%B0%D1%86%D0%B8%D1%8F-gray?style=for-the-badge&link=https://baskovsky.ru/2021/09/my-archive/)](https://baskovsky.ru/2021/09/my-archive/)

## Описание продукта

- Боитесь хранить свои договоры в неконтролиуемых облачных сервисах, вроде DropBox, Yandex Disk, Google Drive, etc?
- Надоело хранить свои договоры в специальных папочках на компьютере?
- Трудно найти потерявшийся документ?

> Сервис "Мои договоры" решил все эти проблемы!

- Надежное хранение и контроль договоров на вашем сервере или полностью офлайн.
- Легкий доступ к личным договорам: всегда под рукой в вашем любимом браузере.
- Удобный клиент и поиск.

## Попробовать демонстрацию

[Запустить PWA](https://archive.gotointeractive.com/)

---

## Технические возможности
Сервис "Мои договоры" использует стандарты PWA и LinkedData, предоставляя клиентам следующие возможности:

- `Адаптивный дизайн` для мобильной, таблет и десктопной версии;
- Доступ к договорам в режиме `Offline`;
- Хранения договоров в семантическом формате `schema.org`;
- Надежное хранилище договоров внутри `IndexDB`;
- `Шифрование` передачи данных;
- Цифровая подпись с помощью `Linked Data Proofs`;
- Авторизация через блокчейн-кошелек `Phantom` или нативный ключ `Solana`;
- `Полнотекстовый поиск` документов;
- Поиск документов через календарь;
- Поиск документа через `OpenSearch`;
- Поддержка импорта документов в форматах `PDF, PNG, JPG`;
- Генерация договора в формате `PDF`;
- Выгрузка событий в формате `ical`;
- Шеринг договора через `navigator.share`
- Безопасный вход через `2FA`;
- Мультиязычность через `i18n`;
- Быстрая связь с агентом по `e-mail`, `tel`;
- Открытие гео-меток через `map`;
- Поддержка Импорта/Экспорта базы данных в файл формате `zip`;
- Загрузка/Выгрузка данных через `SOLiD протокол` на собственный `Pod`;
- Распознавание `OCR`;
- Отсутствие телеметрии;

## Самостоятельная установка

### Установка
```bash
git clone git@github.com:gotois/archive.git && cd archive
npm i
```

### Cборка и запуск PWA

- Опционально установите `GOOGLE_CLIENT_ID` ([google-one-tap](https://developers.google.com/identity/gsi/web/guides/display-google-one-tap)) в качестве переменной среды.
- Опционально установите `SERVER_RPC2` в качестве переменной среды вашего JSON-RPC2 сервера.
- Опционально установите `SERVER_RPC2_USERNAME` в качестве переменной среды BASIC AUTH вашего JSON-RPC2 сервера.
- Опционально установите `SERVER_RPC2_PASSWORD` в качестве переменной среды BASIC AUTH вашего JSON-RPC2 сервера.

#### Запуск в режиме разработки (hot-code reloading, error reporting, etc.)
```bash
npm run dev
```

#### Создание сборки для продакшена
```bash
npm run build
```

### Сборка и запуск TWA

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
bubblewrap build
```
- Откройте проект в `Android Studio`
- Установите `Gradle`
- Выполните шаги по сборке соответствующие настройке настоящего build.gradle

### Запуск TWA в эмуляторе
```bash
bubblewrap install
```

---
Сделано на принципах [Манифеста GIC DAO](https://gotointeractive.com/manifest).
