export function isContentPDF(contentUrl: string) {
  return contentUrl.startsWith('data:application/pdf;', 0)
}

export function isContentHeic(contentUrl: string) {
  return contentUrl.startsWith('data:image/heic;', 0)
}
