<template>
  <QFile
    v-model="keyPairFile"
    style="width: calc(300px - 32px)"
    color="accent"
    filled
    accept=".json"
    :label="$t('components.keypair.import.label')"
    :class="{
      'full-width': !$q.platform.is.desktop,
    }"
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
    class="q-mt-md"
    :class="{
      'full-width': !$q.platform.is.desktop,
    }"
    @click="onGenerateKeyPair"
  >
    <QTooltip>{{ $t('components.keypair.generate.tooltip') }}</QTooltip>
  </QBtn>
</template>
<script lang="ts" setup>
import { getCurrentInstance, ref } from 'vue'
import { QBtn, QIcon, QFile, QTooltip, useQuasar } from 'quasar'
import useWalletStore from 'stores/wallet'
import { DIDTable } from '../types/models'
import { keyPair } from '../services/databaseService'

const emit = defineEmits(['onKey'])

// eslint-disable-next-line @typescript-eslint/unbound-method
const $t = getCurrentInstance().appContext.config.globalProperties.$t
const $q = useQuasar()
const walletStore = useWalletStore()

const keyPairFile = ref<File>(null)

function onLoadKeyPairFile(file: File) {
  const reader = new FileReader()
  reader.addEventListener(
    'load',
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    async () => {
      try {
        const key = JSON.parse(reader.result as string) as DIDTable
        await keyPair.setKeyPair({
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

async function onGenerateKeyPair() {
  const gicId = walletStore?.publicKey?.toString() ?? 'demo'
  const resolver = `did:gic:${gicId}`
  const key = await keyPair.generateNewKeyPair(resolver)
  await keyPair.setKeyPair(key)
  emit('onKey', key)
}
</script>
