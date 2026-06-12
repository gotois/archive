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
      <QForm ref="formRef" class="q-gutter-md" @submit="isNew ? onSave : onEdit">
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
          type="datetime-local"
          :dense="$q.platform.is.desktop"
        />
        <QInput
          v-model="form.end_date"
          label="Конец"
          outlined
          square
          type="datetime-local"
          :dense="$q.platform.is.desktop"
        />
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
          <QBtn
            flat
            icon="alarm"
            label="Напоминание"
            @click="remindDialog = true"
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
      <!-- Remind dialog -->
      <QDialog v-model="remindDialog">
        <QCard>
          <QCardSection class="text-h6">Напоминание</QCardSection>
          <QCardSection class="q-pt-none row q-col-gutter-sm">
            <div class="col-12 col-sm-auto">
              <QDate v-model="remindDate" minimal />
            </div>
            <div class="col-12 col-sm-auto flex items-center">
              <QTime v-model="remindTime" format24h />
            </div>
          </QCardSection>
          <QCardActions v-if="!isTMA">
            <QBtn v-close-popup flat label="Отмена" />
            <QBtn
              flat
              color="primary"
              label="Установить"
              :loading="reminding"
              @click="onRemind"
            />
          </QCardActions>
        </QCard>
      </QDialog>
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
  QDialog,
  QForm,
  QIcon,
  QInput,
  QSelect,
  QSpace,
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
import { isTMA } from '../composables/detector'
import useSecretaryStore from 'stores/secretary'
import useGeoStore from 'stores/geo'
import { prettyDate, toDatetimeLocal } from '../helpers/dateHelper'
import { ROUTE_NAMES } from '../router/routes'

interface TaskObject {
  id_task: number
  name: string
  description?: string | null
  start_date: string
  end_date?: string | null
  location?: string | null
  link_meeting?: string | null
  priority?: number
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
const secretaryStore = useSecretaryStore()
const geoStore = useGeoStore()

const formRef = ref<InstanceType<typeof QForm> | null>(null)
const saving = ref(false)
const reminding = ref(false)
const remindDialog = ref(false)
const priorityOptions = [
  { label: 'Высокий', value: 1 },
  { label: 'Средний', value: 2 },
  { label: 'Низкий', value: 3 },
]
const now = new Date()
const _pad = (n: number) => String(n).padStart(2, '0')
const isNew = props.taskId === 'new'

function priorityLabel(priority?: number): string {
  return priorityOptions.find((o) => o.value === priority)?.label ?? '—'
}

const form = reactive({
  name: props.task.name,
  description: props.task.description ?? '',
  start_date: toDatetimeLocal(props.task.start_date),
  end_date: toDatetimeLocal(props.task.end_date),
  location: props.task.location ?? '',
  link_meeting: props.task.link_meeting ?? '',
  priority: props.task.priority ?? 3,
})

const remindDate = ref(
  `${now.getFullYear()}/${_pad(now.getMonth() + 1)}/${_pad(now.getDate())}`,
)
const remindTime = ref(`${_pad(now.getHours())}:${_pad(now.getMinutes())}`)

function onGoToEdit() {
  void router.push({
    name: ROUTE_NAMES.EDIT,
    params: {
      taskId: props.taskId,
    },
    query: route.query,
  })
}

async function createEvent() {
  const headers = new Headers({
    'Content-Type': 'application/json',
  })
  if (secretaryStore.auth) {
    headers.set('Authorization', secretaryStore.auth)
  }
  if (geoStore.geolocation) {
    headers.set('Geolocation', geoStore.geolocation)
  }
  if (route.query.tgGroupChatId) {
    headers.set('X-Telegram-Chat-Id', String(route.query.tgGroupChatId))
  }
  if (route.query.tgGroupMessageId) {
    headers.set('X-Telegram-Message-Id', String(route.query.tgGroupMessageId))
  }
  const response = await fetch(process.env.server + '/event', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      name: form.name,
      description: form.description || undefined,
      start_date: new Date(form.start_date),
      end_date: form.end_date ? new Date(form.end_date) : undefined,
      location: form.location || undefined,
      link_meeting: form.link_meeting || undefined,
      priority: form.priority,
    }),
    credentials: 'include',
  })
  if (!response.ok) {
    throw new Error('Response failed')
  }
  console.log('Данные успешно добавлены')
}

async function editEvent() {
  const headers = new Headers({
    'Content-Type': 'application/json',
  })
  if (secretaryStore.auth) {
    headers.set('Authorization', secretaryStore.auth)
  }
  if (route.query.tgGroupChatId) {
    headers.set('X-Telegram-Chat-Id', String(route.query.tgGroupChatId))
  }
  if (route.query.tgGroupMessageId) {
    headers.set('X-Telegram-Message-Id', String(route.query.tgGroupMessageId))
  }
  const response = await fetch(process.env.server + '/event', {
    method: 'PUT',
    headers,
    body: JSON.stringify({
      id_task: Number(props.taskId),
      name: form.name,
      description: form.description || undefined,
      start_date: new Date(form.start_date),
      end_date: form.end_date ? new Date(form.end_date) : undefined,
      location: form.location || undefined,
      link_meeting: form.link_meeting || undefined,
      priority: form.priority,
    }),
    credentials: 'include',
  })
  if (!response.ok) {
    throw new Error('Response failed')
  }
  console.log('Данные успешно изменены')
}

async function onSave() {
  const valid = await formRef.value?.validate()
  if (!valid) {
    return
  }
  saving.value = true
  try {
    await createEvent()
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
    await editEvent()
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
      await rpc('remove', { ids: [props.task.id_task] })
      emit('removed')
    } catch (err) {
    } catch (error: Error | unknown) {
      console.error(error)
      $q.notify({
        type: 'negative',
        message: error?.message ?? 'Ошибка удаления',
      })
    }
  })
}

async function onRemind() {
  reminding.value = true
  try {
    const [year, month, day_of_month] = remindDate.value.split('/').map(Number)
    const [hour, minute] = remindTime.value.split(':').map(Number)
    await rpc('remind-once', {
      id_task: props.task.id_task,
      name: props.task.name,
      year,
      month,
      day_of_month,
      hour,
      minute,
    })
    remindDialog.value = false
    $q.notify({ type: 'positive', message: 'Напоминание установлено' })
  } catch (err) {
    console.error(err)
    $q.notify({
      type: 'negative',
      message: (err as Error)?.message ?? 'Ошибка напоминания',
    })
  } finally {
    reminding.value = false
  }
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
