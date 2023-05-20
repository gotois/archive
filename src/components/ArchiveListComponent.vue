<template>
  <QVirtualScroll :items="items as FormatContract[]" separator>
    <template #default="{ item, index }">
      <QSpace v-if="index > 0" style="height: 20px" />
      <QCard v-show="loading" flat square bordered>
        <QSkeleton type="text" height="80px" class="q-pa-md" />
        <QSkeleton height="400px" class="full-width" square />
        <QCardSection>
          <QSkeleton type="rect" height="50px" />
        </QCardSection>
      </QCard>
      <QCard v-show="!loading" :key="index" flat square bordered>
        <div class="row">
          <div class="column q-pl-md" style="max-width: calc(100% - 45px)">
            <p
              class="full-width q-pt-md text-subtitle1 text-uppercase text-weight-bold no-margin"
              :style="{
                'text-decoration':
                  item.endTime !== null && item.endTime < new Date()
                    ? 'line-through'
                    : '',
              }"
              :class="{
                'q-pb-md': !item.instrument.description,
                'q-pb-none':
                  item.instrument.description && !$q.platform.is.desktop,
                'ellipsis': $q.platform.is.desktop,
              }"
              >{{ item.instrument.name }}
            </p>
            <p
              v-if="item.instrument.description"
              class="full-width text-caption q-pb-md text-grey no-margin"
              >{{ item.instrument.description }}
            </p>
          </div>
          <QSpace />
          <QBtn
            size="md"
            class="q-ml-auto q-mr-auto q-mt-none q-mb-none"
            round
            square
            flat
            icon="more_vert"
          >
            <QMenu transition-show="jump-down" transition-duration="200">
              <QList bordered separator padding>
                <QItem v-close-popup clickable @click="editArchive(item)">
                  <QItemSection side class="text-uppercase">
                    <template v-if="isLoggedIn && item.sameAs">
                      {{ $t('archiveList.editPod') }}
                    </template>
                    <template v-else>
                      {{ $t('archiveList.edit') }}
                    </template>
                  </QItemSection>
                </QItem>
                <QItem v-close-popup clickable @click="removeArchive(item)">
                  <QItemSection side class="text-negative text-uppercase">
                    {{ $t('archiveList.remove') }}
                  </QItemSection>
                </QItem>
              </QList>
            </QMenu>
          </QBtn>
        </div>
        <template v-if="item.object.length">
          <QSeparator />
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
                <QImg
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
                    'border': navProps.active
                      ? '1px solid var(--q-secondary)'
                      : 'none',
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
                  <template
                    v-if="!$q.platform.is.safari && isContentPDF(contentUrl)"
                  >
                    <QIcon
                      name="picture_as_pdf"
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
        <QSeparator />
        <QCardSection>
          <QBtn
            fab-mini
            color="white"
            text-color="primary"
            icon="send"
            class="absolute"
            style="top: 0; left: 18px; transform: translateY(-50%)"
            @click="onSheet(item)"
          >
            <QTooltip>
              {{ $t('archiveList.shareFile') }}
            </QTooltip>
          </QBtn>
          <p class="text-overline text-orange-9 no-margin">
            {{ prettyDate(item) }}
          </p>
          <div class="row items-center">
            <p class="text-black-9 text-weight-light no-margin">
              {{ item.participant.name }}
            </p>
          </div>
        </QCardSection>
      </QCard>
    </template>
    <template v-if="paginationCount > 0" #after>
      <QSeparator class="q-ma-md" />
      <QPagination
        v-model="page"
        :max="paginationCount"
        :max-pages="$q.platform.is.desktop ? 10 : 5"
        :direction-links="paginationCount > 10"
        :boundary-links="$q.platform.is.desktop && paginationCount > 1"
        boundary-numbers
        ellipses
        flat
        active-design="outline"
        color="secondary"
        class="flex flex-center self-end q-mb-md"
        @update:model-value="$emit('onPaginate', page)"
      />
    </template>
  </QVirtualScroll>
</template>

<script lang="ts" setup>
import { PropType, ref, watch } from 'vue'
import {
  useQuasar,
  QSkeleton,
  QBtn,
  QSeparator,
  QSpace,
  QItemSection,
  QIcon,
  QList,
  QTooltip,
  QCardSection,
  QCard,
  QItem,
  QMenu,
  QImg,
  QScrollArea,
  QCarouselSlide,
  QCarouselControl,
  QCarousel,
  QPagination,
  QVirtualScroll,
  copyToClipboard,
  openURL,
} from 'quasar'
import { storeToRefs } from 'pinia'
import useAuthStore from 'stores/auth'
import useContractStore from 'stores/contract'
import usePodStore from 'stores/pod'
import ImageContextMenu from 'components/ImageContextMenu.vue'
import SwipeToClose from 'components/SwipeToClose.vue'
import { FormatContract, ContractTable } from '../types/models'
import { isDateNotOk, formatterDate } from '../helpers/dateHelper'
import { readFilesPromise } from '../helpers/fileHelper'
import createCal from '../helpers/calendarHelper'
import { isContentPDF, isContentHeic } from '../helpers/dataHelper'
import { mailUrl, googleMailUrl } from '../helpers/mailHelper'

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
  page: {
    type: String as PropType<string>,
    required: true,
  },
  contracts: {
    type: Array as PropType<FormatContract[]>,
    required: true,
  },
})

