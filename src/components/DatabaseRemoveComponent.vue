<template>
  <QCard class="bg-red text-white" style="width: 400px">
    <QCardSection>
      <div class="text-h6">{{ $t('settings.clean.submit') }}</div>
    </QCardSection>
    <QCardSection class="q-pt-none">
      {{ $t('settings.clean.label') }}
    </QCardSection>
    <QCardActions align="right" class="bg-white text-teal">
      <QBtn
        v-close-popup
        flat
        :label="$t('settings.clean.cancel')"
        color="primary"
      />
      <QBtn
        flat
        :label="$t('settings.clean.ok')"
        color="negative"
        @click="onClearDatabase"
      />
      <QBtn
        v-if="isLoggedIn"
        flat
        :label="$t('settings.clean.okAll')"
        color="negative"
        @click="onClearDatabasePlus"
      />
    </QCardActions>
  </QCard>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import {
  LocalStorage,
  useQuasar,
  QBtn,
  QCardActions,
  QCardSection,
  QCard,
} from 'quasar'
import { BulkError } from 'dexie'
import { useStore } from '../store'
import { db } from '../services/databaseHelper'
import { removeContractsDataset } from '../services/podHelper'

const emit = defineEmits(['onClear'])
const $q = useQuasar()
const store = useStore()

// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
const isLoggedIn = computed(() => store.getters['Auth/isLoggedIn'] as boolean)

async function onClearDatabasePlus() {
  emit('onClear')
  $q.loading.show()
  try {
    await removeContractsDataset()
    await db.delete()
    LocalStorage.clear()
    $q.loading.hide()
    const timeout = 1500
    $q.notify({
      type: 'warning',
      progress: false,
      spinner: true,
      timeout: timeout,
      message: 'База данных удалена. Дождитесь перезагрузки.',
    })
    setTimeout(() => {
      location.reload()
    }, timeout)
  } catch (error) {
    const msg = (error as BulkError).message
    console.error(error)
    $q.loading.hide()
    $q.notify({
      message: msg,
      type: 'negative',
    })
  }
}

async function onClearDatabase() {
  emit('onClear')
  $q.loading.show()
  try {
    await db.delete()
    LocalStorage.clear()
    $q.loading.hide()
    const timeout = 1500
    $q.notify({
      type: 'warning',
      progress: false,
      spinner: true,
      timeout: timeout,
      message: 'База данных удалена. Дождитесь перезагрузки.',
    })
    setTimeout(() => {
      location.reload()
    }, timeout)
  } catch (error) {
    const msg = (error as BulkError).message
    console.error(error)
    $q.loading.hide()
    $q.notify({
      message: msg,
      type: 'negative',
    })
  }
}
</script>
