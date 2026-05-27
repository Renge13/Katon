import { toPng } from 'html-to-image'

/* Export the new image-overlay BaziCardImage as a 1080x1920 PNG.
   The displayed card is 390x693; we scale 2.77x (1080/390) for export. */

export async function exportCardImage(cardId = 'bazi-card', filename = 'katon-matahari.png') {
  if (typeof document === 'undefined') {
    throw new Error('exportCardImage must run in the browser')
  }

  await document.fonts.ready

  const node = document.getElementById(cardId)
  if (!node) {
    throw new Error(`Card node #${cardId} not found`)
  }

  const scale = 1080 / 390

  const dataUrl = await toPng(node, {
    width: 1080,
    height: 1920,
    pixelRatio: 1,
    cacheBust: true,
    style: {
      transform: `scale(${scale})`,
      transformOrigin: 'top left',
      width: '390px',
      height: '693px',
    },
  })

  const link = document.createElement('a')
  link.download = filename
  link.href = dataUrl
  link.click()
}
