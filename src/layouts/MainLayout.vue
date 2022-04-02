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
      show-if-above
      bordered
      class="row justify-center items-baseline"
    >
      <q-list bordered class="row self-start">
        <div class="text-h6 q-pa-md">
          {{ $t('navigation.title')}}
          <q-badge outline align="middle" color="orange">
            {{ $t('navigation.version')}} {{version}}
          </q-badge>
        </div>
        <q-expansion-item
          group="backupgroup"
          v-model="settingsOpen"
          icon="receipt"
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
                accept=".json"
                :label="$t('settings.native.import')"
                filled
              />
              <q-btn :label="$t('settings.native.submit')"
                     :disable="!file"
                     type="submit"
                     color="primary"
                     class="full-width"/>
            </q-form>
            <q-btn color="secondary"
                   :label="$t('settings.native.export')"
                   class="full-width q-mt-md"
                   @click="onExportDB"/>
          </div>
        </q-expansion-item>
        <q-expansion-item
          group="backupgroup"
          v-if="dropboxAvailable"
          v-model="dropboxOpen"
          icon="people"
          class="full-width"
          :label="$t('settings.dropbox.title')"
        >
          <div class="col q-pa-md">
            <q-btn color="primary"
                   :label="$t('settings.dropbox.import')"
                   class="full-width"
                   @click="onDropboxImport"/>
            <q-btn color="secondary"
                   :label="$t('settings.dropbox.export')"
                   target="_blank"
                   href="#"
                   class="full-width q-mt-md"
                   @click="onDropboxExport"/>
          </div>
        </q-expansion-item>
        <q-expansion-item
          group="backupgroup"
          class="full-width"
          icon='priority_high'
          :label="$t('settings.clean.title')"
        >
          <div class="col q-pa-md">
            <q-btn :label="$t('settings.clean.submit')"
                   color="red"
                   class="full-width q-mt-md"
                   @click="confirm = true"
            />
          </div>
        </q-expansion-item>
      </q-list>
      <div class="row q-pa-md q-gutter-sm self-end">
        <a
          class="text-orange-9 text-caption text-center"
          href="https://baskovsky.ru/about/feedback/"
          target="_blank">{{ $t('navigation.feedback') }}</a>
      </div>
    </q-drawer>
    <q-page-container>
      <router-view/>
       <q-dialog v-model="confirm" persistent transition-show="scale" transition-hide="scale">
        <q-card class="bg-teal text-white" style="width: 300px">
          <q-card-section class="">
             <div class="text-h6">{{ $t('settings.clean.submit') }}</div>
          </q-card-section>
          <q-card-section class="q-pt-none">
            {{ $t('settings.clean.label') }}
          </q-card-section>
          <q-card-actions align="right" class="bg-white text-teal">
            <q-btn flat :label="$t('settings.clean.cancel')" color="primary" v-close-popup />
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
import {db} from 'components/ContractDatabase'
import {saveAs} from 'file-saver'
import {useQuasar} from 'quasar'
import {readBlobPromise} from '../services/fileHelper'
import {version} from '../../package.json'
import {BulkError} from 'dexie'

declare global {
  interface Window {
    Dropbox: {
      choose(options: any): void;
      save(options: any): void;
      isBrowserSupported(): boolean;
    };
  }
}

const EXPORT_NAME = 'contract-export.json'

function main() {
  const file = ref(null)
  const leftDrawerOpen = ref(false)
  const settingsOpen = ref(false)
  const dropboxOpen = ref(false)
  const dropboxAvailable = ref(false)
  const $q = useQuasar()

  function progressCallback({totalRows, completedRows}: any): any {
    if (completedRows === totalRows) {
      $q.loading.hide()
    }
  }

  function onToggleLeftDrawer(): void {
    leftDrawerOpen.value = !leftDrawerOpen.value
  }

  async function onImportDB() {
    $q.loading.show()
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      await importInto(db, (file.value as any), {})
      location.reload()
    } catch (error: BulkError|any) {
      console.error(error)
      $q.loading.hide()
      $q.notify({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-assignment
        message: error.message,
        type: 'negative'
      })
    }
  }

  async function onClearDatabase() {
    try {
      $q.loading.show()
      await db.destroy()
      location.reload()
    } catch (error: any) {
      console.error(error)
      $q.loading.hide()
      $q.notify({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-assignment
        message: error.message,
        type: 'negative'
      })
    }
  }

  async function onExportDB() {
    $q.loading.show()
    const blob = await exportDB(db, {prettyJson: false, progressCallback})
    saveAs(blob, EXPORT_NAME)
  }

  function onDropboxImport() {
    $q.loading.show()
    const options = {
      success(files: Array<{ link: string, name: string }>) {
        saveAs(files[0].link, files[0].name)
        $q.loading.hide()
        $q.notify({
          message: 'Сохранено',
          type: 'positive'
        })
      },
      linkType: 'direct',
      multiselect: false,
      extensions: ['.json',],
      folderselect: false,
    }
    window.Dropbox.choose(options)
  }

  async function prepareDropboxExport() {
    const blob = await exportDB(db, {prettyJson: false, progressCallback})
    const blobUrl = await readBlobPromise(blob)
    const options = {
      files: [
        {
          'url': blobUrl, 'filename': EXPORT_NAME
        },
      ],
      success() {
        $q.loading.hide()
        $q.notify({
          message: 'Сохранено',
          type: 'positive'
        })
      },
      cancel() {
        $q.loading.hide()
        $q.notify({
          message: 'Отменено',
          type: 'positive'
        })
      },
      error(errorMessage: Error) {
        $q.loading.hide()
        $q.notify({
          message: errorMessage.message,
          type: 'negative'
        })
      }
    }
    return options;
  }

  function onDropboxExport() {
    void prepareDropboxExport().then((options) => {
      $q.loading.show()
      window.Dropbox.save(options)
    }).catch((errorMessage: Error) => {
      $q.loading.hide()
      $q.notify({
        message: errorMessage.message,
        type: 'negative'
      })
    })
  }

  dropboxAvailable.value = window.Dropbox.isBrowserSupported()

  return {
    leftDrawerOpen,
    settingsOpen,
    dropboxOpen,
    file,
    dropboxAvailable,
    version,

    confirm: ref(false),

    onDropboxImport,
    onDropboxExport,
    onToggleLeftDrawer,
    onClearDatabase,
    onImportDB,
    onExportDB
  }
}

export default defineComponent({
  name: 'MainLayout',

  components: {},

  setup() {
    return {
      ...main()
    }
  }
})
</script>
