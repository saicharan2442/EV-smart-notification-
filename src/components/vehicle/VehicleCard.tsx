
import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Vehicle } from '@/context/AppContext';

type VehicleCardProps = {
  vehicle: Vehicle;
  isSelected: boolean;
  onSelect: (vehicle: Vehicle) => void;
};

const VehicleCard: React.FC<VehicleCardProps> = ({ vehicle, isSelected, onSelect }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -8 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelect(vehicle)}
      className={cn(
        'relative overflow-hidden cursor-pointer rounded-xl shadow-sm transition-all duration-300',
        isSelected ? 'ring-2 ring-primary ring-offset-2' : 'hover:shadow-md'
      )}
    >
      <div className="relative h-48 bg-gray-100 overflow-hidden">
        <motion.img
          src={vehicle.image}
          alt={vehicle.name}
          className="w-full h-full object-cover"
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
      </div>
      
      <div className="p-4 bg-white">
        <div className="flex items-start justify-between">
          <div>
            <span className="px-2 py-1 text-xs font-medium bg-secondary rounded-full">
              {vehicle.type === 'car' ? '4-Wheeler' : vehicle.type === 'big' ? '8-Wheeler' : '2-Wheeler'}
              
            </span>
            <h3 className="mt-2 text-lg font-medium">{vehicle.name}</h3>
            <p className="text-sm text-muted-foreground">{vehicle.brand}</p>
          </div>
          
          {isSelected && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-primary"
            >
              <CheckCircle className="h-6 w-6" />
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default VehicleCard;
