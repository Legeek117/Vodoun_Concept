import { useState, useEffect, useRef } from 'react';
import { useCart } from '../store';
import CartDrawer from './CartDrawer';
import gsap from 'gsap';

export default function FloatingCart() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { cart, totalItems } = useCart();
  const [showToast, setShowToast] = useState(false);
  const [toastText, setToastText] = useState('');
  const [toastVariant, setToastVariant] = useState('');
  const [toastImage, setToastImage] = useState('');
  const toastRef = useRef(null);
  const btnRef = useRef(null);
  const badgeRef = useRef(null);
  const prevItemsRef = useRef(totalItems);
  const prevCartLengthRef = useRef(cart.length);

  useEffect(() => {
    if (totalItems > prevItemsRef.current) {
      if (btnRef.current) {
        gsap.timeline()
          .to(btnRef.current, {
            scale: 1.2,
            rotate: -6,
            duration: 0.12,
            ease: 'power2.out',
          })
          .to(btnRef.current, {
            scale: 1.28,
            rotate: 5,
            duration: 0.1,
            ease: 'power2.out',
          })
          .to(btnRef.current, {
            scale: 1,
            rotate: 0,
            duration: 0.35,
            ease: 'elastic.out(1, 0.4)',
          });
      }

      if (badgeRef.current) {
        gsap.fromTo(badgeRef.current,
          { scale: 0.4, opacity: 0, y: 8 },
          {
            scale: 1,
            opacity: 1,
            y: 0,
            duration: 0.55,
            ease: 'back.out(2.2)',
          }
        );
        gsap.fromTo(badgeRef.current,
          { boxShadow: '0 0 0 0 rgba(184,134,11,0.6)' },
          {
            boxShadow: '0 0 0 12px rgba(184,134,11,0)',
            duration: 0.9,
            ease: 'power2.out',
            repeat: 1,
          }
        );
      }

      const newItem = cart[cart.length - 1];
      if (newItem) {
        const shortName = newItem.name.length > 26
          ? newItem.name.substring(0, 26) + '…'
          : newItem.name;
        setToastText(shortName);
        setToastVariant(
          newItem.options?.variant && newItem.options.variant !== 'Default'
            ? newItem.options.variant
            : ''
        );
        setToastImage(newItem.image || '');
      } else {
        setToastText('Ajouté au panier');
        setToastVariant('');
        setToastImage('');
      }
      setShowToast(true);

      if (toastRef.current) {
        gsap.killTweensOf(toastRef.current);
        gsap.fromTo(toastRef.current,
          { y: 60, opacity: 0, scale: 0.92 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.5,
            ease: 'power3.out',
          }
        );
        setTimeout(() => {
          if (toastRef.current) {
            gsap.to(toastRef.current, {
              y: 24,
              opacity: 0,
              scale: 0.95,
              duration: 0.35,
              ease: 'power2.in',
              onComplete: () => setShowToast(false),
            });
          }
        }, 3000);
      }
    }

    prevItemsRef.current = totalItems;
    prevCartLengthRef.current = cart.length;
  }, [totalItems, cart]);

  return (
    <>
      {showToast && (
        <div
          ref={toastRef}
          className="fixed bottom-[5.5rem] right-4 md:right-6 z-[101] max-w-[280px]"
          style={{ opacity: 0 }}
        >
          <div
            className="flex items-center gap-3 px-3 py-3 rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.5)] overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #1A1410 0%, #241A13 100%)',
              border: '1px solid rgba(184,134,11,0.45)',
            }}
          >
            {toastImage && (
              <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 border border-or/25 bg-noir">
                <img
                  src={toastImage}
                  alt=""
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-or text-[10px] font-black leading-none">✦</span>
                <span className="text-[9px] uppercase tracking-[0.3em] text-or/80 font-bold leading-none">
                  Ajouté
                </span>
              </div>
              <p className="text-ivoire text-[12px] font-bold leading-tight truncate">
                {toastText}
              </p>
              {toastVariant && (
                <p className="text-or/70 text-[10px] font-semibold leading-tight mt-0.5 truncate">
                  {toastVariant}
                </p>
              )}
            </div>
            <div className="flex-shrink-0 w-7 h-7 rounded-full bg-or flex items-center justify-center shadow-[0_0_14px_rgba(184,134,11,0.45)]">
              <svg className="w-3.5 h-3.5 text-noir" fill="none" stroke="currentColor" strokeWidth={3.2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        </div>
      )}

      <button
        ref={btnRef}
        onClick={() => setIsCartOpen(true)}
        className="fixed bottom-6 right-4 md:right-6 z-[100] w-14 h-14 md:w-16 md:h-16 rounded-full bg-or shadow-[0_10px_36px_rgba(184,134,11,0.45)] flex items-center justify-center text-noir hover:scale-110 active:scale-95 transition-transform duration-200"
        aria-label="Ouvrir le panier"
      >
        <div className="absolute inset-0 rounded-full shadow-[inset_0_2px_4px_rgba(255,255,255,0.35),inset_0_-2px_4px_rgba(0,0,0,0.15)] pointer-events-none" />
        <svg className="w-6 h-6 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        {totalItems > 0 && (
          <span
            ref={badgeRef}
            className="absolute -top-1 -right-1 w-4 h-4 md:w-5 md:h-5 bg-noir text-or rounded-full flex items-center justify-center text-[9px] md:text-[10px] font-black border border-or leading-none"
          >
            {totalItems > 9 ? '9+' : totalItems}
          </span>
        )}
      </button>

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}
