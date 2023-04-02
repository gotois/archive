<template>
  <q-virtual-scroll :items="items as FormatContract[]" separator>
    <template #default="{ item, index }">
      <q-space v-if="index > 0" style="height: 20px" />
      <q-card v-show="loading" flat square bordered>
        <q-skeleton type="text" height="80px" class="q-pa-md" />
        <q-skeleton height="400px" class="full-width" square />
        <q-card-section>
          <q-skeleton type="rect" height="50px" />
        </q-card-section>
      </q-card>
      <q-card v-show="!loading" :key="index" flat square bordered>
        <div class="row">
          <div class="column wrap" style="max-width: calc(100% - 45px)">
            <p
              class="text-h6 q-pt-md q-pl-md q-pr-md text-uppercase text-weight-bold no-margin"
              :style="checkItemEndTime(item)"
              :class="item.instrument.description ? '' : 'q-pb-md'"
              >{{ item.instrument.name }}</p
            >
            <p
              v-if="item.instrument.description"
              class="text-caption q-pl-md q-pb-md text-grey no-margin"
              >{{ item.instrument.description }}</p
            >
          </div>
          <q-space></q-space>
          <q-btn
            size="md"
            class="q-ml-auto q-mr-auto q-mt-none q-mb-none"
            round
            square
            flat
            icon="more_vert"
          >
            <q-menu transition-show="jump-down" transition-duration="200">
              <q-list bordered separator padding>
                <q-item v-close-popup clickable @click="editArchive(item)">
                  <q-item-section side class="text-uppercase">{{
                    $t('archiveList.edit')
                  }}</q-item-section>
                </q-item>
                <q-item
                  v-if="isLoggedIn"
                  v-close-popup
                  clickable
                  @click="uploadArchive(item)"
                >
                  <q-item-section side class="text-uppercase">{{
                    'Загрузить на POD'
                  }}</q-item-section>
                </q-item>
                <q-item v-close-popup clickable @click="removeArchive(item)">
                  <q-item-section side class="text-negative text-uppercase">{{
                    $t('archiveList.remove')
                  }}</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>
        </div>
        <template v-if="item.object.length">
          <q-separator />
          <q-carousel
            v-model="item._currentSlide"
            v-model:fullscreen="fullscreen"
            transition-prev="slide-right"
            transition-next="slide-left"
            control-color="secondary"
            :navigation="!fullscreen && item.object.length > 1"
            :arrows="$q.platform.is.desktop && item.object.length > 1"
            animated
            swipeable
            infinite
          >
            <template #navigation-icon="navProps">
              <q-img
                v-ripple
                width="64px"
                :ratio="1"
                class="q-ml-sm q-mr-sm non-selectable cursor-pointer"
                img-class="rounded-borders bg-white"
                :img-style="{
                  'border': navProps.active
                    ? '1px solid var(--q-secondary)'
                    : '1px solid var(--q-dark)',
                  'image-rendering': 'optimizeSpeed',
                }"
                :src="item.object[navProps.index].contentUrl"
                placeholder-src="/icons/icon-64x64.png"
                decoding="async"
                fetchpriority="low"
                fit="scale-down"
                no-spinner
                no-transition
                no-native-menu
                @click="navProps.onClick"
              />
            </template>
            <q-carousel-slide
              v-for="(object, objectIndex) in item.object"
              :key="objectIndex"
              class="no-margin no-padding"
              :name="objectIndex + 1"
            >
              <q-scroll-area class="absolute-full fit">
                <template
                  v-if="
                    !$q.platform.is.safari && isContentPDF(object.contentUrl)
                  "
                >
                  <q-icon
                    name="picture_as_pdf"
                    size="300px"
                    class="absolute-center"
                    color="info"
                  />
                </template>
                <template v-else>
                  <q-img
                    class="col"
                    fit="contain"
                    :height="fullscreen ? '100dvh' : '400px'"
                    alt="Document"
                    :ratio="1"
                    :src="object.contentUrl"
                    :loading="fullscreen ? 'eager' : 'lazy'"
                    :decoding="fullscreen ? 'sync' : 'async'"
                    fetchpriority="high"
                    no-spinner
                    no-native-menu
                  />
                </template>
              </q-scroll-area>
            </q-carousel-slide>
            <template #control>
              <q-carousel-control position="top-right" :offset="[18, 18]">
                <q-btn
                  round
                  color="white"
                  text-color="primary"
                  :icon="fullscreen ? 'fullscreen_exit' : 'fullscreen'"
                  @click="onShowFullImage(item)"
                >
                  <q-tooltip v-if="fullscreen">
                    {{ $t('archiveList.closeFile') }}
                  </q-tooltip>
                  <q-tooltip v-else>
                    {{ $t('archiveList.openFile') }}
                  </q-tooltip>
                </q-btn>
              </q-carousel-control>
              <q-carousel-control
                v-if="nativeShareAvailable"
                position="top-left"
                :offset="[18, 18]"
              >
                <q-btn
                  round
                  color="white"
                  text-color="primary"
                  :icon="shareIcon"
                  @click="onShareFullImage(item)"
                >
                  <q-tooltip>
                    {{ $t('archiveList.shareFile') }}
                  </q-tooltip>
                </q-btn>
              </q-carousel-control>
            </template>
          </q-carousel>
        </template>
        <q-separator />
        <q-card-section>
          <p class="text-overline text-orange-9 no-margin">
            {{ prettyDate(item) }}
          </p>
          <div class="row items-center">
            <p class="text-black-9 text-weight-light no-margin">
              {{ item.participant.name }}
            </p>
          </div>
        </q-card-section>
      </q-card>
    </template>
    <template v-if="paginationCount > 0" #after>
      <q-pagination
        v-model="currentPage"
        :max="paginationCount"
        :max-pages="$q.platform.is.desktop ? 10 : 5"
        :direction-links="paginationCount > 10"
        boundary-numbers
        ellipses
        flat
        :boundary-links="$q.platform.is.desktop"
        active-design="outline"
        color="secondary"
        class="q-pa-lg flex flex-center self-end"
        @update:model-value="$emit('onPaginate', currentPage)"
      />
    </template>
  </q-virtual-scroll>
