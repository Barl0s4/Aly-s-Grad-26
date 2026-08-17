import PartyPage from "./components/PartyPage";
import { getPartyPhotos, getGuestPhotos } from "./lib/blob-photos";

export default async function Home() {
  const [photos, guestPhotos] = await Promise.all([getPartyPhotos(), getGuestPhotos()]);
  return <PartyPage photos={photos} guestPhotos={guestPhotos} />;
}
