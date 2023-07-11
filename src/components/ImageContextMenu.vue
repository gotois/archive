<template>
  <QMenu touch-position context-menu>
    <QList :dense="$q.platform.is.desktop" style="min-width: 100px">
      <QItem v-close-popup clickable @click="onWindowOpenImage(contentUrl)">
        <QItemSection>
          {{ $t('archiveList.openFile') }}
        </QItemSection>
      </QItem>
      <QSeparator />
      <QItem
        v-if="canWrite"
        v-close-popup
        clickable
        @click="onCopy(contentUrl)"
      >
        <QItemSection>
          {{ $t('archiveList.copyFile') }}
        </QItemSection>
      </QItem>
    </QList>
  </QMenu>
</template>
<script lang="ts" setup>
import { PropType, ref } from 'vue'
import {
  Notify,
  QMenu,
  QList,
  QItem,
  QItemSection,
  QSeparator,
  openURL,
} from 'quasar'

defineProps({
  contentUrl: {
    type: String as PropType<string>,
    default: '',
  },
})

const canWrite = ref(Reflect.has(navigator.clipboard, 'write'))

async function onCopy(contentUrl: string) {
  const base64Response = await fetch(contentUrl)
  const blob = await base64Response.blob()
  const clipboardItem = new ClipboardItem({ [blob.type]: blob })
  try {
    await navigator.clipboard.write([clipboardItem])
    Notify.create({
      type: 'positive',
      message: 'Данные сохранены в буфер обмена',
    })
  } catch (error) {
    console.error(error)
    Notify.create({
      type: 'negative',
      message: 'Произошла ошибка',
    })
  }
}

function onWindowOpenImage(contentUrl: string) {
  openURL(contentUrl, undefined, {
    noopener: true,
    noreferrer: true,
    toolbar: false,
    popup: 1,
  })
}
</script>
