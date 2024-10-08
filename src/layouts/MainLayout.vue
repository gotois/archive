<template>
  <QLayout view="lHr lpR lfr">
    <QHeader
      reveal
      :bordered="$q.platform.is.mobile"
      height-hint="98"
      class="text-primary bg-transparent"
    >
      <AndroidBarComponent v-if="isTWA" />
      <QToolbar>
        <QBtn
          v-if="
            !isTelegramWebApp && ($q.screen.xs || $q.screen.sm || $q.screen.md)
          "
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
        <ToolbarTitleComponent
          :class="{
            'text-center': !$q.platform.is.desktop,
          }"
        >
          <QBadge
            :label="headerBadge"
            transparent
            color="secondary"
            class="vertical-top q-ml-xs"
          />
        </ToolbarTitleComponent>
        <template v-if="contractsCount > 0">
          <SearchInputComponent
            v-if="$q.platform.is.desktop"
            autofocus
            @search="(value) => onSearch(value)"
          />
          <QBtn
            v-else
            flat
            round
            :dense="$q.platform.is.desktop"
            class="cursor-pointer"
            name="search"
            icon="search"
            @click="showSearch = true"
          />
        </template>
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
      v-if="!isTelegramWebApp"
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
        <QIcon v-if="miniState" size="24px" name="settings" color="primary" />
        <span v-else>{{ $t('navigation.title') }}</span>
      </p>
      <QList style="max-height: calc(100% - 64px)" class="fit column no-wrap">
        <div v-if="miniState">
          <QSpace class="q-mb-md" style="height: 32px" />
        </div>
        <div v-else>
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
        <QExpansionItem
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
                v-model.trim="consumer"
                color="secondary"
                type="text"
                outlined
                :clearable="!isDemo"
                :readonly="isDemo"
                stack-label
                :hide-hint="!$q.platform.is.desktop"
                :label="$t('consumer.type')"
                :rules="[
                  (val) => (val && val.length > 0) || $t('consumer.rules'),
                ]"
                name="consumer"
                autocomplete="on"
              >
                <template #prepend>
                  <QIcon
                    class="rounded-borders"
                    :class="{
                      'bg-white': avatar,
                    }"
                    :name="avatar ? 'img:' + avatar : 'face'"
                  />
                </template>
              </QInput>
              <QInput
                v-if="!isDemo && email"
                v-model.trim="email"
                color="secondary"
                type="email"
                outlined
                :clearable="!isDemo"
                :readonly="isDemo"
                stack-label
                :hide-hint="!$q.platform.is.desktop"
                :hide-bottom-space="!email"
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
                v-if="!isDemo && phone"
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
                :hide-bottom-space="!phone"
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
                v-if="!isDemo && getWalletLD.id"
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
                v-else
                :label="$t('tutorial.wallet.title')"
                icon="wallet"
                content-class="full-width q-mb-md"
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
                  'q-mt-md': consumer?.length === 0,
                }"
                :outline="!consumer?.length && !email?.length"
                type="submit"
                color="secondary"
              />
            </QForm>
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
                      :num="tfaLength"
                      :rules="[otpRule]"
                      square
                      autofocus
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
            v-if="settingsOpen && isLoggedIn"
            class="q-pl-md q-pr-md q-pb-md no-margin"
          >
            <PodImporter />
            <QSeparator />
          </QItemSection>
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
          icon="note"
          class="cursor-pointer full-width q-pa-md self-end"
          color="transparent"
          :dense="$q.platform.is.desktop"
          square
          clickable
          :label="miniState ? '' : $t('navigation.score')"
          @click="onOpenNPS"
        />
        <QChip
          icon="support"
          class="cursor-pointer full-width q-pa-md self-end"
          color="transparent"
          :dense="$q.platform.is.desktop"
          square
          clickable
          :disable="router.currentRoute.value.name === ROUTE_NAMES.SUPPORT"
          :label="miniState ? '' : $t('navigation.support.free.label')"
          @click="onOpenSupport"
        >
          <QTooltip
            v-if="
              $q.platform.is.mac ||
              $q.platform.is.linux ||
              $q.platform.is.win ||
              $q.platform.is.safari
            "
          >
            <!--todo поддержать логику premium/vip-->
            {{ $t('navigation.support.free.tooltip') }}
          </QTooltip>
        </QChip>
      </QList>
    </QDrawer>
    <QDrawer
      v-if="getArchiveNames.length"
      v-model="rightDrawerOpen"
      side="right"
      :width="320"
      class="q-pa-md scroll-y"
      show-if-above
      bordered
    >
      <p
        class="block full-width text-h6 text-left q-mb-md no-border-radius non-selectable no-pointer-events"
      >
        {{ $t('documentTypes.title') }}
      </p>
      <div
        style="height: calc(100dvh - 380px); overflow-x: hidden"
        class="scroll-y"
      >
        <QChip
          v-for="([name, value], objectKey) in getArchiveNames"
          :key="objectKey"
          :dense="$q.platform.is.desktop"
          square
          outline
          class="row"
          style="max-width: calc(100% - 8px)"
          :ripple="false"
          :disable="router.currentRoute.value.query.name === name"
          :selected="router.currentRoute.value.query.name === name"
          :color="value.recommendation ? 'orange' : ''"
          :clickable="value.count > 0"
          :removable="value.recommendation"
          @remove="onRemoveArchiveName(name as string)"
          @click="onSelectArchiveName(name, value)"
        >
          <QAvatar
            v-if="value.count > 1"
            :color="$q.dark.isActive ? 'white' : 'dark'"
            :text-color="$q.dark.isActive ? 'dark' : 'white'"
            square
          >
            {{ value.count }}
          </QAvatar>
          <div class="ellipsis">{{ name }}</div>
          <QTooltip>{{ name }}</QTooltip>
        </QChip>
        <QSkeleton
          v-show="getArchiveNames.length === 0"
          type="QChip"
          animation="blink"
          width="100%"
        />
      </div>
      <CalendarEventsComponent
        class="absolute-bottom q-ml-auto q-mr-auto q-mb-none q-mt-md"
        @select="onFilterById"
      />
    </QDrawer>
    <QPageContainer>
      <RouterView
        class="q-ml-auto q-mr-auto"
        :class="{
          'q-card--bordered': $q.platform.is.desktop,
        }"
        :style="
          $q.platform.is.desktop
            ? 'border-top-left-radius: 12px; border-top-right-radius: 12px; max-width: 768px'
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
  </QLayout>
