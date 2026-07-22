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
    v-if="size >= 2"
    class="full-width"
    label="Try Generate Calendar"
    @click="tryGenerateCalendar"
  />
  <InputComponent
    class="full-width absolute-bottom"
    @attach="attachFile"
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
import { ref, nextTick, watch } from 'vue'
import { QVirtualScroll, QBtn, useQuasar } from 'quasar'
import useChatStore from '@/entities/chat'
import { ChatComponent } from '@/entities/chat'
import InputComponent from '@/features/archive-search'
import CreateNewDogovor from '@/features/contract-create'
import type { Attachment } from '@/shared/model/media'
import type { VerifiableCredential } from '@/shared/model/jsonld'

const chatStore = useChatStore()
const $q = useQuasar()

const virtualListRef = ref<InstanceType<typeof QVirtualScroll> | null>(null)
const creatingNewContract = ref(false)
const contract = ref<VerifiableCredential>(null)
const attachment = ref<Attachment[]>([])
const size = ref(1)
const allItems = Array(size.value)
  .fill(null)
  .map((_, index) => ({
    index,
    text: 'Привет, я ваш Виртуальный Секретарь. Задай мне пожелание по расписанию',
    sent: false,
    stamp: new Date(),
  }))

watch(
  () => size.value,
  async (sizeValue) => {
    await nextTick(() => {
      virtualListRef.value.scrollTo(sizeValue, 'start-force')
    })
  },
)

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

function sendData(value: string) {
  allItems.push({
    index: allItems.length,
    text: value,
    sent: true,
    stamp: new Date(),
  })
  size.value = allItems.length
}

async function tryGenerateCalendar() {
  const data = [...chatStore.messages]
  if (attachment.value.length) {
    data.push(
      ...attachment.value.map((item) => ({
        type: item.type,
        mediaType: item.mediaType,
        content: item.url,
      })),
    )
  }
  try {
    console.log('WIP generate calendar', data)
    $q.notify({
      type: 'warning',
      message: 'Generation is not implemented',
    })
  } catch (error) {
    console.error(error)
    $q.notify({
      type: 'negative',
      message: 'Generation Failed',
    })
  }
}

function contractComplete() {
  creatingNewContract.value = false
  chatStore.messages = []
}

function attachFile(images: Attachment[]) {
  attachment.value = images
}
</script>
