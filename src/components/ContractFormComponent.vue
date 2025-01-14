<template>
  <div
    v-if="contract.credentialSubject?.object?.length"
    class="relative-position"
  >
    <ContractCarouselComponent :model="contract.credentialSubject.object" />
  </div>
  <QSeparator spaced inset />
  <QForm
    ref="contractForm"
    class="q-gutter-md"
    autocapitalize="off"
    autocomplete="off"
    spellcheck="true"
    greedy
    :autofocus="!signing"
    @submit="saveContract"
    @reset="onResetForm"
  >
    <QSelect
      v-model="contractType"
      :options="contractOptions"
      :readonly="Boolean(signing)"
      :label="$t('contract.type')"
      :hint="
        $q.platform.is.mobile
          ? $t('contract.hint.mobile')
          : $t('contract.hint.desktop')
      "
      :behavior="$q.platform.is.ios ? 'dialog' : 'menu'"
      :rules="[(val) => val && val.length > 0]"
      :error-message="$t('contract.rules')"
      popup-content-class="q-pt-sm"
      new-value-mode="add-unique"
      input-debounce="50"
      name="contractType"
      autocomplete="on"
      spellcheck="false"
      color="secondary"
      use-input
      lazy-rules
      hide-selected
      :hide-bottom-space="!$q.platform.is.desktop"
      :dense="$q.platform.is.desktop"
      fill-input
      outlined
      square
      @filter="filterOptions"
    >
      <template #prepend>
        <QIcon name="assignment" />
      </template>
    </QSelect>
    <div class="row justify-center items-center">
      <QInput
        v-if="!$q.platform.is.mobile"
        v-model="duration.from"
        :readonly="Boolean(signing)"
        :label="$t('duration.from')"
        class="col no-padding"
        :type="typeof duration.from === 'string' ? 'text' : 'date'"
        :rules="typeof duration.from === 'string' ? ['date'] : []"
        :dense="$q.platform.is.desktop"
        mask="date"
        outlined
        square
        color="secondary"
      >
        <QTooltip>{{ $t('duration.fromHint') }}</QTooltip>
      </QInput>
      <QBtnDropdown
        v-if="$q.platform.is.mobile"
        :disable="Boolean(contract.credentialSubject.startTime)"
        square
        outline
        cover
        no-wrap
        no-icon-animation
        color="grey-6"
        class="my-dropdown col"
      >
        <template #label>
          <div class="row no-wrap" style="flex: 1">
            <QIcon left name="event" color="grey-6" />
            <span class="text-caption text-grey-8" style="align-self: center">
              {{ duration.from }}
              <template v-if="!dateNoLimit && duration.from !== duration.to">
                - {{ duration.to }}
              </template>
            </span>
          </div>
          <QSeparator vertical spaced inset />
          <QToggle
            v-model="dateNoLimit"
            :disable="Boolean(contract.credentialSubject.startTime)"
            checked-icon="hourglass_disabled"
            unchecked-icon="date_range"
            size="lg"
          />
        </template>
        <DateComponent :range="!dateNoLimit" @select="onSelectDate" />
      </QBtnDropdown>
      <QInput
        v-if="!$q.platform.is.mobile"
        v-model="duration.to"
        :type="typeof duration.to === 'string' ? 'text' : 'date'"
        :rules="typeof duration.to === 'string' ? ['date'] : []"
        :label="$t('duration.to')"
        :readonly="signing || dateNoLimit"
        :dense="$q.platform.is.desktop"
        class="col no-padding"
        mask="date"
        outlined
        square
        color="secondary"
      >
        <QTooltip v-if="!dateNoLimit">{{ $t('duration.toHint') }}</QTooltip>
        <QSeparator v-if="!dateNoLimit" vertical spaced inset />
        <QToggle
          v-if="!$q.platform.is.mobile"
          v-model="dateNoLimit"
          :disable="
            Boolean(
              contract.credentialSubject.startTime ||
                contract.credentialSubject.endTime,
            )
          "
          color="secondary"
          class="non-selectable"
          :class="{
            'text-grey-14': !dateNoLimit,
            'text-secondary': dateNoLimit,
          }"
          :label="$t('duration.infinity')"
        >
          <QTooltip>{{ $t('duration.noLimit') }}</QTooltip>
        </QToggle>
      </QInput>
    </div>
    <div class="row">
      <QBtn
        v-if="customers.length === 0"
        ripple
        square
        stretch
        :class="{
          'full-width': !$q.platform.is.desktop,
        }"
        no-caps
        label="Добавить в маршрут исполнителей"
        icon="route"
        color="secondary"
        @click="onAddCustomer"
      />
    </div>
    <template v-if="customers.length">
      <QInput
        v-model.trim="customer"
        :readonly="Boolean(signing)"
        :label="$t('customer.type')"
        :hint="$t('customer.hint')"
        :error-message="$t('customer.rules')"
        autocomplete="on"
        name="customer"
        type="text"
        spellcheck="true"
        :hide-bottom-space="!$q.platform.is.desktop"
        :hide-hint="!$q.platform.is.desktop"
        :dense="$q.platform.is.desktop"
        outlined
        lazy-rules
        square
        color="secondary"
        @focus="onFocusInput"
      >
        <template #prepend>
          <QIcon name="assignment_ind" />
        </template>
        <template #append>
          <QCheckbox
            v-model="isCustomerOrg"
            :disable="Boolean(true)"
            size="md"
            color="white"
            keep-color
            checked-icon="group"
            unchecked-icon="person"
            :dense="$q.platform.is.desktop"
          >
            <QTooltip>{{ $t('customer.hintType') }}</QTooltip>
          </QCheckbox>
        </template>
      </QInput>
      <MultiContactComponent
        :model-value="modelContact"
        :readonly="Boolean(true)"
        :label="$t('customer.contact')"
        :hint="$t('customer.hintContact')"
        :error-message="$t('consumer.emailRules')"
        :hide-hint="!$q.platform.is.desktop"
        :hide-bottom-space="!$q.platform.is.desktop"
        :dense="$q.platform.is.desktop"
        color="secondary"
        @focus="onFocusInput"
        @update:model-value="(value) => (modelContact = value)"
      />
    </template>
    <QInput
      v-model.trim="locationName"
      :label="'Lat and Lng'"
      :hint="'Latitude and Longitude'"
      type="text"
      class="no-padding"
      color="secondary"
      :hide-hint="!$q.platform.is.desktop"
      :dense="$q.platform.is.desktop"
      readonly
      hide-bottom-space
      outlined
      square
      autogrow
      @focus="onFocusInput"
    >
      <template #prepend>
        <QIcon name="map" />
      </template>
    </QInput>
    <QInput
      v-model.trim="description"
      :label="$t('description.type')"
      :hint="$t('description.hint')"
      type="textarea"
      class="no-padding"
      color="secondary"
      :hide-hint="!$q.platform.is.desktop"
      :dense="$q.platform.is.desktop"
      :readonly="signing"
      hide-bottom-space
      outlined
      square
      autogrow
      @focus="onFocusInput"
    >
      <template #prepend>
        <QIcon name="sticky_note_2" />
      </template>
    </QInput>
    <div class="text-left">
      <QBtn
        ripple
        square
        stretch
        :class="{
          'full-width': !$q.platform.is.desktop,
        }"
        :label="signing ? $t('contractForm.sign') : $t('contractForm.submit')"
        icon-right="save"
        type="submit"
        color="accent"
        :loading="loadingForm"
        :disable="loadingForm"
      />
    </div>
  </QForm>
