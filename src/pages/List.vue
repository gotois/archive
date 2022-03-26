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

const closeIconBase64 = 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiA/PjwhRE9DVFlQRSBzdmcgIFBVQkxJQyAnLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4nICAnaHR0cDovL3d3dy53My5vcmcvR3JhcGhpY3MvU1ZHLzEuMS9EVEQvc3ZnMTEuZHRkJz48c3ZnIGhlaWdodD0iNTEycHgiIGlkPSJMYXllcl8xIiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA1MTIgNTEyOyIgdmVyc2lvbj0iMS4xIiB2aWV3Qm94PSIwIDAgNTEyIDUxMiIgd2lkdGg9IjUxMnB4IiB4bWw6c3BhY2U9InByZXNlcnZlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIj48cGF0aCBkPSJNNDQzLjYsMzg3LjFMMzEyLjQsMjU1LjRsMTMxLjUtMTMwYzUuNC01LjQsNS40LTE0LjIsMC0xOS42bC0zNy40LTM3LjZjLTIuNi0yLjYtNi4xLTQtOS44LTRjLTMuNywwLTcuMiwxLjUtOS44LDQgIEwyNTYsMTk3LjhMMTI0LjksNjguM2MtMi42LTIuNi02LjEtNC05LjgtNGMtMy43LDAtNy4yLDEuNS05LjgsNEw2OCwxMDUuOWMtNS40LDUuNC01LjQsMTQuMiwwLDE5LjZsMTMxLjUsMTMwTDY4LjQsMzg3LjEgIGMtMi42LDIuNi00LjEsNi4xLTQuMSw5LjhjMCwzLjcsMS40LDcuMiw0LjEsOS44bDM3LjQsMzcuNmMyLjcsMi43LDYuMiw0LjEsOS44LDQuMWMzLjUsMCw3LjEtMS4zLDkuOC00LjFMMjU2LDMxMy4xbDEzMC43LDEzMS4xICBjMi43LDIuNyw2LjIsNC4xLDkuOCw0LjFjMy41LDAsNy4xLTEuMyw5LjgtNC4xbDM3LjQtMzcuNmMyLjYtMi42LDQuMS02LjEsNC4xLTkuOEM0NDcuNywzOTMuMiw0NDYuMiwzODkuNyw0NDMuNiwzODcuMXoiLz48L3N2Zz4=';
const closeIconStyle = `
  position: fixed;
  right: 2em;
  top: 2em;
  width: 2em;
  height: 2em;
`;
const paginationCount = ref(0)
const contracts = ref([])
const searchText = ref('')
const limit = ref(5)
const currentPage = ref(1)
const loadingVisible = ref(false)

function showFullImage(base64String: string) {
  const newWin = window.open('about:blank', '_blank');
  // eslint-disable-next-line @typescript-eslint/restrict-template-expressions,@typescript-eslint/unbound-method
  newWin!.document.write(`<a href="javascript: self.close()">
        <img src="${closeIconBase64}" style="${closeIconStyle}">
    </a>
    <img src="${base64String}">
  `);
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
