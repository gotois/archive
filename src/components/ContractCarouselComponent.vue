<template>
  <QCarousel
    v-model="item._currentSlide"
    v-model:fullscreen="item._fullscreen"
    transition-prev="slide-right"
    transition-next="slide-left"
    control-color="secondary"
    :navigation="!item._fullscreen && item.object.length > 1"
    :arrows="$q.platform.is.desktop && item.object.length > 1"
    animated
    swipeable
    infinite
  >
    <template #navigation-icon="navProps">
      <div class="q-pa-md non-selectable">
        <QIcon
          v-if="isContentPDF(item.object[navProps.index].contentUrl)"
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
      v-for="({ contentUrl }, objectIndex) in item.object"
      :key="objectIndex"
      class="no-margin no-padding"
      :name="objectIndex + 1"
    >
      <QScrollArea class="absolute-full fit">
        <SwipeToClose
          :disabled="!item._fullscreen"
          @on-close="item._fullscreen = false"
        >
          <template v-if="!$q.platform.is.safari && isContentPDF(contentUrl)">
            <object
              name="picture_as_pdf"
              class="absolute-center"
              :data="contentUrl"
              type="application/pdf"
              style="width: 100%; height: 400px"
            ></object>
          </template>
          <template v-else-if="isContentHeic(contentUrl)">
            <QIcon
              name="perm_media"
              size="240px"
              class="absolute-center"
              :class="{
                grabbing: item.object.length > 1,
              }"
              color="info"
            >
              <ImageContextMenu
                v-if="!item._fullscreen"
                :content-url="contentUrl"
              />
            </QIcon>
          </template>
          <template v-else>
            <QImg
              class="col"
              alt="Document"
              fit="contain"
              :height="item._fullscreen ? '100dvh' : '400px'"
              :ratio="1"
              :src="contentUrl"
              :loading="item._fullscreen ? 'eager' : 'lazy'"
              :decoding="item._fullscreen ? 'sync' : 'async'"
              :class="{
                grabbing: item.object.length > 1,
              }"
              fetchpriority="high"
              no-spinner
              no-native-menu
            >
              <ImageContextMenu
                v-if="!item._fullscreen"
                :content-url="contentUrl"
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
          :icon="icon(item)"
          @click="onShowFullImage(item)"
        >
          <QTooltip v-if="item._fullscreen">
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
import { ref } from 'vue'
import {
  QBtn,
  QIcon,
  QTooltip,
  QImg,
  QScrollArea,
  QCarouselSlide,
  QCarouselControl,
  QCarousel,
  Platform,
  openURL,
} from 'quasar'
import ImageContextMenu from 'components/ImageContextMenu.vue'
import SwipeToClose from 'components/SwipeToClose.vue'
import { isContentPDF, isContentHeic } from '../helpers/dataHelper'
import { FormatContract } from '../types/models'

interface Props {
  model: FormatContract
}

const props = defineProps<Props>()

const item = ref<FormatContract | null>(props.model)

function icon(item: FormatContract) {
  if (item._fullscreen) {
    return 'fullscreen_exit'
  } else if (isContentPDF(item.object[item._currentSlide - 1].contentUrl)) {
    return 'open_in_full'
  } else {
    return 'fullscreen'
  }
}

function onShowFullImage(object: FormatContract) {
  const { contentUrl } = object.object[object._currentSlide - 1]

  if (isContentPDF(contentUrl)) {
    openURL(contentUrl, undefined, {
      popup: Platform.is.desktop ? 1 : null,
      menubar: false,
    })
    return
  }
  object._fullscreen = !object._fullscreen
}
</script>
<style lang="scss" scoped>
.grabbing {
  cursor: grab;

  :active {
    cursor: grabbing;
  }
}
</style>
