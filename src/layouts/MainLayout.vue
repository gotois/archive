<template>
  <QLayout view="lHr lpR lfr">
    <QHeader
      v-if="!isTMA"
      reveal
      :bordered="$q.platform.is.mobile"
      height-hint="98"
      class="text-primary bg-transparent"
    >
      <AndroidBarComponent v-if="isTWA" />
      <QToolbar>
        <QBtn
          v-if="$q.screen.xs || $q.screen.sm || $q.screen.md"
          flat
          :class="{
            invisible: miniState,
            absolute: miniState,
          }"
          round
          :dense="$q.platform.is.desktop"
          icon="settings"
          @click="onToggleLeftDrawer"
        />
        <ToolbarTitleComponent class="text-center" />
        <QBtn
          v-if="$q.screen.xs || $q.screen.sm || $q.screen.md"
          flat
          round
          :dense="$q.platform.is.desktop"
          icon="menu"
          @click="rightDrawerOpen = !rightDrawerOpen"
        />
      </QToolbar>
    </QHeader>
    <QDrawer
      v-if="!isTMA"
      v-model="leftDrawerOpen"
      side="left"
      class="scroll-y"
      :show-if-above="bigScreen"
      :mini-to-overlay="bigScreen"
      :width="320"
      :mini="miniState"
      no-mini-animation
      bordered
      @mouseenter="bigScreen ? (miniState = false) : null"
      @mouseleave="bigScreen ? (miniState = true) : null"
    >
      <p
        class="full-width block text-h6 q-pl-md q-pr-md q-pt-md no-border-radius non-selectable no-pointer-events"
      >
        <QIcon size="24px" name="settings" color="primary" />
        <template v-if="!miniState">
          <span class="q-ml-md">{{ $t('navigation.title') }}</span>
        </template>
      </p>
      <QList style="max-height: calc(100% - 64px)" class="fit column no-wrap">
        <div>
          <QSpace class="q-mb-md" style="height: 8px" />
        </div>
        <QExpansionItem
          v-if="jwt"
          v-model="profileOpen"
          group="backupgroup"
          icon="person"
          expand-icon-class="text-primary"
          class="column non-selectable"
          :dense="$q.platform.is.desktop"
          :expand-separator="profileOpen"
          :label="$t('settings.native.profile')"
        >
          <QItemSection class="q-pa-md">
            <p>{{ $t('settings.consumer.description') }}</p>
            <UserProfile />
          </QItemSection>
        </QExpansionItem>
        <QSeparator />
        <QExpansionItem
          v-model="otpOpen"
          group="backupgroup"
          icon="vpn_key"
          expand-icon-class="text-primary"
          class="column non-selectable"
          :dense="$q.platform.is.desktop"
          :expand-separator="otpOpen"
          :label="$t('settings.native.otp')"
        >
          <QItemSection class="q-pa-md">
            <template v-if="activated">
              <QBtn
                round
                :dense="$q.platform.is.desktop"
                square
                color="negative"
                icon="remove"
                :label="$t('settings.otp.removeCode')"
                @click="onOTPChange('')"
              />
            </template>
            <template v-else>
              <QBtn
                round
                :dense="$q.platform.is.desktop"
                square
                ripple
                stretch
                icon="key"
                color="secondary"
                :label="$t('settings.otp.addCode')"
                @click="openOTPDialog"
              />
              <QDialog v-model="showOTPDialog" position="bottom" square>
                <QCard flat class="q-pa-md">
                  <QCardSection>
                    <p>{{ $t('settings.otp.description') }}</p>
                    <QImg
                      :src="authUriQR"
                      alt="QR"
                      fit="none"
                      height="250px"
                      class="cursor-pointer"
                      decoding="async"
                      fetchpriority="high"
                      @click="open(authUri)"
                    />
                    <QSpace class="q-pa-xs" />
                    <QOtp
                      v-if="showOTPDialog"
                      ref="otp"
                      :outlined="!$q.screen.xs"
                      :dense="$q.platform.is.desktop"
                      :num="TFA_LENGTH"
                      :rules="[otpRule]"
                      square
                      :autofocus="$q.platform.is.desktop"
                      :input-styles="{ width: '32px' }"
                      field-classes="q-ml-xs q-mr-xs"
                      style="width: fit-content"
                      class="q-ml-auto q-mr-auto"
                      @change="onOTPChange"
                      @complete="onOTPHandleComplete"
                    />
                  </QCardSection>
                </QCard>
              </QDialog>
            </template>
          </QItemSection>
        </QExpansionItem>
        <QSeparator />
        <QExpansionItem
          v-model="calendarOpen"
          group="backupgroup"
          icon="event_available"
          expand-icon-class="text-primary"
          class="column non-selectable"
          :dense="$q.platform.is.desktop"
          :expand-separator="calendarOpen"
          label="Calendars"
        >
          <QItemSection class="q-pa-md">
            <QBtn label="Google Calendar" @click="addGoogleCalendar" />
          </QItemSection>
        </QExpansionItem>
        <QSeparator />
        <QExpansionItem
          v-model="settingsOpen"
          group="backupgroup"
          icon="import_export"
          expand-icon-class="text-primary"
          class="column non-selectable"
          :dense="$q.platform.is.desktop"
          :expand-separator="settingsOpen"
          :label="$t('settings.native.title')"
        >
          <p class="q-pt-md q-pl-md q-pr-md">
            {{ $t('settings.native.description') }}
          </p>
          <QItemSection
            v-if="settingsOpen"
            class="q-pr-md q-pb-md q-pl-md no-margin"
          >
            <DatabaseComponent />
          </QItemSection>
          <template v-if="$q.platform.is.desktop">
            <QSeparator />
            <QItemSection class="q-pa-md no-margin">
              <p>{{ $t('settings.keychain.title') }}</p>
              <QBtn
                :label="$t('settings.keychain.label')"
                ripple
                round
                square
                stretch
                color="secondary"
                :dense="$q.platform.is.desktop"
                icon="key"
                @click="onExportKeychain"
              >
                <QTooltip>
                  {{ $t('settings.keychain.tooltip') }}
                </QTooltip>
              </QBtn>
            </QItemSection>
          </template>
          <template v-if="contractsCount > 0">
            <QSeparator />
            <QItemSection class="q-pa-md no-margin">
              <p>{{ $t('settings.clean.description') }}</p>
              <QBtn
                :label="$t('settings.clean.submit')"
                color="negative"
                :dense="$q.platform.is.desktop"
                round
                square
                icon="delete_outline"
                @click="confirm = true"
              >
                <QTooltip>
                  {{ $t('database.removeDatabase') }}
                </QTooltip>
              </QBtn>
            </QItemSection>
          </template>
        </QExpansionItem>
        <QSeparator />
        <QExpansionItem
          v-model="spacesOpen"
          group="backupgroup"
          icon="home"
          expand-icon-class="text-primary"
          class="column non-selectable"
          :dense="$q.platform.is.desktop"
          :expand-separator="spacesOpen"
          :label="'Personal Spaces'"
        >
          <p class="q-pt-md q-pl-md q-pr-md">Personal Spaces</p>

          <div>
            <QBtn
              v-if="isDemo"
              :color="$q.dark.isActive ? 'white' : 'dark'"
              :text-color="$q.dark.isActive ? 'dark' : 'white'"
              :dense="$q.platform.is.desktop"
              square
              no-caps
              glossy
              push
              unelevated
              align="left"
              icon="app_registration"
              class="full-width q-pl-md q-pr-md q-mb-md block"
              :label="$t('navigation.register')"
              @click="register"
            />
            <QBtn
              v-else-if="isLoggedIn"
              color="negative"
              :dense="$q.platform.is.desktop"
              square
              glossy
              push
              unelevated
              align="left"
              icon="logout"
              class="full-width q-pl-md q-pr-md q-mb-md block"
              :label="$t('navigation.signout')"
              @click="logOutFromPod"
            />
            <QBtn
              v-else-if="!isLoggedIn"
              color="primary"
              :dense="$q.platform.is.desktop"
              square
              glossy
              push
              unelevated
              align="left"
              icon="login"
              class="full-width q-pl-md q-pr-md q-mb-md block"
              :label="$t('navigation.signin')"
              @click="loginToPod"
            />
          </div>

          {{ $t('tutorial.oidc.caption') }}
          <p class="text-h4">
            {{ $t('tutorial.oidc.title') }}
          </p>

          <div
            class="text-body1"
            style="white-space: break-spaces"
            v-html="parse($t('tutorial.oidc.body'))"
          >
          </div>

          <OIDCIssuerComponent @on-complete="onOnlineAuthorize">
            <QTooltip>{{ $t('oidc.tutorialHint') }}</QTooltip>
          </OIDCIssuerComponent>
          <QBtn v-if="isLoggedIn" label="Sync Pod" @click="syncPods" />

          <QSeparator />

          <p class="q-pt-md q-pl-md q-pr-md">
            {{ $t('settings.native.description') }}
          </p>
          <QItemSection
            v-if="spacesOpen && isLoggedIn"
            class="q-pl-md q-pr-md q-pb-md no-margin"
          >
            <PodImporter />
            <QSeparator />
          </QItemSection>
        </QExpansionItem>
        <QSeparator />
        <QExpansionItem
          v-model="languageOpen"
          group="backupgroup"
          icon="translate"
          expand-icon-class="text-primary"
          class="column non-selectable"
          :dense="$q.platform.is.desktop"
          :expand-separator="languageOpen"
          :label="$t('settings.language.title')"
        >
          <QItemSection class="q-pa-md">
            <LocaleComponent />
          </QItemSection>
        </QExpansionItem>
        <QSeparator class="q-mb-md" />
        <QSpace class="col" />
        <QChip
          icon="more_vert"
          class="cursor-pointer full-width q-pa-md self-end"
          color="transparent"
          :dense="$q.platform.is.desktop"
          square
          clickable
          :label="miniState ? '' : $t('navigation.about')"
          :disable="router.currentRoute.value.name === ROUTE_NAMES.ABOUT"
          @click="router.push({ name: ROUTE_NAMES.ABOUT })"
        />
      </QList>
    </QDrawer>
    <QDrawer
      v-if="!isTMA"
      v-model="rightDrawerOpen"
      side="right"
      :width="320"
      class="q-pa-md scroll-y full-height"
      show-if-above
      bordered
    >
      <ChatDialog />
    </QDrawer>
    <QPageContainer>
      <RouterView
        class="q-ml-auto q-mr-auto"
        :style="
          $q.platform.is.desktop
            ? 'border-top-left-radius: 12px; border-top-right-radius: 12px;'
            : 'inherit'
        "
      />
      <QDialog v-model="confirm" persistent square>
        <DatabaseRemoveComponent v-if="confirm" @on-clear="confirm = false" />
      </QDialog>
      <ArchiveSearchComponent
        v-if="showSearch"
        v-model="showSearch"
        @on-search="onSearch"
      />
    </QPageContainer>
    <QFooter
      bordered
      :class="{
        'bg-white text-dark': !$q.dark.isActive,
        'bg-dark text-light': $q.dark.isActive,
      }"
    >
      <QTabs
        switch-indicator
        :dense="$q.platform.is.desktop"
        :align="$q.platform.is.desktop ? 'center' : 'justify'"
      >
        <QRouteTab
          icon="schedule"
          :to="{ name: ROUTE_NAMES.ARCHIVE }"
          @click="navCancel"
        >
          <QPopupProxy transition-show="scale" transition-hide="scale">
            <CalendarEventsComponent
              default-view="Calendar"
              class="q-ml-auto q-mr-auto q-mb-md q-mt-md"
              @select="onCalendarByDate"
            />
          </QPopupProxy>
        </QRouteTab>
        <QRouteTab
          icon="event"
          :to="{ name: ROUTE_NAMES.CALENDAR }"
          @click="navCancel"
        >
          <QPopupProxy transition-show="scale" transition-hide="scale">
            <CalendarEventsComponent
              class="q-ml-auto q-mr-auto q-mb-md q-mt-md"
              default-view="Months"
              @select="onCalendarByDate"
            />
          </QPopupProxy>
        </QRouteTab>
      </QTabs>
    </QFooter>
  </QLayout>
