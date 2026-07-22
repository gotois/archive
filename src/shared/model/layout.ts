import { defineStore } from 'pinia'

export default () => {
  const name = 'layout' + Date.now()
  return defineStore(name, {
    state: () => ({
      leftDrawerOpen: false,
      rightDrawerOpen: false,
      calendarOpen: false,
      settingsOpen: false,
      spacesOpen: false,
      languageOpen: false,
      walletOpen: false,
      profileOpen: false,
      otpOpen: false,
    }),
    actions: {
      toggleLeftDrawer() {
        this.leftDrawerOpen = !this.leftDrawerOpen
      },
    },
  })()
}
