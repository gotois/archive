import { defineStore } from 'pinia'
import { podApi } from '../api/modules/pod.api'
import useProfileStore from 'stores/profile'

interface State {
  resourceRootUrl: string
}

export default defineStore('pod', {
  state: (): State => ({
    resourceRootUrl: '',
  }),
  actions: {
    async initPod() {
      const result = await podApi.initialize()
      this.resourceRootUrl = result.resourceRootUrl
    },
    async removeContractsDataset() {
      await podApi.deleteContracts()
    },
    async setResourceRootUrl() {
      const profile = await podApi.getProfile()
      this.resourceRootUrl = profile.resourceRootUrl
    },
    async getProfileFOAF(): Promise<{
      name: null
      email: string | null
      avatar: string | null
    }> {
      const profile = await podApi.getProfile()
      this.resourceRootUrl = profile.resourceRootUrl
      return {
        name: null,
        email: profile.email,
        avatar: profile.avatar,
      }
    },
    async setProfileFOAF() {
      const profileStore = useProfileStore()
      const profile = await podApi.updateProfile({
        email: profileStore.email,
        avatar: profileStore.avatar,
      })
      this.resourceRootUrl = profile.resourceRootUrl
    },
    async uploadIcal(_resourceUrl: string, ical: string) {
      await podApi.updateCalendar(ical)
    },
    async getContractsLink() {
      const { links } = await podApi.getContracts()
      return links
    },
  },
  getters: {
    getResourceBaseUrl(state): string | Error {
      if (!state.resourceRootUrl) {
        throw new Error('resourceRootUrl is empty')
      }
      return state.resourceRootUrl
    },
  },
})
