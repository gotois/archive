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
        <q-btn flat round dense class="cursor-pointer" name="search" icon="search" @click="showSearch = true" />
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
        <q-route-tab :to="{ name: 'create' }" exact replace :label="$t('header.create')" />
        <q-route-tab :to="{ name: 'archive', query: {page: 1} }" exact replace :label="$t('header.archive')" />
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
        <q-chip icon="link" class="cursor-pointer" clickable :label="$t('navigation.feedback.label')" @click="onOpenFeedback">
          <q-tooltip>{{$t('navigation.feedback.tooltip')}}</q-tooltip>
        </q-chip>
      </div>
    </q-drawer>
    <q-drawer
      v-if="archiveNames.length"
      v-model="rightDrawerOpen"
      persistent
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
            :color="value.recomendation ? 'orange' : ''"
            @click="onSelectArchiveName(name)"
        >
          <q-avatar v-if="value.count > 1" color="secondary" text-color="white">{{ value.count }}</q-avatar>
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

<script lang="ts" setup>
import {ref} from 'vue'
import {BulkError} from 'dexie'
import {LocalStorage, useQuasar} from 'quasar'
import {useRouter} from 'vue-router'
import {db} from '../services/databaseHelper'
import {recommendationContractTypes} from '../services/recommendationContractTypes'
import pkg from '../../package.json'
import DatabaseComponent from 'components/DatabaseComponent.vue'

const leftDrawerOpen = ref(false)
const rightDrawerOpen = ref(false)
const settingsOpen = ref(false)
const confirm = ref(false)
const searchText = ref('')
const showSearch = ref(false)
const archiveNames = ref([])
const version = ref(pkg.version)

const $q = useQuasar()
const router = useRouter()

function onToggleLeftDrawer(): void {
  leftDrawerOpen.value = !leftDrawerOpen.value
}

function onOpenFeedback() {
  location.href = 'https://baskovsky.ru/feedback/'
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

async function onClearDatabase() {
  try {
    $q.loading.show()
    await db.destroy()
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

async function onSelectArchiveName(name: string) {
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

  recommendationContractTypes.forEach(contractName => {
    map.set(contractName, { count: 1, recomendation: true, })
  })

  for (const names of await db.getContractNames()) {
    map.set(...names)
  }

  archiveNames.value = Array.from(map)
})()
</script>
