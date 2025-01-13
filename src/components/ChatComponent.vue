<template>
  <div
    :key="props.index"
    :class="`row no-wrap items-center q-mx-sm justify-${
      props.sent ? 'end' : 'start'
    }`"
    :style="{ height: '78px' }"
  >
    <QChatMessage
      v-if="asyncContent === Object(asyncContent)"
      :key="props.index"
      class="q-mx-sm"
      v-bind="asyncContent"
      text-html
    />
    <QSkeleton
      v-else
      class="on-left on-right"
      animation="none"
      type="text"
      width="150px"
      height="100px"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref, onBeforeMount, onBeforeUnmount, defineProps } from 'vue'
import { date, QChatMessage, QSkeleton } from 'quasar'
import { parse } from '../helpers/markdownHelper'

const props = defineProps({
  index: {
    type: Number,
    required: true,
  },
  sent: {
    type: Boolean,
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
})

const asyncContent = ref(null)
let timer: string | number = null

function timeAgo(d: Date) {
  return date.formatDate(d, 'YYYY/MM/DD HH:mm')
}

onBeforeMount(() => {
  timer = setTimeout(
    () => {
      asyncContent.value = {
        sent: props.sent,
        name: props.sent ? 'Вы' : 'Бот',
        stamp: timeAgo(new Date()),
        text: [parse(props.text)],
      }
    },
    300 + Math.random() * 2000,
  )
})

onBeforeUnmount(() => {
  clearTimeout(timer)
})
</script>
