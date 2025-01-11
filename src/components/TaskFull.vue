<template>
  <QCard flat square bordered>
    <div class="row">
      <div class="column q-pl-md q-pb-sm" style="max-width: calc(100% - 45px)">
        <p
          class="full-width q-pt-md text-subtitle1 text-uppercase text-weight-bold no-margin"
          :class="{
            'q-pb-md': !description,
            'q-pb-none': description && !$q.platform.is.desktop,
            'ellipsis': $q.platform.is.desktop,
          }"
        >
<!--          TODO теперь функция верификации должна проводиться на сервере -->
<!--          <template v-if="isVerified(item, publicKey)">
            <QIcon name="verified" />
          </template>
          <template v-else>
            <QIcon name="error" color="warning" />
          </template>-->
          {{ title }}
          <QTooltip>{{ title }}</QTooltip>
        </p>
        <div
          v-if="description"
          class="full-width text-caption q-pb-md text-grey no-margin"
          v-html="parse(description)"
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
            <QItem v-close-popup clickable @click="emit('onEdit')">
              <QItemSection side>
                <QItemLabel v-if="isLoggedIn && sameAs" overline caption>
                  {{ $t('archiveList.pod') }}
                </QItemLabel>
                <QItemLabel class="text-uppercase">
                  {{ $t('archiveList.edit') }}
                </QItemLabel>
              </QItemSection>
            </QItem>
            <QItem v-close-popup clickable @click="emit('onRemove')">
              <QItemSection side>
                <QItemLabel v-if="isLoggedIn && sameAs" overline caption>
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
    <template v-if="attaches.length">
      <QSeparator />
      <ContractCarouselComponent :model="attaches" />
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
        @click="onSheet()"
      >
        <QTooltip>
          {{ $t('archiveList.shareFile') }}
        </QTooltip>
      </QBtn>
      <div class="flex content-center text-overline no-margin q-pt-sm">
        <QIcon
          style="align-self: center"
          class="q-pr-xs"
          :name="itemScheduled(endTime) ? 'history_toggle_off' : 'schedule'"
          :color="itemScheduled(endTime) ? 'negative' : 'orange-9'"
        />
        <span
          :class="itemScheduled(endTime) ? 'text-negative' : 'text-orange-9'"
        >
          {{ prettyDate(startTime, endTime) }}
        </span>
      </div>
      <div class="row items-center">
        <div
          class="absolute overflow-hidden text-left ellipsis"
          style="left: 32px; right: 0"
        >
          <QIcon :name="itemIsOrganization() ? 'group' : 'face'" />
          {{ link }}
          {{ sameAs }}
        </div>
      </div>
      <div style="overflow-x: hidden" class="scroll-y">
        <QChip
          v-for="([name, value], objectKey) in getArchiveNames"
          :key="objectKey"
          :dense="$q.platform.is.desktop"
          square
          outline
          class="row"
          style="max-width: calc(100% - 8px)"
          :ripple="false"
          :disable="router.currentRoute.value.query.name === name"
          :selected="router.currentRoute.value.query.name === name"
          :color="value.recommendation ? 'orange' : ''"
          :clickable="value.count > 0"
          :removable="value.recommendation"
          @remove="onRemoveArchiveName(name as string)"
          @click="onSelectArchiveName(name, value)"
        >
          <QAvatar
            v-if="value.count > 1"
            :color="$q.dark.isActive ? 'white' : 'dark'"
            :text-color="$q.dark.isActive ? 'dark' : 'white'"
            square
          >
            {{ value.count }}
          </QAvatar>
          <div class="ellipsis">{{ name }}</div>
          <QTooltip>{{ name }}</QTooltip>
        </QChip>
        <QSkeleton
          v-show="getArchiveNames.length === 0"
          type="QChip"
          animation="blink"
          width="100%"
        />
      </div>
    </QCardSection>
  </QCard>
</template>
<script lang="ts" setup>
import { PropType } from 'vue'
import { useRouter } from 'vue-router'
import {
  uid,
  useQuasar,
  QSkeleton,
  QAvatar,
  QChip,
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
  copyToClipboard,
} from 'quasar'
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'
import * as vc from '@digitalbazaar/vc'
import useAuthStore from 'stores/auth'
import useWalletStore from 'stores/wallet'
import ContractCarouselComponent from 'components/ContractCarouselComponent.vue'
import useLangStore from 'stores/lang'
import { parse } from '../helpers/markdownHelper'
import { isDateNotOk } from '../helpers/dateHelper'
import { readFilesPromise, fileShare, canShare } from '../helpers/fileHelper'
import { createCal, googleCalendarUrl } from '../helpers/calendarHelper'
import { mailUrl } from '../helpers/mailHelper'
import { open } from '../helpers/urlHelper'
import { openMap } from '../services/geoService'
import useContractStore from 'stores/contract'
import { TELEGRAM_MINI_APPS_URL } from '../services/telegram'
import { FormatImageType, Place, Presentation } from '../types/models'
import { ROUTE_NAMES } from '../router/routes'
import { keyPair } from '../services/databaseService'
import { documentLoader } from '../helpers/customLoaders'

const router = useRouter()
const contractStore = useContractStore()

const { getArchiveNames } = storeToRefs(contractStore)

const emit = defineEmits(['onRemove', 'onEdit'])
const props = defineProps({
  attaches: {
    type: Array as PropType<FormatImageType[]>,
    default: () => [],
  },
  startTime: {
    type: Date as PropType<Date>,
    required: true,
  },
  endTime: {
    type: Date as PropType<Date>,
    default: null,
  },
  title: {
    type: String as PropType<string>,
    required: true,
  },
  description: {
    type: String as PropType<string>,
    default: '',
  },
  sameAs: {
    type: String as PropType<string>,
    default: '',
  },
  location: {
    type: Object as PropType<Place>,
    default: null,
  },
  email: {
    type: String as PropType<string>,
    default: '',
  },
  telephone: {
    type: String as PropType<string>,
    default: '',
  },
  link: {
    type: String as PropType<string>,
    default: '',
  },
})

