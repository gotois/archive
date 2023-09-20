<template>
  <QBtnGroup
    spread
    class="flex q-mt-md"
    :class="{
      'full-width': !$q.platform.is.desktop,
    }"
  >
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
import { QBtn, QIcon, QBtnGroup, QFile, QTooltip, useQuasar } from 'quasar'
import useWalletStore from 'stores/wallet'
import { demoUserWebId } from 'stores/auth'
import { DIDTable } from '../types/models'
import { keyPair } from '../services/databaseService'

const emit = defineEmits(['onKey'])

const $t = useI18n().t
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
  const gicId = walletStore?.publicKey?.toString()
  const resolver = gicId ? `did:gic:${gicId}` : demoUserWebId
  const key = await keyPair.generateNewKeyPair(resolver)
  await keyPair.setKeyPair(key)
  emit('onKey', key)
}
</script>
