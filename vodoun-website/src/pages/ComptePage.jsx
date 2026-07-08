import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { useCart } from '../store';

export default function ComptePage() {
  const [isLit, setIsLit] = useState(false);
  const [isTracked, setIsTracked] = useState(false);
  const [orderCode, setOrderCode] = useState('');
  const [trackedOrder, setTrackedOrder] = useState(null);

  const pageRef = useRef(null);
  const formRef = useRef(null);
  const glowRef = useRef(null);
  const shadeRef = useRef(null);
  const cordRef = useRef(null);
  const overlayRef = useRef(null);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  // Gentle cord swing
  useEffect(() => {
    if (!cordRef.current) return;
    gsap.to(cordRef.current, {
      rotation: 7,
      transformOrigin: 'top center',
      duration: 2,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
    });
  }, []);

  const toggleLamp = () => {
    const lit = !isLit;
    setIsLit(lit);

    if (lit) {
      // Slightly illuminate the dark page
      gsap.to(pageRef.current, { backgroundColor: '#241c14', duration: 0.8, ease: 'power2.out' });
      // Warm radial overlay
      gsap.to(overlayRef.current, { opacity: 1, duration: 0.9, ease: 'power2.out' });
      // Lamp shade glow
      gsap.to(shadeRef.current, {
        filter: 'drop-shadow(0 0 30px rgba(220,165,40,0.8)) drop-shadow(0 4px 70px rgba(200,110,20,0.4))',
        duration: 0.8,
      });
      // Halo below lamp
      gsap.to(glowRef.current, { opacity: 1, scaleX: 1, scaleY: 1, duration: 0.8, ease: 'power2.out' });
      // Form slides in from right
      gsap.fromTo(formRef.current,
        { opacity: 0, x: 40, scale: 0.97 },
        { opacity: 1, x: 0, scale: 1, duration: 0.9, delay: 0.2, ease: 'power3.out' }
      );
    } else {
      gsap.to(pageRef.current, { backgroundColor: '#1A1410', duration: 0.7, ease: 'power2.out' });
      gsap.to(overlayRef.current, { opacity: 0, duration: 0.55, ease: 'power2.in' });
      gsap.to(shadeRef.current, { filter: 'none', duration: 0.6 });
      gsap.to(glowRef.current, { opacity: 0, scaleX: 0.5, scaleY: 0.3, duration: 0.5, ease: 'power2.in' });
      gsap.to(formRef.current, { opacity: 0, x: 30, duration: 0.4, ease: 'power2.in' });
    }
  };

  // Drag / pull cord
  const dragStart = useRef(0);
  const didDrag = useRef(false);
  const onDown = (e) => { didDrag.current = false; dragStart.current = e.touches ? e.touches[0].clientY : e.clientY; };
  const onMove = (e) => { const y = e.touches ? e.touches[0].clientY : e.clientY; if (Math.abs(y - dragStart.current) > 8) didDrag.current = true; };
  const onUp = (e) => { const y = e.changedTouches ? e.changedTouches[0].clientY : e.clientY; if ((didDrag.current && y - dragStart.current > 18) || !didDrag.current) toggleLamp(); didDrag.current = false; };

  // Data
  const user = { name: 'Akouvi', email: 'akouvi@example.com', phone: '+229 01 23 45 67', address: 'Ouidah, Bénin' };
  const orders = [
    { id: '#VC-00123', date: '15 Juin 2026', status: 'Livré', total: 85000 },
    { id: '#VC-00118', date: '02 Juin 2026', status: 'En cours', total: 180000 },
  ];

  return (
    <div
      ref={pageRef}
      className="min-h-screen relative overflow-hidden"
      style={{ backgroundColor: '#1A1410' }}
    >
      {/* Full-page warm glow overlay */}
      <div
        ref={overlayRef}
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          opacity: 0,
          background: 'radial-gradient(ellipse 70% 60% at 25% 45%, rgba(220,160,40,0.18) 0%, rgba(200,110,20,0.08) 55%, transparent 80%)',
        }}
      />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col justify-center px-[5vw] pt-28 pb-16 max-w-7xl mx-auto">

        {/* Page title */}
        <div className="mb-10">
          <span className="section-label text-or/50">Suivi de commande</span>
          <h1 className="editorial-heading text-ivoire !text-[clamp(2rem,5vw,3.5rem)] mt-1">Ma Commande</h1>
        </div>

        {/* Main row: lamp left | form right */}
        <div className="flex flex-col md:flex-row items-center md:items-start gap-16 md:gap-28 lg:gap-52 justify-between">

          {/* ── LAMP (always left) ── */}
          <div className="flex flex-col items-center flex-shrink-0 md:pt-8">
            <p
              className="text-[9px] uppercase tracking-[0.45em] mb-6 transition-colors duration-700 text-center"
              style={{ color: isLit ? '#B8860B' : 'rgba(244,240,230,0.2)' }}
            >
              {isLit ? 'Cliquer pour éteindre' : 'Appuyez sur la lampe'}
            </p>

            {/* Lamp */}
            <div
              className="relative cursor-pointer select-none"
              style={{ touchAction: 'none' }}
              onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp}
              onTouchStart={onDown} onTouchMove={onMove} onTouchEnd={onUp}
            >
              {/* Light halo below dome */}
              <div
                ref={glowRef}
                className="absolute pointer-events-none"
                style={{
                  top: '108px', left: '50%',
                  transform: 'translate(-50%, 0) scaleX(0.5) scaleY(0.3)',
                  transformOrigin: 'top center',
                  width: '220px', height: '220px',
                  borderRadius: '50%',
                  background: 'radial-gradient(ellipse at 50% 0%, rgba(220,165,40,0.7) 0%, rgba(190,110,10,0.25) 50%, transparent 75%)',
                  filter: 'blur(16px)',
                  opacity: 0, zIndex: -1,
                }}
              />

              <svg
                ref={shadeRef}
                width="150" height="340"
                viewBox="0 0 150 340"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{ transition: 'filter 0.7s' }}
              >
                {/* ── Dome shade ── */}
                <path
                  d="M12 90 Q18 52 42 32 Q58 16 75 15 Q92 16 108 32 Q132 52 138 90 Z"
                  fill={isLit ? 'url(#domeLit)' : 'url(#domeDim)'}
                  style={{ transition: 'fill 0.7s' }}
                />
                {/* Inner highlight */}
                <path
                  d="M32 86 Q38 57 55 40 Q65 30 75 28 Q85 30 95 40 Q112 57 118 86 Z"
                  fill={isLit ? 'rgba(255,248,180,0.35)' : 'rgba(255,255,255,0.05)'}
                  style={{ transition: 'fill 0.7s' }}
                />
                {/* Bottom rim */}
                <ellipse cx="75" cy="90" rx="63" ry="17"
                  fill={isLit ? '#d4a020' : '#5a5040'}
                  style={{ transition: 'fill 0.7s' }} />
                <ellipse cx="75" cy="90" rx="63" ry="17"
                  fill={isLit ? 'rgba(255,220,80,0.35)' : 'rgba(255,255,255,0.04)'}
                  style={{ transition: 'fill 0.7s' }} />

                {/* Neck */}
                <rect x="68" y="107" width="14" height="12" rx="3" fill="#6a5a44" />

                {/* Stem */}
                <rect x="71" y="119" width="8" height="130" rx="4" fill="url(#stem)" />

                {/* Base disc */}
                <ellipse cx="75" cy="253" rx="32" ry="8" fill="#6a5a44" />
                {/* Base body */}
                <rect x="46" y="249" width="58" height="20" rx="7" fill="url(#base)" />
                {/* Base foot */}
                <ellipse cx="75" cy="269" rx="30" ry="6" fill="#3a2c1c" />

                {/* ── Pull cord from bottom of shade ── */}
                <g ref={cordRef} style={{ transformOrigin: '75px 107px' }}>
                  <line x1="75" y1="107" x2="75" y2="152"
                    stroke={isLit ? '#c8a030' : '#5a5040'}
                    strokeWidth="1.5"
                    style={{ transition: 'stroke 0.6s' }}
                  />
                  {/* Pull ball */}
                  <circle cx="75" cy="158" r="6"
                    fill={isLit ? 'url(#ballLit)' : '#5a5040'}
                    style={{ transition: 'fill 0.6s' }}
                  />
                </g>

                {/* Light cone (only when lit) */}
                {isLit && (
                  <path
                    d="M13 92 Q-15 210 28 300 L122 300 Q165 210 137 92 Z"
                    fill="url(#cone)"
                    opacity="0.12"
                  />
                )}

                <defs>
                  <linearGradient id="domeLit" x1="75" y1="15" x2="75" y2="92" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#fff8d0" />
                    <stop offset="55%" stopColor="#e8c050" />
                    <stop offset="100%" stopColor="#c8900a" />
                  </linearGradient>
                  <linearGradient id="domeDim" x1="75" y1="15" x2="75" y2="92" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#5a5040" />
                    <stop offset="55%" stopColor="#3a3028" />
                    <stop offset="100%" stopColor="#2a2018" />
                  </linearGradient>
                  <linearGradient id="stem" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#4a3c2c" />
                    <stop offset="50%" stopColor="#8a7a60" />
                    <stop offset="100%" stopColor="#4a3c2c" />
                  </linearGradient>
                  <linearGradient id="base" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8a7a60" />
                    <stop offset="100%" stopColor="#3a2c1c" />
                  </linearGradient>
                  <radialGradient id="ballLit" cx="40%" cy="35%" r="60%">
                    <stop offset="0%" stopColor="#fff0a0" />
                    <stop offset="100%" stopColor="#c8900a" />
                  </radialGradient>
                  <linearGradient id="cone" x1="75" y1="92" x2="75" y2="300" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#ffe060" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#ff8800" stopOpacity="0" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>

          {/* ── FORM (right, hidden until lamp is on) ── */}
          <div
            ref={formRef}
            className="flex-1 w-full max-w-lg md:max-w-xl lg:max-w-2xl"
            style={{ opacity: 0, pointerEvents: isLit ? 'auto' : 'none' }}
          >
            {!isTracked ? (
              /* Tracking Form */
              <div
                className="rounded-2xl p-10 md:p-12 lg:p-14"
                style={{
                  background: 'rgba(244,240,230,0.05)',
                  border: '1px solid rgba(184,134,11,0.25)',
                  boxShadow: '0 24px 64px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.07)',
                  backdropFilter: 'blur(12px)',
                }}
              >
                <p className="text-[9px] uppercase tracking-[0.45em] text-or/50 mb-2">Suivre un colis</p>
                <h2 className="font-playfair text-3xl font-bold text-ivoire mb-8">Statut de la commande</h2>

                <form className="space-y-5" onSubmit={(e) => {
                  e.preventDefault();
                  if (orderCode.trim()) {
                    setTrackedOrder({
                      id: orderCode.toUpperCase(),
                      date: new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }),
                      status: 'Expédié',
                      total: 125000,
                      trackingSteps: [
                        { label: 'Commande confirmée', done: true },
                        { label: 'Préparation', done: true },
                        { label: 'Expédié', done: true },
                        { label: 'En cours de livraison', done: false },
                        { label: 'Livré', done: false },
                      ]
                    });
                    setIsTracked(true);
                  }
                }}>
                  <div>
                    <label className="block text-ivoire/40 mb-2 text-xs uppercase tracking-[0.3em]">Code de commande</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 rounded-lg text-ivoire text-sm placeholder:text-ivoire/20 focus:outline-none transition-all uppercase"
                      style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(184,134,11,0.2)' }}
                      onFocus={e => (e.target.style.borderColor = 'rgba(184,134,11,0.6)')}
                      onBlur={e => (e.target.style.borderColor = 'rgba(184,134,11,0.2)')}
                      placeholder="#VC-123456"
                      value={orderCode}
                      onChange={(e) => setOrderCode(e.target.value)}
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-lg font-bold uppercase tracking-[0.3em] text-sm transition-all duration-300 mt-2"
                    style={{
                      background: 'linear-gradient(135deg, #B8860B 0%, #8a6208 100%)',
                      color: '#F4F0E6',
                      boxShadow: '0 6px 24px rgba(184,134,11,0.35)',
                    }}
                  >
                    Rechercher
                  </button>
                </form>
              </div>
            ) : (
              /* Tracking Result */
              <div className="space-y-4">
                <div
                  className="rounded-2xl p-10 md:p-12"
                  style={{
                    background: 'rgba(244,240,230,0.05)',
                    border: '1px solid rgba(184,134,11,0.2)',
                    boxShadow: '0 20px 50px rgba(0,0,0,0.4)',
                    backdropFilter: 'blur(12px)',
                  }}
                >
                  <div className="flex items-center justify-between border-b border-ivoire/10 pb-6 mb-6">
                    <div>
                      <h3 className="text-ivoire font-playfair text-2xl font-bold">{trackedOrder?.id}</h3>
                      <p className="text-ivoire/40 text-xs mt-1">Passée le {trackedOrder?.date}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-full" style={{ background: 'rgba(184,134,11,0.15)', color: '#B8860B' }}>
                        {trackedOrder?.status}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-6 relative before:absolute before:inset-0 before:ml-[11px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-ivoire/10 before:to-transparent">
                    {trackedOrder?.trackingSteps.map((step, index) => (
                      <div key={index} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                        <div className="flex items-center justify-center w-6 h-6 rounded-full border-2 border-noir shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10" style={{ background: step.done ? '#B8860B' : '#3a3028' }}>
                          <span className="text-[10px]" style={{ color: step.done ? '#fff' : 'transparent' }}>✓</span>
                        </div>
                        <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl" style={{ background: step.done ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.01)', opacity: step.done ? 1 : 0.4 }}>
                          <h4 className="font-bold text-sm text-ivoire">{step.label}</h4>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => {
                      setIsTracked(false);
                      setOrderCode('');
                    }}
                    className="mt-10 w-full text-center text-xs uppercase tracking-[0.3em] text-ivoire/30 hover:text-or transition-colors"
                  >
                    Nouvelle recherche
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}