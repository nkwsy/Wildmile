'use server';

/**
 * Fetches all locations from the API
 * @returns {Promise<Array>} Array of location objects
 */
export async function fetchLocations() {
  try {
    // In a real app, this would be your API endpoint
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/cameratrap/locations`, {
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error("Failed to fetch locations");
    }

    return await response.json();
  } catch (err) {
    console.error("Error fetching locations:", err);
    
    // Fallback to mock data for demonstration
    return [
      {
        _id: "SB_SLIP_DOCK",
        locationName: "Sunken Dock",
        active: true,
        deployments: 3,
      },
      {
        _id: "NORTH_BRANCH_EDGE",
        locationName: "North Branch Edge",
        active: true,
        deployments: 2,
      },
      {
        _id: "LINCOLN_PARK_POND",
        locationName: "Lincoln Park Pond",
        active: false,
        deployments: 1,
      },
    ];
  }
}

/**
 * Searches locations based on a query string
 * @param {string} query - The search query
 * @param {Array} locations - The array of locations to search through
 * @returns {Array} Filtered array of locations
 */
export async function searchLocations(query, locations) {
  if (!query) return locations;
  
  return locations.filter((location) =>
    location.locationName.toLowerCase().includes(query.toLowerCase())
  );
} 