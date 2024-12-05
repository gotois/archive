export default async function () {
  const trace = await fetch('https://1.1.1.1/cdn-cgi/trace')
  const data = await trace.text()
  const arr = data
    .trim()
    .split('\n')
    .map((e) => e.split('='))

  return Object.fromEntries(arr) as {
    colo: string
    fl: string
    gateway: string
    h: string
    http: string
    ip: string
    kex: string
    loc: string
    rbi: string
    silver: string
    sni: string
    tls: string
    ts: string
    uag: string
    visit_scheme: string
    warp: string
  }
}
