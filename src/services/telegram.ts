export const TELEGRAM_BOT_NAME = process.env.telegram_bot_name

export function appendTelegramWebAppScript(
  cb?: () => void,
  errorCb?: () => void,
) {
  const script = document.createElement('script')
  script.type = 'text/javascript'
  script.src = 'https://telegram.org/js/telegram-web-app.js'
  if (cb) {
    script.onload = () => {
      cb()
    }
  }
  if (errorCb) {
    script.onerror = () => {
      errorCb()
    }
  }
  document.head.appendChild(script)
}
