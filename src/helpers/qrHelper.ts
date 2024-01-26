import QRCode from 'qrcode'

export function createQR(url: string) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-call
  return QRCode.toDataURL(url) as Promise<string>
}
