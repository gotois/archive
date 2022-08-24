# Мои договоры
> Ваша офлайн база договоров

[![Netlify Status](https://api.netlify.com/api/v1/badges/f467de0f-4773-4f8a-ac3b-5d4aeca0ea83/deploy-status)](https://app.netlify.com/sites/my-archive/deploys)
[![Website](https://img.shields.io/website/https/archive.baskovsky.ru.svg?link=https://archive.baskovsky.ru)](https://archive.baskovsky.ru)

[![Документация](https://img.shields.io/badge/%D0%94%D0%BE%D0%BA%D1%83%D0%BC%D0%B5%D0%BD%D1%82%D0%B0%D1%86%D0%B8%D1%8F-gray?style=for-the-badge&link=https://baskovsky.ru/2021/09/my-archive/)](https://baskovsky.ru/2021/09/my-archive/)

## Возможности
Это удобнее дропбокса.
- Информация хранится на устройстве пользователя и не передаётся на серверы;
- Удобная навигация и поиск по документам;
- Поддержка документов в формате PDF, PNG, JPG;
- Возможность передавать файлы на другие устройства в формате PDF;
- Вход через пин код;
- Надежное и безопасное хранилище документов;
- Простой Импорт/Экспорт базы данных;

## Установка
```bash
npm install
```

## Запуск и сборка

### Запуск в режиме разработки (hot-code reloading, error reporting, etc.)
```bash
npm run dev
```

### Создание сборки для продакшена
```bash
npm run build
```

### Сборка TWA
Установите twa-manifest.json signingKey:
```
  "signingKey": {
    "path": "PATH_FOR_KEYSTORE",
    "alias": "ALIAS_NAME"
  },
```

Выполните команду
```bash
bubblewrap build
```

### Запуск TWA (необходим android эмулятор)
```bash
bubblewrap install
```


---
Сделано с любовью.
