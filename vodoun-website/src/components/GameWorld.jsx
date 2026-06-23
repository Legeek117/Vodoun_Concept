
import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Sky, Stars, Text, Float, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { useNavigate } from 'react-router-dom';
import SoundControl from './SoundControl';

// Function to load FBX models
const useFBX = (url) => {
  const modelRef = useRef(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const loader = new FBXLoader();
    loader.load(
      url,
      (object) => {
        modelRef.current = object;
        setLoaded(true);
        // Traverse the model to set materials
        object.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });
      },
      undefined,
      (error) => console.error('Error loading FBX model:', error)
    );
  }, [url]);

  return { model: modelRef.current, loaded };
};

// Our player avatar component with FBX support
const Player = ({ position, isRunning }) => {
  const { model, loaded } = useFBX('/Running Tired.fbx');
  const groupRef = useRef(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.set(position[0], position[1], position[2]);
      // Simple rotation
      groupRef.current.rotation.y += 0.01;
    }
  });

  // If model not loaded, show placeholder
  if (!loaded) {
    return (
      <group position={position}>
        <mesh position={[0, 0.75, 0]} castShadow receiveShadow>
          <capsuleGeometry args={[0.3, 1.2, 8, 16]} />
          <meshStandardMaterial color="#8E2420" metalness={0.4} roughness={0.6} />
        </mesh>
        <mesh position={[0, 1.75, 0]} castShadow receiveShadow>
          <sphereGeometry args={[0.35, 16, 16]} />
          <meshStandardMaterial color="#e0b38d" metalness={0.1} roughness={0.9} />
        </mesh>
        <mesh position={[0, 1.5, -0.3]}>
          <torusGeometry args={[0.15, 0.02, 8, 32]} />
          <meshStandardMaterial color="#B8860B" metalness={1} roughness={0.2} emissive="#B8860B" emissiveIntensity={0.5} />
        </mesh>
      </group>
    );
  }

  return (
    <group ref={groupRef} position={position}>
      <primitive object={model} scale={0.05} position={[0, 0, 0]} />
    </group>
  );
};

// Floating portal component
const Portal = ({ position, label, onClick, color = "#B8860B" }) => {
  return (
    <group position={position} onClick={onClick} style={{ cursor: 'pointer' }}>
      <Float speed={2} rotationIntensity={0.2} floatIntensity={0.2}>
        <mesh position={[0, 2, 0]}>
          <torusKnotGeometry args={[0.8, 0.1, 128, 32]} />
          <meshStandardMaterial color={color} metalness={0.9} roughness={0.1} emissive={color} emissiveIntensity={1.5} />
        </mesh>
      </Float>
      <Text
        position={[0, 3.5, 0]}
        fontSize={0.4}
        color="#fff"
        anchorX="center"
        anchorY="middle"
        material-toneMapped={false}
      >
        {label}
        <meshBasicMaterial attach="material" color={color} />
      </Text>
    </group>
  );
};

// Ground plane
const Ground = () => {
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#1A1410';
    ctx.fillRect(0, 0, 512, 512);
    ctx.strokeStyle = '#B8860B';
    ctx.lineWidth = 4;
    for (let i = 0; i < 512; i += 64) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, 512);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(512, i);
      ctx.stroke();
    }
    return new THREE.CanvasTexture(canvas);
  }, []);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(20, 20);

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, 0, 0]}>
      <planeGeometry args={[100, 100]} />
      <meshStandardMaterial map={texture} />
    </mesh>
  );
};

// Boutique shelf component
const Shelf = ({ position, products = [] }) => {
  return (
    <group position={position}>
      {/* Shelf base */}
      <mesh position={[0, 0.2, 0]} castShadow receiveShadow>
        <boxGeometry args={[3, 0.4, 1]} />
        <meshStandardMaterial color="#5c4033" metalness={0.2} roughness={0.8} />
      </mesh>
      {/* Shelf top */}
      <mesh position={[0, 1, 0]} castShadow receiveShadow>
        <boxGeometry args={[3, 0.2, 1]} />
        <meshStandardMaterial color="#4a3728" metalness={0.3} roughness={0.7} />
      </mesh>
      {/* Decorative supports */}
      {[-1.3, 1.3].map((x, i) => (
        <mesh key={i} position={[x, 0.6, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.08, 0.08, 0.8, 16]} />
          <meshStandardMaterial color="#B8860B" metalness={0.8} roughness={0.3} />
        </mesh>
      ))}
      {/* Products on shelf */}
      {products.map((product, i) => (
        <group key={i} position={product.pos}>
          <Float speed={1} floatIntensity={0.05}>
            <mesh>
              <boxGeometry args={[0.4, 0.4, 0.4]} />
              <meshStandardMaterial color={product.color} emissive={product.color} emissiveIntensity={0.3} />
            </mesh>
          </Float>
        </group>
      ))}
    </group>
  );
};

