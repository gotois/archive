<template>
  <QMenu touch-position context-menu>
    <QList :dense="$q.platform.is.desktop" style="min-width: 100px">
      <QItem
        v-close-popup
        :dense="$q.platform.is.desktop"
        clickable
        @click="open(image.contentUrl)"
      >
        <QItemSection>
          {{ $t('components.imageContextMenu.open') }}
        </QItemSection>
      </QItem>
      <QSeparator />
      <QItem
        v-if="canShare"
        v-close-popup
        :dense="$q.platform.is.desktop"
        clickable
        @click="onFileShare(image)"
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
        @click="onCopy(image.contentUrl)"
      >
        <QItemSection>
          {{ $t('components.imageContextMenu.copy') }}
        </QItemSection>
      </QItem>
    </QList>
  </QMenu>
</template>
<script lang="ts" setup>
import { PropType, ref } from 'vue'
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
import { getFileExt } from '../helpers/dataHelper'
import { fileShare, canShare } from '../helpers/fileHelper'

defineProps({
  image: {
    type: Object as PropType<{
      contentUrl: string
      encodingFormat: string
    }>,
    require: true,
    default: () => ({}),
  },
})

const $t = useI18n().t
const $q = useQuasar()

const canWrite = ref(Reflect.has(navigator.clipboard, 'write'))

async function onFileShare(image: { contentUrl: string }) {
  const base64Response = await fetch(image.contentUrl)
  const blob = await base64Response.blob()
  const ext = getFileExt(blob.type)
  const file = new File([blob], `file.${ext}`, {
    type: blob.type,
  })
  try {
    await fileShare(file)
  } catch (error) {
    console.error(error)
    $q.notify({
      type: 'negative',
      message: $t('components.imageContextMenu.fail'),
    })
  }
}

async function onCopy(contentUrl: string) {
  const base64Response = await fetch(contentUrl)
  const blob = await base64Response.blob()
  const clipboardItem = new ClipboardItem(
    {
      [blob.type]: blob,
    },
    {
      presentationStyle: 'attachment',
    },
  )
  try {
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
</script>
