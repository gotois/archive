<template>
  <q-stepper
      ref="stepper"
      v-model="step"
      color="primary"
      flat
      vertical
      animated
    >
      <q-step
        :name="1"
        :title="$t('tutorial.agreement.title')"
        icon="article"
        :done="step > 1"
      >
        <p class="text-body1">{{ $t('tutorial.agreement.body') }}</p>
        <q-stepper-navigation>
          <q-btn color="secondary" label="Принять" @click="$refs.stepper.next()" />
        </q-stepper-navigation>
      </q-step>
      <q-step
        :name="2"
        :title="$t('tutorial.license.title')"
        icon="article"
        :done="step > 2"
      >
        <p class="text-body1" v-html="$t('tutorial.license.body')"></p>
        <q-stepper-navigation>
          <q-btn color="secondary" label="Принять" @click="$refs.stepper.next()" />
        </q-stepper-navigation>
      </q-step>
      <q-step
        :name="3"
        :title="$t('tutorial.data.title')"
        icon="assignment"
      >
        <p class="text-body1">{{ $t('tutorial.data.body') }}</p>
        <q-form
          ref="nameForm"
          class="q-gutter-md"
          autocorrect="off"
          autocapitalize="off"
          autocomplete="off"
          greedy
          @submit="onFinish"
        >
          <q-input
            v-model="consumer"
            :label="$t('consumer.type')"
            :rules="[ val => val && val.length > 0 || $t('consumer.rules')]"
            :hint="$t('consumer.hint')"
            name="consumer"
            autocomplete="on"
            outlined
          >
            <template #prepend>
              <q-icon name="face" />
            </template>
          </q-input>
          <p class="text-body">Опционально введите пин код (будет использовать при входе):</p>
          <v-otp-input
            input-classes="otp-input"
            separator="-"
            :num-inputs="4"
            :is-input-num="true"
            :conditional-class="['first', '', '', 'last']"
            :placeholder="['*', '*', '*', '*']"
            @on-change="handleOnChange"
            @on-complete="handleOnComplete"
          />
          <q-stepper-navigation>
            <q-btn
              color="accent"
              type="submit"
              :label="$t('tutorial.complete')"
              icon="login"
            />
          </q-stepper-navigation>
        </q-form>
      </q-step>
    </q-stepper>
</template>

<script lang="ts" setup>
import {ref, getCurrentInstance} from 'vue'
import {useRouter} from 'vue-router'
import {useQuasar, useMeta} from 'quasar'
import VOtpInput from 'vue3-otp-input'
import {useStore} from '../store'
import {createContract} from '../services/pdfHelper'
import pkg from '../../package.json'

const {description, version, productName} = pkg
const {$t} = getCurrentInstance().appContext.config.globalProperties

const $q = useQuasar()
const store = useStore()
const router = useRouter()

const step = ref(1)
const consumer = ref('')
const pin = ref('')

const metaData = {
  title: 'Обучение',
}

async function onFinish() {
  if (pin.value.length === 4) {
    if (window.confirm('Действительно сохранить пин?')) {
      await store.dispatch('Auth/setCode', pin.value)
    }
  }
  $q.loading.show()
  await store.dispatch('Tutorial/tutorialComplete')
  await store.dispatch('consumerName', consumer.value)

  // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-assignment
  const html = $t('tutorial.license.body') as string
  const contractPDF = await createContract(html, $q.platform.is.name === 'firefox')
  const newContract = {
    'agent_name': consumer.value,
    'participant_name': productName + ' ' + version,
    'instrument_name': 'Договор согласия',
    'instrument_description': description,
    'startTime': new Date(),
    'images': contractPDF,
  }
  await store.dispatch('addContract', newContract)

  $q.loading.hide()
  await router.push('/create')
}

const handleOnChange = (value: string) => {
  pin.value = value
}

const handleOnComplete = (value: string) => {
  pin.value = value
}

useMeta(metaData)
</script>
