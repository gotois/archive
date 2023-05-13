<template>
  <div
    ref="root"
    v-touch-pan.vertical.mouse.mightPrevent.mouseMightPrevent="handlePan"
    class="swipe-to-close"
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

const props = defineProps({
  disabled: {
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
  opacity: Math.max(0, 1 - Math.abs(translateY.value / Screen.height)),
}))

function handlePan(details: Details) {
  if (props.disabled) {
    return
  }
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
  position: relative;
}
</style>
