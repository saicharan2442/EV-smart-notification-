import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Filter, MapPin, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PageTransition from '@/components/layout/PageTransition';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import StationCard from '@/components/stations/StationCard';
import { Button } from '@/components/ui/button';
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
  const [showAlert, setShowAlert] = useState(false);

  const filteredStations = filterAvailable
    ? nearbyStations.filter((station) => station.available)
    : nearbyStations;

  const checkStationRange = (stations: any[]) => {
    const inRange = stations.filter((station) => station.distance <= 50);
    if (inRange.length === 0) {
      setShowAlert(true);
    }
  };

  useEffect(() => {
    const getStations = async () => {
      if (!isMapboxReady || !mapboxToken) return;

      setIsLoading(true);
      try {
        const stations = await fetchNearbyStations(userLocation, mapboxToken);
        setNearbyStations(stations);
        checkStationRange(stations);
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
      checkStationRange(stations);
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
      checkStationRange(stations);
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
      <div className="container max-w-6xl mx-auto pt-24 px-4 pb-16 relative">
        {/* Centered Alert Box */}
        {showAlert && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-10 rounded-xl shadow-xl max-w-xl w-full text-center">
              <h2 className="text-3xl font-bold text-red-600 mb-4">No Stations Within up to 80 km</h2>
              <p className="text-lg text-gray-700 mb-6">
                Your current location has no charging stations within a up to 80 km range.your current charge is not sufficent to reach. <br /> Please consider
                updating your location or planning a different route Accordingly.
              </p>
              <Button onClick={() => setShowAlert(false)} className="mx-auto text-lg px-6 py-2">
                OK
              </Button>
            </div>
          </div>
        )}

        {/* Heading */}
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

        {/* Controls */}
        <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleRefreshStations}>
              <Loader2 className="mr-2 h-4 w-4" /> Refresh
            </Button>
            <Button variant="outline" onClick={handleGetCurrentLocation}>
              <MapPin className="mr-2 h-4 w-4" /> Use Current Location
            </Button>
          </div>
          <Button variant="ghost" onClick={() => setFilterAvailable(!filterAvailable)}>
            <Filter className="mr-2 h-4 w-4" />
            {filterAvailable ? 'Show All' : 'Show Available Only'}
          </Button>
        </div>

        {/* Map */}
        <div className="mb-10">
          <MapView userLocation={userLocation} stations={filteredStations} />
        </div>

        {/* Stations List */}
        {isLoading ? (
          <div className="text-center text-muted-foreground">Loading nearby stations...</div>
        ) : filteredStations.length === 0 ? (
          <div className="text-center text-muted-foreground">No stations found.</div>
        ) : (
          <div className="space-y-6">
            {filteredStations.map((station, index) => (
              <Card
                key={index}
                className="w-full flex flex-col sm:flex-row items-center justify-between p-4 hover:shadow-lg transition"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center sm:gap-6 w-full">
                  <div className="flex-grow">
                    <CardHeader className="p-0 mb-2 sm:mb-0">
                      <CardTitle className="text-xl">{station.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <StationCard
                        station={station}
                        onSelect={() => handleSelectStation(station)}
                        onNavigate={() => handleNavigate(station)}
                      />
                    </CardContent>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </PageTransition>
  );
};

export default ChargingStations;
