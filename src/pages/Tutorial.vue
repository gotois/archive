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
        <p class="text-body1">{{ $t('tutorial.license.body') }}</p>
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
            class="q-pa-lg"
            outlined
          >
            <template #prepend>
              <q-icon name="face"/>
            </template>
          </q-input>
          <q-stepper-navigation>
            <q-btn color="accent" type="submit" :label="$t('tutorial.complete')"/>
          </q-stepper-navigation>
        </q-form>
      </q-step>
    </q-stepper>
</template>

<script lang="ts">
import {defineComponent, ref} from 'vue'
import {Store as VuexStore} from 'vuex'
import {useMeta} from 'quasar'
import {StateInterface, useStore} from '../store'
import {Router, useRouter} from 'vue-router'

let store: VuexStore<StateInterface>
let router: Router

const step = ref(1)
const consumer = ref('')

const metaData = {
  title: 'Обучение',
}

async function onFinish() {
  await store.dispatch('tutorialComplete')
  await store.dispatch('consumerName', consumer.value)
  await router.push({
    name: 'archive',
    query: {
      page: 1,
    },
  })
}

function main() {
  store = useStore()
  router = useRouter()
  useMeta(metaData)

  return {
    step,
    consumer,
    onFinish,
  }
}

export default defineComponent({
  // eslint-disable-next-line vue/multi-word-component-names
  name: 'Tutorial',
  setup () {
    return main()
  },
})
</script>
