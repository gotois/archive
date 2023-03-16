import { LocalStorage } from 'quasar'
import { Module } from 'vuex'
import { StateInterface } from './index'

export interface TutorialState {
  tutorialCompleted: boolean
}

const Tutorial: Module<TutorialState, StateInterface> = {
  namespaced: true,
  state: {
    tutorialCompleted: LocalStorage.getItem('tutorialCompleted') ?? false,
  },
  mutations: {
    tutorialComplete(state) {
      state.tutorialCompleted = true
    },
  },
  actions: {
    tutorialComplete(context) {
      LocalStorage.set('tutorialCompleted', true)
      context.commit('tutorialComplete')
    },
  },
  getters: {
    tutorialCompleted(state) {
      return state.tutorialCompleted
    },
  },
}

export default Tutorial
