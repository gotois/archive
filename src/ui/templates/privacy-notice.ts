import {Template, BLANK_PDF} from '@pdfme/generator'

// A4, значение в MM
const A4 = {
  width: 210,
  height: 297,
}

export default {
  basePdf: BLANK_PDF,
  schemas: [
    {
      text: {
        type: 'text',
        position: { x: 0, y: 0 },
        ...A4,
        fontSize: 12,
        lineHeight: 1,
        characterSpacing: 0,
      },
      image: {
        type: 'image',
        position: { x: 0, y: 0 },
        ...A4,
      },
    },
  ],
} as Template
