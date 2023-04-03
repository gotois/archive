<template>
  <QLayout view="lHr lpR lfr">
    <QHeader reveal bordered class="bg-white text-primary" height-hint="98">
      <QToolbar>
        <QBtn
          flat
          dense
          round
          icon="settings"
          aria-label="Settings"
          @click="onToggleLeftDrawer"
        />
        <QToolbarTitle class="text-black-9 text-center non-selectable">
          <template v-if="isLoggedIn">
            <QBadge rounded color="green">
              <QTooltip>Вы подключены к SOLID серверу</QTooltip>
            </QBadge>
          </template>
          <template v-else>
            <QBadge rounded color="yellow">
              <QTooltip>Вы не подключены к SOLID серверу</QTooltip>
            </QBadge>
          </template>
          {{ $t('header.title') }}
          <QBadge
            outline
            rounded
            align="top"
            color="accent"
            class="absolute q-ml-xs"
          >
            {{ $t('navigation.version') }}{{ navigatorVersion }}
          </QBadge>
        </QToolbarTitle>
        <QBtn
          flat
          round
          dense
          class="cursor-pointer"
          name="search"
          icon="search"
          @click="showSearch = true"
        />
        <QBtn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="rightDrawerOpen = !rightDrawerOpen"
        ></QBtn>
      </QToolbar>
      <QTabs
        shrink
        stretch
        inline-label
        outside-arrows
        mobile-arrows
        align="center"
      >
        <QRouteTab
          :to="{ name: 'create' }"
          icon="create"
          :label="$t('header.create')"
        />
        <QRouteTab
          :to="{ name: 'archive', query: { page: 1 } }"
          icon="archive"
          :label="$t('header.archive')"
        />
      </QTabs>
    </QHeader>
    <QDrawer v-model="leftDrawerOpen" side="left" show-if-above bordered>
      <p
        class="full-width block text-h6 q-pl-md q-pr-md q-pt-md no-border-radius non-selectable no-pointer-events"
      >
        {{ $t('navigation.title') }}
      </p>
      <QList>
        <QBtn
          v-if="isLoggedIn"
          color="primary"
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
          square
          glossy
          push
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
                outlined
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
              <QBtn
                :label="$t('consumer.save')"
                icon="save"
                class="full-width"
                :class="{
                  'q-mt-md': consumer.length === 0,
                }"
                :outline="consumer.length === 0"
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
            <p>{{ $t('settings.otp.description') }}</p>
            <QTooltip>{{ $t('settings.otp.label') }}</QTooltip>
            <VOtpInput
              :value="pin"
              input-classes="otp-input"
              class="flex flex-center"
              separator="-"
              :num-inputs="4"
              :should-auto-focus="true"
              :is-input-num="true"
              :conditional-class="['', '', '', '']"
              :placeholder="['*', '*', '*', '*']"
              @on-change="onOTPChange"
              @on-complete="onOTPHandleComplete"
            />
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
          <QSeparator />
          <QItemSection class="q-pa-md">
            <p>{{ $t('settings.clean.description') }}</p>
            <QBtn
              :label="$t('settings.clean.submit')"
              color="negative"
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
        <QChip
          icon="link"
          class="cursor-pointer full-width q-pa-md self-end"
          color="white"
          square
          clickable
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
        dense
        square
        outline
        clickable
        class="row"
        :color="value.recommendation ? 'orange' : ''"
        @click="onSelectArchiveName(name, value)"
      >
        <QAvatar v-if="value.count > 1" color="secondary" text-color="white">{{
          value.count
        }}</QAvatar>
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
      <QDialog v-model="dialogOIDCIssuer" persistent square>
        <QCard class="q-pa-md">
          <QToolbar>
            <QToolbarTitle>Введите адрес своего OIDC Issuer</QToolbarTitle>
            <QBtn v-close-popup flat round dense icon="close" />
          </QToolbar>
          <OIDCIssuerComponent @on-complete="onOnlineAuthorize" />
        </QCard>
      </QDialog>
    </QPageContainer>
  </QLayout>
</template>

