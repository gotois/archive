<template>
  <QLayout view="lHr lpR lfr">
    <QHeader reveal bordered class="bg-white text-primary" height-hint="98">
      <AndroidBarComponent v-if="isTWA" />
      <QToolbar>
        <QBtn
          flat
          round
          :dense="$q.platform.is.desktop"
          icon="settings"
          aria-label="Settings"
          @click="onToggleLeftDrawer"
        />
        <ToolbarTitleComponent />
        <QBtn
          flat
          round
          :dense="$q.platform.is.desktop"
          class="cursor-pointer"
          name="search"
          icon="search"
          @click="showSearch = true"
        />
        <QBtn
          flat
          round
          :dense="$q.platform.is.desktop"
          icon="menu"
          aria-label="Menu"
          @click="rightDrawerOpen = !rightDrawerOpen"
        />
      </QToolbar>
      <QTabs
        shrink
        stretch
        :inline-label="!$q.platform.is.desktop"
        mobile-arrows
        :align="$q.platform.is.desktop ? 'center' : 'justify'"
      >
        <QRouteTab
          :to="{ name: 'create' }"
          icon="create"
          :label="$t('header.create')"
        />
        <QRouteTab
          :to="{ name: 'archive' }"
          icon="archive"
          :label="$t('header.archive')"
          @click="onArchiveRoute"
        >
          <QBadge
            color="secondary"
            transparent
            :dense="$q.platform.is.desktop"
            class="q-ml-xs"
            align="middle"
            :style="{
              height: $q.platform.is.mobile ? '24px' : 'auto',
            }"
            :floating="$q.platform.is.desktop"
            :rounded="$q.platform.is.desktop"
          >
            <template v-if="contractsCount">
              {{ contractsCount > 999 ? '999+' : contractsCount }}
            </template>
            <QTooltip v-if="isLoggedIn">Вы подключены к SOLID серверу</QTooltip>
          </QBadge>
        </QRouteTab>
      </QTabs>
    </QHeader>
    <QDrawer v-model="leftDrawerOpen" side="left" show-if-above bordered>
      <p
        class="full-width block text-h6 q-pl-md q-pr-md q-pt-md no-border-radius non-selectable no-pointer-events"
      >
        {{ $t('navigation.title') }}
      </p>
      <QList style="max-height: calc(100% - 64px)" class="fit column no-wrap">
        <QBtn
          v-if="isLoggedIn"
          color="negative"
          :dense="$q.platform.is.desktop"
          square
          glossy
          push
          class="full-width q-mb-md"
          label="Выйти из Solid"
          @click="logOutFromPod"
        />
        <QBtn
          v-if="!isLoggedIn"
          color="primary"
          :dense="$q.platform.is.desktop"
          square
          glossy
          push
          unelevated
          class="full-width q-mb-md"
          label="Войти через WebId"
          @click="loginToPod"
        />
        <QExpansionItem
          v-model="profileOpen"
          group="backupgroup"
          icon="person"
          :dense="$q.platform.is.desktop"
          class="column non-selectable"
          :class="{
            'bg-grey-2': profileOpen,
          }"
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
              <QInput
                v-model="consumer"
                bg-color="white"
                color="secondary"
                type="text"
                outlined
                clearable
                :label="$t('consumer.type')"
                :rules="[
                  (val) => (val && val.length > 0) || $t('consumer.rules'),
                ]"
                name="consumer"
                autocomplete="on"
              >
                <template #prepend>
                  <QIcon name="face" />
                </template>
              </QInput>
              <QInput
                v-model="email"
                bg-color="white"
                color="secondary"
                type="email"
                outlined
                clearable
                :label="$t('consumer.email')"
                :rules="['email']"
                name="email"
                autocomplete="off"
              >
                <template #prepend>
                  <QIcon name="email" />
                </template>
              </QInput>
              <QBtn
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
                color="accent"
              />
            </QForm>
          </QItemSection>
        </QExpansionItem>
        <QSeparator />
        <QExpansionItem
          v-model="otpOpen"
          group="backupgroup"
          icon="vpn_key"
          :dense="$q.platform.is.desktop"
          class="column non-selectable"
          :class="{
            'bg-grey-2': otpOpen,
          }"
          :label="$t('settings.native.otp')"
        >
          <QItemSection class="q-pa-md">
            <template v-if="hasCode">
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
                icon="key"
                :label="$t('settings.otp.addCode')"
                @click="showOTPDialog = true"
              />
              <QDialog v-model="showOTPDialog" position="bottom" square>
                <QCard flat class="q-pa-md">
                  <QCardSection>
                    <p>{{ $t('settings.otp.description') }}</p>
                    <QSpace class="q-pa-xs" />
                    <OTPComponent
                      v-if="showOTPDialog"
                      ref="otp"
                      autofocus
                      class="flex flex-center"
                      @on-change="onOTPChange"
                      @on-complete="onOTPHandleComplete"
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
          :dense="$q.platform.is.desktop"
          class="column non-selectable"
          :class="{
            'bg-grey-2': settingsOpen,
          }"
          :label="$t('settings.native.title')"
        >
          <QItemSection class="q-pa-md">
            <p>{{ $t('settings.native.description') }}</p>
            <DatabaseComponent v-if="settingsOpen" />
          </QItemSection>
          <template v-if="$q.platform.is.desktop">
            <QSeparator />
            <QItemSection class="q-pa-md">
              <p>{{ $t('settings.keychain.title') }}</p>
              <QBtn
                :label="$t('settings.keychain.label')"
                :dense="$q.platform.is.desktop"
                round
                square
                icon="key"
                @click="onExportKeychain"
              >
                <QTooltip>
                  {{ $t('settings.keychain.tooltip') }}
                </QTooltip>
              </QBtn>
            </QItemSection>
          </template>
          <QSeparator />
          <QItemSection class="q-pa-md">
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
        </QExpansionItem>
        <QSeparator class="q-mb-md" />
        <QSpace class="col" />
        <QChip
          icon="link"
          class="cursor-pointer full-width q-pa-md self-end"
          color="white"
          :dense="$q.platform.is.desktop"
          square
          clickable
          :disable="router.currentRoute.value.name === 'feedback'"
          :label="$t('navigation.feedback.label')"
          @click="onOpenFeedback"
        >
          <QTooltip>
            {{ $t('navigation.feedback.tooltip') }}
          </QTooltip>
        </QChip>
      </QList>
    </QDrawer>
    <QDrawer
      v-if="archiveNames.length"
      v-model="rightDrawerOpen"
      show-if-above
      bordered
      side="right"
      class="q-pa-md scroll-y"
    >
      <p
        class="block full-width text-h6 text-left q-mb-md no-border-radius non-selectable no-pointer-events"
      >
        {{ $t('documentTypes.title') }}
      </p>
      <QChip
        v-for="([name, value], objectKey) in archiveNames"
        :key="objectKey"
        :dense="$q.platform.is.desktop"
        square
        outline
        clickable
        class="row"
        :disable="router.currentRoute.value.query.filter === name"
        :selected="router.currentRoute.value.query.filter === name"
        :color="value.recommendation ? 'orange' : ''"
        :removable="value.recommendation"
        @remove="onRemoveArchiveName(name as String)"
        @click="onSelectArchiveName(name, value)"
      >
        <QAvatar v-if="value.count > 1" color="secondary" text-color="white">
          {{ value.count }}
        </QAvatar>
        <div class="ellipsis">{{ name }}</div>
        <QTooltip>{{ name }}</QTooltip>
      </QChip>
      <QSkeleton
        v-show="archiveNames.length === 0"
        type="QChip"
        animation="blink"
        width="100%"
      />
    </QDrawer>
    <QPageContainer>
      <RouterView />
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
import { ref, computed, defineAsyncComponent } from 'vue'
import {
  useQuasar,
  LocalStorage,
  SessionStorage,
  QDialog,
  QBtn,
  QPageContainer,
  QSkeleton,
  QTooltip,
  QAvatar,
  QChip,
  QSeparator,
  QItemSection,
  QExpansionItem,
  QIcon,
  QInput,
  QForm,
  QList,
  QDrawer,
  QBadge,
  QTabs,
  QRouteTab,
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
import { logout } from '@inrupt/solid-client-authn-browser/src/defaultSession'
import useAuthStore from 'stores/auth'
import useContractStore from 'stores/contract'
import useProfileStore from 'stores/profile'
import ToolbarTitleComponent from 'components/ToolbarTitleComponent.vue'
import { isTWA } from '../helpers/twaHelper'

import { exportKeyPair } from '../services/cryptoService'
const DatabaseRemoveComponent = defineAsyncComponent(
  () => import('components/DatabaseRemoveComponent.vue'),
)
const DatabaseComponent = defineAsyncComponent(
  () => import('components/DatabaseComponent.vue'),
)
const ArchiveSearchComponent = defineAsyncComponent(
  () => import('components/ArchiveSearchComponent.vue'),
)
const OTPComponent = defineAsyncComponent(
  () => import('components/OTPComponent.vue'),
)
const AndroidBarComponent = defineAsyncComponent(
  () => import('components/AndroidBarComponent.vue'),
)

const $q = useQuasar()
const router = useRouter()
const authStore = useAuthStore()
const contractStore = useContractStore()
const profileStore = useProfileStore()

const showOTPDialog = ref(false)
const leftDrawerOpen = ref(false)
const rightDrawerOpen = ref(false)
const settingsOpen = ref(false)
const profileOpen = ref(false)
const otpOpen = ref(false)
const confirm = ref(false)
const showSearch = ref(false)
const otp = ref<InstanceType<typeof OTPComponent> | null>(null)
const { consumer, email } = storeToRefs(profileStore)

const hasCode = computed(() => authStore.hasCode)
const isLoggedIn = computed(() => authStore.isLoggedIn)
const contractsCount = computed(() => contractStore.contractsCount)
const archiveNames = computed(() => contractStore.archiveNames)

function onToggleLeftDrawer(): void {
  leftDrawerOpen.value = !leftDrawerOpen.value
}

function onArchiveRoute(e: Event) {
  e.preventDefault()
  return router.push({
    name: 'archive',
    query: {
      page: 1,
    },
  })
}

async function onExportKeychain() {
  const keysJSON = await exportKeyPair()
  exportFile('keys.json', keysJSON)
}

async function onSearch(searchText: string) {
  $q.loading.show()
  await router.push({
    name: 'search',
    query: {
      filter: searchText,
      page: 1,
    },
  })
  showSearch.value = false
}

function loginToPod() {
  SessionStorage.remove('connect')
  SessionStorage.set('restorePreviousSession', true)
  return router.push({
    name: 'login',
  })
}

async function logOutFromPod() {
  await logout()
  authStore.openIdHandleIncoming()
  LocalStorage.remove('oidcIssuer')
  SessionStorage.remove('restorePreviousSession')
  SessionStorage.remove('connect')
  $q.notify({
    message: 'Вы отключили привязку к вашему Pod',
    type: 'positive',
  })
}

function onOpenFeedback() {
  return router.push({
    name: 'feedback',
  })
}

function onFinishProfile() {
  profileStore.consumerName(consumer.value)
  profileStore.consumerEmail(email.value)
  $q.notify({
    message: 'Профиль обновлен',
    type: 'positive',
  })
}

function onOTPChange(value: string) {
  if (!hasCode.value || value.length) {
    return
  }
  $q.dialog({
    message: 'Действительно удалить пин?',
    cancel: true,
    persistent: true,
  }).onOk(() => {
    authStore.removeCode()
    $q.notify({
      type: 'positive',
      message: 'Ключ отключен',
    })
  })
  showOTPDialog.value = false
}

function onOTPHandleComplete(code: string) {
  $q.dialog({
    message: 'Действительно сохранить PIN?',
    cancel: true,
    persistent: true,
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
  }).onOk(async () => {
    await authStore.setCode(code)
    $q.notify({
      type: 'positive',
      message: 'PIN сохранен',
    })
  })
  showOTPDialog.value = false
}

function onRemoveArchiveName(name: string) {
  contractStore.removeContractName(name)
}

async function onSelectArchiveName(
  name: string,
  value: { count: number; recommendation: boolean },
) {
  if (value.count === 0) {
    await router.push({
      name: 'create',
      query: {
        contractTypeName: name,
      },
    })
    return
  }
  await router.push({
    name: 'filter',
    query: {
      filter: name,
      page: 1,
    },
  })
}
</script>
