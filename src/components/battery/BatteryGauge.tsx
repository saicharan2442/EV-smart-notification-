
import React, { useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { Battery } from 'lucide-react';
import { cn } from '@/lib/utils';

type BatteryGaugeProps = {
  percentage: number;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  animate?: boolean;
};

const BatteryGauge: React.FC<BatteryGaugeProps> = ({ 
  percentage, 
  size = 'md',
  showIcon = true,
  animate = true,
}) => {
  const controls = useAnimation();
  
  useEffect(() => {
    if (animate) {
      controls.start({
        width: `${percentage}%`,
        transition: { duration: 1, ease: [0.34, 1.56, 0.64, 1] },
      });
    } else {
      controls.set({ width: `${percentage}%` });
    }
  }, [percentage, animate, controls]);
  
  const getColor = () => {
    if (percentage > 50) return 'bg-ev-green';
    if (percentage > 20) return 'bg-ev-yellow';
    return 'bg-ev-red';
  };
  
  const getText = () => {
    if (percentage > 50) return 'text-ev-green-dark';
    if (percentage > 20) return 'text-ev-yellow-dark';
    return 'text-ev-red-dark';
  };
  
  const getBgColor = () => {
    if (percentage > 50) return 'bg-ev-green-light';
    if (percentage > 20) return 'bg-ev-yellow-light';
    return 'bg-ev-red-light';
  };
  
  const sizeClasses = {
    sm: 'h-2 text-sm',
    md: 'h-3 text-base',
    lg: 'h-4 text-lg',
  };
  
  const getLucideIcon = () => {
    if (percentage > 70) return <Battery className="h-5 w-5" />;
    if (percentage > 30) return <Battery className="h-5 w-5" />;
    return <Battery className="h-5 w-5" />;
  };
  
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {showIcon && (
            <span className={getText()}>
              {getLucideIcon()}
            </span>
          )}
          <span className={cn("font-medium", getText())}>
            Battery
          </span>
        </div>
        <span className={cn("font-medium", getText())}>
          {percentage}%
        </span>
      </div>
      
      <div className={cn("w-full rounded-full overflow-hidden", getBgColor(), sizeClasses[size])}>
        <motion.div
          className={cn("h-full rounded-full", getColor())}
          initial={{ width: "0%" }}
          animate={controls}
        />
      </div>
      
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>0%</span>
        <span>50%</span>
        <span>100%</span>
      </div>
    </div>
  );
};

export default BatteryGauge;
