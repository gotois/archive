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
          {{ $t('header.title') }}
          <q-badge
            outline
            rounded
            align="top"
            color="accent"
            class="absolute q-ml-xs"
          >
            {{ $t('navigation.version') }}{{ version }}
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
        class="full-width block text-h6 q-pa-md no-border-radius non-selectable no-pointer-events"
      >
        {{ $t('navigation.title') }}
      </p>
      <q-list>
        <q-expansion-item
          v-model="profileOpen"
          group="backupgroup"
          icon="person"
          :dense="$q.platform.is.desktop"
          class="full-width column"
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
          class="full-width column"
          :class="{
            'bg-grey-2': otpOpen,
          }"
          :label="$t('settings.native.otp')"
        >
          <q-item-section class="col q-pa-md">
            <p>{{ $t('settings.otp.description') }}</p>
            <q-tooltip>{{ $t('settings.otp.label') }}</q-tooltip>
            <v-otp-input
              ref="otpInput"
              class="flex flex-center"
              input-classes="otp-input"
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
          class="full-width column"
          :class="{
            'bg-grey-2': settingsOpen,
          }"
          :label="$t('settings.native.title')"
        >
          <q-item-section class="col q-pa-md">
            <p>{{ $t('settings.native.description') }}</p>
            <database-component v-if="settingsOpen" />
          </q-item-section>
        </q-expansion-item>
        <q-separator />
        <q-expansion-item
          v-model="destroyOpen"
          group="backupgroup"
          class="full-width column"
          icon="warning"
          :dense="$q.platform.is.desktop"
          :class="{
            'bg-grey-2': destroyOpen,
          }"
          :label="$t('settings.clean.title')"
        >
          <q-item-section class="col q-pa-md">
            <p>{{ $t('settings.clean.description') }}</p>
            <q-btn
              :label="$t('settings.clean.submit')"
              color="negative"
              icon="delete_outline"
              class="full-width q-mt-md"
              @click="confirm = true"
            >
              <q-tooltip>
                {{ $t('database.removeDatabase') }}
              </q-tooltip>
            </q-btn>
          </q-item-section>
        </q-expansion-item>
        <q-separator class="q-mb-md"></q-separator>
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
import DatabaseRemoveComponent from 'components/DatabaseRemoveComponent.vue'

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

const leftDrawerOpen = ref(false)
const rightDrawerOpen = ref(false)
const settingsOpen = ref(false)
const destroyOpen = ref(false)
const profileOpen = ref(false)
const otpOpen = ref(false)
const confirm = ref(false)
const showSearch = ref(false)
const version = ref(pkg.version)

// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
const consumer = computed(() => store.getters.consumer as string)
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

function onOpenFeedback() {
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
