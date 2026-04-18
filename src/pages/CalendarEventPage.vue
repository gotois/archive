<template>
  <QPage :class="$q.dark.isActive ? 'bg-transparent' : 'bg-grey-1'">
    <QScrollArea visible class="absolute-full fit">
      <QPullToRefresh class="absolute-full fit" @refresh="onRefresh">
        <QCard
          draggable="false"
          flat
          square
          bordered
          :style="{
            'max-width': $q.platform.is.desktop ? '720px' : '600px',
          }"
          class="q-pa-md q-ml-auto q-mr-auto q-mt-md q-mb-md"
        >
          <CalendarEventFormComponent
            v-if="task"
            :task="(task as any)"
            :readonly="isViewMode"
            :task-id="props.taskId"
            @saved="onSaved"
            @removed="onRemoved"
          />
        </QCard>
        <QSpace class="q-pb-xs" />
      </QPullToRefresh>
    </QScrollArea>
  </QPage>
</template>
<script lang="ts" setup>
import { defineAsyncComponent, h, ref, computed, onMounted } from 'vue'
import {
  useQuasar,
  useMeta,
  QPage,
  QSpace,
  QSkeleton,
  QPullToRefresh,
  QCard,
  QScrollArea,
} from 'quasar'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ROUTE_NAMES } from '../router/routes'

const CalendarEventFormComponent = defineAsyncComponent({
  loader: () => import('components/CalendarEventFormComponent.vue'),
  delay: 0,
  loadingComponent: h(QSkeleton, { style: { height: '460px' } }),
})

const props = defineProps<{
  taskId: string
}>()

const $q = useQuasar()
const $t = useI18n().t
const router = useRouter()
const route = useRoute()

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const task = ref<Record<string, any> | null>(null)

const isViewMode = computed(() => route.name === ROUTE_NAMES.VIEW)

const metaData = {
  'title': $t('pages.calendar.title'),
  'og:title': $t('pages.calendar.title'),
}

async function loadTask() {
  const request = await fetch(process.env.server + `/tasks/${props.taskId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    credentials: 'include',
  });
  if (!request.ok) {
    throw new Error('Unable to load task')
  }
  const result = await request.json()

  task.value = {
    id_task: result.id_task,
    name: result.name,
    description: result.description,
    start_date: result.start_date,
    end_date: result.end_date,
    location: result.location,
    link_meeting: result.link_meeting,
    priority: result.priority,
  }
}

async function onRefresh(done: () => void) {
  try {
    await loadTask()
  } catch (err) {
    console.error(err)
  } finally {
    done()
  }
}

function onSaved() {
  $q.notify({ type: 'positive', message: 'Сохранено' })
}

async function onRemoved() {
  $q.notify({ type: 'positive', message: 'Удалено' })
  await router.push({ path: '/', replace: true })
}

onMounted(async () => {
  $q.loading.show()
  try {
    await loadTask()
  } catch (error: unknown) {
    console.error(error)
    $q.notify({
      type: 'negative',
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      message: (error as Error)?.message ?? 'Ошибка загрузки',
    })
    await router.push({ path: '/', replace: true })
  } finally {
    $q.loading.hide()
  }
})

useMeta(metaData)
</script>