</template>
<script lang="ts" setup>
import { ref, computed, defineAsyncComponent, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  useQuasar,
  QDialog,
  QBtn,
  QField,
  QPageContainer,
  QSkeleton,
  QTooltip,
  QAvatar,
  QChip,
  QImg,
  QSeparator,
  QItemSection,
  QExpansionItem,
  QIcon,
  QInput,
  QForm,
  QList,
  QDrawer,
  QBadge,
  QToolbar,
  QHeader,
  QLayout,
  QSpace,
  QCard,
  QCardSection,
  exportFile,
  copyToClipboard,
} from 'quasar'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { logout } from '@inrupt/solid-client-authn-browser'
import useAuthStore from 'stores/auth'
import useTFAStore from 'stores/tfa'
import useContractStore from 'stores/contract'
import useTutorialStore from 'stores/tutorial'
import useProfileStore from 'stores/profile'
import useWalletStore from 'stores/wallet'
import useGicStore from 'stores/gic'
import ToolbarTitleComponent from 'components/ToolbarTitleComponent.vue'
import { indexAllDocuments } from '../services/searchService'
import { isTWA } from '../helpers/twaHelper'
import { keyPair } from '../services/databaseService'
import { createQR } from '../helpers/qrHelper'
import { open } from '../helpers/urlHelper'
import { ROUTE_NAMES, STEP } from '../router/routes'

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
const SearchInputComponent = defineAsyncComponent(
  () => import('components/SearchInputComponent.vue'),
)
const ArchiveSearchComponent = defineAsyncComponent(
  () => import('components/ArchiveSearchComponent.vue'),
)
const QOtp = defineAsyncComponent(
  () => import('quasar-app-extension-q-otp/src/component/QOtp.vue'),
)
const PhantomWalletLogin = defineAsyncComponent(
  () => import('components/PhantomWalletLogin.vue'),
)
const AndroidBarComponent = defineAsyncComponent(
  () => import('components/AndroidBarComponent.vue'),
)
const CalendarEventsComponent = defineAsyncComponent(
  () => import('components/CalendarEventsComponent.vue'),
)

