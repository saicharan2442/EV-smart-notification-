
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Navigation as NavigationIcon, MapPin, Route, Loader2, ChevronLeft } from 'lucide-react';
import PageTransition from '@/components/layout/PageTransition';
import Card, { CardContent, CardHeader, CardTitle } from '@/components/shared/Card';
import Button from '@/components/shared/Button';
import MapView from '@/components/map/MapView';
import { useApp } from '@/context/AppContext';
import { useMapbox } from '@/context/MapboxContext';
import { toast } from 'sonner';
  
const Navigation = () => {
  const navigate = useNavigate();
  const { selectedStation, routeDirections, userLocation } = useApp();
  const { mapboxToken, isMapboxReady } = useMapbox();
  const [isLoading, setIsLoading] = useState(false);
  const [navigationStarted, setNavigationStarted] = useState(false);
  
  const handleStartNavigation = () => {
    setNavigationStarted(true);
    toast.success('Navigation started', {
      description: 'Turn-by-turn directions are now available',
    });
  };
  
  const handleBackToStations = () => {
    navigate('/stations');
  };
  
  return (
    <PageTransition>
      <div className="container max-w-6xl mx-auto pt-24 px-4 pb-16">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6 flex items-center"
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBackToStations}
            icon={<ChevronLeft className="h-4 w-4" />}
            className="mr-4"
          >
            Back to Stations
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Navigation</h1>
            <p className="text-muted-foreground mt-1">
              Get directions to your selected charging station
            </p>
          </div>
        </motion.div>
        
        {!selectedStation ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="text-center p-12 bg-secondary rounded-xl"
          >
            <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">No Station Selected</h2>
            <p className="text-muted-foreground mb-6">
              Please select a charging station first to get directions.
            </p>
            <Button 
              variant="primary" 
              onClick={() => navigate('/stations')}
              icon={<Route className="h-5 w-5" />}
            >
              Select a Station
            </Button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Route Map</CardTitle>
                </CardHeader>
                <CardContent>
                  <MapView showStations showRoute className="h-[500px] w-full" />
                </CardContent>
              </Card>
            </div>
            
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Directions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <h3 className="font-medium">{selectedStation.name}</h3>
                        <p className="text-sm text-muted-foreground">{selectedStation.address}</p>
                        <p className="text-sm font-medium mt-1">{selectedStation.distance} km away</p>
                      </div>
                    </div>
                    
                    <div className={`border-t pt-4 ${navigationStarted ? 'bg-secondary/30 p-3 rounded-lg' : ''}`}>
                      <h3 className="font-medium mb-2">Turn-by-Turn Directions</h3>
                      {isLoading ? (
                        <div className="flex justify-center py-6">
                          <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                      ) : routeDirections?.routes?.[0]?.legs?.[0]?.steps ? (
                        routeDirections.routes[0].legs[0].steps.map((step: any, index: number) => (
                          <div key={index} className="flex items-start space-x-3 py-2 border-b border-dashed last:border-0">
                            <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-xs font-medium flex-shrink-0">
                              {index + 1}
                            </div>
                            <div>
                              <p className="text-sm">{step.maneuver.instruction}</p>
                              <p className="text-xs text-muted-foreground">{(step.distance / 1000).toFixed(1)} km</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">Directions will appear here once the route is calculated.</p>
                      )}
                    </div>
                    
                    <Button
                      variant={navigationStarted ? "outline" : "primary"}
                      fullWidth
                      onClick={handleStartNavigation}
                      icon={<NavigationIcon className="h-4 w-4" />}
                      disabled={!selectedStation.available || !routeDirections}
                    >
                      {navigationStarted ? "Navigation Active" : "Start Navigation"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  );
};

export default Navigation;
