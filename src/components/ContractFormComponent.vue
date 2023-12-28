<template>
  <div
    v-if="contract.credentialSubject?.object?.length"
    class="relative-position"
  >
    <template
      v-for="(
        { contentUrl, encodingFormat, caption = '' }, urlIndex
      ) in contract.credentialSubject.object"
      :key="urlIndex"
    >
      <canvas
        id="input-overlay"
        width="300"
        height="300"
        class="absolute no-pointer-events"
        style="z-index: 1"
      ></canvas>
      <object
        v-if="encodingFormat === 'application/pdf' || caption.endsWith('.pdf')"
        :data="contentUrl"
        type="application/pdf"
        class="full-width"
        style="max-height: 300px"
        height="300"
      ></object>
      <QImg
        v-else
        :src="contentUrl"
        no-transition
        :draggable="false"
        :alt="caption"
        style="max-height: 300px"
        fit="scale-down"
        :placeholder-src="caption"
        class="full-width"
        @mouseleave="onHideCaption"
        @mouseenter="onShowCaption"
      >
        <div v-if="caption.length" class="absolute-top-right text-caption">
          {{ caption }}
        </div>
      </QImg>
      <QSeparator spaced inset />
    </template>
  </div>
  <QForm
    ref="contractForm"
    class="q-gutter-md"
    autocapitalize="off"
    autocomplete="off"
    spellcheck="true"
    greedy
    :autofocus="!signing"
    @submit="onSubmit"
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
        :rules="[validUrlString]"
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
            :disable="Boolean(contract.credentialSubject?.participant?.name)"
            size="md"
            color="secondary"
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
        :readonly="Boolean(signing)"
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
    <template v-if="signing">
      {{ JSON.stringify(dogovor.presentation.proof, null, 2) }}
    </template>
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
import { PropType, ref, defineAsyncComponent, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  uid,
  useQuasar,
  date,
  QForm,
  QBtnDropdown,
  QSelect,
  QSeparator,
  QImg,
  QBtn,
  QIcon,
  QInput,
  QCheckbox,
  QTooltip,
  QToggle,
} from 'quasar'
import { storeToRefs } from 'pinia'
import { WebId } from '@inrupt/solid-client'
import { createWorker } from 'tesseract.js'
import useAuthStore from 'stores/auth'
import { demoUserWebId } from 'stores/auth'
import useContractStore from 'stores/contract'
import useProfileStore from 'stores/profile'
import useWalletStore from 'stores/wallet'
import usePodStore from 'stores/pod'
import MultiContactComponent from 'components/MultiContact.vue'
import { readFilePromise } from '../helpers/fileHelper'
import { formatDate } from '../helpers/dateHelper'
import { validUrlString } from '../helpers/urlHelper'
import { signMessageUsePhantom } from '../services/phantomWalletService'
import { signMessageUseSecretKey } from '../services/cryptoService'
import { Credential, MyContract, WalletType, ImageType } from '../types/models'
import { getIdentifierMessage } from '../helpers/schemaHelper'
import { keys, keyPair } from '../services/databaseService'
import Dogovor from '../services/contractGeneratorService'

const DateComponent = defineAsyncComponent(
  () => import('components/DateComponent.vue'),
)

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
  dogovor: {
    type: Object as PropType<Dogovor>,
    default: () => ({}),
  },
})

const $t = useI18n().t
const $q = useQuasar()
const authStore = useAuthStore()
const contractStore = useContractStore()
const profileStore = useProfileStore()
const walletStore = useWalletStore()
const podStore = usePodStore()

const { isLoggedIn } = storeToRefs(authStore)

let cloneStartDate = null
const contract = ref<Credential | null>(null)
const contractType = ref<string | null>(null)
const customers = ref([])
const customer = ref<WebId>(null)
const isCustomerOrg = ref<boolean | null>(null)
const description = ref<string | null>(null)
const dateNoLimit = ref<boolean | null>(null)

