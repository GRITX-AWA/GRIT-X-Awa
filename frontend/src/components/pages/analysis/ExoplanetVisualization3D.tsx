import { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, OrbitControls, Stars, Html, Line } from '@react-three/drei';
import * as THREE from 'three';

// Type definitions for exoplanet data
interface ExoplanetData {
  // Kepler format
  kepid?: number;
  kepler_name?: string;
  koi_disposition?: string;
  koi_period?: number;
  koi_prad?: number;
  koi_teq?: number;
  koi_insol?: number;
  koi_sma?: number;
  koi_depth?: number;
  koi_duration?: number;
  koi_steff?: number;
  koi_srad?: number;

  // TESS format
  tic_id?: number;
  toi_id?: number;
  pl_name?: string;
  pl_rade?: number;
  pl_orbper?: number;
  pl_eqt?: number;
  pl_orbsmax?: number;
  st_rad?: number;
  st_teff?: number;
  sy_dist?: number;  // Legacy Kepler field
  st_dist?: number;  // TESS field for stellar/system distance
}

interface VisualizationProps {
  data: ExoplanetData;
  dataType: 'kepler' | 'tess';
  multipleData?: ExoplanetData[];
  onPlanetClick?: (planet: ExoplanetData) => void;
}

// Enhanced Star component with multiple glow layers
function CentralStar({
  radius,
  temperature,
  onClick,
  isSelected = false
}: {
  radius: number;
  temperature: number;
  onClick?: () => void;
  isSelected?: boolean;
}) {
  const starRef = useRef<THREE.Mesh>(null);
  const glowRef1 = useRef<THREE.Mesh>(null);
  const glowRef2 = useRef<THREE.Mesh>(null);
  const glowRef3 = useRef<THREE.Mesh>(null);
  const coronaRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (starRef.current) {
      // More dynamic star rotation
      starRef.current.rotation.y += 0.005;
      starRef.current.rotation.x += 0.002;
      // Add wobble effect for more realism
      starRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.05;
      starRef.current.position.x = Math.cos(state.clock.elapsedTime * 0.15) * 0.03;
    }
    // Multi-layered pulsing glow with more intensity
    if (glowRef1.current) {
      const pulse1 = Math.sin(state.clock.elapsedTime * 0.5) * 0.15 + 1;
      glowRef1.current.scale.setScalar(pulse1);
      glowRef1.current.rotation.z += 0.001;
    }
    if (glowRef2.current) {
      const pulse2 = Math.sin(state.clock.elapsedTime * 0.7 + 1) * 0.12 + 1;
      glowRef2.current.scale.setScalar(pulse2);
      glowRef2.current.rotation.z -= 0.0015;
    }
    if (glowRef3.current) {
      const pulse3 = Math.sin(state.clock.elapsedTime * 0.3 + 2) * 0.18 + 1;
      glowRef3.current.scale.setScalar(pulse3);
      glowRef3.current.rotation.y += 0.002;
    }
    if (coronaRef.current) {
      coronaRef.current.rotation.y -= 0.003;
      coronaRef.current.rotation.x += 0.001;
    }
  });

  // Determine star color based on temperature with scientifically accurate, varied palette
  const getStarColor = (temp: number) => {
    // M-class (Red Dwarfs) - 2,400K to 3,700K
    if (temp < 2600) {
      const colors = ['#ff3800', '#ff4400', '#ff4d00', '#ff5500']; // Deep red to red-orange
      return colors[Math.floor(Math.random() * colors.length)];
    }
    if (temp < 3000) {
      const colors = ['#ff5500', '#ff6000', '#ff6633', '#ff6b4a']; // Red to orange-red
      return colors[Math.floor(Math.random() * colors.length)];
    }
    if (temp < 3700) {
      const colors = ['#ff7744', '#ff8855', '#ff9055', '#ffa066']; // Orange-red
      return colors[Math.floor(Math.random() * colors.length)];
    }
    
    // K-class (Orange) - 3,700K to 5,200K
    if (temp < 4500) {
      const colors = ['#ffaa44', '#ffb366', '#ffbb55', '#ffc077']; // Orange
      return colors[Math.floor(Math.random() * colors.length)];
    }
    if (temp < 5200) {
      const colors = ['#ffc888', '#ffd099', '#ffd8aa', '#ffe0bb']; // Light orange to yellow-orange
      return colors[Math.floor(Math.random() * colors.length)];
    }
    
    // G-class (Yellow) - 5,200K to 6,000K (like our Sun)
    if (temp < 5600) {
      const colors = ['#ffe8cc', '#ffeeaa', '#fff0bb', '#fff2cc']; // Pale yellow
      return colors[Math.floor(Math.random() * colors.length)];
    }
    if (temp < 6000) {
      const colors = ['#fff4aa', '#fff6bb', '#fff8cc', '#fffadd']; // Yellow
      return colors[Math.floor(Math.random() * colors.length)];
    }
    
    // F-class (Yellow-White) - 6,000K to 7,500K
    if (temp < 6800) {
      const colors = ['#ffffdd', '#ffffee', '#fffff0', '#fffff8']; // Yellow-white
      return colors[Math.floor(Math.random() * colors.length)];
    }
    if (temp < 7500) {
      const colors = ['#fffffa', '#fffffc', '#ffffff', '#fefeff']; // White with slight yellow tint
      return colors[Math.floor(Math.random() * colors.length)];
    }
    
    // A-class (White) - 7,500K to 10,000K
    if (temp < 8500) {
      const colors = ['#ffffff', '#fefffe', '#fcfeff', '#fafeff']; // Pure white to slight blue tint
      return colors[Math.floor(Math.random() * colors.length)];
    }
    if (temp < 10000) {
      const colors = ['#f8fcff', '#f5faff', '#f0f8ff', '#eef6ff']; // White with blue tint
      return colors[Math.floor(Math.random() * colors.length)];
    }
    
    // B-class (Blue-White) - 10,000K to 30,000K
    if (temp < 15000) {
      const colors = ['#e6f0ff', '#ddeeff', '#d4ebff', '#cce8ff']; // Light blue-white
      return colors[Math.floor(Math.random() * colors.length)];
    }
    if (temp < 30000) {
      const colors = ['#c4e5ff', '#bbe2ff', '#b3dfff', '#aaddff']; // Blue-white
      return colors[Math.floor(Math.random() * colors.length)];
    }
    
    // O-class (Blue) - 30,000K+
    const colors = ['#9bd5ff', '#92d0ff', '#8accff', '#80c8ff', '#77c4ff']; // Bright blue
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const starColor = getStarColor(temperature);

  // Create star surface texture with solar activity
  const starTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      // Base star color
      ctx.fillStyle = starColor;
      ctx.fillRect(0, 0, 512, 512);

      // Add solar granulation (convection cells)
      for (let i = 0; i < 100; i++) {
        const x = Math.random() * 512;
        const y = Math.random() * 512;
        const rad = Math.random() * 15 + 5;
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, rad);
        gradient.addColorStop(0, 'rgba(255, 255, 200, 0.3)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0.2)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, rad, 0, Math.PI * 2);
        ctx.fill();
      }

      // Add sunspots (darker regions)
      for (let i = 0; i < 8; i++) {
        const x = Math.random() * 512;
        const y = Math.random() * 512;
        const rad = Math.random() * 20 + 10;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.beginPath();
        ctx.arc(x, y, rad, 0, Math.PI * 2);
        ctx.fill();
      }

      // Add bright active regions
      for (let i = 0; i < 15; i++) {
        const x = Math.random() * 512;
        const y = Math.random() * 512;
        const rad = Math.random() * 12 + 4;
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, rad);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.6)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, rad, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    return tex;
  }, [starColor]);

  return (
    <group>
      {/* Outer glow - reduced size and opacity */}
      <Sphere ref={glowRef3} args={[radius * 2.5, 32, 32]} position={[0, 0, 0]}>
        <meshBasicMaterial
          color={starColor}
          transparent
          opacity={0.08}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </Sphere>

      {/* Large glow layer - reduced */}
      <Sphere ref={glowRef2} args={[radius * 1.8, 32, 32]} position={[0, 0, 0]}>
        <meshBasicMaterial
          color={starColor}
          transparent
          opacity={0.15}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </Sphere>

      {/* Medium glow layer - reduced */}
      <Sphere ref={glowRef1} args={[radius * 1.4, 32, 32]} position={[0, 0, 0]}>
        <meshBasicMaterial
          color={starColor}
          transparent
          opacity={0.25}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </Sphere>

      {/* Corona effect - reduced */}
      <Sphere ref={coronaRef} args={[radius * 1.15, 32, 32]} position={[0, 0, 0]}>
        <meshBasicMaterial
          color={starColor}
          transparent
          opacity={0.4}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </Sphere>

      {/* Main star with surface texture - BRIGHT */}
      <Sphere
        ref={starRef}
        args={[radius, 64, 64]}
        position={[0, 0, 0]}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = onClick ? 'pointer' : 'default';
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          setHovered(false);
          document.body.style.cursor = 'default';
        }}
        onClick={(e) => {
          e.stopPropagation();
          if (onClick) onClick();
        }}
      >
        <meshBasicMaterial
          map={starTexture}
          color={isSelected || hovered ? '#ffffff' : starColor}
          toneMapped={false}
        />
      </Sphere>

      {/* Intense emissive layer */}
      <Sphere args={[radius * 1.05, 64, 64]} position={[0, 0, 0]}>
        <meshBasicMaterial
          color={isSelected || hovered ? '#ffffff' : starColor}
          transparent
          opacity={isSelected ? 1 : hovered ? 0.95 : 0.9}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </Sphere>

      {/* Subtle glow pulse for selected/hovered star - no ring */}
      {(isSelected || hovered) && (
        <Sphere args={[radius * 1.5, 32, 32]} position={[0, 0, 0]}>
          <meshBasicMaterial
            color={isSelected ? '#667eea' : '#ffffff'}
            transparent
            opacity={isSelected ? 0.15 : 0.1}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </Sphere>
      )}
    </group>
  );
}

