import { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Stars, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

// Star component with enhanced glow effect
function Star() {
  const starRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const outerGlowRef = useRef<THREE.Mesh>(null);
  const coronaRef = useRef<THREE.Mesh>(null);

  // Detect mobile
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  useFrame((state) => {
    if (starRef.current) {
      starRef.current.rotation.y += 0.001;
      starRef.current.rotation.x += 0.0005;
    }
    if (glowRef.current) {
      const pulse = Math.sin(state.clock.elapsedTime * 0.5) * 0.3 + 1;
      glowRef.current.scale.setScalar(pulse);
    }
    if (!isMobile) {
      if (outerGlowRef.current) {
        const pulse = Math.sin(state.clock.elapsedTime * 0.3) * 0.2 + 1;
        outerGlowRef.current.scale.setScalar(pulse);
        outerGlowRef.current.rotation.z += 0.002;
      }
      if (coronaRef.current) {
        coronaRef.current.rotation.y += 0.003;
        const pulse = Math.sin(state.clock.elapsedTime * 0.7) * 0.15 + 1;
        coronaRef.current.scale.setScalar(pulse);
      }
    }
  });

  return (
    <group>
      {/* Outermost glow - desktop only */}
      {!isMobile && (
        <Sphere ref={outerGlowRef} args={[4, 24, 24]} position={[0, 0, 0]}>
          <meshBasicMaterial
            color="#ff8800"
            transparent
            opacity={0.08}
          />
        </Sphere>
      )}

      {/* Corona layer - desktop only */}
      {!isMobile && (
        <Sphere ref={coronaRef} args={[3, 24, 24]} position={[0, 0, 0]}>
          <meshBasicMaterial
            color="#ffaa00"
            transparent
            opacity={0.12}
          />
        </Sphere>
      )}

      {/* Middle glow */}
      <Sphere ref={glowRef} args={[2.5, isMobile ? 24 : 32, isMobile ? 24 : 32]} position={[0, 0, 0]}>
        <meshBasicMaterial
          color="#ff8800"
          transparent
          opacity={0.2}
        />
      </Sphere>

      {/* Main star with enhanced distortion */}
      <Sphere ref={starRef} args={[1.5, isMobile ? 32 : 64, isMobile ? 32 : 64]} position={[0, 0, 0]}>
        <MeshDistortMaterial
          emissive="#ffa500"
          emissiveIntensity={4}
          color="#ffcc00"
          distort={isMobile ? 0.2 : 0.4}
          speed={2.5}
          roughness={0.1}
        />
      </Sphere>

      {/* Additional point lights for better illumination */}
      <pointLight position={[0, 0, 0]} intensity={5} distance={50} color="#ffaa00" />
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
      {/* Orbit ring with enhanced glow */}
      <line geometry={orbitRing} rotation={[Math.PI / 2, 0, 0]}>
        <lineBasicMaterial attach="material" color="#667eea" opacity={0.4} transparent />
      </line>
      {/* Second orbit ring for depth */}
      <line geometry={orbitRing} rotation={[Math.PI / 2, 0, 0]}>
        <lineBasicMaterial attach="material" color="#a8c0ff" opacity={0.2} transparent />
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

// Rocket component with engine glow and trail
interface RocketProps {
  delay: number;
  direction: 'left' | 'right';
}

function Rocket({ delay, direction }: RocketProps) {
  const groupRef = useRef<THREE.Group>(null);
  const rocketRef = useRef<THREE.Group>(null);
  const trailRef = useRef<THREE.Line>(null);
  const [startTime] = useState(() => Date.now() + delay * 1000);
  const [trailPoints] = useState<THREE.Vector3[]>([]);
  const maxTrailLength = 120;

  const calculatePosition = (progress: number) => {
    const t = progress * Math.PI * 2;
    const directionMultiplier = direction === 'left' ? -1 : 1;

    // Smooth curved path
    const pathRadius = 18;
    const x = Math.sin(t * 0.8) * pathRadius * directionMultiplier;
    const y = Math.sin(t * 1.2) * 5 + 2;
    const z = -Math.cos(t * 0.8) * 20 + 8;

    return new THREE.Vector3(x, y, z);
  };

  useFrame((state) => {
    if (!groupRef.current) return;

    const elapsed = (Date.now() - startTime) / 1000;
    const orbitDuration = 30;
    const progress = (elapsed % orbitDuration) / orbitDuration;

    const position = calculatePosition(progress);
    const nextPosition = calculatePosition(progress + 0.001);

    groupRef.current.position.copy(position);

    // Point rocket in direction of travel
    groupRef.current.lookAt(nextPosition);

    // Add to trail
    trailPoints.push(position.clone());
    if (trailPoints.length > maxTrailLength) {
      trailPoints.shift();
    }

    // Update trail
    if (trailRef.current && trailPoints.length > 1) {
      const geometry = new THREE.BufferGeometry().setFromPoints(trailPoints);
      trailRef.current.geometry.dispose();
      trailRef.current.geometry = geometry;
    }

    // Slight rotation
    if (rocketRef.current) {
      rocketRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 2) * 0.1;
    }
  });

  return (
    <>
      {/* Rocket trail - engine exhaust */}
      <line ref={trailRef}>
        <bufferGeometry />
        <lineBasicMaterial
          color="#FF6B35"
          transparent
          opacity={0.6}
          linewidth={2}
        />
      </line>

      {/* Rocket group */}
      <group ref={groupRef}>
        <group ref={rocketRef}>
          {/* Rocket body - cone */}
          <mesh position={[0, 0, 0.4]}>
            <coneGeometry args={[0.15, 0.6, 8]} />
            <meshStandardMaterial
              color="#E8E8E8"
              metalness={0.8}
              roughness={0.2}
              emissive="#666666"
              emissiveIntensity={0.3}
            />
          </mesh>

          {/* Rocket nose - tip */}
          <mesh position={[0, 0, 0.85]}>
            <coneGeometry args={[0.08, 0.3, 8]} />
            <meshStandardMaterial
              color="#FF4444"
              metalness={0.6}
              roughness={0.3}
              emissive="#FF0000"
              emissiveIntensity={0.5}
            />
          </mesh>

          {/* Wings */}
          {[0, 120, 240].map((angle, i) => (
            <mesh
              key={i}
              position={[
                Math.cos((angle * Math.PI) / 180) * 0.12,
                Math.sin((angle * Math.PI) / 180) * 0.12,
                0.2
              ]}
              rotation={[0, 0, (angle * Math.PI) / 180]}
            >
              <boxGeometry args={[0.25, 0.02, 0.3]} />
              <meshStandardMaterial
                color="#4444FF"
                metalness={0.7}
                roughness={0.3}
                emissive="#0000AA"
                emissiveIntensity={0.4}
              />
            </mesh>
          ))}

          {/* Engine glow */}
          <mesh position={[0, 0, -0.1]}>
            <sphereGeometry args={[0.2, 16, 16]} />
            <meshBasicMaterial
              color="#FF6B35"
              transparent
              opacity={0.7}
            />
          </mesh>

          {/* Engine fire */}
          <mesh position={[0, 0, -0.3]}>
            <coneGeometry args={[0.12, 0.4, 8]} />
            <meshBasicMaterial
              color="#FFA500"
              transparent
              opacity={0.8}
            />
          </mesh>

          {/* Point light for engine */}
          <pointLight position={[0, 0, -0.2]} intensity={2} distance={3} color="#FF6B35" />
        </group>
      </group>
    </>
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
      // Lighter base rocky colors for asteroid appearance
      const baseColors = ['#A8A8A8', '#B8A89A', '#9C9C9C', '#ADADAD', '#8C8C8C'];
      const baseColor = baseColors[Math.floor(Math.random() * baseColors.length)];

      // Create gradient for depth - lighter overall
      const gradient = ctx.createRadialGradient(256, 256, 0, 256, 256, 256);
      gradient.addColorStop(0, '#D0D0D0');
      gradient.addColorStop(0.5, baseColor);
      gradient.addColorStop(1, '#707070');
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

  // Smoother movement calculation
  const calculatePosition = (progress: number) => {
    // Simplified wave patterns for smoother, less erratic movement
    const t = progress * Math.PI * 2;
    const directionMultiplier = direction === 'left' ? -1 : 1;

    // Gentle curved path with minimal variation
    const spiralRadius = 12;
    const x = Math.sin(t * 0.8) * spiralRadius * directionMultiplier;
    const y = Math.sin(t * 0.9) * 3;
    const z = -Math.cos(t * 0.8) * 15 + 5;

    return new THREE.Vector3(x, y, z);
  };

  useFrame((state) => {
    if (!groupRef.current) return;

    const elapsed = (Date.now() - startTime) / 1000;

    // Duration of one complete orbit (in seconds) - increased for slower movement
    const orbitDuration = 40;

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

    // Rotate asteroid with gentle tumbling motion
    if (asteroidRef.current) {
      asteroidRef.current.rotation.y += 0.01;
      asteroidRef.current.rotation.x += 0.008;
      asteroidRef.current.rotation.z += 0.005;
    }
  });

  return (
    <>
      {/* Trail line - dust trail */}
      <line ref={trailRef}>
        <bufferGeometry />
        <lineBasicMaterial
          color="#D0D0D0"
          transparent
          opacity={0.5}
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
            roughness={0.9}
            metalness={0.05}
            bumpMap={texture}
            bumpScale={0.08}
            color="#C8C8C8"
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
                color="#B0B0B0"
                roughness={0.95}
                metalness={0.05}
              />
            </mesh>
          );
        })}
      </group>
    </>
  );
}

