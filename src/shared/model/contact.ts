export type Organization = 'Organization'
export type Person = 'Person'

export interface Agent {
  type: Organization | Person
  name: string
  email?: string
  telephone?: string
  url?: string
}

export interface GeoCoordinates {
  '@type'?: 'GeoCoordinates'
  'latitude': number
  'longitude': number
}

export interface Place {
  geo: GeoCoordinates
  name?: string
}