// Planet component with realistic rendering
function ExoplanetModel({
  distance,
  radius,
  temperature,
  orbitalPeriod,
  name,
  planetData,
  onPlanetClick,
  isSelected,
  uniqueId,
  totalPlanets = 1
}: {
  distance: number;
  radius: number;
  temperature: number;
  orbitalPeriod: number;
  name: string;
  planetData?: ExoplanetData;
  onPlanetClick?: (planet: ExoplanetData, uniqueId: string) => void;
  isSelected?: boolean;
  uniqueId: string;
  totalPlanets?: number;
}) {
  const planetRef = useRef<THREE.Mesh>(null);
  const orbitRef = useRef<THREE.Group>(null);
  const atmosphereRef = useRef<THREE.Mesh>(null);
  const [showLabel, setShowLabel] = useState(false);
  const [hovered, setHovered] = useState(false);

  // Random orbital parameters for variety (deterministic based on name)
  const orbitParams = useMemo(() => {
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return {
      eccentricity: (hash % 30) / 100, // 0 to 0.3 eccentricity
      inclination: ((hash % 25) - 12.5) * (Math.PI / 180), // -12.5 to +12.5 degrees
      argumentOfPeriapsis: (hash % 360) * (Math.PI / 180), // Random orientation
    };
  }, [name]);

  useFrame((state) => {
    if (orbitRef.current) {
      // Orbit speed based on period (slower for longer periods)
      // Increased multiplier from 75 to 250 to slow down orbits significantly
      // When hovered or selected, reduce speed by 90% for easier interaction
      const baseSpeed = (2 * Math.PI) / (orbitalPeriod * 250);
      const speedMultiplier = (hovered || isSelected) ? 0.1 : 1;
      orbitRef.current.rotation.y += baseSpeed * speedMultiplier;
    }
    if (planetRef.current) {
      // Planet rotation - faster for smaller planets
      // Slow down rotation when hovered for better interaction
      const rotationSpeed = (hovered || isSelected) ? 0.002 : 0.01;
      planetRef.current.rotation.y += rotationSpeed * (1 / Math.max(radius, 0.5));
      // Add slight axial tilt wobble
      planetRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
    if (atmosphereRef.current) {
      atmosphereRef.current.rotation.y -= (hovered || isSelected) ? 0.001 : 0.005;
    }
  });

  // Determine planet color and type based on temperature and size with richer palette
  const getPlanetColor = (temp: number, rad: number) => {
    if (rad > 10) {
      // Gas giants - color based on temperature
      if (temp > 1000) return '#ffaa66'; // Hot Jupiter - orange/tan
      if (temp > 600) return '#ffd4a3'; // Warm gas giant - beige
      return '#c9b8a0'; // Cool gas giant - tan/brown
    }
    // Rocky/terrestrial planets
    if (temp > 1500) return '#ff3333'; // Lava world - bright red
    if (temp > 1000) return '#ff6b4a'; // Very hot - red-orange
    if (temp > 600) return '#ff9966'; // Hot - orange
    if (temp > 400) return '#ffbb77'; // Warm - light orange
    if (temp >= 200 && temp <= 350) {
      // Potentially habitable zone - earth-like blues and greens
      // Use temperature to deterministically choose color (consistent across renders)
      return temp < 275 ? '#4a90e2' : '#5ab85a'; // Blue or green based on temp
    }
    if (temp > 100) return '#87ceeb'; // Cold - light blue (ice)
    return '#b0e0e6'; // Very cold - pale blue/white
  };

  const getSecondaryColor = (temp: number, rad: number) => {
    if (rad > 10) return '#8b6f47'; // Gas giant bands
    if (temp >= 200 && temp <= 350) return '#2d5a2d'; // Habitable zone - darker green/blue
    if (temp > 600) return '#cc4422'; // Hot world - darker red
    return '#5a7d8f'; // Cold world - darker blue
  };

  const planetColor = getPlanetColor(temperature, radius);
  const secondaryColor = getSecondaryColor(temperature, radius);

  // Create procedural texture with enhanced details
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      ctx.fillStyle = planetColor;
      ctx.fillRect(0, 0, 512, 512);

      // Add surface features based on planet type
      if (radius > 10) {
        // Gas giant bands with more detail
        for (let i = 0; i < 512; i += 20 + Math.random() * 40) {
          const gradient = ctx.createLinearGradient(0, i, 0, i + 30);
          gradient.addColorStop(0, `rgba(139, 111, 71, ${Math.random() * 0.3})`);
          gradient.addColorStop(0.5, `rgba(255, 255, 255, ${Math.random() * 0.2})`);
          gradient.addColorStop(1, `rgba(139, 111, 71, ${Math.random() * 0.3})`);
          ctx.fillStyle = gradient;
          ctx.fillRect(0, i, 512, 15 + Math.random() * 25);
        }
        // Add storm spots (like Jupiter's Great Red Spot)
        for (let i = 0; i < 3; i++) {
          const x = Math.random() * 512;
          const y = Math.random() * 512;
          const rad = Math.random() * 40 + 30;
          const gradient = ctx.createRadialGradient(x, y, 0, x, y, rad);
          gradient.addColorStop(0, secondaryColor);
          gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(x, y, rad, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (temperature >= 200 && temperature <= 350) {
        // Potentially habitable - add continents and oceans
        ctx.fillStyle = secondaryColor;
        for (let i = 0; i < 20; i++) {
          ctx.beginPath();
          const x = Math.random() * 512;
          const y = Math.random() * 512;
          const rad = Math.random() * 60 + 30;
          ctx.arc(x, y, rad, 0, Math.PI * 2);
          ctx.fill();
        }
        // Add clouds
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        for (let i = 0; i < 30; i++) {
          const x = Math.random() * 512;
          const y = Math.random() * 512;
          const rad = Math.random() * 40 + 10;
          ctx.beginPath();
          ctx.arc(x, y, rad, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (temperature < 200) {
        // Ice world - add ice caps and cracks
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.lineWidth = 2;
        for (let i = 0; i < 50; i++) {
          ctx.beginPath();
          ctx.moveTo(Math.random() * 512, Math.random() * 512);
          ctx.lineTo(Math.random() * 512, Math.random() * 512);
          ctx.stroke();
        }
      } else {
        // Rocky/hot surface with craters and volcanic features
        for (let i = 0; i < 50; i++) {
          const x = Math.random() * 512;
          const y = Math.random() * 512;
          const rad = Math.random() * 25 + 5;
          ctx.beginPath();
          ctx.arc(x, y, rad, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(0, 0, 0, ${Math.random() * 0.4 + 0.1})`;
          ctx.fill();
          // Crater rim
          ctx.strokeStyle = `rgba(255, 255, 255, ${Math.random() * 0.2})`;
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      }
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    return tex;
  }, [planetColor, secondaryColor, radius, temperature]);

  // Create orbit path with color based on planet type
  const orbitColor = useMemo(() => {
    if (temperature >= 200 && temperature <= 350) return '#5ab85a'; // Habitable zone - green
    if (temperature > 600) return '#ff6b4a'; // Hot orbit - red
    if (temperature < 200) return '#87ceeb'; // Cold orbit - blue
    return '#667eea'; // Default - purple
  }, [temperature]);

  // Create elliptical orbit path with inclination for 3D motion
  const orbitPoints = useMemo(() => {
    const points = [];
    const { eccentricity, inclination, argumentOfPeriapsis } = orbitParams;

    for (let i = 0; i <= 128; i++) {
      const angle = (i / 128) * Math.PI * 2;

      // Calculate elliptical orbit (semi-major and semi-minor axes)
      const a = distance; // semi-major axis
      const b = a * Math.sqrt(1 - eccentricity * eccentricity); // semi-minor axis

      // Elliptical coordinates
      const x = a * Math.cos(angle);
      const z = b * Math.sin(angle);

      // Apply argument of periapsis rotation (in orbital plane)
      const xRot = x * Math.cos(argumentOfPeriapsis) - z * Math.sin(argumentOfPeriapsis);
      const zRot = x * Math.sin(argumentOfPeriapsis) + z * Math.cos(argumentOfPeriapsis);

      // Apply orbital inclination (tilt out of plane)
      const xFinal = xRot;
      const yFinal = zRot * Math.sin(inclination);
      const zFinal = zRot * Math.cos(inclination);

      points.push(new THREE.Vector3(xFinal, yFinal, zFinal));
    }
    return points;
  }, [distance, orbitParams]);

  // Calculate current planet position on elliptical orbit with angular offset for collision avoidance
  const planetPosition = useMemo(() => {
    const { eccentricity, inclination, argumentOfPeriapsis } = orbitParams;

    // Add angular offset based on planet name to spread planets at similar distances
    // This creates a hash-based offset so planets don't start at the same angle
    const nameHash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const angularOffset = (nameHash % 360) * (Math.PI / 180); // Convert to radians
    const angle = angularOffset; // Use offset as starting position

    const a = distance;
    const b = a * Math.sqrt(1 - eccentricity * eccentricity);

    const x = a * Math.cos(angle);
    const z = b * Math.sin(angle);

    const xRot = x * Math.cos(argumentOfPeriapsis) - z * Math.sin(argumentOfPeriapsis);
    const zRot = x * Math.sin(argumentOfPeriapsis) + z * Math.cos(argumentOfPeriapsis);

    const xFinal = xRot;
    const yFinal = zRot * Math.sin(inclination);
    const zFinal = zRot * Math.cos(inclination);

    return [xFinal, yFinal, zFinal] as [number, number, number];
  }, [distance, orbitParams, name]);

  // Calculate line width and opacity based on total number of planets
  const orbitLineProps = useMemo(() => {
    if (totalPlanets > 15) {
      return {
        lineWidth: isSelected ? 3 : hovered ? 2.5 : 1.5,
        opacity: isSelected ? 0.75 : hovered ? 0.55 : 0.35
      };
    } else if (totalPlanets > 8) {
      return {
        lineWidth: isSelected ? 3.5 : hovered ? 2.8 : 2.0,
        opacity: isSelected ? 0.8 : hovered ? 0.6 : 0.4
      };
    } else if (totalPlanets > 3) {
      return {
        lineWidth: isSelected ? 4 : hovered ? 3 : 2.5,
        opacity: isSelected ? 0.85 : hovered ? 0.65 : 0.45
      };
    }
    return {
      lineWidth: isSelected ? 4.5 : hovered ? 3.5 : 3,
      opacity: isSelected ? 0.9 : hovered ? 0.7 : 0.5
    };
  }, [totalPlanets, isSelected, hovered]);

  return (
    <group ref={orbitRef}>
      {/* Orbit path with color coding - thinner and more transparent when many planets */}
      <Line
        points={orbitPoints}
        color={orbitColor}
        lineWidth={orbitLineProps.lineWidth}
        transparent
        opacity={orbitLineProps.opacity}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = planetData && onPlanetClick ? 'pointer' : 'default';
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          setHovered(false);
          document.body.style.cursor = 'default';
        }}
        onClick={(e) => {
          e.stopPropagation();
          if (planetData && onPlanetClick) {
            onPlanetClick(planetData, uniqueId);
          }
        }}
      />

      {/* Planet group - positioned on elliptical orbit */}
      <group position={planetPosition}>
        {/* Atmosphere if temperature suggests it could have one */}
        {temperature < 2000 && (
          <Sphere ref={atmosphereRef} args={[radius * 1.1, 32, 32]}>
            <meshBasicMaterial
              color={planetColor}
              transparent
              opacity={0.3}
              side={THREE.BackSide}
            />
          </Sphere>
        )}

        {/* Main planet */}
        <Sphere
          ref={planetRef}
          args={[radius, 64, 64]}
          onPointerOver={(e) => {
            e.stopPropagation();
            setShowLabel(true);
            setHovered(true);
            document.body.style.cursor = planetData && onPlanetClick ? 'pointer' : 'default';
          }}
          onPointerOut={(e) => {
            e.stopPropagation();
            setShowLabel(false);
            setHovered(false);
            document.body.style.cursor = 'default';
          }}
          onClick={(e) => {
            e.stopPropagation();
            if (planetData && onPlanetClick) {
              onPlanetClick(planetData, uniqueId);
            }
          }}
        >
          <meshStandardMaterial
            map={texture}
            roughness={0.7}
            metalness={0.1}
            emissive={isSelected ? '#667eea' : hovered ? '#667eea' : '#000000'}
            emissiveIntensity={isSelected ? 0.5 : hovered ? 0.3 : 0}
          />
        </Sphere>

        {/* Glowing ring for selected or hovered planet */}
        {(isSelected || hovered) && (
          <group rotation={[Math.PI / 2 + 0.3, 0, 0]}>
            <mesh>
              <torusGeometry args={[radius * 1.5, radius * 0.05, 16, 100]} />
              <meshBasicMaterial
                color={isSelected ? '#667eea' : '#ffffff'}
                transparent
                opacity={0.6}
                toneMapped={false}
              />
            </mesh>
          </group>
        )}

        {/* Sparkles/particles around planet for extra flair */}
        {(isSelected || hovered) && (
          <>
            {[...Array(8)].map((_, i) => {
              const angle = (i / 8) * Math.PI * 2;
              const sparkleRadius = radius * 1.8;
              return (
                <mesh
                  key={i}
                  position={[
                    Math.cos(angle) * sparkleRadius,
                    Math.sin(angle * 1.2) * 0.3,
                    Math.sin(angle) * sparkleRadius
                  ]}
                >
                  <sphereGeometry args={[0.05, 8, 8]} />
                  <meshBasicMaterial
                    color={isSelected ? '#667eea' : '#ffffff'}
                    transparent
                    opacity={0.8}
                    toneMapped={false}
                  />
                </mesh>
              );
            })}
          </>
        )}

        {/* Label with distance from Earth - Enhanced Cosmic Tooltip */}
        {showLabel && (
          <Html distanceFactor={10}>
            <div className="relative group">
              {/* Glow effect background */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/30 via-pink-500/30 to-blue-500/30 rounded-xl blur-md"></div>

              {/* Main tooltip content */}
              <div className="relative bg-gradient-to-br from-gray-900/95 via-purple-900/90 to-gray-900/95 text-white px-4 py-3 rounded-xl text-xs whitespace-nowrap border-2 border-purple-500/50 pointer-events-none backdrop-blur-md shadow-2xl">
                {/* Planet name with gradient */}
                <div className="font-bold text-base bg-gradient-to-r from-purple-300 via-pink-300 to-blue-300 bg-clip-text text-transparent mb-1.5">
                  {name}
                </div>

                {/* Distance from Earth */}
                {(planetData?.sy_dist || planetData?.st_dist) && (
                  <div className="flex items-center gap-1.5 text-[11px] text-blue-200 mb-1 bg-blue-500/10 px-2 py-1 rounded-md">
                    <i className="fas fa-globe text-blue-400"></i>
                    <span>{(planetData.sy_dist || planetData.st_dist)?.toFixed(2)} parsecs from Earth</span>
                  </div>
                )}

                {/* Temperature and Radius */}
                <div className="flex items-center gap-3 text-[11px] mt-1">
                  <div className="flex items-center gap-1.5 bg-orange-500/10 px-2 py-1 rounded-md">
                    <i className="fas fa-thermometer-half text-orange-400"></i>
                    <span className="text-orange-200">{temperature.toFixed(0)}K</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-purple-500/10 px-2 py-1 rounded-md">
                    <i className="fas fa-circle text-purple-400"></i>
                    <span className="text-purple-200">{radius.toFixed(2)} R⊕</span>
                  </div>
                </div>

                {/* Decorative corner accents */}
                <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-purple-400 rounded-tl-lg"></div>
                <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-pink-400 rounded-br-lg"></div>
              </div>
            </div>
          </Html>
        )}
      </group>
    </group>
  );
}

// Main 3D Scene component
function Scene({ data, dataType, multipleData, onPlanetClick }: VisualizationProps) {
  const [selectedPlanetId, setSelectedPlanetId] = useState<string | undefined>();
  const [selectedStarIndex, setSelectedStarIndex] = useState<number>(0);
  const controlsRef = useRef<any>(null);

  // Normalize single planet data
  const normalizePlanetData = (planetData: ExoplanetData, type: 'kepler' | 'tess', index: number) => {
    if (type === 'kepler') {
      return {
        name: planetData.kepler_name || `KOI-${planetData.kepid}`,
        radius: planetData.koi_prad || 1,
        temperature: planetData.koi_teq || 300,
        orbitalPeriod: planetData.koi_period || 10,
        distance: planetData.koi_sma || 1,
        starRadius: planetData.koi_srad || 1,
        starTemp: planetData.koi_steff || 5778,
        id: planetData.kepid,
        uniqueId: `kepler-${planetData.kepid || index}`,
      };
    } else {
      // TESS data - normalize to match Kepler defaults for consistency
      const orbitalPeriod = planetData.pl_orbper || 10;
      const starMass = 1; // Assume solar mass if not provided

      // Kepler's 3rd law: a³ = (G * M * T²) / (4π²)
      // Simplified for solar masses and days: a(AU) ≈ (T(days)/365.25)^(2/3)
      const calculatedDistance = Math.pow(orbitalPeriod / 365.25, 2/3);

      return {
        name: planetData.pl_name || `TOI-${planetData.toi_id}`,
        radius: planetData.pl_rade || 1,
        temperature: planetData.pl_eqt || 300,
        orbitalPeriod: orbitalPeriod,
        distance: planetData.pl_orbsmax || calculatedDistance || 1,
        starRadius: planetData.st_rad || 1,
        starTemp: planetData.st_teff || 5778,
        id: planetData.tic_id,
        uniqueId: `tess-${planetData.tic_id || index}`,
      };
    }
  };

  // Handle multiple planets or single planet
  const planetsToRender = useMemo(() => {
    if (multipleData && multipleData.length > 0) {
      return multipleData.map((planet, index) => normalizePlanetData(planet, dataType, index));
    }
    return [normalizePlanetData(data, dataType, 0)];
  }, [data, dataType, multipleData]);

  // Calculate average star properties for single star system with controlled size
  const starSystem = useMemo(() => {
    const avgStarRadius = planetsToRender.reduce((sum, p) => sum + p.starRadius, 0) / planetsToRender.length;
    const avgStarTemp = planetsToRender.reduce((sum, p) => sum + p.starTemp, 0) / planetsToRender.length;

    // Calculate number of planets for adaptive star sizing
    const numPlanets = planetsToRender.length;

    // Calculate the largest planet radius to ensure star is always bigger
    const maxPlanetRadius = Math.max(...planetsToRender.map(p => p.radius));

    // Smart star sizing: ensure star is prominently larger than biggest planet
    let starVisualSize;
    if (numPlanets > 10) {
      // Many planets: star should still be larger than biggest planet
      starVisualSize = Math.min(avgStarRadius * 0.8, 2.5);
    } else if (numPlanets > 5) {
      // Several planets: moderately large star
      starVisualSize = Math.min(avgStarRadius * 1.0, 3.0);
    } else if (numPlanets > 1) {
      // Few planets: larger star
      starVisualSize = Math.min(avgStarRadius * 1.2, 3.5);
    } else {
      // Single planet: star can be very prominent
      starVisualSize = Math.min(avgStarRadius * 1.5, 4.0);
    }

    // Ensure star is at least 2x larger than the biggest planet (scaled)
    // The planet scaling is logarithmic, so we need to account for that
    const maxPlanetVisualSize = Math.log10(1 + maxPlanetRadius) * 0.22 * 3.5;
    const minStarSize = Math.max(maxPlanetVisualSize * 2.5, 1.5);
    starVisualSize = Math.max(starVisualSize, minStarSize);

    return [{
      starRadius: starVisualSize,
      starTemp: avgStarTemp,
      planets: planetsToRender,
      position: [0, 0, 0] as [number, number, number],
    }];
  }, [planetsToRender]);

  const starSystems = starSystem;

  // Calculate center point - either selected star or all systems
  const systemsCenter = useMemo(() => {
    if (starSystems.length === 0) {
      return [0, 0, 0] as [number, number, number];
    }

    // If a specific star is selected, center on it
    if (selectedStarIndex !== null && starSystems[selectedStarIndex]) {
      return starSystems[selectedStarIndex].position;
    }

    // Otherwise, center on first star (index 0)
    return starSystems[0].position;
  }, [starSystems, selectedStarIndex]);

  // Update controls target when star systems change
  useFrame(() => {
    if (controlsRef.current) {
      controlsRef.current.target.set(systemsCenter[0], systemsCenter[1], systemsCenter[2]);
      controlsRef.current.update();
    }
  });

  const handlePlanetClick = (planet: ExoplanetData, uniqueId: string) => {
    setSelectedPlanetId(uniqueId);
    if (onPlanetClick) {
      onPlanetClick(planet);
    }
  };

  const handleStarClick = (starIndex: number) => {
    console.log('⭐ Star clicked:', starIndex, 'Position:', starSystems[starIndex].position);
    setSelectedStarIndex(starIndex);
  };

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.3} />

      {/* Starfield */}
      <Stars radius={100} depth={50} count={5000} factor={4} fade speed={1} />

      {/* Render each star system */}
      {starSystems.map((system, systemIndex) => {
        const isMultiStar = starSystems.length > 1;

        return (
          <group key={systemIndex} position={system.position}>
            {/* Point light for this star */}
            <pointLight position={[0, 0, 0]} intensity={3} distance={50} />

            {/* Central Star */}
            <CentralStar
              radius={system.starRadius}
              temperature={system.starTemp}
              onClick={() => handleStarClick(systemIndex)}
              isSelected={selectedStarIndex === systemIndex}
            />

            {/* Star system label for multi-star systems */}
            {isMultiStar && (
              <Html position={[0, system.starRadius + 2, 0]} center>
                <div className="bg-gray-900/90 dark:bg-gray-900/90 text-white px-2 py-1 rounded text-[10px] whitespace-nowrap border border-indigo-500/50 pointer-events-none backdrop-blur-sm">
                  Star {systemIndex + 1} • {system.starTemp}K
                </div>
              </Html>
            )}

            {/* Planets orbiting this star */}
            {system.planets.map((planet, planetIndex) => {
              // Helper function: Logarithmic scaling for planet radius to handle extreme sizes (e.g., R=152)
              const scaleRadiusLogarithmically = (radius: number, numPlanets: number) => {
                // Use logarithmic scale: log10(1 + radius) to compress large values
                // This makes planets with R=152 much more manageable
                const logRadius = Math.log10(1 + radius);

                // Base scale factor depends on number of planets
                let baseScale;
                if (numPlanets > 10) {
                  baseScale = 0.15;  // Smaller for crowded systems
                } else if (numPlanets > 5) {
                  baseScale = 0.18;
                } else {
                  baseScale = 0.22;
                }

                // Apply logarithmic scaling
                // For reference:
                // - R=1 (Earth) => log10(2) * 0.22 ≈ 0.066
                // - R=11 (Jupiter) => log10(12) * 0.22 ≈ 0.238
                // - R=152 (huge) => log10(153) * 0.22 ≈ 0.484
                const scaledRadius = logRadius * baseScale * 3.5;

                // Enforce minimum and maximum sizes for visibility
                const minSize = numPlanets > 10 ? 0.15 : 0.2;
                const maxSize = 1.2; // Cap maximum visual size

                return Math.max(minSize, Math.min(maxSize, scaledRadius));
              };

              // Scale based on actual distance from star with smart spacing for many planets
              let visualScale;

              if (system.planets.length > 1 || isMultiStar) {
                // Multiple planets - use rank-based distribution for guaranteed separation
                const allDistances = system.planets.map(p => p.distance);
                const maxDistance = Math.max(...allDistances);
                const minDistance = Math.min(...allDistances);

                // Adjust visual range based on number of planets
                const numPlanets = system.planets.length;
                let minVisualDist = 8.0;  // Significantly increased to give star more space
                let maxVisualDist = 20;   // Increased for better spacing

                // For many planets, expand the range to avoid crowding
                if (numPlanets > 5) {
                  maxVisualDist = 24 + (numPlanets - 5) * 1.5; // Expand outward
                  minVisualDist = 9.0;  // Keep close planets even further
                }
                if (numPlanets > 10) {
                  maxVisualDist = 35; // Larger cap for many planets
                  minVisualDist = 10.0;  // Keep close planets well clear of star
                }

                // Sort planets by distance to determine ranking
                const sortedPlanets = system.planets
                  .map((p, idx) => ({ ...p, originalIndex: idx }))
                  .sort((a, b) => a.distance - b.distance);

                const currentPlanetInSorted = sortedPlanets.findIndex(p => p.originalIndex === planetIndex);

                // Check if planets are tightly clustered (ratio < 5x)
                const distanceRatio = maxDistance / Math.max(minDistance, 0.001);
                const isTightlyClusteredSystem = distanceRatio < 5;

                let visualDistance;

                if (isTightlyClusteredSystem) {
                  // For tightly clustered systems, use rank-based even spacing
                  // This ensures visible separation even when actual distances are similar
                  const rank = currentPlanetInSorted;
                  const totalRanks = sortedPlanets.length - 1;
                  const normalizedRank = totalRanks > 0 ? rank / totalRanks : 0;
                  visualDistance = minVisualDist + (normalizedRank * (maxVisualDist - minVisualDist));
                } else {
                  // For spread-out systems, use hybrid: logarithmic + rank-based
                  const logMin = Math.log10(Math.max(minDistance, 0.01));
                  const logMax = Math.log10(Math.max(maxDistance, 0.01));
                  const logCurrent = Math.log10(Math.max(planet.distance, 0.01));

                  const logNormalized = logMax > logMin
                    ? ((logCurrent - logMin) / (logMax - logMin))
                    : 0;

                  // Rank-based component for guaranteed spacing
                  const rank = currentPlanetInSorted;
                  const rankNormalized = (sortedPlanets.length - 1) > 0
                    ? rank / (sortedPlanets.length - 1)
                    : 0;

                  // Blend: 60% log-based (preserves relative distances), 40% rank-based (ensures separation)
                  const blendedNormalized = (logNormalized * 0.6) + (rankNormalized * 0.4);
                  visualDistance = minVisualDist + (blendedNormalized * (maxVisualDist - minVisualDist));
                }

                // Enforce minimum spacing between adjacent planets - increased for better visibility
                const minSpacing = numPlanets > 8 ? 2.5 : 3.0;
                if (currentPlanetInSorted > 0) {
                  // Get the previous planet's visual distance
                  const prevPlanet = sortedPlanets[currentPlanetInSorted - 1];
                  const prevIndex = system.planets.findIndex(p => p.originalIndex === prevPlanet.originalIndex);

                  // This is a recursive check, so we need to calculate prev planet's distance
                  // For simplicity, ensure at least minSpacing from theoretical previous position
                  const prevRank = currentPlanetInSorted - 1;
                  const prevNormalized = (sortedPlanets.length - 1) > 0
                    ? prevRank / (sortedPlanets.length - 1)
                    : 0;
                  const minPrevDistance = minVisualDist + (prevNormalized * (maxVisualDist - minVisualDist));

                  visualDistance = Math.max(visualDistance, minPrevDistance + minSpacing);
                }

                visualScale = {
                  planetRadius: scaleRadiusLogarithmically(planet.radius, numPlanets),
                  distance: visualDistance,
                };
              } else {
                // Single planet - use actual distance with scaling factor
                const actualDistance = planet.distance; // in AU

                // Scale factor: map typical distances (0.01-5 AU) to visual range (8-20)
                const minVisualDist = 8.0;   // Significantly increased to give star more space
                const maxVisualDist = 20;    // Increased for better spacing
                const logScale = Math.log10(Math.max(actualDistance, 0.01));
                const logMin = Math.log10(0.01); // ~0.001 AU
                const logMax = Math.log10(5);    // 5 AU

                const normalizedLog = Math.max(0, Math.min(1, (logScale - logMin) / (logMax - logMin)));
                const visualDistance = minVisualDist + (normalizedLog * (maxVisualDist - minVisualDist));

                visualScale = {
                  planetRadius: scaleRadiusLogarithmically(planet.radius, 1),
                  distance: visualDistance,
                };
              }

              // Find original planet data
              const originalIndex = planetsToRender.findIndex(p => p.uniqueId === planet.uniqueId);
              const originalPlanetData = multipleData && multipleData.length > 0 ? multipleData[originalIndex] : data;

              return (
                <ExoplanetModel
                  key={planet.uniqueId}
                  distance={visualScale.distance}
                  radius={visualScale.planetRadius}
                  temperature={planet.temperature}
                  orbitalPeriod={planet.orbitalPeriod}
                  name={planet.name}
                  planetData={originalPlanetData}
                  onPlanetClick={handlePlanetClick}
                  isSelected={selectedPlanetId === planet.uniqueId}
                  uniqueId={planet.uniqueId}
                  totalPlanets={system.planets.length}
                />
              );
            })}
          </group>
        );
      })}

      {/* Camera controls */}
      <OrbitControls
        ref={controlsRef}
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={2}
        maxDistance={starSystems.length > 1 ? 100 : 60}
        target={systemsCenter}
        makeDefault
      />
    </>
  );
}

// Information panel component
function InfoPanel({ data, dataType }: VisualizationProps) {
  const [viewMode, setViewMode] = useState<'kids' | 'researchers'>('kids');
  const isKepler = dataType === 'kepler';

  const info = isKepler ? {
    name: data.kepler_name || `KOI-${data.kepid}`,
    id: `Kepler ID: ${data.kepid}`,
    radius: `${data.koi_prad?.toFixed(2) || 'N/A'} R⊕`,
    temperature: `${data.koi_teq?.toFixed(0) || 'N/A'} K`,
    period: `${data.koi_period?.toFixed(2) || 'N/A'} days`,
    distance: `${data.koi_sma?.toFixed(3) || 'N/A'} AU`,
    insolation: `${data.koi_insol?.toFixed(2) || 'N/A'} S⊕`,
    disposition: data.koi_disposition || 'N/A',
  } : {
    name: data.pl_name || `TOI-${data.toi_id}`,
    id: `TIC ID: ${data.tic_id}`,
    radius: `${data.pl_rade?.toFixed(2) || 'N/A'} R⊕`,
    temperature: `${data.pl_eqt?.toFixed(0) || 'N/A'} K`,
    period: `${data.pl_orbper?.toFixed(2) || 'N/A'} days`,
    distance: `${data.pl_orbsmax?.toFixed(3) || 'N/A'} AU`,
    systemDistance: `${(data.sy_dist || data.st_dist)?.toFixed(2) || 'N/A'} pc`,
    starTemp: `${data.st_teff?.toFixed(0) || 'N/A'} K`,
  };

  // Determine habitability zone
  const temp = isKepler ? data.koi_teq : data.pl_eqt;
  const habitability = temp && temp >= 200 && temp <= 350 ? 'Potentially Habitable' : 'Outside Habitable Zone';

  // Kid-friendly descriptions
  const getKidFriendlySize = (radiusEarth: number | undefined) => {
    if (!radiusEarth) return "We're not sure how big it is yet!";
    if (radiusEarth < 0.5) return "Tiny! Much smaller than Earth 🌍";
    if (radiusEarth < 1.5) return "About the same size as Earth! 🌍";
    if (radiusEarth < 4) return "Bigger than Earth, like Neptune! 🔵";
    return "Huge! Bigger than Jupiter! 🪐";
  };

  const getKidFriendlyTemp = (tempK: number | undefined) => {
    if (!tempK) return "We don't know the temperature yet!";
    if (tempK < 100) return "Super freezing cold! ❄️ Colder than Antarctica!";
    if (tempK < 273) return "Very cold! Like a freezer! 🧊";
    if (tempK < 373) return "Nice and cozy! Like Earth! 🌡️";
    if (tempK < 600) return "Hot! Like a desert! 🌵";
    return "Super hot! Hotter than an oven! 🔥";
  };

  const getKidFriendlyPeriod = (days: number | undefined) => {
    if (!days) return "We're not sure how long its year is!";
    if (days < 1) return `Super fast! A year is less than a day! ⚡`;
    if (days < 30) return `Quick! A year is ${days.toFixed(1)} days! 📅`;
    if (days < 365) return `${days.toFixed(0)} days to go around its star! 🌟`;
    const years = (days / 365).toFixed(1);
    return `${years} Earth years to go around its star! 🌟`;
  };

  const getKidFriendlyDistance = (au: number | undefined) => {
    if (!au) return "We don't know how far it is from its star!";
    if (au < 0.1) return "Super close to its star! 🔥";
    if (au < 1) return "Closer to its star than Earth is to the Sun! ☀️";
    if (au < 3) return "Similar distance as Earth to the Sun! 🌍☀️";
    return "Really far from its star! 🌌";
  };

  const getKidFriendlyDistanceFromEarth = (parsecs: number | undefined) => {
    if (!parsecs) return "We don't know how far it is from Earth yet!";

    // Convert parsecs to light-years (1 parsec ≈ 3.26 light-years)
    const lightYears = parsecs * 3.26;

    if (lightYears < 10) {
      return `Super close! Only ${lightYears.toFixed(1)} light-years away! That's like our neighbor in space! 🏠`;
    }
    if (lightYears < 50) {
      return `Pretty close! About ${lightYears.toFixed(0)} light-years away. Light takes ${lightYears.toFixed(0)} years to reach us! 💫`;
    }
    if (lightYears < 200) {
      return `Far away! ${lightYears.toFixed(0)} light-years from Earth. If you traveled at light speed, it would take ${lightYears.toFixed(0)} years! 🚀`;
    }
    if (lightYears < 1000) {
      return `Really far! ${lightYears.toFixed(0)} light-years away! That's like crossing many, many neighborhoods in space! 🌌`;
    }
    return `Super duper far! ${lightYears.toFixed(0)} light-years away! Way across the galaxy! 🌠`;
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border-2 border-gray-300 dark:border-slate-700 shadow-xl">
      {/* Toggle Switch - Centered at top */}
      <div className="flex justify-center mb-4">
        <div className="relative inline-flex bg-gray-200 dark:bg-slate-700 rounded-full p-1 gap-0 shadow-inner">
          {/* Sliding background indicator - positioned absolutely behind buttons */}
          <div
            className={`absolute top-1 bottom-1 left-1 rounded-full transition-all duration-300 ease-in-out shadow-lg ${
              viewMode === 'kids' 
                ? 'bg-blue-500 dark:bg-blue-600 w-[88px]' 
                : 'bg-purple-500 dark:bg-purple-600 w-[126px] translate-x-[88px]'
            }`}
          />
          
          {/* Buttons - these define the layout */}
          <button
            onClick={() => setViewMode('kids')}
            className="relative z-10 px-4 py-1.5 text-xs font-semibold rounded-full transition-colors duration-200 w-[88px]"
          >
            <span className={`transition-colors duration-200 ${
              viewMode === 'kids'
                ? 'text-white'
                : 'text-gray-700 dark:text-gray-300'
            }`}>
              👶 Kids
            </span>
          </button>
          <button
            onClick={() => setViewMode('researchers')}
            className="relative z-10 px-4 py-1.5 text-xs font-semibold rounded-full transition-colors duration-200 w-[126px]"
          >
            <span className={`transition-colors duration-200 ${
              viewMode === 'researchers'
                ? 'text-white'
                : 'text-gray-700 dark:text-gray-300'
            }`}>
              👨‍🔬 Researcher
            </span>
          </button>
        </div>
      </div>

      {/* Planet Name - Centered with text overflow handling */}
      <div className="text-center mb-2">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white truncate px-2">{info.name}</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{info.id}</p>
      </div>

      {/* Kids Mode */}
      {viewMode === 'kids' && (
        <div className="space-y-3">
          <div className="bg-blue-50 dark:bg-blue-950/40 rounded-lg p-4 border border-blue-100 dark:border-blue-900/50">
            <p className="text-sm font-bold text-blue-900 dark:text-blue-300 mb-3">🌟 Meet this Planet!</p>
            
            <div className="space-y-3 text-sm text-gray-700 dark:text-gray-200">
              <div>
                <span className="font-semibold text-gray-800 dark:text-gray-100">How Big? </span>
                <p className="mt-1">{getKidFriendlySize(isKepler ? data.koi_prad : data.pl_rade)}</p>
              </div>
              
              <div>
                <span className="font-semibold text-gray-800 dark:text-gray-100">How Hot or Cold? </span>
                <p className="mt-1">{getKidFriendlyTemp(temp)}</p>
              </div>
              
              <div>
                <span className="font-semibold text-gray-800 dark:text-gray-100">How Long is a Year? </span>
                <p className="mt-1">{getKidFriendlyPeriod(isKepler ? data.koi_period : data.pl_orbper)}</p>
              </div>
              
              <div>
                <span className="font-semibold text-gray-800 dark:text-gray-100">How Far from its Star? </span>
                <p className="mt-1">{getKidFriendlyDistance(isKepler ? data.koi_sma : data.pl_orbsmax)}</p>
              </div>

              {!isKepler && (data.sy_dist || data.st_dist) && (
                <div>
                  <span className="font-semibold text-gray-800 dark:text-gray-100">How Far from Earth? 🌍</span>
                  <p className="mt-1">{getKidFriendlyDistanceFromEarth(data.sy_dist || data.st_dist || 0)}</p>
                </div>
              )}
            </div>
          </div>

          <div className={`rounded-lg p-4 border ${
            habitability === 'Potentially Habitable'
              ? 'bg-green-50 dark:bg-green-950/40 border-green-100 dark:border-green-900/50'
              : 'bg-gray-50 dark:bg-slate-800/50 border-gray-100 dark:border-slate-700'
          }`}>
            <p className={`text-sm font-bold mb-1 ${
              habitability === 'Potentially Habitable' 
                ? 'text-green-900 dark:text-green-300' 
                : 'text-gray-900 dark:text-gray-200'
            }`}>
              {habitability === 'Potentially Habitable' ? '🌱 Could Life Exist Here?' : '❄️🔥 Too Hot or Cold for Life'}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-300">
              {habitability === 'Potentially Habitable' 
                ? 'This planet might be just the right temperature for liquid water - like Earth!'
                : 'This planet is probably too hot or too cold for life as we know it.'}
            </p>
          </div>

          <div className="text-xs text-gray-500 dark:text-gray-400 italic bg-gray-50 dark:bg-slate-800/30 rounded p-2 border border-gray-200 dark:border-slate-700/50">
            <p>💡 Fun Fact: You can use your mouse to spin and zoom around the solar system!</p>
          </div>
        </div>
      )}

      {/* Researcher Mode */}
      {viewMode === 'researchers' && (
        <div className="space-y-3">
          <div className="bg-purple-50 dark:bg-purple-950/40 rounded-lg p-4 border border-purple-100 dark:border-purple-900/50">
            <p className="text-sm font-bold text-purple-900 dark:text-purple-300 mb-3">📊 Scientific Data</p>
            
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-600 dark:text-gray-300 text-xs">Radius:</span>
                <p className="font-semibold text-gray-900 dark:text-white mt-0.5">{info.radius}</p>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-300 text-xs">Temperature:</span>
                <p className="font-semibold text-gray-900 dark:text-white mt-0.5">{info.temperature}</p>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-300 text-xs">Orbital Period:</span>
                <p className="font-semibold text-gray-900 dark:text-white mt-0.5">{info.period}</p>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-300 text-xs">Semi-major Axis:</span>
                <p className="font-semibold text-gray-900 dark:text-white mt-0.5">{info.distance}</p>
              </div>
              {isKepler ? (
                <>
                  <div>
                    <span className="text-gray-600 dark:text-gray-300 text-xs">Insolation Flux:</span>
                    <p className="font-semibold text-gray-900 dark:text-white mt-0.5">{info.insolation}</p>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-300 text-xs">Disposition:</span>
                    <p className="font-semibold text-gray-900 dark:text-white mt-0.5">{info.disposition}</p>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <span className="text-gray-600 dark:text-gray-300 text-xs">System Distance:</span>
                    <p className="font-semibold text-gray-900 dark:text-white mt-0.5">{info.systemDistance}</p>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-300 text-xs">Stellar T<sub>eff</sub>:</span>
                    <p className="font-semibold text-gray-900 dark:text-white mt-0.5">{info.starTemp}</p>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="pt-3 border-t-2 border-gray-200 dark:border-slate-700">
            <div className={`inline-block px-3 py-1.5 rounded-full text-xs font-medium shadow-sm ${
              habitability === 'Potentially Habitable'
                ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 border border-green-200 dark:border-green-800'
                : 'bg-gray-100 text-gray-800 dark:bg-slate-700 dark:text-gray-200 border border-gray-200 dark:border-slate-600'
            }`}>
              {habitability}
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-300 mt-2 leading-relaxed">
              {habitability === 'Potentially Habitable'
                ? 'Equilibrium temperature falls within conservative habitable zone (200-350 K)'
                : 'Equilibrium temperature outside conservative habitable zone parameters'}
            </p>
          </div>

          <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-slate-800/30 rounded p-2 border border-gray-200 dark:border-slate-700/50">
            <p>💡 Use mouse controls: rotate, zoom, and pan to explore orbital mechanics</p>
          </div>
        </div>
      )}
    </div>
  );
}

// Main exported component
export default function ExoplanetVisualization3D({ data, dataType, multipleData, onPlanetClick }: VisualizationProps) {
  const [selectedPlanet, setSelectedPlanet] = useState<ExoplanetData>(data);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handlePlanetClick = (planet: ExoplanetData) => {
    setSelectedPlanet(planet);
    if (onPlanetClick) {
      onPlanetClick(planet);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Listen for fullscreen changes
  useMemo(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const displayData = selectedPlanet || data;
  const isMultiple = multipleData && multipleData.length > 1;
  const planetCount = multipleData ? multipleData.length : 1;

  // Calculate appropriate camera position based on number of planets
  // More planets = pull camera back further
  // Increased distances to account for larger star and better scaled planets
  const calculateCameraPosition = (): [number, number, number] => {
    if (!isMultiple) return [0, 5, 16]; // Increased from [0, 3, 12]

    if (planetCount > 10) return [0, 40, 55]; // Increased for many planets
    if (planetCount > 5) return [0, 30, 45];  // Increased for several planets
    return [0, 25, 40]; // Increased for few planets
  };

  const cameraPosition = calculateCameraPosition();

  return (
    <div ref={containerRef} className={`${isFullscreen ? 'fixed inset-0 z-50 bg-gray-900' : 'grid grid-cols-1 lg:grid-cols-3 gap-6'}`}>
      {/* 3D Canvas */}
      <div className={isFullscreen ? 'w-full h-full' : 'lg:col-span-2'}>
        <div className={`bg-gray-900 dark:bg-gray-900 rounded-lg overflow-hidden border border-gray-300 dark:border-gray-700 relative ${isFullscreen ? 'h-full rounded-none border-0' : 'h-[500px]'}`}>
          {/* Fullscreen Toggle Button */}
          <button
            onClick={toggleFullscreen}
            className="absolute top-4 right-4 z-10 bg-gray-800/80 hover:bg-gray-700/90 text-white p-2 rounded-lg backdrop-blur-sm transition-all duration-200 border border-gray-600/50 hover:border-indigo-500/50"
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          >
            {isFullscreen ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
            )}
          </button>

          <Canvas camera={{ position: cameraPosition, fov: 60, near: 0.1, far: 1000 }}>
            <Scene
              data={data}
              dataType={dataType}
              multipleData={multipleData}
              onPlanetClick={handlePlanetClick}
            />
          </Canvas>
        </div>
        {isMultiple && !isFullscreen && (
          <div className="mt-2 space-y-2">
            <div className="text-sm text-gray-700 dark:text-gray-400 text-center bg-gray-100 dark:bg-gray-800 rounded-lg p-3 border border-gray-300 dark:border-gray-700">
              <div className="flex items-center justify-center gap-2 mb-2">
                <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                </svg>
                <span className="font-semibold">💡 Click on any planet to view its details • Showing {multipleData.length} exoplanets</span>
              </div>
            </div>
            {/* Color legend */}
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 border border-gray-300 dark:border-gray-700">
              <div className="text-xs text-gray-800 dark:text-gray-300 font-semibold mb-2 text-center">Orbit Color Legend</div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-1 rounded bg-[#5ab85a]"></div>
                  <span className="text-gray-600 dark:text-gray-400">Habitable Zone</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-1 rounded bg-[#ff6b4a]"></div>
                  <span className="text-gray-600 dark:text-gray-400">Hot Planet</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-1 rounded bg-[#87ceeb]"></div>
                  <span className="text-gray-600 dark:text-gray-400">Cold/Ice</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-1 rounded bg-[#667eea]"></div>
                  <span className="text-gray-600 dark:text-gray-400">Other</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Info Panel - Fixed position when in fullscreen (center-right side) */}
      <div className={isFullscreen 
        ? 'fixed top-1/2 -translate-y-1/2 right-4 z-20 w-full max-w-sm' 
        : 'lg:col-span-1'
      }>
        <InfoPanel data={displayData} dataType={dataType} />
      </div>

      {/* Fullscreen Legend */}
      {isFullscreen && isMultiple && (
        <div className="fixed bottom-4 left-4 z-20 max-w-md">
          <div className="bg-gray-800/90 backdrop-blur-md rounded-lg p-3 border border-gray-600/50">
            <div className="text-xs text-gray-200 font-semibold mb-2">Orbit Color Legend</div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-6 h-1 rounded bg-[#5ab85a]"></div>
                <span className="text-gray-300">Habitable</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-1 rounded bg-[#ff6b4a]"></div>
                <span className="text-gray-300">Hot</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-1 rounded bg-[#87ceeb]"></div>
                <span className="text-gray-300">Cold</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-1 rounded bg-[#667eea]"></div>
                <span className="text-gray-300">Other</span>
              </div>
            </div>
          </div>
          <div className="mt-2 bg-gray-800/90 backdrop-blur-md rounded-lg p-3 border border-gray-600/50">
            <div className="text-xs text-gray-200 flex items-center gap-2">
              <svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
              </svg>
              <span>Showing {multipleData.length} exoplanets • Click planets for details</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
