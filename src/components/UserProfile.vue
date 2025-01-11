<template>
  <QForm
    ref="nameForm"
    autocapitalize="off"
    autocomplete="off"
    greedy
    @submit="onFinishProfile"
  >
    <QField
      v-if="isLoggedIn"
      label="WebId"
      color="secondary"
      class="q-pb-md full-width"
      outlined
      stack-label
    >
      <template #prepend>
        <QIcon name="web" />
      </template>
      <template #control>
        <div
          class="self-center no-outline no-margin no-padding non-selectable ellipsis absolute"
          style="left: 0; right: 0"
          >{{ webId }}</div
        >
      </template>
      <template #append>
        <QIcon
          name="content_copy"
          class="cursor-pointer"
          @click="onCopyText(webId)"
        />
      </template>
    </QField>
    <QInput
      v-model.trim="getPersonLD.name"
      color="secondary"
      type="text"
      outlined
      :clearable="false"
      :readonly="true"
      stack-label
      square
      hide-bottom-space
      filled
      :dense="$q.platform.is.desktop"
      :hide-hint="!$q.platform.is.desktop"
      :label="$t('consumer.type')"
      :rules="[(val) => (val && val.length > 0) || $t('consumer.rules')]"
      name="consumer"
      autocomplete="on"
      @focus="(e) => e.target.scrollIntoView()"
    >
      <template #prepend>
        <QIcon
          class="rounded-borders"
          :class="{
            'bg-white': getPersonLD.image,
          }"
          :name="getPersonLD.image ? 'img:' + getPersonLD.image : 'face'"
        />
      </template>
    </QInput>
    <QInput
      v-if="getPersonLD.email"
      v-model.trim="getPersonLD.email"
      color="secondary"
      type="email"
      outlined
      :clearable="!isDemo"
      :readonly="isDemo"
      stack-label
      :hide-hint="!$q.platform.is.desktop"
      :hide-bottom-space="!getPersonLD.email"
      :label="$t('consumer.email')"
      :rules="['email']"
      :error-message="$t('consumer.emailRules')"
      name="email"
      autocomplete="off"
    >
      <template #prepend>
        <QIcon name="email" />
      </template>
    </QInput>
    <QInput
      v-if="getPersonLD.telephone"
      v-model.trim="phone"
      color="secondary"
      type="tel"
      mask="### ### ####"
      :fill-mask="!isDemo"
      outlined
      :clearable="!isDemo"
      :readonly="isDemo"
      stack-label
      :hide-hint="!$q.platform.is.desktop"
      :hide-bottom-space="!getPersonLD.telephone"
      :label="$t('consumer.phone')"
      :error-message="$t('consumer.phoneRules')"
      name="tel"
      autocomplete="on"
    >
      <template #prepend>
        <QIcon name="phone" />
      </template>
    </QInput>
    <QField
      v-if="getWalletLD.id"
      label="DID"
      color="secondary"
      class="q-pt-md q-pb-md full-width"
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
      v-if="!isDemo"
      :label="$t('tutorial.wallet.title')"
      color="white"
      text-color="black"
      icon="wallet"
      content-class="full-width q-mb-md"
      @skip="onSkipWallet"
      @error="onWalletError"
    />
    <QBtn
      v-if="!isDemo"
      :label="$t('consumer.save')"
      icon="save"
      class="full-width"
      round
      :dense="$q.platform.is.desktop"
      square
      :class="{
        'q-mt-md': getPersonLD.name?.length === 0,
      }"
      :outline="!getPersonLD.name?.length && !getPersonLD.email?.length"
      type="submit"
      color="secondary"
    />
  </QForm>
</template>
<script lang="ts" setup>
import { defineAsyncComponent } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  useQuasar,
  QBtn,
  QField,
  QIcon,
  QInput,
  QForm,
  copyToClipboard,
} from 'quasar'
import { storeToRefs } from 'pinia'
import useWalletStore from 'stores/wallet'
import useAuthStore from 'stores/auth'
import useProfileStore from 'stores/profile'

const $q = useQuasar()
const authStore = useAuthStore()
const profileStore = useProfileStore()
const walletStore = useWalletStore()
const i18n = useI18n()
const $t = i18n.t

const PhantomWalletLogin = defineAsyncComponent(
  () => import('components/PhantomWalletLogin.vue'),
)

const { email, phone, getPersonLD } = storeToRefs(profileStore)
const { getWalletLD } = storeToRefs(walletStore)
const { isLoggedIn, isDemo, webId } = storeToRefs(authStore)

async function onFinishProfile() {
  profileStore.consumerEmail(email.value)
  profileStore.consumerPhone(phone.value)
  await profileStore.setAvatar(email.value)
  $q.notify({
    message: $t('consumer.success'),
    type: 'positive',
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
</script>
