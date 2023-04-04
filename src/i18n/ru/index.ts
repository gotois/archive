import { format } from 'quasar'

const { humanStorageSize } = format

export default {
  error404: {
    title: '404',
    description: 'Упс. Здесь пусто...',
    submit: 'Вернуться на главную',
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
    searchEmpty: 'Ничего не найдено. Попробуйте изменить параметры поиска.',
    notfound: 'Нет результатов',
  },
  header: {
    title: 'Мои договоры',
    create: 'Создание',
    archive: 'Архив',
  },
  navigation: {
    version: 'v.',
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
      description: 'Измените Ваше ФИО в новых договорах.',
    },
    otp: {
      label: 'Используйте цифры',
      description: 'Введите PIN для входа в приложение.',
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
  contract: {
    rules: 'Пожалуйста, введите тип договора',
    type: 'Тип договора',
    hint: 'Название типа договора',
    option: 'Создать новый тип',
  },
  consumer: {
    type: 'Ваше ФИО',
    rules: 'Пожалуйста, введите потребителя (заказчика) услуги',
    save: 'Сохранить',
  },
  customer: {
    rules: 'Пожалуйста, введите исполнителя',
    type: 'Исполнитель',
    hint: 'ФИО исполнителя, ИНН или WebID',
  },
  description: {
    type: 'Примечание',
  },
  duration: {
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
      body: 'Сервис фиксирует условия договоренностей в надежном хранилище Вашего браузера.\n\nДанные хранятся только на Вашем устройстве и контролируемом Вами SOLID-сервере.\nПриложение использует внутреннее хранилище браузера IndexDB. Это надежное хранилище, доступ к которому имеете только вы с текущего устройства.',
      ok: 'Далее',
    },
    agreement: {
      title: 'Пользовательское соглашение',
      body: 'Разработчик не осуществляет сбор любых Ваших персональных данных. \nПриложение распространяется "как есть". Исходный код распространяется по лицензии MIT и доступен по ссылке [https://github.com/gotois/archive]. \nТекст пользовательского соглашения доступен по ссылке [https://archive.gotointeractive.com/privacy]',
      ok: 'Принять',
    },
    data: {
      title: 'Данные пользователя',
      body: '',
    },
    complete: 'Создать первый договор',
    otp: 'Опционально введите пин код',
  },
  archiveList: {
    remove: 'Удалить',
    edit: 'Редактировать',
    editPod: 'Редактировать + Pod',
    openFile: 'Открыть окно документа',
    closeFile: 'Закрыть окно документа',
    shareFile: 'Поделиться документом',
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
    search: 'Найти',
  },
}
