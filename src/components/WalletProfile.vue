<template>
  <QField
    v-if="getWalletLD.id"
    label="DID"
    color="secondary"
    class="full-width"
    outlined
    readonly
    stack-label
    hide-bottom-space
  >
    <template #prepend>
      <QIcon name="wallet" />
    </template>
    <template #control>
      <div
        class="self-center no-outline no-margin no-padding non-selectable ellipsis absolute"
        style="left: 0; right: 0"
      >
        {{ getWalletLD.id }}
      </div>
    </template>
    <template #append>
      <QIcon
        name="content_copy"
        class="cursor-pointer"
        @click="onCopyText(getWalletLD.id)"
      />
    </template>
  </QField>
  <PhantomWalletLogin
    :label="$t('tutorial.wallet.title')"
    color="white"
    text-color="black"
    icon="wallet"
    content-class="full-width q-mb-md"
    @skip="onSkipWallet"
    @error="onWalletError"
  />
</template>
<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'
import { useQuasar, QIcon, copyToClipboard } from 'quasar'
import useWalletStore from 'stores/wallet'
import PhantomWalletLogin from 'components/PhantomWalletLogin.vue'

const walletStore = useWalletStore()
const { getWalletLD } = storeToRefs(walletStore)
const $q = useQuasar()
const i18n = useI18n()
const $t = i18n.t

function onWalletError(error: Error) {
  $q.notify({
    color: 'negative',
    message:
      error.name === 'DatabaseClosedError' ? error.message : $t('wallet.fail'),
  })
}

function onSkipWallet() {
  const dialog = $q.dialog({
    message: $t('tutorial.welcome.demoHint'),
    cancel: true,
    persistent: true,
  })
  dialog.onOk(() => {
    // emit('free')
  })
}
async function onCopyText(text: string) {
  await copyToClipboard(text)
  $q.notify({
    type: 'positive',
    group: false,
    message: $t('copy.success'),
  })
}
</script>