</template>
<script lang="ts" setup>
import {
  ref,
  computed,
  defineAsyncComponent,
  onBeforeMount,
  onMounted,
} from 'vue'
import { useI18n } from 'vue-i18n'
import {
  useQuasar,
  QDialog,
  QFooter,
  QTabs,
  QRouteTab,
  QBtn,
  QPageContainer,
  QPopupProxy,
  QTooltip,
  QChip,
  QImg,
  QSeparator,
  QItemSection,
  QExpansionItem,
  QIcon,
  QList,
  QDrawer,
  QToolbar,
  QHeader,
  QLayout,
  QSpace,
  QCard,
  QCardSection,
  exportFile,
} from 'quasar'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { logout } from '@inrupt/solid-client-authn-browser'
import useAuthStore from 'stores/auth'
import useTFAStore from 'stores/tfa'
import useContractStore from 'stores/contract'
import useTutorialStore from 'stores/tutorial'
import usePodStore from 'stores/pod'
import useLangStore from 'stores/lang'
import useSecretaryStore from 'stores/secretary'
import useNotification from 'stores/notification'
import useCalendarStore from 'stores/calendar'
import ToolbarTitleComponent from 'components/ToolbarTitleComponent.vue'
import UserProfile from 'components/UserProfile.vue'
import ChatDialog from 'components/ChatDialog.vue'
import { indexAllDocuments } from '../services/searchService'
import { isTWA, isTMA } from '../helpers/twaHelper'
import { keyPair } from '../services/databaseService'
import { createQR } from '../helpers/qrHelper'
import { open } from '../helpers/urlHelper'
import { parse } from '../helpers/markdownHelper'
import { ROUTE_NAMES, STEP } from '../router/routes'
import solidAuth from '../services/authService'
import ContractPod from '../services/contractGeneratorService'
import { formatToCalendarDate } from '../helpers/calendarHelper'

