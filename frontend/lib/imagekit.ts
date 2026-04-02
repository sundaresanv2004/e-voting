import ImageKit from "@imagekit/nodejs";

if (!process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY) {
  throw new Error("Missing NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY");
}

if (!process.env.IMAGEKIT_PRIVATE_KEY) {
  throw new Error("Missing IMAGEKIT_PRIVATE_KEY");
}

if (!process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT) {
  throw new Error("Missing NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT");
}

export const imagekit = new ImageKit({
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
});
