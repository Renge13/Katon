'use client';
// 9:16 PNG export of the sharecard. Renders the 360×640 node at ×3 → 1080×1920.

import { toPng } from 'html-to-image';

export async function exportSharecardPNG(nodeId = 'sharecard', filename = 'katon.png') {
  if (typeof document === 'undefined') throw new Error('export must run in the browser');
  await document.fonts.ready;
  const node = document.getElementById(nodeId);
  if (!node) throw new Error(`#${nodeId} not found`);

  const scale = 3; // 360→1080
  const dataUrl = await toPng(node, {
    width: 1080,
    height: 1920,
    pixelRatio: 1,
    cacheBust: true,
    style: {
      transform: `scale(${scale})`,
      transformOrigin: 'top left',
      width: '360px',
      height: '640px',
    },
  });

  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  link.click();
}
