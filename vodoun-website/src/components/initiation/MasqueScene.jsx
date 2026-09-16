import { useRef, useEffect, Component } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { TextureLoader } from 'three';
import * as THREE from 'three';

/* ─── ErrorBoundary pour isoler le crash texture ─── */
export class MasqueErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { crashed: false }; }
  static getDerivedStateFromError() { return { crashed: true }; }
  render() {
    if (this.state.crashed) return null; // Phase masque silencieusement skippée
    return this.props.children;
  }
}

/**
 * MasqueSceneInner — chargement texture dans un sous-composant
 * monté UNIQUEMENT quand visible=true (via condition dans MasqueScene)
 * → useLoader ne s'exécute jamais si le masque n'est pas encore en scène
 */
function MasqueSceneInner() {
  const meshRef  = useRef(null);
  const glowRef  = useRef(null);
  const lightRef = useRef(null);

  // useLoader lance une Suspense exception si la texture n'est pas prête
  // → le Suspense parent affiche null le temps du chargement
  const texture = useLoader(TextureLoader, '/masque.png');

  useEffect(() => {
    if (texture) {
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
    }
  }, [texture]);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime;
    meshRef.current.rotation.y = Math.sin(t * 0.5) * 0.25;
    meshRef.current.rotation.x = Math.sin(t * 0.3) * 0.05;
    meshRef.current.position.y = Math.sin(t * 0.7) * 0.08;

    if (glowRef.current) {
      const pulse = 0.85 + Math.sin(t * 1.8) * 0.15;
      glowRef.current.material.opacity = 0.18 * pulse;
    }
    if (lightRef.current) {
      lightRef.current.intensity = 1.2 + Math.sin(t * 2) * 0.4;
    }
  });

  return (
    <group>
      <ambientLight intensity={0.3} color="#3A2000" />

      <pointLight
        ref={lightRef}
        position={[0, 0, 3]}
        color="#D2A84E"
        intensity={1.5}
        distance={12}
      />
      <pointLight position={[-3, 1, -2]} color="#FF6A00" intensity={0.6} distance={8} />
      <pointLight position={[3, -1, -2]} color="#C8860A" intensity={0.4} distance={8} />

      {/* Halo doré derrière le masque */}
      <mesh ref={glowRef} position={[0, 0, -0.5]}>
        <circleGeometry args={[2.2, 64]} />
        <meshBasicMaterial
          color="#D2A84E" transparent opacity={0}
          depthWrite={false} blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Masque avec suppression fond blanc via shader */}
      <mesh ref={meshRef} position={[0, 0, 0]}>
        <planeGeometry args={[3.2, 4.0, 32, 32]} />
        <meshStandardMaterial
          map={texture}
          transparent
          alphaTest={0.05}
          roughness={0.7}
          metalness={0.2}
          onBeforeCompile={(shader) => {
            shader.fragmentShader = shader.fragmentShader.replace(
              '#include <alphatest_fragment>',
              `
              float luminance = dot(diffuseColor.rgb, vec3(0.299, 0.587, 0.114));
              if (luminance > 0.88) {
                diffuseColor.a = 1.0 - smoothstep(0.85, 0.98, luminance);
              }
              #include <alphatest_fragment>
              `
            );
          }}
        />
      </mesh>

      <OrbitalParticles />
    </group>
  );
}

/* ─── Composant principal — ne monte l'inner QUE si visible ─── */
export default function MasqueScene({ visible = false }) {
  // Ne rien rendre si pas visible → useLoader jamais appelé au chargement initial
  if (!visible) return null;

  return (
    // Suspense : pendant le chargement texture → null affiché
    // ErrorBoundary : si masque.png absent → crash silencieux, pas de whitepage
    <MasqueErrorBoundary>
      <MasqueSceneInner />
    </MasqueErrorBoundary>
  );
}

/* ─── Particules orbitales ─── */
function OrbitalParticles() {
  const ref   = useRef(null);
  const count = 80;

  const { positions, colors } = (() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const r = 2 + Math.random() * 1.5;
      pos[i * 3]     = Math.cos(angle) * r;
      pos[i * 3 + 1] = Math.sin(angle) * r;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 0.5;
      col[i * 3]     = 0.82 + Math.random() * 0.18;
      col[i * 3 + 1] = 0.72 + Math.random() * 0.15;
      col[i * 3 + 2] = 0.25 + Math.random() * 0.2;
    }
    return { positions: pos, colors: col };
  })();

  useFrame((state) => {
    if (ref.current) ref.current.rotation.z = state.clock.elapsedTime * 0.15;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-color"    count={count} array={colors}    itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        size={0.04} sizeAttenuation vertexColors
        transparent opacity={0.7}
        depthWrite={false} blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
