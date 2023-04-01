<template>
  <q-layout view="lHr lpR lfr">
    <q-header reveal bordered class="bg-white text-primary" height-hint="98">
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="settings"
          aria-label="Settings"
          @click="onToggleLeftDrawer"
        />
        <q-toolbar-title class="text-black-9 text-center non-selectable">
          <template v-if="isLoggedIn">
            <q-badge rounded color="green">
              <q-tooltip>Вы подключены к SOLID серверу</q-tooltip>
            </q-badge>
          </template>
          <template v-else>
            <q-badge rounded color="yellow">
              <q-tooltip>Вы не подключены к SOLID серверу</q-tooltip>
            </q-badge>
          </template>
          {{ $t('header.title') }}
          <q-badge
            outline
            rounded
            align="top"
            color="accent"
            class="absolute q-ml-xs"
          >
            {{ $t('navigation.version') }}{{ navigatorVersion }}
          </q-badge>
        </q-toolbar-title>
        <q-btn
          flat
          round
          dense
          class="cursor-pointer"
          name="search"
          icon="search"
          @click="showSearch = true"
        />
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="rightDrawerOpen = !rightDrawerOpen"
        ></q-btn>
      </q-toolbar>
      <q-tabs
        shrink
        stretch
        inline-label
        outside-arrows
        mobile-arrows
        align="center"
      >
        <q-route-tab
          :to="{ name: 'create' }"
          icon="create"
          :label="$t('header.create')"
        />
        <q-route-tab
          :to="{ name: 'archive', query: { page: 1 } }"
          icon="archive"
          :label="$t('header.archive')"
        />
      </q-tabs>
    </q-header>
    <q-drawer v-model="leftDrawerOpen" side="left" show-if-above bordered>
      <p
        class="full-width block text-h6 q-pl-md q-pr-md q-pt-md no-border-radius non-selectable no-pointer-events"
      >
        {{ $t('navigation.title') }}
      </p>
      <q-list>
        <q-expansion-item
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
          <q-item-section class="q-pa-md">
            <p>{{ $t('settings.consumer.description') }}</p>
            <q-form
              ref="nameForm"
              autocapitalize="off"
              autocomplete="off"
              greedy
              @submit="onFinishProfile"
            >
              <q-input
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
                  <q-icon name="face" />
                </template>
              </q-input>
              <q-btn
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
            </q-form>
          </q-item-section>
        </q-expansion-item>
        <q-separator />
        <q-expansion-item
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
          <q-item-section class="q-pa-md">
            <p>{{ $t('settings.otp.description') }}</p>
            <q-tooltip>{{ $t('settings.otp.label') }}</q-tooltip>
            <v-otp-input
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
          </q-item-section>
        </q-expansion-item>
        <q-separator />
        <q-expansion-item
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
          <q-item-section class="q-pa-md">
            <p>{{ $t('settings.native.description') }}</p>
            <database-component v-if="settingsOpen" />
          </q-item-section>
          <q-separator />
          <q-item-section class="q-pa-md">
            <p>{{ $t('settings.clean.description') }}</p>
            <q-btn
              :label="$t('settings.clean.submit')"
              color="negative"
              icon="delete_outline"
              @click="confirm = true"
            >
              <q-tooltip>
                {{ $t('database.removeDatabase') }}
              </q-tooltip>
            </q-btn>
          </q-item-section>
        </q-expansion-item>
        <q-separator class="q-mb-md"></q-separator>

        <q-btn
          v-if="!isLoggedIn"
          square
          outline
          color="primary"
          glossy
          push
          class="full-width"
          label="Войти через Web Id"
          @click="loginToPod"
        />

        <q-chip
          icon="link"
          class="cursor-pointer full-width q-pa-md self-end"
          color="white"
          square
          clickable
          :label="$t('navigation.feedback.label')"
          @click="onOpenFeedback"
        >
          <q-tooltip>
            {{ $t('navigation.feedback.tooltip') }}
          </q-tooltip>
        </q-chip>
      </q-list>
    </q-drawer>
    <q-drawer
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
      <q-chip
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
        <q-avatar v-if="value.count > 1" color="secondary" text-color="white">{{
          value.count
        }}</q-avatar>
        <div class="ellipsis">{{ name }}</div>
        <q-tooltip>{{ name }}</q-tooltip>
      </q-chip>
      <q-skeleton
        v-show="archiveNames.length === 0"
        type="QChip"
        animation="blink"
        width="100%"
      />
    </q-drawer>
    <q-page-container>
      <router-view />
      <database-remove-component
        v-if="confirm"
        v-model="confirm"
        @on-clear="confirm = false"
      />
      <archive-search-component
        v-if="showSearch"
        v-model="showSearch"
        @on-search="onSearch"
      />
    </q-page-container>
    <q-footer reveal bordered></q-footer>
  </q-layout>
</template>

<script lang="ts" setup>
import { ref, computed, defineAsyncComponent } from 'vue'
import { openURL, useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import { useStore } from '../store'
import pkg from '../../package.json'
import twaManifest from '../../twa-manifest.json'
import { solidAuth } from '../services/podHelper'

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

async function loginToPod() {
  await solidAuth({
    sessionRestoreCallback: () =>
      void store.dispatch('Auth/openIdHandleIncoming'),
    loginCallback: () => void store.dispatch('Auth/openIdHandleIncoming'),
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
  await store.dispatch('consumerName', consumer.value)
  $q.notify({
    message: 'ФИО сохранено',
    type: 'positive',
  })
}

async function onOTPChange(value: string) {
  if (value === '') {
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