// Shooting Star component
function ShootingStar({ delay }: { delay: number }) {
  const lineRef = useRef<THREE.Line>(null);
  const [startTime] = useState(() => Date.now() + delay * 1000);
  const [trailPoints] = useState<THREE.Vector3[]>([]);
  const maxTrailLength = 40;

  useFrame(() => {
    const elapsed = (Date.now() - startTime) / 1000;
    const duration = 5; // Each shooting star lasts 5 seconds (slower)
    const cycleDuration = 20; // New shooting star every 20 seconds

    const cycleTime = elapsed % cycleDuration;

    if (cycleTime < duration) {
      const progress = cycleTime / duration;

      // Shooting star trajectory - diagonal across view
      const startX = -30 + Math.random() * 20;
      const startY = 10 + Math.random() * 10;
      const startZ = -20 + Math.random() * 10;

      const x = startX + progress * 60;
      const y = startY - progress * 15;
      const z = startZ + progress * 20;

      const position = new THREE.Vector3(x, y, z);

      trailPoints.push(position);
      if (trailPoints.length > maxTrailLength) {
        trailPoints.shift();
      }
    } else {
      // Clear trail between shooting stars
      trailPoints.length = 0;
    }

    if (lineRef.current && trailPoints.length > 1) {
      const geometry = new THREE.BufferGeometry().setFromPoints(trailPoints);
      lineRef.current.geometry.dispose();
      lineRef.current.geometry = geometry;
    }
  });

  return (
    <line ref={lineRef}>
      <bufferGeometry />
      <lineBasicMaterial
        color="#FFFFFF"
        transparent
        opacity={0.9}
        linewidth={3}
      />
    </line>
  );
}

