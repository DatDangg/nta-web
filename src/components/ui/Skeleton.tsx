type SkeletonProps = {
  aspectRatio?: 'video' | 'square' | 'portrait';
  className?: string;
};

const aspectRatioClasses = {
  video: 'aspect-video',
  square: 'aspect-square',
  portrait: 'aspect-[3/4]',
} as const;

export function Skeleton({ aspectRatio = 'video', className = '' }: SkeletonProps) {
  return <div aria-hidden="true" className={`w-full animate-pulse rounded-md bg-surface-sunken ${aspectRatioClasses[aspectRatio]} ${className}`.trim()} />;
}
