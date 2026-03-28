import { useRef, useMemo, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Stars, useGLTF } from '@react-three/drei'
import * as THREE from 'three'

// ── Preload all models at module level (prevents Suspense waterfall in React 19) ──
useGLTF.preload('/models/bridge.glb')
useGLTF.preload('/models/beacon-tower.glb')
useGLTF.preload('/models/village-cluster.glb')
useGLTF.preload('/models/terrain.glb')

// ── Bridge of Accord (trust landmark) ────────────────────────────────────

function Bridge({ trust = 50 }) {
  const { nodes, materials } = useGLTF('/models/bridge.glb')
  const t = trust / 100
  const emissiveRef = useRef()
  const targetEmissiveRef = useRef(t)

  useEffect(() => {
    targetEmissiveRef.current = t
  }, [t])

  useFrame((_, delta) => {
    if (emissiveRef.current) {
      emissiveRef.current.emissiveIntensity = THREE.MathUtils.lerp(
        emissiveRef.current.emissiveIntensity,
        targetEmissiveRef.current * 1.8,
        delta * 1.5
      )
    }
  })

  const bridgeMat = useMemo(() => {
    const mat = materials['bridge_stone']?.clone() ?? new THREE.MeshStandardMaterial()
    mat.color = new THREE.Color(0x4a4a5a)
    mat.emissive = new THREE.Color('#f59e0b')
    mat.emissiveIntensity = t * 1.8
    mat.roughness = 0.85
    mat.metalness = 0.15
    emissiveRef.current = mat
    return mat
  }, [materials]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <group position={[0, -0.3, 3]} rotation={[0, 0, 0]}>
      {/* GLTF base mesh — bridge deck */}
      <primitive
        object={nodes['bridge_deck']}
        material={bridgeMat}
        scale={[1, 1, 1]}
      />

      {/* Stone arch supports */}
      <mesh position={[-2.2, 0.6, 0]} castShadow>
        <boxGeometry args={[0.5, 1.4, 1.4]} />
        <meshStandardMaterial color="#3a3a4a" roughness={0.9} />
      </mesh>
      <mesh position={[2.2, 0.6, 0]} castShadow>
        <boxGeometry args={[0.5, 1.4, 1.4]} />
        <meshStandardMaterial color="#3a3a4a" roughness={0.9} />
      </mesh>

      {/* Tall gate towers */}
      <mesh position={[-2.5, 2.2, 0]} castShadow>
        <boxGeometry args={[0.55, 3.0, 0.55]} />
        <meshStandardMaterial color="#2a2a3a" roughness={0.85} />
      </mesh>
      <mesh position={[2.5, 2.2, 0]} castShadow>
        <boxGeometry args={[0.55, 3.0, 0.55]} />
        <meshStandardMaterial color="#2a2a3a" roughness={0.85} />
      </mesh>

      {/* Lantern glow orbs on towers */}
      <mesh position={[-2.5, 3.9, 0]}>
        <sphereGeometry args={[0.2, 8, 8]} />
        <meshStandardMaterial
          color="#f59e0b"
          emissive={new THREE.Color('#f59e0b')}
          emissiveIntensity={t * 2.5}
          roughness={0.1}
        />
      </mesh>
      <mesh position={[2.5, 3.9, 0]}>
        <sphereGeometry args={[0.2, 8, 8]} />
        <meshStandardMaterial
          color="#f59e0b"
          emissive={new THREE.Color('#f59e0b')}
          emissiveIntensity={t * 2.5}
          roughness={0.1}
        />
      </mesh>

      {/* Handrail posts */}
      {[-2.0, -1.0, 0, 1.0, 2.0].map((x, i) => (
        <mesh key={i} position={[x, 0.5, 0.55]}>
          <cylinderGeometry args={[0.04, 0.04, 0.9, 6]} />
          <meshStandardMaterial color="#1a1a2e" />
        </mesh>
      ))}
      {[-2.0, -1.0, 0, 1.0, 2.0].map((x, i) => (
        <mesh key={i} position={[x, 0.5, -0.55]}>
          <cylinderGeometry args={[0.04, 0.04, 0.9, 6]} />
          <meshStandardMaterial color="#1a1a2e" />
        </mesh>
      ))}

      {/* Bridge point lights (amber glow, intensity driven by trust) */}
      {t > 0.2 && (
        <>
          <pointLight position={[-2.0, 0.8, 0]} color="#f59e0b" intensity={t * 3} distance={5} />
          <pointLight position={[0, 0.8, 0]} color="#f59e0b" intensity={t * 2} distance={4} />
          <pointLight position={[2.0, 0.8, 0]} color="#f59e0b" intensity={t * 3} distance={5} />
        </>
      )}
    </group>
  )
}

