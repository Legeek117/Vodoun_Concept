import { useState } from 'react';
import usePageMeta from '../hooks/usePageMeta';

export default function ComptePage() {
  usePageMeta({
    title: 'Suivi de commande',
    description: 'Suivez votre commande Vodoun Concept Store en temps réel. Entrez votre code de commande pour connaître le statut de votre livraison.',
  });

  const [isTracked, setIsTracked] = useState(false);
  const [orderCode, setOrderCode] = useState('');
  const [trackedOrder, setTrackedOrder] = useState(null);

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{ backgroundColor: '#1A1410' }}
    >
      {/* Ambient orbs */}
      <div
        className="pointer-events-none absolute"
        style={{
          top: '10%', right: '5%',
          width: 500, height: 500, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(184,134,11,0.08) 0%, transparent 65%)',
          filter: 'blur(80px)',
        }}
      />
      <div
        className="pointer-events-none absolute"
        style={{
          bottom: '15%', left: '0%',
          width: 350, height: 350, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(142,36,32,0.07) 0%, transparent 65%)',
          filter: 'blur(60px)',
        }}
      />

      {/* Decorative vévé — top right */}
      <div className="pointer-events-none absolute top-32 right-[8vw] hidden lg:block opacity-[0.04]">
        <svg width="320" height="320" viewBox="0 0 56 56" fill="none">
          <circle cx="28" cy="28" r="26" stroke="#B8860B" strokeWidth="0.6" />
          <circle cx="28" cy="28" r="18" stroke="#B8860B" strokeWidth="0.5" />
          <line x1="28" y1="2" x2="28" y2="54" stroke="#B8860B" strokeWidth="0.5" />
          <line x1="2" y1="28" x2="54" y2="28" stroke="#B8860B" strokeWidth="0.5" />
          <line x1="9.4" y1="9.4" x2="46.6" y2="46.6" stroke="#B8860B" strokeWidth="0.4" />
          <line x1="46.6" y1="9.4" x2="9.4" y2="46.6" stroke="#B8860B" strokeWidth="0.4" />
          <polygon points="28,14 38,28 28,42 18,28" stroke="#B8860B" strokeWidth="0.7" fill="none" />
          <rect x="22" y="22" width="12" height="12" stroke="#B8860B" strokeWidth="0.6"
            fill="none" transform="rotate(45 28 28)" />
          <circle cx="28" cy="28" r="2.5" fill="#B8860B" fillOpacity="0.5" />
        </svg>
      </div>

      {/* Thin gold horizontal line at top */}
      <div
        className="absolute top-0 left-0 right-0 h-[1px] pointer-events-none"
        style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(184,134,11,0.4) 50%, transparent 100%)' }}
      />
      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col justify-center px-[5vw] pt-28 pb-16 max-w-7xl mx-auto">

        {/* Page title */}
        <div className="mb-10">
          <span className="section-label text-or/50">Suivi de commande</span>
          <h1 className="editorial-heading text-ivoire !text-[clamp(2rem,5vw,3.5rem)] mt-1">Ma Commande</h1>
        </div>

        {/* Form centred */}
        <div className="w-full max-w-lg md:max-w-xl lg:max-w-2xl">
          {!isTracked ? (
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
                  onClick={() => { setIsTracked(false); setOrderCode(''); }}
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
  );
}
