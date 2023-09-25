interface PhantomSolana {
  on: (
    type: 'connect' | 'disconnect' | 'accountChanged',
    callback: (arg: never) => void,
  ) => void
}
export function getSolana() {
  /* eslint-disable */
  return window?.phantom?.solana as PhantomSolana
  /* eslint-enable */
}
