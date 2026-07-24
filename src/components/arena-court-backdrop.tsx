import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

type ArenaCourtBackdropProps = {
  className?: string;
  imageClassName?: string;
  /** Extra overlays on top of the base tint (gradients, card scrim, etc.). */
  children?: ReactNode;
  fetchPriority?: 'high' | 'low' | 'auto';
};

/** Shared arena court photo used on the homepage hero and game card. */
export function ArenaCourtBackdrop({
  className,
  imageClassName,
  children,
  fetchPriority = 'auto',
}: ArenaCourtBackdropProps) {
  return (
    <div
      aria-hidden
      className={cn('pointer-events-none relative overflow-hidden', className)}
    >
      <picture className="absolute inset-0">
        <source
          media="(max-width: 767px)"
          type="image/webp"
          srcSet="/images/arena-court-mobile.webp"
        />
        <source
          media="(max-width: 767px)"
          srcSet="/images/arena-court-mobile.jpg"
        />
        <source type="image/webp" srcSet="/images/arena-court.webp" />
        <img
          src="/images/arena-court.jpg"
          alt=""
          decoding="async"
          fetchPriority={fetchPriority}
          className={cn(
            'h-full w-full object-cover object-[center_40%]',
            imageClassName
          )}
        />
      </picture>
      <div className="absolute inset-0 bg-[#05050a]/25" />
      {children}
    </div>
  );
}
