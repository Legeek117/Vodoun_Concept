import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const PARTICLE_COUNT = 600;

export default function BraiseParticles({ active = true, intensity = 1.0 }) {
  const pointsRef = useRef(null);

  // Données de particules : position, vitesse, vie
  const particleData = useMemo(() => {
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const colors    = new Float32Array(PARTICLE_COUNT * 3);
    const sizes     = new Float32Array(PARTICLE_COUNT);
    const velocities = [];
    const lives      = [];
    const maxLives   = [];

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      // Naissance aléatoire en bas de l'écran
      positions[i3]     = (Math.random() - 0.5) * 8;
      positions[i3 + 1] = -6 - Math.random() * 4;
      positions[i3 + 2] = (Math.random() - 0.5) * 2;

      // Couleur braise : orange → doré → blanc chaud
      const t = Math.random();
      colors[i3]     = 0.9 + t * 0.1;           // R
      colors[i3 + 1] = 0.3 + t * 0.5;           // G
      colors[i3 + 2] = t * 0.15;                // B

      sizes[i] = 0.02 + Math.random() * 0.06;

      velocities.push({
        x: (Math.random() - 0.5) * 0.012,
        y: 0.02 + Math.random() * 0.035,
        z: (Math.random() - 0.5) * 0.005,
      });

      const life = Math.random();
      lives.push(life);
      maxLives.push(0.6 + Math.random() * 0.8);
    }

    return { positions, colors, sizes, velocities, lives, maxLives };
  }, []);

  useFrame((_, delta) => {
    if (!pointsRef.current || !active) return;

    const geo = pointsRef.current.geometry;
    const pos = geo.attributes.position.array;
    const col = geo.attributes.color.array;
    const sz  = geo.attributes.size.array;
    const { velocities, lives, maxLives } = particleData;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      lives[i] += delta * 0.4;

      if (lives[i] > maxLives[i]) {
        // Reborn en bas
        pos[i3]     = (Math.random() - 0.5) * 8;
        pos[i3 + 1] = -6;
        pos[i3 + 2] = (Math.random() - 0.5) * 2;
        lives[i] = 0;
        velocities[i].x = (Math.random() - 0.5) * 0.012;
        velocities[i].y = 0.02 + Math.random() * 0.035;
      }

      // Mouvement avec légère dérive
      pos[i3]     += velocities[i].x * intensity;
      pos[i3 + 1] += velocities[i].y * intensity;
      pos[i3 + 2] += velocities[i].z;

      // Oscillation horizontale organique
      pos[i3] += Math.sin(lives[i] * 3.5 + i) * 0.003;

      // Taille et opacité selon la vie
      const t = lives[i] / maxLives[i];
      const fade = t < 0.2 ? t / 0.2 : t > 0.7 ? 1 - (t - 0.7) / 0.3 : 1;
      sz[i] = (0.02 + Math.random() * 0.02) * fade * intensity;

      // Couleur : plus blanche au sommet (plus chaude)
      const heat = Math.min(pos[i3 + 1] / 4 + 0.5, 1);
      col[i3]     = 0.9 + heat * 0.1;
      col[i3 + 1] = 0.25 + heat * 0.6;
      col[i3 + 2] = heat * 0.2;
    }

    geo.attributes.position.needsUpdate = true;
    geo.attributes.color.needsUpdate    = true;
    geo.attributes.size.needsUpdate     = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={PARTICLE_COUNT}
          array={particleData.positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={PARTICLE_COUNT}
          array={particleData.colors}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          count={PARTICLE_COUNT}
          array={particleData.sizes}
          itemSize={1}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        sizeAttenuation
        vertexColors
        transparent
        opacity={0.9}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
