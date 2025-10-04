import { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Stars, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

// Star component with glow effect
function Star() {
  const starRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (starRef.current) {
      starRef.current.rotation.y += 0.001;
      starRef.current.rotation.x += 0.0005;
    }
    if (glowRef.current) {
      const pulse = Math.sin(state.clock.elapsedTime * 0.5) * 0.2 + 1;
      glowRef.current.scale.setScalar(pulse);
    }
  });

  return (
    <group>
      {/* Outer glow */}
      <Sphere ref={glowRef} args={[2.5, 32, 32]} position={[0, 0, 0]}>
        <meshBasicMaterial
          color="#ff8800"
          transparent
          opacity={0.15}
        />
      </Sphere>

      {/* Main star */}
      <Sphere ref={starRef} args={[1.5, 64, 64]} position={[0, 0, 0]}>
        <MeshDistortMaterial
          emissive="#ffa500"
          emissiveIntensity={3}
          color="#ffcc00"
          distort={0.3}
          speed={2}
          roughness={0.2}
        />
      </Sphere>
    </group>
  );
}

// Exoplanet component with enhanced textures
interface ExoplanetProps {
  distance: number;
  size: number;
  speed: number;
  color: string;
  tilt?: number;
  type?: 'rocky' | 'gas' | 'ice';
}

function Exoplanet({ distance, size, speed, color, tilt = 0, type = 'rocky' }: ExoplanetProps) {
  const planetRef = useRef<THREE.Mesh>(null);
  const orbitRef = useRef<THREE.Group>(null);
  const atmosphereRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (orbitRef.current) {
      orbitRef.current.rotation.y += speed;
    }
    if (planetRef.current) {
      planetRef.current.rotation.y += 0.01;
      planetRef.current.rotation.x += 0.002;
    }
    if (atmosphereRef.current) {
      atmosphereRef.current.rotation.y -= 0.005;
    }
  });

  // Create orbit ring with enhanced styling
  const orbitRing = useMemo(() => {
    const curve = new THREE.EllipseCurve(
      0, 0,
      distance, distance,
      0, 2 * Math.PI,
      false,
      0
    );
    const points = curve.getPoints(128);
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    return geometry;
  }, [distance]);

  // Texture generation for planet surface
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      // Base color
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, 512, 512);

      // Add texture details based on planet type
      if (type === 'rocky') {
        // Craters and rocky surface
        for (let i = 0; i < 50; i++) {
          const x = Math.random() * 512;
          const y = Math.random() * 512;
          const radius = Math.random() * 20 + 5;

          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(0, 0, 0, ${Math.random() * 0.3})`;
          ctx.fill();
        }
      } else if (type === 'gas') {
        // Gas bands
        for (let i = 0; i < 512; i += 20) {
          ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.1})`;
          ctx.fillRect(0, i, 512, 10 + Math.random() * 20);
        }
      } else if (type === 'ice') {
        // Ice cracks
        for (let i = 0; i < 30; i++) {
          ctx.strokeStyle = `rgba(255, 255, 255, ${Math.random() * 0.3 + 0.1})`;
          ctx.lineWidth = Math.random() * 3;
          ctx.beginPath();
          ctx.moveTo(Math.random() * 512, Math.random() * 512);
          ctx.lineTo(Math.random() * 512, Math.random() * 512);
          ctx.stroke();
        }
      }
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    return tex;
  }, [color, type]);

  return (
    <group ref={orbitRef} rotation={[tilt, 0, 0]}>
      {/* Orbit ring with glow */}
      <line geometry={orbitRing} rotation={[Math.PI / 2, 0, 0]}>
        <lineBasicMaterial attach="material" color="#667eea" opacity={0.5} transparent />
      </line>

      {/* Planet with atmosphere */}
      <group position={[distance, 0, 0]}>
        {/* Atmosphere glow */}
        <Sphere ref={atmosphereRef} args={[size * 1.15, 32, 32]}>
          <meshBasicMaterial
            color={color}
            transparent
            opacity={0.2}
            side={THREE.BackSide}
          />
        </Sphere>

        {/* Main planet with texture */}
        <Sphere ref={planetRef} args={[size, 64, 64]}>
          <meshStandardMaterial
            map={texture}
            color={color}
            roughness={0.8}
            metalness={0.2}
            bumpScale={0.05}
          />
        </Sphere>
      </group>
    </group>
  );
}

// Orbiting Asteroid that passes by the camera with trail
interface OrbitingAsteroidProps {
  delay: number;
  direction: 'left' | 'right';
}

