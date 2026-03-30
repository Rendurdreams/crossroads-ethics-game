import { useRef, useMemo, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Stars } from '@react-three/drei'
import * as THREE from 'three'

// ── Building component ────────────────────────────────────────────────────

function Building({ position, width, height, depth, windowLit = 1.0 }) {
  const meshRef = useRef()
  const windowsRef = useRef()

  const windowGeometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    const positions = []
    const cols = Math.floor(width * 3)
    const rows = Math.floor(height * 2)
    const spacing = 0.3
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (Math.random() > 0.6) continue // random windows
        const x = (c - cols / 2) * spacing + spacing / 2
        const y = r * spacing + 0.3
        const z = depth / 2 + 0.02
        // Quad as two triangles
        const s = 0.08
        positions.push(
          x - s, y - s, z,  x + s, y - s, z,  x + s, y + s, z,
          x - s, y - s, z,  x + s, y + s, z,  x - s, y + s, z
        )
      }
    }
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    return geo
  }, [width, height, depth])

  useFrame((state) => {
    if (windowsRef.current) {
      const pulse = Math.sin(state.clock.elapsedTime * 0.5 + position[0]) * 0.1
      windowsRef.current.material.opacity = Math.max(0.1, windowLit + pulse)
    }
  })

  return (
    <group position={position}>
      <mesh ref={meshRef} castShadow receiveShadow>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial
          color="#0d0d1a"
          roughness={0.8}
          metalness={0.2}
        />
      </mesh>
      {/* Building top edge glow */}
      <mesh position={[0, height / 2, 0]}>
        <boxGeometry args={[width + 0.05, 0.03, depth + 0.05]} />
        <meshBasicMaterial color="#1a1a3a" transparent opacity={0.6} />
      </mesh>
      {/* Windows */}
      <mesh ref={windowsRef} position={[0, -height / 2, 0]} geometry={windowGeometry}>
        <meshBasicMaterial
          color="#f5c542"
          transparent
          opacity={windowLit}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  )
}

// ── Bridge component ──────────────────────────────────────────────────────

function Bridge({ trust = 50 }) {
  const cableRef = useRef()
  const t = trust / 100

  const cablePoints = useMemo(() => {
    const points = []
    const sag = 1.5 - t * 1.2
    for (let i = 0; i <= 20; i++) {
      const x = -6 + (i / 20) * 12
      const y = -0.5 + Math.sin((i / 20) * Math.PI) * -sag
      points.push(new THREE.Vector3(x, y, 8))
    }
    return new THREE.BufferGeometry().setFromPoints(points)
  }, [t])

  return (
    <group>
      {/* Bridge deck */}
      <mesh position={[0, -1.2, 8]}>
        <boxGeometry args={[12, 0.15, 0.8]} />
        <meshStandardMaterial
          color="#1a1a2e"
          emissive={new THREE.Color('#f59e0b')}
          emissiveIntensity={t * 0.15}
        />
      </mesh>
      {/* Towers */}
      <mesh position={[-4, 0.5, 8]}>
        <boxGeometry args={[0.3, 3.5, 0.3]} />
        <meshStandardMaterial color="#1a1a2e" metalness={0.5} roughness={0.5} />
      </mesh>
      <mesh position={[4, 0.5, 8]}>
        <boxGeometry args={[0.3, 3.5, 0.3]} />
        <meshStandardMaterial color="#1a1a2e" metalness={0.5} roughness={0.5} />
      </mesh>
      {/* Cables */}
      <line ref={cableRef} geometry={cablePoints}>
        <lineBasicMaterial
          color={t > 0.3 ? '#f59e0b' : '#ef4444'}
          transparent
          opacity={0.4 + t * 0.5}
        />
      </line>
      {/* Bridge lights */}
      {t > 0.3 && (
        <>
          <pointLight position={[-3, -0.8, 8]} color="#f59e0b" intensity={t * 2} distance={3} />
          <pointLight position={[0, -0.8, 8]} color="#f59e0b" intensity={t * 2} distance={3} />
          <pointLight position={[3, -0.8, 8]} color="#f59e0b" intensity={t * 2} distance={3} />
        </>
      )}
    </group>
  )
}

// ── Lighthouse component ──────────────────────────────────────────────────

function Lighthouse({ courage = 50 }) {
  const beamRef = useRef()
  const c = courage / 100

  useFrame((state) => {
    if (beamRef.current) {
      const speed = 0.3 + c * 0.7
      beamRef.current.rotation.y = state.clock.elapsedTime * speed
    }
  })

  return (
    <group position={[10, 0, 4]}>
      {/* Base */}
      <mesh position={[0, 1.5, 0]}>
        <cylinderGeometry args={[0.4, 0.6, 3, 8]} />
        <meshStandardMaterial color="#1a1a2e" />
      </mesh>
      {/* Light housing */}
      <mesh position={[0, 3.2, 0]}>
        <cylinderGeometry args={[0.35, 0.35, 0.5, 8]} />
        <meshBasicMaterial
          color="#f59e0b"
          transparent
          opacity={c > 0.2 ? 0.8 : 0.1}
        />
      </mesh>
      {/* Rotating beam */}
      {c > 0.2 && (
        <group ref={beamRef} position={[0, 3.2, 0]}>
          <spotLight
            position={[0, 0, 0]}
            target-position={[15, 0, 0]}
            color="#f5c542"
            intensity={c * 50}
            angle={0.15}
            penumbra={0.5}
            distance={20}
          />
          <pointLight color="#f5c542" intensity={c * 3} distance={5} />
        </group>
      )}
    </group>
  )
}

// ── Water plane ───────────────────────────────────────────────────────────

