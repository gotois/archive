<template>
  <div
    ref="root"
    v-touch-pan.vertical.down.mouse.mouseCapture.stop="
      disable ? null : handlePan
    "
    :class="{
      'swipe-to-close': !disable,
    }"
    :style="style"
  >
    <slot />
  </div>
</template>
<script lang="ts" setup>
import { PropType, computed, ref } from 'vue'
import { Screen, TouchSwipeParams } from 'quasar'

interface Details extends TouchSwipeParams {
  isFirst: boolean
  isFinal: boolean
  offset: {
    x: number
    y: number
  }
}

defineProps({
  disable: {
    type: Boolean as PropType<boolean>,
    required: false,
    default: false,
  },
})

const emit = defineEmits(['onClose'])

const translateY = ref(0)
const root = ref<InstanceType<typeof HTMLDivElement> | null>(null)

const style = computed(() => ({
  transform: `translateY(${translateY.value}px)`,
  opacity: Math.max(0.1, 1 - Math.abs((translateY.value / Screen.height) * 2)),
}))

function handlePan(details: Details) {
  if (details.direction === 'up') {
    return
  }
  details.evt.preventDefault()
  details.evt.stopPropagation()
  translateY.value = details.offset.y
  if (!details.isFinal) {
    return
  }
  const relativeSwipeDistance = translateY.value / root.value.clientHeight
  // If swiped < 25% distance then reset position
  if (relativeSwipeDistance < 0.25) {
    translateY.value = 0
    return
  }
  translateY.value = Screen.height
  emit('onClose')
  translateY.value = 0
}
</script>

<style lang="scss" scoped>
.swipe-to-close {
  will-change: opacity, transform;
  position: absolute;
  top: 0;
  bottom: 0;
  right: 0;
  left: 0;
}
</style>
