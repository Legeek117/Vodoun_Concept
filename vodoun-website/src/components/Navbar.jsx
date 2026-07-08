import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import gsap from 'gsap';
import { useCurrency } from '../context/CurrencyContext';

export default function Navbar({ currentPath }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navRef = useRef(null);
  const location = useLocation();
  const { currency, setCurrency, SYMBOLS } = useCurrency();

  const navLinks = [
    { name: 'Accueil', path: '/accueil' },
    { name: 'Collections', path: '/boutique' },
    { name: 'Panthéon', path: '/pantheon' },
    { name: 'Projets Pros', path: '/projets-pro' },
    { name: 'La Marque', path: '/a-propos' },
    { name: 'Contact', path: '/contact' },
    { name: 'Suivi de Commande', path: '/compte' },
  ];

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    gsap.fromTo(navRef.current, { y: -100, opacity: 0 }, { y: 0, opacity: 1, duration: 1.5, ease: 'expo.out', delay: 1 });
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  return (
    <nav
      ref={navRef}
      className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-700 ${isScrolled || location.pathname !== '/' ? 'bg-noir py-4 border-b border-ivoire/10' : 'bg-transparent py-8'}`}
    >
      <div className="max-w-7xl mx-auto px-[5vw]">
        <div className="flex items-center justify-between">
          <a
            href="/accueil"
            className="font-playfair text-2xl md:text-3xl font-black text-or cursor-pointer tracking-[0.2em] transform hover:scale-105 transition-transform duration-500 uppercase"
          >
            VODUN
          </a>

          {/* Desktop Liquid Glass Menu */}
          <div className="hidden lg:flex items-center">
            <div
              className="liquid-nav relative flex items-center px-2 py-2 rounded-full transition-all duration-700"
              style={{
                background: 'rgba(20, 15, 10, 0.7)',
                backdropFilter: 'blur(50px) saturate(200%)',
                boxShadow: `0 40px 80px -20px rgba(0,0,0,0.5),0 10px 30px -10px rgba(0,0,0,0.3),inset 0 2px 3px -1px rgba(184,134,11,0.2),inset 0 -2px 4px -1px rgba(0,0,0,0.4),inset 0 0 0 1px rgba(184,134,11,0.15)`,
              }}
            >
              {navLinks.map((link) => {
                const isActive = currentPath === link.path || (link.path === '/boutique' && currentPath?.startsWith('/boutique'));
                return (
                  <a
                    key={link.name}
                    href={link.path}
                    className={`relative px-6 py-3 rounded-full transition-all duration-500 font-black uppercase tracking-[0.25em] text-[0.55rem] ${isActive ? 'text-noir bg-or shadow-[0_4px_20px_rgba(184,134,11,0.4)]' : 'text-ivoire/80 hover:text-ivoire hover:bg-white/5'}`}
                  >
                    {link.name}
                  </a>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-6">
            {/* Currency Selector Desktop */}
            <div className="relative group hidden lg:block">
              <button className="flex items-center gap-1 font-black text-sm text-or uppercase tracking-widest">
                {currency} <span className="text-[10px]">▼</span>
              </button>
              <div className="absolute top-full right-0 mt-2 py-2 bg-noir border border-ivoire/10 rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all duration-300">
                {Object.keys(SYMBOLS).map((c) => (
                  <button
                    key={c}
                    onClick={() => setCurrency(c)}
                    className={`block w-full text-left px-5 py-2 text-xs uppercase tracking-widest hover:text-or transition-colors ${currency === c ? 'text-or' : 'text-ivoire'}`}
                  >
                    {c} ({SYMBOLS[c]})
                  </button>
                ))}
              </div>
            </div>

            {/* Hamburger */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden flex flex-col gap-2 z-50"
            >
              <div className={`w-6 h-0.5 bg-or transition-all duration-300 ${isMenuOpen ? 'rotate-45 translate-y-2.5' : ''}`} />
              <div className={`w-6 h-0.5 bg-or transition-all duration-300 ${isMenuOpen ? 'opacity-0' : ''}`} />
              <div className={`w-6 h-0.5 bg-or transition-all duration-300 ${isMenuOpen ? '-rotate-45 -translate-y-2.5' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 bg-noir border-t border-ivoire/10 z-40">
          <div className="max-w-7xl mx-auto px-[5vw] py-12">
            {/* Currency */}
            <div className="flex gap-6 mb-8 pb-6 border-b border-ivoire/10">
              {Object.keys(SYMBOLS).map((c) => (
                <button
                  key={c}
                  onClick={() => { setCurrency(c); setIsMenuOpen(false); }}
                  className={`text-sm font-black uppercase tracking-widest ${currency === c ? 'text-or' : 'text-ivoire/40 hover:text-or'}`}
                >
                  {c}
                </button>
              ))}
            </div>
            {/* Links in two columns */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-6">
              {navLinks.map((link) => {
                const isActive = currentPath === link.path || (link.path === '/boutique' && currentPath?.startsWith('/boutique'));
                return (
                  <a
                    key={link.name}
                    href={link.path}
                    className={`text-base font-black uppercase tracking-[0.2em] transition-colors ${isActive ? 'text-or' : 'text-ivoire/80 hover:text-or'}`}
                  >
                    {link.name}
                  </a>
                );
              })}
            </div>
            <p className="mt-10 text-ivoire/15 text-[10px] uppercase tracking-[0.4em]">Vodun · Ouidah · Bénin</p>
          </div>
        </div>
      )}
    </nav>
  );
}
