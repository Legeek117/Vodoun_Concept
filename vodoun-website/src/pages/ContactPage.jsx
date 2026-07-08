import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

export default function ContactPage() {
  const [sent, setSent] = useState(false);
  const [focused, setFocused] = useState(null);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({ nom: '', email: '', sujet: '', message: '' });
  const fieldRefs = useRef({});
  const cardRef = useRef(null);
  const overlayRef = useRef(null);
  const orb1Ref = useRef(null);
  const orb2Ref = useRef(null);
  const particlesRef = useRef([]);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  // Floating orb animations
  useEffect(() => {
    gsap.to(orb1Ref.current, { y: -30, x: 20, duration: 6, ease: 'sine.inOut', yoyo: true, repeat: -1 });
    gsap.to(orb2Ref.current, { y: 25, x: -18, duration: 8, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 1 });

    // Floating particles
    particlesRef.current.forEach((el, i) => {
      if (!el) return;
      gsap.to(el, {
        y: gsap.utils.random(-40, 40),
        x: gsap.utils.random(-20, 20),
        opacity: gsap.utils.random(0.3, 0.8),
        duration: gsap.utils.random(3, 7),
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
        delay: i * 0.4,
      });
    });
  }, []);

  // 3D tilt on card
  const handleMouseMove = (e) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) / (rect.width / 2);
    const dy = (e.clientY - cy) / (rect.height / 2);
    gsap.to(card, {
      rotateY: dx * 8,
      rotateX: -dy * 6,
      scale: 1.01,
      duration: 0.4,
      ease: 'power2.out',
      transformPerspective: 1000,
    });
    // Move glow with cursor
    gsap.to(overlayRef.current, {
      background: `radial-gradient(ellipse 70% 60% at ${50 + dx * 20}% ${50 + dy * 15}%, rgba(220,160,40,0.22) 0%, rgba(200,110,20,0.10) 50%, transparent 80%)`,
      duration: 0.3,
    });
  };

  const handleMouseLeave = () => {
    gsap.to(cardRef.current, {
      rotateY: 0, rotateX: 0, scale: 1,
      duration: 0.7, ease: 'elastic.out(1,0.5)',
    });
    gsap.to(overlayRef.current, {
      background: 'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(220,160,40,0.16) 0%, rgba(200,110,20,0.07) 50%, transparent 80%)',
      duration: 0.5,
    });
  };

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.id]: e.target.value }));
    if (errors[e.target.id]) setErrors(prev => ({ ...prev, [e.target.id]: false }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!form.nom.trim()) newErrors.nom = 'Champ requis';
    if (!form.email.trim()) newErrors.email = 'Email requis';
    if (!form.sujet) newErrors.sujet = 'Choisissez un sujet';
    if (!form.message.trim()) newErrors.message = 'Message requis';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      // Shake each invalid field
      Object.keys(newErrors).forEach(key => {
        const el = fieldRefs.current[key];
        if (el) gsap.fromTo(el, { x: -6 }, { x: 0, duration: 0.4, ease: 'elastic.out(1,0.3)' });
      });
      return;
    }
    gsap.to(cardRef.current, { scale: 0.98, duration: 0.15, yoyo: true, repeat: 1 });
    setTimeout(() => setSent(true), 300);
  };

  const infoItems = [
    {
      icon: '📍',
      label: 'Adresse',
      value: 'Rue principale, Ouidah, Bénin',
    },
    {
      icon: '✉️',
      label: 'Email',
      value: 'contact@VODUN-concept.com',
      href: 'mailto:contact@VODUN-concept.com',
    },
    {
      icon: '📞',
      label: 'Téléphone',
      value: '+229 00 00 00 00',
      href: 'tel:+22900000000',
    },
  ];

  const hours = [
    { day: 'Lundi – Vendredi', time: '9h00 – 18h00' },
    { day: 'Samedi', time: '10h00 – 17h00' },
    { day: 'Dimanche', time: 'Fermé' },
  ];

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{ backgroundColor: '#1A1410' }}
    >
      {/* ── Ambient orbs ── */}
      <div
        ref={orb1Ref}
        className="pointer-events-none absolute"
        style={{
          top: '15%', right: '10%',
          width: 420, height: 420,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(184,134,11,0.14) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />
      <div
        ref={orb2Ref}
        className="pointer-events-none absolute"
        style={{
          bottom: '20%', left: '5%',
          width: 320, height: 320,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(142,36,32,0.12) 0%, transparent 70%)',
          filter: 'blur(50px)',
        }}
      />

      {/* ── Floating ritual particles ── */}
      {['✦', '◆', '✦', '◇', '✦', '◆', '◇', '✦'].map((sym, i) => (
        <span
          key={i}
          ref={el => (particlesRef.current[i] = el)}
          className="pointer-events-none absolute text-or/10 select-none"
          style={{
            fontSize: `${Math.random() * 12 + 8}px`,
            top: `${10 + i * 10}%`,
            left: `${5 + (i % 4) * 22}%`,
            opacity: 0.2,
          }}
        >
          {sym}
        </span>
      ))}

      {/* ── Page content ── */}
      <div className="relative z-10 max-w-7xl mx-auto px-[5vw] pt-32 pb-24">
        {/* Header */}
        <div className="mb-16">
          <span className="section-label text-or/50">Contact</span>
          <h1 className="editorial-heading text-ivoire mt-1">Nous contacter</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">

          {/* ── Left: info cards ── */}
          <div className="space-y-5">
            {/* Info items */}
            {infoItems.map(({ icon, label, value, href }) => (
              <div
                key={label}
                className="group flex items-start gap-5 p-6 rounded-2xl transition-all duration-500 cursor-default"
                style={{
                  background: 'rgba(244,240,230,0.04)',
                  border: '1px solid rgba(184,134,11,0.12)',
                  boxShadow: '0 4px 24px rgba(0,0,0,0.2)',
                }}
                onMouseEnter={e => gsap.to(e.currentTarget, { y: -4, boxShadow: '0 12px 40px rgba(184,134,11,0.15)', duration: 0.3 })}
                onMouseLeave={e => gsap.to(e.currentTarget, { y: 0, boxShadow: '0 4px 24px rgba(0,0,0,0.2)', duration: 0.4, ease: 'power2.out' })}
              >
                {/* Icon bubble */}
                <div
                  className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-xl"
                  style={{
                    background: 'linear-gradient(135deg, rgba(184,134,11,0.2) 0%, rgba(142,36,32,0.1) 100%)',
                    border: '1px solid rgba(184,134,11,0.2)',
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1)',
                  }}
                >
                  {icon}
                </div>
                <div>
                  <p className="text-ivoire/30 text-[10px] uppercase tracking-[0.4em] mb-1">{label}</p>
                  {href ? (
                    <a href={href} className="text-ivoire/80 text-sm hover:text-or transition-colors">{value}</a>
                  ) : (
                    <p className="text-ivoire/80 text-sm">{value}</p>
                  )}
                </div>
              </div>
            ))}

            {/* Hours card */}
            <div
              className="p-6 rounded-2xl"
              style={{
                background: 'rgba(244,240,230,0.03)',
                border: '1px solid rgba(184,134,11,0.1)',
              }}
            >
              <p className="text-ivoire/30 text-[10px] uppercase tracking-[0.4em] mb-5">Heures d'ouverture</p>
              <div className="space-y-3">
                {hours.map(({ day, time }) => (
                  <div key={day} className="flex justify-between items-center">
                    <span className="text-ivoire/50 text-xs uppercase tracking-wider">{day}</span>
                    <span
                      className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full"
                      style={{
                        background: time === 'Fermé' ? 'rgba(142,36,32,0.15)' : 'rgba(184,134,11,0.12)',
                        color: time === 'Fermé' ? '#8E2420' : '#B8860B',
                      }}
                    >
                      {time}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Social */}
            <div className="flex gap-4 pt-2">
              {['Instagram', 'Facebook'].map((s) => (
                <a
                  key={s}
                  href="#"
                  className="flex-1 py-3 rounded-xl text-center text-[10px] uppercase tracking-[0.35em] font-bold transition-all duration-300"
                  style={{
                    background: 'rgba(244,240,230,0.04)',
                    border: '1px solid rgba(184,134,11,0.12)',
                    color: 'rgba(244,240,230,0.4)',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.color = '#B8860B'; e.currentTarget.style.borderColor = 'rgba(184,134,11,0.4)'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'rgba(244,240,230,0.4)'; e.currentTarget.style.borderColor = 'rgba(184,134,11,0.12)'; }}
                >
                  {s}
                </a>
              ))}
            </div>
          </div>

          {/* ── Right: 3D form card ── */}
          <div style={{ perspective: '1000px' }}>
            <div
              ref={cardRef}
              className="relative rounded-3xl overflow-hidden"
              style={{
                background: 'rgba(244,240,230,0.04)',
                border: '1px solid rgba(184,134,11,0.22)',
                boxShadow: '0 30px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.07)',
                transformStyle: 'preserve-3d',
              }}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              {/* Warm glow inside card */}
              <div
                ref={overlayRef}
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: 'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(220,160,40,0.16) 0%, rgba(200,110,20,0.07) 50%, transparent 80%)',
                  zIndex: 0,
                }}
              />

              {/* Card top accent line */}
              <div
                className="absolute top-0 left-0 right-0 h-[2px]"
                style={{
                  background: 'linear-gradient(90deg, transparent 0%, rgba(184,134,11,0.6) 50%, transparent 100%)',
                }}
              />

              {/* Decorative corner orb */}
              <div
                className="absolute top-0 right-0 w-48 h-48 pointer-events-none"
                style={{
                  background: 'radial-gradient(ellipse at top right, rgba(184,134,11,0.1) 0%, transparent 60%)',
                  zIndex: 0,
                }}
              />

              <div className="relative z-10 p-8 md:p-10">
                {sent ? (
                  /* Success state */
                  <div className="py-16 text-center">
                    <div
                      className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl"
                      style={{
                        background: 'linear-gradient(135deg, rgba(184,134,11,0.3), rgba(184,134,11,0.1))',
                        border: '1px solid rgba(184,134,11,0.4)',
                        boxShadow: '0 0 40px rgba(184,134,11,0.2)',
                      }}
                    >
                      ✦
                    </div>
                    <p className="text-[10px] uppercase tracking-[0.5em] text-or/60 mb-3">Message envoyé</p>
                    <h3 className="font-playfair text-2xl font-bold text-ivoire mb-4">Merci pour votre message</h3>
                    <p className="text-ivoire/40 text-sm">Nous vous répondrons dans les plus brefs délais.</p>
                    <button
                      onClick={() => setSent(false)}
                      className="mt-8 text-xs uppercase tracking-[0.4em] text-or/50 hover:text-or transition-colors"
                    >
                      Nouveau message
                    </button>
                  </div>
                ) : (
                  /* Form */
                  <>
                    <p className="text-[9px] uppercase tracking-[0.45em] text-or/50 mb-2">Message</p>
                    <h3 className="font-playfair text-2xl font-bold text-ivoire mb-8">Envoyez-nous un message</h3>

                    <form onSubmit={handleSubmit} className="space-y-5">
                      {/* Nom + Email row */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[
                          { id: 'nom', type: 'text', label: 'Nom', placeholder: 'Votre nom' },
                          { id: 'email', type: 'email', label: 'Email', placeholder: 'votre@email.com' },
                        ].map(({ id, type, label, placeholder }) => (
                          <div key={id}>
                            <label className="block text-ivoire/35 mb-2 text-[10px] uppercase tracking-[0.35em]">
                              {label} <span className="text-rouge-rituel/70">*</span>
                            </label>
                            <div
                              ref={el => (fieldRefs.current[id] = el)}
                              className="relative rounded-xl overflow-hidden transition-all duration-300"
                              style={{
                                boxShadow: errors[id]
                                  ? '0 0 0 1.5px rgba(142,36,32,0.8), 0 4px 20px rgba(142,36,32,0.2)'
                                  : focused === id
                                    ? '0 0 0 1px rgba(184,134,11,0.6), 0 4px 20px rgba(184,134,11,0.15)'
                                    : '0 0 0 1px rgba(184,134,11,0.15)',
                              }}
                            >
                              {focused === id && !errors[id] && (
                                <div
                                  className="absolute inset-0 pointer-events-none"
                                  style={{ background: 'linear-gradient(135deg, rgba(184,134,11,0.06) 0%, transparent 100%)' }}
                                />
                              )}
                              <input
                                type={type}
                                id={id}
                                value={form[id]}
                                onChange={handleChange}
                                className="relative w-full px-4 py-3 text-ivoire text-sm placeholder:text-ivoire/20 focus:outline-none bg-transparent"
                                style={{ background: 'rgba(255,255,255,0.05)' }}
                                placeholder={placeholder}
                                onFocus={() => setFocused(id)}
                                onBlur={() => setFocused(null)}
                              />
                            </div>
                            {errors[id] && (
                              <p className="mt-1.5 text-[10px] text-rouge-rituel/80 uppercase tracking-wider">{errors[id]}</p>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Sujet */}
                      <div>
                        <label className="block text-ivoire/35 mb-2 text-[10px] uppercase tracking-[0.35em]">
                          Sujet <span className="text-rouge-rituel/70">*</span>
                        </label>
                        <div
                          ref={el => (fieldRefs.current['sujet'] = el)}
                          className="relative rounded-xl overflow-hidden transition-all duration-300"
                          style={{
                            boxShadow: errors.sujet
                              ? '0 0 0 1.5px rgba(142,36,32,0.8), 0 4px 20px rgba(142,36,32,0.2)'
                              : focused === 'sujet'
                                ? '0 0 0 1px rgba(184,134,11,0.6), 0 4px 20px rgba(184,134,11,0.15)'
                                : '0 0 0 1px rgba(184,134,11,0.15)',
                          }}
                        >
                          <select
                            id="sujet"
                            value={form.sujet}
                            onChange={handleChange}
                            className="w-full px-4 py-3 text-ivoire/70 text-sm focus:outline-none bg-transparent appearance-none cursor-pointer"
                            style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(244,240,230,0.7)' }}
                            onFocus={() => setFocused('sujet')}
                            onBlur={() => setFocused(null)}
                          >
                            <option value="" style={{ background: '#1A1410' }}>Choisir un sujet...</option>
                            <option value="commande" style={{ background: '#1A1410' }}>Commande &amp; Livraison</option>
                            <option value="produit" style={{ background: '#1A1410' }}>Information produit</option>
                            <option value="b2b" style={{ background: '#1A1410' }}>Partenariat B2B</option>
                            <option value="autre" style={{ background: '#1A1410' }}>Autre</option>
                          </select>
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-or/40">▾</div>
                        </div>
                        {errors.sujet && (
                          <p className="mt-1.5 text-[10px] text-rouge-rituel/80 uppercase tracking-wider">{errors.sujet}</p>
                        )}
                      </div>

                      {/* Message */}
                      <div>
                        <label className="block text-ivoire/35 mb-2 text-[10px] uppercase tracking-[0.35em]">
                          Message <span className="text-rouge-rituel/70">*</span>
                        </label>
                        <div
                          ref={el => (fieldRefs.current['message'] = el)}
                          className="relative rounded-xl overflow-hidden transition-all duration-300"
                          style={{
                            boxShadow: errors.message
                              ? '0 0 0 1.5px rgba(142,36,32,0.8), 0 4px 20px rgba(142,36,32,0.2)'
                              : focused === 'message'
                                ? '0 0 0 1px rgba(184,134,11,0.6), 0 4px 20px rgba(184,134,11,0.15)'
                                : '0 0 0 1px rgba(184,134,11,0.15)',
                          }}
                        >
                          {focused === 'message' && !errors.message && (
                            <div
                              className="absolute inset-0 pointer-events-none"
                              style={{ background: 'linear-gradient(135deg, rgba(184,134,11,0.06) 0%, transparent 100%)' }}
                            />
                          )}
                          <textarea
                            id="message"
                            rows={5}
                            value={form.message}
                            onChange={handleChange}
                            className="relative w-full px-4 py-3 text-ivoire text-sm placeholder:text-ivoire/20 focus:outline-none resize-none bg-transparent"
                            style={{ background: 'rgba(255,255,255,0.05)' }}
                            placeholder="Votre message..."
                            onFocus={() => setFocused('message')}
                            onBlur={() => setFocused(null)}
                          />
                          {/* Char-count decoration */}
                          <div className="absolute bottom-3 right-3 text-[10px] text-ivoire/15 pointer-events-none">✦</div>
                        </div>
                        {errors.message && (
                          <p className="mt-1.5 text-[10px] text-rouge-rituel/80 uppercase tracking-wider">{errors.message}</p>
                        )}
                      </div>

                      {/* Submit */}
                      <button
                        type="submit"
                        className="group relative w-full py-4 rounded-xl font-bold uppercase tracking-[0.35em] text-sm overflow-hidden transition-all duration-300"
                        style={{
                          background: 'linear-gradient(135deg, #B8860B 0%, #8a6208 100%)',
                          color: '#F4F0E6',
                          boxShadow: '0 6px 30px rgba(184,134,11,0.35)',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 10px 40px rgba(184,134,11,0.55)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                        onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 6px 30px rgba(184,134,11,0.35)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                      >
                        {/* Shimmer */}
                        <span
                          className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"
                          style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)' }}
                        />
                        <span className="relative">Envoyer le message</span>
                      </button>
                    </form>
                  </>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}