</template>
<script lang="ts" setup>
import { PropType, ref, watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  useQuasar,
  date,
  QForm,
  QBtnDropdown,
  QSelect,
  QSeparator,
  QBtn,
  QIcon,
  QInput,
  QCheckbox,
  QTooltip,
  QToggle,
} from 'quasar'
import { WebId } from '@inrupt/solid-client'
import { createWorker } from 'tesseract.js'
import useContractStore from 'stores/contract'
import useWalletStore from 'stores/wallet'
import useCalendarStore from 'stores/calendar'
import MultiContactComponent from 'components/MultiContact.vue'
import DateComponent from 'components/DateComponent.vue'
import ContractCarouselComponent from 'components/ContractCarouselComponent.vue'
import { formatDate } from '../helpers/dateHelper'
import { getIdentifierMessage } from '../helpers/schemaHelper'
import { signMessageUsePhantom } from '../services/phantomWalletService'
import { signMessageUseSecretKey } from '../services/cryptoService'
import { keys } from '../services/databaseService'
import {
  checkGeolocationPermission,
  getCurrentPosition,
} from '../services/geoService'
import { ocrPrompt } from '../services/aiService'
import { VerifiedCredential, WalletType, ImageType } from '../types/models'

enum InputType {
  email = 'email',
  url = 'url',
  tel = 'tel',
  text = 'text',
}
interface Duration {
  from: Date | string
  to: Date | string
}
interface MultiContact {
  type: InputType
  value: string
}

