<template>
  <QBtnDropdown
    :label="$t('tutorial.welcome.ok')"
    color="accent"
    square
    auto-close
    stretch
    :class="{
      'full-width': !$q.platform.is.desktop,
    }"
    @click="getClientInfo"
  >
    <QBtnGroup v-if="!$q.loading.isActive" class="q-pa-md" flat>
      <QBtn
        class="full-width"
        square
        label="Demo"
        @click="$emit('select', demoSign)"
      >
        <QTooltip>Demo sign</QTooltip>
      </QBtn>
      <QBtn
        v-if="location === RU"
        class="full-width"
        square
        label="Telegram"
        @click="$emit('select', gosuslugiSign)"
      >
        <QTooltip>Вход через Telegram</QTooltip>
      </QBtn>
      <QBtn
        v-else
        class="full-width"
        square
        label="Blockchain"
        @click="pricing = true"
      >
        <QTooltip>Blockchain Solana</QTooltip>
      </QBtn>
    </QBtnGroup>
  </QBtnDropdown>
  <QDialog
    v-model="pricing"
    persistent
    maximized
    transition-show="slide-up"
    transition-hide="slide-down"
  >
    <QCard
      class="overflow-hidden-y q-pb-lg"
      :class="{
        'bg-grey-4 text-white': !$q.dark.isActive,
        'bg-dark text-white': $q.dark.isActive,
      }"
    >
      <QBar>
        <QSpace />
        <QBtn v-close-popup dense flat icon="close" />
      </QBar>
      <QCardSection class="full-height overflow-hidden-y">
        <PricingComponent
          @free="$emit('select', freeSign)"
          @premium="$emit('select', premiumSign)"
        />
      </QCardSection>
    </QCard>
  </QDialog>
</template>
<script lang="ts" setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  useQuasar,
  QDialog,
  QCard,
  QBar,
  QSpace,
  QCardSection,
  QTooltip,
  QBtn,
  QBtnGroup,
  QBtnDropdown,
} from 'quasar'
import useTutorialStore from 'stores/tutorial'
import useProfileStore from 'stores/profile'
import useAuthStore from 'stores/auth'
import { demoUserWebId } from 'stores/auth'
import { keyPair } from '../services/databaseService'
import { ROUTE_NAMES } from '../router/routes'
import { getCloudflareInfo } from '../services/cloudflare'
import PricingComponent from 'components/PricingComponent.vue'

defineEmits(['select'])

const RU = 'RU'

const $q = useQuasar()
const router = useRouter()
const profileStore = useProfileStore()
const authStore = useAuthStore()
const tutorialStore = useTutorialStore()

const location = ref('')
const pricing = ref(false)

async function getClientInfo() {
  if (location.value !== '') {
    return
  }
  $q.loading.show()
  try {
    const { loc } = await getCloudflareInfo()
    location.value = loc
  } catch (e) {
    console.error(e)
  } finally {
    $q.loading.hide()
  }
}

async function demoSign() {
  const key = await keyPair.generateNewKeyPair(demoUserWebId)
  await keyPair.setKeyPair(key)
  profileStore.consumerName('Test User')
  profileStore.consumerEmail('tester@gotointeractive.com')
  profileStore.consumerPhone('+1234567890')
  profileStore.consumerDID(key.id)
  authStore.webId = demoUserWebId
  tutorialStore.tutorialComplete(true)
  await router.push({
    name: ROUTE_NAMES.ARCHIVE,
  })
  return false
}

function gosuslugiSign() {
  alert('Вход через ГосУслуги в разработке')
  return false
}

function freeSign() {
  console.log('Free sign')
  return true
}

function premiumSign() {
  alert('Premium is under construction')
  return false
}
</script>
