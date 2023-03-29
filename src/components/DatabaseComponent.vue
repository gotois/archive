<template>
  <div>
    <q-form @submit="onImportDB">
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
      color="secondary"
      icon="file_download"
      :label="$t('settings.native.export')"
      class="full-width q-mt-md"
      :disable="contractsCount === 0"
      :outline="contractsCount === 0"
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
import { BulkError } from 'dexie'
import { useStore } from '../store'
import { db } from '../services/databaseHelper'
import { getContent, generate } from '../services/zipHelper'

const $q = useQuasar()
const store = useStore()

const file = ref<File>()
// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
const contractsCount = computed(() => store.getters.contractsCount as number)

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
    const content = await getContent(file.value)
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
  const exportName = window.prompt('Введите название файла договоров:')
  if (!exportName) {
    return
  }
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
  const content = await generate(blob, (metadata) => {
    const percentage = metadata.percent
    dialog.update({
      message: `Создание... ${percentage}%`,
    })
    if (percentage === 100 && metadata.currentFile !== null) {
      dialog.hide()
    }
  })
  const filename = exportName.replace(/\.zip$/, '') + '.zip'

  return saveAs(content, filename)
}
</script>
