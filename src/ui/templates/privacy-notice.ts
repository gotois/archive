import { Template, BLANK_PDF } from '@pdfme/common'

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
        position: { x: 8, y: 8 },
        width: A4.width - 16,
        height: A4.height - 16,
        backgroundColor: '#ffffff',
        fontColor: '#000000',
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
