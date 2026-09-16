import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Configuration légère et élégante pour CinematicEntrance
const GALAXY_CONFIG = {
    count: 8000,          // Beaucoup moins de particules (vs 30000)
    size: 0.04,           // Particules plus petites
    radius: 10,           // Rayon de la galaxie
    branches: 3,          // 3 branches pour fluidité
    spin: 0.8,            // Rotation modérée
    randomness: 0.3,      // Moins de chaos
    randomnessPower: 2,   // Distribution plus douce
    insideColor: '#D2B98E',  // Or Vodun
    outsideColor: '#2A1F1A', // Marron foncé
};

export default function EntranceGalaxy() {
    const pointsRef = useRef(null);

    const { positions, colors } = useMemo(() => {
        const cfg = GALAXY_CONFIG;
        const positions = new Float32Array(cfg.count * 3);
        const colors = new Float32Array(cfg.count * 3);

        const colorInside = new THREE.Color(cfg.insideColor);
        const colorOutside = new THREE.Color(cfg.outsideColor);

        for (let i = 0; i < cfg.count; i++) {
            const i3 = i * 3;

            // Position
            const radius = Math.random() * cfg.radius;
            const spinAngle = radius * cfg.spin;
            const branchAngle = ((i % cfg.branches) / cfg.branches) * Math.PI * 2;

            // Randomness douce
            const randomX = Math.pow(Math.random(), cfg.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * cfg.randomness * radius;
            const randomY = Math.pow(Math.random(), cfg.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * cfg.randomness * radius * 0.3; // Galaxie aplatie
            const randomZ = Math.pow(Math.random(), cfg.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * cfg.randomness * radius;

            positions[i3] = Math.cos(branchAngle + spinAngle) * radius + randomX;
            positions[i3 + 1] = randomY;
            positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ;

            // Couleur : transition or → marron foncé
            const mixedColor = colorInside.clone().lerp(colorOutside, radius / cfg.radius);

            colors[i3] = mixedColor.r;
            colors[i3 + 1] = mixedColor.g;
            colors[i3 + 2] = mixedColor.b;
        }

        return { positions, colors };
    }, []);

    useFrame((state, delta) => {
        if (pointsRef.current) {
            // Rotation très lente et fluide
            pointsRef.current.rotation.y += delta * 0.03;
            
            // Oscillation subtile pour effet vivant
            pointsRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.08;
            pointsRef.current.rotation.z = Math.cos(state.clock.elapsedTime * 0.2) * 0.04;
        }
    });

    return (
        <points ref={pointsRef} position={[0, 0, -8]} rotation={[0.3, 0, 0]}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={positions.length / 3}
                    array={positions}
                    itemSize={3}
                />
                <bufferAttribute
                    attach="attributes-color"
                    count={colors.length / 3}
                    array={colors}
                    itemSize={3}
                />
            </bufferGeometry>
            <pointsMaterial
                size={GALAXY_CONFIG.size}
                sizeAttenuation={true}
                depthWrite={false}
                blending={THREE.AdditiveBlending}
                vertexColors={true}
                transparent={true}
                opacity={0.5}  // Plus transparent pour rester subtil
            />
        </points>
    );
}
