<template>
  <q-form
    ref="contractForm"
    class="q-gutter-md"
    autocorrect="off"
    autocapitalize="off"
    autocomplete="off"
    @submit="onSubmit"
    @reset="onReset"
  >
    <q-input v-model="contractType" outlined :label="$t('contract.type')"
             lazy-rules
             name="contractType"
             autocomplete="on"
             :rules="[ val => val && val.length > 0 || $t('contract.hint')]"
    />
    <q-input v-model="consumer" outlined :label="$t('consumer.type')"
             lazy-rules
             name="consumer"
             autocomplete="on"
             :rules="[ val => val && val.length > 0 || $t('consumer.hint')]"
    />
    <q-input v-model="customer" outlined :label="$t('customer.type')"
             lazy-rules
             name="customer"
             autocomplete="on"
             :rules="[ val => val && val.length > 0 || $t('customer.hint')]"
    />
    <q-input
      v-model="description"
      type="textarea"
      :label="$t('description.type')"
      outlined
      autogrow
    />
    <div class="row">
      <q-input v-model="duration.from"
               class="col"
               outlined
               :label="$t('duration.from')"
               mask="date"
               :rules="['date']">
        <template #append>
          <q-icon name="event" class="cursor-pointer">
            <q-popup-proxy ref="qDateProxy" transition-show="scale" transition-hide="scale">
              <template v-if="dateNoLimit">
                <q-date v-model="duration.from" first-day-of-week="1" @update:model-value="onSelectDate">
                  <div class="row items-center justify-end">
                    <q-btn v-close-popup :label="$t('duration.close')" color="primary" flat/>
                  </div>
                </q-date>
              </template>
              <template v-else>
                <q-date v-model="duration" range first-day-of-week="1" @update:model-value="onSelectDate">
                  <div class="row items-center justify-end">
                    <q-btn v-close-popup :label="$t('duration.close')" color="primary" flat/>
                  </div>
                </q-date>
              </template>
            </q-popup-proxy>
          </q-icon>
        </template>
      </q-input>
      <q-toggle v-model="dateNoLimit" disable title="WORK IN PROGRESS" class="q-mb-md"
                :label="$t('duration.infinity')"/>
    </div>
    <q-file v-model="files"
            outlined
            multiple
            counter
            accept="image/*, .pdf"
            :label="$t('files.type')">
      <template #append>
        <q-icon name="add" @click.stop/>
      </template>
    </q-file>
    <div>
      <q-btn :label="$t('contractForm.submit')" type="submit" color="red-9"/>
    </div>
  </q-form>
</template>

<script lang="ts">
import {useQuasar} from 'quasar'
import {
  defineComponent,
  ref,
} from 'vue';
import {db} from 'components/ContractDatabase';
import {ContractTable} from './models'
import {readFilesPromise} from '../services/fileHelper'

function main() {
  const $q = useQuasar()
  const currentDate = new Date().toJSON().substring(0, 10).replace(/-/g, '/')
  const contractType = ref('')
  const consumer = ref('')
  const customer = ref('')
  const description = ref('')
  const duration = ref({from: currentDate, to: currentDate})
  const files = ref(null)
  const contractForm = ref(null)
  const dateNoLimit = ref(true)

  function onSelectDate(value: string | { from: string, to: string }) {
    switch (typeof value) {
      case 'string': {
        duration.value = {
          from: value,
          to: value
        }
        break
      }
      case 'object': {
        duration.value = {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
          from: value.from,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
          to: value.to
        }
        break
      }
      default:
        break
    }
  }

  function onReset() {
    const contractFormValue : any = contractForm.value
    if (contractFormValue) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unnecessary-type-assertion
      contractFormValue!.resetValidation()
    }
    contractType.value = ''
    consumer.value = ''
    customer.value = ''
    description.value = ''
    // duration.value = ''
    files.value = null
    dateNoLimit.value = true
  }

  async function onSubmit() {
    const images: Array<string|any> = await readFilesPromise(files.value ?? [])
    db.transaction('rw', db.contracts, async () => {
      const newContract: ContractTable = {
        'agent_name': consumer.value,
        'participant_name': customer.value,
        'instrument_name': contractType.value,
        'instrument_description': description.value,
        'startTime': new Date(duration.value.from),
        'endTime': new Date(9999999999999), // todo использовать new Date(duration.value.to),
        'images': images
      }
      await db.contracts.add(newContract)
      $q.notify({
        message: 'Запись добавлена',
        type: 'positive',
        actions: [
          {
            label: 'Закрыть', color: 'white'
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
