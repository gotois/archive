<template>
  <div
    v-if="props.contract.credentialSubject?.object?.length"
    class="relative-position"
  >
    <template
      v-for="({ contentUrl, encodingFormat, caption = '' }, urlIndex) in props
        .contract.credentialSubject.object"
      :key="urlIndex"
    >
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
    :autofocus="!isSigning"
    @submit="onSubmit"
    @reset="onResetForm"
  >
    <QSelect
      v-model="contractType"
      :options="contractOptions"
      :readonly="
        Boolean(isSigning || props.contract.credentialSubject?.instrument?.name)
      "
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
    <QInput
      v-model.trim="customer"
      :readonly="
        Boolean(
          isSigning || props.contract.credentialSubject?.participant?.name,
        )
      "
      :label="$t('customer.type')"
      :hint="$t('customer.hint')"
      :rules="[(val) => val && val.length > 0]"
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
          :disable="
            Boolean(props.contract.credentialSubject?.participant?.name)
          "
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
    <QSelect
      v-model="modelContact"
      :readonly="
        Boolean(
          isSigning ||
            props.contract.credentialSubject.participant?.email?.length ||
            props.contract.credentialSubject.participant?.url?.length,
        )
      "
      :label="$t('customer.contact')"
      autocomplete="off"
      spellcheck="false"
      :hint="$t('customer.hintContact')"
      :hide-hint="!$q.platform.is.desktop"
      :hide-bottom-space="!$q.platform.is.desktop"
      :type="currentContactType"
      :error-message="$t('consumer.emailRules')"
      :behavior="$q.platform.is.ios === true ? 'dialog' : 'menu'"
      :dense="$q.platform.is.desktop"
      color="secondary"
      use-input
      use-chips
      multiple
      hide-dropdown-icon
      square
      outlined
      @new-value="onNewValueContact"
      @input-value="onInputValueContact"
      @focus="onFocusInput"
    >
      <template #prepend>
        <QIcon name="contacts" />
      </template>
      <template #selected-item="item">
        <QChip
          :icon="formatIconContact(item.opt)"
          :dense="$q.platform.is.desktop"
          color="transparent"
          square
        >
          {{ item.opt.value }}
        </QChip>
      </template>
    </QSelect>
    <div class="row justify-center items-center">
      <QInput
        v-if="!$q.platform.is.mobile"
        v-model="duration.from"
        :readonly="
          Boolean(isSigning || props.contract.credentialSubject.startTime)
        "
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
        :disable="Boolean(props.contract.credentialSubject.startTime)"
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
            :disable="Boolean(props.contract.credentialSubject.startTime)"
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
        :readonly="
          isSigning ||
          Boolean(
            props.contract.credentialSubject.startTime ||
              props.contract.credentialSubject.endTime,
          ) ||
          dateNoLimit
        "
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
              props.contract.credentialSubject.startTime ||
                props.contract.credentialSubject.endTime,
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
    <QInput
      v-model.trim="description"
      :label="$t('description.type')"
      :hint="$t('description.hint')"
      type="textarea"
      class="no-padding"
      color="secondary"
      :hide-hint="!$q.platform.is.desktop"
      :dense="$q.platform.is.desktop"
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
        :label="isSigning ? $t('contractForm.sign') : $t('contractForm.submit')"
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
import { PropType, ref, computed, defineAsyncComponent, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import {
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
  QChip,
  patterns,
} from 'quasar'
import { storeToRefs } from 'pinia'
import useAuthStore from 'stores/auth'
import useContractStore from 'stores/contract'
import useProfileStore from 'stores/profile'
import { readFilePromise } from '../helpers/fileHelper'
import { formatDate } from '../helpers/dateHelper'
import { validTelString } from '../helpers/dataHelper'
import { validUrlString } from '../helpers/urlHelper'
import { Credential } from '../types/models'

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
  contract: {
    type: Object as PropType<Credential>,
    default: () => ({}),
  },
})

const $t = useI18n().t
const $q = useQuasar()
const authStore = useAuthStore()
const contractStore = useContractStore()
const profileStore = useProfileStore()

const { isLoggedIn } = storeToRefs(authStore)
const isSigning = computed(() => {
  return (
    // eslint-disable-next-line no-prototype-builtins
    props.contract.hasOwnProperty('proof') ||
    Boolean(props.contract.credentialSubject?.instrument)
  )
})

