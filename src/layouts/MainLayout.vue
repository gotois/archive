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
          {{ $t('header.title') }}. {{ $t('navigation.version')}} {{version}}
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
      class="row justify-center items-baseline content-between"
    >
      <div class="row">
        <q-expansion-item
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
                   class="full-width q-mt-md dropbox-saver"
                   @click="onDropboxExport"/>
          </div>
        </q-expansion-item>
      </div>
      <div class="row q-pa-md q-gutter-sm">
        <a
          class="text-orange-9 text-caption text-center"
          href="https://baskovsky.ru/about/feedback/"
          target="_blank">{{ $t('navigation.feedback') }}</a>
      </div>
    </q-drawer>
    <q-page-container>
      <router-view/>
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

declare global {
  interface Window {
    Dropbox: {
      choose(options: any): void;
      save(options: any): void;
      isBrowserSupported(): boolean;
    };
  }
}

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

  function onToggleLeftDrawer() {
    leftDrawerOpen.value = !leftDrawerOpen.value
  }

  async function onImportDB() {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    await importInto(db, (file.value as any), {})
    location.reload()
  }

  async function onExportDB() {
    $q.loading.show()
    const blob = await exportDB(db, {prettyJson: false, progressCallback})
    saveAs(blob, 'contract-export.json')
  }

  function onDropboxImport() {
    const options = {
      success(files: Array<{ link: string, name: string }>) {
        saveAs(files[0].link, files[0].name)
      },
      linkType: 'direct',
      multiselect: false,
      extensions: ['.json',],
      folderselect: false,
    }
    window.Dropbox.choose(options)
  }

  async function onDropboxExport() {
    const blob = await exportDB(db, {prettyJson: false, progressCallback})
    const blobUrl = await readBlobPromise(blob)
    const options = {
      files: [
        {
          'url': blobUrl, 'filename': 'contract-export.json'
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
      },
      error(errorMessage: Error) {
        $q.loading.hide()
        $q.notify({
          message: errorMessage.message,
          type: 'negative'
        })
      }
    }
    window.Dropbox.save(options)
    $q.loading.show()
  }

  dropboxAvailable.value = window.Dropbox.isBrowserSupported()

  return {
    leftDrawerOpen,
    settingsOpen,
    dropboxOpen,
    file,
    dropboxAvailable,
    version,

    onDropboxImport,
    onDropboxExport,
    onToggleLeftDrawer,
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
