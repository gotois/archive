<template>
  <QVirtualScroll
    style="overflow-x: hidden; height: calc(100dvh - 60px)"
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
        :text="item.text"
      />
    </template>
  </QVirtualScroll>
  <InputComponent
    class="full-width absolute-bottom"
    @send="sendData"
    @search="serverData"
  />
</template>
<script lang="ts" setup>
import { QVirtualScroll } from 'quasar'
import { ref } from 'vue'
import ChatComponent from 'components/ChatComponent.vue'
import InputComponent from 'components/SearchInputComponent.vue'

const size = ref(100000)
const allItems = Array(size.value)
  .fill(null)
  .map((_, index) => ({
    index,
    text: 'hello',
    sent: Math.random() > 0.5,
  }))

function getItems(from: number, size: number) {
  const items = []
  for (let i = 0; i < size; i++) {
    items.push(allItems[from + i])
  }
  return Object.freeze(items)
}

function serverData(value: string) {
  allItems.push({
    index: allItems.length,
    text: value,
    sent: false,
  })
  size.value = allItems.length
}

function sendData(value: string) {
  allItems.push({
    index: allItems.length,
    text: value,
    sent: true,
  })
  size.value = allItems.length
}
</script>