if (props.signing) {
  contract.value = props.dogovor.presentation
    .verifiableCredential[0] as Credential

  customers.value.push(contract.value.credentialSubject.participant)

  customer.value = contract.value.credentialSubject.participant.sameAs
  contractType.value = contract.value.credentialSubject.instrument?.name
  isCustomerOrg.value =
    contract.value.credentialSubject?.agent?.type === 'Organization'
  description.value = contract.value.credentialSubject.instrument.description
  dateNoLimit.value = Boolean(contract.value.credentialSubject.endTime)

  cloneStartDate = date.clone(
    new Date(contract.value.credentialSubject.startTime),
  )
} else {
  const { credential } = props.dogovor
  contract.value = credential

  if (contract.value.credentialSubject.participant) {
    customers.value.push(contract.value.credentialSubject.participant)
  }

  if (credential.credentialSubject.participant) {
    customer.value = credential.credentialSubject.participant?.sameAs
  }
  if (credential.credentialSubject.instrument) {
    contractType.value = credential.credentialSubject.instrument?.name
  }
  if (credential.credentialSubject.agent) {
    isCustomerOrg.value =
      credential.credentialSubject.agent?.type === 'Organization'
  }
  if (credential.credentialSubject.instrument) {
    description.value = credential.credentialSubject.instrument?.description
  }

  cloneStartDate = date.clone(new Date())
}

const contractOptions = ref(contractStore.getArchiveKeys)
const contractForm = ref<QForm>()
const loadingForm = ref(false)
const modelContact = ref<MultiContact[]>([])
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

function onHideCaption({ target }: { target: HTMLElement }) {
  target.querySelector('.text-caption')?.classList?.remove('invisible')
}

