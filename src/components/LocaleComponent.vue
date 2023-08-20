<template>
  <QBtnGroup square>
    <QBtn
      label="en"
      class="full-width"
      :dense="$q.platform.is.desktop"
      :outline="locale.startsWith('en')"
      @click="changeLocale('en')"
    />
    <QSeparator vertical />
    <QBtn
      label="ru"
      class="full-width"
      :dense="$q.platform.is.desktop"
      :outline="locale.startsWith('ru')"
      @click="changeLocale('ru')"
    />
  </QBtnGroup>
</template>
<script lang="ts" setup>
import { useQuasar, QSeparator, QBtn, QBtnGroup } from 'quasar'
import { useI18n } from 'vue-i18n'

const { locale } = useI18n()
const $q = useQuasar()

function changeLocale(lang: string) {
  locale.value = lang
  $q.localStorage.set('locale', lang)
}
</script>