// Decorative Vodoun pillars
const Pillar = ({ position, label }) => {
  return (
    <group position={position}>
      {/* Base */}
      <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.5, 1, 1.5]} />
        <meshStandardMaterial color="#4a4035" />
      </mesh>
      {/* Pillar */}
      <mesh position={[0, 3.5, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.6, 0.75, 5, 32]} />
        <meshStandardMaterial color="#5c5248" />
      </mesh>
      {/* Top ornament */}
      <mesh position={[0, 6.25, 0]} castShadow>
        <sphereGeometry args={[0.75, 32, 32]} />
        <meshStandardMaterial color="#B8860B" metalness={0.9} roughness={0.2} emissive="#B8860B" emissiveIntensity={0.8} />
      </mesh>
      {label && (
        <Text
          position={[0, 7.25, 0]}
          fontSize={0.3}
          color="#fff"
          anchorX="center"
          anchorY="middle"
        >
          {label}
        </Text>
      )}
    </group>
  );
};

// Main game scene component
const GameScene = ({ setGameStarted, quality, joystickRef }) => {
  const navigate = useNavigate();

  // Player state
  const [playerPos, setPlayerPos] = useState([0, 0, 0]);
  const [isRunning, setIsRunning] = useState(false);

  // Camera target
  const cameraRef = useRef();
  const playerRef = useRef();
  const keys = useRef({ w: false, a: false, s: false, d: false, up: false, down: false, left: false, right: false, space: false });

  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase();
      if (key in keys.current || ['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(key)) {
        if (key === ' ') keys.current.space = true;
        else if (key === 'arrowup') keys.current.up = true;
        else if (key === 'arrowdown') keys.current.down = true;
        else if (key === 'arrowleft') keys.current.left = true;
        else if (key === 'arrowright') keys.current.right = true;
        else keys.current[key] = true;
      }
    };
    const handleKeyUp = (e) => {
      const key = e.key.toLowerCase();
      if (key in keys.current || ['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(key)) {
        if (key === ' ') keys.current.space = false;
        else if (key === 'arrowup') keys.current.up = false;
        else if (key === 'arrowdown') keys.current.down = false;
        else if (key === 'arrowleft') keys.current.left = false;
        else if (key === 'arrowright') keys.current.right = false;
        else keys.current[key] = false;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useFrame((state, delta) => {
    const speed = 5;
    let moveX = 0;
    let moveZ = 0;

    // Keyboard movement
    if (keys.current.w || keys.current.up) moveZ -= 1;
    if (keys.current.s || keys.current.down) moveZ += 1;
    if (keys.current.a || keys.current.left) moveX -= 1;
    if (keys.current.d || keys.current.right) moveX += 1;

    // Joystick movement
    if (joystickRef.current) {
      moveX += joystickRef.current.x;
      moveZ += joystickRef.current.y;
    }

    const len = Math.sqrt(moveX * moveX + moveZ * moveZ);
    if (len > 0) {
      moveX /= len;
      moveZ /= len;
    }

    setIsRunning(len > 0);

    // Update position (simplified physics)
    setPlayerPos((prev) => [
      prev[0] + moveX * speed * delta,
      prev[1],
      prev[2] + moveZ * speed * delta
    ]);

    // Camera follow
    if (state.camera) {
      const targetX = playerPos[0];
      const targetZ = playerPos[2] + 20; // Pull camera further back
      state.camera.position.set(
        THREE.MathUtils.lerp(state.camera.position.x, targetX, 0.1),
        THREE.MathUtils.lerp(state.camera.position.y, playerPos[1] + 12, 0.1), // Camera higher up
        THREE.MathUtils.lerp(state.camera.position.z, targetZ, 0.1)
      );
      state.camera.lookAt(playerPos[0], playerPos[1] + 2, playerPos[2]);
    }
  });

  return (
    <group>
      {/* Environment */}
      <Sky sunPosition={[100, 20, 100]} turbidity={0.5} rayleigh={0.5} mieCoefficient={0.005} mieDirectionalG={0.8} />
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={0.1} />
      <ambientLight intensity={0.3} />
      <directionalLight
        position={[100, 100, 50]}
        intensity={1.5}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      <pointLight position={[-10, 5, -10]} intensity={1} color="#B8860B" />
      <pointLight position={[10, 5, -10]} intensity={1} color="#8E2420" />
      <pointLight position={[-10, 5, 10]} intensity={1} color="#1C4A66" />
      <pointLight position={[10, 5, 10]} intensity={1} color="#20603C" />
      
      {/* World */}
      <Ground />
      
      {/* Boutique shelves */}
      <Shelf 
        position={[-8, 0, -5]} 
        products={[
          { pos: [-1, 1.2, 0], color: "#8E2420" },
          { pos: [0, 1.2, 0], color: "#B8860B" },
          { pos: [1, 1.2, 0], color: "#1C4A66" }
        ]} 
      />
      <Shelf 
        position={[8, 0, -5]} 
        products={[
          { pos: [-1, 1.2, 0], color: "#20603C" },
          { pos: [0, 1.2, 0], color: "#4a3728" },
          { pos: [1, 1.2, 0], color: "#e0b38d" }
        ]} 
      />
      
      {/* Decorative pillars */}
      <Pillar position={[-10, 0, -10]} />
      <Pillar position={[10, 0, -10]} />
      <Pillar position={[-10, 0, 10]} />
      <Pillar position={[10, 0, 10]} />

      {/* Portals */}
      <Portal 
        position={[-8, 0, -8]} 
        label="BOUTIQUE" 
        color="#8E2420" 
        onClick={(e) => { e.stopPropagation(); navigate('/boutique'); }} 
      />
      <Portal 
        position={[8, 0, -8]} 
        label="PANTHEON" 
        color="#1C4A66" 
        onClick={(e) => { e.stopPropagation(); navigate('/pantheon'); }} 
      />
      <Portal 
        position={[0, 0, 8]} 
        label="CONTACT" 
        color="#20603C" 
        onClick={(e) => { e.stopPropagation(); navigate('/contact'); }} 
      />
      <Portal 
        position={[-8, 0, 0]} 
        label="MARQUE" 
        color="#4A1942" 
        onClick={(e) => { e.stopPropagation(); navigate('/a-propos'); }} 
      />

      {/* Player */}
      <Player 
        position={playerPos} 
        isRunning={isRunning} 
        ref={playerRef} 
      />
    </group>
  );
};

// Start screen component
const StartScreen = ({ onStart }) => {
  const [quality, setQuality] = useState('high');

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-noir">
      <div className="w-full max-w-lg p-8 text-center">
        <h1 className="font-playfair text-7xl text-or mb-2">VODOUN</h1>
        <h2 className="font-playfair text-4xl text-ivoire mb-12">CONCEPT GALLERY</h2>
        
        <div className="mb-8">
          <label className="text-ivoire/70 block text-sm uppercase tracking-widest mb-4">QUALITÉ GRAPHIQUE</label>
          <div className="flex gap-4 justify-center">
            <button 
              onClick={() => setQuality('low')}
              className={`px-6 py-3 border-2 transition-all duration-300 uppercase tracking-widest text-sm ${
                quality === 'low' ? 'border-or bg-or/20 text-or' : 'border-ivoire/30 text-ivoire/70 hover:border-ivoire'
              }`}
            >
              Basse
            </button>
            <button 
              onClick={() => setQuality('medium')}
              className={`px-6 py-3 border-2 transition-all duration-300 uppercase tracking-widest text-sm ${
                quality === 'medium' ? 'border-or bg-or/20 text-or' : 'border-ivoire/30 text-ivoire/70 hover:border-ivoire'
              }`}
            >
              Moyenne
            </button>
            <button 
              onClick={() => setQuality('high')}
              className={`px-6 py-3 border-2 transition-all duration-300 uppercase tracking-widest text-sm ${
                quality === 'high' ? 'border-or bg-or/20 text-or' : 'border-ivoire/30 text-ivoire/70 hover:border-ivoire'
              }`}
            >
              Haute
            </button>
          </div>
        </div>
        
        <button
          onClick={() => onStart(quality)}
          className="w-full bg-or text-noir py-5 text-xl font-bold uppercase tracking-widest hover:bg-or/80 transition-all duration-300"
        >
          DÉMARRER
        </button>
        
        <p className="text-ivoire/50 mt-8 text-sm">
          Contrôles: ZQSD ou Flèches pour bouger • Cliquez sur les portails pour entrer
        </p>
        <a href="/accueil" className="text-or/70 hover:text-or block mt-4 text-sm uppercase tracking-widest transition-colors">
          Ou utiliser la version classique du site
        </a>
      </div>
    </div>
  );
};

// Joystick for mobile (simple DIY one)
const VirtualJoystick = ({ joystickRef }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [stickPos, setStickPos] = useState({ x: 0, y: 0 });
  const baseRef = useRef(null);

  const handleStart = (e) => {
    setIsDragging(true);
  };

  const handleMove = (e) => {
    if (!isDragging || !baseRef.current) return;
    
    const rect = baseRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    let dx = clientX - centerX;
    let dy = clientY - centerY;
    
    const maxDist = 30;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > maxDist) {
      dx = (dx / dist) * maxDist;
      dy = (dy / dist) * maxDist;
    }
    
    setStickPos({ x: dx, y: dy });
    if (joystickRef.current) {
      joystickRef.current.x = dx / maxDist;
      joystickRef.current.y = dy / maxDist;
    }
  };

  const handleEnd = () => {
    setIsDragging(false);
    setStickPos({ x: 0, y: 0 });
    if (joystickRef.current) {
      joystickRef.current.x = 0;
      joystickRef.current.y = 0;
    }
  };

  return (
    <div className="fixed bottom-8 left-8 z-40 md:hidden">
      <div 
        ref={baseRef}
        className="w-28 h-28 rounded-full border-2 border-ivoire/30 relative bg-noir/80"
        onMouseDown={handleStart}
        onMouseMove={handleMove}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
        onTouchStart={handleStart}
        onTouchMove={handleMove}
        onTouchEnd={handleEnd}
      >
        <div 
          className="w-12 h-12 rounded-full bg-or absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transition-transform duration-75"
          style={{ 
            transform: `translate(calc(-50% + ${stickPos.x}px), calc(-50% + ${stickPos.y}px))` 
          }}
        />
      </div>
    </div>
  );
};

// Main component
export default function GameWorld() {
  const [gameStarted, setGameStarted] = useState(false);
  const [quality, setQuality] = useState('high');
  const sharedJoystickRef = useRef({ x: 0, y: 0 });

  const startGame = (q) => {
    setQuality(q);
    setGameStarted(true);
  };

  return (
    <div className="w-full h-screen bg-noir relative">
      {/* Canvas for game world */}
      {gameStarted && (
        <Canvas 
          shadows
          camera={{ fov: 60 }}
        >
          <GameScene 
            setGameStarted={setGameStarted} 
            quality={quality} 
            joystickRef={sharedJoystickRef}
          />
          <ContactShadows position={[0, -0.01, 0]} scale={50} blur={2} opacity={0.5} far={10} />
        </Canvas>
      )}
      
      {/* Start screen */}
      {!gameStarted && <StartScreen onStart={startGame} />}
      
      {/* Virtual joystick for mobile */}
      {gameStarted && <VirtualJoystick joystickRef={sharedJoystickRef} />}
      
      {/* Exit to classic site button */}
      {gameStarted && (
        <a 
          href="/accueil"
          className="fixed top-4 left-4 z-40 px-4 py-2 border border-ivoire/30 text-ivoire/70 uppercase tracking-widest text-xs hover:border-or hover:text-or transition-all duration-300"
        >
          VERSION CLASSIQUE →
        </a>
      )}
      
      {/* Sound control */}
      <SoundControl />
    </div>
  );
}
