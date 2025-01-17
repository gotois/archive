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
        {{ date.formatDate(start, 'HH:mm') }}
        -
        {{ date.formatDate(end, 'HH:mm') }}
      </div>
      <div v-if="location" class="ellipsis-2-lines"> 📍 {{ location }} </div>
      <div v-if="description" class="ellipsis-2-lines">
        {{ description }}
      </div>
    </QCardSection>
    <QPopupProxy>
      <TaskFull
        style="width: 640px"
        :title="title"
        :description="description"
        :attaches="attaches"
        :start-time="start"
        :end-time="end"
        :tag="tag"
        :same-as="''"
        :location="null"
        :link="''"
        :organizer="organizer"
        :participant="participant"
        @remove="onRemove"
        @edit="onEdit"
      />
    </QPopupProxy>
  </QCard>
</template>
<script lang="ts" setup>
import { PropType } from 'vue'
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'
import { QCard, QCardSection, QPopupProxy, date, useQuasar } from 'quasar'
import TaskFull from 'components/TaskFull.vue'
import useContractStore from 'stores/contract'
import useAuthStore from 'stores/auth'
import { Agent, FormatImageType } from '../types/models'

const $q = useQuasar()
const i18n = useI18n()
const contractStore = useContractStore()
const authStore = useAuthStore()

const { isLoggedIn } = storeToRefs(authStore)

const $t = i18n.t

const emit = defineEmits(['remove', 'edit'])

const props = defineProps({
  horizontal: {
    type: Boolean as PropType<boolean>,
    default: false,
  },
  title: {
    type: String as PropType<string>,
    required: true,
  },
  start: {
    type: Date as PropType<Date>,
    required: true,
  },
  end: {
    type: Date as PropType<Date>,
    required: true,
  },
  location: {
    type: String as PropType<string>,
    default: null,
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
  tag: {
    type: Array as PropType<string[]>,
    default: () => [],
  },
})

function onRemove(item) {
  alert('WIP')

  $q.notify({
    message:
      !isLoggedIn.value && item.sameAs
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
            await contractStore.removeContract({
              contract: item,
              usePod: isLoggedIn.value,
            })
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

function onEdit(item) {
  const dialog = $q.dialog({
    message: $t('contract.editDialog.message'),
    prompt: {
      model: '',
      type: 'text',
    },
    cancel: true,
  })
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  dialog.onOk(async (/*value: string*/) => {
    try {
      // item: FormatContract
      // item.instrument.description = value
      await contractStore.editContract(item)

      if (isLoggedIn.value) {
        // todo - поддержать обновление на Pod и в Секретаре
        // import usePodStore from 'stores/pod'
        // const podStore = usePodStore()
        // await podStore.updateIntoPod(item)
      }
      emit('edit')
    } catch (error) {
      console.error(error)
      $q.notify({
        color: 'negative',
        message: $t('contract.editDialog.fail'),
      })
    }
  })
}
</script>
