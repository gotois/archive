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
      >
        <QBadge
          v-if="contractsCount > 0"
          color="negative"
          transparent
          :dense="$q.platform.is.desktop"
          class="q-ma-xs"
          align="middle"
          :style="{
            height: $q.platform.is.mobile ? '24px' : 'auto',
          }"
          :rounded="$q.platform.is.desktop"
        >
          <template v-if="contractsCount">
            {{ contractsCount > 999 ? '999+' : String(contractsCount) }}
          </template>
        </QBadge>
      </QBtn>
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
import { useI18n } from 'vue-i18n'
import {
  useQuasar,
  QBtn,
  QBadge,
  QCardActions,
  QCardSection,
  QCard,
} from 'quasar'
import { storeToRefs } from 'pinia'
import useAuthStore from 'stores/auth'
import usePodStore from 'stores/pod'
import useContractStore from 'stores/contract'
import { db } from '../services/databaseService'

const emit = defineEmits(['onClear'])
const $t = useI18n().t
const $q = useQuasar()
const podStore = usePodStore()
const authStore = useAuthStore()
const contractStore = useContractStore()

const { isLoggedIn } = storeToRefs(authStore)
const { contractsCount } = storeToRefs(contractStore)

async function onClearDatabasePlus() {
  emit('onClear')
  $q.loading.show()
  try {
    await podStore.removeContractsDataset()
    await db.delete()
    $q.localStorage.clear()
    $q.sessionStorage.clear()
    $q.loading.hide()
    const timeout = 1500
    $q.notify({
      type: 'warning',
      progress: false,
      spinner: true,
      timeout: timeout,
      message: $t('components.databaseRemove.success'),
    })
    setTimeout(() => {
      window.location.reload()
    }, timeout)
  } catch (error) {
    console.error(error)
    $q.loading.hide()
    $q.notify({
      type: 'negative',
      message: $t('components.databaseRemove.fail'),
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
      message: $t('components.databaseRemove.success'),
    })
    setTimeout(() => {
      window.location.reload()
    }, timeout)
  } catch (error) {
    console.error(error)
    $q.loading.hide()
    $q.notify({
      type: 'negative',
      message: $t('components.databaseRemove.fail'),
    })
  }
}
</script>
