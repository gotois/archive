import { LocalStorage } from 'quasar'
import { defineStore } from 'pinia'
import { Secret, TOTP } from 'otpauth'
import {
  createRandomSecret,
  issuer,
  digits,
  period,
  productName,
} from '../helpers/tfa'
import { createQR } from '../helpers/qrHelper'

interface Store {
  activated: boolean
  secret: Secret
}

export default defineStore('tfa', {
  state: (): Store => ({
    activated: LocalStorage.has('secret'),
    secret: LocalStorage.has('secret')
      ? Secret.fromBase32(LocalStorage.getItem('secret'))
      : null,
  }),
  actions: {
    activate2fa() {
      this.activated = true
      LocalStorage.set('secret', this.secret.base32)
    },
    deactivate2fa() {
      LocalStorage.removeItem('secret')
      this.activated = false
      this.secret = null
    },
    // Validate a token (returns the token delta or null if it is not found in the search window, in which case it should be considered invalid)
    verify(token: string) {
      const delta = TOTP.validate({
        token: token,
        secret: this.secret,
        digits,
        period,
        window: 1,
      })
      return delta !== null
    },
    async generate() {
      this.secret = createRandomSecret()
      const totp = new TOTP({
        issuer,
        label: productName,
        digits,
        period,
        secret: this.secret,
      })
      const uri = totp.toString()

      return {
        uri: uri,
        qr: await createQR(uri),
      }
    },
  },
})
