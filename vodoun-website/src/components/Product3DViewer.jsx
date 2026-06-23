import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Float, Stars } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, Noise, DepthOfField } from '@react-three/postprocessing';
import { useRef, useState } from 'react';
import * as THREE from 'three';

function Particles({ count = 200 }) {
  const meshRef = useRef();
  const positions = useRef(new Float32Array(count * 3));
  
  for (let i = 0; i < count; i++) {
    positions.current[i * 3] = (Math.random() - 0.5) * 10;
    positions.current[i * 3 + 1] = (Math.random() - 0.5) * 10;
    positions.current[i * 3 + 2] = (Math.random() - 0.5) * 10;
  }

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.05;
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.03;
    }
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions.current}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#B8860B"
        size={0.05}
        transparent
        opacity={0.6}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function VeveSymbol({ color = '#B8860B' }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <Particles />
      <group ref={meshRef}>
        {/* Vévé symbolique simplifié */}
        <mesh position={[0, 0, 0]}>
          <torusKnotGeometry args={[0.8, 0.2, 128, 32]} />
          <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} emissive={color} emissiveIntensity={0.2} />
        </mesh>
        <mesh position={[0, 1.2, 0]}>
          <sphereGeometry args={[0.4, 32, 32]} />
          <meshStandardMaterial color={color} metalness={0.9} roughness={0.1} emissive={color} emissiveIntensity={0.3} />
        </mesh>
        <mesh position={[0, -1.2, 0]}>
          <sphereGeometry args={[0.3, 32, 32]} />
          <meshStandardMaterial color={color} metalness={0.9} roughness={0.1} emissive={color} emissiveIntensity={0.3} />
        </mesh>
      </group>
    </Float>
  );
}

function TotemVeilleur({ motif = 'legba' }) {
  const meshRef = useRef();
  const colors = {
    legba: ['#8E2420', '#1A1410'],
    dan: ['#1C4A66', '#40E0D0'],
  };
  const [color1, color2] = colors[motif] || colors.legba;

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.2;
    }
  });

  return (
    <group ref={meshRef}>
      <Particles count={150} />
      {/* Base du totem */}
      <mesh position={[0, -1.5, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.6, 0.8, 0.5, 32]} />
        <meshStandardMaterial color={color2} metalness={0.6} roughness={0.4} />
      </mesh>
      
      {/* Corps principal */}
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.3, 0.4, 2.5, 32]} />
        <meshStandardMaterial color={color2} metalness={0.7} roughness={0.3} />
      </mesh>
      
      {/* Partie perforée (symbolique) */}
      <mesh position={[0, 0.8, 0]}>
        <cylinderGeometry args={[0.35, 0.35, 0.8, 32]} />
        <meshStandardMaterial color={color1} metalness={0.5} roughness={0.5} wireframe />
      </mesh>
      
      {/* Sommet */}
      <mesh position={[0, 1.8, 0]}>
        <coneGeometry args={[0.5, 0.6, 32]} />
        <meshStandardMaterial color={color1} metalness={0.8} roughness={0.2} emissive={color1} emissiveIntensity={0.3} />
      </mesh>
      
      {/* Petits éléments décoratifs */}
      {[0, 1, 2, 3, 4].map((i) => (
        <mesh key={i} position={[0, -1 + i * 0.5, 0.5]}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshStandardMaterial color={color1} emissive={color1} emissiveIntensity={0.8} />
        </mesh>
      ))}
    </group>
  );
}

export default function Product3DViewer({ product = 'veve', motif = 'legba' }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div 
      className={`w-full h-full min-h-[400px] rounded-2xl overflow-hidden transition-all duration-500 ${
        hovered ? 'scale-[1.02]' : 'scale-100'
      }`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <color attach="background" args={['#1A1410']} />
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        <Environment preset="city" />
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} castShadow />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#B8860B" />
        
        {product === 'totem' ? (
          <TotemVeilleur motif={motif} />
        ) : (
          <VeveSymbol />
        )}
        
        <ContactShadows position={[0, -2.5, 0]} opacity={0.5} scale={10} blur={2} far={4.5} />
        
        <EffectComposer>
          <Bloom luminanceThreshold={0.2} luminanceSmoothing={0.9} height={300} intensity={2} />
          <Vignette eskil={false} offset={0.1} darkness={1.2} />
          <Noise opacity={0.02} />
        </EffectComposer>
        
        <OrbitControls 
          enablePan={false} 
          minPolarAngle={Math.PI / 4} 
          maxPolarAngle={Math.PI / 2} 
          enableZoom={true}
        />
      </Canvas>
    </div>
  );
}
