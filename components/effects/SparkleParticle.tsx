import React from 'react';

interface SparkleParticleProps {
  id: string; // For React key
  style: React.CSSProperties; // For top, left, animationDelay
  onAnimationEnd: (id: string) => void;
  color?: string;
  size?: string;
}
export const SparkleParticle: React.FC<SparkleParticleProps> = ({ 
    id, 
    style, 
    onAnimationEnd,
    color = 'bg-yellow-300',
    size = 'w-2 h-2'
}) => {
  return (
    <div
      className={`absolute ${size} ${color} rounded-full animate-sparkle-once shadow-md pointer-events-none`}
      style={{
        // Basic star shape
        clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
        ...style,
      }}
      onAnimationEnd={() => onAnimationEnd(id)}
      aria-hidden="true"
    />
  );
};