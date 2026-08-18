export type Photo = {
  id: string;
  src: string;
  name: string;
  // Higher-res version served for downloads; falls back to `src` when absent
  // (e.g. guest uploads, which only have a single tier).
  downloadSrc?: string;
};
