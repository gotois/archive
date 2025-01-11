<template>
  <QBtnGroup spread class="flex q-mt-md">
    <QFile
      v-model="keyPairFile"
      color="accent"
      filled
      accept=".json"
      class="col"
      square
      outlined
      :dense="$q.platform.is.desktop"
      :label="$t('components.keypair.import.label')"
      @update:model-value="onLoadKeyPairFile"
    >
      <template #prepend>
        <QIcon name="cloud_upload" @click.stop.prevent />
      </template>
      <QTooltip>{{ $t('components.keypair.import.tooltip') }}</QTooltip>
    </QFile>
    <QBtn
      color="accent"
      :label="$t('components.keypair.generate.label')"
      class="col"
      round
      @click="onGenerateKeyPair"
    >
      <QTooltip>{{ $t('components.keypair.generate.tooltip') }}</QTooltip>
    </QBtn>
  </QBtnGroup>
</template>
<script lang="ts" setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  exportFile,
  QBtn,
  QIcon,
  QBtnGroup,
  QFile,
  QTooltip,
  useQuasar,
} from 'quasar'
import { DIDTable } from '../types/models'
import { keyPair } from '../services/databaseService'

const emit = defineEmits(['onKey'])

const $t = useI18n().t
const $q = useQuasar()

const keyPairFile = ref<File>(null)

function onLoadKeyPairFile(file: File) {
  const reader = new FileReader()
  reader.addEventListener(
    'load',
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    async () => {
      try {
        const key = JSON.parse(reader.result as string) as DIDTable
        await keyPair.installKey({
          id: key.id,
          controller: key.controller,
          type: key.type,
          publicKeyMultibase: key.publicKeyMultibase,
          privateKeyMultibase: key.privateKeyMultibase,
        })
        emit('onKey', key)
      } catch (error) {
        console.error(error)
        $q.notify({
          type: 'negative',
          message: $t('components.keypair.import.fail'),
        })
      }
    },
    false,
  )
  reader.readAsText(file)
}

function exportKeyPair(key) {
  const dialog = $q.dialog({
    message: $t('components.keypair.export.dialog.message'),
    cancel: true,
    persistent: true,
  })
  dialog.onDismiss(() => {
    emit('onKey', key)
  })
  dialog.onOk(() => {
    const keysJSON = keyPair.prepareKeyPair(key)
    const status = exportFile('keys.json', keysJSON)
    if (status) {
      $q.notify({
        type: 'positive',
        message: $t('components.keypair.export.dialog.success'),
      })
    } else {
      $q.notify({
        type: 'warning',
        message: $t('components.keypair.export.dialog.fail'),
      })
    }
    emit('onKey', key)
  })
}

async function onGenerateKeyPair() {
  const resolver = 'did:gic:demo' // todo установить резолвер от GIC DAO
  const key = await keyPair.setNewKeyPair(resolver)
  exportKeyPair(key)
}
</script>
