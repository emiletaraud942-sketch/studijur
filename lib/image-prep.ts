// Compression côté navigateur des photos de cours avant envoi au serveur.
// Une photo de smartphone pèse facilement 3 à 8 Mo : on la redimensionne et
// on la recompresse en JPEG pour rester largement sous la limite de charge
// utile des fonctions Vercel, même avec plusieurs pages envoyées ensemble.

export type PreparedImage = { mediaType: "image/jpeg"; base64: string };

const MAX_DIM = 1600;
const TARGET_BYTES = 700_000;

export async function prepareImage(file: File): Promise<PreparedImage> {
  const img = await loadImage(file);
  const { width, height } = fitDimensions(img.naturalWidth || img.width, img.naturalHeight || img.height, MAX_DIM);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas indisponible sur cet appareil.");
  ctx.drawImage(img, 0, 0, width, height);

  let quality = 0.82;
  let dataUrl = canvas.toDataURL("image/jpeg", quality);
  while (dataUrl.length * 0.75 > TARGET_BYTES && quality > 0.4) {
    quality -= 0.12;
    dataUrl = canvas.toDataURL("image/jpeg", quality);
  }

  const base64 = dataUrl.split(",")[1];
  if (!base64) throw new Error("Échec de la compression de l'image.");
  return { mediaType: "image/jpeg", base64 };
}

function fitDimensions(w: number, h: number, maxDim: number): { width: number; height: number } {
  if (w <= maxDim && h <= maxDim) return { width: w, height: h };
  const ratio = w > h ? maxDim / w : maxDim / h;
  return { width: Math.max(1, Math.round(w * ratio)), height: Math.max(1, Math.round(h * ratio)) };
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Cette photo ne peut pas être lue."));
    };
    img.src = url;
  });
}
