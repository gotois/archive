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
                <QItem
                  v-if="item.sameAs"
                  v-close-popup
                  clickable
                  @click="shareURl(item.sameAs)"
                >
                  <QItemSection side class="text-uppercase"
                    >{{ 'Получить ссылку' }}
                  </QItemSection>
                </QItem>
                <QItem
                  v-if="isLoggedIn && item.sameAs"
                  v-close-popup
                  clickable
                  @click="editArchive(item)"
                >
                  <QItemSection side class="text-uppercase">{{
                    $t('archiveList.editPod')
                  }}</QItemSection>
                </QItem>
                <QItem
                  v-else
                  v-close-popup
                  clickable
                  @click="editArchive(item)"
                >
                  <QItemSection side class="text-uppercase">{{
                    $t('archiveList.edit')
                  }}</QItemSection>
                </QItem>
                <QItem
                  v-if="isLoggedIn && !item.sameAs"
                  v-close-popup
                  clickable
                  @click="uploadArchive(item)"
                >
                  <QItemSection side class="text-uppercase">{{
                    'Загрузить на POD'
                  }}</QItemSection>
                </QItem>
                <QItem v-close-popup clickable @click="removeArchive(item)">
                  <QItemSection side class="text-negative text-uppercase">{{
                    $t('archiveList.remove')
                  }}</QItemSection>
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
                  class="bg-white rounded-borders cursor-pointer shadow-box shadow-4"
                  :class="{
                    'inset-shadow-down': navProps.active,
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
                <template
                  v-if="!$q.platform.is.safari && isContentPDF(contentUrl)"
                >
                  <QIcon
                    name="picture_as_pdf"
                    size="240px"
                    class="absolute-center"
                    color="info"
                  />
                </template>
                <template v-else-if="isContentHeic(contentUrl)">
                  <QIcon
                    name="perm_media"
                    size="240px"
                    class="absolute-center"
                    color="info"
                  />
                </template>
                <template v-else>
                  <QImg
                    class="col"
                    fit="contain"
                    :height="item._fullscreen ? '100dvh' : '400px'"
                    alt="Document"
                    :ratio="1"
                    :src="contentUrl"
                    :loading="item._fullscreen ? 'eager' : 'lazy'"
                    :decoding="item._fullscreen ? 'sync' : 'async'"
                    fetchpriority="high"
                    no-spinner
                    no-native-menu
                  >
                    <QMenu touch-position context-menu>
                      <QList dense style="min-width: 100px">
                        <QItem
                          v-close-popup
                          clickable
                          @click="onWindowOpenImage(contentUrl)"
                        >
                          <QItemSection
                            >Открыть документ в новой вкладке</QItemSection
                          >
                        </QItem>
                        <QSeparator />
                        <QItem
                          v-close-popup
                          clickable
                          @click="onCopy(contentUrl)"
                        >
                          <QItemSection
                            >Скопировать документ в буфер обмена</QItemSection
                          >
                        </QItem>
                      </QList>
                    </QMenu>
                  </QImg>
                </template>
              </QScrollArea>
            </QCarouselSlide>
            <template #control>
              <QCarouselControl position="top-right" :offset="[18, 18]">
                <QBtn
                  round
                  color="white"
                  text-color="primary"
                  :icon="item._fullscreen ? 'fullscreen_exit' : 'fullscreen'"
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
              <QCarouselControl
                v-if="nativeShareAvailable"
                position="top-left"
                :offset="[18, 18]"
              >
                <QBtn
                  round
                  color="white"
                  text-color="primary"
                  :icon="shareIcon"
                  @click="onShareItem(item)"
                >
                  <QTooltip>
                    {{ $t('archiveList.shareFile') }}
                  </QTooltip>
                </QBtn>
              </QCarouselControl>
            </template>
          </QCarousel>
        </template>
        <QSeparator />
        <QCardSection>
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
        v-model="currentPage"
        :max="paginationCount"
        :max-pages="$q.platform.is.desktop ? 10 : 5"
        :direction-links="paginationCount > 10"
        :boundary-links="$q.platform.is.desktop && paginationCount > 1"
        boundary-numbers
        ellipses
        flat
        active-design="outline"
        color="secondary"
        class="flex flex-center self-end"
        @update:model-value="$emit('onPaginate', currentPage)"
      />
    </template>
  </QVirtualScroll>