// ── Citadel Beacon (courage landmark) ────────────────────────────────────

function BeaconTower({ courage = 50 }) {
  const { nodes, materials } = useGLTF('/models/beacon-tower.glb')
  const beamRef = useRef()
  const lightRef = useRef()
  const c = courage / 100
  const targetIntensityRef = useRef(c)

  useEffect(() => {
    targetIntensityRef.current = c
  }, [c])

  useFrame((state, delta) => {
    // Rotate beacon beam
    if (beamRef.current) {
      const speed = 0.3 + c * 0.8
      beamRef.current.rotation.y += delta * speed
    }
    // Lerp light intensity
    if (lightRef.current) {
      lightRef.current.intensity = THREE.MathUtils.lerp(
        lightRef.current.intensity,
        targetIntensityRef.current * 55,
        delta * 2
      )
    }
  })

  const towerMat = useMemo(() => {
    const mat = materials['tower_stone']?.clone() ?? new THREE.MeshStandardMaterial()
    mat.color = new THREE.Color(0x3a3a4a)
    mat.roughness = 0.85
    mat.metalness = 0.15
    return mat
  }, [materials])

  return (
    <group position={[8, 0, -2]}>
      {/* GLTF base tower shaft */}
      <primitive
        object={nodes['tower_shaft']}
        material={towerMat}
        position={[0, 0, 0]}
      />

      {/* Stone base widener */}
      <mesh position={[0, 0.35, 0]} castShadow>
        <cylinderGeometry args={[0.9, 1.1, 0.7, 8]} />
        <meshStandardMaterial color="#2a2a3a" roughness={0.9} />
      </mesh>

      {/* Tower shaft (rendered on top of GLTF base) */}
      <mesh position={[0, 3.1, 0]} castShadow>
        <cylinderGeometry args={[0.55, 0.75, 4.8, 8]} />
        <meshStandardMaterial color="#2a2a3a" roughness={0.85} metalness={0.1} />
      </mesh>

      {/* Battlements */}
      <mesh position={[0, 5.6, 0]}>
        <cylinderGeometry args={[0.72, 0.65, 0.5, 8]} />
        <meshStandardMaterial color="#1e1e2e" roughness={0.9} />
      </mesh>
      {[0, 1, 2, 3, 4, 5, 6, 7].map(i => {
        const angle = (i / 8) * Math.PI * 2
        return (
          <mesh key={i} position={[Math.cos(angle) * 0.68, 6.1, Math.sin(angle) * 0.68]}>
            <boxGeometry args={[0.22, 0.4, 0.22]} />
            <meshStandardMaterial color="#1e1e2e" roughness={0.9} />
          </mesh>
        )
      })}

      {/* Beacon housing */}
      <mesh position={[0, 6.3, 0]}>
        <cylinderGeometry args={[0.42, 0.48, 0.75, 8]} />
        <meshStandardMaterial
          color="#f59e0b"
          emissive={new THREE.Color('#f59e0b')}
          emissiveIntensity={c > 0.2 ? c * 2.5 : 0.1}
          roughness={0.1}
          metalness={0.6}
          transparent
          opacity={0.85}
        />
      </mesh>

      {/* Conical roof */}
      <mesh position={[0, 7.15, 0]}>
        <coneGeometry args={[0.58, 1.1, 8]} />
        <meshStandardMaterial color="#1a0a2a" roughness={0.7} metalness={0.3} />
      </mesh>

      {/* Rotating beacon beam */}
      {c > 0.15 && (
        <group ref={beamRef} position={[0, 6.3, 0]}>
          <spotLight
            ref={lightRef}
            color="#f5c542"
            intensity={c * 55}
            angle={0.12}
            penumbra={0.6}
            distance={30}
            position={[0, 0, 0]}
          />
          <pointLight color="#f5c542" intensity={c * 4} distance={8} />
        </group>
      )}
    </group>
  )
}

// ── Village Quarter (solidarity landmark) ─────────────────────────────────

