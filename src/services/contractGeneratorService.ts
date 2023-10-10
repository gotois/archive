import { OwnerContract, Credential } from '../types/models'

export function mintContract(contract: OwnerContract) {
  return {
    credentialSubject: {
      agent: contract?.agent,
      participant: contract?.participant,
      instrument: contract?.instrument,
      object: contract.files,
    },
  } as Credential
}
