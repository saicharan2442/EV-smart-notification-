
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapPin, Navigation, AlertCircle } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useMapbox } from '@/context/MapboxContext';
import { cn } from '@/lib/utils';
import Card from '@/components/shared/Card';
import MapboxTokenInput from './MapboxTokenInput';

type MapViewProps = {
  showStations?: boolean;
  showRoute?: boolean;
  className?: string;
  interactive?: boolean;
};

const MapView: React.FC<MapViewProps> = ({
  showStations = false,
  showRoute = false,
  className,
  interactive = true,
}) => {
  const { userLocation, nearbyStations, selectedStation, setRouteDirections } = useApp();
  const { mapboxToken, isMapboxReady } = useMapbox();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize map when component mounts and token is available
  useEffect(() => {
    if (!mapContainerRef.current || !isMapboxReady || !mapboxToken) return;

    try {
      // Make sure we're using a valid token format
      if (!mapboxToken.startsWith('pk.')) {
        setError('Mapbox token must start with pk. (public token).');
        setIsLoading(false);
        return;
      }

      // Set the Mapbox access token
      mapboxgl.accessToken = mapboxToken;

      // Initialize map
      map.current = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: userLocation,
        zoom: 13,
      });

      // Add navigation controls if interactive
      if (interactive) {
        map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
      }

      // Add user location marker
      const userMarker = new mapboxgl.Marker({
        color: '#3b82f6',
        draggable: false,
      })
        .setLngLat(userLocation)
        .addTo(map.current);

      // Add event listeners
      map.current.on('load', () => {
        setIsLoading(false);
        setError(null);
      });

      map.current.on('error', (e) => {
        console.error('Mapbox error:', e);
        setError('An error occurred while loading the map. Please check your Mapbox token.');
        setIsLoading(false);
      });

      // Clean up on unmount
      return () => {
        if (map.current) {
          map.current.remove();
        }
      };
    } catch (err) {
      console.error('Error initializing map:', err);
      setError(`Failed to initialize map: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setIsLoading(false);
    }
  }, [mapboxToken, isMapboxReady, userLocation, interactive]);

  // Add station markers when showStations is true
  useEffect(() => {
    if (!map.current || !showStations || !isMapboxReady || error) return;

    // Remove any existing markers first
    const markers = document.querySelectorAll('.station-marker');
    markers.forEach((marker) => marker.remove());

    // Add station markers
    nearbyStations.forEach((station) => {
      const el = document.createElement('div');
      el.className = 'station-marker';
      el.innerHTML = `<div class="${
        station.available ? 'bg-green-500' : 'bg-red-500'
      } text-white p-1 rounded-full shadow-md cursor-pointer">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-map-pin h-4 w-4"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
      </div>`;

      new mapboxgl.Marker(el)
        .setLngLat(station.coordinates)
        .setPopup(
          new mapboxgl.Popup({ offset: 25 }).setHTML(
            `<h3 class="font-medium">${station.name}</h3>
             <p class="text-sm">${station.distance.toFixed(1)} km away</p>
             <p class="text-sm">${station.address}</p>`
          )
        )
        .addTo(map.current!);
    });
  }, [nearbyStations, showStations, map.current, isMapboxReady, error]);

  // Draw route when showRoute is true and a station is selected
  useEffect(() => {
    if (!map.current || !showRoute || !selectedStation || !isMapboxReady || error) return;

    // Get directions from Mapbox Directions API
    const getDirections = async () => {
      try {
        const response = await fetch(
          `https://api.mapbox.com/directions/v5/mapbox/driving/${userLocation[0]},${userLocation[1]};${selectedStation.coordinates[0]},${selectedStation.coordinates[1]}?steps=true&geometries=geojson&access_token=${mapboxToken}`
        );
        const data = await response.json();
        
        if (data.routes && data.routes.length > 0) {
          const route = data.routes[0];
          setRouteDirections(data);
          
          // Add the route to the map
          if (map.current?.getSource('route')) {
            (map.current.getSource('route') as mapboxgl.GeoJSONSource).setData({
              type: 'Feature',
              properties: {},
              geometry: route.geometry,
            });
          } else if (map.current) {
            map.current.addSource('route', {
              type: 'geojson',
              data: {
                type: 'Feature',
                properties: {},
                geometry: route.geometry,
              },
            });
            
            map.current.addLayer({
              id: 'route',
              type: 'line',
              source: 'route',
              layout: {
                'line-join': 'round',
                'line-cap': 'round',
              },
              paint: {
                'line-color': '#3b82f6',
                'line-width': 6,
                'line-opacity': 0.75,
              },
            });
          }
          
          // Adjust the map to fit the route
          if (map.current) {
            const coordinates = route.geometry.coordinates;
            const bounds = coordinates.reduce(
              (bounds, coord) => bounds.extend(coord as [number, number]),
              new mapboxgl.LngLatBounds(coordinates[0] as [number, number], coordinates[0] as [number, number])
            );
            
            map.current.fitBounds(bounds, {
              padding: 40,
              maxZoom: 15,
              duration: 1000,
            });
          }
          
          // Add destination marker
          const el = document.createElement('div');
          el.className = 'destination-marker';
          el.innerHTML = `<div class="bg-blue-600 text-white p-1 rounded-full shadow-md">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-navigation h-4 w-4"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
          </div>`;
          
          if (map.current) {
            new mapboxgl.Marker(el)
              .setLngLat(selectedStation.coordinates)
              .setPopup(
                new mapboxgl.Popup({ offset: 25 }).setHTML(
                  `<h3 class="font-medium">${selectedStation.name}</h3>
                  <p class="text-sm">${selectedStation.address}</p>`
                )
              )
              .addTo(map.current);
          }
        }
      } catch (error) {
        console.error('Error fetching directions:', error);
        setError('Failed to fetch directions');
      }
    };
    
    getDirections();
  }, [selectedStation, showRoute, map.current, userLocation, mapboxToken, isMapboxReady, setRouteDirections, error]);

  if (!isMapboxReady) {
    return <MapboxTokenInput />;
  }

  return (
    <div
      className={cn(
        'relative rounded-xl overflow-hidden bg-gray-100 shadow-sm',
        className
      )}
    >
      <div
        ref={mapContainerRef}
        className="h-full w-full min-h-[300px]"
      />
      
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80">
          <div className="h-8 w-8 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
        </div>
      )}

      {/* Error overlay */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 p-6">
          <div className="text-center max-w-md">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-red-700 mb-2">Map Error</h3>
            <p className="text-sm text-gray-700">{error}</p>
            <p className="text-sm mt-4">Please check that you've entered a valid Mapbox public token (starts with pk.)</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapView;
