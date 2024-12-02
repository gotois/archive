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
          'font-size': $q.platform.is.mobile ? '5vmax' : '3vmax',
          'line-height': 1,
        }"
      >
        Подписать "Мои&#x202F;договоры" онлайн
      </h1>
      <h2
        class="text-white text-weight-medium"
        style="font-size: x-large; line-height: 1"
        :class="{
          'text-center no-padding': $q.platform.is.desktop,
          'text-left q-pa-md': $q.platform.is.mobile,
        }"
      >
        Решение упрощает хранение и обмен документами для физических и
        юридических лиц в любом бизнес-процессе.
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
          @click="onRegister"
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
            v-if="!forRus"
            icon="play_arrow"
            color="black"
            :href="applicationURL"
          >
            Google Play
          </QBtn>
          <!-- todo - для РФ нужны кнопки VK и пр. -->
        </QCardSection>
      </div>
    </QCard>

    <h2
      :class="{
        'text-center': $q.platform.is.desktop,
        'q-pl-md q-pr-md': !$q.platform.is.desktop,
      }"
      >Делаем ЭДО для всех</h2
    >

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
        'text-center': $q.platform.is.desktop,
        'q-pl-md q-pr-md': !$q.platform.is.desktop,
      }"
    >
      Почему это удобно
    </h2>
    <div
      class="flex justify-center"
      :class="{
        row: !$q.platform.is.mobile,
      }"
    >
      <QCard class="q-ma-md col-3" :bordered="$q.platform.is.desktop" flat>
        <QCardSection>
          <div class="text-h6">Электронный архив</div>
          <div class="text-subtitle2">
            Надёжное децентрализованное хранение всех документов для компаний и
            частных лиц.
          </div>
        </QCardSection>
      </QCard>
      <QCard class="q-ma-md col-3" :bordered="$q.platform.is.desktop" flat>
        <QCardSection>
          <div class="text-h6">Безопасность данных</div>
          <div class="text-subtitle2">
            Каждый наш клиент контролирует свои данные используя
            децентрализованное хранилище Solid Pod.
          </div>
        </QCardSection>
      </QCard>
      <QCard class="q-ma-md col-3" :bordered="$q.platform.is.desktop" flat>
        <QCardSection>
          <div class="text-h6">Дружелюбная платформа</div>
          <div class="text-subtitle2">
            Интерфейс спроектирован для удобного обмена документами через
            маршруты согласования.
          </div>
        </QCardSection>
      </QCard>
      <QCard class="q-ma-md col-3" :bordered="$q.platform.is.desktop" flat>
        <QCardSection>
          <div class="text-h6">Доступность</div>
          <div class="text-subtitle2">
            Обеспечиваем помощь и техническую поддержку для быстрого старта.
          </div>
        </QCardSection>
      </QCard>
      <QCard class="q-ma-md col-3" :bordered="$q.platform.is.desktop" flat>
        <QCardSection>
          <div class="text-h6"
            >Обеспечение согласования договоренностей между участниками</div
          >
          <div class="text-subtitle2">
            1. Загрузка документа договора
            <br />
            2. Подписание договора электронной понятным способом
            <br />
            3. Сохранение и дальнейшая передача договора
          </div>
        </QCardSection>
      </QCard>
    </div>

    <QSpace class="q-mt-xl" />

    <QCard class="q-pa-md" flat>
      <!--  AND location !== RU-->
      <PricingComponent class="fit" />
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
      <div class="text-subtitle1 text-center">
        Система электронного документооборота GIC автоматизирует все стадии
        производства
      </div>
      <div
        :style="{
          marginLeft: $q.platform.is.desktop ? 'calc(50vw / 2)' : null,
          marginRight: $q.platform.is.desktop ? 'calc(50vw / 2)' : null,
        }"
      >
        <QTimelineEntry
          title="Подключение криптокошелька"
          subtitle="Шаг 1"
          color="accent"
          icon="key"
          class="text-left"
        >
          <div>Авторизуйтесь под своим аккаунтом Solana.</div>
        </QTimelineEntry>
        <QTimelineEntry
          title="Подключение Pod"
          subtitle="Шаг 2"
          color="accent"
          icon="memory"
          class="text-left"
        >
          <div>
            Выберите свой Solid сервер где планируете хранить документы.
          </div>
        </QTimelineEntry>
        <QTimelineEntry
          title="Загрузите электронную подпись"
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
          title="Загрузите документ"
          subtitle="Шаг 4"
          color="positive"
          icon="done_all"
          class="text-left"
        >
          <div>
            Загрузите файл документа и создайте маршрут его на подписания.
          </div>
          <div>Контрагент сможет его подписать по ссылке.</div>
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
        label="Какие подписи вы поддерживаете?"
        caption="НЭП, Solana"
      >
        <QCard>
          <QCardSection class="text-left">
            Для Российского законодательства используйте НЭП. Она подтверждает
            кто подписал документ, а также, что его не меняли после подписания.
            Ч. 2 ст. 6 Федерального закона №63-ФЗ «Об электронной подписи» П. 1
            ст. 160 Гражданского кодекса РФ.
          </QCardSection>
        </QCard>
      </QExpansionItem>
      <QExpansionItem
        expand-separator
        label="Какие документы можно подписывать в Мои договоры?"
        caption="Можно подписать 99% документов"
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
      <QExpansionItem
        expand-separator
        label="Примет ли налоговая документы, подписанные в Мои договоры?"
        caption="Зависит от электронной подписи"
      >
        <QCard>
          <QCardSection class="text-left">
            Документы подписанные вашим НЭП имеют юридическую силу, их примут в
            суде. Такая подпись приравнивается к собственноручной.
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
      <QSeparator spaced dark />
      <QItemLabel header class="text-center">
        ООО "Виртуальный секретарь"
      </QItemLabel>
      <QItemLabel caption class="text-center text-uppercase">
        ИНН 2632123201
      </QItemLabel>
      <QItem v-ripple clickable dense @click="onSupport">
        <QCardSection>
          <QItemLabel lines="1" class="text-left">Поддержка</QItemLabel>
          <QItemLabel caption>Обратиться в центр поддержки</QItemLabel>
        </QCardSection>
      </QItem>
    </QList>
  </QScrollArea>
</template>
<script lang="ts" setup>
import { ref } from 'vue'
import {
  useMeta,
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
import { applicationURL } from '../helpers/googlePlayHelper'
import { open } from '../helpers/urlHelper'
import pkg from '../../package.json'

const router = useRouter()
const i18n = useI18n()
const langStore = useLangStore()
const $t = i18n.t

const metaData = {
  'title': $t('pages.welcome.title'),
  'og:title': $t('pages.welcome.title'),
}

const forRus = ref(langStore.language.startsWith('ru'))

async function onRegister() {
  await router.push({
    name: ROUTE_NAMES.TUTORIAL,
    query: {
      step: STEP.WELCOME,
      lang: langStore.language,
    },
  })
}

function onSupport() {
  const { email } = pkg.contributors[0]
  open(`mailto:${email}?subject=SUPPORT`)
}

useMeta(metaData)
</script>
