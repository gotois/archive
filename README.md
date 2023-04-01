# Мои договоры
> Контролируемая Вами персональная база договоров.

[![Netlify Status](https://api.netlify.com/api/v1/badges/f467de0f-4773-4f8a-ac3b-5d4aeca0ea83/deploy-status)](https://app.netlify.com/sites/my-archive/deploys)
[![Website](https://img.shields.io/website/https/archive.gotointeractive.com.svg?link=https://archive.gotointeractive.com)](https://archive.gotointeractive.com)

[![Android](https://img.shields.io/badge/Android-Install-green?style=for-the-badge&link=https://play.google.com/store/apps/details?id=ru.baskovsky.archive.twa)](https://play.google.com/store/apps/details?id=ru.baskovsky.archive.twa)
[![Документация](https://img.shields.io/badge/%D0%94%D0%BE%D0%BA%D1%83%D0%BC%D0%B5%D0%BD%D1%82%D0%B0%D1%86%D0%B8%D1%8F-gray?style=for-the-badge&link=https://baskovsky.ru/2021/09/my-archive/)](https://baskovsky.ru/2021/09/my-archive/)

## Demo

[Запустить PWA](https://archive.gotointeractive.com/)

## Описание продукта

- Надоело хранить свои договоры в специальных папочках на компьютере?
- Боитесь хранить свои договоры в неконтролиуемых облачных сервисах, вроде DropBox, Yandex Disk, Google Drive, etc?
- Трудно найти "тот самый договор"?

> Сервис "Мои договоры" решил все эти проблемы!

- Храните свои договоры всегда под рукой в своем любимом браузере.
- Контролируйте их хранение самостоятельно.
- Реактивный клиент для удобного семантического поиска.

## Технические возможности
Сервис "Мои договоры" использует стандарты PWA и LinkedData, предоставляя клиентам следующие возможности:

- `Адаптивный дизайн` для мобильной, таблет и десктопной версии;
- Доступ к договорам в режиме `Offline`;
- Надежное хранилище договоров внутри `IndexDB`;
- `Шифрование` передачи данных;
- Цифровая подпись с помощью `Linked Data Proofs`;
- `Полнотекстовый поиск` договоров;
- Поддержка документов в популярных форматах `PDF, PNG, JPG`;
- Генерация договора в формате `PDF`;
- Шеринг договора через `navigator.share`
- Безопасный вход через `цифровой пин`;
- Поддержка Импорта/Экспорта базы данных в файл формате `zip`;
- Загрузка/Выгрузка базы данных через `SOLiD сервер` на собственный `Pod`;

---

## Самостоятельная установка для разработчика

## Установка пакетов
```bash
npm i
```

## Cборка и запуск PWA

### Запуск в режиме разработки (hot-code reloading, error reporting, etc.)
```bash
npm run dev
```

### Создание сборки для продакшена
```bash
npm run build
```

## Сборка и запуск TWA

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
- Откройте проект в Android Studio
- Установите Gradle
- Выполните шаги по сборке соответствующие настройке настоящего build.gradle

### Запуск TWA в эмуляторе
```bash
bubblewrap install
```

---
Сделано на принципах [gotois](https://gotointeractive.com/mantra).
