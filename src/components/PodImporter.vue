<template>
  <QBtn
    :label="$t('database.pod.sync')"
    icon="cloud_download"
    color="secondary"
    ripple
    square
    stretch
    :dense="$q.platform.is.desktop"
    class="full-width"
    @click="onImportData"
  />
</template>
<script lang="ts" setup>
import { useQuasar, QBtn } from 'quasar'
import usePodStore from 'stores/pod'
import useContractStore from 'stores/contract'
import { Credential } from '../types/models'

const $q = useQuasar()
const podStore = usePodStore()
const contractStore = useContractStore()

async function onImportData() {
  const dialog = $q.dialog({
    message: '...',
    progress: true,
    persistent: true,
    ok: false,
  })
  try {
    const links = await podStore.getContractsLink()
    for (const id of links) {
      const credential: Credential = await podStore.getContract(id)
      dialog.update({
        message: credential.credentialSubject.instrument.name,
      })
      await contractStore.insertContract(credential)
    }
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
