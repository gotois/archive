# Мои договоры
> Контролируемая Вами персональная база договоров

[![Netlify Status](https://api.netlify.com/api/v1/badges/f467de0f-4773-4f8a-ac3b-5d4aeca0ea83/deploy-status)](https://app.netlify.com/sites/my-archive/deploys)
[![Website](https://img.shields.io/website/https/archive.gotointeractive.com.svg?link=https://archive.gotointeractive.com)](https://archive.gotointeractive.com)

[![Android](https://img.shields.io/badge/Android-Install-green?style=for-the-badge&link=https://play.google.com/store/apps/details?id=ru.baskovsky.archive.twa)](https://play.google.com/store/apps/details?id=ru.baskovsky.archive.twa)
[![Документация](https://img.shields.io/badge/%D0%94%D0%BE%D0%BA%D1%83%D0%BC%D0%B5%D0%BD%D1%82%D0%B0%D1%86%D0%B8%D1%8F-gray?style=for-the-badge&link=https://baskovsky.ru/2021/09/my-archive/)](https://baskovsky.ru/2021/09/my-archive/)

## Описание
Это удобнее дропбокса и хранения в специальных папочках на компьютере. Храните свои документы и просматривайте их без сети и передачи другим лицам.

## Возможности
- Поддержка мобильной, таблет и десктопной верстки;
- Доступ к договорам в режиме `offline`;
- Защищенное хранилище договоров внутри `IndexDB`;
- `Полнотекстовый` поиск договоров;
- Поддержка документов в формате `PDF, PNG, JPG`;
- Генерация договора в формате `PDF`;
- Шеринг договора через `navigator.share`
- Безопасный вход через `цифровой пин`;
- Поддержка Импорта/Экспорта базы данных в файл формате `zip`;
- Загрузка/Выгрузка базы данных через `SOLiD сервер`;

---

## Установка
-
- Требуется NodeJS
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
-
- Открыть проект в Android Studio
- Установить Gradle
- Выполнить шаги по сборке соответствующие настройке build.gradle

### Запуск TWA в эмуляторе
```bash
bubblewrap install
```

---
Сделано на принципах [gotois](https://gotointeractive.com/mantra).
