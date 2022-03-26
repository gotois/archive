<template>
  <q-page class="row items-stretch justify-center">
    <q-inner-loading :showing="loadingVisible">
      <q-spinner-gears size="50px" color="primary"/>
    </q-inner-loading>
    <q-form
      v-if="paginationCount >= 1"
      class="col-10 q-pa-md q-gutter-sm"
      @submit="onSearchText"
    >
      <q-input v-model="searchText"
               :label="$t('archive.search')"
               input-class="text-left">
        <template #append>
          <q-icon
            class="cursor-pointer"
            name="search"
            @click="onSearchText"/>
        </template>
      </q-input>
    </q-form>
    <q-virtual-scroll
      v-if="contracts.length"
      :items="contracts"
      separator
      class="col-12"
    >
      <template #default="{ item, index }">
        <q-card
          :key="index"
          class="q-ma-lg "
          flat
          bordered>
          <div class="row">
            <q-img
              v-for="(object, objectIndex) in item.object"
              :key="objectIndex"
              class="col"
              :ratio="4/3"
              :fit="'contain'"
              :src="object.contentUrl"
              style="max-height: 420px;"
              @click="showFullImage(object.contentUrl)"
              loading="lazy"
              no-native-menu
            />
          </div>
          <q-card-section>
            <div class="text-overline text-orange-9">
              {{ item.startTime.toLocaleDateString() }} - {{ item.endTime.toLocaleDateString() }}
            </div>
            <div class="row">
              <div class="text-black">
                {{ item.agent.name }}
              </div>
              <q-space/>
              <div class="text-black">
                {{ item.participant.name }}
              </div>
            </div>
            <q-separator/>
            <div class="text-h5 q-mt-sm q-mb-xs">{{ item.instrument.name }}</div>
            <div class="text-caption text-grey">{{ item.instrument.description }}</div>
          </q-card-section>
        </q-card>
      </template>
    </q-virtual-scroll>
    <template v-if="paginationCount >= 1">
      <div class="col-12 q-pa-lg flex flex-center">
        <q-pagination
          v-model="currentPage"
          :max="paginationCount"
          direction-links
          @update:model-value="onPaginate"
        />
      </div>
    </template>
    <template v-else>
      <div class="col-12 q-pa-lg flex flex-center">
        <q-banner class="bg-red-9 text-white" style="padding: 2em;">
          {{ $t('archive.empty') }} 😢
        </q-banner>
      </div>
    </template>
  </q-page>
</template>

<script lang="ts">
import {useRouter} from 'vue-router'
import {
  defineComponent,
  ref,
} from 'vue'
import {db} from 'components/ContractDatabase'
import {Contract} from 'components/models'
import {formatterContracts} from '../services/schemaHelper'

const paginationCount = ref(0)
const contracts = ref([])
const searchText = ref('')
const limit = ref(5)
const currentPage = ref(1)
const loadingVisible = ref(false)

function showFullImage(base64String: string) {
  const newWin = window.open("about:blank", "fullscreen", "popup=1");
  newWin!.document.write('<img src="' + base64String + '">');
}

async function setContracts() {
  loadingVisible.value = true
  contracts.value = []
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  const offset = (currentPage.value - 1) * limit.value
  const queryFilter = searchText.value

  if (queryFilter.length > 0) {
    const count: number = await db.contracts.where('instrument_name').startsWithAnyOfIgnoreCase([queryFilter]).count()
    if (count) {
      const data: Array<Contract | any> = await db.contracts.where('instrument_name').startsWithAnyOfIgnoreCase([queryFilter]).reverse().offset(offset).limit(limit.value).toArray()
      const formContracts: any = formatterContracts(data as Contract[])
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
      contracts.value = formContracts
      paginationCount.value = Math.ceil(count / limit.value)
    } else {
      paginationCount.value = 0
    }
  } else {
    const count: number = await db.contracts.count()
    if (count) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const data: Array<Contract | any> = await db.contracts.reverse().offset(offset).limit(limit.value).toArray()
      const formContracts: any = formatterContracts(data as Contract[])
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
      contracts.value = formContracts
      console.log(count / limit.value)
      paginationCount.value = Math.ceil(count / limit.value)
    } else {
      paginationCount.value = 0
    }
  }
  loadingVisible.value = false
}

function setValues({page, filter}: any) {
  currentPage.value = Number(page ?? 1)
  searchText.value = String(filter ?? '')
}

function routerFunc() {
  const router = useRouter()
  setValues({
    page: router.currentRoute.value.query.page,
    filter: router.currentRoute.value.query.filter
  })

  void (async (): Promise<void> => {
    await setContracts()
  })()

  return {
    onPaginate(page: string) {
      void router.push({
        path: 'archive',
        query: {
          filter: searchText.value,
          page: Number(page),
        }
      })
    },
    onSearchText() {
      void router.push({
        path: 'archive',
        query: {
          filter: searchText.value,
          page: 1,
        }
      })
    }
  }
}

export default defineComponent({
  // eslint-disable-next-line vue/multi-word-component-names
  name: 'List',

  async beforeRouteUpdate(to: any) {
    setValues({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-assignment
      page: to.query.page,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-assignment
      filter: to.query.filter
    })
    await setContracts()
  },

  setup() {
    return {
      contracts,
      searchText,
      currentPage,
      loadingVisible,
      paginationCount,
      showFullImage,
      ...routerFunc(),
    }
  }
})
</script>