const contractOptions = ref(contractStore.getArchiveKeys)
const contractForm = ref<QForm>()
const loadingForm = ref(false)
const modelContact = ref<MultiContact[]>([])
const currentContactType = ref<InputType>(InputType.text)
const contractType = ref(props.contract.credentialSubject?.instrument?.name)
const customer = ref(props.contract.credentialSubject?.participant?.name)
const isCustomerOrg = ref(
  props.contract.credentialSubject?.agent?.type === 'Organization',
)
const description = ref(
  props.contract.credentialSubject?.instrument?.description,
)
const cloneStartDate = date.clone(
  props.contract.credentialSubject.startTime ?? new Date(),
)
const afterYearDate = new Date(
  date
    .clone(cloneStartDate)
    .setFullYear(date.clone(cloneStartDate).getFullYear() + 1),
)
const duration = ref<Duration>({
  from: formatDate(cloneStartDate),
  to: formatDate(afterYearDate),
})
const dateNoLimit = ref(Boolean(props.contract.credentialSubject.endTime))

function filterOptions(val: string, update: (callback: () => void) => void) {
  update(() => {
    const needle = val.toLowerCase()
    contractOptions.value = contractStore.getArchiveKeys.filter(
      (v: string) => v.toLowerCase().indexOf(needle) > -1,
    )
  })
}

function formatIconContact(contact: MultiContact) {
  switch (contact.type) {
    case InputType.email: {
      return 'alternate_email'
    }
    case InputType.url: {
      return 'link'
    }
    case InputType.tel: {
      return 'add_call'
    }
    default: {
      return 'question_mark'
    }
  }
}

function onInputValueContact(text: string) {
  if (validTelString(text)) {
    currentContactType.value = InputType.tel
  } else if (validUrlString(text)) {
    currentContactType.value = InputType.url
  } else if (text.includes('@') && patterns.testPattern.email(text)) {
    currentContactType.value = InputType.email
  } else {
    currentContactType.value = InputType.text
  }
}

function onNewValueContact(
  text: string,
  done: (value: MultiContact, format: string) => void,
) {
  text = text.toLowerCase().replaceAll(' ', '')
  if (validTelString(text)) {
    return done(
      {
        type: InputType.tel,
        value: text.replace(/\D/g, ''),
      },
      'add-unique',
    )
  } else if (validUrlString(text)) {
    return done({ type: InputType.url, value: text }, 'add-unique')
  } else if (text.includes('@') && patterns.testPattern.email(text)) {
    return done({ type: InputType.email, value: text }, 'add-unique')
  }
  $q.notify({
    type: 'warning',
    message: 'Unknown type text. Use Tel, Email or URL',
  })
}

function resetForm() {
  const contractFormValue = contractForm.value
  contractFormValue.resetValidation()
  contractType.value = ''
  customer.value = ''
  description.value = ''
  modelContact.value = []
  duration.value = {
    from: formatDate(props.contract.credentialSubject.startTime),
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
      from: formatDate(props.contract.credentialSubject.startTime),
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

async function signContract() {
  await contractStore.createPresentation(props.contract)
}

function onSubmit() {
  if (isSigning.value) {
    return signContract()
  } else {
    return saveContract()
  }
}

async function saveContract() {
  if (!date.isValid(String(duration.value.from))) {
    $q.notify({
      type: 'negative',
      message: $t('components.contractForm.submitDate.invalidStartDate'),
    })
    return
  }
  if (!dateNoLimit.value && !date.isValid(String(duration.value.to))) {
    $q.notify({
      type: 'negative',
      message: $t('components.contractForm.submitDate.invalidEndDate'),
    })
    return
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
    return
  }
  const participantEmails = modelContact.value.filter(({ type }) => {
    return type === InputType.email
  })
  const participantTels = modelContact.value.filter(({ type }) => {
    return type === InputType.tel
  })
  const participantUrls = modelContact.value.filter(({ type }) => {
    return type === InputType.url
  })

  loadingForm.value = true

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

  try {
    const images = []
    for (const file of props.contract.credentialSubject.object) {
      const res = await fetch(file.contentUrl)
      const blob = await res.blob()
      const image = await readFilePromise(blob)
      images.push(image)
    }
    const person = profileStore.getPersonLD
    const newContract = {
      agent_name: person.name,
      agent_email: person.email,
      agent_legal: isCustomerOrg.value,
      participant_name: customer.value,
      participant_email: participantEmails.length
        ? participantEmails[0].value // todo поддержать массив email
        : null,
      participant_tel: participantTels.length ? participantTels[0].value : null, // todo поддержать массив tel
      participant_url: participantUrls.length ? participantUrls[0].value : null, // todo поддержать массив url
      instrument_name: contractType.value,
      instrument_description: description.value,
      startTime: startDate,
      endTime: dateNoLimit.value ? null : endDate,
      images: images,
    }
    await contractStore.addContract({
      contractData: newContract,
      usePod: isLoggedIn.value,
    })
    emit('onCreate', newContract)
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

defineExpose({
  resetForm: onResetForm,
})

onMounted(() => {
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
})
</script>
<style lang="scss">
.my-dropdown .q-btn__content.col {
  justify-content: space-between;
}
</style>
