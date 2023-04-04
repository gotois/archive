<template>
  <QForm
    ref="contractForm"
    class="q-gutter-md"
    autocapitalize="off"
    autocomplete="off"
    spellcheck="true"
    greedy
    autofocus
    @submit="onSubmit"
    @reset="onResetForm"
  >
    <QSelect
      v-model="contractType"
      :options="contractOptions"
      :label="$t('contract.type')"
      :hint="$t('contract.hint')"
      :rules="[(val) => (val && val.length > 0) || $t('contract.rules')]"
      popup-content-class="q-pt-sm"
      new-value-mode="add-unique"
      input-debounce="50"
      name="contractType"
      autocomplete="on"
      spellcheck="false"
      color="secondary"
      bg-color="white"
      use-input
      lazy-rules
      hide-selected
      fill-input
      rounded
      outlined
      square
      @filter="filterOptions"
    >
      <template #prepend>
        <QIcon name="assignment" />
      </template>
    </QSelect>
    <QInput
      v-model="customer"
      :label="$t('customer.type')"
      :hint="$t('customer.hint')"
      :rules="[(val) => (val && val.length > 0) || $t('customer.rules')]"
      autocomplete="on"
      name="customer"
      spellcheck="true"
      outlined
      lazy-rules
      square
      color="secondary"
      @focus="onFocusInput"
    >
      <template #prepend>
        <QIcon name="assignment_ind" />
      </template>
    </QInput>
    <div class="row justify-center items-center">
      <QInput
        v-if="!$q.platform.is.mobile"
        v-model="duration.from"
        :rules="['date']"
        :label="$t('duration.from')"
        class="col no-padding"
        mask="date"
        outlined
        square
        color="secondary"
      >
        <QTooltip>{{ $t('duration.fromHint') }}</QTooltip>
      </QInput>
      <QBtnDropdown
        square
        outline
        cover
        text-color="grey-5"
        size="md"
        :icon="$q.platform.is.mobile ? '' : 'event'"
        class="q-ml-xs q-mr-xs q-field__control"
        :class="{
          col: $q.platform.is.mobile,
        }"
      >
        <template v-if="$q.platform.is.mobile" #label>
          <div class="row items-center">{{ duration.from }}</div>
        </template>
        <template v-if="dateNoLimit">
          <QDate
            v-model="duration.from"
            default-view="Months"
            :class="
              $q.platform.is.mobile ? 'fullscreen full-width full-height' : ''
            "
            first-day-of-week="1"
            @update:model-value="onSelectDate"
          >
            <div class="row items-center justify-end">
              <QBtn
                v-close-popup
                :label="$t('duration.close')"
                color="primary"
                flat
              />
            </div>
          </QDate>
        </template>
        <template v-else>
          <QDate
            v-model="duration"
            default-view="Months"
            range
            first-day-of-week="1"
            :class="
              $q.platform.is.mobile ? 'fullscreen full-width full-height' : ''
            "
            @update:model-value="onSelectDate"
          >
            <div class="row items-center justify-end">
              <QBtn
                v-close-popup
                :label="$t('duration.close')"
                color="primary"
                flat
              />
            </div>
          </QDate>
        </template>
      </QBtnDropdown>
      <QInput
        v-if="!$q.platform.is.mobile && !dateNoLimit"
        v-model="duration.to"
        :label="$t('duration.to')"
        :rules="['date']"
        class="col no-padding"
        mask="date"
        outlined
        square
        color="secondary"
      >
        <QTooltip>{{ $t('duration.toHint') }}</QTooltip>
      </QInput>
      <QToggle v-model="dateNoLimit" :label="$t('duration.infinity')">
        <QTooltip>Не имеет срока завершения</QTooltip>
      </QToggle>
    </div>
    <QFile
      v-model="files"
      :label="$t('files.type')"
      :hint="$t('files.hint')"
      accept="image/*, .pdf"
      outlined
      multiple
      square
      color="secondary"
      counter
    >
      <template #prepend>
        <QIcon name="image" />
      </template>
      <template #append>
        <QIcon name="add" @click.stop />
      </template>
    </QFile>
    <QInput
      v-model="description"
      :label="$t('description.type')"
      type="textarea"
      class="no-padding"
      outlined
      square
      autogrow
      color="secondary"
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
        rounded
        :class="{
          'full-width': !$q.platform.is.desktop,
        }"
        :label="$t('contractForm.submit')"
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
import { PropType, ref, computed } from 'vue'
import {
  useQuasar,
  date,
  QForm,
  QBtnDropdown,
  QSelect,
  QBtn,
  QIcon,
  QInput,
  QDate,
  QTooltip,
  QToggle,
  QFile,
} from 'quasar'
import { useStore } from '../store'
import { ContractTable } from '../types/models'
import { readFilesPromise } from '../services/fileHelper'
import { isDateNotOk, formatDate } from '../services/dateHelper'
import { contractTypes } from '../services/contractTypes'
import { recommendationContractTypes } from '../services/recommendationContractTypes'

