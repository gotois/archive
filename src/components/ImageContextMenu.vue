<template>
  <QMenu touch-position context-menu>
    <QList :dense="$q.platform.is.desktop" style="min-width: 100px">
      <QItem v-close-popup clickable @click="open(contentUrl)">
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

defineProps({
  contentUrl: {
    type: String as PropType<string>,
    default: '',
  },
})

const $t = useI18n().t
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
</script>
