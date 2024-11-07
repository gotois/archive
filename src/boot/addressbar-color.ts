import { AddressbarColor, Dark } from 'quasar'
import { boot } from 'quasar/wrappers'
import { ROUTE_NAMES } from 'src/router/routes'

// more info on params: https://v2.quasar.dev/quasar-cli/boot-files
export default boot(({ urlPath }) => {
  if (Dark.isActive) {
    AddressbarColor.set('#000000')
    return
  }

  switch (urlPath) {
    case '/' + ROUTE_NAMES.TUTORIAL: {
      AddressbarColor.set('#31CCEC')
      break
    }
    default: {
      AddressbarColor.set('#ffffff')
      break
    }
  }
})
