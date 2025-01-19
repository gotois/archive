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
          :style="{
            paddingLeft: '24px',
            paddingRight: '24px',
          }"
          :class="{
            'full-width': !$q.platform.is.desktop,
          }"
          glossy
          push
          fab
          @click="registerPage"
        >
          <QIcon
            v-if="$q.platform.is.desktop"
            name="img:/icons/safari-pinned-tab.svg"
          />
          <span class="q-ml-xs text-accent text-weight-bolder">
            Подключиться
          </span>
        </QBtn>
      </QCardActions>

      <QSpace class="q-mb-xl" />

      <div class="flex justify-center row">
        <QCardSection class="flex q-pt-none text-left col-12">
          <QBtn
            v-if="!langStore.isRussian"
            class="q-ma-xs"
            icon="play_arrow"
            color="black"
            :href="GOOGLE_PLAY_URL"
          >
            Google Play
          </QBtn>
          <QBtn
            icon="telegram"
            class="q-ma-xs"
            color="blue"
            :href="TELEGRAM_MINI_APPS_URL"
          >
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
          <div class="text-subtitle1"
            >Удобный сервис для подписания договоров, актов и других документов
            по выполнению договоренностей.
          </div>
        </QCardSection>
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
    <div
      class="flex justify-center"
      :class="{
        row: $q.platform.is.desktop,
      }"
    >
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
          <div class="text-h6"
            >Обеспечение согласованности в управлении временем между
            участниками</div
          >
          <div class="text-subtitle2">
            1. Создание расписания и его синхронизация с внешними системами.
            <br />
            2. Рекомендации по приоритетам на основе анализа данных.
            <br />
            3. Хранение, обновление и автоматическая передача договора.
          </div>
        </QCardSection>
      </QCard>
    </div>

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
        <QTimelineEntry
          title="Авторизация Telegram"
          subtitle="Шаг 1"
          color="accent"
          icon="key"
          class="text-left"
        >
          <div>Авторизуйте свой аккаунт через Telegram.</div>
        </QTimelineEntry>
        <QTimelineEntry
          title="Установка Web Id"
          subtitle="Шаг 2"
          color="accent"
          icon="memory"
          class="text-left"
        >
          <div>
            Выберите свой Solid Pod сервер где вы будете хранить свои документы.
          </div>
        </QTimelineEntry>
        <QTimelineEntry
          title="Электронная подпись Ed25519"
          subtitle="Шаг 3"
          color="accent"
          icon="done_outline"
          class="text-left"
        >
          <div>
            Загрузите или сгенерируйте свою электронную подпись Ed25519.
          </div>
        </QTimelineEntry>
        <QTimelineEntry
          title="Сформируйте обязательство"
          subtitle="Шаг 4"
          color="positive"
          icon="done_all"
          class="text-left"
        >
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
      >Часто задаваемые вопросы</h3
    >
    <QList
      :padding="$q.platform.is.desktop"
      class="q-mb-xl rounded-borders text-left"
      :style="{
        marginLeft: $q.platform.is.desktop ? 'calc(50vw / 2)' : null,
        marginRight: $q.platform.is.desktop ? 'calc(50vw / 2)' : null,
      }"
    >
      <QExpansionItem
        expand-separator
        label="Как вы обеспечиваете безопасность данных?"
        caption="Данные не хранятся на сервере"
      >
        <QCard>
          <QCardSection class="text-left">
            Виртуальный секретарь использует современные методы шифрования при
            передаче данных. Данные не хранятся на сервере Виртуального
            секретаря, а хранятся на вашем устройстве или вашем Solid Pod
            сервере.
          </QCardSection>
        </QCard>
      </QExpansionItem>
      <QExpansionItem
        expand-separator
        label="В каком формате хранятся обязательства?"
        caption="Verifiable Credentials Activity Streams Presentation"
      >
        <QCard>
          <QCardSection class="text-left">
            Все обязательствао подписываются вашим ключом Verifiable Credentials
            и хранятся в формате JSON-LD. Вы можете в любой момент их
            экспортировать в формат iCalendar.
          </QCardSection>
        </QCard>
      </QExpansionItem>
      <QExpansionItem
        expand-separator
        label="Интеграции с другими сервисами?"
        caption="Google Calendar"
      >
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
      <QItemLabel header class="text-center">
        ООО "Виртуальный секретарь"
      </QItemLabel>
      <QItemLabel caption class="text-center text-uppercase">
        ИНН 2632123201
      </QItemLabel>
      <QSeparator spaced dark />
      <QItem v-ripple clickable dense @click="supportPage">
        <QCardSection>
          <QItemLabel lines="1" class="text-left">Поддержка</QItemLabel>
          <QItemLabel caption>Обратиться в центр поддержки</QItemLabel>
        </QCardSection>
      </QItem>
      <QItem v-ripple clickable dense @click="privacyPage">
        <QCardSection>
          <QItemLabel lines="1" class="text-left"
            >Политика обработки персональных данных
          </QItemLabel>
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
  QItemLabel,
  QTimeline,
  QTimelineEntry,
  QExpansionItem,
  QList,
} from 'quasar'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import useLangStore from 'stores/lang'
import PricingComponent from 'components/PricingComponent.vue'
import { ROUTE_NAMES, STEP } from '../router/routes'
import { GOOGLE_PLAY_URL } from '../helpers/googlePlayHelper'
import { TELEGRAM_MINI_APPS_URL } from '../services/telegram'
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
    name: ROUTE_NAMES.TUTORIAL,
    query: {
      step: STEP.WELCOME,
      lang: langStore.language,
    },
  })
}

function supportPage() {
  const [{ email }] = pkg.contributors
  open(`mailto:${email}?subject=SUPPORT`)
}

function privacyPage() {
  return router.push({
    name: ROUTE_NAMES.PRIVACY,
  })
}

useMeta(metaData)
</script>
