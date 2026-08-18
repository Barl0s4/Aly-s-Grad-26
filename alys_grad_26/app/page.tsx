import PartyPage from "./components/PartyPage";
import { getPartyPhotos, getGuestPhotos } from "./lib/blob-photos";

// This page reads live from Blob storage — new guest uploads and photo
// updates need to show up for every visitor without a redeploy, so it
// can't be statically cached.
export const dynamic = "force-dynamic";

export default async function Home() {
  const [photos, guestPhotos] = await Promise.all([getPartyPhotos(), getGuestPhotos()]);
  return <PartyPage photos={photos} guestPhotos={guestPhotos} />;
}