</template>

<script lang="ts" setup>
import { PropType, ref, computed, watch } from 'vue'
import { useQuasar } from 'quasar'
import { useStore } from '../store'
import { FormatContract } from '../types/models'
import { showPDFInPopup } from '../services/popup'
import { isDateNotOk, formatterDate } from '../services/dateHelper'
import { createPDF } from '../services/pdfHelper'
import { saveToPod } from '../services/podHelper'

const $q = useQuasar()
const store = useStore()

const props = defineProps({
  paginationCount: {
    type: Number as PropType<number>,
    required: true,
  },
  loading: {
    type: Boolean as PropType<boolean>,
    default: false,
  },
  contracts: {
    type: Array as PropType<FormatContract[]>,
    required: true,
  },
})

const emit = defineEmits(['onPaginate', 'onRemove', 'onEdit'])

const items = ref(props.contracts ?? [])
const fullscreen = ref(false)
// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
const isLoggedIn = computed(() => store.getters['Auth/isLoggedIn'] as boolean)
const currentPage = ref(1)
const nativeShareAvailable = ref(typeof navigator.share === 'function')

watch(
  () => props.contracts,
  (newVal) => {
    items.value = newVal
  },
)

function prettyDate(item: FormatContract) {
  if (
    !isDateNotOk(item.startTime) &&
    (item.endTime === null || item.endTime === undefined)
  ) {
    return formatterDate.format(item.startTime)
  }
  if (isDateNotOk(item.startTime) || isDateNotOk(item.endTime)) {
    return ''
  }
  return (
    formatterDate.format(item.startTime) +
    ' — ' +
    formatterDate.format(item.endTime)
  )
}

function checkItemEndTime(item: FormatContract) {
  if (item.endTime !== null && item.endTime < new Date()) {
    return {
      'text-decoration': 'line-through',
    }
  }
  return {}
}

function isContentPDF(contentUrl: string) {
  return contentUrl.startsWith('data:application/pdf;', 0)
}

async function onShowFullImage(object: FormatContract) {
  const image = object.object[object._currentSlide - 1]

  if (isContentPDF(image.contentUrl)) {
    try {
      await showPDFInPopup(image)
    } catch {
      $q.notify({
        color: 'negative',
        message: 'Невозможно открыть. Проверьте права доступа.',
      })
    }
    return
  }
  fullscreen.value = !fullscreen.value
}

const shareIcon = computed(() => {
  return $q.platform.is.android ? 'share' : 'ios_share'
})

async function onShareFullImage(object: FormatContract) {
  const shareData = await createPDF(object)
  try {
    await navigator.share(shareData)
  } catch (error) {
    console.warn('Sharing failed', error)
  }
}

async function uploadArchive(item: FormatContract) {
  await saveToPod(item)
  $q.notify({
    type: 'positive',
    message: 'Данные записаны на Ваш Pod',
  })
}

function editArchive(item: FormatContract) {
  emit('onEdit', item)
}

function removeArchive(item: FormatContract) {
  $q.notify({
    message: 'Действительно удалить? Отменить изменения будет невозможно.',
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
        label: 'Удалить',
        color: 'warning',
        handler: () => {
          emit('onRemove', item)
        },
      },
      {
        label: 'Отмена',
        color: 'white',
      },
    ],
  })
}
</script>
