<template>
  <QCard v-ripple flat :dark="!$q.dark.isActive" bordered square>
    <QCardSection
      class="q-pa-xs justify-between items-center"
      :horizontal="props.horizontal"
    >
      <div
        class="flex justify-between"
        :class="{
          'text-black': $q.dark.isActive,
          'text-white': !$q.dark.isActive,
        }"
      >
        <div class="text-subtitle2 text-bold">
          {{ title }}
        </div>
      </div>
      <div class="text-caption text-red">
        ⏰
        {{ date.formatDate(convertTemporalToDate(start), 'HH:mm') }}
        -
        {{ date.formatDate(convertTemporalToDate(end), 'HH:mm') }}
      </div>
      <div v-if="location?.name" class="ellipsis-2-lines">
        📍 {{ location.name }}
      </div>
      <div v-if="description" class="ellipsis-2-lines">
        {{ description }}
      </div>
    </QCardSection>
    <QPopupProxy>
      <TaskFull
        style="width: 640px"
        :event-id="eventId"
        :title="title"
        :description="description"
        :attaches="attaches"
        :start-time="convertTemporalToDate(start)"
        :end-time="convertTemporalToDate(end)"
        :tag="tag"
        :same-as="''"
        :location="location"
        :link="link"
        :organizer="organizer"
        :participant="participant"
        @remove="onRemove"
      />
    </QPopupProxy>
  </QCard>
</template>
<script lang="ts" setup>
import { PropType } from 'vue'
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'
import { QCard, QCardSection, QPopupProxy, date, useQuasar } from 'quasar'
import type { Temporal } from '@js-temporal/polyfill'
import TaskFull from 'components/TaskFull.vue'
import useContractStore from 'stores/contract'
import useAuthStore from 'stores/auth'
import type { Agent, FormatImageType, Place } from '../types/models'
import { convertTemporalToDate } from '../helpers/dateHelper'

const $q = useQuasar()
const i18n = useI18n()
const contractStore = useContractStore()
const authStore = useAuthStore()

const { isLoggedIn } = storeToRefs(authStore)

const $t = i18n.t

const emit = defineEmits(['remove'])

const props = defineProps({
  horizontal: {
    type: Boolean as PropType<boolean>,
    default: false,
  },
  eventId: {
    type: Number as PropType<number>,
    required: true,
  },
  title: {
    type: String as PropType<string>,
    required: true,
  },
  start: {
    type: Object as PropType<Temporal.ZonedDateTime>,
    required: true,
  },
  end: {
    type: Object as PropType<Temporal.ZonedDateTime>,
    required: true,
  },
  location: {
    type: Object as PropType<Place>,
    default: () => {},
  },
  description: {
    type: String as PropType<string>,
    default: null,
  },
  attaches: {
    type: Array as PropType<FormatImageType[]>,
    default: null,
  },
  organizer: {
    type: Object as PropType<Agent>,
    default: () => {},
  },
  participant: {
    type: Array as PropType<Agent[]>,
    default: () => [],
  },
  tag: {
    type: Array as PropType<string[]>,
    default: () => [],
  },
  link: {
    type: String as PropType<string>,
    default: null,
  },
})

function onRemove() {
  $q.notify({
    message: !isLoggedIn.value
      ? $t('contract.removeDialog.message')
      : $t('contract.removeDialog.isLoginMessage'),
    type: 'negative',
    position: 'center',
    group: false,
    multiLine: true,
    textColor: 'white',
    timeout: 7500,
    attrs: {
      role: 'alertdialog',
    },
    actions: [
      {
        icon: 'check_circle',
        label: $t('contract.removeDialog.ok'),
        color: 'white',
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        async handler() {
          try {
            await contractStore.removeContract(props.eventId, isLoggedIn.value)
            emit('remove')
          } catch (error) {
            console.error(error)
            $q.notify({
              type: 'negative',
              message: $t('contract.removeDialog.fail'),
            })
          }
        },
      },
      {
        icon: 'cancel',
        label: $t('contract.removeDialog.cancel'),
        color: 'white',
      },
    ],
  })
}
</script>
