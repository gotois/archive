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
      const alreadySaved = await contractStore.existContract(
        credential.credentialSubject.identifier,
      )
      if (!alreadySaved) {
        await contractStore.insertContract(credential)
      }
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
