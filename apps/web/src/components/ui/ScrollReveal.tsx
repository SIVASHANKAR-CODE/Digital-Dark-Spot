import React, { useRef } from 'react';
import { clsx } from 'clsx';
import { useScrollReveal } from '@/hooks/useScrollReveal';

export interface ScrollRevealProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  delayMs?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  distance?: number;
  threshold?: number;
}

export function ScrollReveal({
  children,
  delayMs = 0,
  direction = 'up',
  distance = 24,
  threshold = 0.15,
  className,
  style,
  ...props
}: ScrollRevealProps) {
  const { ref, isRevealed } = useScrollReveal({ threshold, delayMs });

  const getTransform = () => {
    if (isRevealed || direction === 'none') return 'none';
    switch (direction) {
      case 'up':
        return `translateY(${distance}px)`;
      case 'down':
        return `translateY(-${distance}px)`;
      case 'left':
        return `translateX(${distance}px)`;
      case 'right':
        return `translateX(-${distance}px)`;
      default:
        return 'none';
    }
  };

  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      className={clsx('transition-all duration-700 ease-out will-change-transform', className)}
      style={{
        opacity: isRevealed ? 1 : 0,
        transform: getTransform(),
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
}

