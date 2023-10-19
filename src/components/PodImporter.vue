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
import Dogovor from '../services/contractGeneratorService'

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
    for (const link of links) {
      const newDogovor = await Dogovor.fromUrl(link)
      dialog.update({
        message:
          newDogovor.presentation.verifiableCredential[0].credentialSubject
            .instrument.name,
      })
      const alreadySaved = await contractStore.existContract(
        newDogovor.presentation.verifiableCredential[0].credentialSubject
          .identifier,
      )
      if (!alreadySaved) {
        await contractStore.insertContract(newDogovor.presentation)
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
