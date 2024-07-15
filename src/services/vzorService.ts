// todo rename to secretaryService.ts
import { uid } from 'quasar'
import requestJsonRpc2 from 'request-json-rpc2'

// todo - перенести это в тайпинги библиотеки request-json-rpc2
interface JSONRPCResponse {
  jsonrpc: string
  id: string | null
  result?: string
  error?: {
    code: number
    message: string
  }
}

export default function (
  method: string,
  params: {
    '@context': string
    'type': string
    'object'?: { type: string; mediaType: string }[]
    'startTime'?: string
  },
) {
  if (!process.env.server) {
    throw new Error('Unknown JSON-RPC2 server url')
  }
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  return requestJsonRpc2({
    url: process.env.server,
    body: {
      jsonrpc: '2.0',
      method,
      params,
      id: uid(),
    },
    auth: {
      user: process.env.server_basic_auth_user,
      pass: process.env.server_basic_auth_pass,
    },
  }) as Promise<JSONRPCResponse>
}
