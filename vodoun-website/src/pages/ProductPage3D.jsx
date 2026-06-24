import { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Environment, ContactShadows, OrbitControls } from '@react-three/drei';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import Lenis from '@studio-freight/lenis';
import * as THREE from 'three';
import { ALL_PRODUCTS, useCart } from '../store';

// 3D Product Model Component (Placeholder: TorusKnot + Sphere for Vodoun aesthetic)
function Product3DModel({ activeColor, scrollProgress }) {
  const meshRef = useRef(null);
  
  // Colors matching Vodoun Concept brand
  const COLORS = [
    '#8E2420',   // Legba Red
    '#1C4A66',   // Dan Blue
    '#B8860B',   // Gold
    '#20603C'    // Sakpata Green
  ];

  useFrame(() => {
    if (meshRef.current) {
      // Rotate 360° based on scroll progress
      meshRef.current.rotation.y = scrollProgress * Math.PI * 2;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.1} floatIntensity={0.05}>
      <group ref={meshRef}>
        {/* Main Knot - Vévé Symbol */}
        <mesh castShadow receiveShadow position={[0, 0, 0]}>
          <torusKnotGeometry args={[1.2, 0.3, 256, 32]} />
          <meshStandardMaterial 
            color={COLORS[activeColor]} 
            metalness={0.7} 
            roughness={0.2}
            emissive={COLORS[activeColor]}
            emissiveIntensity={0.3}
          />
        </mesh>
        
        {/* Decorative Orb */}
        <mesh castShadow receiveShadow position={[0, 1.8, 0]}>
          <sphereGeometry args={[0.5, 64, 64]} />
          <meshStandardMaterial 
            color={COLORS[(activeColor + 1) % COLORS.length]} 
            metalness={0.8} 
            roughness={0.1}
            emissive={COLORS[(activeColor + 1) % COLORS.length]}
            emissiveIntensity={0.2}
          />
        </mesh>
        
        {/* Bottom Base */}
        <mesh castShadow receiveShadow position={[0, -1.8, 0]}>
          <cylinderGeometry args={[0.8, 1, 0.6, 32]} />
          <meshStandardMaterial 
            color="#1A1410" 
            metalness={0.3} 
            roughness={0.8}
          />
        </mesh>
      </group>
    </Float>
  );
}

export default function ProductPage3D() {
  const { productId } = useParams();
  const { addToCart } = useCart();
  const product = ALL_PRODUCTS.find((p) => p.id === productId);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeColorIndex, setActiveColorIndex] = useState(0);
  
  // Vodoun colors + backgrounds
  const COLORS = ['#8E2420', '#1C4A66', '#B8860B', '#20603C'];
  const BG_IMAGES = [
    '/La Voute Celeste.png',
    '/Le Veilleur.png', 
    '/Les Perles de l Ocean.png',
    '/Le Rideau Patrimoine.png'
  ];

  const containerRef = useRef(null);
  const scrollContentRef = useRef(null);
  const bgRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize Lenis
    const lenis = new Lenis({
      duration: 1.5,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // ScrollTrigger for progress
    const st = ScrollTrigger.create({
      trigger: scrollContentRef.current,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0,
      onUpdate: (self) => {
        setScrollProgress(self.progress);
        
        // Update active color index based on scroll breakpoints
        let newIndex = 0;
        if (self.progress > 0.66) newIndex = 3;
        else if (self.progress > 0.33) newIndex = 2;
        else if (self.progress > 0) newIndex = 1;
        else newIndex = 0;
        setActiveColorIndex(newIndex);
      }
    });

    // Parallax background
    gsap.to(bgRef.current, {
      yPercent: 30,
      ease: 'none',
      scrollTrigger: {
        trigger: scrollContentRef.current,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.5,
      }
    });

    return () => {
      lenis.destroy();
      st.kill();
    };
  }, []);

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity, { variant: product.variants?.[activeColorIndex] || 'Default' });
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    }
  };

  const handleColorClick = (index) => {
    setActiveColorIndex(index);
    // Smooth scroll to approximate the position
    gsap.to(window, {
      scrollTo: index * 0.33 * document.body.scrollHeight,
      duration: 1.5,
      ease: 'power3.inOut'
    });
  };

  if (!product) {
    return (
      <div className="min-h-screen bg-ivoire flex items-center justify-center pt-32">
        <div className="text-center">
          <h1 className="editorial-heading mb-8">Produit introuvable</h1>
          <Link to="/boutique" className="btn-premium">Retour à la boutique</Link>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative w-full h-screen bg-noir overflow-hidden">
      {/* Left Panel - Product Info */}
      <div className="absolute top-0 left-0 z-20 w-full md:w-1/2 h-full flex flex-col justify-center px-[8vw] md:px-[10vw]">
        <nav className="flex items-center gap-2 text-xs md:text-sm uppercase tracking-widest opacity-60 mb-8 md:mb-12 text-ivoire">
          <Link to="/" className="hover:text-or transition-colors">Accueil</Link>
          <span>/</span>
          <Link to="/boutique" className="hover:text-or transition-colors">Boutique</Link>
          <span>/</span>
          <span className="text-or opacity-100">{product.name}</span>
        </nav>

        <span className="section-label text-or mb-4 block">VODUN CONCEPT</span>
        <h1 className="font-playfair text-4xl md:text-6xl lg:text-7xl font-black text-ivoire mb-6 leading-tight">
          {product.name}
        </h1>
        
        <p className="text-ivoire/70 text-base md:text-lg lg:text-xl mb-8 leading-relaxed max-w-md">
          {product.story}
        </p>
        
        <div className="flex items-baseline gap-6 mb-12">
          <p className="font-playfair text-3xl md:text-4xl lg:text-5xl font-bold text-or">
            {product.price.toLocaleString('fr-FR')} FCFA
          </p>
        </div>

        {/* Color Selector */}
        <div className="mb-10">
          <h3 className="font-playfair text-lg md:text-xl font-bold text-ivoire/80 mb-4 uppercase tracking-widest text-xs md:text-sm">
            Variante
          </h3>
          <div className="flex gap-3 md:gap-4">
            {COLORS.map((color, index) => (
              <button
                key={index}
                onClick={() => handleColorClick(index)}
                className={`w-10 h-10 md:w-12 md:h-12 rounded-full border-2 transition-all duration-300 hover:scale-110 ${
                  activeColorIndex === index 
                    ? 'border-ivoire scale-110 shadow-[0_0_20px_rgba(255,215,0,0.5)]' 
                    : 'border-transparent'
                }`}
                style={{ backgroundColor: color }}
                aria-label={`Variante ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Quantity & Add to Cart */}
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center mb-12">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-10 h-10 md:w-12 md:h-12 border border-ivoire/30 flex items-center justify-center text-ivoire text-xl font-bold hover:border-or hover:text-or transition-all duration-300"
            >
              -
            </button>
            <span className="w-12 md:w-16 text-center text-ivoire text-xl md:text-2xl font-bold">{quantity}</span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="w-10 h-10 md:w-12 md:h-12 border border-ivoire/30 flex items-center justify-center text-ivoire text-xl font-bold hover:border-or hover:text-or transition-all duration-300"
            >
              +
            </button>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={!product.available}
            className={`flex-1 max-w-xs px-8 py-4 border-2 border-or bg-or text-noir font-playfair font-bold uppercase tracking-widest text-sm hover:bg-ivoire transition-all duration-300 ${!product.available ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {added ? 'Ajouté ✦' : 'Ajouter au panier'}
          </button>
        </div>

        <Link to="/boutique" className="text-or/70 hover:text-or text-xs md:text-sm uppercase tracking-widest transition-colors inline-block">
          ← Retour à la boutique
        </Link>
      </div>

      {/* Right Panel - 3D Model & Background */}
      <div className="absolute top-0 right-0 z-10 w-full md:w-1/2 h-full bg-noir">
        {/* Parallax Background Image (Blurred) */}
        <div 
          ref={bgRef}
          className="absolute inset-0 w-full h-full"
          style={{
            backgroundImage: `url(${BG_IMAGES[activeColorIndex]})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(12px)',
            transform: 'scale(1.1)', // To hide blur edges
            transition: 'background-image 0.8s ease-in-out'
          }}
        />
        
        {/* Dark Overlay on Background */}
        <div className="absolute inset-0 bg-noir/60" />
        
        {/* 3D Canvas */}
        <div className="absolute inset-0">
          <Canvas shadows camera={{ position: [0, 1.5, 6], fov: 45 }}>
            <color attach="background" args={['transparent']} />
            
            {/* Studio Lighting */}
            <ambientLight intensity={0.6} />
            <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} castShadow intensity={2} color="#B8860B" />
            <spotLight position={[-10, 10, -10]} angle={0.15} penumbra={1} castShadow intensity={1} color="#8E2420" />
            <pointLight position={[0, 5, 0]} intensity={0.5} color="#1C4A66" />
            
            {/* Product Model */}
            <Product3DModel activeColor={activeColorIndex} scrollProgress={scrollProgress} />
            
            {/* Environment */}
            <Environment preset="studio" />
            
            {/* Ground Shadows */}
            <ContactShadows position={[0, -2.5, 0]} opacity={0.4} scale={10} blur={2} far={5} />
            
            {/* Orbit Controls (disabled for scroll, enabled for manual interaction on desktop) */}
            <OrbitControls 
              enableZoom={true} 
              enablePan={false} 
              enableRotate={true}
              minPolarAngle={Math.PI / 4}
              maxPolarAngle={Math.PI / 1.5}
              makeDefault
            />
          </Canvas>
        </div>
      </div>

      {/* Invisible Scroll Content to drive ScrollTrigger */}
      <div 
        ref={scrollContentRef} 
        className="relative z-0 w-full pointer-events-none"
        style={{ height: '400vh' }} // 4x viewport height for full rotation and color transitions
      >
        {/* Breakpoints for scroll sections */}
        <div className="h-screen flex items-center justify-center opacity-0"></div>
        <div className="h-screen flex items-center justify-center opacity-0"></div>
        <div className="h-screen flex items-center justify-center opacity-0"></div>
        <div className="h-screen flex items-center justify-center opacity-0"></div>
      </div>
    </div>
  );
}
