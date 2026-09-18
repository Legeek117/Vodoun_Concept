import { useRef, useEffect, Component } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as THREE from 'three';

/* ─── ErrorBoundary silencieux ─── */
export class MasqueErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { crashed: false }; }
  static getDerivedStateFromError() { return { crashed: true }; }
  render() {
    if (this.state.crashed) return null;
    return this.props.children;
  }
}

/*
 * MasqueModel — charge, normalise, centre le GLB sur (0,0,0)
 * La caméra est positionnée statiquement via Canvas camera prop
 * → centrage garanti sans AutoCamera qui dérive
 */
function MasqueModel({ spinRef, targetRef }) {
  const gltf = useLoader(GLTFLoader, '/masque.glb');

  useEffect(() => {
    if (!gltf?.scene || !spinRef.current) return;
    const scene = gltf.scene.clone(true);
    scene.updateMatrixWorld(true);

    // Normaliser à 2.8 unités
    const box0 = new THREE.Box3().setFromObject(scene);
    const s0   = new THREE.Vector3();
    box0.getSize(s0);
    const maxDim = Math.max(s0.x, s0.y, s0.z);
    if (maxDim === 0) return;
    scene.scale.setScalar(2.8 / maxDim);
    scene.updateMatrixWorld(true);

    // Centrer exactement sur (0, 0, 0)
    const box1   = new THREE.Box3().setFromObject(scene);
    const center = new THREE.Vector3();
    box1.getCenter(center);
    scene.position.sub(center);
    scene.quaternion.identity();

    spinRef.current.clear();
    spinRef.current.add(scene);
    spinRef.current.rotation.set(0, Math.PI, 0, 'YXZ');
    if (targetRef) targetRef.current = spinRef.current;
  }, [gltf, spinRef, targetRef]);

  useFrame((state) => {
    if (!spinRef.current) return;
    const t = state.clock.elapsedTime;
    // Rotation fixe — face caméra, aucun balancement
    spinRef.current.rotation.set(0, Math.PI, 0, 'YXZ');
    // Flottaison Y pure uniquement
    spinRef.current.position.set(0, Math.sin(t * 0.5) * 0.12, 0);
  });

  return <group ref={spinRef} />;
}

/* ─── Lumières neutres ─── */
function MasqueLights() {
  const frontRef = useRef(null);
  useFrame((s) => {
    if (frontRef.current)
      frontRef.current.intensity = 1.6 + Math.sin(s.clock.elapsedTime * 1.4) * 0.15;
  });
  return (
    <>
      <ambientLight intensity={1.4} color="#ffffff" />
      <directionalLight ref={frontRef} position={[0, 2, 5]} color="#ffffff" intensity={1.6} castShadow />
      <directionalLight position={[-4, 1, 3]} color="#fff5e8" intensity={0.5} />
      <directionalLight position={[4, -1, 3]} color="#eef2ff" intensity={0.35} />
      <directionalLight position={[0, 0, -5]} color="#ffd8a0" intensity={0.25} />
    </>
  );
}

/* ─── Particules orbitales ─── */
function OrbitalParticles() {
  const ref = useRef(null);
  const count = 100;
  const { positions, colors } = (() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2;
      const r = 1.8 + Math.random() * 1.4;
      const h = (Math.random() - 0.5) * 2.5;
      pos[i*3]=Math.cos(a)*r; pos[i*3+1]=h; pos[i*3+2]=Math.sin(a)*r;
      const t = Math.random();
      col[i*3]=0.82+t*0.18; col[i*3+1]=0.55+t*0.25; col[i*3+2]=0.08+t*0.12;
    }
    return { positions: pos, colors: col };
  })();
  useFrame((s) => { if (ref.current) ref.current.rotation.y = s.clock.elapsedTime * 0.12; });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-color"    count={count} array={colors}    itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.04} sizeAttenuation vertexColors transparent
        opacity={0.6} depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  );
}

export default function MasqueScene({ visible = false }) {
  const spinRef   = useRef(null);
  const targetRef = useRef(null);
  if (!visible) return null;
  return (
    <MasqueErrorBoundary>
      <MasqueLights />
      <OrbitalParticles />
      <MasqueModel spinRef={spinRef} targetRef={targetRef} />
    </MasqueErrorBoundary>
  );
}
