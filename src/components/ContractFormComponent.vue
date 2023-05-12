<template>
  <div>
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
        hide-hint
        hide-bottom-space
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
        type="text"
        spellcheck="true"
        hide-bottom-space
        hide-hint
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
      <QInput
        v-model="email"
        :label="$t('customer.email')"
        :hint="$t('customer.hintEmail')"
        :rules="['email']"
        autocomplete="off"
        type="email"
        name="email"
        spellcheck="false"
        lazy-rules
        hide-hint
        hide-bottom-space
        outlined
        square
        color="secondary"
        @focus="onFocusInput"
      >
        <template #prepend>
          <QIcon name="email" />
        </template>
      </QInput>
      <div class="row justify-center items-center">
        <QInput
          v-if="!$q.platform.is.mobile"
          v-model="duration.from"
          :label="$t('duration.from')"
          class="col no-padding"
          :type="typeof duration.from === 'string' ? 'text' : 'date'"
          :rules="typeof duration.from === 'string' ? ['date'] : []"
          mask="date"
          outlined
          square
          color="secondary"
        >
          <QTooltip>{{ $t('duration.fromHint') }}</QTooltip>
        </QInput>
        <QBtnDropdown
          v-if="$q.platform.is.mobile"
          square
          outline
          cover
          no-wrap
          no-icon-animation
          color="grey-6"
          class="my-dropdown col"
        >
          <template v-if="$q.platform.is.mobile" #label>
            <div class="row no-wrap">
              <QIcon left name="event" color="grey-6" />
              <span class="text-caption text-grey-8">
                {{ duration.from }}
                <template v-if="!dateNoLimit && duration.from !== duration.to">
                  - {{ duration.to }}
                </template>
              </span>
            </div>
            <QSeparator vertical spaced inset />
            <QToggle
              v-model="dateNoLimit"
              checked-icon="hourglass_disabled"
              unchecked-icon="date_range"
              size="lg"
            />
          </template>
          <template v-if="dateNoLimit">
            <QDate
              v-model="duration.from"
              default-view="Calendar"
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
              first-day-of-week="1"
              :class="{
                'fullscreen full-width full-height': $q.platform.is.mobile,
              }"
              range
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
          v-if="!$q.platform.is.mobile"
          v-model="duration.to"
          :type="typeof duration.to === 'string' ? 'text' : 'date'"
          :rules="typeof duration.to === 'string' ? ['date'] : []"
          :label="$t('duration.to')"
          :readonly="dateNoLimit"
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
            color="secondary"
            :label="$t('duration.infinity')"
          >
            <QTooltip>{{ $t('duration.noLimit') }}</QTooltip>
          </QToggle>
        </QInput>
      </div>
      <QFile
        v-model="files"
        :label="$t('files.type')"
        :counter="!!files.length"
        accept="image/*, .pdf"
        color="secondary"
        hide-hint
        hide-bottom-space
        outlined
        multiple
        square
      >
        <template #prepend>
          <QIcon name="image" />
        </template>
        <template #append>
          <QIcon name="add" @click.stop />
        </template>
        <QTooltip>{{ $t('files.hint') }}</QTooltip>
      </QFile>
      <QInput
        v-model="description"
        :label="$t('description.type')"
        :hint="$t('description.hint')"
        type="textarea"
        class="no-padding"
        color="secondary"
        hide-hint
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
  </div>
</template>

<script lang="ts" setup>
import { PropType, ref, computed } from 'vue'
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
  QDate,
  QTooltip,
  QToggle,
  QFile,
} from 'quasar'
import useAuthStore from 'stores/auth'
import useContractStore from 'stores/contract'
import useProfileStore from 'stores/profile'
import { ContractTable } from '../types/models'
import { readFilesPromise } from '../services/fileHelper'
import { formatDate } from '../services/dateHelper'
import { contractTypes } from '../services/contractTypes'
import { recommendationContractTypes } from '../services/recommendationContractTypes'

interface Duration {
  from: Date | string
  to: Date | string
}

const $q = useQuasar()

const now = new Date()
const afterYearDate = new Date(now.setFullYear(now.getFullYear() + 1))

const emit = defineEmits(['onCreate'])
const props = defineProps({
  contractTypeName: {
    type: String as PropType<string>,
    default: '',
  },
})

const authStore = useAuthStore()
const contractStore = useContractStore()
const profileStore = useProfileStore()

const contractType = ref(props.contractTypeName)
const customer = ref('')
const email = ref('')
const description = ref('')
const duration = ref<Duration>({
  from: $q.platform.is.mobile ? formatDate(new Date()) : new Date(),
  to: $q.platform.is.mobile ? formatDate(afterYearDate) : afterYearDate,
})
const files = ref([])
const contractForm = ref<QForm>()
const dateNoLimit = ref(false)
const allContractTypes = [].concat(recommendationContractTypes, contractTypes)
const contractOptions = ref(allContractTypes)
const loadingForm = ref(false)

const isLoggedIn = computed(() => authStore.isLoggedIn)

// eslint-disable-next-line no-unused-vars
function filterOptions(val: string, update: (callback: () => void) => void) {
  update(() => {
    const needle = val.toLowerCase()
    contractOptions.value = allContractTypes.filter(
      (v: string) => v.toLowerCase().indexOf(needle) > -1,
    )
  })
}

function onResetForm(confirm = false) {
  const contractFormValue = contractForm.value
  if (confirm) {
    if (!window.confirm('Вы действительно хотите очистить форму?')) {
      return
    }
  }
  contractFormValue.resetValidation()
  contractType.value = ''
  customer.value = ''
  description.value = ''
  email.value = ''
  duration.value = {
    from: $q.platform.is.mobile ? formatDate(new Date()) : new Date(),
    to: $q.platform.is.mobile ? formatDate(afterYearDate) : afterYearDate,
  }
  files.value = []
  dateNoLimit.value = false
}

function onSelectDate(value: string | Duration) {
  if (value === null) {
    $q.notify({
      type: 'warning',
      message: 'Начало даты не может быть позже сегодняшней',
    })
    duration.value = { from: new Date(), to: afterYearDate }
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
        message: 'Неизвестный тип даты',
      })
      break
    }
  }
}

function onFocusInput({ target }: { target: HTMLElement }) {
  target.scrollIntoView()
}

async function onSubmit() {
  if (!date.isValid(String(duration.value.from))) {
    $q.notify({
      type: 'negative',
      message: 'Неверная дата подачи заявления',
    })
    return
  }
  if (!dateNoLimit.value && !date.isValid(String(duration.value.to))) {
    $q.notify({
      type: 'negative',
      message: 'Неверная дата окончания заявления',
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
      agent_name: profileStore.getConsumer,
      agent_email: profileStore.getEmail,
      participant_name: customer.value,
      participant_email: email.value,
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
    await contractStore.loadContractNames()
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

defineExpose({
  resetForm: onResetForm,
})
</script>
<style lang="scss">
.my-dropdown .q-btn__content.col {
  justify-content: space-between;
}
</style>