const LocaleComponent = defineAsyncComponent(
  () => import('components/LocaleComponent.vue'),
)
const DatabaseRemoveComponent = defineAsyncComponent(
  () => import('components/DatabaseRemoveComponent.vue'),
)
const DatabaseComponent = defineAsyncComponent(
  () => import('components/DatabaseComponent.vue'),
)
const PodImporter = defineAsyncComponent(
  () => import('components/PodImporter.vue'),
)
const ArchiveSearchComponent = defineAsyncComponent(
  () => import('components/ArchiveSearchComponent.vue'),
)
const QOtp = defineAsyncComponent(
  () => import('quasar-app-extension-q-otp/src/component/QOtp.vue'),
)
const AndroidBarComponent = defineAsyncComponent(
  () => import('components/AndroidBarComponent.vue'),
)
const OIDCIssuerComponent = defineAsyncComponent(
  () => import('components/OIDCIssuerComponent.vue'),
)
const CalendarEventsComponent = defineAsyncComponent(
  () => import('components/CalendarEventsComponent.vue'),
)

const $q = useQuasar()
const router = useRouter()
const i18n = useI18n()
const $t = i18n.t
const authStore = useAuthStore()
const tfaStore = useTFAStore()
const langStore = useLangStore()
const contractStore = useContractStore()
const tutorialStore = useTutorialStore()
const calendarStore = useCalendarStore()
const notificationStore = useNotification()
const podStore = usePodStore()
const secretaryStore = useSecretaryStore()

