<template>
  <q-dialog persistent square transition-show="scale" transition-hide="scale">
    <q-card class="bg-red text-white" style="width: 400px">
      <q-card-section>
        <div class="text-h6">{{ $t('settings.clean.submit') }}</div>
      </q-card-section>
      <q-card-section class="q-pt-none">
        {{ $t('settings.clean.label') }}
      </q-card-section>
      <q-card-actions align="right" class="bg-white text-teal">
        <q-btn
          v-close-popup
          flat
          :label="$t('settings.clean.cancel')"
          color="primary"
        />
        <q-btn
          flat
          :label="$t('settings.clean.ok')"
          color="red"
          @click="onClearDatabase"
        />
        <q-btn
          v-if="isLoggedIn"
          flat
          :label="$t('settings.clean.okAll')"
          color="red"
          @click="onClearDatabasePlus"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { LocalStorage, useQuasar } from 'quasar'
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
