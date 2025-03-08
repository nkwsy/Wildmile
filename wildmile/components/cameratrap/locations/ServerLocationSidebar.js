import { getExistingLocations } from "/app/actions/CameratrapActions";
import LocationSidebar from "./LocationSidebar";

export default async function ServerLocationSidebar({ activeLocationId }) {
  // Fetch locations data on the server
  const locationsJson = await getExistingLocations({ detailed: true });
  
  // Parse the JSON string into an array of objects
  const locations = JSON.parse(locationsJson);

  // Pass the data to the client component
  return <LocationSidebar activeLocationId={activeLocationId} initialLocations={locations} />;
} 