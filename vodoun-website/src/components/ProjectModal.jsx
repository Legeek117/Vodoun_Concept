import { useEffect, useState } from 'react';

/**
 * ProjectModal — détail d'un projet professionnel + demande de devis.
 *
 * Le formulaire est accessible IMMÉDIATEMENT (colonne droite sur desktop,
 * juste sous l'en-tête sur mobile), jamais « en bas après scroll ».
 * Il est pré-rempli avec le type de projet et le nom du projet choisi.
 */
export default function ProjectModal({ project, onClose }) {
  const [sent, setSent] = useState(false);

  // Verrouille le scroll de la page derrière la modal + fermeture Échap
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  if (!project) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
  };

  const prefillDesc =
`Bonjour, je suis intéressé(e) par le projet « ${project.title} »${project.domain ? ` (${project.domain})` : ''}.

Contexte du lieu / projet :
Surface ou nombre de pièces :
Délais souhaités :

Merci de me faire parvenir un devis personnalisé.`;

  return (
    <div className="fixed inset-0 z-[2000] overflow-y-auto" role="dialog" aria-modal="true" aria-label={`Projet ${project.title}`}>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-noir/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative min-h-full flex items-start lg:items-center justify-center p-4 md:p-6 pointer-events-none">
        <div className="relative w-full max-w-6xl bg-ivoire rounded-[28px] overflow-hidden shadow-2xl pointer-events-auto animate-project-modal-in">

          {/* Fermer */}
          <button
            onClick={onClose}
            aria-label="Fermer"
            className="absolute top-4 right-4 z-30 w-11 h-11 rounded-full bg-noir/60 backdrop-blur-md text-ivoire border border-ivoire/20 flex items-center justify-center text-xl hover:bg-or hover:text-noir hover:border-or transition-all duration-300"
          >
            ✕
          </button>

          {/* ── Ligne 1 : visuel + formulaire ── */}
          <div className="grid lg:grid-cols-2">
            {/* Visuel — compact sur mobile pour que le formulaire domine l'écran */}
            <div className="relative min-h-[150px] lg:min-h-[500px]">
              <img
                src={project.image}
                alt={project.title}
                className="absolute inset-0 w-full h-full object-cover"
                loading="eager"
                decoding="async"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-noir via-noir/30 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5 md:p-8">
                {project.tag && (
                  <span className="text-[9px] uppercase tracking-[0.35em] text-or font-bold bg-noir/40 px-3 py-1.5 rounded-full inline-block mb-2 md:mb-3">
                    {project.tag}
                  </span>
                )}
                <h2 className="font-playfair text-2xl md:text-4xl font-black text-ivoire leading-tight drop-shadow-lg">
                  {project.title}
                </h2>
                <p className="hidden sm:block text-ivoire/75 text-sm md:text-base font-playfair italic mt-2 max-w-md">
                  {project.desc}
                </p>
              </div>
            </div>

            {/* Formulaire — visible dès l'ouverture */}
            <div className="bg-ivoire max-h-[92vh] overflow-y-auto">
              {sent ? (
                <div className="min-h-[560px] flex flex-col items-center justify-center text-center p-8 md:p-12">
                  <div className="w-16 h-16 bg-or/10 rounded-full flex items-center justify-center mx-auto mb-6 text-or text-2xl">✓</div>
                  <h3 className="font-playfair text-3xl font-bold text-noir mb-3">Demande Reçue</h3>
                  <p className="text-brun/50 text-sm max-w-xs">
                    Votre demande de devis pour <strong>{project.title}</strong> a bien été envoyée. Notre équipe vous répondra sous 48h.
                  </p>
                  <button onClick={onClose} className="mt-8 px-8 py-3 rounded-xl border border-brun/20 text-brun text-xs uppercase tracking-[0.3em] font-bold hover:border-or hover:text-or transition-colors duration-300">
                    Fermer
                  </button>
                </div>
              ) : (
                <div className="p-5 md:p-8">
                  <h3 className="font-playfair text-2xl font-bold text-noir mb-1">Demander un Devis</h3>
                  <p className="text-[10px] uppercase tracking-[0.4em] text-or/70 font-bold mb-2">Projet {project.title}</p>
                  <p className="hidden sm:block text-brun/50 text-xs mb-5">Formulaire pré-rempli — modifiez librement vos informations.</p>

                  <form className="space-y-4" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] uppercase tracking-[0.3em] text-brun/50 block mb-1.5">Nom complet</label>
                        <input required type="text" placeholder="Jean Dupont" className="w-full px-4 py-3 bg-white border border-brun/15 rounded-xl focus:border-or focus:outline-none transition-all duration-300 text-sm text-brun" />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase tracking-[0.3em] text-brun/50 block mb-1.5">Email</label>
                        <input required type="email" placeholder="contact@entreprise.com" className="w-full px-4 py-3 bg-white border border-brun/15 rounded-xl focus:border-or focus:outline-none transition-all duration-300 text-sm text-brun" />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] uppercase tracking-[0.3em] text-brun/50 block mb-1.5">Téléphone (facultatif)</label>
                      <input type="tel" placeholder="+229 ..." className="w-full px-4 py-3 bg-white border border-brun/15 rounded-xl focus:border-or focus:outline-none transition-all duration-300 text-sm text-brun" />
                    </div>

                    <div>
                      <label className="text-[10px] uppercase tracking-[0.3em] text-brun/50 block mb-1.5">Type de projet</label>
                      <select required defaultValue={project.domain || 'Autre'} className="w-full px-4 py-3 bg-white border border-brun/15 rounded-xl focus:border-or focus:outline-none transition-all duration-300 text-sm text-brun">
                        <option value="Hôtel / Restaurant">Hôtel / Restaurant</option>
                        <option value="Bureaux / Siège social">Bureaux / Siège social</option>
                        <option value="Installation monumentale">Installation monumentale</option>
                        <option value="Décoration & Objets">Décoration & Objets</option>
                        <option value="Luminaires">Luminaires</option>
                        <option value="Autre">Autre</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] uppercase tracking-[0.3em] text-brun/50 block mb-1.5">Projet concerné</label>
                      <input readOnly value={project.title} className="w-full px-4 py-3 bg-or/5 border border-or/30 rounded-xl text-sm text-noir font-semibold cursor-default" />
                    </div>

                    <div>
                      <label className="text-[10px] uppercase tracking-[0.3em] text-brun/50 block mb-1.5">Description du projet</label>
                      <textarea required defaultValue={prefillDesc} rows={5} className="w-full px-4 py-3 bg-white border border-brun/15 rounded-xl focus:border-or focus:outline-none transition-all duration-300 text-sm text-brun resize-none" />
                    </div>

                    <button type="submit" className="w-full py-4 rounded-xl font-bold uppercase tracking-[0.4em] text-sm mt-2 shadow-lg hover:opacity-90 transition-opacity" style={{ background: 'linear-gradient(135deg, #B8860B, #8a6208)', color: '#F4F0E6' }}>
                      Initier le Projet
                    </button>

                    <a
                      href={`mailto:contact@vodun-concept.com?subject=Devis%20—%20${encodeURIComponent(project.title)}&body=${encodeURIComponent(prefillDesc)}`}
                      className="block text-center text-[11px] uppercase tracking-[0.25em] text-brun/40 hover:text-or transition-colors duration-300 mt-4"
                    >
                      ou écrivez-nous directement
                    </a>
                  </form>
                </div>
              )}
            </div>
          </div>

          {/* ── Ligne 2 : détails étendus (sous le formulaire) ── */}
          <div className="border-t border-brun/10 bg-white/40 px-6 md:px-8 py-6 grid gap-6 md:grid-cols-3">
            <div>
              <span className="text-[10px] uppercase tracking-[0.4em] text-or font-bold block mb-3">Le projet</span>
              <p className="text-brun/70 text-sm leading-relaxed font-playfair">{project.desc}</p>
              {project.details && (
                <p className="text-brun/70 text-sm leading-relaxed font-playfair mt-3">{project.details}</p>
              )}
            </div>
            {project.highlights && project.highlights.length > 0 && (
              <div>
                <span className="text-[10px] uppercase tracking-[0.4em] text-or font-bold block mb-3">Points forts</span>
                <ul className="space-y-2">
                  {project.highlights.map((h, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-brun/70">
                      <span className="text-or mt-0.5 text-xs">✦</span>
                      {h}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div>
              <span className="text-[10px] uppercase tracking-[0.4em] text-or font-bold block mb-3">Informations pratiques</span>
              <ul className="space-y-2 text-sm text-brun/70">
                <li className="flex items-start gap-2.5"><span className="text-or mt-0.5 text-xs">✦</span>{project.timeline || 'Délai sur devis — ateliers à Ouidah'}</li>
                <li className="flex items-start gap-2.5"><span className="text-or mt-0.5 text-xs">✦</span>Livraison & installation incluses</li>
                <li className="flex items-start gap-2.5"><span className="text-or mt-0.5 text-xs">✦</span>Fabrication artisanale, pièce propre à votre lieu</li>
              </ul>
            </div>
          </div>

        </div>
      </div>

      <style>{`
        @keyframes project-modal-in {
          from { opacity: 0; transform: translateY(24px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-project-modal-in {
          animation: project-modal-in 0.4s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
      `}</style>
    </div>
  );
}