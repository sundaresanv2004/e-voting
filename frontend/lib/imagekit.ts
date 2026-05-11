import ImageKit from "@imagekit/nodejs";

let _imagekit: ImageKit | null = null;

/** Lazy getter — throws at request time (not build time) if env vars are missing */
export function getImageKit(): ImageKit {
  if (_imagekit) return _imagekit;

  if (!process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY) {
    throw new Error("Missing NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY");
  }
  if (!process.env.IMAGEKIT_PRIVATE_KEY) {
    throw new Error("Missing IMAGEKIT_PRIVATE_KEY");
  }
  if (!process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT) {
    throw new Error("Missing NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT");
  }

  _imagekit = new ImageKit({
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  });
  return _imagekit;
}
