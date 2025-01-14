<template>
  <div
    :key="props.index"
    :class="`row no-wrap items-center q-mx-sm justify-${
      props.sent ? 'end' : 'start'
    }`"
  >
    <QChatMessage
      v-if="asyncContent"
      :key="props.index"
      v-bind="asyncContent"
      :bg-color="sent ? 'primary' : 'secondary'"
      size="12"
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
import { PropType, ref, onBeforeMount } from 'vue'
import { date, QChatMessage, QSkeleton } from 'quasar'
import { parse } from '../helpers/markdownHelper'

const props = defineProps({
  index: {
    type: Number as PropType<number>,
    required: true,
  },
  stamp: {
    type: Date as PropType<Date>,
    required: true,
  },
  sent: {
    type: Boolean as PropType<boolean>,
    required: true,
  },
  text: {
    type: String as PropType<string>,
    required: true,
  },
})

const asyncContent = ref(null)

function timeAgo(d: Date) {
  return date.formatDate(d, 'YYYY/MM/DD HH:mm')
}

onBeforeMount(() => {
  asyncContent.value = {
    sent: props.sent,
    name: props.sent ? 'Вы' : 'Секретарь',
    stamp: timeAgo(props.stamp),
    text: [parse(props.text)],
  }
})
</script>
