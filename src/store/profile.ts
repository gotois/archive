import { LocalStorage } from 'quasar'
import { Module } from 'vuex'
import { StateInterface } from './index'

export interface ProfileState {
  consumer: string
}

const Profile: Module<ProfileState, StateInterface> = {
  state: () => ({
    consumer: LocalStorage.getItem('consumer') ?? '',
  }),
  mutations: {
    consumerName(state, name: string) {
      state.consumer = name
    },
  },
  actions: {
    consumerName(context, value: string) {
      LocalStorage.set('consumer', value)
      context.commit('consumerName', value)
    },
  },
  getters: {
    consumer(state) {
      return state.consumer
    },
  },
}

export default Profile
