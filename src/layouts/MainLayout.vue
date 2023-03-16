<template>
  <q-layout view="lhh LpR lfr">
    <q-header bordered class="bg-white text-primary" height-hint="98">
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="settings"
          aria-label="Settings"
          @click="onToggleLeftDrawer"
        />
        <q-toolbar-title class="text-black-9 text-center">
          {{ $t('header.title') }}
          <q-badge outline rounded align="top" color="accent">
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
          :disable="$store.getters.contractsCount === 0"
          :label="$t('header.archive')"
        />
      </q-tabs>
    </q-header>
    <q-drawer
      v-model="leftDrawerOpen"
      side="left"
      elevated
      persistent
      class="flex"
    >
      <q-list class="row self-start">
        <div class="text-h6 q-pa-md">
          {{ $t('navigation.title') }}
        </div>
        <q-expansion-item
          v-model="profileOpen"
          group="backupgroup"
          icon="person"
          class="full-width"
          :label="$t('settings.native.profile')"
        >
          <q-form
            ref="nameForm"
            autocapitalize="off"
            autocomplete="off"
            class="q-pa-md"
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
              icon-right="save"
              type="submit"
              color="accent"
            />
          </q-form>
        </q-expansion-item>
        <q-expansion-item
          v-model="otpOpen"
          group="backupgroup"
          icon="vpn_key"
          class="full-width"
          :label="$t('settings.native.otp')"
        >
          <q-tooltip>Измените ключ</q-tooltip>
          <v-otp-input
            ref="otpInput"
            class="flex flex-center q-pa-lg"
            input-classes="otp-input"
            separator="-"
            :num-inputs="4"
            :should-auto-focus="true"
            :is-input-num="true"
            :conditional-class="['', '', '', '']"
            :placeholder="['*', '*', '*', '*']"
            @on-complete="onOTPHandleComplete"
          />
        </q-expansion-item>
        <q-expansion-item
          v-model="settingsOpen"
          group="backupgroup"
          icon="import_export"
          class="full-width"
          :label="$t('settings.native.title')"
        >
          <suspense>
            <template #default>
              <database-component class="col q-pa-md"></database-component>
            </template>
            <template #fallback>
              {{ $t('database.loading') }}
            </template>
          </suspense>
        </q-expansion-item>
        <q-expansion-item
          group="backupgroup"
          class="full-width"
          icon="warning"
          :label="$t('settings.clean.title')"
        >
          <div class="col q-pa-md">
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
          </div>
        </q-expansion-item>
      </q-list>
      <div class="row full-width self-end flex-center q-pa-md">
        <q-chip
          icon="link"
          class="cursor-pointer"
          clickable
          :label="$t('navigation.feedback.label')"
          @click="onOpenFeedback"
        >
          <q-tooltip>
            {{ $t('navigation.feedback.tooltip') }}
          </q-tooltip>
        </q-chip>
      </div>
    </q-drawer>
    <q-drawer
      v-if="archiveNames.length"
      v-model="rightDrawerOpen"
      persistent
      show-if-above
      :overlay="$q.platform.is.desktop"
      side="right"
      bordered
    >
      <div class="full-width q-pa-lg">
        <q-chip
          v-for="([name, value], objectKey) in archiveNames"
          :key="objectKey"
          dense
          square
          outline
          clickable
          :color="value.recommendation ? 'orange' : ''"
          @click="onSelectArchiveName(name, value)"
        >
          <q-avatar
            v-if="value.count > 1"
            color="secondary"
            text-color="white"
            >{{ value.count }}</q-avatar
          >
          <div class="ellipsis">{{ name }}</div>
          <q-tooltip>{{ name }}</q-tooltip>
        </q-chip>
        <q-skeleton
          v-show="archiveNames.length === 0"
          type="QChip"
          animation="blink"
          width="100%"
        />
      </div>
    </q-drawer>
    <q-page-container>
      <router-view />
      <q-dialog
        v-model="confirm"
        persistent
        transition-show="scale"
        transition-hide="scale"
      >
        <q-card class="bg-red text-white" style="width: 300px">
          <q-card-section>
            <div class="text-h6">{{ $t('settings.clean.submit') }}</div>
          </q-card-section>
          <q-card-section class="q-pt-none">
            {{ $t('settings.clean.label') }}
          </q-card-section>
          <q-card-actions align="right" class="bg-white text-teal">
            <q-btn
              v-close-popup
              flat
              :label="$t('settings.clean.cancel')"
              color="primary"
            />
            <q-btn
              flat
              :label="$t('settings.clean.ok')"
              color="red"
              @click="onClearDatabase"
            />
          </q-card-actions>
        </q-card>
      </q-dialog>
      <q-dialog v-model="showSearch" persistent>
        <q-card style="min-width: 350px">
          <q-card-section>
            <div class="text-h6">{{ $t('archive.search') }}</div>
          </q-card-section>
          <q-card-section class="q-pt-none">
            <q-input
              v-model="searchText"
              dense
              square
              autofocus
              :placeholder="$t('searchDialog.searchText')"
              @keyup.enter="onSearchText"
            />
          </q-card-section>
          <q-card-actions align="right" class="text-primary">
            <q-btn v-close-popup flat :label="$t('searchDialog.cancel')" />
            <q-btn
              v-close-popup
              outline
              color="accent"
              icon-right="search"
              :label="$t('searchDialog.search')"
              @click="onSearchText"
            />
          </q-card-actions>
        </q-card>
      </q-dialog>
    </q-page-container>
  </q-layout>