// Main Space Scene
export default function SpaceScene() {
  // Detect if mobile device for performance optimization
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  return (
    <>
      {/* Ambient lighting */}
      <ambientLight intensity={0.3} />

      {/* Point light from star */}
      <pointLight position={[0, 0, 0]} intensity={4} distance={40} color="#ffa500" />

      {/* Additional directional lighting for better visibility */}
      <directionalLight position={[10, 10, 5]} intensity={0.5} color="#ffffff" />

      {/* Enhanced Starfield background - reduced on mobile */}
      <Stars
        radius={100}
        depth={50}
        count={isMobile ? 5000 : 15000}
        factor={6}
        saturation={0.3}
        fade
        speed={2}
      />
      {/* Additional twinkling stars layer - only on desktop */}
      {!isMobile && (
        <Stars
          radius={150}
          depth={80}
          count={5000}
          factor={8}
          saturation={0.8}
          fade={false}
          speed={0.5}
        />
      )}

      {/* Central star with pulsing glow */}
      <Star />

      {/* Exoplanets - reduced on mobile */}
      <Exoplanet distance={3} size={0.3} speed={0.009} color="#CD853F" tilt={0.1} type="rocky" />
      <Exoplanet distance={4.5} size={0.4} speed={0.007} color="#8B4513" tilt={0.05} type="rocky" />
      <Exoplanet distance={6} size={0.55} speed={0.005} color="#4169E1" tilt={-0.15} type="gas" />
      <Exoplanet distance={7.5} size={0.35} speed={0.004} color="#DC143C" tilt={0.2} type="rocky" />
      {!isMobile && (
        <>
          <Exoplanet distance={9} size={0.6} speed={0.0025} color="#9370DB" tilt={-0.1} type="gas" />
          <Exoplanet distance={10.5} size={0.32} speed={0.002} color="#87CEEB" tilt={0.25} type="ice" />
          <Exoplanet distance={12} size={0.38} speed={0.0015} color="#FF6347" tilt={-0.2} type="rocky" />
          <Exoplanet distance={14} size={0.5} speed={0.001} color="#FFD700" tilt={0.15} type="gas" />
          <Exoplanet distance={15.5} size={0.28} speed={0.0008} color="#E0FFFF" tilt={-0.25} type="ice" />
        </>
      )}

      {/* Animated asteroids - reduced on mobile */}
      <OrbitingAsteroid delay={0} direction="left" />
      {!isMobile && (
        <>
          <OrbitingAsteroid delay={7} direction="right" />
          <OrbitingAsteroid delay={14} direction="left" />
        </>
      )}

      {/* Shooting stars - reduced on mobile */}
      <ShootingStar delay={0} />
      {!isMobile && (
        <>
          <ShootingStar delay={5} />
          <ShootingStar delay={10} />
        </>
      )}
    </>
  );
}