function VillageQuarter({ solidarity = 50 }) {
  const { nodes, materials } = useGLTF('/models/village-cluster.glb')
  const s = solidarity / 100
  const windowEmissiveRef = useRef(s)
  const windowMatsRef = useRef([])
  const targetWindowRef = useRef(s)

  useEffect(() => {
    targetWindowRef.current = s
  }, [s])

  useFrame((_, delta) => {
    windowMatsRef.current.forEach(mat => {
      if (mat) {
        mat.emissiveIntensity = THREE.MathUtils.lerp(
          mat.emissiveIntensity,
          targetWindowRef.current * 2.2,
          delta * 1.5
        )
      }
    })
  })

  const wallMat = useMemo(() => {
    const mat = materials['village_wall']?.clone() ?? new THREE.MeshStandardMaterial()
    mat.color = new THREE.Color(0x5a4a3a)
    mat.roughness = 0.9
    mat.metalness = 0.05
    return mat
  }, [materials])

  const windowMat = useMemo(() => {
    const mat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#f59e0b'),
      emissive: new THREE.Color('#f59e0b'),
      emissiveIntensity: s * 2.2,
      roughness: 0.1,
    })
    windowEmissiveRef.current = mat.emissiveIntensity
    return mat
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const roofMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: new THREE.Color(0x6a2a1a),
    roughness: 0.85,
  }), [])

  // Register window material for useFrame lerp
  useEffect(() => {
    windowMatsRef.current = [windowMat]
  }, [windowMat])

  return (
    <group position={[-7, 0, 1]}>
      {/* GLTF base hut mesh */}
      <primitive
        object={nodes['hut_wall_0']}
        material={wallMat}
        position={[0, 0, 0]}
        scale={[1, 1, 1]}
      />

      {/* Main hall */}
      <mesh position={[0, 0.85, 0]} castShadow>
        <boxGeometry args={[2.2, 1.6, 2.0]} />
        <meshStandardMaterial color="#4a3a2a" roughness={0.9} />
      </mesh>
      <mesh position={[0, 2.1, 0]} castShadow>
        <coneGeometry args={[1.7, 1.2, 4]} rotation={[0, Math.PI/4, 0]} />
        <primitive object={roofMat} attach="material" />
      </mesh>

      {/* Left hut */}
      <mesh position={[-2.3, 0.6, 0.4]} castShadow>
        <boxGeometry args={[1.5, 1.1, 1.4]} />
        <meshStandardMaterial color="#4a3a2a" roughness={0.9} />
      </mesh>
      <mesh position={[-2.3, 1.5, 0.4]}>
        <coneGeometry args={[1.2, 0.9, 4]} />
        <primitive object={roofMat} attach="material" />
      </mesh>

      {/* Right hut */}
      <mesh position={[2.2, 0.6, 0.3]} castShadow>
        <boxGeometry args={[1.4, 1.0, 1.3]} />
        <meshStandardMaterial color="#4a3a2a" roughness={0.9} />
      </mesh>
      <mesh position={[2.2, 1.35, 0.3]}>
        <coneGeometry args={[1.1, 0.85, 4]} />
        <primitive object={roofMat} attach="material" />
      </mesh>

      {/* Back hut */}
      <mesh position={[0.5, 0.55, -2.0]} castShadow>
        <boxGeometry args={[1.3, 0.95, 1.2]} />
        <meshStandardMaterial color="#4a3a2a" roughness={0.9} />
      </mesh>
      <mesh position={[0.5, 1.3, -2.0]}>
        <coneGeometry args={[1.05, 0.8, 4]} />
        <primitive object={roofMat} attach="material" />
      </mesh>

      {/* Windows (amber glow, driven by solidarity) */}
      <mesh position={[0, 0.9, 1.02]}>
        <boxGeometry args={[0.45, 0.4, 0.04]} />
        <primitive object={windowMat} attach="material" />
      </mesh>
      <mesh position={[-2.3, 0.6, 1.01]}>
        <boxGeometry args={[0.35, 0.3, 0.04]} />
        <primitive object={windowMat} attach="material" />
      </mesh>
      <mesh position={[2.2, 0.62, 0.96]}>
        <boxGeometry args={[0.32, 0.28, 0.04]} />
        <primitive object={windowMat} attach="material" />
      </mesh>

      {/* Village well */}
      <mesh position={[1.3, 0.3, 1.6]}>
        <cylinderGeometry args={[0.28, 0.32, 0.55, 8]} />
        <meshStandardMaterial color="#3a3a3a" roughness={0.9} />
      </mesh>

      {/* Ambient village light */}
      {s > 0.15 && (
        <pointLight position={[0, 1.5, 1]} color="#f59e0b" intensity={s * 4} distance={8} />
      )}
    </group>
  )
}

