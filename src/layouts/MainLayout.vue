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
          @click="onOpenShowSearch"
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
    <q-drawer
      v-model="leftDrawerOpen"
      side="left"
      elevated
      persistent
      class="flex"
    >
      <q-list class="row self-start">
        <p
          class="block full-width text-h6 q-pa-md no-border-radius non-selectable no-pointer-events"
        >
          {{ $t('navigation.title') }}
        </p>
        <q-expansion-item
          v-model="profileOpen"
          group="backupgroup"
          icon="person"
          class="full-width"
          :label="$t('settings.native.profile')"
        >
          <div class="q-pa-md">
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
                icon-right="save"
                class="full-width"
                type="submit"
                color="accent"
              />
            </q-form>
          </div>
        </q-expansion-item>
        <q-expansion-item
          v-model="otpOpen"
          group="backupgroup"
          icon="vpn_key"
          class="full-width"
          :label="$t('settings.native.otp')"
        >
          <div class="col q-pa-md">
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
              @on-complete="onOTPHandleComplete"
            />
          </div>
        </q-expansion-item>
        <q-expansion-item
          v-model="settingsOpen"
          group="backupgroup"
          icon="import_export"
          class="full-width"
          :label="$t('settings.native.title')"
        >
          <div class="col q-pa-md">
            <p>{{ $t('settings.native.description') }}</p>
            <suspense>
              <template #default>
                <database-component></database-component>
              </template>
              <template #fallback>
                {{ $t('database.loading') }}
              </template>
            </suspense>
          </div>
        </q-expansion-item>
        <q-expansion-item
          group="backupgroup"
          class="full-width"
          icon="warning"
          :label="$t('settings.clean.title')"
        >
          <div class="col q-pa-md">
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
      <p
        class="block full-width text-h6 q-pa-md no-border-radius non-selectable no-pointer-events"
      >
        {{ $t('documentTypes.title') }}
      </p>
      <div class="full-width q-pa-md">
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
        square
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
      <q-dialog v-model="showSearch" square>
        <q-card style="min-width: 350px">
          <q-card-section>
            <div class="text-h6 non-selectable">{{ $t('archive.search') }}</div>
          </q-card-section>
          <q-card-section class="q-pt-none">
            <q-select
              v-model="searchText"
              use-input
              fill-input
              hide-selected
              autofocus
              filled
              outlined
              square
              autocomplete="off"
              spellcheck="false"
              rounded
              color="secondary"
              input-debounce="50"
              :options="searchOptions"
              :placeholder="$t('searchDialog.searchText')"
              @filter="onFilterSelect"
            >
              <template #no-option>
                <q-item>
                  <q-item-section class="text-grey">
                    {{ $t('archive.notfound') }}
                  </q-item-section>
                </q-item>
              </template>
            </q-select>
          </q-card-section>
          <q-card-actions align="right" class="text-primary">
            <q-btn
              v-close-popup
              flat
              :dense="$q.platform.is.desktop"
              :label="$t('searchDialog.cancel')"
            />
            <q-btn
              v-close-popup
              color="accent"
              icon-right="search"
              :outline="searchOptions.length === 0"
              :disable="searchOptions.length === 0"
              :dense="$q.platform.is.desktop"
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
import { LocalStorage, openURL, QSelect, useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import { db } from '../services/databaseHelper'
import { useStore } from '../store'
import MiniSearch from 'minisearch'
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
const searchOptions = ref([])
const archiveNames = ref([])
const version = ref(pkg.version)
// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
const consumer = ref(store.getters.consumer as string)

const miniSearch: MiniSearch = new MiniSearch({
  fields: ['instrument_name', 'instrument_description'],
  storeFields: ['instrument_name', 'instrument_description'],
})

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
  $q.notify({
    message: 'ФИО сохранено',
    type: 'positive',
  })
}

function onFilterSelect(
  val: string,
  // eslint-disable-next-line no-unused-vars
  update: (callback: () => void, callback2: (ref: QSelect) => void) => void,
  abort: () => void,
) {
  if (val.length < 3) {
    abort()
    return
  }

  abort()
  setTimeout(() => {
    update(
      () => {
        if (val === '') {
          /* empty */
        } else {
          const suggestionElement = new Set()
          miniSearch.autoSuggest(val, {
            fuzzy: (term) => (term.length > 3 ? 0.2 : null),
            processTerm: (term) => term.toLowerCase(),
            boost: {
              instrument_name: 2,
            },
            prefix: true,
            filter: (searchResult) => {
              if (suggestionElement.has(searchResult.instrument_name)) {
                return false
              }
              suggestionElement.add(searchResult.instrument_name)
              return true
            },
          })
          searchOptions.value = Array.from(suggestionElement)
        }
      },
      (ref) => {
        if (
          val !== '' &&
          ref.options.length > 0 &&
          ref.getOptionIndex() === -1
        ) {
          ref.setOptionIndex(-1)
          ref.moveOptionSelection(1, true)
        }
      },
    )
  }, 500)
}

async function onSearchText() {
  if (!searchText.value.length) {
    return
  }
  $q.loading.show()
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
    type: 'positive',
    message: 'Ключ изменен',
  })
}

async function onClearDatabase() {
  try {
    $q.loading.show()
    await db.delete()
    LocalStorage.clear()
    $q.loading.hide()
    const timeout = 1500
    $q.notify({
      type: 'warning',
      progress: false,
      spinner: true,
      timeout: timeout,
      message: 'База данных удалена. Дождитесь перезагрузки.',
    })
    setTimeout(() => {
      location.reload()
    }, timeout)
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

// Index all documents
async function onOpenShowSearch() {
  showSearch.value = true

  const documents = await db.getFulltextDocument()
  await miniSearch.addAllAsync(documents)
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
