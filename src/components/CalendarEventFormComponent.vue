<template>
  <div>
    <!-- View mode -->
    <template v-if="readonly">
      <QCardSection>
        <p class="text-h6 q-mb-sm">
          {{ task.name }}
        </p>
        <div v-if="task.description" class="text-body2 text-grey q-mb-sm">
          {{ task.description }}
        </div>
        <div class="text-caption q-mb-xs">
          <QIcon name="schedule" class="q-mr-xs" />
          {{ prettyDate(task.start_date, task.end_date) }}
        </div>
        <div v-if="task.location" class="text-caption q-mb-xs">
          <QIcon name="place" class="q-mr-xs" />
          {{ task.location }}
        </div>
        <div v-if="task.link_meeting" class="text-caption q-mb-xs">
          <QIcon name="videocam" class="q-mr-xs" />
          <a :href="task.link_meeting" target="_blank" rel="noopener">
            {{ task.link_meeting }}
          </a>
        </div>
        <div class="text-caption">
          <QIcon name="flag" class="q-mr-xs" />
          {{ priorityLabel(task.priority) }}
        </div>
      </QCardSection>
      <QCardActions>
        <QBtn
          size="md"
          class="q-ml-auto q-mr-auto q-mt-none q-mb-none"
          round
          square
          flat
          icon="more_vert"
        >
          <QMenu transition-show="jump-down" transition-duration="200">
            <QList bordered separator padding :dense="$q.platform.is.desktop">
              <QItem v-close-popup clickable @click="onGoToEdit">
                <QItemSection side>
                  <QItemLabel overline caption>
                    {{ $t('archiveList.pod') }}
                  </QItemLabel>
                  <QItemLabel class="text-uppercase">
                    {{ $t('archiveList.edit') }}
                  </QItemLabel>
                </QItemSection>
              </QItem>
              <QItem v-close-popup clickable @click="onRemove">
                <QItemSection side>
                  <QItemLabel overline caption>
                    {{ $t('archiveList.pod') }}
                  </QItemLabel>
                  <QItemLabel class="text-negative text-uppercase">
                    {{ $t('archiveList.remove') }}
                  </QItemLabel>
                </QItemSection>
              </QItem>
            </QList>
          </QMenu>
        </QBtn>
      </QCardActions>
    </template>
    <!-- Edit mode -->
    <template v-else>
      <QForm
        ref="formRef"
        class="q-gutter-md"
        @submit="isNew ? onSave : onEdit"
      >
        <QInput
          v-model="form.name"
          label="Название"
          outlined
          square
          hide-bottom-space
          :dense="$q.platform.is.desktop"
          :rules="[(v) => !!v || 'Обязательно']"
        />
        <QInput
          v-model="form.description"
          label="Описание"
          outlined
          square
          type="textarea"
          autogrow
          :dense="$q.platform.is.desktop"
        />
        <QInput
          v-model="form.start_date"
          label="Начало"
          outlined
          square
          mask="####-##-## ##:##"
          :dense="$q.platform.is.desktop"
        >
          <template #append>
            <QIcon name="event" class="cursor-pointer">
              <QPopupProxy
                cover
                transition-show="scale"
                transition-hide="scale"
              >
                <QCard>
                  <QTabs v-model="startDateTimeTab" dense>
                    <QTab name="date" label="Дата" />
                    <QTab name="time" label="Время" />
                  </QTabs>
                  <QSeparator />
                  <QTabPanels v-model="startDateTimeTab">
                    <QTabPanel name="date" class="q-pa-none">
                      <QDate
                        v-model="form.start_date"
                        mask="YYYY-MM-DD HH:mm"
                        minimal
                      />
                    </QTabPanel>
                    <QTabPanel name="time" class="q-pa-none">
                      <QTime
                        v-model="form.start_date"
                        mask="YYYY-MM-DD HH:mm"
                        format24h
                      />
                    </QTabPanel>
                  </QTabPanels>
                </QCard>
              </QPopupProxy>
            </QIcon>
          </template>
        </QInput>
        <QInput
          v-model="form.end_date"
          label="Конец"
          outlined
          square
          mask="####-##-## ##:##"
          :dense="$q.platform.is.desktop"
        >
          <template #append>
            <QIcon name="event" class="cursor-pointer">
              <QPopupProxy
                cover
                transition-show="scale"
                transition-hide="scale"
              >
                <QCard>
                  <QTabs v-model="endDateTimeTab" dense>
                    <QTab name="date" label="Дата" />
                    <QTab name="time" label="Время" />
                  </QTabs>
                  <QSeparator />
                  <QTabPanels v-model="endDateTimeTab">
                    <QTabPanel name="date" class="q-pa-none">
                      <QDate
                        v-model="form.end_date"
                        mask="YYYY-MM-DD HH:mm"
                        minimal
                      />
                    </QTabPanel>
                    <QTabPanel name="time" class="q-pa-none">
                      <QTime
                        v-model="form.end_date"
                        mask="YYYY-MM-DD HH:mm"
                        format24h
                      />
                    </QTabPanel>
                  </QTabPanels>
                </QCard>
              </QPopupProxy>
            </QIcon>
          </template>
        </QInput>
        <QSelect
          v-model="form.remind_before"
          :options="remindOptions"
          label="Напоминание"
          outlined
          square
          clearable
          emit-value
          map-options
          :dense="$q.platform.is.desktop"
        >
          <template #prepend>
            <QIcon name="notifications_none" />
          </template>
        </QSelect>
        <QInput
          v-model="form.location"
          label="Место"
          outlined
          square
          :dense="$q.platform.is.desktop"
        />
        <QInput
          v-model="form.link_meeting"
          label="Ссылка на встречу"
          outlined
          square
          type="url"
          :dense="$q.platform.is.desktop"
        />
        <QSelect
          v-model="form.priority"
          :options="priorityOptions"
          label="Приоритет"
          outlined
          square
          emit-value
          map-options
          :dense="$q.platform.is.desktop"
        />
        <QCardActions v-if="!isTMA" class="q-px-none">
          <QBtn
            type="submit"
            color="primary"
            icon="save"
            label="Сохранить"
            :loading="saving"
          />
          <QSpace />
          <QBtn
            v-if="taskId !== 'new'"
            flat
            color="negative"
            icon="delete"
            label="Удалить"
            @click="onRemove"
          />
        </QCardActions>
      </QForm>
    </template>
  </div>
