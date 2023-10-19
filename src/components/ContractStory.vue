<template>
  <QBtnDropdown
    class="text-weight-light no-margin full-width"
    content-class="no-shadow no-border no-border-radius"
    no-caps
    flat
    unelevated
    square
    dense
    :transition-duration="0"
    persistent
    split
    :disable-dropdown="!item.proof"
    :disable-main-btn="!item.participant.url"
    :icon="itemIsOrganization(item) ? 'group' : 'face'"
    size="xm"
    align="left"
    :ripple="false"
    text-color="black-9"
    :label="item.participant.sameAs"
    :href="item.participant.url"
    @update:model-value="showed = !showed"
  />
  <div v-if="showed" class="q-pa-md row justify-between full-width">
    <div style="width: 100%">
      <QChatMessage
        v-for="(proof, objectKey) in item.proof"
        :key="objectKey"
        :text="[JSON.stringify(item.proof)]"
        :stamp="date.formatDate(proof.created, 'YYYY/MM/DD HH:mm')"
        sent
      />
    </div>
  </div>
</template>
<script lang="ts" setup>
import { ref, toRef } from 'vue'
import { QBtnDropdown, QChatMessage, date } from 'quasar'
import { FormatContract } from '../types/models'

interface Props {
  item: FormatContract
}

const props = defineProps<Props>()

const item = toRef<FormatContract>(props, 'item')
const showed = ref(false)

function itemIsOrganization(item: FormatContract) {
  return item.participant['@type'] === 'https://schema.org/Organization'
}
</script>
