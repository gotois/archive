import { describe, expect, test } from 'vitest'
import { isChatGPTHost } from './chatgptHost'

describe('isChatGPTHost', () => {
  test('detects the exact ChatGPT resource marker', () => {
    document.head.innerHTML = '<meta name="secretary-host" content="chatgpt">'

    expect(isChatGPTHost(document)).toBe(true)
  })

  test('does not treat another host value as ChatGPT', () => {
    document.head.innerHTML = '<meta name="secretary-host" content="telegram">'

    expect(isChatGPTHost(document)).toBe(false)
  })
})
