<template>
  <QVirtualScroll
    ref="virtualListRef"
    style="overflow-x: hidden; height: calc(100dvh - 90px)"
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
        :stamp="item.stamp"
      />
    </template>
  </QVirtualScroll>
  <QBtn
    v-if="size >= 1"
    class="full-width"
    label="Try Generate Calendar"
    @click="tryGenerateCalendar"
  />
  <InputComponent
    class="full-width absolute-bottom"
    @send="sendData"
    @sent="serverData"
  />
  <CreateNewDogovor
    v-if="creatingNewContract"
    :contract="contract"
    @done="contractComplete"
    @hide="creatingNewContract = false"
  />
</template>
<script lang="ts" setup>
import { ref, nextTick } from 'vue'
import { QVirtualScroll, QBtn } from 'quasar'
import { storeToRefs } from 'pinia'
import useChatStore from 'stores/chat'
import useGeoStore from 'stores/geo'
import useSecretaryStore from 'stores/secretary'
import ChatComponent from 'components/ChatComponent.vue'
import InputComponent from 'components/SearchInputComponent.vue'
import CreateNewDogovor from 'components/CreateNewDogovor.vue'
import { VerifiableCredential } from '../types/models'

const geoStore = useGeoStore()
const secretaryStore = useSecretaryStore()
const chatStore = useChatStore()

const { locationName } = storeToRefs(geoStore)
const virtualListRef = ref<InstanceType<typeof QVirtualScroll> | null>(null)
const creatingNewContract = ref(false)
const contract = ref<VerifiableCredential | null>(null)
const size = ref(1)
const allItems = Array(size.value)
  .fill(null)
  .map((_, index) => ({
    index,
    text: 'Привет, я ваш Виртуальный Секретарь. Задай мне пожелание по расписанию',
    sent: false,
    stamp: new Date(),
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
    stamp: new Date(),
  })
  size.value = allItems.length
}

async function sendData(value: string) {
  allItems.push({
    index: allItems.length,
    text: value,
    sent: true,
    stamp: new Date(),
  })
  size.value = allItems.length
  await nextTick(() => {
    virtualListRef.value.scrollTo(size.value, 'start-force')
  })
}

async function tryGenerateCalendar() {
  contract.value = await secretaryStore.generate(
    chatStore.messages.map((message) => {
      return {
        type: 'Note',
        content: message,
        mediaType: 'text/plain',
      }
    }),
  )
  creatingNewContract.value = true
}

async function contractComplete() {
  if (contract.value) {
    await secretaryStore.notify(contract.value as VerifiableCredential)
  }
  creatingNewContract.value = false
  chatStore.messages = []
}
</script>
