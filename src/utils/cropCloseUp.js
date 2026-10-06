export async function cropCloseUp(src, region, scale = 1) {
  const image = new Image();
  image.src = src;
  await image.decode();
  const x = Math.floor(region.x * image.naturalWidth);
  const y = Math.floor(region.y * image.naturalHeight);
  const width = Math.max(1, Math.min(image.naturalWidth - x, Math.round(region.width * image.naturalWidth)));
  const height = Math.max(1, Math.min(image.naturalHeight - y, Math.round(region.height * image.naturalHeight)));
  const canvas = document.createElement('canvas');
  const factor = Math.min(scale, 4096 / Math.max(width, height));
  canvas.width = Math.max(1, Math.round(width * factor));
  canvas.height = Math.max(1, Math.round(height * factor));
  const context = canvas.getContext('2d');
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = 'high';
  context.drawImage(image, x, y, width, height, 0, 0, canvas.width, canvas.height);
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
  if (!blob) throw new Error('클로즈업 이미지를 만들지 못했습니다.');
  return URL.createObjectURL(blob);
}


