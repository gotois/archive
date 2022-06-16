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
          <div class="col q-pa-md">
            <q-form
              class="full-width"
              @submit="onImportDB"
            >
              <q-file
                v-model="file"
                accept=".json,.zip"
                :label="$t('settings.native.import')"
                filled
              />
              <q-btn
                :label="$t('settings.native.submit')"
                :disable="!file"
                type="submit"
                icon="file_upload"
                color="primary"
                class="full-width"/>
            </q-form>
            <q-btn
              color="secondary"
              icon="file_download"
              :label="$t('settings.native.export')"
              class="full-width q-mt-md"
              @click="onExportDB"/>
          </div>
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
import {exportDB, importInto} from 'dexie-export-import'
import {BulkError} from 'dexie'
import {saveAs} from 'file-saver'
import {QVueGlobals, useQuasar} from 'quasar'
import {db} from 'components/ContractDatabase'
import {version} from '../../package.json'
import JSZip from 'jszip'

const EXPORT_NAME = 'contract-export'

const file = ref()
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

function progressCallback({ totalRows, completedRows }: any) {
  if (completedRows === totalRows) {
    $q.loading.hide()
  }
}

async function getContent(value: File): Promise<Blob> {
  const zip = new JSZip()
  switch (value.type) {
    case 'application/zip': {
      const all = await zip.loadAsync(value, {})
      const file = all.file(EXPORT_NAME + '.json')
      if (!file) {
        throw new Error('File not found')
      }
      return await file.async('blob')
    }
    default: {
      return value
    }
  }
}

async function onImportDB() {
  $q.loading.show()
  try {
    const content = await getContent(file.value as unknown as File)
    await importInto(db, content, {})
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

async function onExportDB() {
  const dialog = $q.dialog({
    message: 'Создание... 0%',
    progress: true,
    persistent: true,
    ok: false,
  })
  const blob = await exportDB(db, { prettyJson: false, progressCallback })
  const zip = new JSZip()
  zip.file(EXPORT_NAME + '.json', blob)
  const content = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: {
      level: 1
    },
    platform: 'UNIX',
  }, metadata => {
    const percentage = metadata.percent
    dialog.update({
      message: `Создание... ${percentage}%`
    })
    if (percentage === 100 && metadata.currentFile !== null) {
      dialog.hide()
    }
  })
  return saveAs(content, EXPORT_NAME + '.zip')
}

function main() {
  $q = useQuasar()

  return {
    leftDrawerOpen,
    settingsOpen,
    file,
    confirm,
    version,
    onOpenFeedback,
    onToggleLeftDrawer,
    onClearDatabase,
    onImportDB,
    onExportDB
  }
}

export default defineComponent({
  name: 'MainLayout',
  setup() {
    return main()
  }
})
</script>
