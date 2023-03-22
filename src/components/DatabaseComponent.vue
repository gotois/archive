<template>
  <div>
    <q-form class="full-width" @submit="onImportDB">
      <q-file
        v-model="file"
        accept=".json,.zip"
        :label="$t('settings.native.import')"
        :max-file-size="1024 * 1024 * 1024 * 2"
        filled
        outlined
        @rejected="rejectedEntries"
      >
        <q-tooltip>
          {{ $t('database.fileSize') }}
        </q-tooltip>
        <template #prepend>
          <q-icon name="attach_file" />
        </template>
      </q-file>
      <q-btn
        :label="$t('settings.native.submit')"
        :disable="!file"
        type="submit"
        icon="file_upload"
        color="primary"
        :outline="!file"
        class="full-width"
      >
        <q-tooltip>
          {{ $t('database.fileImport') }}
        </q-tooltip>
      </q-btn>
    </q-form>
    <q-btn
      v-if="contractsCount > 0"
      color="secondary"
      icon="file_download"
      :label="$t('settings.native.export')"
      class="full-width q-mt-md"
      :disable="contractsCount === 0"
      @click="onExportDB"
    >
      <q-tooltip>
        {{ $t('database.fileExport') }}
      </q-tooltip>
    </q-btn>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'
import { exportDB, importInto } from 'dexie-export-import'
import { saveAs } from 'file-saver'
import JSZip from 'jszip'
import { BulkError } from 'dexie'
import { useStore } from '../store'
import { db } from '../services/databaseHelper'

const $q = useQuasar()
const store = useStore()

const file = ref()
// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
const contractsCount = computed(() => store.getters.contractsCount as number)

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

function rejectedEntries() {
  $q.notify({
    type: 'error',
    color: 'negative',
    message: 'Выбранный файл слишком велик',
  })
}

function progressCallback({
  totalRows,
  completedRows,
}: {
  totalRows: number
  completedRows: number
}): boolean {
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
    await importInto(db, content, {
      noTransaction: true,
      acceptChangedPrimaryKey: true,
      overwriteValues: true,
    })
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
  const blob = await exportDB(db, {
    prettyJson: false,
    progressCallback,
  })
  const zip = new JSZip()
  zip.file(EXPORT_NAME + '.json', blob)
  const content = await zip.generateAsync(
    {
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: {
        level: 1,
      },
      platform: 'UNIX',
    },
    (metadata) => {
      const percentage = metadata.percent
      dialog.update({
        message: `Создание... ${percentage}%`,
      })
      if (percentage === 100 && metadata.currentFile !== null) {
        dialog.hide()
      }
    },
  )
  return saveAs(content, EXPORT_NAME + '.zip')
}
</script>
