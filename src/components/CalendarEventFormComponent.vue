<template>
  <div>
    <!-- View mode -->
    <template v-if="readonly">
      <QCardSection>
        <p class="text-h6 q-mb-sm">{{ task.name }}</p>
        <div v-if="task.description" class="text-body2 text-grey q-mb-sm">{{ task.description }}</div>
        <div class="text-caption q-mb-xs">
          <QIcon name="schedule" class="q-mr-xs" />{{ prettyDate(task.start_date, task.end_date) }}
        </div>
        <div v-if="task.location" class="text-caption q-mb-xs">
          <QIcon name="place" class="q-mr-xs" />{{ task.location }}
        </div>
        <div v-if="task.link_meeting" class="text-caption q-mb-xs">
          <QIcon name="videocam" class="q-mr-xs" /><a :href="task.link_meeting" target="_blank" rel="noopener">{{ task.link_meeting }}</a>
        </div>
        <div class="text-caption">
          <QIcon name="flag" class="q-mr-xs" />{{ priorityLabel(task.priority) }}
        </div>
      </QCardSection>
      <QCardActions>
        <QBtn flat icon="edit" label="Редактировать" @click="onGoToEdit" />
        <QBtn flat icon="alarm" label="Напоминание" @click="remindDialog = true" />
      </QCardActions>
    </template>
    <!-- Edit mode -->
    <QForm v-else ref="formRef" class="q-gutter-md" @submit="onSave">
      <QInput
        v-model="form.name"
        label="Название"
        outlined square
        :dense="$q.platform.is.desktop"
        :rules="[(v) => !!v || 'Обязательно']"
      />
      <QInput
        v-model="form.description"
        label="Описание"
        outlined square
        type="textarea"
        autogrow
        :dense="$q.platform.is.desktop"
      />
      <QInput
        v-model="form.start_date"
        label="Начало"
        outlined square
        type="datetime-local"
        :dense="$q.platform.is.desktop"
      />
      <QInput
        v-model="form.end_date"
        label="Конец"
        outlined square
        type="datetime-local"
        :dense="$q.platform.is.desktop"
      />
      <QInput
        v-model="form.location"
        label="Место"
        outlined square
        :dense="$q.platform.is.desktop"
      />
      <QInput
        v-model="form.link_meeting"
        label="Ссылка на встречу"
        outlined square
        type="url"
        :dense="$q.platform.is.desktop"
      />
      <QSelect
        v-model="form.priority"
        :options="priorityOptions"
        label="Приоритет"
        outlined square
        emit-value map-options
        :dense="$q.platform.is.desktop"
      />
      <QCardActions class="q-px-none">
        <QBtn type="submit" color="primary" icon="save" label="Сохранить" :loading="saving" />
        <QBtn flat icon="alarm" label="Напоминание" @click="remindDialog = true" />
        <QSpace />
        <QBtn flat color="negative" icon="delete" label="Удалить" @click="onRemove" />
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
        <QCardActions align="right">
          <QBtn v-close-popup flat label="Отмена" />
          <QBtn flat color="primary" label="Установить" :loading="reminding" @click="onRemind" />
        </QCardActions>
      </QCard>
    </QDialog>
  </div>
</template>
<script lang="ts" setup>
import { reactive, ref } from 'vue'
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
} from 'quasar'
import { useRouter, useRoute } from 'vue-router'
import rpc from '../helpers/rpc'
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
  taskId: string
}>()
const emit = defineEmits<{
  (e: 'saved'): void
  (e: 'removed'): void
}>()
const $q = useQuasar()
useI18n()
const router = useRouter()
const route = useRoute()
const formRef = ref<InstanceType<typeof QForm> | null>(null)
const saving = ref(false)
const reminding = ref(false)
const remindDialog = ref(false)
const priorityOptions = [
  { label: 'Высокий', value: 1 },
  { label: 'Средний', value: 2 },
  { label: 'Низкий', value: 3 },
]

function priorityLabel(priority?: number): string {
  return priorityOptions.find((o) => o.value === priority)?.label ?? '—'
}

function toDatetimeLocal(iso?: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function prettyDate(start: string, end?: string | null): string {
  const fmt = new Intl.DateTimeFormat('ru', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
  if (!end) return fmt.format(new Date(start))
  return `${fmt.format(new Date(start))} — ${fmt.format(new Date(end))}`
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

const _now = new Date()
const _pad = (n: number) => String(n).padStart(2, '0')
const remindDate = ref(`${_now.getFullYear()}/${_pad(_now.getMonth() + 1)}/${_pad(_now.getDate())}`)
const remindTime = ref(`${_pad(_now.getHours())}:${_pad(_now.getMinutes())}`)

function onGoToEdit() {
  void router.push({
    name: ROUTE_NAMES.EDIT,
    params: { taskId: props.taskId },
    query: route.query,
  })
}

async function onSave() {
  const valid = await formRef.value?.validate()
  if (!valid) return
  saving.value = true
  try {
    await rpc('edit', {
      id_task: props.task.id_task,
      name: form.name,
      description: form.description,
      start_date: new Date(form.start_date),
      end_date: form.end_date ? new Date(form.end_date) : undefined,
      location: form.location,
      link_meeting: form.link_meeting,
      priority: form.priority,
    })
    emit('saved')
  } catch (err) {
    console.error(err)
    $q.notify({ type: 'negative', message: (err as Error)?.message ?? 'Ошибка сохранения' })
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
      console.error(err)
      $q.notify({ type: 'negative', message: (err as Error)?.message ?? 'Ошибка удаления' })
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
    $q.notify({ type: 'negative', message: (err as Error)?.message ?? 'Ошибка напоминания' })
  } finally {
    reminding.value = false
  }
}
</script>
