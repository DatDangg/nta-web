'use client';

import Image from 'next/image';
import { useState } from 'react';

type HomeImageProps = {
  alt: string;
  className: string;
  priority?: boolean;
  sizes: string;
  src: string;
};

export function HomeImage({ alt, className, priority = false, sizes, src }: HomeImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return <div aria-label={alt} className={className} role="img" />;
  }

  return (
    <Image
      alt={alt}
      className={className}
      height={720}
      onError={() => setFailed(true)}
      priority={priority}
      sizes={sizes}
      src={src}
      width={1200}
    />
  );
}
