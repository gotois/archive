<template>
  <QScrollArea class="absolute-full fit">
    <div
      class="items-start justify-center self-start items-stretch"
      :class="{
        'row q-pa-md q-gutter-md': $q.platform.is.desktop,
        'row q-gutter-xs': $q.platform.is.ipad,
      }"
    >
      <QCard
        square
        :flat="$q.platform.is.mobile"
        :bordered="$q.platform.is.desktop"
        class="col bg-white text-dark col-3"
      >
        <QCardSection class="text-center">
          <div class="text-h5 text-weight-bolder">
            {{ $t('pricing.free.title') }}
          </div>
          <div class="text-subtitle2 text-weight-light q-pb-md">
            {{ $t('pricing.free.description') }}
          </div>
          <div>
            <span class="vertical-middle text-h3">{{ basePrice }}</span>
            {{ $t('pricing.free.price') }}
          </div>
          <PhantomWalletLogin
            v-if="router.currentRoute.value.name !== ROUTE_NAMES.PRICING"
            :label="$t('pricing.free.ok')"
            color="white"
            text-color="black"
            content-class="full-width q-mt-md"
            @skip="onSkipWallet"
            @error="onWalletError"
            @complete="$emit('free')"
          />
        </QCardSection>
        <QSeparator inset color="grey-3" />
        <QCardSection>
          <QList
            :dense="$q.platform.is.desktop"
            bordered
            class="rounded-borders bg-grey-1"
          >
            <QTree
              class="full-width"
              :nodes="freeSupport"
              :default-expand-all="$q.platform.is.desktop"
              :dense="$q.platform.is.desktop"
              node-key="label"
              text-color="dark"
            />
            <QTree
              class="full-width"
              :nodes="freeFunctional"
              :default-expand-all="$q.platform.is.desktop"
              :dense="$q.platform.is.desktop"
              node-key="label"
              text-color="dark"
            />
          </QList>
        </QCardSection>
      </QCard>
      <QCard
        square
        :flat="$q.platform.is.mobile"
        :bordered="$q.platform.is.desktop"
        class="bg-primary text-white col-3"
      >
        <QCardSection class="text-center">
          <div class="text-h5 text-weight-bolder">
            {{ $t('pricing.premium.title') }}
          </div>
          <div class="text-subtitle2 text-weight-light q-pb-md">
            {{ $t('pricing.premium.description') }}
          </div>
          <div>
            <span class="vertical-middle text-h3">
              {{ premiumPrice }}
            </span>
            {{ $t('pricing.premium.price') }}
          </div>
          <QBtn
            v-if="router.currentRoute.value.name !== ROUTE_NAMES.PRICING"
            size="md"
            class="full-width q-mt-md"
            color="white"
            text-color="black"
            square
            :dense="$q.platform.is.desktop"
            :label="$t('pricing.premium.ok')"
            @click="$emit('premium')"
          />
        </QCardSection>
        <QSeparator inset color="grey-5" />
        <QCardSection>
          <QList
            :dense="$q.platform.is.desktop"
            bordered
            class="rounded-borders bg-grey-1"
          >
            <QTree
              class="full-width"
              :nodes="premiumSupport"
              :default-expand-all="$q.platform.is.desktop"
              :dense="$q.platform.is.desktop"
              node-key="label"
              text-color="dark"
            />
            <QTree
              class="full-width"
              :nodes="premiumFunctional"
              :default-expand-all="$q.platform.is.desktop"
              :dense="$q.platform.is.desktop"
              node-key="label"
              text-color="dark"
            />
          </QList>
        </QCardSection>
      </QCard>
      <QCard
        square
        :flat="$q.platform.is.mobile"
        :bordered="$q.platform.is.desktop"
        class="bg-black text-white col-3"
      >
        <QCardSection class="text-center">
          <div class="text-h5 text-weight-bolder">
            {{ $t('pricing.vip.title') }}
          </div>
          <div class="text-subtitle2 text-weight-light q-pb-md">
            {{ $t('pricing.vip.description') }}
          </div>
          <div>
            <span class="vertical-middle text-h3">
              {{ vipPrice }}
            </span>
            {{ $t('pricing.vip.price') }}
          </div>
          <QBtn
            v-if="router.currentRoute.value.name !== ROUTE_NAMES.PRICING"
            size="md"
            class="full-width q-mt-md"
            color="white"
            text-color="black"
            square
            :dense="$q.platform.is.desktop"
            :label="$t('pricing.vip.ok')"
            @click="onVip"
          />
        </QCardSection>
        <QSeparator inset color="grey-8" />
        <QCardSection>
          <QList
            :dense="$q.platform.is.desktop"
            bordered
            class="rounded-borders bg-grey-1"
          >
            <QTree
              class="full-width"
              :nodes="vipSupport"
              :default-expand-all="$q.platform.is.desktop"
              :dense="$q.platform.is.desktop"
              node-key="label"
              text-color="dark"
            />
            <QTree
              class="full-width"
              :nodes="vipFunctional"
              :default-expand-all="$q.platform.is.desktop"
              :dense="$q.platform.is.desktop"
              node-key="label"
              text-color="dark"
            />
          </QList>
        </QCardSection>
      </QCard>
    </div>
  </QScrollArea>
