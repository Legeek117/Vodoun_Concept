import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function Section({ id, align = 'left', children, ...props }) {
  const sectionRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    const elements = contentRef.current.children;

    gsap.fromTo(
      elements,
      { y: 50, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 1.2,
        stagger: 0.15,
        ease: 'expo.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 70%',
          toggleActions: 'play none none reverse',
        },
      }
    );
  }, []);

  const alignmentClass = {
    left: 'align-left text-left',
    right: 'align-right text-left',
    center: 'px-[5vw] text-center',
  };

  return (
    <section
      ref={sectionRef}
      id={id}
      className={`py-32 md:py-48 relative overflow-hidden transition-colors duration-1000 ${alignmentClass[align]}`}
      {...props}
    >
      <div ref={contentRef} className="relative z-10">
        {children}
      </div>
    </section>
  );
}