</template>
<script lang="ts" setup>
import { reactive, ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  useQuasar,
  QBtn,
  QCardActions,
  QCardSection,
  QDate,
  QForm,
  QIcon,
  QInput,
  QPopupProxy,
  QSelect,
  QSeparator,
  QSpace,
  QTab,
  QTabPanel,
  QTabPanels,
  QTabs,
  QTime,
  QItemLabel,
  QItemSection,
  QList,
  QCard,
  QItem,
  QMenu,
} from 'quasar'
import { useRouter, useRoute } from 'vue-router'
import { mainButton, postEvent } from '@telegram-apps/sdk'
import { isTMA } from '@/composables/detector'
import useEventStore from '@/stores/event'
import { prettyDate, toDatetimeLocal } from '../helpers/dateHelper'
import { ROUTE_NAMES } from '@/router/routes'

interface TaskObject {
  id_task: number
  name: string
  description?: string | null
  start_date: string
  end_date?: string | null
  location?: string | null
  link_meeting?: string | null
  priority?: number
  remind_before?: number | null
}

const props = defineProps<{
  task: TaskObject
  readonly: boolean
  taskId: string | number
}>()
const emit = defineEmits<{
  (e: 'saved'): void
  (e: 'removed'): void
}>()

const $q = useQuasar()
useI18n()
const router = useRouter()
const route = useRoute()
const eventStore = useEventStore()

