export const TG_BOT_NAME = 'gotois_bot'

export function appendTelegramWebAppScript(
  cb: () => void,
  errorCb: () => void,
) {
  const script = document.createElement('script')
  script.type = 'text/javascript'
  script.src = 'https://telegram.org/js/telegram-web-app.js'
  script.onload = () => {
    cb()
  }
  script.onerror = () => {
    errorCb()
  }
  document.head.appendChild(script)
}
