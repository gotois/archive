<template>
  <q-virtual-scroll
    :items="items"
    separator
  >
    <template #default="{ item, index }">
      <q-space v-if="index > 0" style="height: 20px;" />
      <q-card
        v-show="loading"
        flat
        square
        bordered
      >
        <q-skeleton type="text" height="80px" class="q-pa-md" />
        <q-skeleton height="400px" class="window-width" square />
        <q-card-section>
          <q-skeleton type="rect" height="50px" />
        </q-card-section>
      </q-card>
      <q-card
        v-show="!loading"
        :key="index"
        flat
        square
        bordered
      >
        <div class="row justify-between">
          <div class="column q-pa-md wrap" style="width: calc(100% - 45px);">
            <p class="text-h6 text-uppercase text-weight-bold no-margin" :style="checkItemEndTime(item)">{{ item.instrument.name }}</p>
            <p v-if="item.instrument.description" class="text-caption text-grey">{{ item.instrument.description }}</p>
          </div>
          <q-btn
            size="md"
            style="margin: auto 0;"
            round
            flat
            icon="more_vert"
          >
            <q-menu
              transition-show="jump-down"
              transition-hide="jump-up"
            >
              <q-list>
                <q-item v-close-popup clickable @click="removeArchive(item)">
                  <q-item-section>Удалить</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>
        </div>
        <q-separator v-if="item.object.length" />
        <q-carousel
          v-if="item.object.length"
          v-model="item._currentSlide"
          transition-prev="slide-right"
          transition-next="slide-left"
          control-color="secondary"
          :navigation="item.object.length > 1"
          animated
          swipeable
          infinite
        >
          <q-carousel-slide
            v-for="(object, objectIndex) in item.object"
            :key="objectIndex"
            class="no-margin no-padding"
            :name="objectIndex + 1"
          >
            <q-scroll-area class="fit">
              <template v-if="!($q.platform.is.ios || $q.platform.is.ipad || $q.platform.is.safari) && isContentPDF(object.contentUrl)">
                <q-icon name="picture_as_pdf" size="300px" class="absolute-center" color="info"/>
              </template>
              <template v-else>
                <q-img
                  class="col"
                  fit="contain"
                  :ratio="1"
                  style="height: 400px"
                  :src="object.contentUrl"
                  loading="lazy"
                  decoding="async"
                  no-spinner
                  no-native-menu
                />
              </template>
            </q-scroll-area>
          </q-carousel-slide>
          <template #control>
            <q-carousel-control
              position="top-right"
              :offset="[18, 18]"
            >
              <q-btn
                round
                color="white"
                text-color="primary"
                icon="fullscreen"
                @click="onShowFullImage(item)"
              >
                <q-tooltip>
                  Открыть файл в полном размере
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
                  Поделиться документом
                </q-tooltip>
              </q-btn>
            </q-carousel-control>
          </template>
        </q-carousel>
        <q-separator/>
        <q-card-section>
          <p class="text-overline text-orange-9 no-margin">
            {{ prettyDate(item) }}
          </p>
          <q-space/>
          <div class="row items-center">
            <p class="text-black text-weight-light no-margin">
              {{ item.participant.name }}
            </p>
          </div>
        </q-card-section>
      </q-card>
    </template>
    <template #after>
      <div v-if="paginationCount > 0" class="q-pa-lg flex flex-center self-end">
        <q-pagination
          v-model="currentPage"
          :max="paginationCount"
          :max-pages="$q.platform.is.desktop ? 10 : 5"
          direction-links
          boundary-numbers
          color="secondary"
          @update:model-value="$emit('onPaginate', currentPage)"
        />
      </div>
    </template>
  </q-virtual-scroll>
</template>

<script lang="ts" setup>
import {PropType, ref, computed, watch} from 'vue'
import {useQuasar} from 'quasar'
import {Contract, FormatContract} from '../types/models'
import {showImageInPopup, showPDFInPopup} from '../services/popup'
import {isDateNotOk, formatterDate} from '../services/dateHelper'
import {createPDF} from '../services/pdfHelper'

const $q = useQuasar()

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

const emit = defineEmits(['onPaginate', 'onRemove'])

const items = ref([])
const currentPage = ref(1)
const nativeShareAvailable = ref(typeof navigator.share === 'function')

watch(() => props.contracts, (newVal => {
  items.value = newVal
}))

function prettyDate(item: Contract) {
  if (!isDateNotOk(item.startTime) && (item.endTime === null || item.endTime === undefined)) {
    return formatterDate.format(item.startTime)
  }
  if (isDateNotOk(item.startTime) || isDateNotOk(item.endTime)) {
    return ''
  }
  return formatterDate.format(item.startTime)  + ' — ' +  formatterDate.format(item.endTime)
}

function checkItemEndTime(item: Contract) {
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
    await showPDFInPopup(image)
    return
  }

  showImageInPopup(image)
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

function removeArchive(item: FormatContract) {
  $q.notify({
    message: 'Действительно удалить? Изменения нельзя отменить',
    type: 'warning',
    position: 'center',
    timeout: 7500,
    closeBtn: true,
    attrs: {
      role: 'alertdialog',
    },
    actions: [
      {
        label: 'Удалить',
        color: 'negative',
        handler: () => {
          emit('onRemove', item)
        },
      },
    ],
  })
}
</script>
