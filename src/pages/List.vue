<template>
  <q-page padding class="col justify-center full-height">
    <q-inner-loading :showing="loadingVisible">
      <q-spinner-hourglass
        color="info"
        size="6em"
      />
    </q-inner-loading>
    <q-virtual-scroll
      v-if="contracts.length"
      :items="contracts"
      separator
      class="col-12"
    >
      <template #default="{ item, index }">
        <q-card
          :key="index"
          class="q-ma-lg"
          flat
          square
          bordered>
          <div class="row justify-between q-pa-md">
            <p class="text-h6 text-uppercase text-weight-bold no-margin" :style="checkItemEndTime(item)">{{ item.instrument.name }}</p>
            <p v-if="item.instrument.description" class="text-caption text-grey">{{ item.instrument.description }}</p>
          </div>
          <q-separator v-if="item.object.length"/>
          <q-carousel
              v-if="item.object.length"
              v-model="item._currentSlide"
              transition-prev="slide-right"
              transition-next="slide-left"
              control-color="primary"
              animated
              swipeable
              :navigation="item.object.length > 1"
              infinite
            >
              <q-carousel-slide
                v-for="(object, objectIndex) in item.object"
                :key="objectIndex"
                class="no-margin no-padding"
                :name="objectIndex + 1"
              >
                <q-scroll-area class="fit">
                  <q-img
                    class="col"
                    fit="contain"
                    :ratio="1"
                    style="max-height: 400px"
                    :src="object.contentUrl"
                    loading="lazy"
                    decoding="async"
                    no-native-menu
                  />
                </q-scroll-area>
              </q-carousel-slide>
              <template #control>
                <q-carousel-control
                  position="top-right"
                  :offset="[18, 18]"
                >
                  <q-btn
                    round color="white" text-color="primary"
                    icon="fullscreen"
                    @click="onShowFullImage(item)"
                  />
                </q-carousel-control>
                <q-carousel-control
                  v-if="nativeShareIsAvailable"
                  position="top-left"
                  :offset="[18, 18]"
                >
                  <q-btn
                    round color="white" text-color="primary"
                    icon="ios_share"
                    @click="onShareFullImage(item)"
                  />
                </q-carousel-control>
              </template>
          </q-carousel>
          <q-separator/>
          <q-card-section>
            <p class="text-overline text-orange-9 no-margin">
              {{ showDate(item) }}
            </p>
            <q-space/>
            <div class="row items-center">
              <p class="text-black text-weight-light no-margin">
                {{ item.participant.name }}
              </p>
            </div>
          </q-card-section>
        </q-card>
      </template>
      <template #after>
        <div v-if="paginationCount > 0" class="col-12 q-pa-lg flex flex-center self-end">
          <q-pagination
            v-model="currentPage"
            :max="paginationCount"
            direction-links
            @update:model-value="onPaginate"
          />
        </div>
      </template>
    </q-virtual-scroll>
    <template v-if="!loadingVisible">
      <template v-if="paginationCount < 1">
        <div v-if="isSearch" class="col-12 q-pa-lg flex flex-center self-start">
          <q-banner inline-actions class="text-center text-black">
            <template #avatar>
              <q-icon name="explore" color="secondary" />
            </template>
            <template #default>
              {{ $t('archive.searchEmpty') }}
            </template>
            <template #action>
              <q-btn flat color="primary" label="Очистить" to="/archive" />
            </template>
          </q-banner>
        </div>
        <template v-else>
          <q-banner inline-actions class="col-12 q-pa-lg flex flex-center self-center text-black">
            <template #avatar>
              <q-icon name="add_task" color="secondary" />
            </template>
            <template #default>
              {{ archiveEmptyText }}
            </template>
            <template #action>
              <q-btn flat color="accent" label="Добавить" to="/create"/>
            </template>
          </q-banner>
        </template>
      </template>
    </template>
    <q-page-sticky position="bottom-right" :offset="[20, 20]">
      <q-fab
        glossy
        icon="add"
        direction="up"
        vertical-actions-align="right"
        color="accent"
      >
        <q-fab-action push square color="primary" label="Создать документ" to="/create" />
      </q-fab>
    </q-page-sticky>
  </q-page>
</template>

<script lang="ts">
import {defineComponent, ref} from 'vue'
import {Router, useRouter} from 'vue-router'
import {QVueGlobals, useMeta, useQuasar} from 'quasar'
import {db} from 'components/ContractDatabase'
import {Contract, FormatContract} from 'components/models'
import {formatterContracts} from '../services/schemaHelper'
import {isDateNotOk, formatterDate} from '../services/dateHelper'
import {createPDF} from '../services/pdfHelper'
import {contractTypes} from '../services/contractTypes'
import {showImageInPopup} from '../services/popup'

