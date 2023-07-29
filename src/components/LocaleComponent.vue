<template>
  <QBtnGroup>
    <QBtn label="en" class="full-width" @click="changeLocale('en')" />
    <QSeparator vertical />
    <QBtn label="ru" class="full-width" @click="changeLocale('ru')" />
  </QBtnGroup>
</template>
<script lang="ts" setup>
import { useQuasar, QSeparator, QBtn, QBtnGroup } from 'quasar'
import { useI18n } from 'vue-i18n'

const locale = useI18n().locale
const $q = useQuasar()

function changeLocale(lang: string) {
  locale.value = lang
  $q.localStorage.set('locale', lang)
}
</script>
