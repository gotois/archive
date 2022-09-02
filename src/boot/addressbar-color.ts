import {AddressbarColor} from 'quasar'
import {boot} from 'quasar/wrappers'

// more info on params: https://v2.quasar.dev/quasar-cli/boot-files
export default boot(({urlPath}) => {
  switch (urlPath) {
    case '/tutorial': {
      AddressbarColor.set('#31CCEC')
      break
    }
    default: {
      AddressbarColor.set('#ffffff')
      break
    }
  }
})
