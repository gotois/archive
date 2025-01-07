<template>
  <QVirtualScroll
    style="max-height: 600px; overflow-x: hidden"
    :items-size="size"
    :items-fn="getItems"
    :virtual-scroll-item-size="78"
    separator
  >
    <template #default="{ item, index }">
      <ChatComponent
        :key="index"
        :index="item.index"
        :sent="item.sent"
        text-html
      />
    </template>
  </QVirtualScroll>
</template>
<script lang="ts" setup>
import { QVirtualScroll } from 'quasar'
import { ref } from 'vue'
import { ChatComponent } from './ChatComponent.ts'

const size = ref(100000)
const allItems = Array(size.value)
  .fill(null)
  .map((_, index) => ({
    index,
    sent: Math.random() > 0.5,
  }))

function getItems(from: number, size: number) {
  const items = []
  for (let i = 0; i < size; i++) {
    items.push(allItems[from + i])
  }
  return Object.freeze(items)
}
</script>
