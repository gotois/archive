<template>
  <QCarousel
    v-model="currentSlide"
    v-model:fullscreen="fullscreen"
    transition-prev="slide-right"
    transition-next="slide-left"
    control-color="secondary"
    :navigation="!fullscreen && props.model.length > 1"
    :arrows="$q.platform.is.desktop && props.model.length > 1"
    animated
    swipeable
    infinite
  >
    <template #navigation-icon="navProps">
      <div class="q-pa-md non-selectable">
        <QIcon
          v-if="[PDF_MIME_TYPE].includes(props.model[navProps.index].mediaType)"
          name="picture_as_pdf"
          size="64px"
          color="info"
          class="rounded-borders cursor-pointer shadow-box shadow-4"
          :class="{
            'inset-shadow-down': navProps.active,
            'bg-white': !$q.dark.isActive,
            'bg-dark': $q.dark.isActive,
          }"
          :style="{
            border: navProps.active ? '1px solid var(--q-secondary)' : 'none',
          }"
          @click="navProps.onClick"
        />
        <QImg
          v-else
          v-ripple
          width="64px"
          :ratio="1"
          class="rounded-borders cursor-pointer shadow-box shadow-4"
          :class="{
            'inset-shadow-down': navProps.active,
            'bg-white': !$q.dark.isActive,
            'bg-dark': $q.dark.isActive,
          }"
          :img-style="{
            'border': navProps.active ? '1px solid var(--q-secondary)' : 'none',
            'image-rendering': 'high-quality',
          }"
          :src="props.model[navProps.index].url"
          placeholder-src="/icons/icon-128x128.png"
          decoding="async"
          fetchpriority="low"
          fit="scale-down"
          no-spinner
          no-transition
          no-native-menu
          @click="navProps.onClick"
        />
      </div>
    </template>
    <QCarouselSlide
      v-for="({ url, mediaType, name }, objectIndex) in props.model"
      :key="objectIndex"
      class="no-margin no-padding"
      :name="objectIndex + 1"
    >
      <QScrollArea class="absolute-full fit">
        <SwipeToClose
          :disable="!fullscreen"
          :style="{
            'max-height': fullscreen ? '100dvh' : '400px',
            'background-color': color,
          }"
          @on-close="fullscreen = false"
        >
          <QSkeleton
            v-if="$q.loading.isActive"
            type="rect"
            square
            height="400px"
          />
          <template
            v-else-if="
              $q.platform.is.desktop &&
              !$q.platform.is.safari &&
              mediaType === PDF_MIME_TYPE
            "
          >
            <object
              name="picture_as_pdf"
              :data="url"
              :type="PDF_MIME_TYPE"
              :style="{
                width: '100%',
                height: fullscreen ? '100dvh' : '400px',
              }"
            ></object>
          </template>
          <template v-else-if="mediaType === 'image/heic'">
            <QIcon
              name="perm_media"
              size="240px"
              class="text-center full-width"
              :style="{
                height: '400px',
              }"
              :class="{
                grabbing: props.model.length > 1,
              }"
              color="info"
            >
              <ImageContextMenu
                v-if="!fullscreen"
                :image="props.model[objectIndex]"
              />
            </QIcon>
          </template>
          <template v-else>
            <QImg
              class="col"
              fit="contain"
              :height="fullscreen ? '100dvh' : '400px'"
              :ratio="1"
              :src="url"
              :loading="fullscreen ? 'eager' : 'lazy'"
              :decoding="fullscreen ? 'sync' : 'async'"
              :class="{
                grabbing: props.model.length > 1,
              }"
              fetchpriority="high"
              no-spinner
              no-native-menu
              no-transition
              :draggable="false"
              alt="Document"
              placeholder-src="Document"
              @load="prominentBGColors()"
              @mouseleave="onShowCaption"
              @mouseenter="onHideCaption"
            >
              <div v-if="name" class="absolute-top-left text-caption">
                {{ name }}
              </div>
              <ImageContextMenu
                v-if="!fullscreen"
                :image="props.model[objectIndex]"
              />
            </QImg>
          </template>
        </SwipeToClose>
      </QScrollArea>
    </QCarouselSlide>
    <template #control>
      <QCarouselControl position="top-right" :offset="[18, 18]">
        <QBtn
          round
          color="white"
          text-color="primary"
          :icon="icon(fullscreen)"
          @click="onShowFullImage()"
        >
          <QTooltip v-if="fullscreen">
            {{ $t('archiveList.closeFile') }}
          </QTooltip>
          <QTooltip v-else>
            {{ $t('archiveList.openFile') }}
          </QTooltip>
        </QBtn>
      </QCarouselControl>
    </template>
  </QCarousel>
</template>
<script lang="ts" setup>
import { ref, PropType } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  useQuasar,
  QBtn,
  QSkeleton,
  QIcon,
  QTooltip,
  QImg,
  QScrollArea,
  QCarouselSlide,
  QCarouselControl,
  QCarousel,
} from 'quasar'
import analyze from 'rgbaster'
import ImageContextMenu from 'components/ImageContextMenu.vue'
import SwipeToClose from 'components/SwipeToClose.vue'
import { PDF_MIME_TYPE } from '../helpers/mimeTypes'
import type { ImageType } from '../types/models'

const i18n = useI18n()
const $q = useQuasar()
const $t = i18n.t

const props = defineProps({
  model: {
    type: Array as PropType<ImageType[]>,
    required: true,
  },
})

const currentSlide = ref(1)
const fullscreen = ref(false)
const color = ref('white')

async function getColorFromImage(contentUrl: string) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-call
  const [{ color }]: { color: string }[] = await analyze(contentUrl, {
    scale: 0.7,
  })
  return color
}

function icon(fullscreen) {
  if (fullscreen) {
    return 'fullscreen_exit'
  } else {
    return 'fullscreen'
  }
}

function onHideCaption({ target }: { target: HTMLElement }) {
  target.querySelector('.text-caption')?.classList?.remove('invisible')
}

function onShowCaption({ target }: { target: HTMLElement }) {
  target.querySelector('.text-caption')?.classList?.add('invisible')
}

async function prominentBGColors() {
  const { url } = props.model[currentSlide.value - 1]
  color.value = await getColorFromImage(url)
}

function onShowFullImage() {
  fullscreen.value = !fullscreen.value
}
</script>
<style lang="scss" scoped>
.grabbing {
  cursor: grab;

  :active {
    cursor: grabbing;
  }
}
.q-carousel {
  ::selection {
    background: transparent;
  }
}
</style>
