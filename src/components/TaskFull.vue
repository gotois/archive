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
          <!-- Todo поддержать проверку на верификацию криптоключом Solana -->
          <template v-if="false /*isVerified(item, publicKey)*/">
            <QIcon name="verified" />
          </template>
          <template v-else>
            <QIcon name="error" color="warning" />
          </template>
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
            <QItem v-close-popup clickable @click="emit('edit')">
              <QItemSection side>
                <QItemLabel v-if="isLoggedIn && sameAs" overline caption>
                  {{ $t('archiveList.pod') }}
                </QItemLabel>
                <QItemLabel class="text-uppercase">
                  {{ $t('archiveList.edit') }}
                </QItemLabel>
              </QItemSection>
            </QItem>
            <QItem v-close-popup clickable @click="emit('remove')">
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
    <template v-if="attaches?.length">
      <QSeparator />
      <ContractCarouselComponent :model="attaches" />
    </template>
    <QSeparator />
    <QCardSection>
      <QBtn
        fab-mini
        color="white"
        text-color="accent"
        icon="add"
        class="absolute"
        style="top: 0; left: 18px; transform: translateY(-50%)"
        @click="onSheet"
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
      <div v-if="organizer" class="row items-center">
        <div
          class="flex overflow-hidden text-left ellipsis"
          style="left: 32px; right: 0"
        >
          <QIcon :name="organizer.type === 'Organization' ? 'group' : 'face'" />
          <div>
            {{ organizer.name }}
            {{ organizer.email }}
          </div>
        </div>
      </div>
      <div v-if="participant?.length" class="row items-center">
        <div
          class="flex overflow-hidden text-left ellipsis"
          style="left: 32px; right: 0"
        >
          <QIcon :name="participant.length > 1 ? 'group' : 'face'" />
          <span
            v-for="({ url, name, email }, index) in participant"
            :key="index"
          >
            {{ name }} {{ url }} {{ email }}
          </span>
        </div>
      </div>
      <div>
        {{ link }}
      </div>
      <div style="overflow-x: hidden" class="scroll-y q-mt-md q-mb-md">
        <QChip
          v-for="(name, objectKey) in tag"
          :key="objectKey"
          :dense="$q.platform.is.desktop"
          square
          outline
          class="row"
          style="max-width: calc(100% - 8px)"
          :ripple="false"
          :color="$q.dark.isActive ? 'white' : 'dark'"
          clickable
          removable
          @remove="onRemoveArchiveName(name)"
          @click="onSelectArchiveName(name)"
        >
          <div class="ellipsis">{{ name }}</div>
          <QTooltip>{{ name }}</QTooltip>
        </QChip>
        <QSkeleton
          v-show="tag.length === 0"
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
import usePodStore from 'stores/pod'
import { WebId, universalAccess } from '@inrupt/solid-client'
// import useWalletStore from 'stores/wallet'
import ContractCarouselComponent from 'components/ContractCarouselComponent.vue'
import useContractStore from 'stores/contract'
import useLangStore from 'stores/lang'
import { openMap } from '../services/geoService'
import { keyPair } from '../services/databaseService'
import { parse } from '../helpers/markdownHelper'
import { isDateNotOk } from '../helpers/dateHelper'
import {
  readFilesPromise,
  getFileFromUrl,
  filesShare,
  canShare,
} from '../helpers/fileHelper'
import { createCal, googleCalendarUrl } from '../helpers/calendarHelper'
import { mailUrl } from '../helpers/mailHelper'
import { open } from '../helpers/urlHelper'
// import { isVerified } from '../helpers/contractHelper'
import { documentLoader } from '../helpers/customLoaders'
import {
  FormatImageType,
  Place,
  Agent,
  Presentation,
  VerifiableCredential,
} from '../types/models'
import { ROUTE_NAMES } from '../router/routes'

