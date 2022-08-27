<template>
  <q-form
    ref="contractForm"
    class="q-gutter-md"
    autocorrect="off"
    autocapitalize="off"
    autocomplete="off"
    spellcheck="true"
    greedy
    @submit="onSubmit"
    @reset="onResetForm"
  >
    <q-select
      v-model="contractType"
      :options="contractOptions"
      :label="$t('contract.type')"
      :hint="$t('contract.hint')"
      :rules="[ val => val && val.length > 0 || $t('contract.rules')]"
      new-value-mode="add-unique"
      input-debounce="0"
      name="contractType"
      autocomplete="on"
      use-input
      lazy-rules
      hide-selected
      fill-input
      outlined
      @filter="filterOptions"
    >
      <template #prepend>
        <q-icon name="assignment" />
      </template>
    </q-select>
    <q-input
      v-model="customer"
      :label="$t('customer.type')"
      :hint="$t('customer.hint')"
      :rules="[ val => val && val.length > 0 || $t('customer.rules')]"
      autocomplete="on"
      name="customer"
      outlined
      lazy-rules
    >
      <template #prepend>
        <q-icon name="assignment_ind" />
      </template>
    </q-input>
    <div class="row justify-center items-center">
      <q-input
        v-model="duration.from"
        :rules="['date']"
        :label="$t('duration.from')"
        class="col no-padding"
        mask="date"
        outlined>
      </q-input>
      <div>
        <q-icon size="md" name="event" class="cursor-pointer">
          <q-popup-proxy ref="qDateProxy" transition-show="scale" transition-hide="scale">
            <template v-if="dateNoLimit">
              <q-date v-model="duration.from" default-view="Months" first-day-of-week="1" @update:model-value="onSelectDate">
                <div class="row items-center justify-end">
                  <q-btn v-close-popup :label="$t('duration.close')" color="primary" flat />
                </div>
              </q-date>
            </template>
            <template v-else>
              <q-date v-model="duration" default-view="Months" range first-day-of-week="1" @update:model-value="onSelectDate">
                <div class="row items-center justify-end">
                  <q-btn v-close-popup :label="$t('duration.close')" color="primary" flat />
                </div>
              </q-date>
            </template>
          </q-popup-proxy>
        </q-icon>
      </div>
      <q-input
        v-if="!dateNoLimit"
        v-model="duration.to"
        :label="$t('duration.to')"
        :rules="['date']"
        class="col no-padding"
        mask="date"
        outlined
      ></q-input>
      <q-toggle
        v-model="dateNoLimit"
        :label="$t('duration.infinity')"
      />
    </div>
    <q-file
      v-model="files"
      :label="$t('files.type')"
      accept="image/*, .pdf"
      hint="PDF, PNG, JPG, etc"
      outlined
      multiple
      counter
    >
      <template #prepend>
        <q-icon name="image" />
      </template>
      <template #append>
        <q-icon name="add" @click.stop/>
      </template>
    </q-file>
    <q-input
      v-model="description"
      :label="$t('description.type')"
      type="textarea"
      class="no-padding"
      outlined
      autogrow
    >
      <template #prepend>
        <q-icon name="sticky_note_2" />
      </template>
    </q-input>
    <div class="text-right">
      <q-btn :label="$t('contractForm.submit')" icon-right="save" type="submit" color="accent" />
    </div>
  </q-form>
</template>

<script lang="ts" setup>
import {PropType, toRef, ref} from 'vue'
import {useQuasar} from 'quasar'
import {useStore} from '../store'
import {ContractTable} from './models'
import {db} from '../services/databaseHelper'
import {readFilesPromise} from '../services/fileHelper'
import {isDateNotOk, formatDate} from '../services/dateHelper'
import {contractTypes} from '../services/contractTypes'
import {recommendationContractTypes} from '../services/recommendationContractTypes'

const now = new Date()
const currentDate = formatDate(now)
const afterYearDate = formatDate(new Date(now.setFullYear(now.getFullYear() + 1)))

const $q = useQuasar()
const store = useStore()
const emit = defineEmits(['onCreate'])
const props = defineProps({
  contractTypeName: {
    type: String as PropType<string>,
    default: '',
  },
})

const contractType = toRef(props, 'contractTypeName')
const customer = ref('')
const description = ref('')
const duration = ref({from: currentDate, to: afterYearDate})
const files = ref([])
const contractForm = ref()
const dateNoLimit = ref(false)
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const allContractTypes: string[] = [].concat(recommendationContractTypes, contractTypes)
const contractOptions = ref(allContractTypes)

function filterOptions(val: string, update: (callback: () => void) => void) {
  update(() => {
    const needle = val.toLowerCase()
    contractOptions.value = allContractTypes.filter(v => v.toLowerCase().indexOf(needle) > -1)
  })
}

function onResetForm() {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const contractFormValue = contractForm.value
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
  contractFormValue?.resetValidation()
  contractType.value = ''
  customer.value = ''
  description.value = ''
  duration.value = {from: currentDate, to: afterYearDate}
  files.value = []
  dateNoLimit.value = false
}

function onSelectDate(value: string | { from: string, to: string } | null) {
  if (value === null) {
    $q.notify({
      type: 'warning',
      message: 'Начало даты не может быть позже сегодняшней',
    })
    duration.value = {from: currentDate, to: afterYearDate}
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

  const images = await readFilesPromise(files.value as File[]) as string[]
  db.transaction('rw', db.contracts, async () => {
    const newContract: ContractTable = {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-assignment
      'agent_name': store.getters.consumer,
      'participant_name': customer.value,
      'instrument_name': contractType.value,
      'instrument_description': description.value,
      'startTime': startDate,
      'endTime': dateNoLimit.value ? null : endDate,
      'images': images,
    }
    await store.dispatch('addContract', newContract)
    $q.notify({
      message: `Запись ${newContract.instrument_name.toLocaleLowerCase()} добавлена`,
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
    onResetForm()
  }).catch((error: Error) => {
    console.error(error)
    $q.notify({
      type: 'negative',
      message: error.message,
    })
  })
}
</script>
