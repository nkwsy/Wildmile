import { getExistingLocations } from "/app/actions/CameratrapActions";
import LocationSidebar from "/components/cameratrap/locations/LocationSidebar";

export default async function ServerLocationSidebar({ activeLocationId }) {
  // Fetch locations data on the server
  const locations = await getExistingLocations({ detailed: true });

  // Pass the data to the client component
  return <LocationSidebar activeLocationId={activeLocationId} initialLocations={locations} />;
} 