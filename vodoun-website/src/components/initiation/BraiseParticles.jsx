import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const PARTICLE_COUNT = 1200;
const TRAIL_LENGTH   = 6;

export default function BraiseParticles({ active = true, intensity = 1.0, vortex = 0 }) {
  const pointsRef      = useRef(null);
  const trailPointsRef = useRef(null);
  const angleRef       = useRef([]);

  const particleData = useMemo(() => {
    const positions  = new Float32Array(PARTICLE_COUNT * 3);
    const colors     = new Float32Array(PARTICLE_COUNT * 3);
    const sizes      = new Float32Array(PARTICLE_COUNT);
    const velocities = [];
    const lives      = [];
    const maxLives   = [];
    const history    = [];
    const angles     = [];

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      positions[i3]     = (Math.random() - 0.5) * 10;
      positions[i3 + 1] = -8 - Math.random() * 8;
      positions[i3 + 2] = (Math.random() - 0.5) * 2;

      const t = Math.random();
      colors[i3]     = 0.85 + t * 0.15;
      colors[i3 + 1] = 0.2  + t * 0.55;
      colors[i3 + 2] = t * 0.1;

      sizes[i] = 0.03 + Math.random() * 0.07;

      velocities.push({
        x: (Math.random() - 0.5) * 0.015,
        y: 0.028 + Math.random() * 0.06,
        z: (Math.random() - 0.5) * 0.006,
      });

      lives.push(Math.random() * 2.0);
      maxLives.push(1.2 + Math.random() * 1.2);

      angles.push(Math.random() * Math.PI * 2);

      const h = [];
      for (let t2 = 0; t2 < TRAIL_LENGTH; t2++) {
        h.push([positions[i3], positions[i3 + 1], positions[i3 + 2]]);
      }
      history.push(h);
    }

    angleRef.current = angles;
    return { positions, colors, sizes, velocities, lives, maxLives, history };
  }, []);

  const trailData = useMemo(() => {
    const total = PARTICLE_COUNT * TRAIL_LENGTH;
    return {
      positions: new Float32Array(total * 3),
      colors:    new Float32Array(total * 3),
      sizes:     new Float32Array(total),
    };
  }, []);

  useFrame((state, delta) => {
    if (!pointsRef.current || !active) return;

    const geo = pointsRef.current.geometry;
    const pos = geo.attributes.position.array;
    const col = geo.attributes.color.array;
    const sz  = geo.attributes.size.array;
    const { velocities, lives, maxLives, history } = particleData;
    const angles = angleRef.current;

    const tgeo = trailPointsRef.current?.geometry;
    const tpos = tgeo?.attributes.position.array;
    const tcol = tgeo?.attributes.color.array;
    const tsz  = tgeo?.attributes.size.array;

    const t = state.clock.elapsedTime;
    const dt = Math.min(delta, 1 / 30);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      lives[i] += dt * 0.5;

      const doRespawn = (fromVortex) => {
        if (fromVortex || vortex > 0.5) {
          const a = Math.random() * Math.PI * 2;
          const r = 3 + Math.random() * 5;
          pos[i3]     = Math.cos(a) * r;
          pos[i3 + 1] = -8 - Math.random() * 3;
          pos[i3 + 2] = Math.sin(a) * r;
          angles[i]   = a;
        } else {
          pos[i3]     = (Math.random() - 0.5) * 14;
          pos[i3 + 1] = -8 - Math.random() * 2;
          pos[i3 + 2] = (Math.random() - 0.5) * 3;
          velocities[i].x = (Math.random() - 0.5) * 0.015;
          velocities[i].y = 0.028 + Math.random() * 0.06;
        }
        lives[i] = 0;
        for (let t2 = 0; t2 < TRAIL_LENGTH; t2++) {
          history[i][t2] = [pos[i3], pos[i3 + 1], pos[i3 + 2]];
        }
      };

      if (lives[i] > maxLives[i]) {
        doRespawn(false);
      }

      history[i].pop();
      history[i].unshift([pos[i3], pos[i3 + 1], pos[i3 + 2]]);

      if (vortex > 0) {
        const cx = pos[i3];
        const cz = pos[i3 + 2];
        const dist = Math.sqrt(cx * cx + cz * cz);

        angles[i] += dt * (1.2 + (1 / Math.max(dist, 0.4)) * 0.3) * vortex;
        const inward = Math.min(dist, dt * 0.55 * vortex);
        const newDist = Math.max(dist - inward, 0.05);

        pos[i3]     = Math.cos(angles[i]) * newDist;
        pos[i3 + 2] = Math.sin(angles[i]) * newDist;
        pos[i3 + 1] += dt * (2.2 + (5 - Math.max(dist, 0.4)) * 0.25) * vortex * intensity;

        if (pos[i3 + 1] > 11 || newDist < 0.06) {
          doRespawn(true);
        }
      }

      {
        const straightBlend = Math.max(1 - vortex, 0.25);
        pos[i3]     += velocities[i].x * intensity * straightBlend * dt * 60;
        pos[i3 + 1] += velocities[i].y * intensity * straightBlend * dt * 60;
        pos[i3 + 2] += velocities[i].z * straightBlend * dt * 60;
        pos[i3]     += Math.sin(lives[i] * 4.0 + i * 0.7) * 0.004 * straightBlend;
      }

      if (pos[i3 + 1] > 10.5) {
        doRespawn(vortex > 0.3);
      }

      const height = Math.min(Math.max((pos[i3 + 1] + 8) / 19, 0), 1);
      const bottomFade = Math.min(height / 0.1, 1);
      const topFade = height > 0.88 ? Math.min(1 - (height - 0.88) / 0.12, 1) : 1;
      const lifeRatio = lives[i] / maxLives[i];
      const lifeFade = lifeRatio < 0.08 ? lifeRatio / 0.08 : lifeRatio > 0.94 ? 1 - (lifeRatio - 0.94) / 0.06 : 1;
      const heightFade = bottomFade * topFade;
      const vortexBlend = Math.max(0.7, vortex);
      const fade = heightFade * (1 - vortexBlend) + vortexBlend * Math.max(heightFade, lifeFade);
      const finalFade = Math.min(Math.max(fade, 0), 1);

      sz[i] = (0.03 + height * 0.035) * finalFade * Math.max(intensity, 0.3);

      const vMix = vortex;
      col[i3]     = (0.85 + height * 0.15) * (1 - vMix) + (0.92 + Math.sin(t + i) * 0.08) * vMix;
      col[i3 + 1] = (0.2  + height * 0.65) * (1 - vMix) + (0.72 + Math.sin(t * 0.7 + i) * 0.1) * vMix;
      col[i3 + 2] = height * 0.25 * (1 - vMix) + 0.15 * vMix;

      if (tpos) {
        for (let t2 = 0; t2 < TRAIL_LENGTH; t2++) {
          const ti3      = (i * TRAIL_LENGTH + t2) * 3;
          const hp       = history[i][t2];
          tpos[ti3]      = hp[0];
          tpos[ti3 + 1]  = hp[1];
          tpos[ti3 + 2]  = hp[2];
          const trailFade = (1 - t2 / TRAIL_LENGTH) * finalFade * 0.6;
          tsz[i * TRAIL_LENGTH + t2] = sz[i] * (1 - t2 / TRAIL_LENGTH) * 0.7;
          const trailHeat = Math.min(Math.max((hp[1] + 8) / 19, 0), 1);
          tcol[ti3]     = (0.85 + trailHeat * 0.15) * trailFade;
          tcol[ti3 + 1] = (0.2  + trailHeat * 0.65) * trailFade;
          tcol[ti3 + 2] = trailHeat * 0.25 * trailFade;
        }
        tgeo.attributes.position.needsUpdate = true;
        tgeo.attributes.color.needsUpdate    = true;
        tgeo.attributes.size.needsUpdate     = true;
      }
    }

    geo.attributes.position.needsUpdate = true;
    geo.attributes.color.needsUpdate    = true;
    geo.attributes.size.needsUpdate     = true;
  });

  return (
    <group>
      <points ref={trailPointsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={PARTICLE_COUNT * TRAIL_LENGTH} array={trailData.positions} itemSize={3} />
          <bufferAttribute attach="attributes-color"    count={PARTICLE_COUNT * TRAIL_LENGTH} array={trailData.colors}    itemSize={3} />
          <bufferAttribute attach="attributes-size"     count={PARTICLE_COUNT * TRAIL_LENGTH} array={trailData.sizes}     itemSize={1} />
        </bufferGeometry>
        <pointsMaterial size={0.04} sizeAttenuation vertexColors transparent opacity={0.7}
          depthWrite={false} blending={THREE.AdditiveBlending} />
      </points>

      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={PARTICLE_COUNT} array={particleData.positions} itemSize={3} />
          <bufferAttribute attach="attributes-color"    count={PARTICLE_COUNT} array={particleData.colors}    itemSize={3} />
          <bufferAttribute attach="attributes-size"     count={PARTICLE_COUNT} array={particleData.sizes}     itemSize={1} />
        </bufferGeometry>
        <pointsMaterial size={0.06} sizeAttenuation vertexColors transparent opacity={0.92}
          depthWrite={false} blending={THREE.AdditiveBlending} />
      </points>
    </group>
  );
}
