export const appendErundaScript = () => {
  const script = document.createElement('script')
  script.src = 'https://cdn.jsdelivr.net/npm/eruda'
  document.body.append(script)
  script.onload = function () {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access,no-undef
    eruda.init()
  }
}
