import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import gsap from 'gsap';

export default function Navbar({ currentPath }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navRef = useRef(null);
  const location = useLocation();

  const navLinks = [
    { name: 'Accueil', path: '/accueil' },
    { name: 'Collections', path: '/boutique' },
    { name: 'Panthéon', path: '/pantheon' },
    { name: 'Projets Pros', path: '/projets-pro' },
    { name: 'La Marque', path: '/a-propos' },
    { name: 'Contact', path: '/contact' },
    { name: 'Mon Compte', path: '/compte' },
  ];

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
    setIsMenuOpen(false);
  }, [location.pathname]);

  return (
    <nav
      ref={navRef}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${
        isScrolled || location.pathname !== '/' ? 'bg-noir py-4 border-b border-ivoire/10' : 'bg-transparent py-8'
      }`}
    >
      <div className="max-w-7xl mx-auto px-[5vw]">
        <div className="flex items-center justify-between">
          <Link
            to="/accueil"
            className="font-playfair text-3xl font-black text-or cursor-pointer tracking-tighter hover:scale-105 transition-transform duration-500"
          >
            V O D O U N
          </Link>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => {
              const isActive = currentPath === link.path || 
                (link.path === '/boutique' && currentPath?.startsWith('/boutique'));
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`relative transition-all duration-300 font-bold uppercase tracking-[0.3em] text-[0.6rem] ${
                    isActive ? 'text-or' : 'text-ivoire/70 hover:text-or'
                  }`}
                >
                  {link.name}
                  {isActive && (
                    <span className="absolute -bottom-2 left-0 w-full h-0.5 bg-or animate-pulse" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden flex flex-col gap-2"
          >
            <div className={`w-6 h-0.5 bg-or transition-all duration-300 ${isMenuOpen ? 'rotate-45 translate-y-2.5' : ''}`} />
            <div className={`w-6 h-0.5 bg-or transition-all duration-300 ${isMenuOpen ? 'opacity-0' : ''}`} />
            <div className={`w-6 h-0.5 bg-or transition-all duration-300 ${isMenuOpen ? '-rotate-45 -translate-y-2.5' : ''}`} />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 bg-noir border-t border-ivoire/10">
          <div className="max-w-7xl mx-auto px-[5vw] py-16">
            <div className="flex flex-col gap-8">
              {navLinks.map((link) => {
                const isActive = currentPath === link.path || 
                  (link.path === '/boutique' && currentPath?.startsWith('/boutique'));
                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    onClick={() => setIsMenuOpen(false)}
                    className={`text-lg font-bold uppercase tracking-[0.3em] transition-colors ${
                      isActive ? 'text-or' : 'text-ivoire/80 hover:text-or'
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
