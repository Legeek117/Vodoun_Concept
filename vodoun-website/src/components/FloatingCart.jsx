import { useState } from 'react';
import { useCart } from '../store';
import CartDrawer from './CartDrawer';

export default function FloatingCart() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { totalItems } = useCart();

  return (
    <>
      <button
        onClick={() => setIsCartOpen(true)}
        className="fixed bottom-6 right-6 z-[100] w-16 h-16 md:w-14 md:h-14 rounded-full bg-or shadow-2xl shadow-or/30 flex items-center justify-center text-noir hover:scale-110 active:scale-95 transition-all duration-300"
      >
        <svg className="w-8 h-8 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        {totalItems > 0 && (
          <span className="absolute -top-2 -right-2 w-8 h-8 md:w-6 md:h-6 bg-noir text-or rounded-full flex items-center justify-center text-sm md:text-xs font-black border-2 border-or">
            {totalItems}
          </span>
        )}
      </button>

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}
