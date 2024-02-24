<template>
  <QCarousel
    v-model="currentSlide"
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
      <div class="q-pa-md non-selectable">
        <QIcon
          v-if="
            [PDF_MIME_TYPE].includes(
              item.object[navProps.index].encodingFormat,
            )
          "
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
            'image-rendering': 'optimizeSpeed',
          }"
          :src="item.object[navProps.index].contentUrl"
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
      v-for="(
        { contentUrl, encodingFormat, caption = '' }, objectIndex
      ) in item.object"
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
              encodingFormat === PDF_MIME_TYPE
            "
          >
            <object
              name="picture_as_pdf"
              :data="contentUrl"
              :type="PDF_MIME_TYPE"
              :style="{
                width: '100%',
                height: fullscreen ? '100dvh' : '400px',
              }"
            ></object>
          </template>
          <template v-else-if="encodingFormat === 'image/heic'">
            <QIcon
              name="perm_media"
              size="240px"
              class="text-center full-width"
              :style="{
                height: '400px',
              }"
              :class="{
                grabbing: item.object.length > 1,
              }"
              color="info"
            >
              <ImageContextMenu
                v-if="!fullscreen"
                :image="item.object[objectIndex]"
              />
            </QIcon>
          </template>
          <template v-else>
            <QImg
              class="col"
              fit="contain"
              :height="fullscreen ? '100dvh' : '400px'"
              :ratio="1"
              :src="contentUrl"
              :loading="fullscreen ? 'eager' : 'lazy'"
              :decoding="fullscreen ? 'sync' : 'async'"
              :class="{
                grabbing: item.object.length > 1,
              }"
              fetchpriority="high"
              no-spinner
              no-native-menu
              no-transition
              :draggable="false"
              :alt="caption ?? 'Document'"
              :placeholder-src="caption"
              @load="
                encodingFormat !== PDF_MIME_TYPE
                  ? prominentBGColors()
                  : null
              "
              @mouseleave="onShowCaption"
              @mouseenter="onHideCaption"
            >
              <div v-if="caption.length" class="absolute-top-left text-caption">
                {{ caption }}
              </div>
              <ImageContextMenu
                v-if="!fullscreen"
                :image="item.object[objectIndex]"
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
          :icon="icon(item.object[currentSlide - 1].encodingFormat)"
          @click="onShowFullImage(item)"
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
import { ref, toRef } from 'vue'
import {
  QBtn,
  QSkeleton,
  QIcon,
  QTooltip,
  QImg,
  QScrollArea,
  QCarouselSlide,
  QCarouselControl,
  QCarousel,
  Platform,
} from 'quasar'
import analyze from 'rgbaster'
import ImageContextMenu from 'components/ImageContextMenu.vue'
import SwipeToClose from 'components/SwipeToClose.vue'
import { FormatContract } from '../types/models'
import { open } from '../helpers/urlHelper'
import { PDF_MIME_TYPE } from '../helpers/mimeTypes'

interface Props {
  model: FormatContract
}

const props = defineProps<Props>()

const item = toRef<FormatContract>(props, 'model')
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

function icon(encodingFormat: string) {
  if (fullscreen.value) {
    return 'fullscreen_exit'
  } else if (Platform.is.safari && encodingFormat === PDF_MIME_TYPE) {
    return 'open_in_full'
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
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument,@typescript-eslint/no-unsafe-member-access
  color.value = await getColorFromImage(
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument,@typescript-eslint/no-unsafe-member-access
    item.value.object[currentSlide.value - 1].contentUrl,
  )
}

function onShowFullImage(object: FormatContract) {
  const { contentUrl, encodingFormat } = object.object[currentSlide.value - 1]

  if (Platform.is.safari && encodingFormat === PDF_MIME_TYPE) {
    return open(contentUrl)
  }
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