const NOTIFICATION_TIMER = 30000

const { contractsCount } = storeToRefs(contractStore)
const { isLoggedIn, isDemo } = storeToRefs(authStore)
const { jwt } = storeToRefs(secretaryStore)
const { activated } = storeToRefs(tfaStore)
const bigScreen = computed(
  () => $q.platform.is.desktop && ($q.screen.xl || $q.screen.lg),
)

const TFA_LENGTH = 6
const miniState = ref(bigScreen.value)
const showOTPDialog = ref(false)
const leftDrawerOpen = ref(false)
const rightDrawerOpen = ref(false)
const calendarOpen = ref(false)
const settingsOpen = ref(false)
const spacesOpen = ref(false)
const languageOpen = ref(false)
const profileOpen = ref(false)
const otpOpen = ref(false)
const confirm = ref(false)
const showSearch = ref(false)
const otp = ref<InstanceType<typeof QOtp> | null>(null)
const authUriQR = ref('')
const authUri = ref('')

function onToggleLeftDrawer(): void {
  leftDrawerOpen.value = !leftDrawerOpen.value
}

async function onExportKeychain() {
  const key = await keyPair.last()
  const keysJSON = keyPair.prepareKeyPair(key)
  if (keysJSON) {
    exportFile('keys.json', keysJSON)
  }
}

async function onSearch(searchText: string) {
  $q.loading.show()
  await router.push({
    name: ROUTE_NAMES.SEARCH,
    query: {
      name: searchText,
      page: 1,
    },
  })
  showSearch.value = false
}

function register() {
  tutorialStore.tutorialComplete(false)
  return router.push({
    name: ROUTE_NAMES.TUTORIAL,
    query: {
      step: STEP.WELCOME,
      lang: langStore.language,
    },
  })
}

