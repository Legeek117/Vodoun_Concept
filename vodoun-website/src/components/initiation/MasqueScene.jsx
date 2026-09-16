import { useRef, useEffect } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { TextureLoader } from 'three';
import * as THREE from 'three';

export default function MasqueScene({ visible = false, phase = 0 }) {
  const meshRef     = useRef(null);
  const glowRef     = useRef(null);
  const lightRef    = useRef(null);
  const texture     = useLoader(TextureLoader, '/masque.png');

  useEffect(() => {
    if (texture) {
      // Enlever l'aliasing
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
    }
  }, [texture]);

  useFrame((state) => {
    if (!meshRef.current || !visible) return;
    const t = state.clock.elapsedTime;

    // Rotation douce — léger rocking gauche/droite
    meshRef.current.rotation.y = Math.sin(t * 0.5) * 0.25;
    meshRef.current.rotation.x = Math.sin(t * 0.3) * 0.05;

    // Légère flottaison verticale
    meshRef.current.position.y = Math.sin(t * 0.7) * 0.08;

    // Halo pulsant
    if (glowRef.current) {
      const pulse = 0.85 + Math.sin(t * 1.8) * 0.15;
      glowRef.current.material.opacity = 0.18 * pulse * (phase > 0 ? 1 : 0);
    }

    // Lumière dorée pulsante
    if (lightRef.current) {
      lightRef.current.intensity = 1.2 + Math.sin(t * 2) * 0.4;
    }
  });

  if (!visible) return null;

  return (
    <group>
      {/* Lumière ambiante chaude */}
      <ambientLight intensity={0.3} color="#3A2000" />

      {/* Lumière dorée principale face au masque */}
      <pointLight
        ref={lightRef}
        position={[0, 0, 3]}
        color="#D2A84E"
        intensity={1.5}
        distance={12}
      />

      {/* Lumière de contour — arrière gauche */}
      <pointLight
        position={[-3, 1, -2]}
        color="#FF6A00"
        intensity={0.6}
        distance={8}
      />

      {/* Lumière de contour — arrière droit */}
      <pointLight
        position={[3, -1, -2]}
        color="#C8860A"
        intensity={0.4}
        distance={8}
      />

      {/* Halo doré derrière le masque */}
      <mesh ref={glowRef} position={[0, 0, -0.5]}>
        <circleGeometry args={[2.2, 64]} />
        <meshBasicMaterial
          color="#D2A84E"
          transparent
          opacity={0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Masque — PlaneGeometry avec texture photo */}
      <mesh ref={meshRef} position={[0, 0, 0]}>
        <planeGeometry args={[3.2, 4.0, 32, 32]} />
        <meshStandardMaterial
          map={texture}
          transparent
          alphaTest={0.05}
          roughness={0.7}
          metalness={0.2}
          // mix-blend-mode equivalent : supprimer le blanc via alphaMap
          // Le fond blanc sera masqué en comparant la luminosité
          onBeforeCompile={(shader) => {
            shader.fragmentShader = shader.fragmentShader.replace(
              '#include <alphatest_fragment>',
              `
              // Supprimer le fond blanc : pixels très clairs → transparents
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

      {/* Particules dorées qui orbitent autour du masque */}
      <OrbitalParticles visible={visible} />
    </group>
  );
}

function OrbitalParticles({ visible }) {
  const ref = useRef(null);
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
    if (!ref.current || !visible) return;
    ref.current.rotation.z = state.clock.elapsedTime * 0.15;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-color"    count={count} array={colors}    itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        size={0.04}
        sizeAttenuation
        vertexColors
        transparent
        opacity={0.7}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
