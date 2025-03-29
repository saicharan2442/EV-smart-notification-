
import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

type CardProps = {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
  glass?: boolean;
};

const Card: React.FC<CardProps> = ({
  children,
  className,
  onClick,
  hoverable = false,
  glass = false,
}) => {
  return (
    <motion.div
      whileHover={hoverable ? { scale: 1.02, y: -5 } : {}}
      whileTap={onClick ? { scale: 0.98 } : {}}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      className={cn(
        'rounded-lg overflow-hidden shadow-sm bg-card text-card-foreground',
        glass && 'glass',
        hoverable && 'transition-all cursor-pointer',
        className
      )}
    >
      {children}
    </motion.div>
  );
};

export const CardHeader: React.FC<{ className?: string; children: React.ReactNode }> = ({
  className,
  children,
}) => (
  <div className={cn('p-6 flex flex-col space-y-1.5', className)}>
    {children}
  </div>
);

export const CardTitle: React.FC<{ className?: string; children: React.ReactNode }> = ({
  className,
  children,
}) => (
  <h3 className={cn('text-lg font-semibold leading-none tracking-tight', className)}>
    {children}
  </h3>
);

export const CardDescription: React.FC<{ className?: string; children: React.ReactNode }> = ({
  className,
  children,
}) => (
  <p className={cn('text-sm text-muted-foreground', className)}>
    {children}
  </p>
);

export const CardContent: React.FC<{ className?: string; children: React.ReactNode }> = ({
  className,
  children,
}) => (
  <div className={cn('p-6 pt-0', className)}>
    {children}
  </div>
);

export const CardFooter: React.FC<{ className?: string; children: React.ReactNode }> = ({
  className,
  children,
}) => (
  <div className={cn('p-6 pt-0 flex items-center', className)}>
    {children}
  </div>
);

export default Card;
