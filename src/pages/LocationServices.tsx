
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Target, Navigation, Search, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PageTransition from '@/components/layout/PageTransition';
import Card, { CardContent, CardHeader, CardTitle } from '@/components/shared/Card';
import Button from '@/components/shared/Button';
import MapView from '@/components/map/MapView';
import { useApp } from '@/context/AppContext';
import { useMapbox } from '@/context/MapboxContext';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { fetchNearbyStations } from '@/services/stationService';

const LocationServices = () => {
  const navigate = useNavigate();
  const { userLocation, setUserLocation, setNearbyStations, setSelectedStation } = useApp();
  const { mapboxToken, isMapboxReady } = useMapbox();
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingStations, setIsLoadingStations] = useState(false);
  const [currentCoordinates, setCurrentCoordinates] = useState<{ lat: number, lng: number } | null>(null);

  // Fetch location suggestions based on user input
  useEffect(() => {
    if (!searchQuery.trim() || !isMapboxReady || !mapboxToken) {
      setSuggestions([]);
      return;
    }

    const fetchSuggestions = async () => {
      setIsSearching(true);
      try {
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchQuery)}.json?country=in&proximity=${userLocation[0]},${userLocation[1]}&access_token=${mapboxToken}&limit=5`
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch suggestions');
        }
        
        const data = await response.json();
        setSuggestions(data.features || []);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        toast.error('Error', {
          description: 'Failed to fetch location suggestions.',
        });
      } finally {
        setIsSearching(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      fetchSuggestions();
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, mapboxToken, isMapboxReady, userLocation]);

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      toast.loading('Getting your location...', { id: 'location-loader' });
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { longitude, latitude } = position.coords;
          setUserLocation([longitude, latitude]);
          setCurrentCoordinates({ lat: latitude, lng: longitude });
          
          toast.dismiss('location-loader');
          toast.success('Location updated', {
            description: 'Your current location has been updated on the map.',
          });
          
          // Fetch nearby stations when location is updated
          fetchStations([longitude, latitude]);
        },
        (error) => {
          toast.dismiss('location-loader');
          console.error('Error getting location:', error);
          
          let errorMessage = 'Unable to get your current location. Please try again.';
          
          switch(error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location access was denied. Please enable location services in your browser settings.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information is unavailable. Please try again later.';
              break;
            case error.TIMEOUT:
              errorMessage = 'The request to get your location timed out. Please try again.';
              break;
          }
          
          toast.error('Location error', {
            description: errorMessage,
          });
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    } else {
      toast.error('Geolocation not supported', {
        description: 'Your browser does not support geolocation.',
      });
    }
  };

  const handleSetVisakhapatnamLocation = () => {
    // Updated Visakhapatnam, Andhra Pradesh, India coordinates - city center
    setUserLocation([83.3184, 17.7268]);
    setCurrentCoordinates({ lat: 17.7268, lng: 83.3184 });
    
    toast.success('Location set to Visakhapatnam', {
      description: 'Map has been centered on Visakhapatnam, Andhra Pradesh, India.',
    });
    
    // Fetch nearby stations for Visakhapatnam
    fetchStations([83.3184, 17.7268]);
  };
  
  const handleSelectSuggestion = (suggestion: any) => {
    if (suggestion && suggestion.center) {
      const [longitude, latitude] = suggestion.center;
      setUserLocation([longitude, latitude]);
      setCurrentCoordinates({ lat: latitude, lng: longitude });
      setSearchQuery('');
      setSuggestions([]);
      
      toast.success('Location updated', {
        description: `Map has been centered on ${suggestion.place_name}.`,
      });
      
      // Fetch nearby stations for the selected location
      fetchStations([longitude, latitude]);
    }
  };
  
  const fetchStations = async (location: [number, number]) => {
    if (!isMapboxReady || !mapboxToken) return;
    
    setIsLoadingStations(true);
    try {
      const stations = await fetchNearbyStations(location, mapboxToken);
      setNearbyStations(stations);
      toast.success('Stations found', {
        description: `Found ${stations.length} charging stations nearby.`,
      });
    } catch (error) {
      console.error('Error fetching stations:', error);
      toast.error('Error', {
        description: 'Failed to fetch nearby charging stations.',
      });
    } finally {
      setIsLoadingStations(false);
    }
  };
  
  const handleNavigateToStation = (station: any) => {
    setSelectedStation(station);
    navigate('/navigation');
  };

  return (
    <PageTransition>
      <div className="container max-w-6xl mx-auto pt-24 px-4 pb-16">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10 text-center"
        >
          <h1 className="text-3xl font-bold">Location Services</h1>
          <p className="text-muted-foreground mt-2">
            Track your location and find nearby charging stations
          </p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Search className="mr-2 h-5 w-5" />
                Search Location
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Search for a location..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pr-10"
                  />
                  {isSearching && (
                    <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                  )}
                </div>
                
                {suggestions.length > 0 && (
                  <div className="bg-background border rounded-md shadow-lg max-h-60 overflow-y-auto divide-y">
                    {suggestions.map((suggestion) => (
                      <button
                        key={suggestion.id}
                        className="w-full text-left px-4 py-3 hover:bg-secondary transition-colors"
                        onClick={() => handleSelectSuggestion(suggestion)}
                      >
                        <p className="font-medium">{suggestion.text}</p>
                        <p className="text-sm text-muted-foreground truncate">{suggestion.place_name}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="mr-2 h-5 w-5" />
                Map View
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <MapView className="h-[400px] w-full" showStations />
                
                <div className="flex flex-wrap justify-center gap-4 mt-4">
                  <Button 
                    variant="primary" 
                    onClick={handleGetCurrentLocation}
                    icon={<Target className="h-4 w-4" />}
                  >
                    Get Current Location
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    onClick={handleSetVisakhapatnamLocation}
                    icon={<Navigation className="h-4 w-4" />}
                  >
                    Set to Visakhapatnam
                  </Button>
                </div>
                
                <div className="text-center text-sm text-muted-foreground mt-2">
                  {currentCoordinates ? (
                    <div>
                      <p>Current coordinates: {currentCoordinates.lat.toFixed(4)}°N, {currentCoordinates.lng.toFixed(4)}°E</p>
                      <p className="mt-1 text-xs">This is your exact location - stations will be found nearby</p>
                    </div>
                  ) : (
                    <p>Current coordinates: {userLocation[1].toFixed(4)}°N, {userLocation[0].toFixed(4)}°E</p>
                  )}
                </div>
                
                {isLoadingStations && (
                  <div className="flex justify-center py-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </PageTransition>
  );
};

export default LocationServices;
