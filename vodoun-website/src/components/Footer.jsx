import { Link } from 'react-router-dom';

export default function Footer() {
    return (
        <footer className="bg-noir text-ivoire pt-32 md:pt-48 pb-16 md:pb-24 border-t border-ivoire/10 relative z-20">
            <div className="max-w-7xl mx-auto px-[5vw]">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
                    {/* Logo & Brand */}
                    <div className="lg:col-span-1">
                        <h2 className="font-playfair text-4xl md:text-5xl font-black text-or mb-6 tracking-tighter">VODUN</h2>
                        <p className="text-ivoire/60 text-sm leading-relaxed mb-6">Ouidah, Bénin</p>
                        <p className="text-ivoire/40 text-xs uppercase tracking-[0.5em]">L'Héritage Immortel</p>
                    </div>

                    {/* Navigation Links */}
                    <div>
                        <h3 className="section-label text-or mb-6 block">Navigation</h3>
                        <ul className="space-y-3">
                            <li><Link to="/accueil" className="text-ivoire/80 text-sm uppercase tracking-[0.3em] hover:text-or transition-colors">Accueil</Link></li>
                            <li><Link to="/boutique" className="text-ivoire/80 text-sm uppercase tracking-[0.3em] hover:text-or transition-colors">Boutique</Link></li>
                            <li><Link to="/a-propos" className="text-ivoire/80 text-sm uppercase tracking-[0.3em] hover:text-or transition-colors">À Propos</Link></li>
                            <li><Link to="/pantheon" className="text-ivoire/80 text-sm uppercase tracking-[0.3em] hover:text-or transition-colors">Panthéon</Link></li>
                        </ul>
                    </div>

                    {/* Services */}
                    <div>
                        <h3 className="section-label text-or mb-6 block">Services</h3>
                        <ul className="space-y-3">
                            <li><Link to="/projets-pro" className="text-ivoire/80 text-sm uppercase tracking-[0.3em] hover:text-or transition-colors">Projets Pro</Link></li>
                            <li><Link to="/contact" className="text-ivoire/80 text-sm uppercase tracking-[0.3em] hover:text-or transition-colors">Contact</Link></li>
                            <li><Link to="/compte" className="text-ivoire/80 text-sm uppercase tracking-[0.3em] hover:text-or transition-colors">Suivi de Commande</Link></li>
                        </ul>
                    </div>

                    {/* Contact & Social */}
                    <div>
                        <h3 className="section-label text-or mb-6 block">Nous Suivre</h3>
                        <div className="flex flex-col gap-4 mb-8">
                            <span className="text-ivoire/80 text-sm uppercase tracking-[0.3em] hover:text-or cursor-pointer transition-colors">Instagram</span>
                            <span className="text-ivoire/80 text-sm uppercase tracking-[0.3em] hover:text-or cursor-pointer transition-colors">Facebook</span>
                            <span className="text-ivoire/80 text-sm uppercase tracking-[0.3em] hover:text-or cursor-pointer transition-colors">LinkedIn</span>
                        </div>
                        <h4 className="section-label text-or mb-4 block">Contact</h4>
                        <p className="text-ivoire/80 text-sm">contact@vodun-concept.com</p>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-ivoire/10 flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-ivoire/40 text-xs uppercase tracking-[0.3em] text-center md:text-left leading-relaxed">© 2025 Vodun Concept Store · Ouidah · Bénin</p>
                    <div className="flex flex-col md:flex-row gap-4 md:gap-8 items-center">
                        <span className="text-ivoire/40 text-xs uppercase tracking-[0.2em] hover:text-or cursor-pointer transition-colors text-center">Mentions Légales</span>
                        <span className="text-ivoire/40 text-xs uppercase tracking-[0.2em] hover:text-or cursor-pointer transition-colors text-center">CGV</span>
                        <span className="text-ivoire/40 text-xs uppercase tracking-[0.2em] hover:text-or cursor-pointer transition-colors text-center">Politique de Confidentialité</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
