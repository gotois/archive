<template>
  <QScrollArea
    class="absolute-full fit fullscreen flex flex-center"
    :class="{
      'bg-white text-dark': !$q.dark.isActive,
      'bg-dark text-white': $q.dark.isActive,
    }"
  >
    <QCard
      flat
      class="bg-accent self-baseline"
      square
      style="padding-top: 120px"
      :style="{
        paddingLeft: $q.platform.is.desktop ? 'calc(50vw / 2)' : null,
        paddingRight: $q.platform.is.desktop ? 'calc(50vw / 2)' : null,
      }"
    >
      <h1
        class="text-white text-uppercase text-center text-weight-light no-margin no-padding"
        :style="{
          'font-size': !$q.platform.is.desktop ? '5vmax' : '3vmax',
          'line-height': 1,
        }"
      >
        Ваш "Виртуальный&#x202F;секретарь"
      </h1>
      <h2
        class="text-white text-weight-medium"
        style="font-size: x-large; line-height: 1"
        :class="{
          'text-center no-padding': $q.platform.is.desktop,
          'text-left q-pa-md': !$q.platform.is.desktop,
        }"
      >
        Решение автоматизирует планирование, повышает продуктивность и помогает
        достичь баланса между работой и жизнью, индивидуально адаптируясь под
        потребности каждого пользователя.
      </h2>

      <QCardActions align="center">
        <QBtn
          color="white"
          class="q-ma-lg"
          :style="{ paddingLeft: '24px', paddingRight: '24px' }"
          :class="{ 'full-width': !$q.platform.is.desktop }"
          glossy push fab
          @click="registerPage"
        >
          <QIcon v-if="$q.platform.is.desktop" name="img:/icons/safari-pinned-tab.svg" />
          <span class="q-ml-xs text-accent text-weight-bolder">Подключиться</span>
        </QBtn>
      </QCardActions>

      <QSpace class="q-mb-xl" />

      <div class="flex justify-center row">
        <QCardSection
          class="flex q-pt-none col-12"
          :class="{
            'text-left': $q.platform.is.desktop,
            'text-center': !$q.platform.is.desktop,
          }"
        >
          <QBtn v-if="!langStore.isRussian" class="q-ma-xs" icon="play_arrow" color="black" :href="GOOGLE_PLAY_URL">
            Google Play
          </QBtn>
          <QBtn v-if="TELEGRAM_BOT_NAME" icon="telegram" class="q-ma-xs" color="blue" :href="`https://t.me/${TELEGRAM_BOT_NAME}?start=start`">
            Telegram
          </QBtn>
        </QCardSection>
      </div>
    </QCard>

    <h2
      :class="{
        'text-center q-ma-md': $q.platform.is.desktop,
        'q-pl-md q-pr-md': !$q.platform.is.desktop,
      }"
    >
      Персональный помощник для управления временем и задачами
    </h2>

    <div class="flex justify-center full-width">
      <QCard
        flat
        class="q-ma-xs full-width"
        :style="{
          paddingLeft: $q.platform.is.desktop ? 'calc(50vw / 2)' : null,
          paddingRight: $q.platform.is.desktop ? 'calc(50vw / 2)' : null,
        }"
      >
        <QCardSection>
          <div class="text-subtitle1">
            Секретарь — это умный планировщик задач, который:
          </div>
        </QCardSection>
        <QList>
          <QItem>
            <QItemSection avatar>
              <QIcon color="accent" name="psychology" />
            </QItemSection>
            <QItemSection>
              <QItemLabel>Понимает цели на русском языке</QItemLabel>
              <QItemLabel caption>Просто скажите или напишите что нужно сделать — без шаблонов и форм</QItemLabel>
            </QItemSection>
          </QItem>
          <QItem>
            <QItemSection avatar>
              <QIcon color="accent" name="sort" />
            </QItemSection>
            <QItemSection>
              <QItemLabel>Автоматически расставляет приоритеты</QItemLabel>
              <QItemLabel caption>Сортирует задачи по важности, срочности и контексту (работа / личное)</QItemLabel>
            </QItemSection>
          </QItem>
          <QItem>
            <QItemSection avatar>
              <QIcon color="accent" name="calendar_today" />
            </QItemSection>
            <QItemSection>
              <QItemLabel>Сразу показывает задачи во времени</QItemLabel>
              <QItemLabel caption>Все задачи видны в календаре — без лишних действий</QItemLabel>
            </QItemSection>
          </QItem>
          <QItem>
            <QItemSection avatar>
              <QIcon color="accent" name="sync" />
            </QItemSection>
            <QItemSection>
              <QItemLabel>Интегрируется с другими сервисами</QItemLabel>
              <QItemLabel caption>Подключайте календари, модели ИИ и сервисы напоминаний</QItemLabel>
            </QItemSection>
          </QItem>
        </QList>
        <QCardSection class="q-pt-none text-left">
          1. Создание и регистрация* документов
          <QSeparator spaced inset />
          2. Организация движения* и учета документов*
          <QSeparator spaced inset />
          3. Хранение документов
        </QCardSection>
        <div>* В разработке</div>
      </QCard>
    </div>

    <h2
      :class="{
        'text-center q-ma-md': $q.platform.is.desktop,
        'q-pl-md q-pr-md': !$q.platform.is.desktop,
      }"
    >
      Почему это удобно
    </h2>
    <div class="flex justify-center" :class="{ row: $q.platform.is.desktop }">
      <QCard class="q-ma-md col-3" :bordered="$q.platform.is.desktop" flat>
        <QCardSection>
          <div class="text-h6">Электронный архив задач и расписаний</div>
          <div class="text-subtitle2">
            Виртуальный секретарь сохраняет и упорядочивает ваши планы, задачи и
            события, обеспечивая их доступность и простое управление через
            цифровую децентрализованную платформу.
          </div>
        </QCardSection>
      </QCard>
      <QCard class="q-ma-md col-3" :bordered="$q.platform.is.desktop" flat>
        <QCardSection>
          <div class="text-h6">Безопасность данных</div>
          <div class="text-subtitle2">
            Система защищает ваши данные с помощью современных методов
            шифрования и дает полный контроль над информацией, интегрированной с
            внешними источниками.
          </div>
        </QCardSection>
      </QCard>
      <QCard class="q-ma-md col-3" :bordered="$q.platform.is.desktop" flat>
        <QCardSection>
          <div class="text-h6">Дружелюбная и адаптивная платформа</div>
          <div class="text-subtitle2">
            Интерфейс виртуального секретаря интуитивно понятен, а алгоритмы
            искусственного интеллекта помогают организовать задачи и принимать
            решения с учетом ваших предпочтений.
          </div>
        </QCardSection>
      </QCard>
      <QCard class="q-ma-md col-3" :bordered="$q.platform.is.desktop" flat>
        <QCardSection>
          <div class="text-h6">Доступность и поддержка</div>
          <div class="text-subtitle2">
            Платформа предоставляет круглосуточную поддержку и инструменты для
            быстрого начала работы, независимо от уровня технологической
            подготовки пользователя.
          </div>
        </QCardSection>
      </QCard>
      <QCard class="q-ma-md col-3" :bordered="$q.platform.is.desktop" flat>
        <QCardSection>
          <div class="text-h6">Обеспечение согласованности в управлении временем между участниками</div>
          <div class="text-subtitle2">
            1. Создание расписания и его синхронизация с внешними системами.<br />
            2. Рекомендации по приоритетам на основе анализа данных.<br />
            3. Хранение, обновление и автоматическая передача договора.
          </div>
        </QCardSection>
      </QCard>
    </div>

    <h2
      :class="{
        'text-center q-ma-md': $q.platform.is.desktop,
        'q-pl-md q-pr-md': !$q.platform.is.desktop,
      }"
    >
      Сохраняйте концентрацию и безопасность
    </h2>
    <div class="flex justify-center" :class="{ row: $q.platform.is.desktop }">
      <QCard class="q-ma-md col-3" :bordered="$q.platform.is.desktop" flat>
        <QCardSection>
          <div class="row items-center q-gutter-sm q-mb-sm">
            <QIcon name="directions_car" color="accent" size="sm" />
            <div class="text-h6">Безопасность на дороге</div>
          </div>
          <div class="text-subtitle2">
            Вы едете и вспомнили, что нужно забрать вещи из химчистки. Вместо
            того чтобы набирать текст за рулём, просто нажмите кнопку и скажите:
          </div>
        </QCardSection>
        <QCardSection class="q-pt-none">
          <QCard flat class="bg-grey-2 text-dark rounded-borders q-pa-sm q-mb-xs">
            <QIcon name="mic" size="xs" class="q-mr-xs" />
            <em>«Напомни, когда приеду на работу, зайти в химчистку»</em>
          </QCard>
          <QCard flat class="bg-grey-2 text-dark rounded-borders q-pa-sm">
            <QIcon name="mic" size="xs" class="q-mr-xs" />
            <em>«Напомни про химчистку в 19:00»</em>
          </QCard>
        </QCardSection>
      </QCard>

      <QCard class="q-ma-md col-3" :bordered="$q.platform.is.desktop" flat>
        <QCardSection>
          <div class="row items-center q-gutter-sm q-mb-sm">
            <QIcon name="notifications_off" color="accent" size="sm" />
            <div class="text-h6">Борьба с информационным шумом</div>
          </div>
          <div class="text-subtitle2">
            Входящие сообщения и уведомления отвлекают. Голосовое напоминание
            позволяет сразу зафиксировать мысль, не теряя фокус.
          </div>
        </QCardSection>
        <QCardSection class="q-pt-none">
          <div class="text-caption q-mb-xs text-grey-7">Пример: читаете статью и видите книгу, которую давно хотели прочесть:</div>
          <QCard flat class="bg-grey-2 text-dark rounded-borders q-pa-sm">
            <QIcon name="mic" size="xs" class="q-mr-xs" />
            <em>«Напомни вечером найти книгу "…"»</em>
          </QCard>
        </QCardSection>
      </QCard>

      <QCard class="q-ma-md col-3" :bordered="$q.platform.is.desktop" flat>
        <QCardSection>
          <div class="row items-center q-gutter-sm q-mb-sm">
            <QIcon name="place" color="accent" size="sm" />
            <div class="text-h6">Гео-контекст</div>
          </div>
          <div class="text-subtitle2">
            Секретарь понимает не только время, но и активность.
          </div>
        </QCardSection>
        <QCardSection class="q-pt-none">
          <QCard flat class="bg-grey-2 text-dark rounded-borders q-pa-sm q-mb-xs">
            <QIcon name="mic" size="xs" class="q-mr-xs" />
            <em>«Напомни прочитать договор, когда приду домой и сяду за компьютер»</em>
          </QCard>
          <div class="text-caption text-grey-7 q-mt-xs">
            Секретарь сам поймёт, где и когда вы сможете выполнить задачу, и напомнит именно в нужный момент.
          </div>
        </QCardSection>
      </QCard>
    </div>

    <h2
      :class="{
        'text-center q-ma-md': $q.platform.is.desktop,
        'q-pl-md q-pr-md': !$q.platform.is.desktop,
      }"
    >
      Сравнение с другими сервисами
    </h2>

    <div
      v-if="$q.platform.is.desktop"
      class="flex justify-center full-width q-mb-lg"
      :style="{
        paddingLeft: 'calc(50vw / 4)',
        paddingRight: 'calc(50vw / 4)',
      }"
    >
      <QMarkupTable flat bordered wrap-cells class="full-width">
        <thead>
          <tr>
            <th class="text-left">Возможности</th>
            <th class="text-center">Секретарь</th>
            <th class="text-center">Todoist</th>
            <th class="text-center">TickTick</th>
            <th class="text-center">Apple Siri</th>
            <th class="text-center">Алиса</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Понимает задачи на обычном языке</td>
            <td class="text-center">✅</td>
            <td class="text-center">⚠️ только дата и время</td>
            <td class="text-center">⚠️ только дата и время</td>
            <td class="text-center">⚠️ понимает голос</td>
            <td class="text-center">⚠️ часто ошибается</td>
          </tr>
          <tr>
            <td>Автоматическая сортировка задач (работа / личное)</td>
            <td class="text-center">✅</td>
            <td class="text-center">❌</td>
            <td class="text-center">❌</td>
            <td class="text-center">❌</td>
            <td class="text-center">❌</td>
          </tr>
          <tr>
            <td>Автоматическая расстановка приоритетов</td>
            <td class="text-center">✅</td>
            <td class="text-center">❌</td>
            <td class="text-center">❌</td>
            <td class="text-center">❌</td>
            <td class="text-center">❌</td>
          </tr>
          <tr>
            <td>Все задачи сразу видны в календаре</td>
            <td class="text-center">✅</td>
            <td class="text-center">⚠️ через интеграции</td>
            <td class="text-center">✅</td>
            <td class="text-center">⚠️ через Reminders</td>
            <td class="text-center">⚠️ через календарь</td>
          </tr>
          <tr>
            <td>Работает на разных устройствах</td>
            <td class="text-center">✅</td>
            <td class="text-center">✅</td>
            <td class="text-center">✅</td>
            <td class="text-center">❌ только Apple</td>
            <td class="text-center">⚠️ в основном Яндекс</td>
          </tr>
          <tr>
            <td>Уведомления в мессенджерах (Telegram)</td>
            <td class="text-center">✅</td>
            <td class="text-center">❌</td>
            <td class="text-center">❌</td>
            <td class="text-center">❌</td>
            <td class="text-center">❌</td>
          </tr>
        </tbody>
      </QMarkupTable>
    </div>

    <!-- Mobile: collapse по конкурентам -->
    <QList
      v-else
      bordered
      separator
      class="q-ma-sm rounded-borders"
    >
      <QExpansionItem icon="task_alt" label="Секретарь" default-opened>
        <QCard flat>
          <QList dense>
            <QItem><QItemSection>✅ Понимает задачи на обычном языке</QItemSection></QItem>
            <QItem><QItemSection>✅ Автоматическая сортировка (работа / личное)</QItemSection></QItem>
            <QItem><QItemSection>✅ Автоматическая расстановка приоритетов</QItemSection></QItem>
            <QItem><QItemSection>✅ Все задачи видны в календаре</QItemSection></QItem>
            <QItem><QItemSection>✅ Работает на разных устройствах</QItemSection></QItem>
            <QItem><QItemSection>✅ Уведомления в Telegram</QItemSection></QItem>
          </QList>
        </QCard>
      </QExpansionItem>
      <QExpansionItem icon="check_box_outline_blank" label="Todoist">
        <QCard flat>
          <QList dense>
            <QItem><QItemSection>⚠️ Понимает только дату и время</QItemSection></QItem>
            <QItem><QItemSection>❌ Нет сортировки по контексту</QItemSection></QItem>
            <QItem><QItemSection>❌ Нет авто-приоритетов</QItemSection></QItem>
            <QItem><QItemSection>⚠️ Календарь через интеграции</QItemSection></QItem>
            <QItem><QItemSection>✅ Работает на разных устройствах</QItemSection></QItem>
            <QItem><QItemSection>❌ Нет уведомлений в Telegram</QItemSection></QItem>
          </QList>
        </QCard>
      </QExpansionItem>
      <QExpansionItem icon="check_box_outline_blank" label="TickTick">
        <QCard flat>
          <QList dense>
            <QItem><QItemSection>⚠️ Понимает только дату и время</QItemSection></QItem>
            <QItem><QItemSection>❌ Нет сортировки по контексту</QItemSection></QItem>
            <QItem><QItemSection>❌ Нет авто-приоритетов</QItemSection></QItem>
            <QItem><QItemSection>✅ Задачи видны в календаре</QItemSection></QItem>
            <QItem><QItemSection>✅ Работает на разных устройствах</QItemSection></QItem>
            <QItem><QItemSection>❌ Нет уведомлений в Telegram</QItemSection></QItem>
          </QList>
        </QCard>
      </QExpansionItem>
      <QExpansionItem icon="check_box_outline_blank" label="Apple Siri">
        <QCard flat>
          <QList dense>
            <QItem><QItemSection>⚠️ Понимает голос</QItemSection></QItem>
            <QItem><QItemSection>❌ Нет сортировки по контексту</QItemSection></QItem>
            <QItem><QItemSection>❌ Нет авто-приоритетов</QItemSection></QItem>
            <QItem><QItemSection>⚠️ Через Reminders</QItemSection></QItem>
            <QItem><QItemSection>❌ Только Apple</QItemSection></QItem>
            <QItem><QItemSection>❌ Нет уведомлений в Telegram</QItemSection></QItem>
          </QList>
        </QCard>
      </QExpansionItem>
      <QExpansionItem icon="check_box_outline_blank" label="Алиса">
        <QCard flat>
          <QList dense>
            <QItem><QItemSection>⚠️ Часто ошибается</QItemSection></QItem>
            <QItem><QItemSection>❌ Нет сортировки по контексту</QItemSection></QItem>
            <QItem><QItemSection>❌ Нет авто-приоритетов</QItemSection></QItem>
            <QItem><QItemSection>⚠️ Через календарь</QItemSection></QItem>
            <QItem><QItemSection>⚠️ В основном Яндекс</QItemSection></QItem>
            <QItem><QItemSection>❌ Нет уведомлений в Telegram</QItemSection></QItem>
          </QList>
        </QCard>
      </QExpansionItem>
    </QList>

    <h2
      :class="{
        'text-center q-ma-md': $q.platform.is.desktop,
        'q-pl-md q-pr-md': !$q.platform.is.desktop,
      }"
    >
      Открытые стандарты и децентрализация
    </h2>

    <div class="flex justify-center" :class="{ row: $q.platform.is.desktop }">
      <QCard class="q-ma-md col-3" :bordered="$q.platform.is.desktop" flat>
        <QCardSection>
          <div class="row items-center q-gutter-sm q-mb-sm">
            <QIcon name="calendar_month" color="accent" size="sm" />
            <div class="text-h6">Классический веб</div>
          </div>
          <div class="text-subtitle2 text-weight-bold">iCalendar</div>
          <div class="text-subtitle2">Хранение данных в текстовом формате — совместимо с Google Calendar, Apple Calendar и любым другим клиентом.</div>
        </QCardSection>
      </QCard>
      <QCard class="q-ma-md col-3" :bordered="$q.platform.is.desktop" flat>
        <QCardSection>
          <div class="row items-center q-gutter-sm q-mb-sm">
            <QIcon name="schema" color="accent" size="sm" />
            <div class="text-h6">Семантический веб</div>
          </div>
          <div class="text-subtitle2 text-weight-bold">JSON-LD</div>
          <div class="text-subtitle2">Хранение данных в базе знаний — задачи понимают машины, а не только люди.</div>
        </QCardSection>
      </QCard>
      <QCard class="q-ma-md col-3" :bordered="$q.platform.is.desktop" flat>
        <QCardSection>
          <div class="row items-center q-gutter-sm q-mb-sm">
            <QIcon name="hub" color="accent" size="sm" />
            <div class="text-h6">Социальный веб</div>
          </div>
          <div class="text-subtitle2 text-weight-bold">Fediverse</div>
          <div class="text-subtitle2">Хранение данных децентрализованно — ваши задачи не заперты внутри одного сервиса.</div>
        </QCardSection>
      </QCard>
    </div>

    <QBanner
      class="q-ma-md bg-accent text-white rounded-borders"
      :style="{
        marginLeft: $q.platform.is.desktop ? 'calc(50vw / 4)' : null,
        marginRight: $q.platform.is.desktop ? 'calc(50vw / 4)' : null,
      }"
      rounded
    >
      <template #avatar>
        <QIcon name="swap_horiz" color="white" />
      </template>
      Таким образом появляется система, где задачи «летают» между разными сервисами, ботами и людьми
    </QBanner>

    <QList
      :padding="$q.platform.is.desktop"
      class="q-mb-md"
      :style="{
        marginLeft: $q.platform.is.desktop ? 'calc(50vw / 4)' : null,
        marginRight: $q.platform.is.desktop ? 'calc(50vw / 4)' : null,
      }"
    >
      <QItem>
        <QItemSection avatar><QIcon color="accent" name="electrical_services" /></QItemSection>
        <QItemSection>
          <QItemLabel>Подключение любых MCP клиентов</QItemLabel>
        </QItemSection>
      </QItem>
      <QItem>
        <QItemSection avatar><QIcon color="accent" name="hub" /></QItemSection>
        <QItemSection>
          <QItemLabel>Список задач не заперт внутри бота — используется мощь Fediverse</QItemLabel>
        </QItemSection>
      </QItem>
      <QItem>
        <QItemSection avatar><QIcon color="accent" name="event" /></QItemSection>
        <QItemSection>
          <QItemLabel>Единый стандарт данных iCal</QItemLabel>
        </QItemSection>
      </QItem>
      <QItem>
        <QItemSection avatar><QIcon color="accent" name="verified" /></QItemSection>
        <QItemSection>
          <QItemLabel>Корпоративная безопасность с использованием Verifiable Credentials</QItemLabel>
        </QItemSection>
      </QItem>
      <QItem>
        <QItemSection avatar><QIcon color="accent" name="history" /></QItemSection>
        <QItemSection>
          <QItemLabel>Прозрачная история действий (Outbox)</QItemLabel>
        </QItemSection>
      </QItem>
    </QList>

    <QBanner
      class="q-ma-md rounded-borders"
      :class="{
        'bg-grey-2 text-dark': !$q.dark.isActive,
        'bg-grey-9 text-white': $q.dark.isActive,
      }"
      :style="{
        marginLeft: $q.platform.is.desktop ? 'calc(50vw / 4)' : null,
        marginRight: $q.platform.is.desktop ? 'calc(50vw / 4)' : null,
      }"
      rounded
    >
      <template #avatar>
        <QIcon name="lock" color="accent" />
      </template>
      <div class="text-subtitle1 text-weight-bold q-mb-xs">Нужна корпоративная безопасность?</div>
      <div class="text-subtitle2">
        Вы можете приобрести Секретаря и развернуть его на собственном сервере —
        полный контроль над данными без зависимости от внешней инфраструктуры.
      </div>
      <template #action>
        <QBtn flat color="accent" label="Подключиться" @click="registerPage" />
      </template>
    </QBanner>

    <QSpace class="q-mt-xl" />

    <QCard flat>
      <!--  AND location !== RU-->
      <PricingComponent
        class="fit"
        :class="{
          'row q-pa-md q-gutter-md': $q.platform.is.desktop,
          'q-gutter-xs': !$q.platform.is.desktop,
        }"
      />
    </QCard>

    <QTimeline class="q-mt-md q-mb-md q-pl-md q-pr-md">
      <h2
        :class="{
          'text-center': $q.platform.is.desktop,
          'q-pl-md q-pr-md': !$q.platform.is.desktop,
        }"
      >
        Как это работает
      </h2>
      <h3 class="text-subtitle1 text-center">
        Автоматизация стадий организации, планирования и управления временем
      </h3>
      <div
        :style="{
          marginLeft: $q.platform.is.desktop ? 'calc(50vw / 2)' : null,
          marginRight: $q.platform.is.desktop ? 'calc(50vw / 2)' : null,
        }"
      >
        <QTimelineEntry title="Авторизация Telegram" subtitle="Шаг 1" color="accent" icon="key" class="text-left">
          <div>Авторизуйте свой аккаунт через Telegram.</div>
        </QTimelineEntry>
        <QTimelineEntry title="Установка Web Id" subtitle="Шаг 2" color="accent" icon="memory" class="text-left">
          <div>Выберите свой Solid Pod сервер где вы будете хранить свои документы.</div>
        </QTimelineEntry>
        <QTimelineEntry title="Электронная подпись Ed25519" subtitle="Шаг 3" color="accent" icon="done_outline" class="text-left">
          <div>Загрузите или сгенерируйте свою электронную подпись Ed25519.</div>
        </QTimelineEntry>
        <QTimelineEntry title="Сформируйте обязательство" subtitle="Шаг 4" color="positive" icon="done_all" class="text-left">
          <div>
            Общайтесь с Секретарем и формируйте файлы договора и создавайте
            маршруты его подписания с агентами.
          </div>
        </QTimelineEntry>
      </div>
    </QTimeline>

    <h3
      :class="{
        'text-center': $q.platform.is.desktop,
        'q-pl-md q-pr-md': !$q.platform.is.desktop,
      }"
    >Часто задаваемые вопросы</h3>
    <QList
      :padding="$q.platform.is.desktop"
      class="q-mb-xl rounded-borders text-left"
      :style="{
        marginLeft: $q.platform.is.desktop ? 'calc(50vw / 2)' : null,
        marginRight: $q.platform.is.desktop ? 'calc(50vw / 2)' : null,
      }"
    >
      <QExpansionItem expand-separator label="Как вы обеспечиваете безопасность данных?" caption="Данные не хранятся на сервере">
        <QCard>
          <QCardSection class="text-left">
            Виртуальный секретарь использует современные методы шифрования при
            передаче данных. Данные не хранятся на сервере Виртуального
            секретаря, а хранятся на вашем устройстве или вашем Solid Pod сервере.
          </QCardSection>
        </QCard>
      </QExpansionItem>
      <QExpansionItem expand-separator label="В каком формате хранятся обязательства?" caption="Verifiable Credentials Activity Streams Presentation">
        <QCard>
          <QCardSection class="text-left">
            Все обязательства подписываются вашим ключом Verifiable Credentials
            и хранятся в формате JSON-LD. Вы можете в любой момент их
            экспортировать в формат iCalendar.
          </QCardSection>
        </QCard>
      </QExpansionItem>
      <QExpansionItem expand-separator label="Интеграции с другими сервисами?" caption="Google Calendar">
        <QCard>
          <QCardSection class="text-left">
            В «Мои договора» можно подписывать договоры выполненных работ и
            оказания услуг, акты приемки и накладные, дополнительные соглашения
            и приложения к ним, письма, платежные поручения, счета и технические
            задания, доверенности, и любые другие документы, для которых по
            закону достаточно усиленной неквалифицированной подписи и т.д.
          </QCardSection>
        </QCard>
      </QExpansionItem>
      <QExpansionItem expand-separator label="Можно ли развернуть Секретаря на своём сервере?" caption="Self-hosted">
        <QCard>
          <QCardSection class="text-left">
            Да. Секретарь доступен как self-hosted решение — вы получаете полный
            контроль над данными и инфраструктурой. Обратитесь в поддержку для
            получения дистрибутива и инструкции по установке.
          </QCardSection>
        </QCard>
      </QExpansionItem>
      <QExpansionItem expand-separator label="Что такое Fediverse и зачем это нужно?" caption="ActivityPub / децентрализация">
        <QCard>
          <QCardSection class="text-left">
            Fediverse — это сеть децентрализованных сервисов, работающих по
            протоколу ActivityPub. Секретарь использует его, чтобы ваши задачи
            могли «перетекать» между разными приложениями и ботами без привязки
            к одному вендору.
          </QCardSection>
        </QCard>
      </QExpansionItem>
    </QList>
    <QList
      :padding="$q.platform.is.desktop"
      class="bg-grey-9 text-white"
      :style="{
        paddingLeft: $q.platform.is.desktop ? 'calc(50vw / 2)' : null,
        paddingRight: $q.platform.is.desktop ? 'calc(50vw / 2)' : null,
      }"
      dark
    >
      <QItemLabel header class="text-center">ООО "Виртуальный секретарь"</QItemLabel>
      <QItemLabel caption class="text-center text-uppercase">ИНН 2632123201</QItemLabel>
      <QSeparator spaced dark />
      <QItem v-ripple clickable dense @click="supportPage">
        <QCardSection>
          <QItemLabel lines="1" class="text-left">Поддержка</QItemLabel>
          <QItemLabel caption>Обратиться в центр поддержки</QItemLabel>
        </QCardSection>
      </QItem>
      <QItem v-ripple clickable dense @click="privacyPage">
        <QCardSection>
          <QItemLabel lines="1" class="text-left">Политика обработки персональных данных</QItemLabel>
        </QCardSection>
      </QItem>
    </QList>
  </QScrollArea>
