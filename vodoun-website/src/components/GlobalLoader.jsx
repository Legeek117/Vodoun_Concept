import { useEffect } from 'react';
import gsap from 'gsap';

export default function GlobalLoader() {
    useEffect(() => {
        const tl = gsap.timeline({ repeat: -1, yoyo: true });
        tl.to('.loader-text', { opacity: 0.3, duration: 1.5, ease: 'power2.inOut' })
            .to('.loader-text', { opacity: 1, duration: 1.5, ease: 'power2.inOut' });

        return () => tl.kill();
    }, []);

    return (
        <div className="fixed inset-0 z-[9999] bg-noir flex items-center justify-center pointer-events-none">
            <div className="flex flex-col items-center">
                <h1 className="loader-text font-playfair text-3xl md:text-5xl font-black text-or tracking-[0.2em] mb-4">
                    VODUN
                </h1>
                <div className="w-16 h-px bg-ivoire/20 relative overflow-hidden">
                    <div className="absolute top-0 left-0 h-full w-full bg-or origin-left animate-pulse" />
                </div>
            </div>
        </div>
    );
}
