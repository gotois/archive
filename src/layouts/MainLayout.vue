<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="onToggleLeftDrawer"
        />
        <q-toolbar-title class="text-black-9">
          {{ $t('header.title') }}
        </q-toolbar-title>
        <q-tabs shrink stretch>
          <q-route-tab to="/" exact replace :label="$t('header.create')"/>
          <q-route-tab to="/archive" exact replace :label="$t('header.archive')"/>
        </q-tabs>
      </q-toolbar>
    </q-header>
    <q-drawer
      v-model="leftDrawerOpen"
      bordered
      class="row justify-center items-baseline"
    >
      <q-list class="row self-start">
        <div class="text-h6 q-pa-md">
          {{ $t('navigation.title')}}
          <q-badge outline align="middle" color="orange">
            {{ $t('navigation.version')}} {{version}}
          </q-badge>
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
      <div class="row q-pa-md q-gutter-sm self-end">
        <q-chip icon="link" class="cursor-pointer text-center" clickable :label="$t('navigation.feedback')" @click="onOpenFeedback"></q-chip>
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
    </q-page-container>
  </q-layout>
</template>

<script lang="ts">
import {defineComponent, ref} from 'vue'
import {BulkError} from 'dexie'
import {QVueGlobals, useQuasar} from 'quasar'
import {db} from 'components/ContractDatabase'
import {version} from '../../package.json'
import DatabaseComponent from 'components/DatabaseComponent.vue'

const leftDrawerOpen = ref(false)
const settingsOpen = ref(false)
const confirm = ref(false)

let $q: QVueGlobals

function onToggleLeftDrawer(): void {
  leftDrawerOpen.value = !leftDrawerOpen.value
}

function onOpenFeedback() {
  location.href = 'https://baskovsky.ru/feedback/'
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

function main() {
  $q = useQuasar()

  return {
    leftDrawerOpen,
    settingsOpen,
    confirm,
    version,
    onOpenFeedback,
    onToggleLeftDrawer,
    onClearDatabase,
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