</template>
<script lang="ts" setup>
import { ref, defineAsyncComponent } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import {
  useQuasar,
  QScrollArea,
  QCard,
  QCardSection,
  QBtn,
  QSeparator,
  QList,
  QTree,
} from 'quasar'
import { open } from '../helpers/urlHelper'
import pkg from '../../package.json'
import { ROUTE_NAMES } from '../router/routes'

const emit = defineEmits(['demo', 'free', 'premium'])

const PhantomWalletLogin = defineAsyncComponent(
  () => import('components/PhantomWalletLogin.vue'),
)

const router = useRouter()
const $q = useQuasar()
const $t = useI18n().t

const basePrice = '$0'
const premiumPrice = '$20'
const vipPrice = '$200'

const freeSupport = ref([
  {
    label: $t('pricing.free.support.title'),
    icon: 'contact_support',
    children: [
      { label: $t('pricing.free.support.values.1') },
      { label: $t('pricing.free.support.values.2') },
    ],
  },
])
const premiumSupport = ref([
  {
    label: $t('pricing.premium.support.title'),
    icon: 'contact_support',
    children: [
      {
        label: $t('pricing.premium.support.values.1'),
        children: [{ label: $t('pricing.premium.support.values.2') }],
      },
    ],
  },
])
const vipSupport = ref([
  {
    label: $t('pricing.vip.support.title'),
    icon: 'contact_support',
    children: [
      {
        label: $t('pricing.vip.support.values.1'),
        children: [
          { label: $t('pricing.vip.support.values.2') },
          { label: $t('pricing.vip.support.values.3') },
        ],
      },
    ],
  },
])
const freeFunctional = ref([
  {
    label: $t('pricing.free.functions.title'),
    icon: 'shield',
    children: [
      { label: $t('pricing.free.functions.values.1') },
      { label: $t('pricing.free.functions.values.2') },
    ],
  },
])
const premiumFunctional = ref([
  {
    label: $t('pricing.premium.functions.title'),
    icon: 'admin_panel_settings',
    children: [
      {
        label: $t('pricing.premium.functions.values.1'),
        children: [
          { label: $t('pricing.premium.functions.values.2') },
          { label: $t('pricing.premium.functions.values.3') },
          { label: $t('pricing.premium.functions.values.4') },
          { label: $t('pricing.premium.functions.values.5') },
          { label: $t('pricing.premium.functions.values.6') },
          { label: $t('pricing.premium.functions.values.7') },
        ],
      },
    ],
  },
])
const vipFunctional = ref([
  {
    label: $t('pricing.vip.functions.title'),
    icon: 'security',
    children: [
      {
        label: $t('pricing.vip.functions.values.1'),
        children: [{ label: $t('pricing.vip.functions.values.2') }],
      },
    ],
  },
])

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
    emit('demo')
  })
}

function onVip() {
  const { email } = pkg.contributors[0]
  open(`mailto:${email}?subject=VIP`)
}
</script>