const authStore = useAuthStore()
const contractStore = useContractStore()
const podStore = usePodStore()
const emit = defineEmits(['onPaginate', 'onRemove', 'onEdit'])

const items = ref(props.contracts ?? [])
const page = ref(Number(props.page))
const { isLoggedIn } = storeToRefs(authStore)

watch(
  () => props.page,
  (value) => {
    page.value = Number(value)
  },
)
watch(
  () => props.contracts,
  (newVal) => {
    items.value = newVal
  },
)

function icon(item: FormatContract) {
  if (item._fullscreen) {
    return 'fullscreen_exit'
  } else if (isContentPDF(item.object[item._currentSlide - 1].contentUrl)) {
    return 'open_in_full'
  } else {
    return 'fullscreen'
  }
}

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

function onShowFullImage(object: FormatContract) {
  const { contentUrl } = object.object[object._currentSlide - 1]

  if (isContentPDF(contentUrl)) {
    openURL(contentUrl, undefined, {
      popup: $q.platform.is.desktop ? 1 : null,
      menubar: false,
    })
    return
  }
  object._fullscreen = !object._fullscreen
}

async function shareURl(url: string) {
  try {
    await copyToClipboard(url)
    $q.notify({
      type: 'positive',
      message: 'Ссылка скопирована в буфер обмена',
    })
  } catch (e) {
    console.error(e)
    $q.notify({
      type: 'negative',
      message: 'Ошибка копирования',
    })
  }
}

function onSheet(item: FormatContract) {
  const nativeShareAvailable = typeof navigator.share === 'function'
  const actions = []
  // Group 1 - Share local
  if (item.sameAs) {
    actions.push({
      label: 'Поделиться ссылкой',
      icon: 'link',
      id: 'link',
    })
  }
  if (nativeShareAvailable) {
    actions.push({
      label: 'Поделиться документом',
      icon: $q.platform.is.android ? 'share' : 'ios_share',
      id: 'share',
    })
  }
  // Group 2 - Publish
  if (actions.length) {
    actions.push({})
  }
  actions.push({
    label: 'Скачать ICS',
    icon: 'event',
    color: 'primary',
    id: 'calendar',
  })
  if ($q.platform.is.android) {
    actions.push({
      label: 'Добавить в Google календарь',
      icon: 'event',
      color: 'secondary',
      id: 'google-calendar',
    })
  }
  if (!item.sameAs && isLoggedIn.value) {
    actions.push({
      label: 'Загрузить на POD',
      icon: 'cloud_upload',
      color: 'primary',
      id: 'upload',
    })
  }
  // Group 3 - Message
  if (item.participant.email) {
    actions.push({})
    actions.push({
      label: 'Отправить сообщение',
      icon: 'contact_mail',
      color: 'secondary',
      id: 'mail',
    })
  }

  $q.bottomSheet({
    title: 'Выберите действие',
    grid: !$q.platform.is.mobile,
    class: $q.platform.is.desktop ? 'text-center' : '',
    actions: actions,
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
  }).onOk(async (action: { id: string }) => {
    switch (action.id) {
      case 'share': {
        const icalFile = await createCal(item)
        return shareFile(item.instrument.name, icalFile)
      }
      case 'link': {
        return shareURl(item.sameAs)
      }
      case 'google-calendar': {
        const url = googleMailUrl(item).toString()
        return openURL(url)
      }
      case 'calendar': {
        const file = await createCal(item)
        const [dataURI] = await readFilesPromise([file])
        const link = document.createElement('a')
        link.href = dataURI
        link.setAttribute('download', file.name)
        link.setAttribute('target', '_blank')
        link.click()
        break
      }
      case 'upload': {
        return uploadArchive(item)
      }
      case 'mail': {
        return openURL(mailUrl(item))
      }
    }
  })
}

async function shareFile(title: string, file: File) {
  try {
    await navigator.share({
      title: title,
      files: [file],
    })
  } catch (error) {
    if (error.name === 'AbortError') {
      return
    }
    console.error('Sharing failed', error)
    $q.notify({
      type: 'negative',
      message: 'Произошла ошибка шеринга файла',
    })
  }
}

async function uploadArchive(item: FormatContract) {
  const currentContract = contractStore.contracts.find(
    (c: ContractTable) => String(c.id) === String(item.identifier.value),
  ) as ContractTable

  try {
    await podStore.uploadContract(currentContract)
    $q.notify({
      type: 'positive',
      message: 'Данные записаны на Ваш Pod',
    })
  } catch (error) {
    console.error('Upload failed', error)
    $q.notify({
      type: 'negative',
      message: 'Произошла ошибка записи данных',
    })
  }
}

function editArchive(item: FormatContract) {
  emit('onEdit', item)
}

function removeArchive(item: FormatContract) {
  let message = 'Действительно удалить? Отменить удаление будет невозможно.'
  if (!isLoggedIn.value && item.sameAs) {
    message += '\nВнимание: данные не будут удалены с вашего Pod.'
  }
  $q.notify({
    message: message,
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
<style lang="scss" scoped>
.grabbing {
  cursor: grab;

  :active {
    cursor: grabbing;
  }
}
</style>
