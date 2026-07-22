export function mailUrl(email: string, subject: string, link: string) {
  let str = email
  if (email) {
    const bccEmail = email.replace('mailto:', '')
    str += '?bcc=' + bccEmail
  }
  if (subject) {
    str += '&subject=' + subject
  }
  let body = `Hello ${link}.\n\n`
  if (body) {
    body += `Link: ${link}`
  }
  if (body) {
    str += '&body=' + encodeURIComponent(body)
  }
  return str
}
