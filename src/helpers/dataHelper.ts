export function getMimeType(str: string) {
  return str.match(/[^:]\w+\/[\w-+\d.]+(?=;|,)/)[0]
}