</template>

<script lang="ts" setup>
import { PropType, ref, computed, watch } from 'vue'
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
  uid,
} from 'quasar'
import { event as createEvent, default as icalendar } from 'ical-browser'
import useAuthStore from 'stores/auth'
import useContractStore from 'stores/contract'
import usePodStore from 'stores/pod'
import { FormatContract, ContractTable } from '../types/models'
import { showPDFInPopup } from '../services/popup'
import { isDateNotOk, formatterDate } from '../services/dateHelper'
import { createPDF } from '../services/pdfHelper'
import { readFilesPromise } from '../services/fileHelper'
import pkg from '../../package.json'

const $q = useQuasar()
const { publisher, productName } = pkg

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

const authStore = useAuthStore()
const contractStore = useContractStore()
const podStore = usePodStore()
const emit = defineEmits(['onPaginate', 'onRemove', 'onEdit'])

const items = ref(props.contracts ?? [])
const currentPage = ref(1)
const nativeShareAvailable = ref(typeof navigator.share === 'function')

const isLoggedIn = computed(() => authStore.isLoggedIn)
const shareIcon = computed(() =>
  $q.platform.is.android ? 'share' : 'ios_share',
)

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

function isContentPDF(contentUrl: string) {
  return contentUrl.startsWith('data:application/pdf;', 0)
}

function isContentHeic(contentUrl: string) {
  return contentUrl.startsWith('data:image/heic;', 0)
}

async function onShowFullImage(object: FormatContract) {
  const { contentUrl } = object.object[object._currentSlide - 1]

  if (isContentPDF(contentUrl)) {
    try {
      await showPDFInPopup(contentUrl)
    } catch {
      $q.notify({
        color: 'negative',
        message: 'Невозможно открыть. Проверьте права доступа.',
      })
    }
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

async function onShareItem(object: FormatContract) {
  const files = await createPDF(object)
  let attach = []
  for (const base64 of await readFilesPromise(files)) {
    attach.push(base64)
  }

  const event = createEvent({
    uid: uid(), // todo нужен идентификатор транзакции на блокчейн
    url: object.sameAs ? new URL(object.sameAs) : null,
    summary: object.instrument.name,
    description: object.instrument.description,
    stamp: new Date(),
    start: object.startTime,
    end: object.endTime,
    attach: attach,
    organizer: [
      {
        name: object.agent.name,
        email: object.agent.email,
      },
    ],
    attendee: [
      {
        name: object.participant.name,
        email: object.participant.email,
      },
    ],
  })
  const file = icalendar(
    '-//' + publisher + '//NONSGML ' + productName + '//EN',
    object.instrument.name,
    event,
  )
  try {
    await navigator.share({
      title: object.instrument.name,
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
  } catch (e) {
    console.error(e)
  }
}

function editArchive(item: FormatContract) {
  emit('onEdit', item)
}

async function onCopy(contentUrl: string) {
  const base64Response = await fetch(contentUrl)
  const blob = await base64Response.blob()
  const clipboardItem = new ClipboardItem({ [blob.type]: blob })
  try {
    await navigator.clipboard.write([clipboardItem])
    $q.notify({
      type: 'positive',
      message: 'Данные сохранены в буфер обмена',
    })
  } catch (e) {
    console.error(e)
    $q.notify({
      type: 'negative',
      message: 'Произошла ошибка',
    })
  }
}

function onWindowOpenImage(contentUrl: string) {
  openURL(contentUrl, undefined, {
    noopener: true,
    noreferrer: true,
    toolbar: false,
    popup: 1,
  })
}

function removeArchive(item: FormatContract) {
  let message = 'Действительно удалить? Отменить изменения будет невозможно.'
  if (!isLoggedIn.value && item.sameAs) {
    message += '\nДанные не будут удалены с вашего Pod.'
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
