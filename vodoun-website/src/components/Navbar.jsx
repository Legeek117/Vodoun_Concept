import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import gsap from 'gsap';
import { useCart } from '../store';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const { totalItems } = useCart();
  const navRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    gsap.fromTo(
      navRef.current,
      { y: -100, opacity: 0 },
      { y: 0, opacity: 1, duration: 1.5, ease: 'expo.out', delay: 1 }
    );
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <nav
      ref={navRef}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${
        isScrolled || location.pathname !== '/' ? 'bg-noir py-4 border-b border-ivoire/10' : 'bg-transparent py-8'
      }`}
    >
      <div className="px-[5vw]">
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="font-playfair text-3xl font-black text-or cursor-pointer tracking-tighter hover:scale-105 transition-transform duration-500"
          >
            V O D O U N
          </Link>

          <div className="hidden lg:flex items-center gap-12">
            <Link
              to="/"
              className="text-ivoire/60 hover:text-or transition-colors font-bold uppercase tracking-[0.3em] text-[0.6rem]"
            >
              Accueil
            </Link>
            <Link
              to="/boutique"
              className="text-ivoire/60 hover:text-or transition-colors font-bold uppercase tracking-[0.3em] text-[0.6rem]"
            >
              Boutique
            </Link>
            <button
              className="text-ivoire/60 hover:text-or transition-colors font-bold uppercase tracking-[0.3em] text-[0.6rem]"
              onClick={() => {
                window.location.href = '/#pantheon';
              }}
            >
              Héritage
            </button>
          </div>

          <div className="flex items-center gap-8">
            <Link
              to="/panier"
              className="text-ivoire/60 hover:text-or transition-colors relative group"
            >
              <span className="text-[0.6rem] font-bold uppercase tracking-[0.3em]">
                Panier {totalItems > 0 ? `(${totalItems})` : ''}
              </span>
              <div className="absolute -bottom-1 left-0 w-0 h-[1px] bg-or group-hover:w-full transition-all duration-500"></div>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
