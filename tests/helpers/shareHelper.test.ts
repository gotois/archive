import { describe, expect, test } from 'vitest'
import { buildShareParams } from '@/helpers/shareHelper'

describe('buildShareParams', () => {
  test.each([
    [42, { task_id: 42 }],
    ['42', { task_id: 42 }],
    [' 42 ', { task_id: 42 }],
  ])('normalizes %j to a single task_id', (taskId, expected) => {
    expect(buildShareParams(taskId)).toEqual(expected)
    expect(Object.keys(buildShareParams(taskId))).toEqual(['task_id'])
  })

  test.each(['', '  ', 'not-a-number', 0, -1, 1.5, Number.NaN])(
    'rejects invalid task id %j',
    (taskId) => {
      expect(() => buildShareParams(taskId)).toThrow('Invalid task ID')
    },
  )
})
