<template>
  <QMenu touch-position context-menu>
    <QList :dense="$q.platform.is.desktop" style="min-width: 100px">
      <QItem
        v-close-popup
        :dense="$q.platform.is.desktop"
        clickable
        @click="openFile()"
      >
        <QItemSection>
          {{ $t('components.imageContextMenu.open') }}
        </QItemSection>
      </QItem>
      <QSeparator />
      <QItem
        v-if="canShare && !$q.platform.is.firefox"
        v-close-popup
        :dense="$q.platform.is.desktop"
        clickable
        @click="onFileShare()"
      >
        <QItemSection>
          {{ $t('components.imageContextMenu.share') }}
        </QItemSection>
      </QItem>
      <QSeparator />
      <QItem
        v-if="canWrite && !$q.platform.is.safari"
        v-close-popup
        :dense="$q.platform.is.desktop"
        clickable
        @click="onCopy()"
      >
        <QItemSection>
          {{ $t('components.imageContextMenu.copy') }}
        </QItemSection>
      </QItem>
    </QList>
  </QMenu>
</template>
<script lang="ts" setup>
import { onBeforeMount, onBeforeUnmount, PropType, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  useQuasar,
  QMenu,
  QList,
  QItem,
  QItemSection,
  QSeparator,
} from 'quasar'
import { open } from '../helpers/urlHelper'
import {
  fileShare,
  canShare,
  getFileFromUrl,
  convertBlobToPng,
} from '../helpers/fileHelper'
import { PNG_MIME_TYPE } from '../helpers/mimeTypes'
import { ImageType } from '../types/models'

const props = defineProps({
  image: {
    type: Object as PropType<ImageType>,
    require: true,
    default: () => ({}),
  },
})

const $t = useI18n().t
const $q = useQuasar()

const canWrite = ref(Reflect.has(navigator.clipboard, 'write'))
const fileURL = ref<string>(null)
const file = ref<File>(null)

function openFile() {
  try {
    open(fileURL.value)
  } catch (error) {
    console.error(error)
    $q.notify({
      type: 'negative',
      message: $t('components.imageContextMenu.fail'),
    })
  }
}

async function onFileShare() {
  try {
    await fileShare(file.value)
  } catch (error) {
    console.error(error)
    $q.notify({
      type: 'negative',
      message: $t('components.imageContextMenu.fail'),
    })
  }
}

async function onCopy() {
  try {
    const base64Response = await fetch(fileURL.value)
    const blob = await base64Response.blob()
    const pngBlob = await convertBlobToPng(blob)
    const clipboardItem = new ClipboardItem(
      {
        [PNG_MIME_TYPE]: pngBlob,
      },
      {
        presentationStyle: 'attachment',
      },
    )
    await navigator.clipboard.write([clipboardItem])
    $q.notify({
      type: 'positive',
      message: $t('components.imageContextMenu.success'),
    })
  } catch (error) {
    console.error(error)
    $q.notify({
      type: 'negative',
      message: $t('components.imageContextMenu.fail'),
    })
  }
}

onBeforeMount(async () => {
  file.value = await getFileFromUrl(props.image.url)
  fileURL.value = URL.createObjectURL(file.value)
})

onBeforeUnmount(() => {
  if (fileURL.value) {
    URL.revokeObjectURL(fileURL.value)
  }
})
</script>
