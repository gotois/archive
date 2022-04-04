<template>
  <q-form
    @submit="onSubmit"
    @reset="onReset"
    ref="contractForm"
    class="q-gutter-md"
    autocorrect="off"
    autocapitalize="off"
    autocomplete="off"
    spellcheck="true"
    greedy
  >
    <q-select
      v-model="contractType"
      @filter="filterOptions"
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
    >
      <template #prepend>
        <q-icon name="assignment" />
      </template>
    </q-select>
    <q-input
      v-model="consumer"
      :label="$t('consumer.type')"
      :rules="[ val => val && val.length > 0 || $t('consumer.rules')]"
      :hint="$t('consumer.hint')"
      name="consumer"
      autocomplete="on"
      lazy-rules
      outlined
    >
      <template #prepend>
        <q-icon name="face" />
      </template>
    </q-input>
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
              <q-date v-model="duration.from" first-day-of-week="1" @update:model-value="onSelectDate">
                <div class="row items-center justify-end">
                  <q-btn v-close-popup :label="$t('duration.close')" color="primary" flat />
                </div>
              </q-date>
            </template>
            <template v-else>
              <q-date v-model="duration" range first-day-of-week="1" @update:model-value="onSelectDate">
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
        :label="$t('duration.infinity')"/>
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
    <div class="text-right">
      <q-btn :label="$t('contractForm.submit')" icon-right="save" type="submit" color="red-9"/>
    </div>
  </q-form>
</template>

<script lang="ts">
import {useQuasar} from 'quasar'
import {
  defineComponent,
  ref,
} from 'vue'
import {db} from 'components/ContractDatabase'
import {ContractTable} from './models'
import {readFilesPromise} from '../services/fileHelper'
import {contractTypes} from '../services/contractTypes'

const currentDate = new Date().toJSON().substring(0, 10).replace(/-/g, '/')

const contractType = ref('')
const consumer = ref('')
const customer = ref('')
const description = ref('')
const duration = ref({from: currentDate, to: currentDate})
const files = ref(null)
const contractForm = ref(null)
const dateNoLimit = ref(false)
const contractOptions = ref(contractTypes)

function filterOptions(val: string, update: any) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  update(() => {
    const needle = val.toLowerCase()
    contractOptions.value = contractTypes.filter(v => v.toLowerCase().indexOf(needle) > -1)
  })
}

function onReset() {
  const contractFormValue: any = contractForm.value
  if (contractFormValue) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unnecessary-type-assertion
    contractFormValue!.resetValidation()
  }
  contractType.value = ''
  consumer.value = ''
  customer.value = ''
  description.value = ''
  duration.value = {from: currentDate, to: currentDate}
  files.value = null
  dateNoLimit.value = false
}

function onSelectDate(value: string | { from: string, to: string }) {
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
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
        from: value.from,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
        to: value.to,
      }
      break
    }
    default:
      break
  }
}

function isDateNotOk(value: any) {
  // eslint-disable-next-line
  return Number.isNaN(Date.parse(value))
}

function main() {
  const $q = useQuasar()

  async function onSubmit() {
    const startDate = new Date(duration.value.from)
    const endDate = new Date(dateNoLimit.value ? 9999999999999 : duration.value.to)

    if (isDateNotOk(startDate) || isDateNotOk(endDate)) {
      $q.notify({
        type: 'negative',
        message: 'Неверный тип даты'
      })
      return
    }

    const images: Array<string | any> = await readFilesPromise(files.value ?? [])
    db.transaction('rw', db.contracts, async () => {
      const newContract: ContractTable = {
        'agent_name': consumer.value,
        'participant_name': customer.value,
        'instrument_name': contractType.value,
        'instrument_description': description.value,
        'startTime':startDate ,
        'endTime': endDate,
        'images': images
      }
      await db.contracts.add(newContract)
      $q.notify({
        message: 'Запись добавлена',
        type: 'positive',
        actions: [
          {
            label: 'Закрыть',
            color: 'white',
          }
        ]
      })
      onReset()
    }).catch((error: Error) => {
      console.error(error)
      $q.notify({
        type: 'negative',
        message: error.message
      })
    })
  }

  return {
    contractType,
    consumer,
    customer,
    description,
    duration,
    files,
    dateNoLimit,
    contractForm,
    contractOptions,
    filterOptions,
    onSubmit,
    onReset,
    onSelectDate,
  }
}

export default defineComponent({
  name: 'ContractFormComponent',
  setup() {
    return {
      ...main()
    }
  },
})
</script>
