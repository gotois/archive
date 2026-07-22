import { beforeEach, describe, expect, test, vi } from 'vitest'
import type { ContractTable } from '@/entities/contract'

const databaseMock = vi.hoisted(() => ({
  tasks: [] as ContractTable[],
}))

vi.mock('quasar', async (importOriginal) => {
  const original = await importOriginal<typeof import('quasar')>()
  const storage = {
    getItem: vi.fn(() => null),
    has: vi.fn(() => false),
    set: vi.fn(),
  }
  return {
    ...original,
    LocalStorage: storage,
    SessionStorage: storage,
  }
})

vi.mock('@/shared/lib/databaseService', () => ({
  db: {
    getContractNames: vi.fn(async () => new Map()),
    contracts: {
      filter: (predicate: (task: ContractTable) => boolean) => ({
        toArray: vi.fn(async () => databaseMock.tasks.filter(predicate)),
      }),
    },
  },
}))

import { getCalendarContracts } from '@/features/contract-calendar'

function createTask(
  id: number,
  startTime: string,
  endTime: string,
): ContractTable {
  return {
    id,
    resolver: `https://example.com/tasks/${id}`,
    context: ['https://www.w3.org/2018/credentials/v1'],
    type: ['VerifiableCredential'],
    issuer: 'https://example.com/users/1',
    issuanceDate: new Date('2026-01-01T00:00:00Z'),
    organizer: { type: 'Person', name: 'Organizer' },
    participant: [],
    name: `Task ${id}`,
    startTime: new Date(startTime),
    endTime: new Date(endTime),
    tag: [],
    attachment: [],
  }
}

beforeEach(() => {
  databaseMock.tasks = []
})

describe('contract store calendar behavior', () => {
  test('returns inclusive overlaps formatted in the selected timezone', async () => {
    databaseMock.tasks = [
      createTask(1, '2026-01-01T23:00:00Z', '2026-01-02T00:00:00Z'),
      createTask(2, '2026-01-02T01:00:00Z', '2026-01-02T02:00:00Z'),
      createTask(3, '2026-01-02T02:00:01Z', '2026-01-02T03:00:00Z'),
    ]
    const events = await getCalendarContracts({
      from: new Date('2026-01-02T00:00:00Z'),
      to: new Date('2026-01-02T01:00:00Z'),
      timeZone: 'Asia/Tokyo',
    })

    expect(events).toHaveLength(2)
    expect(events.map(({ id }) => id)).toEqual([1, 2])
    expect(events[0]).toMatchObject({
      start: '2026-01-02 08:00',
      end: '2026-01-02 09:00',
    })
  })
})
