import { list } from "@vercel/blob";
import type { Photo } from "../types";

export const PARTY_PHOTOS_PREFIX = "party-photos/";
export const GUEST_PHOTOS_PREFIX = "guest-photos/";

export async function getPartyPhotos(): Promise<Photo[]> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return [];

  const { blobs } = await list({ prefix: PARTY_PHOTOS_PREFIX });

  return blobs
    .map((blob) => ({
      id: blob.pathname.slice(PARTY_PHOTOS_PREFIX.length),
      src: blob.url,
      name: blob.pathname.slice(PARTY_PHOTOS_PREFIX.length),
    }))
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
