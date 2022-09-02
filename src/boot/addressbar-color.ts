import {AddressbarColor} from 'quasar'
import {boot} from 'quasar/wrappers'

// more info on params: https://v2.quasar.dev/quasar-cli/boot-files
export default boot((/* { app, router, ... } */) => {
  AddressbarColor.set('#a2e3fa')
})
