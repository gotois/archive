<template>
  <QScrollArea
    class="absolute-full fit fullscreen text-center q-pa-md flex flex-center"
    :class="{
      'bg-white text-dark': !$q.dark.isActive,
      'bg-dark text-white': $q.dark.isActive,
    }"
  >
    <h1
      class="text-center text-uppercase no-margin no-padding"
      style="font-size: xxx-large"
    >
      Мои договоры - ЭДО для всех
    </h1>
    <h2 class="text-center no-margin no-padding" style="font-size: x-large">
      Решение упрощает обмен документами для физических и юридических лиц в
      любом бизнес-процессе.
    </h2>

    <QBtn color="primary" class="q-ma-md" glossy fab @click="onRegister">
      Подключиться
    </QBtn>

    <div class="flex justify-center">
      <QCard
        class="text-white q-ma-xs"
        bordered
        style="background: radial-gradient(circle, #35a2ff 0%, #014a88 100%)"
      >
        <QCardSection>
          <div class="text-subtitle1">Как работает сервис</div>
          <div class="text-subtitle2"
            >Удобный сервис для подписания договоров, актов и других документов
            с самозанятыми онлайн.</div
          >
        </QCardSection>
        <QCardSection class="q-pt-none text-left">
          1. Загрузка документа договора
          <QSeparator spaced inset />
          2. Подписание документа электронной подписью
          <QSeparator spaced inset />
          3. Хранение и передача договора
        </QCardSection>
      </QCard>

      <QCard
        bordered
        class="text-white q-ma-xs"
        style="background: radial-gradient(circle, #21ba45 0%, #014a88 100%)"
      >
        <QCardSection>
          <div class="text-subtitle1">Мои договоры в</div>
        </QCardSection>
        <QCardSection class="q-pt-none">
          <QBtn flat :href="applicationURL">Google Play</QBtn>
        </QCardSection>
      </QCard>
    </div>

    <QList padding class="rounded-borders">
      <QItemLabel header>GIC DAO</QItemLabel>
    </QList>
  </QScrollArea>
</template>
<script lang="ts" setup>
import {
  useMeta,
  QBtn,
  QScrollArea,
  QCardSection,
  QSeparator,
  QCard,
  QItemLabel,
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
    },
  })
}

useMeta(metaData)
</script>
