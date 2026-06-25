import { useRef } from 'react';
import { useGsapAnimations } from '../../hooks/useGsapAnimations';
import { bindSkeletonPulse } from '../../lib/animations/helpers';

/** Skeleton loader pulsant pour grilles produits */
export default function SkeletonGrid({ count = 8, className = 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6' }) {
  const ref = useRef(null);

  useGsapAnimations(ref, () => {
    const blocks = ref.current?.querySelectorAll('[data-skeleton]');
    bindSkeletonPulse(blocks);
  }, [count]);

  return (
    <div ref={ref} className={className} aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} data-skeleton className="bg-gray-100 rounded-lg overflow-hidden opacity-70">
          <div className="w-full h-52 bg-gray-200" />
          <div className="p-4 space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto" />
            <div className="h-3 bg-gray-200 rounded w-1/2 mx-auto" />
            <div className="h-10 bg-gray-200 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
