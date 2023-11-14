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
        class="text-white text-center text-uppercase text-weight-light no-margin no-padding"
        style="font-size: xxx-large; line-height: 1"
      >
        Подписать "Мои&#x202F;договоры" онлайн
      </h1>
      <h2
        class="text-white no-padding text-weight-medium"
        style="font-size: x-large; line-height: 1"
        :class="{
          'text-left': $q.platform.is.desktop,
          'text-center': $q.platform.is.mobile,
        }"
      >
        Решение упрощает обмен документами для физических и юридических лиц в
        любом бизнес-процессе.
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
          <QBtn icon="play_arrow" color="black" :href="applicationURL">
            Google Play
          </QBtn>
        </QCardSection>
      </div>
    </QCard>

    <h2 class="text-center">Делаем ЭДО для всех</h2>

    <div
      class="flex justify-center"
      :style="{
        marginLeft: $q.platform.is.desktop ? 'calc(50vw / 2)' : null,
        marginRight: $q.platform.is.desktop ? 'calc(50vw / 2)' : null,
      }"
    >
      <QCard
        flat
        class="q-ma-xs"
        :class="{
          'full-width': !$q.platform.is.desktop,
        }"
      >
        <QCardSection>
          <div class="text-subtitle1"
            >Предоставляем услуги обеспечения согласования договоренностей между
            участниками понятным способом</div
          >
          <div class="text-subtitle2"
            >Удобный сервис для подписания договоров, актов и других документов
            по выполнению договоренностей.
          </div>
        </QCardSection>
        <QCardSection class="q-pt-none text-left">
          1. Загрузка документа договора
          <QSeparator spaced inset />
          2. Подписание договора электронной подписью
          <QSeparator spaced inset />
          3. Сохранение и дальнейшая передача договора
        </QCardSection>
      </QCard>
    </div>

    <h3 class="text-center">Почему это удобно</h3>
    <div
      class="flex justify-center"
      :class="{
        row: !$q.platform.is.mobile,
      }"
    >
      <QCard class="q-ma-md col-3" :bordered="$q.platform.is.desktop">
        <QCardSection>
          <div class="text-h6">Безопасность данных</div>
          <div class="text-subtitle2">
            Использование Solid Pod обеспечивает децентрализованное хранение
            данных, где каждый пользователь контролирует свои данные.
          </div>
        </QCardSection>
      </QCard>
      <QCard class="q-ma-md col-3" :bordered="$q.platform.is.desktop">
        <QCardSection>
          <div class="text-h6"> Дружелюбная платформа </div>
          <div class="text-subtitle2">
            Интерфейс спроектирован упростить процессы управления и маршруты
            согласования для простого обмена договорами.
          </div>
        </QCardSection>
      </QCard>
      <QCard class="q-ma-md col-3" :bordered="$q.platform.is.desktop">
        <QCardSection>
          <div class="text-h6"> Доступность </div>
          <div class="text-subtitle2">
            Обеспечиваем помощь и техническую поддержку для быстрого старта.
          </div>
        </QCardSection>
      </QCard>
    </div>

    <QSpace />

    <QTimeline class="q-mt-md q-mb-md q-pl-md q-pr-md">
      <QTimelineEntry heading class="text-center"
        >Как это работает</QTimelineEntry
      >
      <div
        :style="{
          marginLeft: $q.platform.is.desktop ? 'calc(50vw / 2)' : null,
          marginRight: $q.platform.is.desktop ? 'calc(50vw / 2)' : null,
        }"
      >
        <QTimelineEntry
          title="Авторизация Solana"
          subtitle="Шаг 1"
          color="accent"
          icon="key"
          class="text-left"
        >
          <div>Авторизуйтесь под своим аккаунтом.</div>
        </QTimelineEntry>
        <QTimelineEntry
          title="Подключите свой Solid Pod"
          subtitle="Шаг 2"
          color="accent"
          icon="memory"
          class="text-left"
        >
          <div>Выберите сервер где будете хранить документы.</div>
        </QTimelineEntry>
        <QTimelineEntry
          title="Загрузите свою электронную подпись"
          subtitle="Шаг 3"
          color="accent"
          icon="done_outline"
          class="text-left"
        >
          <div>Загрузите свою электронную подпись.</div>
        </QTimelineEntry>
        <QTimelineEntry
          title="Подписание агентом и контрагентом"
          subtitle="Шаг 4"
          color="positive"
          icon="done_all"
          class="text-left"
        >
          <div
            >Создайте новый документ и дождитесь подписания контрагентом.</div
          >
          <div>Или подпишите полученный агентский договоры по ссылке.</div>
        </QTimelineEntry>
      </div>
    </QTimeline>

    <h3 class="text-center">Часто задаваемые вопросы</h3>
    <QList
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
      padding
      class="rounded-borders bg-grey-9 text-white"
      dark
      :style="{
        paddingLeft: $q.platform.is.desktop ? 'calc(50vw / 2)' : null,
        paddingRight: $q.platform.is.desktop ? 'calc(50vw / 2)' : null,
      }"
    >
      <QItemLabel header class="text-center text-subtitle1 text-uppercase"
        >Социальные сети</QItemLabel
      >
      <QItem v-ripple clickable href="https://forum.gotointeractive.com">
        <QCardSection>
          <QItemLabel lines="1" class="text-left">Форум</QItemLabel>
          <QItemLabel caption></QItemLabel>
        </QCardSection>
      </QItem>

      <QSeparator spaced dark />

      <QItemLabel header class="text-center text-subtitle1 text-uppercase"
        >GIC DAO</QItemLabel
      >
      <QItem v-ripple clickable href="https://gotointeractive.com">
        <QCardSection>
          <QItemLabel lines="1" class="text-left">Сайт</QItemLabel>
          <QItemLabel caption>Ботификация жизни начинается здесь</QItemLabel>
        </QCardSection>
      </QItem>
      <QItem v-ripple clickable href="mailto:support@gotointeractive.com">
        <QCardSection>
          <QItemLabel lines="1" class="text-left">Поддержка</QItemLabel>
          <QItemLabel caption>Обратиться в центр поддержки</QItemLabel>
        </QCardSection>
      </QItem>
    </QList>
  </QScrollArea>
</template>
<script lang="ts" setup>
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
import { ROUTE_NAMES, STEP } from '../router/routes'
import { applicationURL } from '../helpers/googlePlayHelper'

const $t = useI18n().t
const router = useRouter()

const metaData = {
  'title': $t('pages.welcome.title'),
  'og:title': $t('pages.welcome.title'),
}

async function onRegister() {
  await router.push({
    name: ROUTE_NAMES.TUTORIAL,
    query: {
      step: STEP.WELCOME,
      lang: 'ru',
    },
  })
}

useMeta(metaData)
</script>