const metaData = {
  title: 'Архив',
}

let $q: QVueGlobals
let router: Router

const paginationCount = ref(0)
const contracts = ref([])
const searchText = ref('')
const limit = ref(5)
const currentPage = ref(1)
const loadingVisible = ref(false)
const nativeShareIsAvailable = ref(!!navigator.share)

async function onShareFullImage(object: FormatContract) {
  const shareData = await createPDF(object)
  try {
    await navigator.share(shareData)
  } catch (error) {
    console.warn('Sharing failed', error)
  }
}

async function setContracts() {
  loadingVisible.value = true
  contracts.value = []
  const offset = (currentPage.value - 1) * limit.value
  const queryFilter = searchText.value

  if (queryFilter.length > 0) { // searching
    const searchTerms = queryFilter.split(' ')
    const count: number = await db.contracts.where('instrument_name')
      .startsWithAnyOfIgnoreCase(searchTerms)
      .or('instrument_name')
      .anyOfIgnoreCase(searchTerms)
      .count()
    if (count) {
      const data = await db.contracts.where('instrument_name')
        .startsWithAnyOfIgnoreCase(searchTerms)
        .or('instrument_name')
        .anyOfIgnoreCase(searchTerms)
        .reverse()
        .offset(offset)
        .limit(limit.value)
        .toArray() as Contract[]
      contracts.value = formatterContracts(data)
      paginationCount.value = Math.ceil(count / limit.value)
    } else {
      paginationCount.value = 0
    }
  } else { // all
    const count: number = await db.contracts.count()
    if (count) {
      const data = await db.contracts.orderBy('startTime').reverse().offset(offset).limit(limit.value).toArray() as Contract[]
      contracts.value = formatterContracts(data)
      paginationCount.value = Math.ceil(count / limit.value)
    } else {
      paginationCount.value = 0
    }
  }
  loadingVisible.value = false
}

function setValues({page, filter}: {page: string|string[], filter: string|string[]}) {
  currentPage.value = Number(page ?? 1)
  searchText.value = String(filter ?? '')
}

function onShowFullImage(object: FormatContract) {
  const image = object.object[object._currentSlide - 1]
  showImageInPopup(image)
}

function onPaginate(page: string): void {
  const filter = searchText.value

  if (filter.length) {
    void router.push({
      path: 'archive',
      query: {
        page: Number(page),
        filter,
      },
    })
  } else {
    void router.push({
      path: 'archive',
      query: {
        page: Number(page),
      },
    })
  }
}

function routerFunc() {
  const {page, filter} = router.currentRoute.value.query
  setValues({
    page,
    filter,
  })

  void (async (): Promise<void> => {
    try {
      await setContracts()
    } catch (e) {
      console.error(e)
      $q.notify({
        type: 'negative',
        message: 'Связь с базой данных не установлена',
        timeout: 1000 * 1000,
        actions: [
          {
            label: 'Закрыть',
            color: 'white',
            handler: () => { /* ... */ },
          },
        ],
      })
    }
  })()

  return {
    onPaginate,
  }
}

function checkItemEndTime(item: Contract) {
  if (item.endTime < new Date()) {
    return {
      'text-decoration': 'line-through',
    }
  }
  return {}
}

function showDate(item: Contract) {
  if (isDateNotOk(item.startTime) || isDateNotOk(item.endTime)) {
    return ''
  }
  return formatterDate.format(item.startTime)  + ' — ' +  formatterDate.format(item.endTime)
}

function main() {
  $q = useQuasar()
  router = useRouter()

  return {
    contracts,
    searchText,
    currentPage,
    loadingVisible,
    paginationCount,
    nativeShareIsAvailable,
    showDate,
    onShowFullImage,
    onShareFullImage,
    checkItemEndTime,
    ...routerFunc(),
  }
}

export default defineComponent({
  // eslint-disable-next-line vue/multi-word-component-names
  name: 'List',
  async beforeRouteUpdate(to) {
    setValues({
      page: to.query.page,
      filter: to.query.filter,
    })
    await setContracts()
  },
  setup() {
    useMeta(metaData)
    return main()
  },
  computed: {
    isSearch() {
      return Boolean(this.$router.currentRoute.value.query.filter)
    },
    archiveEmptyText() {
      const randomContractType = Math.floor(Math.random() * (contractTypes.length - 1))
      return this.$t('archive.empty') + '. Например: ' + contractTypes[randomContractType].toLowerCase() + '.'
    },
  },
})
</script>
