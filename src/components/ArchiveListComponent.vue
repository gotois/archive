<template>
  <q-virtual-scroll
    :items="slides"
    separator
    class="col-12"
  >
    <template #default="{ item, index }">
      <q-card
        :key="index"
        class="q-ma-lg"
        flat
        square
        bordered
      >
        <div class="row justify-between q-pa-md">
          <p class="text-h6 text-uppercase text-weight-bold no-margin" :style="checkItemEndTime(item)">{{ item.instrument.name }}</p>
          <p v-if="item.instrument.description" class="text-caption text-grey">{{ item.instrument.description }}</p>
        </div>
        <q-separator v-if="item.object.length"/>
        <q-carousel
          v-if="item.object.length"
          v-model="item._currentSlide"
          transition-prev="slide-right"
          transition-next="slide-left"
          control-color="primary"
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
              <q-img
                class="col"
                fit="contain"
                :ratio="1"
                style="max-height: 400px"
                :src="object.contentUrl"
                loading="lazy"
                decoding="async"
                no-native-menu
              />
            </q-scroll-area>
          </q-carousel-slide>
          <template #control>
            <q-carousel-control
              position="top-right"
              :offset="[18, 18]"
            >
              <q-btn
                round color="white" text-color="primary"
                icon="fullscreen"
                @click="onShowFullImage(item)"
              />
            </q-carousel-control>
            <q-carousel-control
              v-if="nativeShareIsAvailable"
              position="top-left"
              :offset="[18, 18]"
            >
              <q-btn
                round color="white" text-color="primary"
                icon="ios_share"
                @click="onShareFullImage(item)"
              />
            </q-carousel-control>
          </template>
        </q-carousel>
        <q-separator/>
        <q-card-section>
          <p class="text-overline text-orange-9 no-margin">
            {{ showDate(item) }}
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
      <div v-if="paginationCount > 0" class="col-12 q-pa-lg flex flex-center self-end">
        <q-pagination
          v-model="currentPage"
          :max="paginationCount"
          :max-pages="5"
          direction-links
          boundary-numbers
          color="secondary"
          @update:model-value="$emit('onPaginate', currentPage)"
        />
      </div>
    </template>
  </q-virtual-scroll>
</template>

<script lang="ts">
import {defineComponent, PropType, ref, watch} from 'vue'
import {Contract, FormatContract} from 'components/models'
import {showImageInPopup} from '../services/popup'
import {isDateNotOk, formatterDate} from '../services/dateHelper'
import {createPDF} from '../services/pdfHelper'

const nativeShareIsAvailable = ref(!!navigator.share)
const slides = ref([])

function showDate(item: Contract) {
  if (isDateNotOk(item.startTime) || isDateNotOk(item.endTime)) {
    return ''
  }
  return formatterDate.format(item.startTime)  + ' — ' +  formatterDate.format(item.endTime)
}

function checkItemEndTime(item: Contract) {
  if (item.endTime < new Date()) {
    return {
      'text-decoration': 'line-through',
    }
  }
  return {}
}

function onShowFullImage(object: FormatContract) {
  const image = object.object[object._currentSlide - 1]
  showImageInPopup(image)
}

async function onShareFullImage(object: FormatContract) {
  const shareData = await createPDF(object)
  try {
    await navigator.share(shareData)
  } catch (error) {
    console.warn('Sharing failed', error)
  }
}

export default defineComponent({
  name: 'ArchiveListComponent',
  props: {
    paginationCount: {
      type: Number as PropType<number>,
      required: true,
    },
    loading: {
      type: Boolean as PropType<boolean>,
      default: false,
    },
    page: {
      type: Number as PropType<number>,
      required: true,
    },
    contracts: {
      type: Array as PropType<FormatContract[]>,
      required: true,
    },
  },
  emits: ['onPaginate'],
  setup(props /*, { emit } */) {
    watch(() => props.contracts, (newVal => {
      slides.value = newVal
    }))

    return {
      nativeShareIsAvailable,
      slides,
      currentPage: props.page,
      showDate,
      onShareFullImage,
      checkItemEndTime,
      onShowFullImage,
    }
  },
})
</script>