<script lang="ts" setup>
import { ref, computed, defineAsyncComponent } from 'vue'
import {
  openURL,
  useQuasar,
  QCard,
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
  QToolbarTitle,
  QToolbar,
  QHeader,
  QLayout,
} from 'quasar'
import { useRouter } from 'vue-router'
import { useStore } from '../store'
import pkg from '../../package.json'
import twaManifest from '../../twa-manifest.json'
import { logout } from '@inrupt/solid-client-authn-browser'
import { solidAuth } from '../services/podHelper'
import OIDCIssuerComponent from 'components/OIDCIssuerComponent.vue'

const { version } = pkg
const { packageId } = twaManifest

const DatabaseRemoveComponent = defineAsyncComponent(
  () => import('components/DatabaseRemoveComponent.vue'),
)
const DatabaseComponent = defineAsyncComponent(
  () => import('components/DatabaseComponent.vue'),
)
const ArchiveSearchComponent = defineAsyncComponent(
  () => import('components/ArchiveSearchComponent.vue'),
)
const VOtpInput = defineAsyncComponent(() => import('vue3-otp-input'))

const store = useStore()
const $q = useQuasar()
const router = useRouter()

const pin = ref('')
const leftDrawerOpen = ref(false)
const rightDrawerOpen = ref(false)
const settingsOpen = ref(false)
const profileOpen = ref(false)
const otpOpen = ref(false)
const confirm = ref(false)
const showSearch = ref(false)
const dialogOIDCIssuer = ref(false)
const navigatorVersion = ref(version)
// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
const consumer = ref(store.getters.consumer as string)

// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
const isLoggedIn = computed(() => store.getters['Auth/isLoggedIn'] as boolean)
// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-return
const archiveNames = computed(() => store.getters.archiveNames)

function onToggleLeftDrawer(): void {
  leftDrawerOpen.value = !leftDrawerOpen.value
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

function onOnlineAuthorize(oidcIssuer: string) {
  if (!oidcIssuer) {
    return
  }
  $q.loading.show()
  $q.localStorage.set('restorePreviousSession', true)

  return solidAuth({
    oidcIssuer: oidcIssuer,
    restorePreviousSession: true,
    sessionRestoreCallback: () => {
      void store.dispatch('Auth/openIdHandleIncoming')
      $q.loading.hide()
    },
    loginCallback: () => {
      void store.dispatch('Auth/openIdHandleIncoming')
      $q.loading.hide()
    },
  })
}

function loginToPod() {
  if ($q.localStorage.has('oidcIssuer')) {
    return onOnlineAuthorize($q.localStorage.getItem('oidcIssuer'))
  }
  dialogOIDCIssuer.value = true
}

async function logOutFromPod() {
  await logout()
  await store.dispatch('Auth/openIdHandleIncoming')
  $q.localStorage.remove('oidcIssuer')
  $q.localStorage.remove('restorePreviousSession')
  $q.notify({
    message: 'Вы успешно вышли из системы',
    type: 'positive',
  })
}

function onOpenFeedback() {
  if ($q.platform.is.android) {
    openURL(
      'https://play.google.com/store/apps/details?id=' + packageId,
      null,
      {
        menubar: false,
        toolbar: false,
      },
    )
    return
  }
  openURL('https://baskovsky.ru/feedback/', null, {
    noopener: true,
    menubar: false,
    toolbar: false,
    noreferrer: true,
  })
}

async function onFinishProfile() {
  await store.dispatch('consumerName', consumer.value.trim())
  $q.notify({
    message: 'ФИО сохранено',
    type: 'positive',
  })
}

async function onOTPChange(value: string) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  if (value === '' && store.getters['Auth/code']) {
    if (window.confirm('Действительно удалить пин?')) {
      await store.dispatch('Auth/removeCode')
      $q.notify({
        type: 'positive',
        message: 'Ключ отключен',
      })
    }
  }
}

async function onOTPHandleComplete(value: string) {
  if (window.confirm('Действительно сохранить пин?')) {
    await store.dispatch('Auth/setCode', value)
    $q.notify({
      type: 'positive',
      message: 'Ключ изменен',
    })
  }
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
