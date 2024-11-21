<template>
  <QBtnGroup square flat>
    <QBtn
      label="en"
      class="full-width"
      :dense="$q.platform.is.desktop"
      fab-mini
      :outline="langStore.language === 'en-US'"
      @click="changeLocale('en-US')"
    />
    <QSeparator vertical />
    <QBtn
      label="ru"
      class="full-width"
      :dense="$q.platform.is.desktop"
      fab-mini
      :outline="langStore.language === 'ru-RU'"
      @click="changeLocale('ru-RU')"
    />
  </QBtnGroup>
</template>
<script lang="ts" setup>
import { useQuasar, QSeparator, QBtn, QBtnGroup } from 'quasar'
import { useI18n } from 'vue-i18n'
import useLangStore from 'stores/lang'

const langStore = useLangStore()
const $q = useQuasar()
const { locale } = useI18n()

function changeLocale(lang: string) {
  langStore.setLang(lang)
  locale.value = lang
}
</script>
