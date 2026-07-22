import { db } from '@/shared/lib/databaseService'
import type { ContractTable } from '../model/types'

export async function getContractsInRange({
  from,
  to,
}: {
  from: Date
  to: Date
}): Promise<ContractTable[]> {
  return db.contracts
    .filter((contract) => {
      const start = contract.startTime.getTime()
      const end = (contract.endTime ?? contract.startTime).getTime()
      return start <= to.getTime() && end >= from.getTime()
    })
    .toArray()
}
