<template>
  <QCard class="bg-red text-white" style="width: 400px">
    <QCardSection>
      <div class="text-h6">{{ $t('settings.clean.submit') }}</div>
    </QCardSection>
    <QCardSection class="q-pt-none">
      {{ $t('settings.clean.label') }}
    </QCardSection>
    <QCardActions
      align="right"
      class="text-teal"
      :class="$q.dark.isActive ? 'bg-dark' : 'bg-white'"
    >
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
import { useQuasar, QBtn, QCardActions, QCardSection, QCard } from 'quasar'
import { storeToRefs } from 'pinia'
import { BulkError } from 'dexie'
import useAuthStore from 'stores/auth'
import usePodStore from 'stores/pod'
import { db } from '../services/databaseService'

const emit = defineEmits(['onClear'])
const $q = useQuasar()
const podStore = usePodStore()
const authStore = useAuthStore()

const { isLoggedIn } = storeToRefs(authStore)

async function onClearDatabasePlus() {
  emit('onClear')
  $q.loading.show()
  try {
    await podStore.removeContractsDataset()
    await db.delete()
    $q.localStorage.clear()
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
    $q.localStorage.clear()
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
