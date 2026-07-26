export const CHATGPT_HOST_SELECTOR =
  'meta[name="secretary-host"][content="chatgpt"]'

export function isChatGPTHost(document: Document): boolean {
  return document.querySelector(CHATGPT_HOST_SELECTOR) !== null
}