function loginToPod() {
  $q.sessionStorage.remove('connect')
  $q.sessionStorage.set('restorePreviousSession', true)
  return router.push({
    name: ROUTE_NAMES.LOGIN,
  })
}

async function logOutFromPod() {
  await logout()
  authStore.openIdHandleIncoming()
  $q.localStorage.removeItem('oidcIssuer')
  $q.sessionStorage.remove('restorePreviousSession')
  $q.sessionStorage.remove('connect')
  $q.notify({
    message: $t('database.pod.disconnected'),
    type: 'positive',
  })
}

function otpRule(token: string) {
  if (token.length === TFA_LENGTH) {
    return tfaStore.verify(token) || 'TFA Error'
  }
  return true
}
function onOTPChange(value: string) {
  if (!activated.value || value.length) {
    return
  }
  const dialog = $q.dialog({
    message: $t('components.otp.pinDialog.message'),
    cancel: true,
    persistent: true,
  })
  dialog.onOk(() => {
    try {
      tfaStore.deactivate2fa()
      authStore.removeAuthValue()
      $q.notify({
        type: 'positive',
        message: $t('components.otp.pinDialog.success'),
      })
    } catch (error) {
      console.error(error)
      $q.notify({
        type: 'negative',
        message: $t('components.otp.pinDialog.fail'),
      })
    }
  })
  showOTPDialog.value = false
}

function onOTPHandleComplete(token: string) {
  if (!tfaStore.verify(token)) {
    return
  }
  const dialog = $q.dialog({
    message: $t('components.otp.saveDialog.message'),
    cancel: true,
    persistent: true,
  })
  dialog.onOk(() => {
    try {
      tfaStore.activate2fa()
      authStore.setTryAuthValue()
      $q.notify({
        type: 'positive',
        message: $t('components.otp.saveDialog.success'),
      })
    } catch (error) {
      console.error(error)
      $q.notify({
        type: 'negative',
        message: $t('components.otp.saveDialog.fail'),
      })
    }
  })
  showOTPDialog.value = false
}

async function openOTPDialog() {
  const authURI = tfaStore.generate()
  authUri.value = authURI
  authUriQR.value = await createQR(authURI)
  showOTPDialog.value = true
}

function addGoogleCalendar() {
  alert('WIP')
}

async function onCalendarByDate(strDate: string) {
  if (!strDate) {
    return
  }
  $q.loading.show()
  const date = formatToCalendarDate(new Date(strDate))
  await router.push({
    name: ROUTE_NAMES.CALENDAR,
    query: {
      date: date,
    },
  })
  $q.loading.hide()
}

async function onOnlineAuthorize(oidcIssuer: string) {
  if (!oidcIssuer) {
    const dialog = $q.dialog({
      message: $t('components.oidcIssuer.authorizeDialog.message'),
      cancel: true,
      persistent: true,
    })
    dialog.onOk(() => {
      alert('ok')
    })
    return
  }

  $q.loading.show()
  $q.sessionStorage.remove('connect')
  const redirectUrl = window.location.origin + window.location.pathname
  try {
    await solidAuth({
      redirectUrl: redirectUrl,
      oidcIssuer: oidcIssuer,
      restorePreviousSession: false,
    })
  } catch (error) {
    console.error(error)
    $q.notify({
      color: 'negative',
      message: $t('components.oidcIssuer.authorizeDialog.fail'),
    })
  } finally {
    $q.loading.hide()
  }
}

function syncPods() {
  const dialog = $q.dialog({
    message: $t('database.pod.sync'),
    cancel: true,
    persistent: true,
  })
  dialog
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    .onOk(async () => {
      const links = await podStore.getContractsLink()
      for (const link of links) {
        const message = 'refreshing ' + link
        const newDogovor = await ContractPod.fromSolidUrl(link)
        dialog.update({ message: message })
        await contractStore.insertContract(newDogovor.presentation)
      }
    })
}

onBeforeMount(() => {
  setTimeout(() => {
    notificationStore.check()
  }, NOTIFICATION_TIMER)
  if (typeof router.currentRoute.value.query.action === 'string') {
    open(router.currentRoute.value.query.action)
    return
  }
})

onMounted(async () => {
  if ($q.platform.is.desktop && contractsCount.value > 0) {
    await indexAllDocuments()
  }
  await secretaryStore.ping()
})

function navCancel(e: Event) {
  e.preventDefault()
}
</script>
<style lang="scss">
:root {
  touch-action: pan-x pan-y;
}
</style>
