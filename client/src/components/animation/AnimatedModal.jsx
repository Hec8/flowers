import { useRef, useEffect, useState } from 'react';
import { useGsapAnimations } from '../../hooks/useGsapAnimations';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { animateModalOpen, animateModalClose } from '../../lib/animations/helpers';

/**
 * Modale animée (scale + fade) avec sortie fluide avant démontage.
 */
export default function AnimatedModal({ open, onClose, children, className = '' }) {
  const overlayRef = useRef(null);
  const panelRef = useRef(null);
  const [mounted, setMounted] = useState(open);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (open) setMounted(true);
  }, [open]);

  useGsapAnimations(overlayRef, () => {
    if (open && overlayRef.current && panelRef.current) {
      animateModalOpen(overlayRef.current, panelRef.current);
    }
  }, [open, mounted]);

  const handleClose = () => {
    if (reducedMotion || !overlayRef.current || !panelRef.current) {
      onClose();
      setMounted(false);
      return;
    }
    animateModalClose(overlayRef.current, panelRef.current, () => {
      setMounted(false);
      onClose();
    });
  };

  if (!mounted && !open) return null;

  return (
    <div
      ref={overlayRef}
      className={`fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 ${className}`}
      role="presentation"
      onClick={(e) => e.target === overlayRef.current && handleClose()}
      onKeyDown={() => {}}
    >
      <div ref={panelRef} className="w-full sm:max-w-lg" onClick={(e) => e.stopPropagation()} role="dialog">
        {typeof children === 'function' ? children({ onClose: handleClose }) : children}
      </div>
    </div>
  );
}