</template>

<script lang="ts" setup>
import { ref, defineAsyncComponent } from 'vue'
import { BulkError } from 'dexie'
import { LocalStorage, openURL, useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import { db } from '../services/databaseHelper'
import { useStore } from '../store'
import { recommendationContractTypes } from '../services/recommendationContractTypes'
import pkg from '../../package.json'

const DatabaseComponent = defineAsyncComponent(
  () => import('components/DatabaseComponent.vue'),
)
const VOtpInput = defineAsyncComponent(() => import('vue3-otp-input'))

const store = useStore()
const $q = useQuasar()
const router = useRouter()

const leftDrawerOpen = ref(false)
const rightDrawerOpen = ref(false)
const settingsOpen = ref(false)
const profileOpen = ref(false)
const otpOpen = ref(false)
const confirm = ref(false)
const searchText = ref('')
const showSearch = ref(false)
const archiveNames = ref([])
const version = ref(pkg.version)
// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
const consumer = ref(store.getters.consumer as string)

function onToggleLeftDrawer(): void {
  leftDrawerOpen.value = !leftDrawerOpen.value
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
}

async function onSearchText() {
  if (!searchText.value.length) {
    return
  }
  await router.push({
    name: 'search',
    query: {
      filter: searchText.value,
      page: 1,
    },
  })
  showSearch.value = false
  searchText.value = ''
}

async function onOTPHandleComplete(value: string) {
  if (window.confirm('Действительно сохранить пин?')) {
    await store.dispatch('Auth/setCode', value)
  }
  $q.notify({
    type: 'warning',
    message: 'Ключ изменен',
  })
}

async function onClearDatabase() {
  try {
    $q.loading.show()
    await db.delete()
    LocalStorage.clear()
    location.reload()
  } catch (error) {
    const msg = (error as BulkError).message
    console.error(error)
    $q.loading.hide()
    $q.notify({
      message: msg,
      type: 'negative',
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

void (async () => {
  const map = new Map()

  recommendationContractTypes.forEach((contractName) => {
    map.set(contractName, { count: 0, recommendation: true })
  })

  for (const names of await db.getContractNames()) {
    map.set(...names)
  }

  archiveNames.value = Array.from(map)
})()
</script>
