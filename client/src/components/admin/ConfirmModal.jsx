import { useRef } from 'react';
import { X, HelpCircle } from 'lucide-react';
import { useGsapAnimations } from '../../hooks/useGsapAnimations';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { animateModalOpen, animateModalClose } from '../../lib/animations/helpers';

export default function ConfirmModal({ open, title, message, onConfirm, onCancel, confirmLabel = 'Accepter', danger }) {
  const overlayRef = useRef(null);
  const panelRef = useRef(null);
  const reducedMotion = useReducedMotion();

  useGsapAnimations(overlayRef, () => {
    if (open && overlayRef.current && panelRef.current) {
      animateModalOpen(overlayRef.current, panelRef.current);
    }
  }, [open]);

  const handleCancel = () => {
    if (reducedMotion || !overlayRef.current || !panelRef.current) {
      onCancel();
      return;
    }
    animateModalClose(overlayRef.current, panelRef.current, onCancel);
  };

  if (!open) return null;

  return (
    <div ref={overlayRef} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 opacity-0">
      <div ref={panelRef} className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 relative">
        <button type="button" onClick={handleCancel} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <X size={18} />
        </button>
        <div className="flex flex-col items-center text-center pt-2">
          <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 ${danger ? 'bg-red-100' : 'bg-green-100'}`}>
            <HelpCircle className={danger ? 'text-red-500' : 'text-primary'} size={28} />
          </div>
          <h3 className="font-bold text-lg mb-2">{title || 'Confirmation'}</h3>
          <p className="text-sm text-gray-600 mb-6">{message}</p>
          <div className="flex gap-3 w-full">
            <button
              type="button"
              onClick={onConfirm}
              className={`flex-1 py-2.5 rounded-md text-sm font-medium text-white ${
                danger ? 'bg-red-500 hover:bg-red-600' : 'bg-primary hover:bg-primary-dark'
              }`}
            >
              {confirmLabel}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 py-2.5 rounded-md text-sm font-medium border border-gray-300 hover:bg-gray-50"
            >
              Annuler
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
