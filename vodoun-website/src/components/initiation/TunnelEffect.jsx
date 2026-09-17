import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * TunnelEffect — portail sacré
 *
 * Améliorations vs v1 :
 * - Vitesse réduite (18 → 8 unités/s) pour un effet plus hypnotique
 * - 3 couleurs d'anneaux alternées (or, ambre, blanc-doré) pour moins de fade
 * - Particules de poussière dorée qui flottent dans le tunnel
 * - Lueur centrale pulsante qui grossit à mesure qu'on approche
 * - Légère rotation de caméra simulée via oscillation du groupe
 */

const RING_COUNT    = 48;   // plus d'anneaux pour combler le ralenti
const RING_RADIUS   = 2.4;
const TUNNEL_DEPTH  = 90;
const SEGMENTS      = 96;
const DUST_COUNT    = 120;  // particules de poussière dans le tunnel

const RING_COLORS = ['#D2B98E', '#C8973A', '#FFF5CC', '#E8C870'];

export default function TunnelEffect({ active = true, speed = 1.0 }) {
  const groupRef     = useRef(null);
  const dustRef      = useRef(null);
  const glowRef      = useRef(null);
  const elapsedRef   = useRef(0);

  // Données des anneaux
  const rings = useMemo(() => Array.from({ length: RING_COUNT }, (_, i) => ({
    z:               -TUNNEL_DEPTH + (i / RING_COUNT) * TUNNEL_DEPTH,
    radiusVar:       0.82 + Math.random() * 0.36,
    rotOffset:       Math.random() * Math.PI * 2,
    rotDir:          i % 2 === 0 ? 1 : -1,
    colorIdx:        i % RING_COLORS.length,
    thicknessVar:    0.93 + Math.random() * 0.07,
  })), []);

  // Géométries par épaisseur (fin / normal / épais)
  const geoThin   = useMemo(() => new THREE.RingGeometry(RING_RADIUS * 0.975, RING_RADIUS * 1.0,   SEGMENTS), []);
  const geoNormal = useMemo(() => new THREE.RingGeometry(RING_RADIUS * 0.955, RING_RADIUS * 1.0,   SEGMENTS), []);
  const geoThick  = useMemo(() => new THREE.RingGeometry(RING_RADIUS * 0.930, RING_RADIUS * 1.0,   SEGMENTS), []);

  // Matériaux clonés par couleur
  const materials = useMemo(() => RING_COLORS.map(c => new THREE.MeshBasicMaterial({
    color: new THREE.Color(c),
    transparent: true, opacity: 0,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  })), []);

  const ringZRef  = useRef(rings.map(r => r.z));
  const meshRefs  = useRef([]);

  // Données poussière
  const dustData = useMemo(() => {
    const pos = new Float32Array(DUST_COUNT * 3);
    const col = new Float32Array(DUST_COUNT * 3);
    for (let i = 0; i < DUST_COUNT; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r     = (0.3 + Math.random() * 0.7) * RING_RADIUS;
      pos[i * 3]     = Math.cos(angle) * r;
      pos[i * 3 + 1] = Math.sin(angle) * r;
      pos[i * 3 + 2] = -TUNNEL_DEPTH * Math.random();
      const t = Math.random();
      const c = new THREE.Color(RING_COLORS[Math.floor(t * RING_COLORS.length)]);
      col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
    }
    return { positions: pos, colors: col };
  }, []);
  const dustZRef = useRef(Array.from({ length: DUST_COUNT }, (_, i) => dustData.positions[i * 3 + 2]));

  useFrame((state, delta) => {
    if (!active) return;
    elapsedRef.current += delta;
    const t = elapsedRef.current;

    // Légère oscillation du groupe (sensation de flottement dans le tunnel)
    if (groupRef.current) {
      groupRef.current.rotation.z = Math.sin(t * 0.4) * 0.04;
      groupRef.current.position.x = Math.sin(t * 0.6) * 0.06;
      groupRef.current.position.y = Math.cos(t * 0.45) * 0.04;
    }

    // Pulsation de la lueur centrale
    if (glowRef.current) {
      const pulse = 0.8 + Math.sin(t * 2.5) * 0.2;
      glowRef.current.intensity = 3.5 * pulse;
      glowRef.current.distance  = TUNNEL_DEPTH * (0.9 + Math.sin(t * 1.8) * 0.1);
    }

    // Anneaux
    meshRefs.current.forEach((mesh, i) => {
      if (!mesh) return;

      // Vitesse lente : 8 unités/s (vs 18 avant) × speed prop
      ringZRef.current[i] += delta * 8 * speed;

      if (ringZRef.current[i] > 5) {
        ringZRef.current[i] = -TUNNEL_DEPTH + Math.random() * 8;
      }

      mesh.position.z = ringZRef.current[i];

      // Perspective : scale quadratique
      const p     = (ringZRef.current[i] + TUNNEL_DEPTH) / TUNNEL_DEPTH;
      const scale = (0.12 + p * p * 1.5) * rings[i].radiusVar;
      mesh.scale.setScalar(scale);

      // Opacité : courbe plus douce, maximum plus élevé (0.9)
      let opacity;
      if (p < 0.12)      opacity = (p / 0.12) * 0.6;
      else if (p > 0.72) opacity = ((1 - p) / 0.28) * 0.9;
      else               opacity = 0.55 + p * 0.35;
      mesh.material.opacity = Math.max(0, Math.min(0.9, opacity));

      // Rotation douce
      mesh.rotation.z = rings[i].rotOffset + t * 0.06 * rings[i].rotDir;
    });

    // Poussière dorée
    if (dustRef.current) {
      const pos = dustRef.current.geometry.attributes.position.array;
      for (let i = 0; i < DUST_COUNT; i++) {
        dustZRef.current[i] += delta * 6 * speed;
        if (dustZRef.current[i] > 4) {
          dustZRef.current[i] = -TUNNEL_DEPTH;
          const angle = Math.random() * Math.PI * 2;
          const r     = (0.3 + Math.random() * 0.7) * RING_RADIUS;
          pos[i * 3]     = Math.cos(angle) * r;
          pos[i * 3 + 1] = Math.sin(angle) * r;
        }
        pos[i * 3 + 2] = dustZRef.current[i];
      }
      dustRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Lueur centrale pulsante */}
      <pointLight
        ref={glowRef}
        position={[0, 0, -TUNNEL_DEPTH * 0.85]}
        color="#D2B98E"
        intensity={3.5}
        distance={TUNNEL_DEPTH}
      />
      {/* Lueur secondaire plus proche */}
      <pointLight
        position={[0, 0, -TUNNEL_DEPTH * 0.3]}
        color="#C8973A"
        intensity={1.2}
        distance={30}
      />

      {/* Anneaux */}
      {rings.map((ring, i) => {
        const geo = ring.thicknessVar < 0.95 ? geoThin : ring.thicknessVar < 0.98 ? geoNormal : geoThick;
        return (
          <mesh
            key={i}
            ref={el => meshRefs.current[i] = el}
            position={[0, 0, ring.z]}
            geometry={geo}
            material={materials[ring.colorIdx].clone()}
          />
        );
      })}

      {/* Particules de poussière */}
      <points ref={dustRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={DUST_COUNT} array={dustData.positions} itemSize={3} />
          <bufferAttribute attach="attributes-color"    count={DUST_COUNT} array={dustData.colors}    itemSize={3} />
        </bufferGeometry>
        <pointsMaterial
          size={0.025} sizeAttenuation vertexColors
          transparent opacity={0.55}
          depthWrite={false} blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}
