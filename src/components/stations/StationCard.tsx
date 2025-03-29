
import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Star, Plug, Zap, CheckCircle, XCircle } from 'lucide-react';
import { Station } from '@/context/AppContext';
import { cn } from '@/lib/utils';
import Button from '@/components/shared/Button';

type StationCardProps = {
  station: Station;
  isSelected?: boolean;
  onSelect?: (station: Station) => void;
  onNavigate?: (station: Station) => void;
};

const StationCard: React.FC<StationCardProps> = ({
  station,
  isSelected = false,
  onSelect,
  onNavigate,
}) => {
  // Prevent event bubbling when clicking the navigate button
  const handleNavigateClick = () => {
    // We no longer need the event parameter since we're creating a wrapper function
    if (onNavigate) {
      onNavigate(station);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        'bg-white rounded-xl overflow-hidden shadow-sm transition-all duration-300',
        isSelected ? 'ring-2 ring-primary' : '',
        onSelect ? 'cursor-pointer hover:shadow-md' : ''
      )}
      onClick={() => onSelect?.(station)}
    >
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center space-x-1 mb-1">
              <span className={cn(
                'px-2 py-0.5 text-xs font-medium rounded-full',
                station.available
                  ? 'bg-ev-green-light text-ev-green-dark'
                  : 'bg-ev-red-light text-ev-red-dark'
              )}>
                {station.available ? 'Available' : 'Unavailable'}
              </span>
              
              <div className="flex items-center space-x-0.5 text-amber-500">
                <Star className="h-3 w-3 fill-current" />
                <span className="text-xs font-medium">{station.rating}</span>
              </div>
            </div>
            
            <h3 className="font-medium text-foreground">{station.name}</h3>
            
            <div className="flex items-center text-muted-foreground mt-1 text-sm">
              <MapPin className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
              <span className="truncate">{station.address}</span>
            </div>
            
            <div className="flex items-center text-muted-foreground mt-1 text-sm">
              <Zap className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
              <span>{station.price}</span>
            </div>
          </div>
          
          <div className="text-ev-blue flex items-center space-x-1">
            <span className="text-lg font-medium">{station.distance}</span>
            <span className="text-sm">km</span>
          </div>
        </div>
        
        <div className="mt-3">
          <div className="text-xs text-muted-foreground mb-1">Connector Types:</div>
          <div className="flex flex-wrap gap-2">
            {station.connectorTypes.map((type) => (
              <div 
                key={type} 
                className="bg-secondary px-2 py-0.5 rounded-full text-xs flex items-center"
              >
                <Plug className="h-3 w-3 mr-1" />
                {type}
              </div>
            ))}
          </div>
        </div>
        
        {onNavigate && (
          <div className="mt-4">
            <Button
              variant="primary"
              size="sm"
              fullWidth
              onClick={handleNavigateClick}
              icon={<MapPin className="h-4 w-4" />}
              disabled={!station.available}
            >
              Navigate
            </Button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default StationCard;
