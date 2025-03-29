
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import PageTransition from '@/components/layout/PageTransition';
import Button from '@/components/shared/Button';
import VehicleCard from '@/components/vehicle/VehicleCard';
import { useApp } from '@/context/AppContext';
import { vehicles } from '@/data/mockData';
import { toast } from 'sonner';
import { Vehicle } from '@/context/AppContext';

const VehicleSelection = () => {
  const { selectedVehicle, setSelectedVehicle } = useApp();
  const [localSelectedVehicle, setLocalSelectedVehicle] = useState(selectedVehicle);
  const [vehicleType, setVehicleType] = useState<'all' | 'car' | 'bike'>('all');
  
  const filteredVehicles = vehicles.filter(
    vehicle => vehicleType === 'all' || vehicle.type === vehicleType
  );
  
  const handleSave = () => {
    setSelectedVehicle(localSelectedVehicle);
    toast.success('Vehicle saved successfully', {
      description: localSelectedVehicle 
        ? `Your ${localSelectedVehicle.brand} ${localSelectedVehicle.name} has been saved.`
        : 'Your vehicle selection has been cleared.',
    });
  };
  
  const handleReset = () => {
    setLocalSelectedVehicle(null);
  };
  
  const staggerDelay = 0.05;
  
  return (
    <PageTransition>
      <div className="container max-w-6xl mx-auto pt-24 px-4 pb-16">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10 text-center"
        >
          <h1 className="text-3xl font-bold">Vehicle Selection</h1>
          <p className="text-muted-foreground mt-2">
            Select your electric vehicle to get personalized charging recommendations
          </p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8"
        >
          <div className="bg-secondary rounded-full p-1 inline-flex space-x-1 mx-auto">
            <button
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                vehicleType === 'all' 
                  ? 'bg-background text-foreground shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => setVehicleType('all')}
            >
              All Vehicles
            </button>
            <button
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                vehicleType === 'bike' 
                  ? 'bg-background text-foreground shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => setVehicleType('bike')}
            >
              2-Wheelers
            </button>

            <button
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                vehicleType === 'car' 
                  ? 'bg-background text-foreground shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => setVehicleType('car')}
            >
              4-Wheelers
            </button>

            <button
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                vehicleType === 'big' 
                  ? 'bg-background text-foreground shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => setVehicleType('big')}
            >
              8-Wheelers
            </button>
           
      
          </div>
        </motion.div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {filteredVehicles.map((vehicle, i) => (
            <motion.div
              key={vehicle.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.4,
                delay: i * staggerDelay + 0.2,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <VehicleCard
                vehicle={vehicle as Vehicle}
                isSelected={localSelectedVehicle?.id === vehicle.id}
                onSelect={(v) => setLocalSelectedVehicle(v)}
              />
            </motion.div>
          ))}
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="flex justify-center space-x-4"
        >
          <Button
            variant="outline"
            onClick={handleReset}
          >
            Reset
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            icon={<Check className="h-4 w-4" />}
          >
            Save Selection
          </Button>
        </motion.div>
      </div>
    </PageTransition>
  );
};

export default VehicleSelection;
