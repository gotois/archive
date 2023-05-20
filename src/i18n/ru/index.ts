import { format } from 'quasar'

const { humanStorageSize } = format

export default {
  error404: {
    title: '404',
    description: 'Упс. Здесь пусто...',
    submit: 'Вернуться на главную',
  },
  login: {
    oidcIssuer: 'Ваш OIDC Issuer: {oidcIssuer}',
    authentication: 'Аутентифицироваться',
    oidcIssuerInput: 'Введите адрес своего OIDC Issuer:',
  },
  auth: {
    caption: 'Введите ключ',
  },
  list: {
    explore: 'Очистить поиск',
    create: 'Создать документ',
  },
  archive: {
    search: 'Поиск договора',
    tooltip: 'Начните вводить текст',
    empty: 'Добавьте свой первый договор.',
    example: 'Например:',
    searchEmpty: 'Ничего не найдено. Попробуйте изменить параметры поиска.',
    filterEmpty: 'Ничего не выбрано.',
    notfound: 'Нет результатов',
  },
  header: {
    create: 'Создание',
    archive: 'Архив',
  },
  navigation: {
    version: 'v.{version}',
    title: 'Настройки',
    feedback: {
      label: 'Оставить отзыв о приложении',
      tooltip: 'Если Вы нашли ошибку, напишите нам об этом',
    },
  },
  documentTypes: {
    title: 'Типы договоров',
  },
  settings: {
    native: {
      profile: 'Мой профиль',
      title: 'База данных',
      description: 'Загрузка и выгрузка Ваших договоров.',
      import: 'Выберите файл базы договоров',
      submit: 'Импорт договоров',
      export: 'Экспорт договоров',
      otp: 'Вход по паролю',
    },
    consumer: {
      description: 'Измените Ваше ФИО или почту в новых договорах.',
    },
    otp: {
      removeCode: 'Удалить PIN',
      addCode: 'Установить PIN',
      description: 'Введите цифровой PIN для входа в приложение.',
    },
    keychain: {
      title: 'Управление сертификатами',
      label: 'Экспорт сертификата',
      tooltip: 'Экспорт сертификата в файл',
    },
    clean: {
      description: 'Данное действие безвозвратно удалит Ваши договоры.',
      label: 'Подтвердите удаление своей базы договоров.',
      ok: 'Удалить',
      okAll: 'Удалить + Pod',
      cancel: 'Отмена',
      submit: 'Произвести очистку',
    },
  },
  oidc: {
    linkName: 'Введите адрес OIDC Issuer для получения Вашего WebID',
    issuerHint: 'OIDC Issuer это URL Вашего SOLID провайдера',
    tutorialHint: 'OIDC Issuer это адрес Вашего SOLID сервера',
    login: 'Авторизоваться',
    issuerTooltipEmpty: 'Данные необходимы для подписания договоров.',
    issuerTooltipLogin: 'Войдите через {oidcIssuer}.',
  },
  contract: {
    rules: 'Пожалуйста, введите тип договора',
    type: 'Тип договора',
    hint: 'Название типа договора. Для создания нового нажмите "Enter"',
    option: 'Создать новый тип',
  },
  consumer: {
    type: 'Ваше ФИО',
    email: 'Ваша почта',
    rules: 'Пожалуйста, введите потребителя (заказчика) услуги',
    save: 'Сохранить',
  },
  customer: {
    rules: 'Пожалуйста, введите исполнителя',
    type: 'Исполнитель',
    hint: 'ФИО исполнителя, ИНН или WebID',
    hintEmail: 'Электронная почта исполнителя',
    email: 'Почта исполнителя',
  },
  description: {
    type: 'Примечание',
    hint: 'Используйте текст для примечания',
  },
  duration: {
    noLimit: 'Не имеет срока завершения',
    from: 'Дата начала договора',
    fromHint: 'Дата подачи заявления',
    to: 'Дата окончания договора',
    toHint: 'Дата окончания заявления',
    close: 'Закрыть',
    infinity: 'Бессрочный',
  },
  files: {
    type: 'Приложенные документы',
    hint: 'Добавьте документы в стандарте PDF, PNG или JPG.',
  },
  contractForm: {
    submit: 'Добавить',
    date: 'Открыть календарь',
  },
  tutorial: {
    info: {
      title: 'Как работает сервис',
      body: 'Сервис фиксирует условия договоренностей в надежном хранилище Вашего браузера.<br>Данные хранятся только на Вашем устройстве или на контролируемом Вами SOLID-сервере.<br>Приложение использует внутреннее хранилище браузера IndexDB. Это надежное хранилище, доступ к которому имеете только вы с текущего устройства.',
      ok: 'Далее',
    },
    agreement: {
      title: 'Пользовательское соглашение',
      body: 'Разработчик не осуществляет сбор любых Ваших персональных данных.<br>Приложение распространяется "как есть".<br>Исходный код распространяется по лицензии [GNU General Public License v3.0](https://github.com/gotois/archive/blob/master/LICENSE) и доступен по [ссылке](https://github.com/gotois/archive).<br>Текст пользовательского соглашения доступен по [ссылке](https://archive.gotointeractive.com/privacy).',
      ok: 'Принять',
    },
    data: {
      title: 'Договор на использование',
      body: '',
    },
    signHint: 'Для подписания первого договора используйте свое имя.',
    complete: 'Создать первый договор',
  },
  archiveList: {
    remove: 'Удалить',
    edit: 'Редактировать',
    editPod: 'Pod',
    openFile: 'Открыть окно документа',
    closeFile: 'Закрыть окно документа',
    shareFile: 'Поделиться документом',
    copyFile: 'Скопировать в буфер обмена',
  },
  database: {
    fileSize:
      'Выберите файл размером до ' + humanStorageSize(1024 * 1024 * 1024 * 2),
    fileImport: 'Начать процедуру импорта базы данных',
    fileExport: 'Экспортировать базу в файл',
    loading: 'Загрузка...',
    removeDatabase: 'Произвести удаление базы договоров',
  },
  searchDialog: {
    searchText: 'Тип или исполнитель договора',
    cancel: 'Закрыть',
  },
}
