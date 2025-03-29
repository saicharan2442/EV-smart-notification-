
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Battery, BatteryCharging, Zap, Gauge, Car, AlertTriangle } from 'lucide-react';
import PageTransition from '@/components/layout/PageTransition';
import Card, { CardContent, CardHeader, CardTitle } from '@/components/shared/Card';
import Button from '@/components/shared/Button';
import BatteryGauge from '@/components/battery/BatteryGauge';
import { useApp } from '@/context/AppContext';
import { toast } from 'sonner';

const BatteryMonitor = () => {
  const { batteryPercentage, setBatteryPercentage, selectedVehicle, addNotification } = useApp();
  const [estimatedRange, setEstimatedRange] = useState(batteryPercentage * 3); // 3km per 1% battery

  const handleSimulateCharging = () => {
    if (batteryPercentage >= 100) {
      toast.info('Battery already full', {
        description: 'Your vehicle battery is already at 100%.',
      });
      return;
    }
    
    const newPercentage = Math.min(100, batteryPercentage + 10);
    setBatteryPercentage(newPercentage);
    setEstimatedRange(newPercentage * 3);
    
    if (newPercentage === 100) {
      addNotification({
        title: 'Charging Complete',
        message: 'Your vehicle is now fully charged.',
        type: 'success',
      });
    } else {
      toast.success('Charging in progress', {
        description: `Battery charged to ${newPercentage}%`,
      });
    }
  };
  
  const handleSimulateDischarging = () => {
    if (batteryPercentage <= 0) {
      toast.info('Battery already empty', {
        description: 'Your vehicle battery is already at 0%.',
      });
      return;
    }
    
    const newPercentage = Math.max(0, batteryPercentage - 10);
    setBatteryPercentage(newPercentage);
    setEstimatedRange(newPercentage * 3);
    
    toast.info('Battery discharge simulated', {
      description: `Battery level decreased to ${newPercentage}%`,
    });
  };
  
  const getBatteryStatus = () => {
    if (batteryPercentage > 80) return 'Excellent';
    if (batteryPercentage > 50) return 'Good';
    if (batteryPercentage > 20) return 'Moderate';
    if (batteryPercentage > 10) return 'Low';
    return 'Critical';
  };
  
  const getBatteryColor = () => {
    if (batteryPercentage > 50) return 'text-ev-green';
    if (batteryPercentage > 20) return 'text-ev-yellow';
    return 'text-ev-red';
  };
  
  return (
    <PageTransition>
      <div className="container max-w-4xl mx-auto pt-24 px-4 pb-16">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10 text-center"
        >
          <h1 className="text-3xl font-bold">Battery Monitor</h1>
          <p className="text-muted-foreground mt-2">
            Track your vehicle's battery status and estimated range
          </p>
        </motion.div>
        
        {!selectedVehicle ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="text-center p-8 bg-secondary rounded-xl"
          >
            <AlertTriangle className="h-12 w-12 mx-auto text-amber-500 mb-4" />
            <h2 className="text-xl font-semibold mb-2">No Vehicle Selected</h2>
            <p className="text-muted-foreground mb-6">
              Please select a vehicle first to monitor its battery status.
            </p>
            <Button variant="primary" onClick={() => window.location.href = '/vehicle'}>
              Select Vehicle
            </Button>
          </motion.div>
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mb-6"
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 rounded-full bg-primary/10">
                      <Car className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle>{selectedVehicle.brand} {selectedVehicle.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {selectedVehicle.type === 'big' ? '8-Wheeler' : selectedVehicle.type ==='car' ? '4-Wheeler' : '2-Wheeler'}
                      </p>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mb-6"
            >
              <Card>
                <CardHeader>
                  <CardTitle>Battery Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col md:flex-row gap-6 items-center">
                    <div className="relative w-48 h-48">
                      <svg className="w-full h-full" viewBox="0 0 100 100">
                        {/* Background circle */}
                        <circle
                          cx="50"
                          cy="50"
                          r="45"
                          fill="none"
                          stroke={batteryPercentage > 50 ? '#DCFCE7' : batteryPercentage > 20 ? '#FEF9C3' : '#FEE2E2'}
                          strokeWidth="10"
                        />
                        
                        {/* Progress arc */}
                        <circle
                          cx="50"
                          cy="50"
                          r="45"
                          fill="none"
                          stroke={batteryPercentage > 50 ? '#4ADE80' : batteryPercentage > 20 ? '#FACC15' : '#F87171'}
                          strokeWidth="10"
                          strokeDasharray={`${2 * Math.PI * 45 * batteryPercentage / 100} ${2 * Math.PI * 45 * (1 - batteryPercentage / 100)}`}
                          strokeDashoffset={2 * Math.PI * 45 * 0.25}
                          strokeLinecap="round"
                        />
                        
                        {/* Battery percentage text */}
                        <text
                          x="50"
                          y="45"
                          textAnchor="middle"
                          alignmentBaseline="middle"
                          fontSize="24"
                          fontWeight="bold"
                          fill="currentColor"
                        >
                          {`${batteryPercentage}%`}
                        </text>
                        
                        <text
                          x="50"
                          y="65"
                          textAnchor="middle"
                          alignmentBaseline="middle"
                          fontSize="12"
                          fill={getBatteryColor()}
                          fontWeight="medium"
                        >
                          {getBatteryStatus()}
                        </text>
                      </svg>
                    </div>
                    
                    <div className="flex-1 space-y-6">
                      <BatteryGauge percentage={batteryPercentage} size="lg" />
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-secondary p-4 rounded-xl">
                          <div className="flex items-center space-x-2 text-muted-foreground mb-1">
                            <Gauge className="h-4 w-4" />
                            <span className="text-sm font-medium">Est. Range</span>
                          </div>
                          <div className="text-2xl font-semibold">
                            {estimatedRange} <span className="text-base font-normal">km</span>
                          </div>
                        </div>
                        
                        <div className="bg-secondary p-4 rounded-xl">
                          <div className="flex items-center space-x-2 text-muted-foreground mb-1">
                            <Zap className="h-4 w-4" />
                            <span className="text-sm font-medium">Status</span>
                          </div>
                          <div className={`text-lg font-semibold ${getBatteryColor()}`}>
                            {getBatteryStatus()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4"
            >
              <Button
                variant="outline"
                size="lg"
                onClick={handleSimulateDischarging}
                icon={<Battery className="h-5 w-5" />}
              >
                Simulate Discharge (-10%)
              </Button>
              <Button
                variant="primary"
                size="lg"
                onClick={handleSimulateCharging}
                icon={<BatteryCharging className="h-5 w-5" />}
              >
                Simulate Charging (+10%)
              </Button>
            </motion.div>
          </>
        )}
      </div>
    </PageTransition>
  );
};

export default BatteryMonitor;
