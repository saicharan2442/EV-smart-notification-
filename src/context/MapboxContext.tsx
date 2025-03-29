
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';
import mapboxgl from 'mapbox-gl';

type MapboxContextType = {
  mapboxToken: string;
  setMapboxToken: (token: string) => void;
  isMapboxReady: boolean;
  validateMapboxToken: (token: string) => Promise<boolean>;
};

const MapboxContext = createContext<MapboxContextType | undefined>(undefined);

export const MapboxProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mapboxToken, setMapboxToken] = useState<string>('');
  const [isMapboxReady, setIsMapboxReady] = useState<boolean>(false);

  // Check for token in localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('mapboxToken');
    if (savedToken) {
      setMapboxToken(savedToken);
      validateMapboxToken(savedToken).then(valid => {
        setIsMapboxReady(valid);
        if (!valid) {
          toast.error('Invalid Mapbox token', {
            description: 'The saved Mapbox token is invalid. Please provide a valid token.',
          });
        }
      });
    }
  }, []);

  // Validate a Mapbox token
  const validateMapboxToken = async (token: string): Promise<boolean> => {
    if (!token || token.trim() === '') return false;
    
    // Check if token begins with pk (public key)
    if (!token.startsWith('pk.')) {
      console.error('Mapbox token must start with pk.');
      return false;
    }
    
    try {
      // Try to make a simple request to Mapbox API to validate the token
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/visakhapatnam.json?access_token=${token}`
      );
      
      if (!response.ok) {
        throw new Error('Invalid token');
      }
      
      return true;
    } catch (error) {
      console.error('Error validating Mapbox token:', error);
      return false;
    }
  };

  // Save token to localStorage when it changes
  useEffect(() => {
    if (mapboxToken && mapboxToken.trim() !== '') {
      localStorage.setItem('mapboxToken', mapboxToken);
      
      validateMapboxToken(mapboxToken).then(valid => {
        setIsMapboxReady(valid);
        if (valid) {
          toast.success('Mapbox token saved', {
            description: 'Your Mapbox token has been saved and validated.',
          });
        } else {
          toast.error('Invalid Mapbox token', {
            description: 'The provided token seems to be invalid. Please check and try again.',
          });
        }
      });
    }
  }, [mapboxToken]);

  return (
    <MapboxContext.Provider
      value={{
        mapboxToken,
        setMapboxToken,
        isMapboxReady,
        validateMapboxToken,
      }}
    >
      {children}
    </MapboxContext.Provider>
  );
};

export const useMapbox = (): MapboxContextType => {
  const context = useContext(MapboxContext);
  if (context === undefined) {
    throw new Error('useMapbox must be used within a MapboxProvider');
  }
  return context;
};