function onShowCaption({ target }: { target: HTMLElement }) {
  target.querySelector('.text-caption')?.classList?.add('invisible')
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

async function prepareContract() {
  if (!date.isValid(String(duration.value.from))) {
    $q.notify({
      type: 'negative',
      message: $t('components.contractForm.submitDate.invalidStartDate'),
    })
    throw new Error('date invalid')
  }
  if (!dateNoLimit.value && !date.isValid(String(duration.value.to))) {
    $q.notify({
      type: 'negative',
      message: $t('components.contractForm.submitDate.invalidEndDate'),
    })
    throw new Error('date invalid')
  }
  const startDate: Date =
    typeof duration.value.from === 'string'
      ? new Date(duration.value.from)
      : duration.value.from
  const endDate: Date =
    typeof duration.value.to === 'string'
      ? new Date(duration.value.to)
      : duration.value.to
  if (startDate.valueOf() > endDate.valueOf()) {
    $q.notify({
      type: 'negative',
      message: $t('components.contractForm.submitDate.invalidSelectDate'),
    })
    throw new Error('date invalid')
  }

  // Если дата совпадает с текущей, то считаем что договор подписан сегодняшним числом
  if (date.getDateDiff(startDate, new Date(), 'days') === 0) {
    const now = new Date()
    startDate.setHours(now.getHours())
    startDate.setMinutes(now.getMinutes())
    startDate.setSeconds(now.getSeconds())
    startDate.setMilliseconds(now.getMilliseconds())
  } else {
    // todo если же договор подписан прошедшим числом, тогда как-то получить его часы, минуты, секунды...
    // иначе упадет ошибка при создании на Pod, если таких договоров будет два
  }

  const images = []
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  for (const file of contract.value.credentialSubject.object) {
    const res = await fetch(file.contentUrl)
    const blob = await res.blob()
    const image = await readFilePromise(blob)
    images.push(image)
  }

  const participantEmails = modelContact.value.filter(
    ({ type }) => type === InputType.email,
  )
  const participantTels = modelContact.value.filter(
    ({ type }) => type === InputType.tel,
  )
  const participantUrls = modelContact.value.filter(
    ({ type }) => type === InputType.url,
  )
  const person = profileStore.getPersonLD
  // если не установлен кастомер, считаем кастомером создателя
  const participantName = customers.value.length
    ? customer.value
    : authStore.webId
  const participantEmail = customer.value
    ? participantEmails.length
      ? participantEmails[0].value // todo поддержать массив email
      : null
    : person.email
  const participantTel = customer.value
    ? participantTels.length
      ? participantTels[0].value
      : null // todo поддержать массив tel
    : person.telephone
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const participantUrl = customer.value
    ? participantUrls.length
      ? participantUrls[0].value
      : null // todo поддержать массив url
    : person.homepage

  return {
    agent_name: person.name,
    agent_email: person.email,
    agent_legal: isCustomerOrg.value,
    participant_name: participantName,
    participant_email: participantEmail,
    participant_tel: participantTel,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    participant_url: participantUrl,
    instrument_name: contractType.value,
    instrument_description: description.value,
    startTime: startDate,
    endTime: dateNoLimit.value ? null : endDate,
    images: images,
  } as MyContract
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function signContractUseSolana(contract: Credential) {
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

async function onSubmit() {
  if (props.signing) {
    return isLoggedIn.value ? sign() : alert('You needs to be sign in!')
  } else {
    return isLoggedIn.value ? saveOnline() : saveOffline()
  }
}

async function sign() {
  loadingForm.value = true
  try {
    const suite = await keyPair.getSuite()
    await props.dogovor.sign(suite)
    await props.dogovor.upload()
    await contractStore.addPresentation(props.dogovor.presentation)
  } catch (error) {
    console.error(error)
    $q.notify({
      type: 'negative',
      message: $t('components.contractForm.submitDate.fail'),
    })
  } finally {
    loadingForm.value = false
  }
}

async function saveOffline() {
  loadingForm.value = true
  const id = uid()
  const newContract = await prepareContract()
  const resolver = demoUserWebId
  const jsldContract = Dogovor.createContractLD(newContract, id, resolver)
  const suite = await keyPair.getSuite()
  const dogovor = await Dogovor.fromCredential(
    'http://localhost/',
    jsldContract,
    suite,
  )
  await contractStore.addPresentation(dogovor.presentation)
  emit('onCreate', dogovor)
  onResetForm()
}

async function saveOnline() {
  loadingForm.value = true

  try {
    const id = uid()
    const url = String(podStore.getResourceBaseUrl) + id + '.ttl'
    console.warn(url)
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
      message: $t('components.contractForm.submitDate.fail'),
    })
  } finally {
    loadingForm.value = false
  }
}

async function recognizeImage(
  { contentUrl, encodingFormat }: ImageType,
  langs = 'eng+rus',
) {
  if (!encodingFormat.startsWith('image')) {
    return
  }
  const worker = await createWorker(langs)
  const img = new Image()
  img.src = contentUrl
  const { data } = await worker.recognize(img)

  const input_overlay = document.getElementById(
    'input-overlay',
  ) as HTMLCanvasElement
  // fixme - for example rect. Change to SVG
  input_overlay.width = 300
  input_overlay.height = 300
  if (input_overlay) {
    const ioctx = input_overlay.getContext('2d')
    data.words.forEach((w) => {
      const b = w.bbox
      ioctx.strokeWidth = 1
      ioctx.strokeStyle = 'red'
      ioctx.strokeRect(b.x0, b.y0, b.x1 - b.x0, b.y1 - b.y0)
      ioctx.beginPath()
      ioctx.moveTo(w.baseline.x0, w.baseline.y0)
      ioctx.lineTo(w.baseline.x1, w.baseline.y1)
      ioctx.strokeStyle = 'green'
      ioctx.stroke()
    })
  }

  contractType.value = data.text.split('\n')[0]
  await worker.terminate()
}

defineExpose({
  resetForm: onResetForm,
})

onMounted(async () => {
  if (contract.value.credentialSubject.participant?.email) {
    modelContact.value.push({
      type: InputType.email,
      value: contract.value.credentialSubject.participant.email,
    })
  }
  if (contract.value.credentialSubject.participant?.url) {
    modelContact.value.push({
      type: InputType.url,
      value: contract.value.credentialSubject.participant.url,
    })
  }

  try {
    await recognizeImage(contract.value.credentialSubject.object[0])
  } catch {
    /* empty */
  }
})
</script>
<style lang="scss">
.my-dropdown .q-btn__content.col {
  justify-content: space-between;
}
</style>
