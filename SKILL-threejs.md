# SKILL.md — Three.js (r128, CDN, React Integration)

Use this skill when building a Three.js scene inside a React component,
loaded from CDN with no build-step import. Covers the city scene patterns
needed for The Crossroads host dashboard.

---

## Loading Three.js in a React/Vite Project

Three.js r128 is the target version — loaded from CDN, not npm.
This avoids bundler conflicts and keeps the host.html self-contained.

```html
<!-- In index.html or host.html — before your React bundle -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
```

Then in your React component, access it as a global:
```javascript
// THREE is available as window.THREE or just THREE after the script loads
const { Scene, PerspectiveCamera, WebGLRenderer, ... } = THREE
```

---

## CityScene.jsx — Component Shell

```jsx
import { useEffect, useRef } from 'react'

export default function CityScene({ worldState }) {
  const mountRef = useRef(null)
  const sceneRef = useRef({})   // store scene objects for updates

  useEffect(() => {
    // Init once
    const { scene, camera, renderer, objects } = initScene(mountRef.current)
    sceneRef.current = { scene, camera, renderer, objects }

    // Animate
    let frameId
    const animate = () => {
      frameId = requestAnimationFrame(animate)
      tick(sceneRef.current)
      renderer.render(scene, camera)
    }
    animate()

    // Resize handler
    const handleResize = () => {
      const w = mountRef.current.clientWidth
      const h = mountRef.current.clientHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }
    window.addEventListener('resize', handleResize)

    return () => {
      cancelAnimationFrame(frameId)
      window.removeEventListener('resize', handleResize)
      renderer.dispose()
      mountRef.current?.removeChild(renderer.domElement)
    }
  }, [])  // init once only

  // World state updates — no re-init, just update objects
  useEffect(() => {
    if (!sceneRef.current.objects) return
    updateCity(sceneRef.current.objects, worldState)
  }, [worldState])

  return <div ref={mountRef} style={{ width: '100%', height: '100%' }} />
}
```

Key rule: init scene ONCE in the first useEffect.
React to worldState changes in a SECOND useEffect that only calls update functions.
Never re-initialize the scene on prop changes — causes flicker and memory leaks.

---

## Scene Initialization

```javascript
function initScene(container) {
  const w = container.clientWidth
  const h = container.clientHeight

  const scene = new THREE.Scene()
  scene.background = new THREE.Color(0x0a0a14)
  scene.fog = new THREE.FogExp2(0x0a0a14, 0.008)  // awareness-driven

  const camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 1000)
  camera.position.set(0, 15, 40)
  camera.lookAt(0, 5, 0)

  const renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(w, h)
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.shadowMap.enabled = true
  container.appendChild(renderer.domElement)

  const objects = {
    buildings: buildBuildings(scene),
    bridge: buildBridge(scene),
    lighthouse: buildLighthouse(scene),
    water: buildWater(scene),
    particles: buildParticles(scene),
  }

  // Ambient light — dim base
  scene.add(new THREE.AmbientLight(0x111122, 0.5))

  return { scene, camera, renderer, objects }
}
```

---

## Buildings (Solidarity Meter)

```javascript
function buildBuildings(scene) {
  const buildings = []
  const positions = generateCityLayout()  // array of {x, z, w, d, h}

  positions.forEach(pos => {
    const geo = new THREE.BoxGeometry(pos.w, pos.h, pos.d)
    const mat = new THREE.MeshStandardMaterial({
      color: 0x1a1a2e,
      emissive: 0xffaa33,
      emissiveIntensity: 0.6,  // driven by solidarity
    })
    const mesh = new THREE.Mesh(geo, mat)
    mesh.position.set(pos.x, pos.h / 2, pos.z)
    scene.add(mesh)
    buildings.push(mesh)
  })

  return buildings
}

// solidarity: 0–100 → emissiveIntensity: 0.0–0.8
function updateBuildings(buildings, solidarity) {
  const intensity = (solidarity / 100) * 0.8
  buildings.forEach((b, i) => {
    // Stagger: lower solidarity = more buildings go dark from edges in
    const threshold = solidarity / 100
    const active = (i / buildings.length) < threshold
    b.material.emissiveIntensity = active ? intensity : 0
  })
}
```

Do NOT use CapsuleGeometry — not available in r128.
Use BoxGeometry, CylinderGeometry, SphereGeometry for all shapes.

---

## Lighthouse (Courage Meter)

```javascript
function buildLighthouse(scene) {
  const group = new THREE.Group()

  // Tower
  const tower = new THREE.Mesh(
    new THREE.CylinderGeometry(0.4, 0.6, 6, 8),
    new THREE.MeshStandardMaterial({ color: 0xcccccc })
  )
  group.add(tower)

  // Light
  const spotlight = new THREE.SpotLight(0xffffff, 2, 80, Math.PI / 6)
  spotlight.position.set(0, 3.5, 0)
  group.add(spotlight)
  group.add(spotlight.target)

  group.position.set(-20, 0, -5)
  scene.add(group)

  return { group, spotlight }
}

// courage: 0–100 → rotation speed + intensity
function updateLighthouse({ group, spotlight }, courage, elapsed) {
  const speed = (courage / 100) * 0.8
  spotlight.target.position.x = Math.sin(elapsed * speed) * 30
  spotlight.target.position.z = Math.cos(elapsed * speed) * 30
  spotlight.target.updateMatrixWorld()
  spotlight.intensity = (courage / 100) * 3
}
```

