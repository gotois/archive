import { format } from 'quasar'
import { productName } from '../../../package.json'

const { humanStorageSize } = format

export default {
  organization: {
    prodid: `-//GIC DAO//NONSGML ${productName}//RU`,
  },
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
    demo: 'Демо',
  },
  navigation: {
    version: 'v.{version}',
    title: 'Настройки',
    register: 'Регистрация',
    signout: 'Выйти из Solid',
    signin: 'Войти через WebID',
    feedback: {
      label: 'Оставить отзыв о приложении',
      tooltip: 'Если вы нашли ошибку, напишите нам об этом',
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
    issuerHint: 'Выберите URL адрес',
    tutorialHint: 'OIDC Issuer это URL Вашего SOLID провайдера',
    label: 'Адрес OIDC Issuer',
    login: 'Авторизоваться',
    issuerTooltipEmpty: 'Данные необходимы для подписания договоров.',
    issuerTooltipLogin: 'Войдите через {oidcIssuer}.',
  },
  contract: {
    rules: 'Введите тип договора',
    type: 'Тип договора',
    hint: {
      desktop:
        'Выбор типа договора. Для создания нового используйте клавишу "Tab" или "⏎"',
      mobile: 'Для создания нового нажмите "ввод" на клавиатуре',
    },
    option: 'Создать новый тип',
  },
  consumer: {
    type: 'Ваше ФИО',
    email: 'Ваша почта',
    emailRules: 'Введите адрес электронной почты',
    rules: 'Введите потребителя (заказчика) услуги',
    save: 'Сохранить',
  },
  wallet: {
    label: 'Private Key Solana',
    hint: 'Введите адрес вашего Private Key от Solana или авторизуйтесь через кошелек',
  },
  customer: {
    rules: 'Введите исполнителя',
    type: 'Исполнитель',
    hint: 'ФИО исполнителя, ИНН или WebID',
    hintEmail: 'Электронная почта исполнителя',
    email: 'Почта',
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
    welcome: {
      title: `Добро пожаловать в "${productName}"`,
      body: 'Удобная и безопасная фиксация любых договоренностей на ваших устройствах.',
      ok: 'Продолжить',
    },
    info: {
      title: 'Как работает наш сервис',
      body:
        'Наш сервис работает по следующему принципу: мы фиксируем условия договоренностей в надежном хранилище, доступном только вам либо на вашем физическом устройстве либо на вашем SOLID-сервере.' +
        '<br><br>Чтобы обеспечить безопасность и конфиденциальность вашей информации для хранения данных нашего приложения используется внутреннее хранилище браузера, доступ к которому имеете только вы с текущего устройства. Ваши данные никогда не покидают ваше устройство без вашего явного разрешения.' +
        '<br><br>Таким образом, когда вы используете наш сервис, вы можете быть уверены в сохранности и контроле своих данных.',
      ok: 'Далее',
    },
    agreement: {
      title: 'Пользовательское соглашение',
      caption: 'Примите пользовательское соглашение',
      body:
        'Мы хотим убедить вас в том, что наш сервис не собирает никакую вашу персональную информацию. Мы ценим вашу конфиденциальность и уделяем большое внимание защите ваших данных.' +
        '<br><br>Наше приложение распространяется "как есть", без каких-либо гарантий или обязательств. Мы приложим все усилия, чтобы обеспечить его работоспособность и безопасность, но мы не несем ответственности за возможные ошибки или проблемы, возникающие при его использовании.' +
        '<br><br>[Исходный код приложения](https://github.com/gotois/archive) распространяется в соответствии с лицензией:' +
        '<br>[GNU General Public License v3.0](https://github.com/gotois/archive/blob/master/LICENSE).' +
        '<br><br>Текст полного пользовательского соглашения доступен по ссылке: [Пользовательское соглашение](https://archive.gotointeractive.com/privacy). Мы рекомендуем вам внимательно прочитать его, чтобы полностью понять условия использования нашего сервиса.',
      ok: 'Принять',
    },
    wallet: {
      title: 'Подключение криптокошелька',
      caption: 'Используйте ваш криптографический ключ',
      body: 'Приложение использует блокчейн [Solana](https://solana.com). Для подтверждения ваших транзакций используйте кошелек [Phantom](https://phantom.app) или укажите свой секретный ключ.',
      ok: 'Далее',
    },
    oidc: {
      title: 'Подключение WebID',
      caption: 'Предоставьте ваш уникальный идентификатор',
      body:
        'Чтобы продолжить использование нашего сервиса введите ниже адрес вашего [OIDC Issuer](# "Отправитель идентификаторов открытых токенов").' +
        "<br><br>Если у вас возникли вопросы или вам требуется помощь, пожалуйста, обратитесь к технической документации стандарта или свяжитесь с нашей [службой поддержки](mailto:support{'@'}gotointeractive.com). Мы готовы ответить на все ваши вопросы по использованию нашего сервиса.",
      ok: 'Далее',
    },
    data: {
      title: 'Подтвердите свою учетную запись',
      body: 'Для работы приложения используйте свое имя и адрес электронной почты.',
      ok: 'Начать использование',
    },
  },
  archiveList: {
    remove: 'Удалить',
    edit: 'Редактировать',
    pod: 'Pod',
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