const emit = defineEmits(['onCreate'])
const props = defineProps({
  signing: {
    type: Boolean as PropType<boolean>,
    default: false,
  },
  contract: {
    type: Object as PropType<VerifiedCredential>,
    default: () => ({}),
  },
})

const $t = useI18n().t
const $q = useQuasar()
const contractStore = useContractStore()
const walletStore = useWalletStore()
const calendarStore = useCalendarStore()

let cloneStartDate = null
const contract = ref<VerifiedCredential>(props.contract)
const contractType = ref<string | null>(null)
const customers = ref([])
const customer = ref<WebId>(null)
const isCustomerOrg = ref<boolean | null>(null)
const description = ref<string | null>(null)
const dateNoLimit = ref<boolean | null>(null)
const locationName = ref('')
const geo = ref<GeolocationCoordinates | null>(null)

watch(
  () => geo.value,
  () => {
    // todo давать более читаемое название локации
    locationName.value = geo.value.latitude + ':' + geo.value.longitude
  },
)
const contractOptions = ref(contractStore.getArchiveKeys)
const contractForm = ref<QForm>()
const loadingForm = ref(false)
const modelContact = ref<MultiContact[]>([])

if (props.signing) {
  customers.value.push(props.contract.credentialSubject.participant)
  if (props.contract.credentialSubject.participant?.email) {
    modelContact.value.push({
      type: InputType.email,
      value: props.contract.credentialSubject.participant.email,
    })
  }
  if (props.contract.credentialSubject.participant?.url) {
    modelContact.value.push({
      type: InputType.url,
      value: props.contract.credentialSubject.participant.url,
    })
  }
  customer.value = props.contract.credentialSubject.participant.sameAs
  contractType.value = props.contract.credentialSubject.instrument?.name
  isCustomerOrg.value =
    props.contract.credentialSubject?.agent?.type === 'Organization'
  description.value = props.contract.credentialSubject.instrument.description
  dateNoLimit.value = Boolean(props.contract.credentialSubject.endTime)
  cloneStartDate = date.clone(
    new Date(props.contract.credentialSubject.startTime),
  )
}

const afterYearDate = new Date(
  date
    .clone(cloneStartDate)
    .setFullYear(date.clone(cloneStartDate).getFullYear() + 1),
)
const duration = ref<Duration>({
  from: formatDate(cloneStartDate),
  to: formatDate(afterYearDate),
})

function filterOptions(val: string, update: (callback: () => void) => void) {
  update(() => {
    const needle = val.toLowerCase()
    contractOptions.value = contractStore.getArchiveKeys.filter(
      (v: string) => v.toLowerCase().indexOf(needle) > -1,
    )
  })
}

function onAddCustomer() {
  customers.value.push(null)
}

function resetForm() {
  const contractFormValue = contractForm.value
  contractFormValue.resetValidation()
  contractType.value = ''
  customer.value = ''
  description.value = ''
  modelContact.value = []
  duration.value = {
    from: formatDate(contract.value.credentialSubject.startTime),
    to: formatDate(afterYearDate),
  }
  dateNoLimit.value = false
}

function onResetForm(confirm = false) {
  if (confirm) {
    const dialog = $q.dialog({
      message: $t('components.contractForm.resetDialog.message'),
      cancel: true,
      persistent: false,
    })
    dialog.onOk(() => {
      resetForm()
    })
    return
  }
  resetForm()
}

function onSelectDate(value: string | Duration) {
  if (value === null) {
    $q.notify({
      type: 'warning',
      message: $t('components.contractForm.selectDate.fail'),
    })
    duration.value = {
      from: formatDate(contract.value.credentialSubject.startTime),
      to: afterYearDate,
    }
    return
  }
  switch (typeof value) {
    case 'string': {
      duration.value = {
        from: date.isValid(value) ? formatDate(new Date(value)) : null,
        to: date.isValid(value) ? formatDate(new Date(value)) : null,
      }
      break
    }
    case 'object': {
      duration.value = {
        from: date.isValid(String(value.from))
          ? formatDate(new Date(value.from))
          : null,
        to: date.isValid(String(value.to))
          ? formatDate(new Date(value.to))
          : null,
      }
      break
    }
    default: {
      $q.notify({
        type: 'warning',
        message: $t('components.contractForm.wrongDate.fail'),
      })
      break
    }
  }
}

