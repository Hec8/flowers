import { useRef } from 'react';
import { useGsapAnimations } from '../../hooks/useGsapAnimations';
import { gsap } from '../../lib/animations/gsapSetup';
import { EASE, DURATION } from '../../lib/animations/constants';

export default function CheckoutStepper({ step }) {
  const ref = useRef(null);
  const steps = [
    { num: '01', label: 'Adresse' },
    { num: '02', label: 'Paiement' },
  ];

  useGsapAnimations(ref, () => {
    const circles = ref.current?.querySelectorAll('[data-step-circle]');
    if (!circles?.length) return;
    gsap.fromTo(
      circles,
      { scale: 0.8, opacity: 0.5 },
      { scale: 1, opacity: 1, duration: DURATION.micro, ease: EASE.entrance, stagger: 0.1 },
    );
  }, [step]);

  return (
    <div ref={ref} className="flex items-center justify-center gap-0 mb-8 sm:mb-10 px-2">
      {steps.map((s, i) => {
        const active = step === i + 1;
        const done = step > i + 1;
        return (
          <div key={s.num} className="flex items-center">
            <div className="flex items-center gap-1 sm:gap-2">
              <span
                data-step-circle
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold border-2 shrink-0 will-change-transform ${
                  active || done
                    ? 'bg-primary border-primary text-white'
                    : 'border-gray-300 text-gray-400 bg-white'
                }`}
              >
                {s.num}
              </span>
              <span className={`text-xs sm:text-sm font-medium whitespace-nowrap ${active || done ? 'text-primary' : 'text-gray-400'}`}>
                {s.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`w-8 sm:w-16 md:w-24 h-0.5 mx-2 sm:mx-4 shrink ${done ? 'bg-primary' : 'bg-gray-200'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
