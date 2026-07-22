import { afterEach, describe, expect, test, vi } from 'vitest'
import { filesShare } from './fileHelper'

function setNavigatorShare(
  canShare: (data?: ShareData) => boolean,
  share: (data?: ShareData) => Promise<void>,
) {
  Object.defineProperties(navigator, {
    canShare: { configurable: true, value: canShare },
    share: { configurable: true, value: share },
  })
}

afterEach(() => {
  Reflect.deleteProperty(navigator, 'canShare')
  Reflect.deleteProperty(navigator, 'share')
})

describe('filesShare', () => {
  test('passes exact files and a custom title to Web Share', async () => {
    const share = vi.fn().mockResolvedValue(undefined)
    const files = [new File(['agenda'], 'agenda.txt', { type: 'text/plain' })]
    setNavigatorShare(
      vi.fn(() => true),
      share,
    )

    await filesShare(files, 'Task 42')

    expect(share).toHaveBeenCalledWith({ title: 'Task 42', files })
  })

  test('uses the default title and rejects unsupported data', async () => {
    const canShare = vi.fn(() => false)
    const share = vi.fn().mockResolvedValue(undefined)
    const files = [new File(['agenda'], 'agenda.txt')]
    setNavigatorShare(canShare, share)

    await expect(filesShare(files)).rejects.toThrow(
      'Specified data cannot be shared.',
    )
    expect(canShare).toHaveBeenCalledWith({ title: 'Files', files })
    expect(share).not.toHaveBeenCalled()
  })

  test('treats user cancellation as a successful no-op', async () => {
    const share = vi
      .fn()
      .mockRejectedValue(new DOMException('Cancelled', 'AbortError'))
    setNavigatorShare(
      vi.fn(() => true),
      share,
    )

    await expect(filesShare([])).resolves.toBeUndefined()
  })

  test('rethrows non-cancellation errors', async () => {
    const error = new Error('Share failed')
    setNavigatorShare(
      vi.fn(() => true),
      vi.fn().mockRejectedValue(error),
    )

    await expect(filesShare([])).rejects.toBe(error)
  })
})