function onFocusInput({ target }: { target: HTMLElement }) {
  target.scrollIntoView()
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function signContractUseSolana(contract: VerifiedCredential) {
  const message = getIdentifierMessage(contract.credentialSubject)
  switch (walletStore.type) {
    case WalletType.Phantom: {
      const { signature } = await signMessageUsePhantom(message)
      contract.credentialSubject.identifier.push({
        value: signature,
        name: WalletType.Phantom,
      })
      break
    }
    case WalletType.Secret: {
      const { secretKey } = await keys.last()
      const { signature } = signMessageUseSecretKey(message, secretKey)
      contract.credentialSubject.identifier.push({
        value: signature,
        name: WalletType.Secret,
      })
      break
    }
  }
  return contract
}

async function saveContract() {
  loadingForm.value = true
  try {
    await contractStore.addContract(props.contract)
    emit('onCreate')
    onResetForm()
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: $t('components.contractForm.submitDate.fail'),
    })
  } finally {
    loadingForm.value = false
  }
}

async function saveOnline() {
  loadingForm.value = true
  const id = uid()
  const url = String(podStore.getResourceBaseUrl) + id + '.ttl'
  console.warn(url)
  try {
    const newContract = await prepareContract()
    const gicId = walletStore?.publicKey?.toString()
    const resolver = gicId ? `did:gic:${gicId}` : demoUserWebId
    let jsldContract = Dogovor.createContractLD(newContract, id, resolver)

    // todo - поддержать подписание Solana
    // jsldContract = await signContractUseSolana(jsldContract)
    // console.log('signed contract', jsldContract)

    const suite = await keyPair.getSuite()
    const dogovor = await Dogovor.fromCredential(url, jsldContract, suite)
    await dogovor.upload()

    if (customers.value.length > 0) {
      const webId = customer.value
      await dogovor.shareLink(url, webId)
    }

    const newDogovor = await Dogovor.fromUrl(url)
    await contractStore.addPresentation(newDogovor.presentation)

    emit('onCreate', newDogovor)
    onResetForm()
  } catch (error) {
    console.error(error)
    $q.notify({
      type: 'negative',
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      message: error.message,
    })
  } finally {
    loadingForm.value = false
  }
}

async function recognizeImage(
  { contentUrl, encodingFormat }: ImageType,
  langs: string,
) {
  if (encodingFormat.startsWith('image')) {
    const worker = await createWorker(langs)
    const img = new Image()
    img.src = contentUrl
    const { data } = await worker.recognize(img)
    await worker.terminate()
    return calendarStore.generate([
      {
        type: 'Note',
        content: ocrPrompt + '::' + data.text,
        mediaType: 'text/plain',
      },
    ])
  } else if (encodingFormat === 'application/pdf') {
    return calendarStore.calendar([
      {
        type: 'Link',
        href: contentUrl,
      },
    ])
  } else {
    throw new Error('Unknown format')
  }
}

defineExpose({
  resetForm: onResetForm,
})

onMounted(async () => {
  $q.loading.show()
  try {
    const geoLocationPermissionStatus = await checkGeolocationPermission()
    if (geoLocationPermissionStatus.state !== 'denied') {
      const { coords } = await getCurrentPosition()
      geo.value = coords
    }
    geoLocationPermissionStatus.onchange = async () => {
      const { coords } = await getCurrentPosition()
      geo.value = coords
    }
  } catch (error) {
    console.error(error)
  }
  try {
    if (navigator.onLine) {
      const ld = await recognizeImage(
        contract.value.credentialSubject.object[0],
        'eng+rus',
      )
      contractType.value = ld.summary
      description.value = ld.description
      // duration.value = {
      //   from: formatDate(ld.startDate),
      //   to: formatDate(ld.endDate),
      // }
    }
  } catch (error) {
    console.error(error)
    $q.notify({
      type: 'negative',
      message: error.message as string,
    })
  } finally {
    $q.loading.hide()
  }
})
</script>
<style lang="scss">
.my-dropdown .q-btn__content.col {
  justify-content: space-between;
}
</style>
