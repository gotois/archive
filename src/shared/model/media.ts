interface BaseSchemaType {
  '@type': string
}

export type ImageType = {
  url: string
  mediaType: string
  name?: string
}

export type Attachment = ImageType & {
  type: string
}

export interface FormatImageType extends BaseSchemaType, ImageType {}