enum Action {
  LINK = 'link',
  PUBLISH = 'publish',
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

const router = useRouter()
const $q = useQuasar()
const i18n = useI18n()
const $t = i18n.t
const contractStore = useContractStore()
const authStore = useAuthStore()
const langStore = useLangStore()
const podStore = usePodStore()
// const walletStore = useWalletStore()

const { isLoggedIn } = storeToRefs(authStore)
// const { publicKey } = storeToRefs(walletStore)

const emit = defineEmits(['remove', 'edit'])
const props = defineProps({
  eventId: {
    type: Number as PropType<number>,
    required: true,
  },
  attaches: {
    type: Array as PropType<FormatImageType[]>,
    default: () => [],
  },
  tag: {
    type: Array as PropType<string[]>,
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
  organizer: {
    type: Object as PropType<Agent>,
    default: () => {},
  },
  participant: {
    type: Array as PropType<Agent[]>,
    default: () => [],
  },
  link: {
    type: String as PropType<string>,
    default: '',
  },
})

function itemScheduled(endTime: Date) {
  return endTime !== null && endTime < new Date()
}

async function signPresentation(verifiableCredential: VerifiableCredential) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
  const presentation = vc.createPresentation({
    verifiableCredential: [verifiableCredential],
    // todo настроить id и holder
  }) as Presentation
  const suite = await keyPair.getSuite()
  // Если вызвать метод sign два и более раза, то появляется Proof Chains
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-return,@typescript-eslint/no-unsafe-member-access
  return await vc.signPresentation({
    presentation,
    suite,
    challenge: uid(),
    documentLoader: documentLoader, // todo переделать под domain
  })
}

async function verifyPresentation(presentation: Presentation) {
  const suite = await keyPair.getSuite()
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-call
  const verify = await vc.verify({
    presentation,
    documentLoader,
    suite,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    challenge: presentation.proof.challenge,
  })
  console.log('v', verify)
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
  if (canShare && props.attaches?.length) {
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
  // todo отображать если был указан WebId внешнего клиента
  if (isLoggedIn.value) {
    group2.push({
      label: 'Publish to Pod',
      icon: 'publish',
      color: 'primary',
      id: Action.PUBLISH,
    })
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
  }
  const group3 = [] // Message Group
  if (props.organizer && (props.organizer.email || props.organizer.telephone)) {
    if (props.organizer.email) {
      group3.push({
        label: $t('components.archiveList.sheet.mail.label'),
        icon: 'contact_mail',
        color: 'secondary',
        id: Action.MAIL,
      })
    }
    if (props.organizer.telephone) {
      group3.push({
        label: $t('components.archiveList.sheet.telephone.label'),
        icon: 'call',
        color: 'secondary',
        id: Action.TELEPHONE,
      })
    }
    group3.push({
      label: $t('components.archiveList.sheet.law.label'),
      icon: 'gavel',
      color: 'secondary',
      id: Action.LAW,
    })
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
    actions.unshift({})
    actions = actions.concat(group3)
  }

  $q.bottomSheet({
    title: $t('components.archiveList.sheet.title'),
    grid: !$q.platform.is.mobile,
    class: $q.platform.is.desktop ? 'text-center' : '',
    actions: actions,
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
  }).onOk(async (action: { id: SheetAction }) => {
    switch (action.id) {
      case Action.SHARE: {
        try {
          const files = [] as File[]
          for (const attach of props.attaches) {
            const file = await getFileFromUrl(attach.url)
            files.push(file)
          }
          await filesShare(files)
        } catch (error) {
          console.error(error)
          $q.notify({
            type: 'negative',
            message: $t('components.imageContextMenu.fail'),
          })
        }
        break
      }
      case Action.PUBLISH: {
        console.log('WIP')
        // await podStore.initPod() // раскоментировать если до этого не логинился
        await podStore.uploadIcal(
          podStore.resourceRootUrl + 'events',
          'myical example file',
        )
        break
      }
      case Action.LINK: {
        console.warn('WIP Action.SHARE: поддержать создание шаринг линка ')

        // Принцип работы:
        // Пользователь создает презентацию где выбирает только нужные поля для шаринга
        // Затем пользователь загружает свою презентацию на свой pod
        // После этого пользователь делится ссылкой на свою презентацию с другим пользователем
        const [contract] = await contractStore.filteredByIds([props.eventId])
        /* eslint-disable */
        const presentation: Presentation = await signPresentation({
          '@context': ['https://www.w3.org/2018/credentials/v1'],
          'id':
            'https://archive.gotointeractive.com/task/' +
            contract.id +
            '/user/123',
          'type': ['VerifiableCredential'],
          'issuer': contract.issuer,
          'issuanceDate': contract.issuanceDate.toISOString(),
          'credentialSubject': {
            '@context': ['https://www.w3.org/ns/activitystreams'],
            'name': contract.name,
            'description': contract.description,
          },
          'proof': contract.proof,
        })
        /* eslint-enable */
        console.log('presentation', presentation)
        // todo настроить правильную верификацию
        try {
          await verifyPresentation(presentation)
        } catch (e) {
          console.warn('Verification failed', e)
        }

        // todo - поддержать подписание презентации через Solana (для Phantom Wallet)
        // jsldContract = await signContractUseSolana(jsldContract)
        // console.log('signed contract', jsldContract)
        // endtodo

        // todo должно открываться меню с выбором Web_id другого лица и которому дается доступ на чтение или запись твоего календаря
        // ...
        const webId: WebId = '123123' // fixme webId из customers которому нужно дать доступ

        // todo при шаринге делать ограничение на добавление только proof и комментариев
        let shareLink = 'todo link' // fixme solid dataset url
        await universalAccess.setAgentAccess(
          shareLink,
          webId,
          { read: true, append: true, write: true },
          {
            fetch,
          },
        )
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
        const icalFile: File = createCal($t('organization.prodid'), {
          event: {
            uid: uid(),
            url: props.link ? new URL(props.link) : null,
            summary: props.title,
            description: props.description,
            location: props.location,
            stamp: new Date(),
            start: props.startTime,
            end: props.endTime,
            categories: props.tag,
            attach: props.attaches.map((attach) => attach.url),
            organizer: props.organizer,
            attendee: props.participant,
            // todo поддержать поле geo
          },
        })
        return saveIcal(icalFile)
      }
      case Action.MAIL: {
        return open(mailUrl(props.organizer.email, props.title, props.sameAs))
      }
      case Action.TELEPHONE: {
        return open(props.organizer.telephone)
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

function sendToCourt() {
  alert('This functionality is under development.')
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

function onRemoveArchiveName(name: string) {
  alert('WIP')
  contractStore.removeContractName(name)
}

async function onSelectArchiveName(name: string) {
  alert('WIP')
  await router.push({
    name: ROUTE_NAMES.FILTER,
    query: {
      name: name,
      page: 1,
    },
  })
}
</script>