---

## Bridge (Trust Meter)

```javascript
function buildBridge(scene) {
  const group = new THREE.Group()

  // Deck
  const deck = new THREE.Mesh(
    new THREE.BoxGeometry(30, 0.3, 3),
    new THREE.MeshStandardMaterial({ color: 0x888888 })
  )
  group.add(deck)

  // Towers
  ;[-8, 8].forEach(x => {
    const tower = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 8, 0.5),
      new THREE.MeshStandardMaterial({ color: 0x666666 })
    )
    tower.position.set(x, 4, 0)
    group.add(tower)
  })

  // Cable lights (point lights along bridge)
  const lights = []
  for (let x = -14; x <= 14; x += 4) {
    const light = new THREE.PointLight(0xffcc66, 0.8, 8)
    light.position.set(x, 1, 0)
    group.add(light)
    lights.push(light)
  }

  group.position.set(0, 2, 10)
  scene.add(group)
  return { group, lights }
}

// trust: 0–100 → light intensity + flicker
function updateBridge({ lights }, trust) {
  const base = (trust / 100) * 0.8
  lights.forEach((light, i) => {
    // Low trust: lights flicker out from center
    const distFromCenter = Math.abs(i - lights.length / 2) / (lights.length / 2)
    const threshold = trust / 100
    light.intensity = distFromCenter > threshold ? 0 : base + Math.random() * 0.1
  })
}
```

---

## Fog (Awareness Meter)

```javascript
// In initScene — scene.fog is already set
// Just update density:

function updateFog(scene, awareness) {
  // High awareness = low fog density
  // Low awareness = thick fog
  scene.fog.density = 0.002 + ((100 - awareness) / 100) * 0.025
}
```

---

## Ambient Particles

```javascript
function buildParticles(scene) {
  const count = 200
  const positions = new Float32Array(count * 3)

  for (let i = 0; i < count; i++) {
    positions[i * 3]     = (Math.random() - 0.5) * 60
    positions[i * 3 + 1] = Math.random() * 30
    positions[i * 3 + 2] = (Math.random() - 0.5) * 60
  }

  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))

  const mat = new THREE.PointsMaterial({ color: 0x4444aa, size: 0.15, transparent: true, opacity: 0.6 })
  const points = new THREE.Points(geo, mat)
  scene.add(points)
  return { points, positions }
}

// In tick() — drift particles upward slowly
function tickParticles({ points, positions }) {
  const pos = points.geometry.attributes.position
  for (let i = 0; i < pos.count; i++) {
    pos.array[i * 3 + 1] += 0.01
    if (pos.array[i * 3 + 1] > 30) pos.array[i * 3 + 1] = 0
  }
  pos.needsUpdate = true
}
```

---

## Master Update Function

```javascript
// Called from useEffect when worldState changes
function updateCity(objects, worldState) {
  const { trust, courage, solidarity, awareness } = worldState
  updateBuildings(objects.buildings, solidarity)
  updateBridge(objects.bridge, trust)
  updateLighthouse(objects.lighthouse, courage, Date.now() / 1000)
  updateFog(objects.scene, awareness)
}

// Called every frame in animate loop
function tick(sceneRef) {
  tickParticles(sceneRef.objects.particles)
  // camera drift
  const t = Date.now() / 10000
  sceneRef.camera.position.x = Math.sin(t) * 2
  sceneRef.camera.lookAt(0, 5, 0)
}
```

---

## Threshold Event Overlay

Handle threshold events in React, not Three.js.
Overlay a full-screen div on top of the canvas.

```jsx
// In Host.jsx
{thresholdEvent && (
  <div style={{
    position: 'absolute', inset: 0,
    background: 'rgba(0,0,0,0.85)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 10
  }}>
    <div style={{ maxWidth: 500, textAlign: 'center', color: 'white' }}>
      <p style={{ fontSize: '1.4rem', lineHeight: 1.6 }}>{thresholdEvent.message}</p>
      <button onClick={() => setThresholdEvent(null)}>Continue</button>
    </div>
  </div>
)}
```

---

## Performance Rules

- Use instanced meshes if you have 50+ identical objects (e.g. window lights)
- Call `geometry.dispose()` and `material.dispose()` on cleanup
- Never create new geometries or materials inside the animate loop
- `pos.needsUpdate = true` after modifying BufferAttribute arrays
- Target 60fps on a standard laptop — test early, reduce particle count if needed
- `renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))` — cap at 2x

---

## Common Gotchas

- CapsuleGeometry does NOT exist in r128 — use CylinderGeometry instead
- SpotLight target must be added to the scene AND have updateMatrixWorld() called
- FogExp2 density is exponential — small changes (0.005 → 0.02) are very visible
- Don't put THREE.js init inside React render — only inside useEffect
- renderer.domElement is a canvas — append to a ref'd div, not document.body
- OrbitControls are NOT included in r128 core — load separately or omit entirely
