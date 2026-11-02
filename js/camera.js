// Camera capture: live preview via getUserMedia, square crop, resized JPEG blob.
const SIZE = 400;
let stream = null;

export function supported() {
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
}

export async function start(video, facing = 'user') {
  stop();
  stream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode: facing, width: { ideal: 1280 }, height: { ideal: 1280 } },
    audio: false,
  });
  video.srcObject = stream;
  video.classList.toggle('mirror', facing === 'user');
  await video.play();
}

export function stop() {
  if (stream) stream.getTracks().forEach((t) => t.stop());
  stream = null;
}

function cropToBlob(source, w, h, mirror) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = SIZE;
  const ctx = canvas.getContext('2d');
  const side = Math.min(w, h);
  if (mirror) { ctx.translate(SIZE, 0); ctx.scale(-1, 1); }
  ctx.drawImage(source, (w - side) / 2, (h - side) / 2, side, side, 0, 0, SIZE, SIZE);
  return new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.85));
}

export function snap(video) {
  return cropToBlob(video, video.videoWidth, video.videoHeight, video.classList.contains('mirror'));
}

// Fallback for devices without getUserMedia: an <input type=file capture> image.
export async function fromFile(file) {
  const bmp = await createImageBitmap(file);
  return cropToBlob(bmp, bmp.width, bmp.height, false);
}
