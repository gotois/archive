export class HttpError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'HttpError'
    this.status = status
  }
}

export function getHttpStatus(error: unknown): number | undefined {
  return error instanceof HttpError ? error.status : undefined
}

export async function requestText(
  url: string,
  init?: RequestInit,
): Promise<string> {
  const response = await fetch(url, init)

  if (!response.ok) {
    throw new HttpError(
      response.status,
      `${response.status} ${response.statusText}`,
    )
  }

  return response.text()
}
