import { format } from 'quasar'

const productName = 'Мои договоры'
const { humanStorageSize } = format

export default {
  productName,
  organization: {
    prodid: `-//GIC DAO//NONSGML ${productName}//RU`,
  },
  opensearch: {
    title: 'Поиск по архиву договоров',
  },
  pages: {
    create: {
      title: 'Создание договора',
    },
    archive: {
      title: 'Архив договоров',
    },
    auth: {
      title: 'Авторизация',
      caption: 'Введите ключ',
    },
    privacy: {
      title: 'Пользовательское соглашение',
    },
    tutorial: {
      welcome: { title: `Добро пожаловать в сервис "${productName}"` },
      info: { title: 'Как работает наш сервис' },
      agreement: { title: 'Пользовательское соглашение' },
      oidc: { title: 'OIDC' },
      final: { title: 'Договор на использование' },
    },
    pricing: {
      title: 'Цены: сравнение планов',
    },
    unknown: {
      seo: {
        title: 'Страница не найдена',
      },
      title: '404',
      description: 'Упс. Здесь пусто...',
      submit: 'Вернуться на главную',
    },
  },
  login: {
    oidcIssuer: 'Ваш OIDC Issuer: {oidcIssuer}',
    authentication: 'Аутентифицироваться',
  },
  list: {
    explore: 'Очистить поиск',
    create: 'Создать документ',
    calendar: 'Открыть календарь',
  },
  archive: {
    search: 'Поиск договоров',
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
    free: 'Беспл.',
  },
  navigation: {
    version: 'v.{version}',
    title: 'Настройки',
    register: 'Регистрация',
    signout: 'Выйти из Solid',
    signin: 'Войти через WebID',
    support: {
      label: 'Поддержите разработку',
      tooltip: 'Поддержка',
    },
    feedback: {
      label: 'Оставить отзыв о приложении',
      tooltip: 'Если вы нашли ошибку, напишите нам об этом',
    },
    back: 'Вернуться',
    noscript: 'Включите JavaScript для запуска приложения.',
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
      description: 'Измените Ваше ФИО или почту в договорах.',
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
    language: {
      title: 'Язык',
    },
  },
  oidc: {
    issuerHint: 'Выберите URL адрес',
    tutorialHint: 'OIDC Issuer это URL Вашего SOLID провайдера',
    label: 'Адрес OIDC Issuer',
    login: 'Авторизоваться',
    skip: 'Пропустить',
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
    editDialog: {
      message: 'Введите новое описание:',
      success: 'Данные обновлены',
      fail: 'Ошибка в обновлении',
    },
    removeDialog: {
      ok: 'Удалить',
      cancel: 'Отмена',
      message: 'Действительно удалить? Отменить удаление будет невозможно.',
      isLoginMessage:
        'Действительно удалить? Отменить удаление будет невозможно.\nВнимание: данные не будут удалены с вашего Pod.',
      success: 'Контракт "{name}" успешно удален.',
      fail: 'Произошла проблема с удалением данных',
    },
  },
  consumer: {
    type: 'Ваше ФИО',
    email: 'Ваша почта',
    emailRules: 'Введите адрес электронной почты',
    rules: 'Введите потребителя (заказчика) услуги',
    save: 'Сохранить',
    success: 'Профиль обновлен',
  },
  wallet: {
    label: 'Private Key Solana',
    open: 'Открыть диалог Solana',
    disconnected: 'Кошелек отключен',
    accountChanged: 'Аккаунт изменен',
    fail: 'Произошла ошибка привязки крипто кошелька',
    hint: 'Введите адрес вашего Private Key от Solana или авторизуйтесь через кошелек',
  },
  customer: {
    rules: 'Введите исполнителя',
    type: 'Исполнитель',
    hintType: 'Установить Юридическое или Физическое лицо',
    hint: 'ФИО исполнителя, ИНН или WebID',
    contact: 'Контакты',
    hintContact: 'Используйте Email, URL или Tel',
  },
  description: {
    type: 'Примечание',
    hint: 'Используйте простой текст или Markdown для примечания',
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
      ok: 'Принять и продолжить',
      demoHint: 'Начать Демо вход без авторизации. Продолжить?',
    },
    info: {
      title: 'Как работает наш сервис',
      body:
        'Наш сервис работает по следующему принципу: мы фиксируем условия договоренностей в надежном хранилище, доступном только вам либо на вашем физическом устройстве либо на вашем SOLID-сервере.' +
        '<br><br>Чтобы обеспечить безопасность и конфиденциальность вашей информации для хранения данных нашего приложения используется внутреннее хранилище браузера, доступ к которому имеете только вы с текущего устройства. Ваши данные никогда не покидают ваше устройство без вашего явного разрешения.' +
        '<br><br>Таким образом, когда вы используете наш сервис, вы можете быть уверены в сохранности и контроле своих данных.',
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
    },
    wallet: {
      title: 'Подключение криптокошелька',
      skip: 'Пропустить',
      caption: 'Используйте ваш криптографический ключ',
      body: 'Приложение использует блокчейн [Solana](https://solana.com). Для подтверждения ваших транзакций используйте кошелек [Phantom](https://phantom.app) или укажите свой секретный ключ.',
      ok: 'Далее',
    },
    oidc: {
      title: 'Подключение WebID',
      caption: 'Предоставьте ваш уникальный идентификатор',
      body:
        'Вы можете сохранять свои договоры в облаке, наш сервис использует технологию SOLiD. Для работы авторизуйтесь по адресу вашего [OIDC Issuer](# "Отправитель идентификаторов открытых токенов").' +
        "<br><br>Если у вас возникли вопросы или вам требуется помощь, пожалуйста, обратитесь к технической документации стандарта или свяжитесь с нашей [службой поддержки](mailto:support{'@'}gotointeractive.com). Мы готовы ответить на все ваши вопросы по использованию нашего сервиса.",
      ok: 'Далее',
    },
    data: {
      title: 'Подтвердите свою учетную запись',
      body: 'Для работы приложения используйте свое имя и адрес электронной почты. Добавьте свой криптографический ключ DID',
      hint: 'Для установки вашей идентичности договора, нужно знать ваш децентрализованный идентификатор.',
      ok: 'Начать использование',
    },
  },
  pricing: {
    free: {
      title: 'Бесплатно',
      description: 'Услуга хранения договоров',
      price: 'за пользователя/месяц',
      ok: 'Начать',
      support: {
        title: 'Базовая поддержка',
        values: {
          '1': 'Односторонняя обратная текстовая связь',
          '2': 'Обучающие видео (сторис)',
        },
      },
      functions: {
        title: 'Базовый функционал',
        values: {
          '1': 'Хранение и поиск договоров офлайн',
          '2': 'Хранение на внешнем SOLiD сервере',
        },
      },
    },
    premium: {
      title: 'Премиум',
      description: 'Сервис полного управления обязательствами',
      price: 'за пользователя/месяц',
      ok: 'Начать триал',
      support: {
        title: 'Премиальная поддержка',
        values: {
          '1': 'Все, что включено в бесплатную версию, плюс:',
          '2': 'Двусторонняя обратная связь через почту',
        },
      },
      functions: {
        title: 'Расширенный функционал',
        values: {
          '1': 'Все, что включено в бесплатную версию, плюс:',
          '2': 'Криптографическая подпись договоров',
          '3': '10gb места хранения на защищенном отдельном SOLiD сервере',
          '4': 'MINT договоров в NFT',
          '5': 'Верификация договора',
          '6': 'Анализ PDF договоров: понятный пересказ документа (русский и английский язык)',
          '7': 'Вебовый третейский суд',
        },
      },
    },
    vip: {
      title: 'VIP',
      description: 'Решение: «Карманный юрист»',
      price: 'за пользователя/месяц',
      ok: 'Оставить заявку',
      support: {
        title: 'Эксклюзивная поддержка',
        values: {
          '1': 'Все, что включено в бесплатную версию, плюс:',
          '2': 'Голосовая помощь 24/7',
          '3': 'Привилегированные мероприятия обучения',
        },
      },
      functions: {
        title: 'Индивидуальный функционал',
        values: {
          '1': 'Все, что включено в бесплатную версию, плюс:',
          '2': 'Отсутствие телеметрии',
        },
      },
    },
  },
  archiveList: {
    remove: 'Удалить',
    edit: 'Редактировать',
    pod: 'Pod',
    openFile: 'Открыть окно документа',
    closeFile: 'Закрыть окно документа',
    shareFile: 'Поделиться документом',
  },
  database: {
    fileSize:
      'Выберите файл размером до ' + humanStorageSize(1024 * 1024 * 1024 * 2),
    fileImport: 'Начать процедуру импорта базы данных',
    fileExport: 'Экспортировать базу в файл',
    removeDatabase: 'Произвести удаление базы договоров',
    pod: {
      disconnected: 'Вы отключили привязку к вашему Pod',
      sync: 'Синхронизировать прежние записи с Pod',
    },
  },
  searchDialog: {
    searchText: 'Тип или исполнитель договоров',
    cancel: 'Закрыть',
  },
  calendar: {
    days: 'Воскресенье_Понедельник_Вторник_Среда_Четверг_Пятница_Суббота_Воскресенье',
    daysShort: 'Вс_Пн_Вт_Ср_Чт_Пт_Сб',
    months:
      'Январь_Февраль_Март_Апрель_Май_Июнь_Июль_Август_Сентябрь_Октябрь_Ноябрь_Декабрь',
    monthsShort: 'Янв_Фев_Мар_Апр_Май_Июн_Июл_Авг_Сен_Окт_Ноя_Дек',
  },
  components: {
    otp: {
      processing: 'Пожалуйста, подождите...',
      fail: 'Неверный ключ',
      pinDialog: {
        message: 'Действительно удалить пин?',
        success: 'Ключ отключен',
        fail: 'Произошла ошибка',
      },
      saveDialog: {
        message: 'Действительно сохранить PIN?',
        success: 'PIN сохранен',
        fail: 'Ошибка в сохранении PIN',
      },
    },
    oidcIssuer: {
      label: 'Адрес URL',
      input: 'Введите адрес своего OIDC Issuer:',
      fail: 'OIDC Issuer cannot be empty',
      processing: 'Идет аутентификация. Пожалуйста, подождите...',
      authorizeDialog: {
        message:
          'Ваши договоры не будут сохраняться на сервере SOLiD. Вы не сможете создавать токены ваших документов. Продолжить?',
        fail: 'Произошла ошибка входа через OIDC',
      },
    },
    keypair: {
      generate: {
        label: 'Сгенерировать ключ',
        tooltip: 'Сгенерировать новый ключ',
      },
      import: {
        label: 'Импортировать файл ключа',
        tooltip: 'Импортировать существующий ключ',
        fail: 'Произошла ошибка чтения файла',
      },
      export: {
        dialog: {
          message: 'Вы хотите сохранить файл ключа локально?',
          success: 'Ключи сгенерированы и хранятся в памяти Вашего устройства.',
          fail: 'Ваш ключ не удалось сохранить локально на устройстве.',
        },
      },
    },
    database: {
      fileImportDialog: {
        title: 'Импорт договоров',
        message: 'Нажмите Ок чтобы начать процедуру импорта',
        fail: 'Импорт неудачен',
      },
      fileRejected: 'Выбранный файл слишком велик',
      fileExportDialog: {
        title: 'Экспорт договоров',
        prompt: 'Введите название файла договоров:',
        message: 'Подготовка...',
        progress: 'Создание... {percentage}%',
        success: 'Файл сохранен',
        fail: 'Ошибка при экспорте файла',
      },
    },
    databaseRemove: {
      success: 'База данных удалена. Дождитесь перезагрузки.',
      fail: 'Произошла ошибка.',
    },
    archiveList: {
      sheet: {
        title: 'Выберите действие',
        link: {
          label: 'Поделиться ссылкой',
          success: 'Ссылка скопирована в буфер обмена',
          fail: 'Ошибка копирования',
        },
        share: {
          label: 'Поделиться документом',
          fail: 'Произошла ошибка шеринга файла',
        },
        event: {
          native: {
            label: 'Скачать ICS',
            fail: 'Ошибка скачивания файла',
          },
          google: {
            label: 'Добавить в Google календарь',
          },
        },
        upload: {
          label: 'Загрузить на POD',
          success: 'Данные записаны на Ваш Pod',
          fail: 'Произошла ошибка записи данных',
        },
        mail: {
          label: 'Отправить сообщение',
        },
        telephone: {
          label: 'Позвонить',
        },
        law: {
          label: 'Оспорить в суде',
        },
      },
    },
    contractForm: {
      resetDialog: {
        message: 'Вы действительно хотите очистить форму?',
      },
      selectDate: {
        fail: 'Начало даты не может быть позже сегодняшней',
      },
      wrongDate: {
        fail: 'Неизвестный тип даты',
      },
      submitDate: {
        invalidStartDate: 'Неверная дата подачи заявления',
        invalidEndDate: 'Неверная дата окончания заявления',
        invalidSelectDate: 'Начальная дата не может быть старше конечной даты',
        success: 'Запись {id} добавлена',
        fail: 'Запись не удалась',
        redirect: 'Перейти',
      },
    },
    imageContextMenu: {
      open: 'Открыть файл',
      copy: 'Скопировать в буфер обмена',
      success: 'Данные сохранены в буфер обмена',
      fail: 'Произошла ошибка',
    },
  },
  copy: {
    success: 'Скопировано в буфер обмена',
  },
}
