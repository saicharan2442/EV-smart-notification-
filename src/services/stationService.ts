
import { Station } from '@/context/AppContext';
import { stations } from '@/data/mockData';

// Function to fetch nearby charging stations using Mapbox Geocoding API
export const fetchNearbyStations = async (
  userLocation: [number, number],
  mapboxToken: string,
  radius: number = 10000 // Default 10km radius in meters
): Promise<Station[]> => {
  try {
    // Use Mapbox's geocoding API to find EV charging stations
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/electric%20vehicle%20charging%20station.json?proximity=${userLocation[0]},${userLocation[1]}&radius=${radius}&access_token=${mapboxToken}&limit=10&country=in`
    );
    
    if (!response.ok) {
      throw new Error(`Mapbox API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.features || data.features.length === 0) {
      // If no real stations are found, use mock stations from data
      console.log("No stations found via API. Using simulated stations around Visakhapatnam.");
      return createStationsNearLocation(userLocation);
    }
    
    // Transform the data into our Station format
    const stations: Station[] = data.features.map((feature: any, index: number) => {
      // Calculate distance in km (simplified calculation)
      const stationCoords = feature.center;
      const distance = calculateDistance(
        userLocation[1], userLocation[0],
        stationCoords[1], stationCoords[0]
      );
      
      return {
        id: feature.id || `station-${index}`,
        name: feature.text || `Charging Station ${index + 1}`,
        distance: parseFloat(distance.toFixed(1)),
        available: Math.random() > 0.3, // Simulate availability (70% chance of being available)
        rating: parseFloat((3.5 + Math.random() * 1.5).toFixed(1)), // Random rating between 3.5 and 5.0
        address: feature.place_name || 'Unknown location',
        coordinates: feature.center as [number, number],
        connectorTypes: getRandomConnectorTypes(),
        price: `₹${(15 + Math.random() * 5).toFixed(2)}/kWh`, // Price in Indian Rupees
      };
    });
    
    // Sort by distance
    return stations.sort((a, b) => a.distance - b.distance);
  } catch (error) {
    console.error('Error fetching nearby stations:', error);
    // If API fails, return simulated stations around user's location
    return createStationsNearLocation(userLocation);
  }
};

// Create simulated stations around the user's location
const createStationsNearLocation = (centerLocation: [number, number]): Station[] => {
  // Use the imported static stations as a base
  const baseStations = [...stations];
  
  // Update each station with the correct distance from the user's current location
  const adjustedStations = baseStations.map(station => {
    const distance = calculateDistance(
      centerLocation[1], centerLocation[0],
      station.coordinates[1], station.coordinates[0]
    );
    
    return {
      ...station,
      distance: parseFloat(distance.toFixed(1)),
      available: Math.random() > 0.3, // Randomize availability
    };
  });
  
  // Sort by distance
  return adjustedStations.sort((a, b) => a.distance - b.distance);
};

// Haversine formula to calculate distance between two points in km
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const deg2rad = (deg: number): number => {
  return deg * (Math.PI / 180);
};

// Helper function to generate random connector types
const getRandomConnectorTypes = (): string[] => {
  const allTypes = ['CCS', 'CHAdeMO', 'Type 2', 'Bharat AC', 'Bharat DC'];
  const numTypes = 1 + Math.floor(Math.random() * 3); // 1 to 3 types
  const shuffled = [...allTypes].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, numTypes);
};
