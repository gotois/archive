import { describe, expect, test } from 'vitest'
import { buildShareParams } from './shareHelper'

describe('buildShareParams', () => {
  test.each([
    [42, { id_task: 42 }],
    ['42', { id_task: 42 }],
    [' 42 ', { id_task: 42 }],
  ])('normalizes %j to a single id_task', (taskId, expected) => {
    expect(buildShareParams(taskId)).toEqual(expected)
    expect(Object.keys(buildShareParams(taskId))).toEqual(['id_task'])
  })

  test.each(['', '  ', 'not-a-number', 0, -1, 1.5, Number.NaN])(
    'rejects invalid task id %j',
    (taskId) => {
      expect(() => buildShareParams(taskId)).toThrow('Invalid task ID')
    },
  )
})
