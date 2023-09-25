<template>
  <QVirtualScroll :items-fn="getItems" :items-size="limit" separator>
    <template
      #default="{ item, index }: { item: FormatContract; index: number }"
    >
      <QCard
        :key="index"
        flat
        square
        bordered
        :class="{
          'q-mt-md': index > 0,
        }"
      >
        <div class="row">
          <div
            class="column q-pl-md q-pb-sm"
            style="max-width: calc(100% - 45px)"
          >
            <p
              class="full-width q-pt-md text-subtitle1 text-uppercase text-weight-bold no-margin"
              :class="{
                'q-pb-md': !item.instrument.description,
                'q-pb-none':
                  item.instrument.description && !$q.platform.is.desktop,
                'ellipsis': $q.platform.is.desktop,
              }"
            >
              <template v-if="isVerified(item, publicKey)">
                <QIcon name="verified" />
              </template>
              <template v-else>
                <QIcon name="error" color="warning" />
              </template>
              {{ item.instrument.name }}
              <QTooltip>{{ item.instrument.name }}</QTooltip>
            </p>
            <div
              v-if="item.instrument.description"
              class="full-width text-caption q-pb-md text-grey no-margin"
              v-html="parse(item.instrument.description)"
            ></div>
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
          <div class="flex content-center text-overline no-margin q-pt-sm">
            <QIcon
              style="align-self: center"
              class="q-pr-xs"
              :name="itemScheduled(item) ? 'history_toggle_off' : 'schedule'"
              :color="itemScheduled(item) ? 'negative' : 'orange-9'"
            />
            <span
              :class="itemScheduled(item) ? 'text-negative' : 'text-orange-9'"
            >
              {{ prettyDate(item) }}
            </span>
          </div>
          <div class="row items-center">
            <QBtn
              class="text-weight-light no-margin full-width"
              dense
              no-caps
              flat
              :icon="itemIsOrganization(item) ? 'group' : 'face'"
              size="xm"
              align="left"
              :ripple="false"
              text-color="black-9"
              :label="item.participant.name"
              :href="item.participant.url"
            />
          </div>
        </QCardSection>
      </QCard>
    </template>
    <template v-if="paginationCount > 0" #after>
      <QSeparator class="q-ma-md" />
      <QPagination
        v-model.number="page"
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
import { PropType, ref, toRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  useQuasar,
  QBtn,
  QIcon,
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
} from 'quasar'
import { storeToRefs } from 'pinia'
import useAuthStore from 'stores/auth'
import useContractStore from 'stores/contract'
import usePodStore from 'stores/pod'
import useWalletStore from 'stores/wallet'
import ContractCarouselComponent from 'components/ContractCarouselComponent.vue'
import { FormatContract, ContractTable } from '../types/models'
import { isDateNotOk, formatterDate } from '../helpers/dateHelper'
import { parse } from '../helpers/markdownHelper'
import { readFilesPromise, fileShare } from '../helpers/fileHelper'
import createCal from '../helpers/calendarHelper'
import { mailUrl, googleMailUrl } from '../helpers/mailHelper'
import { isVerified } from '../helpers/contractHelper'
import { open } from '../helpers/urlHelper'

const $q = useQuasar()
const $t = useI18n().t

const props = defineProps({
  paginationCount: {
    type: Number as PropType<number>,
    required: true,
  },
  limit: {
    type: Number as PropType<number>,
    required: true,
  },
  page: {
    type: Number as PropType<number>,
    required: true,
  },
  contracts: {
    type: Array as PropType<FormatContract[]>,
    required: true,
  },
})
const emit = defineEmits(['onPaginate', 'onRemove', 'onEdit'])
const authStore = useAuthStore()
const contractStore = useContractStore()
const podStore = usePodStore()
const walletStore = useWalletStore()

const contracts = toRef(props, 'contracts', [])
const page = ref(props.page)
const { publicKey } = storeToRefs(walletStore)
const { isLoggedIn } = storeToRefs(authStore)

watch(
  () => props.page,
  (value) => {
    page.value = value
  },
)

function itemScheduled(item: FormatContract) {
  return item.endTime !== null && item.endTime < new Date()
}

function itemIsOrganization(item: FormatContract) {
  return item.participant['@type'] === 'https://schema.org/Organization'
}