function OrbitingAsteroid({ delay, direction }: OrbitingAsteroidProps) {
  const groupRef = useRef<THREE.Group>(null);
  const asteroidRef = useRef<THREE.Mesh>(null);
  const trailRef = useRef<THREE.Line>(null);
  const [startTime] = useState(() => Date.now() + delay * 1000);
  const [trailPoints] = useState<THREE.Vector3[]>([]);
  const maxTrailLength = 80;

  // Create asteroid texture with rocky surface
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      // Base rocky colors
      const baseColors = ['#6B6B6B', '#8B7355', '#696969', '#7D7D7D', '#5C5C5C'];
      const baseColor = baseColors[Math.floor(Math.random() * baseColors.length)];

      // Create gradient for depth
      const gradient = ctx.createRadialGradient(256, 256, 0, 256, 256, 256);
      gradient.addColorStop(0, baseColor);
      gradient.addColorStop(1, '#2B2B2B');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 512, 512);

      // Add craters and surface details
      for (let i = 0; i < 50; i++) {
        const x = Math.random() * 512;
        const y = Math.random() * 512;
        const radius = Math.random() * 30 + 5;

        // Crater
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 0, 0, ${Math.random() * 0.5 + 0.3})`;
        ctx.fill();

        // Crater rim highlight
        ctx.beginPath();
        ctx.arc(x - radius * 0.2, y - radius * 0.2, radius * 0.8, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.1})`;
        ctx.fill();
      }

      // Add rocks and surface irregularities
      for (let i = 0; i < 80; i++) {
        const x = Math.random() * 512;
        const y = Math.random() * 512;
        const size = Math.random() * 8 + 2;
        ctx.fillStyle = `rgba(${100 + Math.random() * 50}, ${100 + Math.random() * 50}, ${100 + Math.random() * 50}, 0.4)`;
        ctx.fillRect(x, y, size, size);
      }
    }

    const tex = new THREE.CanvasTexture(canvas);
    return tex;
  }, []);

  // Exotic movement calculation
  const calculatePosition = (progress: number) => {
    // Combine multiple wave patterns for exotic movement
    const t = progress * Math.PI * 2;
    const directionMultiplier = direction === 'left' ? -1 : 1;

    // Lissajous curve combined with spiral
    const spiralRadius = 12 + Math.sin(t * 2) * 3;
    const x = Math.sin(t * 1.3) * spiralRadius * directionMultiplier + Math.cos(t * 0.5) * 2;
    const y = Math.sin(t * 1.7) * 4 + Math.cos(t * 3) * 1.5;
    const z = -Math.cos(t) * 15 + 5 + Math.sin(t * 2.3) * 2;

    return new THREE.Vector3(x, y, z);
  };

  useFrame((state) => {
    if (!groupRef.current) return;

    const elapsed = (Date.now() - startTime) / 1000;

    // Duration of one complete orbit (in seconds)
    const orbitDuration = 25;

    // Calculate progress (0 to 1, then loops)
    const progress = (elapsed % orbitDuration) / orbitDuration;

    // Get exotic position
    const position = calculatePosition(progress);
    groupRef.current.position.copy(position);

    // Add current position to trail
    trailPoints.push(position.clone());
    if (trailPoints.length > maxTrailLength) {
      trailPoints.shift();
    }

    // Update trail geometry
    if (trailRef.current && trailPoints.length > 1) {
      const geometry = new THREE.BufferGeometry().setFromPoints(trailPoints);
      trailRef.current.geometry.dispose();
      trailRef.current.geometry = geometry;
    }

    // Rotate asteroid with tumbling motion
    if (asteroidRef.current) {
      asteroidRef.current.rotation.y += 0.02;
      asteroidRef.current.rotation.x += 0.015;
      asteroidRef.current.rotation.z += 0.01;
    }
  });

  return (
    <>
      {/* Trail line - dust trail */}
      <line ref={trailRef}>
        <bufferGeometry />
        <lineBasicMaterial
          color="#A0A0A0"
          transparent
          opacity={0.4}
          linewidth={1}
        />
      </line>

      {/* Asteroid group */}
      <group ref={groupRef}>
        {/* Asteroid with irregular shape using icosahedron */}
        <mesh ref={asteroidRef}>
          <icosahedronGeometry args={[0.4, 1]} />
          <meshStandardMaterial
            map={texture}
            roughness={0.95}
            metalness={0.15}
            bumpMap={texture}
            bumpScale={0.05}
            color="#A9A9A9"
          />
        </mesh>

        {/* Small debris particles around asteroid */}
        {[...Array(5)].map((_, i) => {
          const angle = (i / 5) * Math.PI * 2;
          const radius = 0.6;
          return (
            <mesh key={i} position={[
              Math.cos(angle) * radius,
              Math.sin(angle * 1.5) * 0.3,
              Math.sin(angle) * radius
            ]}>
              <sphereGeometry args={[0.03, 8, 8]} />
              <meshStandardMaterial
                color="#808080"
                roughness={1}
                metalness={0.1}
              />
            </mesh>
          );
        })}
      </group>
    </>
  );
}

// Main Space Scene
export default function SpaceScene() {
  return (
    <>
      {/* Ambient lighting */}
      <ambientLight intensity={0.3} />

      {/* Point light from star */}
      <pointLight position={[0, 0, 0]} intensity={4} distance={40} color="#ffa500" />

      {/* Additional directional lighting for better visibility */}
      <directionalLight position={[10, 10, 5]} intensity={0.5} color="#ffffff" />

      {/* Starfield background */}
      <Stars
        radius={100}
        depth={50}
        count={8000}
        factor={5}
        saturation={0.2}
        fade
        speed={1.5}
      />

      {/* Central star with pulsing glow */}
      <Star />

      {/* Exoplanets with different types and enhanced visuals */}
      <Exoplanet distance={3} size={0.25} speed={0.008} color="#D2691E" tilt={0.1} type="rocky" />
      <Exoplanet distance={5} size={0.45} speed={0.005} color="#4169E1" tilt={-0.15} type="gas" />
      <Exoplanet distance={7} size={0.32} speed={0.003} color="#DC143C" tilt={0.2} type="rocky" />
      <Exoplanet distance={9} size={0.5} speed={0.002} color="#9370DB" tilt={-0.1} type="gas" />
      <Exoplanet distance={11} size={0.28} speed={0.0015} color="#87CEEB" tilt={0.25} type="ice" />
      <Exoplanet distance={13} size={0.35} speed={0.001} color="#FF6347" tilt={-0.2} type="rocky" />

      {/* Animated asteroids that pass by the camera */}
      <OrbitingAsteroid delay={0} direction="left" />
      <OrbitingAsteroid delay={10} direction="right" />
    </>
  );
}