// ── Ground and terrain ───────────────────────────────────────────────────

function Ground() {
  const { nodes } = useGLTF('/models/terrain.glb')

  return (
    <group>
      {/* GLTF terrain base */}
      <primitive
        object={nodes['terrain_ground_plane']}
        position={[0, -0.5, 0]}
        scale={[1, 1, 1]}
      />

      {/* Ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.45, 0]} receiveShadow>
        <planeGeometry args={[50, 35]} />
        <meshStandardMaterial color="#0a0f0a" roughness={1} />
      </mesh>

      {/* Rolling hills (elevation around the landmarks) */}
      <mesh position={[-10, -0.5, -3]}>
        <sphereGeometry args={[3.5, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#0c120c" roughness={1} />
      </mesh>
      <mesh position={[10, -0.5, -2]}>
        <sphereGeometry args={[3.0, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#0c120c" roughness={1} />
      </mesh>
      <mesh position={[0, -0.5, -8]}>
        <sphereGeometry args={[2.5, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#0c120c" roughness={1} />
      </mesh>

      {/* Water plane (river/moat) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[3, -0.4, 5]}>
        <planeGeometry args={[6, 4]} />
        <meshStandardMaterial
          color="#050515"
          transparent
          opacity={0.85}
          metalness={0.9}
          roughness={0.05}
        />
      </mesh>
    </group>
  )
}

// ── Fog controller (awareness landmark) ──────────────────────────────────

function FogController({ awareness = 50 }) {
  const { scene } = useThree()
  useEffect(() => {
    // High awareness = clear; low awareness = dense fog (inverted per D-10)
    const density = 0.015 + (1 - awareness / 100) * 0.04
    scene.fog = new THREE.FogExp2('#0a0a14', density)
    return () => { scene.fog = null }
  }, [awareness, scene])
  return null
}

// ── Auto-rotating camera ──────────────────────────────────────────────────

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

// ── Ambient firefly particles ─────────────────────────────────────────────

function Particles() {
  const ref = useRef()
  const count = 200

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      arr[i * 3]     = (Math.random() - 0.5) * 40
      arr[i * 3 + 1] = Math.random() * 15
      arr[i * 3 + 2] = (Math.random() - 0.5) * 40
    }
    return arr
  }, [])

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.008
      const posAttr = ref.current.geometry.attributes.position
      for (let i = 0; i < count; i++) {
        posAttr.array[i * 3 + 1] += Math.sin(state.clock.elapsedTime * 0.5 + i) * 0.002
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
        size={0.06}
        transparent
        opacity={0.35}
        sizeAttenuation
      />
    </points>
  )
}

// ── Main KingdomScene ─────────────────────────────────────────────────────

export default function KingdomScene({ worldState }) {
  const trust      = worldState?.trust      ?? 50
  const courage    = worldState?.courage    ?? 50
  const solidarity = worldState?.solidarity ?? 50
  const awareness  = worldState?.awareness  ?? 50

  return (
    <Canvas
      camera={{ position: [12, 8, 15], fov: 50 }}
      gl={{ antialias: true, alpha: false }}
      style={{ background: '#050510', width: '100%', height: '100%' }}
      shadows
    >
      <FogController awareness={awareness} />

      {/* Ambient lighting — nighttime, very dim, cool purple */}
      <ambientLight intensity={0.08} color="#4a4a6a" />

      {/* Directional moonlight */}
      <directionalLight
        position={[10, 15, 5]}
        intensity={0.3}
        color="#6a6a9a"
        castShadow
        shadow-mapSize={[1024, 1024]}
      />

      {/* Warm amber underlight from the realm */}
      <pointLight position={[0, -1, 0]} color="#f59e0b" intensity={0.5} distance={20} />

      {/* Stars */}
      <Stars radius={50} depth={50} count={2000} factor={3} saturation={0} fade speed={0.5} />

      {/* Kingdom landmarks */}
      <Bridge trust={trust} />
      <BeaconTower courage={courage} />
      <VillageQuarter solidarity={solidarity} />
      <Ground />

      {/* Ambient firefly particles */}
      <Particles />

      {/* Camera */}
      <CameraRig />
    </Canvas>
  )
}
