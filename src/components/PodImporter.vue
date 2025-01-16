<template>
  <QBtn
    :label="$t('database.pod.sync')"
    icon="cloud_download"
    color="accent"
    square
    :dense="$q.platform.is.desktop"
    :class="{
      'full-width': !$q.platform.is.desktop,
    }"
    @click="importData"
  />
</template>
<script lang="ts" setup>
import { useQuasar, QBtn } from 'quasar'
import { useI18n } from 'vue-i18n'
import usePodStore from 'stores/pod'
import ContractPod from '../services/contractGeneratorService'

const $q = useQuasar()
const i18n = useI18n()
const $t = i18n.t

const podStore = usePodStore()

async function importData() {
  const dialog = $q.dialog({
    message: '...',
    progress: true,
    persistent: true,
    ok: false,
  })
  try {
    const links = await podStore.getContractsLink()
    for (const link of links) {
      const contract = await ContractPod.fromSolidUrl(link)
      console.log(contract)
      /* todo поддержать функционал синхронизации контракта через solid
      dialog.update({
        message:
          contract.presentation.verifiableCredential[0].credentialSubject
            .instrument.name,
      })
      const alreadySaved = await contractStore.existContract(
        contract.presentation.verifiableCredential[0].credentialSubject
          .identifier,
      )
      if (!alreadySaved) {
        await contractStore.insertContract(contract.presentation)
      }
       */
    }
    $q.notify({
      type: 'positive',
      message: 'Ok',
    })
  } catch (error) {
    console.error(error)
    $q.notify({
      type: 'negative',
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      message: error.message,
    })
  } finally {
    dialog.hide()
  }
}
</script>