const formRef = ref<InstanceType<typeof QForm> | null>(null)
const saving = ref(false)
const startDateTimeTab = ref('date')
const endDateTimeTab = ref('date')
const priorityOptions = [
  { label: 'Высокий', value: 1 },
  { label: 'Средний', value: 2 },
  { label: 'Низкий', value: 3 },
]
const remindOptions = [
  { label: 'Без напоминания', value: null },
  { label: 'За 15 мин', value: 15 },
  { label: 'За 1 час', value: 60 },
  { label: 'За 24 часа', value: 1440 },
]
const isNew = props.taskId === 'new'

function priorityLabel(priority?: number): string {
  return priorityOptions.find((o) => o.value === priority)?.label ?? '—'
}

const form = reactive({
  name: props.task.name,
  description: props.task.description ?? '',
  start_date: toDatetimeLocal(props.task.start_date).replace('T', ' '),
  end_date: toDatetimeLocal(props.task.end_date).replace('T', ' '),
  location: props.task.location ?? '',
  link_meeting: props.task.link_meeting ?? '',
  priority: props.task.priority ?? 3,
  remind_before:
    typeof props.task.remind_before === 'number'
      ? props.task.remind_before / 60
      : null,
})

function onGoToEdit() {
  void router.push({
    name: ROUTE_NAMES.EDIT,
    params: {
      taskId: props.taskId,
    },
    query: route.query,
  })
}

async function onSave() {
  const valid = await formRef.value?.validate()
  if (!valid) {
    return
  }
  saving.value = true
  try {
    await eventStore.createEvent({
      name: form.name,
      description: form.description || undefined,
      start_date: new Date(form.start_date),
      end_date: form.end_date ? new Date(form.end_date) : undefined,
      location: form.location || undefined,
      link_meeting: form.link_meeting || undefined,
      priority: form.priority,
      remind_before: form.remind_before,
    },
      String(route.query.tgGroupChatId),
      String(route.query.tgGroupMessageId))
    emit('saved')
  } catch (error: Error | unknown) {
    console.error(error)
    $q.notify({
      type: 'negative',
      message: error?.message ?? 'Ошибка сохранения',
    })
  } finally {
    saving.value = false
  }
}

async function onEdit() {
  const valid = await formRef.value?.validate()
  if (!valid) {
    return
  }
  saving.value = true
  try {
    await eventStore.editEvent({
      id_task: Number(props.taskId),
      name: form.name,
      description: form.description || undefined,
      start_date: new Date(form.start_date),
      end_date: form.end_date ? new Date(form.end_date) : undefined,
      location: form.location || undefined,
      link_meeting: form.link_meeting || undefined,
      priority: form.priority,
      remind_before: form.remind_before,
    }, String(route.query.tgGroupChatId),
      String(route.query.tgGroupMessageId))
    emit('saved')
  } catch (error: Error | unknown) {
    console.error(error)
    $q.notify({
      type: 'negative',
      message: error?.message ?? 'Ошибка обновления',
    })
  } finally {
    saving.value = false
  }
}

function onRemove() {
  $q.dialog({
    title: 'Удалить событие?',
    message: `«${props.task.name}»`,
    ok: { label: 'Удалить', color: 'negative', flat: true },
    cancel: { label: 'Отмена', flat: true },
  }).onOk(async () => {
    try {
      await eventStore.deleteEvent({
        ids: [props.task.id_task],
      }, String(route.query.tgGroupChatId),
      String(route.query.tgGroupMessageId))
      emit('removed')
    } catch (error: Error | unknown) {
      console.error(error)
      $q.notify({
        type: 'negative',
        message: error?.message ?? 'Ошибка удаления',
      })
    }
  })
}

onMounted(() => {
  if (!isTMA.value) {
    return
  }
  if (!mainButton.isMounted()) {
    mainButton.mount()
  }
  mainButton.setParams({
    text: isNew ? 'Создать' : 'Обновить',
    backgroundColor: '#2481cc',
    textColor: '#ffffff',
    isEnabled: true,
    isVisible: true,
  })
  mainButton.onClick(async () => {
    if (isNew) {
      await onSave()
    } else {
      await onEdit()
    }

    postEvent('web_app_close')
  })
})
</script>
