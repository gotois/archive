<template>
  <QMenu touch-position context-menu>
    <QList :dense="$q.platform.is.desktop" style="min-width: 100px">
      <QItem v-close-popup clickable @click="onWindowOpenImage(contentUrl)">
        <QItemSection>
          {{ $t('components.imageContextMenu.open') }}
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
          {{ $t('components.imageContextMenu.copy') }}
        </QItemSection>
      </QItem>
    </QList>
  </QMenu>
</template>
<script lang="ts" setup>
import { PropType, getCurrentInstance, ref } from 'vue'
import {
  useQuasar,
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

// eslint-disable-next-line @typescript-eslint/unbound-method
const $t = getCurrentInstance().appContext.config.globalProperties.$t
const $q = useQuasar()

const canWrite = ref(Reflect.has(navigator.clipboard, 'write'))

async function onCopy(contentUrl: string) {
  const base64Response = await fetch(contentUrl)
  const blob = await base64Response.blob()
  const clipboardItem = new ClipboardItem({ [blob.type]: blob })
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

function onWindowOpenImage(contentUrl: string) {
  openURL(contentUrl, undefined, {
    noopener: true,
    noreferrer: true,
    toolbar: false,
    popup: 1,
  })
}
</script>
