<template>
  <div>
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
        class="full-width" />
    </q-form>
    <q-btn
      color="secondary"
      icon="file_download"
      :label="$t('settings.native.export')"
      class="full-width q-mt-md"
      @click="onExportDB" />
  </div>
</template>

<script lang="ts">
import {defineComponent, ref} from 'vue'
import {QVueGlobals, useQuasar} from 'quasar'
import {exportDB, importInto} from 'dexie-export-import'
import {saveAs} from 'file-saver'
import JSZip from 'jszip'
import {BulkError} from 'dexie'
import {db} from 'components/ContractDatabase'

let $q: QVueGlobals

const file = ref()

const EXPORT_NAME = 'contract-export'

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

function progressCallback({ totalRows, completedRows }: { totalRows: number, completedRows: number }): boolean {
  if (completedRows === totalRows) {
    $q.loading.hide()
    return true
  }
  return false
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

async function onExportDB() {
  const dialog = $q.dialog({
    message: 'Подготовка...',
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
    file,
    onImportDB,
    onExportDB
  }
}

export default defineComponent({
  name: 'DatabaseComponent',
  setup() {
    return main()
  },
})
</script>