const $q = useQuasar()
const router = useRouter()
const i18n = useI18n()
const $t = i18n.t
const locale = i18n.locale
const authStore = useAuthStore()
const tfaStore = useTFAStore()
const contractStore = useContractStore()
const profileStore = useProfileStore()
const walletStore = useWalletStore()
const tutorialStore = useTutorialStore()
const gicStore = useGicStore()

const { consumer, email, phone, avatar } = storeToRefs(profileStore)
const { getArchiveNames, contractsCount } = storeToRefs(contractStore)
const { isLoggedIn, isDemo, isTelegramWebApp, webId } = storeToRefs(authStore)
const { activated } = storeToRefs(tfaStore)
const { getWalletLD } = storeToRefs(walletStore)
const bigScreen = computed(
  () => $q.platform.is.desktop && ($q.screen.xl || $q.screen.lg),
)
const headerBadge = computed(() => {
  if (isTelegramWebApp) {
    return $t('header.telegram')
  }
  if (isDemo) {
    return $t('header.demo')
  }
  return $t('header.free')
})

const tfaLength = 6
const miniState = ref(bigScreen.value)
const showOTPDialog = ref(false)
const leftDrawerOpen = ref(false)
const rightDrawerOpen = ref(false)
const settingsOpen = ref(false)
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

async function onCopyText(text: string) {
  await copyToClipboard(text)
  $q.notify({
    type: 'positive',
    group: false,
    message: $t('copy.success'),
  })
}

async function onExportKeychain() {
  const keysJSON = await keyPair.prepareKeyPair()
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
      lang: locale.value,
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
  $q.localStorage.remove('oidcIssuer')
  $q.sessionStorage.remove('restorePreviousSession')
  $q.sessionStorage.remove('connect')
  $q.notify({
    message: $t('database.pod.disconnected'),
    type: 'positive',
  })
}

function onOpenNPS() {
  // todo для VIP
  // ... - https://docs.google.com/forms/d/e/1FAIpQLSdowzB3yyvMAQjlv_gWye1teBhV5LcYxXeX2PJjDDhsir5Fnw/viewform?usp=sf_link

  // Для Free и Premium
  window.open(
    'https://docs.google.com/forms/d/e/1FAIpQLSdY3ao4duiZFp9jmM3-9d25gFFgWeklksssLDl4WZcoMS_CeQ/viewform?usp=sf_link',
  )
}

function onOpenSupport() {
  return router.push({
    name: ROUTE_NAMES.SUPPORT,
  })
}

async function onFinishProfile() {
  profileStore.consumerName(consumer.value)
  profileStore.consumerEmail(email.value)
  profileStore.consumerPhone(phone.value)
  await profileStore.setAvatar(email.value)
  $q.notify({
    message: $t('consumer.success'),
    type: 'positive',
  })
}

function otpRule(token: string) {
  if (token.length === tfaLength) {
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

function onRemoveArchiveName(name: string) {
  contractStore.removeContractName(name)
}

async function onFilterById(ids: number[]) {
  if (!ids) {
    return
  }
  $q.loading.show()
  await contractStore.filteredByIds({
    ids: ids,
  })
  $q.loading.hide()
}

async function onSelectArchiveName(
  name: string,
  value: { count: number; recommendation: boolean },
) {
  if (value.count === 0) {
    return
  }
  await router.push({
    name: ROUTE_NAMES.FILTER,
    query: {
      name: name,
      page: 1,
    },
  })
}

async function openOTPDialog() {
  const authURI = tfaStore.generate()
  authUri.value = authURI
  authUriQR.value = await createQR(authURI)
  showOTPDialog.value = true
}

onMounted(async () => {
  if ($q.platform.is.desktop && contractsCount.value > 0) {
    await indexAllDocuments()
  }
  await gicStore.ping()
})
</script>
<style lang="scss">
:root {
  touch-action: pan-x pan-y;
}
</style>
