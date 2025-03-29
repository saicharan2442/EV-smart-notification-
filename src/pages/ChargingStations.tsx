
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Filter, MapPin, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PageTransition from '@/components/layout/PageTransition';
import Card, { CardContent, CardHeader, CardTitle } from '@/components/shared/Card';
import StationCard from '@/components/stations/StationCard';
import Button from '@/components/shared/Button';
import MapView from '@/components/map/MapView';
import { useApp } from '@/context/AppContext';
import { useMapbox } from '@/context/MapboxContext';
import { fetchNearbyStations } from '@/services/stationService';
import { toast } from 'sonner';

const ChargingStations = () => {
  const navigate = useNavigate();
  const { userLocation, nearbyStations, setNearbyStations, setSelectedStation } = useApp();
  const { mapboxToken, isMapboxReady } = useMapbox();
  const [filterAvailable, setFilterAvailable] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const filteredStations = filterAvailable
    ? nearbyStations.filter(station => station.available)
    : nearbyStations;
  
  // Fetch stations when the component mounts
  useEffect(() => {
    const getStations = async () => {
      if (!isMapboxReady || !mapboxToken) return;
      
      setIsLoading(true);
      try {
        const stations = await fetchNearbyStations(userLocation, mapboxToken);
        setNearbyStations(stations);
        toast.success('Stations found', {
          description: `Found ${stations.length} charging stations nearby.`,
        });
      } catch (error) {
        console.error('Error fetching stations:', error);
        toast.error('Error fetching stations', {
          description: 'Unable to load nearby charging stations. Please try again.',
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    getStations();
  }, [userLocation, mapboxToken, isMapboxReady, setNearbyStations]);
  
  const handleSelectStation = (station: any) => {
    setSelectedStation(station);
    toast.success('Station selected', {
      description: `You've selected ${station.name}`,
    });
  };
  
  const handleNavigate = (station: any) => {
    setSelectedStation(station);
    navigate('/navigation');
  };
  
  const handleRefreshStations = async () => {
    if (!isMapboxReady || !mapboxToken) return;
    
    setIsLoading(true);
    try {
      const stations = await fetchNearbyStations(userLocation, mapboxToken);
      setNearbyStations(stations);
      toast.success('Stations refreshed', {
        description: `Found ${stations.length} charging stations nearby.`,
      });
    } catch (error) {
      console.error('Error refreshing stations:', error);
      toast.error('Error refreshing stations', {
        description: 'Unable to refresh charging stations. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      toast.loading('Getting your current location...');
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { longitude, latitude } = position.coords;
          const newLocation: [number, number] = [longitude, latitude];
          
          toast.success('Location updated', {
            description: 'Your current location has been updated on the map.',
          });
          
          // Fetch nearby stations with the new location
          handleRefreshWithNewLocation(newLocation);
        },
        (error) => {
          console.error('Error getting location:', error);
          toast.error('Location error', {
            description: 'Unable to get your current location. Please try again.',
          });
        }
      );
    } else {
      toast.error('Geolocation not supported', {
        description: 'Your browser does not support geolocation.',
      });
    }
  };
  
  const handleRefreshWithNewLocation = async (location: [number, number]) => {
    if (!isMapboxReady || !mapboxToken) return;
    
    setIsLoading(true);
    try {
      const stations = await fetchNearbyStations(location, mapboxToken);
      setNearbyStations(stations);
      toast.success('Stations found', {
        description: `Found ${stations.length} charging stations near your current location.`,
      });
    } catch (error) {
      console.error('Error fetching stations:', error);
      toast.error('Error fetching stations', {
        description: 'Unable to load nearby charging stations. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
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
          <h1 className="text-3xl font-bold">Charging Stations</h1>
          <p className="text-muted-foreground mt-2">
            Find nearby charging stations for your electric vehicle
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="md:col-span-3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center">
                      <MapPin className="mr-2 h-5 w-5" />
                      Nearby Charging Stations
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleGetCurrentLocation}
                      icon={<MapPin className="h-4 w-4" />}
                    >
                      Use My Location
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <MapView showStations className="h-[400px] w-full mb-4" />
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-6 flex justify-between items-center"
        >
          <div className="flex items-center gap-2">
            <Button
              variant={filterAvailable ? "primary" : "outline"}
              size="sm"
              onClick={() => setFilterAvailable(!filterAvailable)}
              icon={<Filter className="h-4 w-4" />}
            >
              {filterAvailable ? "Showing Available" : "Show All"}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefreshStations}
              icon={isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />}
              disabled={isLoading}
            >
              Refresh Stations
            </Button>
          </div>
          
          <div className="text-sm text-muted-foreground">
            {isLoading ? 'Loading stations...' : `${filteredStations.length} stations found`}
          </div>
        </motion.div>
        
        <div className="grid grid-cols-1 gap-4">
          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {filteredStations.map((station, i) => (
                <motion.div
                  key={station.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.4,
                    delay: i * 0.05 + 0.2,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  <StationCard
                    station={station}
                    onSelect={handleSelectStation}
                    onNavigate={handleNavigate}
                  />
                </motion.div>
              ))}
              
              {filteredStations.length === 0 && !isLoading && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                  className="text-center p-12 bg-secondary rounded-xl"
                >
                  <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h2 className="text-xl font-semibold mb-2">No Stations Found</h2>
                  <p className="text-muted-foreground">
                    {filterAvailable
                      ? "No available charging stations found nearby. Try showing all stations."
                      : "No charging stations found in your area."}
                  </p>
                </motion.div>
              )}
            </>
          )}
        </div>
      </div>
    </PageTransition>
  );
};

export default ChargingStations;
