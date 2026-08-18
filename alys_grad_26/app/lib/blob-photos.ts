import { list } from "@vercel/blob";
import type { Photo } from "../types";

export const PARTY_PHOTOS_PREFIX = "party-photos/";
export const PARTY_PHOTOS_DOWNLOAD_PREFIX = "party-photos-download/";
export const GUEST_PHOTOS_PREFIX = "guest-photos/";

export async function getPartyPhotos(): Promise<Photo[]> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return [];

  const [{ blobs: display }, { blobs: downloads }] = await Promise.all([
    list({ prefix: PARTY_PHOTOS_PREFIX }),
    list({ prefix: PARTY_PHOTOS_DOWNLOAD_PREFIX }),
  ]);

  const downloadUrlById = new Map(
    downloads.map((blob) => [blob.pathname.slice(PARTY_PHOTOS_DOWNLOAD_PREFIX.length), blob.url])
  );

  return display
    .map((blob) => {
      const id = blob.pathname.slice(PARTY_PHOTOS_PREFIX.length);
      return {
        id,
        src: blob.url,
        name: id,
        downloadSrc: downloadUrlById.get(id),
      };
    })
    .sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));
}

export async function getGuestPhotos(): Promise<Photo[]> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return [];

  const { blobs } = await list({ prefix: GUEST_PHOTOS_PREFIX });

  return blobs
    .sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime())
    .map((blob) => ({
      id: blob.pathname,
      src: blob.url,
      name: blob.pathname.slice(GUEST_PHOTOS_PREFIX.length),
    }));
}
