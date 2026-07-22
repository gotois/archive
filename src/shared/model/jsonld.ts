import type { Agent, Place } from './contact'
import type { Attachment } from './media'

interface ContextCredential<T> {
  [key: string]: T
}

export enum ProofTypes {
  Ed25519Signature2020 = 'Ed25519Signature2020',
}

export interface Proof {
  challenge?: string
  created: string
  proofPurpose: string
  proofValue: string
  type: ProofTypes.Ed25519Signature2020
  verificationMethod: string
}

export type credentialContextType =
  | [string, ContextCredential<string>]
  | string[]

export interface CredentialSubject {
  '@context'?: string[]
  'name'?: string
  'description'?: string
  'actor': Agent
  'target': Agent
  'startTime': Date
  'endTime'?: Date
  'object': {
    id: string
    type: string
    name: string
    summary: string
    url?: string
    location?: string
    tag?: string[]
    attachment: Attachment[]
  }
  'location'?: Place
}

export interface VerifiableCredential {
  '@context': credentialContextType
  'credentialSubject': CredentialSubject
  'id': string
  'issuanceDate': string
  'issuer': string
  'proof'?: Proof | Proof[]
  'type': string[]
}

export interface Presentation {
  '@context': string[]
  'proof': Proof | Proof[]
  'type': string[]
  'verifiableCredential': ProofCredential[]
}

export interface ProofCredential extends VerifiableCredential {
  proof: Proof
}

export type ActivityObjectNote = {
  type: 'Note'
  content: string
  mediaType: string
}

export type ActivityObjectLink = {
  type: 'Link'
  href: string
}

export type Activity = {
  '@context': string
  'type': string
  'object'?:
    | ActivityObjectNote
    | ActivityObjectNote[]
    | ActivityObjectLink
    | ActivityObjectLink[]
    | { type: 'Activity' }
  'startTime'?: string
  'actor'?: unknown
}

export interface Suite {
  verifier: unknown
  verificationMethod: string
  useNativeCanonize: unknown
  type: string
  signer: unknown
  requiredKeyType: string
  proof: unknown
  key: unknown
  contextUrl: string
  canonizeOptions: unknown
  LDKeyClass: unknown
}
