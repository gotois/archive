<template>
  <QVirtualScroll :items="items as FormatContract[]" separator>
    <template
      #default="{ item, index }: { item: FormatContract, index: number }"
    >
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
          <div
            class="column q-pl-md q-pb-sm"
            style="max-width: calc(100% - 45px)"
          >
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
              <QList bordered separator padding :dense="$q.platform.is.desktop">
                <QItem v-close-popup clickable @click="emit('onEdit', item)">
                  <QItemSection side>
                    <QItemLabel
                      v-if="isLoggedIn && item.sameAs"
                      overline
                      caption
                    >
                      {{ $t('archiveList.pod') }}
                    </QItemLabel>
                    <QItemLabel class="text-uppercase">
                      {{ $t('archiveList.edit') }}
                    </QItemLabel>
                  </QItemSection>
                </QItem>
                <QItem v-close-popup clickable @click="emit('onRemove', item)">
                  <QItemSection side>
                    <QItemLabel
                      v-if="isLoggedIn && item.sameAs"
                      overline
                      caption
                    >
                      {{ $t('archiveList.pod') }}
                    </QItemLabel>
                    <QItemLabel class="text-negative text-uppercase">
                      {{ $t('archiveList.remove') }}
                    </QItemLabel>
                  </QItemSection>
                </QItem>
              </QList>
            </QMenu>
          </QBtn>
        </div>
        <template v-if="item.object.length">
          <QSeparator />
          <ContractCarouselComponent :model="item" />
        </template>
        <QSeparator />
        <QCardSection>
          <QBtn
            fab-mini
            color="white"
            text-color="accent"
            icon="send"
            class="absolute"
            style="top: 0; left: 18px; transform: translateY(-50%)"
            @click="onSheet(item)"
          >
            <QTooltip>
              {{ $t('archiveList.shareFile') }}
            </QTooltip>
          </QBtn>
          <p class="text-overline text-orange-9 no-margin q-pt-sm">
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
  QItemLabel,
  QSeparator,
  QSpace,
  QItemSection,
  QList,
  QTooltip,
  QCardSection,
  QCard,
  QItem,
  QMenu,
  QPagination,
  QVirtualScroll,
  copyToClipboard,
  openURL,
} from 'quasar'
import { storeToRefs } from 'pinia'
import useAuthStore from 'stores/auth'
import useContractStore from 'stores/contract'
import usePodStore from 'stores/pod'
import ContractCarouselComponent from 'components/ContractCarouselComponent.vue'
import { FormatContract, ContractTable } from '../types/models'
import { isDateNotOk, formatterDate } from '../helpers/dateHelper'
import { readFilesPromise } from '../helpers/fileHelper'
import createCal from '../helpers/calendarHelper'
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

enum SheetAction {
  LINK = 'link',
  SHARE = 'share',
  CALENDAR = 'calendar',
  GOOGLE_CALENDAR = 'google-calendar',
  UPLOAD = 'upload',
  MAIL = 'mail',
}

function onSheet(item: FormatContract) {
  const nativeShareAvailable = typeof navigator.share === 'function'
  const actions = []
  // Group 1 - Share local
  if (item.sameAs) {
    actions.push({
      label: 'Поделиться ссылкой',
      icon: 'link',
      id: SheetAction.LINK,
    })
  }
  if (nativeShareAvailable) {
    actions.push({
      label: 'Поделиться документом',
      icon: $q.platform.is.android ? 'share' : 'ios_share',
      id: SheetAction.SHARE,
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
    id: SheetAction.CALENDAR,
  })
  if ($q.platform.is.android) {
    actions.push({
      label: 'Добавить в Google календарь',
      icon: 'event',
      color: 'secondary',
      id: SheetAction.GOOGLE_CALENDAR,
    })
  }
  if (!item.sameAs && isLoggedIn.value) {
    actions.push({
      label: 'Загрузить на POD',
      icon: 'cloud_upload',
      color: 'primary',
      id: SheetAction.UPLOAD,
    })
  }
  // Group 3 - Message
  if (item.participant.email) {
    actions.push({})
    actions.push({
      label: 'Отправить сообщение',
      icon: 'contact_mail',
      color: 'secondary',
      id: SheetAction.MAIL,
    })
  }

  $q.bottomSheet({
    title: 'Выберите действие',
    grid: !$q.platform.is.mobile,
    class: $q.platform.is.desktop ? 'text-center' : '',
    actions: actions,
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
  }).onOk(async (action: { id: SheetAction }) => {
    switch (action.id) {
      case SheetAction.SHARE: {
        const icalFile = await createCal(item)
        return shareFile(item.instrument.name, icalFile)
      }
      case SheetAction.LINK: {
        return shareURl(item.sameAs)
      }
      case SheetAction.GOOGLE_CALENDAR: {
        const url = googleMailUrl(item).toString()
        return openURL(url)
      }
      case SheetAction.CALENDAR: {
        const file = await createCal(item)
        const [dataURI] = await readFilesPromise([file])
        const link = document.createElement('a')
        link.href = dataURI
        link.setAttribute('download', file.name)
        link.setAttribute('target', '_blank')
        link.click()
        return
      }
      case SheetAction.UPLOAD: {
        return uploadArchive(item)
      }
      case SheetAction.MAIL: {
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
    console.error('Sharing failed', error)
    if (error.name === 'AbortError') {
      return
    }
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
</script>
<style lang="scss" scoped>
.grabbing {
  cursor: grab;

  :active {
    cursor: grabbing;
  }
}
</style>