const $q = useQuasar()
const i18n = useI18n()
const walletStore = useWalletStore()
const authStore = useAuthStore()
const langStore = useLangStore()
const $t = i18n.t

const { isLoggedIn } = storeToRefs(authStore)
const { publicKey } = storeToRefs(walletStore)

function itemScheduled(endTime: Date) {
  return endTime !== null && endTime < new Date()
}

function prettyDate(startTime: Date, endTime?: Date) {
  const formatterDate = new Intl.DateTimeFormat(langStore.language, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
  if (!isDateNotOk(startTime) && (endTime === null || endTime === undefined)) {
    return formatterDate.format(startTime)
  }
  if (isDateNotOk(startTime) || isDateNotOk(endTime)) {
    return ''
  }
  return formatterDate.format(startTime) + ' — ' + formatterDate.format(endTime)
}

function onSheet() {
  let actions: SheetAction[] = []
  const group1 = [] // Share local
  if (canShare) {
    group1.push({
      label: $t('components.archiveList.sheet.share.label'),
      icon: $q.platform.is.android ? 'share' : 'ios_share',
      color: 'info',
      id: Action.SHARE,
    })
  }
  group1.push({
    label: $t('components.archiveList.sheet.event.native.label'),
    icon: 'event',
    color: 'info',
    id: Action.CALENDAR,
  })
  if (group1.length) {
    actions = actions.concat(group1)
    actions.push({})
  }
  const group2 = [] // Publish Group
  if (props.sameAs) {
    group2.push({
      label: $t('components.archiveList.sheet.link.label'),
      icon: 'link',
      color: 'primary',
      id: Action.LINK,
    })
  }
  if ($q.platform.is.android) {
    group2.push({
      label: $t('components.archiveList.sheet.event.google.label'),
      icon: 'event',
      color: 'secondary',
      id: Action.GOOGLE_CALENDAR,
    })
  }
  if (group2.length) {
    actions = actions.concat(group2)
    actions.push({})
  }
  const group3 = [] // Message Group
  if (props.email || props.telephone) {
    if (props.email) {
      group3.push({
        label: $t('components.archiveList.sheet.mail.label'),
        icon: 'contact_mail',
        color: 'secondary',
        id: Action.MAIL,
      })
    }
    if (props.telephone) {
      group3.push({
        label: $t('components.archiveList.sheet.telephone.label'),
        icon: 'call',
        color: 'secondary',
        id: Action.TELEPHONE,
      })
    }
    // if (isVerified(item, publicKey.value)) {
    //   group3.push({
    //     label: $t('components.archiveList.sheet.law.label'),
    //     icon: 'gavel',
    //     color: 'secondary',
    //     id: Action.LAW,
    //   })
    // }
  }
  if (props.location && Object.keys(props.location).length > 0) {
    group3.push({
      label: $t('components.archiveList.sheet.map.label'),
      icon: 'map',
      color: 'secondary',
      id: Action.MAP,
    })
  }
  if (group3.length) {
    actions = actions.concat(group3)
  }
  // const icalId = $t('organization.prodid')

  $q.bottomSheet({
    title: $t('components.archiveList.sheet.title'),
    grid: !$q.platform.is.mobile,
    class: $q.platform.is.desktop ? 'text-center' : '',
    actions: actions,
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
  }).onOk((action: { id: SheetAction }) => {
    switch (action.id) {
      case Action.SHARE: {
        console.warn('WIP Action.SHARE: поддержать создание календаря')
        // const icalFile = createCal(icalId, item)
        // return shareFile(props.title, icalFile)
        break
      }
      case Action.LINK: {
        const shareLink = window.location.origin + '/sign?from=' + props.sameAs
        return shareURL(shareLink)
      }
      case Action.GOOGLE_CALENDAR: {
        const url = googleCalendarUrl(
          props.title,
          props.description,
          props.startTime,
          props.endTime,
          props.sameAs,
        ).toString()
        return open(url)
      }
      case Action.CALENDAR: {
        console.warn('WIP Action.CALENDAR: поддержать создание календаря')
        // const file = createCal(icalId, item)
        // return saveIcal(file)
        break
      }
      case Action.MAIL: {
        return open(mailUrl(props.email, props.title, props.sameAs))
      }
      case Action.TELEPHONE: {
        return open(props.telephone)
      }
      case Action.LAW: {
        return sendToCourt()
      }
      case Action.MAP: {
        return openMap(props.location)
      }
      default: {
        console.warn('Unknown id')
        break
      }
    }
  })
}

enum Action {
  LINK = 'link',
  SHARE = 'share',
  CALENDAR = 'calendar',
  GOOGLE_CALENDAR = 'google-calendar',
  MAIL = 'mail',
  TELEPHONE = 'telephone',
  LAW = 'law',
  MAP = 'map',
}

type SheetAction = {
  label?: string
  icon?: string
  color?: string
  id?: Action
}

function sendToCourt() {
  console.warn('This functionality is under development.')
  open(TELEGRAM_MINI_APPS_URL)
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

function itemIsOrganization() {
  // todo - нужно прокидывать тип через props
  return true
}

function onRemoveArchiveName(name: string) {
  contractStore.removeContractName(name)
}

async function onSelectArchiveName(
  name: string,
  value: { count: number; recommendation: boolean },
) {
  if (value.count === 0) {
    return
  }
  await router.push({
    name: ROUTE_NAMES.FILTER,
    query: {
      name: name,
      page: 1,
    },
  })
}
</script>