</template>
<script lang="ts" setup>
import {
  useMeta,
  useQuasar,
  QIcon,
  QBtn,
  QScrollArea,
  QCardSection,
  QSeparator,
  QCard,
  QCardActions,
  QSpace,
  QItem,
  QItemSection,
  QItemLabel,
  QTimeline,
  QTimelineEntry,
  QExpansionItem,
  QList,
  QMarkupTable,
  QBanner,
} from 'quasar'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import useLangStore from 'stores/lang'
import PricingComponent from 'components/PricingComponent.vue'
import { ROUTE_NAMES, STEP } from '../router/routes'
import { GOOGLE_PLAY_URL } from '../helpers/googlePlayHelper'
import { TELEGRAM_BOT_NAME } from '../services/telegram'
import { open } from '../helpers/urlHelper'
import pkg from '../../package.json'

const router = useRouter()
const i18n = useI18n()
const langStore = useLangStore()
const $t = i18n.t
const $q = useQuasar()

const metaData = {
  'title': $t('pages.welcome.title'),
  'og:title': $t('pages.welcome.title'),
}

function registerPage() {
  return router.push({
    name: ROUTE_NAMES.LOGIN,
    query: { lang: langStore.language },
  })
}

function supportPage() {
  const [{ email }] = pkg.contributors
  open(`mailto:${email}?subject=SUPPORT`)
}

function privacyPage() {
  return router.push({ name: ROUTE_NAMES.PRIVACY })
}

useMeta(metaData)
</script>
