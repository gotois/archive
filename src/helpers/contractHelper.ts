import { PublicKey } from '@solana/web3.js'
import { getIdentifierMessage } from './schemaHelper'
import { verifySign, WalletType } from '../services/cryptoService'
import { FormatContract } from '../types/models'

export function isVerified(item: FormatContract, publicKey: PublicKey) {
  const cryptoData = item.identifier.find(({ name }) =>
    [WalletType.Phantom, WalletType.Secret].includes(name),
  )
  if (cryptoData) {
    const message = getIdentifierMessage(item)
    return verifySign(message, cryptoData.value as string, publicKey.toString())
  }
  return false
}
