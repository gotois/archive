export async function resizeImageA4(dataUrl: string) {
  const MAX_WIDTH = 794
  const MAX_HEIGHT = 1123

  const img = new Image()
  img.src = dataUrl
  await img.decode()
  let {width, height} = img

  // resizing logic portrait
  if (width > height) {
    if (width > MAX_WIDTH) {
      height *= MAX_WIDTH / width
      width = MAX_WIDTH
    }
  } else if (height > MAX_HEIGHT) {
    width *= MAX_HEIGHT / height
    height = MAX_HEIGHT
  }

  return {
    width: Number(Math.floor(width)),
    height: Number(Math.floor(height)),
  }
}
