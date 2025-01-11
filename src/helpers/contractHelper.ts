import { PublicKey } from '@solana/web3.js'
import { getIdentifierMessage } from './schemaHelper'
import { verifySign } from '../services/cryptoService'
import { FormatContract, WalletType } from '../types/models'

// todo перенести в сервис верификации GIC DAO
export function isVerified(item: FormatContract, publicKey: PublicKey) {
  if (!Array.isArray(item.identifier)) {
    return false
  }
  const cryptoData = item.identifier.find(({ name }) =>
    [WalletType.Phantom, WalletType.Secret].includes(name as WalletType),
  )
  if (cryptoData) {
    const message = getIdentifierMessage(item)
    return verifySign(message, cryptoData.value as string, publicKey)
  }
  return false
}