function getItems(from: number, size: number): FormatContract[] {
  return contracts.value.slice(from, size)
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

async function shareURL(url: string) {
  try {
    await copyToClipboard(url)
    $q.notify({
      type: 'positive',
      message: $t('components.archiveList.sheet.link.success'),
    })
  } catch (error) {
    console.error(error)
    $q.notify({
      type: 'negative',
      message: $t('components.archiveList.sheet.link.fail'),
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
  TELEPHONE = 'telephone',
  LAW = 'law',
}

function onSheet(item: FormatContract) {
  const nativeShareAvailable = typeof navigator.share === 'function'
  const actions = []
  // Group 1 - Share local
  if (item.sameAs) {
    actions.push({
      label: $t('components.archiveList.sheet.link.label'),
      icon: 'link',
      id: SheetAction.LINK,
    })
  }
  if (nativeShareAvailable) {
    actions.push({
      label: $t('components.archiveList.sheet.share.label'),
      icon: $q.platform.is.android ? 'share' : 'ios_share',
      id: SheetAction.SHARE,
    })
  }
  // Group 2 - Publish
  if (actions.length) {
    actions.push({})
  }
  actions.push({
    label: $t('components.archiveList.sheet.event.native.label'),
    icon: 'event',
    color: 'primary',
    id: SheetAction.CALENDAR,
  })
  if ($q.platform.is.android) {
    actions.push({
      label: $t('components.archiveList.sheet.event.google.label'),
      icon: 'event',
      color: 'secondary',
      id: SheetAction.GOOGLE_CALENDAR,
    })
  }
  if (!item.sameAs && isLoggedIn.value) {
    actions.push({
      label: $t('components.archiveList.sheet.upload.label'),
      icon: 'cloud_upload',
      color: 'primary',
      id: SheetAction.UPLOAD,
    })
  }
  // Group 3 - Message
  if (item.participant.email || item.participant.telephone) {
    actions.push({})
    if (item.participant.email) {
      actions.push({
        label: $t('components.archiveList.sheet.mail.label'),
        icon: 'contact_mail',
        color: 'secondary',
        id: SheetAction.MAIL,
      })
    }
    if (item.participant.telephone) {
      actions.push({
        label: $t('components.archiveList.sheet.telephone.label'),
        icon: 'call',
        color: 'secondary',
        id: SheetAction.TELEPHONE,
      })
    }
    if (isVerified(item, publicKey.value)) {
      actions.push({
        label: $t('components.archiveList.sheet.law.label'),
        icon: 'gavel',
        color: 'secondary',
        id: SheetAction.LAW,
      })
    }
  }
  const icalId = $t('organization.prodid')

  $q.bottomSheet({
    title: $t('components.archiveList.sheet.title'),
    grid: !$q.platform.is.mobile,
    class: $q.platform.is.desktop ? 'text-center' : '',
    actions: actions,
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
  }).onOk(async (action: { id: SheetAction }) => {
    switch (action.id) {
      case SheetAction.SHARE: {
        const icalFile = await createCal(icalId, item)
        return shareFile(item.instrument.name, icalFile)
      }
      case SheetAction.LINK: {
        return shareURL(item.sameAs)
      }
      case SheetAction.GOOGLE_CALENDAR: {
        const url = googleMailUrl(item).toString()
        return open(url)
      }
      case SheetAction.CALENDAR: {
        const file = await createCal(icalId, item)
        return saveIcal(file)
      }
      case SheetAction.UPLOAD: {
        return uploadArchive(item)
      }
      case SheetAction.MAIL: {
        return open(mailUrl(item))
      }
      case SheetAction.TELEPHONE: {
        return open(item.participant.telephone)
      }
      case SheetAction.LAW: {
        return sendToCourt()
      }
      default: {
        console.warn('Unknown id')
        break
      }
    }
  })
}

function sendToCourt() {
  console.warn('This functionality is under development.')
  const botName = 'gotois_bot'
  const myAction = 'start'
  open(`https://t.me/${botName}?start=${myAction}`)
}

async function saveIcal(file: File) {
  try {
    const [dataURI] = await readFilesPromise([file])
    const link = document.createElement('a')
    link.href = dataURI
    link.setAttribute('download', file.name)
    link.setAttribute('target', '_blank')
    link.click()
  } catch (error) {
    console.error(error)
    $q.notify({
      type: 'negative',
      message: $t('components.archiveList.sheet.share.fail'),
    })
  }
}

async function shareFile(title: string, file: File) {
  try {
    await fileShare(file, title)
  } catch (error) {
    console.error('Sharing failed', error)
    $q.notify({
      type: 'negative',
      message: $t('components.archiveList.sheet.share.fail'),
    })
  }
}

async function uploadArchive(item: FormatContract) {
  const currentContract = contractStore.contracts.find(
    (c: ContractTable) => String(c.id) === String(item.identifier.value),
  ) as ContractTable // todo поменять тип

  try {
    await podStore.uploadContract(currentContract)
    $q.notify({
      type: 'positive',
      message: $t('components.archiveList.sheet.upload.success'),
    })
  } catch (error) {
    console.error('Uploading failed', error)
    $q.notify({
      type: 'negative',
      message: $t('components.archiveList.sheet.upload.fail'),
    })
  }
}
</script>
