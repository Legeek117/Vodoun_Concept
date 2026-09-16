import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Configuration visuellement percutante sur fond noir #0A0705
const GALAXY_CONFIG = {
    count: 10000,
    size: 0.05,
    radius: 9,
    branches: 3,
    spin: 0.9,
    randomness: 0.35,
    randomnessPower: 2,
    insideColor: '#D2B98E',   // Or Vodun — centre lumineux
    midColor: '#C8973A',      // Ambre doré — milieu
    outsideColor: '#3D2B0A',  // Brun très sombre — bords
};

export default function EntranceGalaxy() {
    const pointsRef = useRef(null);

    const { positions, colors } = useMemo(() => {
        const cfg = GALAXY_CONFIG;
        const positions = new Float32Array(cfg.count * 3);
        const colors = new Float32Array(cfg.count * 3);

        const colorInside = new THREE.Color(cfg.insideColor);
        const colorMid = new THREE.Color(cfg.midColor);
        const colorOutside = new THREE.Color(cfg.outsideColor);

        for (let i = 0; i < cfg.count; i++) {
            const i3 = i * 3;

            const radius = Math.random() * cfg.radius;
            const spinAngle = radius * cfg.spin;
            const branchAngle = ((i % cfg.branches) / cfg.branches) * Math.PI * 2;

            const randomX = Math.pow(Math.random(), cfg.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * cfg.randomness * radius;
            const randomY = Math.pow(Math.random(), cfg.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * cfg.randomness * radius * 0.25;
            const randomZ = Math.pow(Math.random(), cfg.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * cfg.randomness * radius;

            positions[i3]     = Math.cos(branchAngle + spinAngle) * radius + randomX;
            positions[i3 + 1] = randomY;
            positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ;

            // Gradient 3 couleurs : or → ambre → brun
            const t = radius / cfg.radius;
            let mixedColor;
            if (t < 0.5) {
                mixedColor = colorInside.clone().lerp(colorMid, t * 2);
            } else {
                mixedColor = colorMid.clone().lerp(colorOutside, (t - 0.5) * 2);
            }

            colors[i3]     = mixedColor.r;
            colors[i3 + 1] = mixedColor.g;
            colors[i3 + 2] = mixedColor.b;
        }

        return { positions, colors };
    }, []);

    useFrame((state, delta) => {
        if (pointsRef.current) {
            pointsRef.current.rotation.y += delta * 0.04;
            pointsRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.25) * 0.1;
            pointsRef.current.rotation.z = Math.cos(state.clock.elapsedTime * 0.18) * 0.05;
        }
    });

    return (
        <points ref={pointsRef} position={[0, -1, -6]} rotation={[0.35, 0, 0]}>
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
                opacity={0.85}
            />
        </points>
    );
}
