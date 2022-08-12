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
          <q-badge outline align="top" color="orange">
            {{ $t('navigation.version')}}{{ version }}
          </q-badge>
        </q-toolbar-title>
        <q-btn flat round dense class="cursor-pointer" name="search" icon="search" @click="showSearch = true"/>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="rightDrawerOpen = !rightDrawerOpen"
        ></q-btn>
      </q-toolbar>
      <q-tabs shrink stretch>
          <q-route-tab to="/create" exact replace :label="$t('header.create')"/>
          <q-route-tab to="/" exact replace :label="$t('header.archive')"/>
        </q-tabs>
    </q-header>
    <q-drawer
      v-model="leftDrawerOpen"
      side="left"
      elevated
      class="flex"
    >
      <q-list class="row self-start">
        <div class="text-h6 q-pa-md">
          {{ $t('navigation.title')}}
        </div>
        <q-expansion-item
          v-model="settingsOpen"
          group="backupgroup"
          icon="import_export"
          class="full-width"
          :label="$t('settings.native.title')"
        >
          <database-component class="col q-pa-md"></database-component>
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
              color="red"
              icon="delete_outline"
              class="full-width q-mt-md"
              @click="confirm = true"
            />
          </div>
        </q-expansion-item>
      </q-list>
      <div class="row full-width self-end flex-center q-pa-md">
        <q-chip icon="link" class="cursor-pointer" clickable :label="$t('navigation.feedback')" @click="onOpenFeedback"></q-chip>
      </div>
    </q-drawer>
    <q-drawer
      v-model="rightDrawerOpen"
      show-if-above
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
            @click="onSelectArchiveName(name)"
        >
          <q-avatar v-if="value > 1" color="secondary" text-color="white">{{ value }}</q-avatar>
          <div class="ellipsis">{{ name }}</div>
          <q-tooltip>{{ name }}</q-tooltip>
        </q-chip>
        <q-skeleton v-show="archiveNames.length === 0" type="QChip" animation="blink" width="100%" />
      </div>
    </q-drawer>
    <q-page-container>
      <router-view/>
      <q-dialog v-model="confirm" persistent transition-show="scale" transition-hide="scale">
        <q-card class="bg-red text-white" style="width: 300px">
          <q-card-section>
            <div class="text-h6">{{ $t('settings.clean.submit') }}</div>
          </q-card-section>
          <q-card-section class="q-pt-none">
            {{ $t('settings.clean.label') }}
          </q-card-section>
          <q-card-actions align="right" class="bg-white text-teal">
            <q-btn v-close-popup flat :label="$t('settings.clean.cancel')" color="primary" />
            <q-btn flat :label="$t('settings.clean.ok')" color="red" @click="onClearDatabase" />
          </q-card-actions>
        </q-card>
      </q-dialog>
      <q-dialog v-model="showSearch" persistent>
        <q-card style="min-width: 350px">
          <q-card-section>
            <div class="text-h6">{{ $t('archive.search') }}</div>
          </q-card-section>
          <q-card-section class="q-pt-none">
            <q-input v-model="searchText" dense autofocus :placeholder="'Название договора'" @keyup.enter="onSearchText" />
          </q-card-section>
          <q-card-actions align="right" class="text-primary">
            <q-btn v-close-popup flat label="Отмена" />
            <q-btn v-close-popup color="accent" label="Найти" @click="onSearchText" />
          </q-card-actions>
        </q-card>
      </q-dialog>
    </q-page-container>
  </q-layout>
</template>

<script lang="ts">
import {defineComponent, ref} from 'vue'
import {BulkError} from 'dexie'
import {QVueGlobals, useQuasar} from 'quasar'
import {Router, useRouter} from 'vue-router'
import {db} from 'components/ContractDatabase'
import {version} from '../../package.json'
import DatabaseComponent from 'components/DatabaseComponent.vue'

const leftDrawerOpen = ref(false)
const rightDrawerOpen = ref(false)
const settingsOpen = ref(false)
const confirm = ref(false)
const searchText = ref('')
const showSearch = ref(false)
const archiveNames = ref([])

let $q: QVueGlobals
let router: Router

function onToggleLeftDrawer(): void {
  leftDrawerOpen.value = !leftDrawerOpen.value
}

function onOpenFeedback() {
  location.href = 'https://baskovsky.ru/feedback/'
}

function onSearchText(): void {
  if (!searchText.value.length) {
    return
  }
  void router.push({
    path: 'archive',
    query: {
      filter: searchText.value,
      page: 1,
    },
  })
  showSearch.value = false
  searchText.value = ''
}

async function onClearDatabase() {
  try {
    $q.loading.show()
    await db.destroy()
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

function onSelectArchiveName(name: string) {
  void router.push({
    path: 'archive',
    query: {
      filter: name,
      page: 1,
    },
  })
}

function main() {
  $q = useQuasar()
  router = useRouter()

  void (async () => {
    const map = await db.getContractNames()
    archiveNames.value = Array.from(map)
  })()

  return {
    leftDrawerOpen,
    rightDrawerOpen,
    settingsOpen,
    confirm,
    version,
    searchText,
    showSearch,
    archiveNames,
    onSearchText,
    onOpenFeedback,
    onToggleLeftDrawer,
    onClearDatabase,
    onSelectArchiveName,
  }
}

export default defineComponent({
  name: 'MainLayout',
  components: {
    DatabaseComponent,
  },
  setup() {
    return main()
  },
})
</script>
