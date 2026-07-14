import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import fr from '../i18n/fr';
import en from '../i18n/en';

export default function Footer() {
    const { lang } = useLanguage();
    const t = lang === 'fr' ? fr : en;

    return (
        <footer className="bg-noir text-ivoire pt-32 md:pt-48 pb-16 md:pb-24 border-t border-ivoire/10 relative z-20">
            <div className="max-w-7xl mx-auto px-[5vw]">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
                    {/* Logo & Brand */}
                    <div className="lg:col-span-1">
                        <a href="/accueil" aria-label="Vodoun Concept Store — Accueil">
                            <img
                                src="/logo.jpeg"
                                alt="Vodoun Concept Store"
                                style={{ height: 'clamp(50px, 8vw, 80px)', width: 'auto', objectFit: 'contain', marginBottom: '1.5rem' }}
                            />
                        </a>
                        <p className="text-ivoire/60 text-sm leading-relaxed mb-6">Ouidah, Bénin</p>
                        <p className="text-ivoire/40 text-xs uppercase tracking-[0.5em]">{t.footer.tagline}</p>
                    </div>

                    {/* Navigation Links */}
                    <div>
                        <h3 className="section-label text-or mb-6 block">{t.footer.nav}</h3>
                        <ul className="space-y-3">
                            <li><Link to="/accueil" className="text-ivoire/80 text-sm uppercase tracking-[0.3em] hover:text-or transition-colors">{t.nav.home}</Link></li>
                            <li><Link to="/boutique" className="text-ivoire/80 text-sm uppercase tracking-[0.3em] hover:text-or transition-colors">{t.nav.collections}</Link></li>
                            <li><Link to="/a-propos" className="text-ivoire/80 text-sm uppercase tracking-[0.3em] hover:text-or transition-colors">{t.nav.about}</Link></li>
                            <li><Link to="/pantheon" className="text-ivoire/80 text-sm uppercase tracking-[0.3em] hover:text-or transition-colors">{t.nav.pantheon}</Link></li>
                        </ul>
                    </div>

                    {/* Services */}
                    <div>
                        <h3 className="section-label text-or mb-6 block">{t.footer.services}</h3>
                        <ul className="space-y-3">
                            <li><Link to="/projets-pro" className="text-ivoire/80 text-sm uppercase tracking-[0.3em] hover:text-or transition-colors">{t.nav.projects}</Link></li>
                            <li><Link to="/contact" className="text-ivoire/80 text-sm uppercase tracking-[0.3em] hover:text-or transition-colors">{t.nav.contact}</Link></li>
                            <li><Link to="/compte" className="text-ivoire/80 text-sm uppercase tracking-[0.3em] hover:text-or transition-colors">{t.nav.tracking}</Link></li>
                        </ul>
                    </div>

                    {/* Contact & Social */}
                    <div>
                        <h3 className="section-label text-or mb-6 block">{t.footer.follow}</h3>
                        <div className="flex flex-col gap-4 mb-8">
                            <span className="text-ivoire/80 text-sm uppercase tracking-[0.3em] hover:text-or cursor-pointer transition-colors">Instagram</span>
                            <span className="text-ivoire/80 text-sm uppercase tracking-[0.3em] hover:text-or cursor-pointer transition-colors">Facebook</span>
                            <span className="text-ivoire/80 text-sm uppercase tracking-[0.3em] hover:text-or cursor-pointer transition-colors">LinkedIn</span>
                        </div>
                        <h4 className="section-label text-or mb-4 block">{t.footer.contact}</h4>
                        <p className="text-ivoire/80 text-sm">contact@vodun-concept.com</p>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-ivoire/10 flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-ivoire/40 text-xs uppercase tracking-[0.3em] text-center md:text-left leading-relaxed">{t.footer.rights}</p>
                    <div className="flex flex-col md:flex-row gap-4 md:gap-8 items-center">
                        <span className="text-ivoire/40 text-xs uppercase tracking-[0.2em] hover:text-or cursor-pointer transition-colors text-center">{t.footer.legal}</span>
                        <span className="text-ivoire/40 text-xs uppercase tracking-[0.2em] hover:text-or cursor-pointer transition-colors text-center">{t.footer.cgv}</span>
                        <span className="text-ivoire/40 text-xs uppercase tracking-[0.2em] hover:text-or cursor-pointer transition-colors text-center">{t.footer.privacy}</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