const now = new Date()
const currentDate = formatDate(now)
const afterYearDate = formatDate(
  new Date(now.setFullYear(now.getFullYear() + 1)),
)

const $q = useQuasar()
const store = useStore()
const emit = defineEmits(['onCreate'])
const props = defineProps({
  contractTypeName: {
    type: String as PropType<string>,
    default: '',
  },
})

const contractType = ref(props.contractTypeName)
const customer = ref('')
const description = ref('')
const duration = ref({ from: currentDate, to: afterYearDate })
const files = ref([])
const contractForm = ref<QForm>()
const dateNoLimit = ref(false)
const allContractTypes = [].concat(recommendationContractTypes, contractTypes)
const contractOptions = ref(allContractTypes)
// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
const isLoggedIn = computed(() => store.getters['Auth/isLoggedIn'] as boolean)
const loadingForm = ref(false)

// eslint-disable-next-line no-unused-vars
function filterOptions(val: string, update: (callback: () => void) => void) {
  update(() => {
    const needle = val.toLowerCase()
    contractOptions.value = allContractTypes.filter(
      (v: string) => v.toLowerCase().indexOf(needle) > -1,
    )
  })
}

function onResetForm() {
  const contractFormValue = contractForm.value
  contractFormValue.resetValidation()
  contractType.value = ''
  customer.value = ''
  description.value = ''
  duration.value = { from: currentDate, to: afterYearDate }
  files.value = []
  dateNoLimit.value = false
}

function onSelectDate(value: string | { from: string; to: string } | null) {
  if (value === null) {
    $q.notify({
      type: 'warning',
      message: 'Начало даты не может быть позже сегодняшней',
    })
    duration.value = { from: currentDate, to: afterYearDate }
    return
  }
  switch (typeof value) {
    case 'string': {
      duration.value = {
        from: value,
        to: value,
      }
      break
    }
    case 'object': {
      duration.value = {
        from: value?.from,
        to: value?.to,
      }
      break
    }
    default:
      $q.notify({
        type: 'warning',
        message: 'Неизвестный тип даты',
      })
      break
  }
}

function onFocusInput({ target }: { target: HTMLElement }) {
  target.scrollIntoView()
}

async function onSubmit() {
  const startDate = new Date(duration.value.from)
  if (isDateNotOk(startDate)) {
    $q.notify({
      type: 'negative',
      message: 'Неверная дата подачи заявления',
    })
    return
  }
  const endDate = new Date(duration.value.to)
  if (!dateNoLimit.value && isDateNotOk(endDate)) {
    $q.notify({
      type: 'negative',
      message: 'Неверная дата окончания заявления',
    })
    return
  }
  if (startDate.valueOf() >= endDate.valueOf()) {
    $q.notify({
      type: 'negative',
      message: 'Начальная дата не может быть старше конечной даты',
    })
    return
  }
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
    const images = await readFilesPromise(files.value)
    const newContract: ContractTable = {
      agent_name: (store.getters as { consumer: string }).consumer,
      participant_name: customer.value,
      instrument_name: contractType.value,
      instrument_description: description.value,
      startTime: startDate,
      endTime: dateNoLimit.value ? null : endDate,
      images: images,
    }
    await store.dispatch('addContract', {
      contractData: newContract,
      usePod: isLoggedIn.value,
    })
    $q.notify({
      message: `Запись "${newContract.instrument_name.toLocaleLowerCase()}" добавлена`,
      type: 'positive',
      actions: [
        {
          label: 'Перейти',
          color: 'white',
          handler: () => {
            emit('onCreate', newContract.instrument_name)
          },
        },
      ],
    })
    await store.dispatch('loadContractNames')
    onResetForm()
  } catch (e) {
    console.error(e)
    $q.notify({
      type: 'negative',
      message: 'Запись не удалась',
    })
  } finally {
    loadingForm.value = false
  }
}
</script>