function Water() {
  const ref = useRef()
  useFrame((state) => {
    if (ref.current) {
      ref.current.position.y = -2 + Math.sin(state.clock.elapsedTime * 0.3) * 0.05
    }
  })
  return (
    <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
      <planeGeometry args={[80, 80]} />
      <meshStandardMaterial
        color="#050510"
        transparent
        opacity={0.9}
        metalness={0.9}
        roughness={0.1}
      />
    </mesh>
  )
}

// ── Ground plane ──────────────────────────────────────────────────────────

function Ground() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
      <planeGeometry args={[40, 30]} />
      <meshStandardMaterial color="#08080f" roughness={1} />
    </mesh>
  )
}

// ── Fog controller ────────────────────────────────────────────────────────

function FogController({ awareness = 50 }) {
  const { scene } = useThree()
  useEffect(() => {
    const density = 0.015 + (1 - awareness / 100) * 0.04
    scene.fog = new THREE.FogExp2('#0a0a14', density)
    return () => { scene.fog = null }
  }, [awareness, scene])
  return null
}

// ── Auto-rotate camera ───────────────────────────────────────────────────

function CameraRig() {
  const controlsRef = useRef()
  useFrame(() => {
    if (controlsRef.current) {
      controlsRef.current.autoRotate = true
      controlsRef.current.autoRotateSpeed = 0.3
      controlsRef.current.update()
    }
  })
  return (
    <OrbitControls
      ref={controlsRef}
      enableZoom={true}
      enablePan={false}
      minPolarAngle={Math.PI / 6}
      maxPolarAngle={Math.PI / 2.5}
      minDistance={8}
      maxDistance={30}
      target={[0, 2, 0]}
    />
  )
}

// ── City buildings layout ─────────────────────────────────────────────────

function CityBuildings({ solidarity = 50 }) {
  const lit = solidarity / 100

  const buildings = useMemo(() => [
    // Left cluster
    { pos: [-8, 2, -3], w: 1.8, h: 4, d: 1.8 },
    { pos: [-6, 3.5, -2], w: 1.5, h: 7, d: 1.5 },
    { pos: [-5, 1.5, 0], w: 2, h: 3, d: 2 },
    { pos: [-7, 2.5, 1], w: 1.2, h: 5, d: 1.2 },
    // Center cluster (tallest)
    { pos: [-2, 5, -2], w: 2, h: 10, d: 2 },
    { pos: [0, 4, -1], w: 2.5, h: 8, d: 2 },
    { pos: [1, 3, 1], w: 1.8, h: 6, d: 1.8 },
    { pos: [-1, 2.5, 2], w: 1.5, h: 5, d: 1.5 },
    { pos: [2.5, 3.5, -2], w: 1.6, h: 7, d: 1.6 },
    // Right cluster
    { pos: [5, 2, -1], w: 2, h: 4, d: 2 },
    { pos: [6.5, 3, 0], w: 1.5, h: 6, d: 1.5 },
    { pos: [7, 1.5, 2], w: 2.2, h: 3, d: 2.2 },
    { pos: [8, 4, -2], w: 1.3, h: 8, d: 1.3 },
    // Background
    { pos: [-4, 2, -6], w: 2.5, h: 4, d: 1.5 },
    { pos: [3, 3, -6], w: 2, h: 6, d: 1.5 },
    { pos: [0, 2.5, -7], w: 3, h: 5, d: 1 },
  ], [])

  return (
    <>
      {buildings.map((b, i) => (
        <Building
          key={i}
          position={b.pos}
          width={b.w}
          height={b.h}
          depth={b.d}
          windowLit={lit}
        />
      ))}
    </>
  )
}

// ── Particles (ambient) ──────────────────────────────────────────────────

function Particles() {
  const ref = useRef()
  const count = 200

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 40
      arr[i * 3 + 1] = Math.random() * 15
      arr[i * 3 + 2] = (Math.random() - 0.5) * 40
    }
    return arr
  }, [])

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.01
      const posAttr = ref.current.geometry.attributes.position
      for (let i = 0; i < count; i++) {
        posAttr.array[i * 3 + 1] += Math.sin(state.clock.elapsedTime + i) * 0.002
      }
      posAttr.needsUpdate = true
    }
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#f59e0b"
        size={0.05}
        transparent
        opacity={0.4}
        sizeAttenuation
      />
    </points>
  )
}

// ── Main CityScene ────────────────────────────────────────────────────────

export default function CityScene({ worldState }) {
  const trust = worldState?.trust ?? 50
  const courage = worldState?.courage ?? 50
  const solidarity = worldState?.solidarity ?? 50
  const awareness = worldState?.awareness ?? 50

  return (
    <Canvas
      camera={{ position: [12, 8, 15], fov: 50 }}
      gl={{ antialias: true, alpha: false }}
      style={{ background: '#050510' }}
      shadows
    >
      <FogController awareness={awareness} />

      {/* Ambient and directional lighting */}
      <ambientLight intensity={0.08} color="#4a4a6a" />
      <directionalLight
        position={[10, 15, 5]}
        intensity={0.3}
        color="#6a6a8a"
        castShadow
      />
      {/* Warm underlight from city */}
      <pointLight position={[0, -1, 0]} color="#f59e0b" intensity={0.5} distance={20} />

      <Stars radius={50} depth={50} count={2000} factor={3} saturation={0} fade speed={0.5} />

      <CityBuildings solidarity={solidarity} />
      <Bridge trust={trust} />
      <Lighthouse courage={courage} />
      <Water />
      <Ground />
      <Particles />

      <CameraRig />
    </Canvas>
  )
}
