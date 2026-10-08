'use client';

import { Children, type ReactNode, useEffect, useRef, useState } from 'react';

type RevealProps = {
  children: ReactNode;
  className?: string;
  stagger?: boolean;
};

export function Reveal({ children, className = '', stagger = false }: RevealProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (reducedMotion.matches || !('IntersectionObserver' in window)) {
      setRevealed(true);
      return;
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setRevealed(true);
        observer.disconnect();
      }
    }, { threshold: 0.12 });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const items = Children.toArray(children);
  return (
    <div ref={containerRef} className={`reveal${revealed ? ' revealed' : ''} ${className}`.trim()}>
      {items.map((child, index) => (
        <div
          key={index}
          className="reveal-item"
          style={{ transitionDelay: stagger ? `${index * 60}ms` : '0ms' }}
        >
          {child}
        </div>
      ))}
    </div>
  );
}
