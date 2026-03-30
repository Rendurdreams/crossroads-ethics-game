import { useRef, useEffect, useCallback, useImperativeHandle, forwardRef } from 'react'

// ═══════════════════════════════════════════════════════════════════════════
// KingdomCanvas — 2D layered silhouette panorama kingdom
// Renders on HTML5 Canvas 2D. No Three.js, no WebGL.
// Visually responds to moral decisions via a 0–100 health value.
//
// Props:
//   worldState: { trust, courage, solidarity, awareness } — each 0-100
//   health:     number 0-100 (optional override; if omitted, averaged from worldState)
//
// Ref imperative handle:
//   setKingdomHealth(value: number) — directly set health target
// ═══════════════════════════════════════════════════════════════════════════

const W = 900
const H = 480
const HORIZON = H * 0.58
const MAX_PARTICLES = 30

// ── Color helpers ────────────────────────────────────────────────────────

function hexToRgb(hex) {
  const n = parseInt(hex.replace('#', ''), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

function rgbToStr([r, g, b], a = 1) {
  return a < 1 ? `rgba(${r|0},${g|0},${b|0},${a})` : `rgb(${r|0},${g|0},${b|0})`
}

function lerpVal(a, b, t) {
  return a + (b - a) * t
}

function themeColor(fallen, mid, rise, health) {
  const f = hexToRgb(fallen)
  const m = hexToRgb(mid)
  const r = hexToRgb(rise)
  const t = health / 100
  if (t <= 0.5) {
    const s = t / 0.5
    return [lerpVal(f[0], m[0], s), lerpVal(f[1], m[1], s), lerpVal(f[2], m[2], s)]
  }
  const s = (t - 0.5) / 0.5
  return [lerpVal(m[0], r[0], s), lerpVal(m[1], r[1], s), lerpVal(m[2], r[2], s)]
}

// ── Status text ──────────────────────────────────────────────────────────

function statusText(health) {
  if (health >= 70) return 'The Kingdom Prospers'
  if (health >= 40) return 'The Kingdom Struggles'
  return 'The Kingdom Falls'
}

function statusBarColor(health) {
  return rgbToStr(themeColor('#c0392b', '#e67e22', '#27ae60', health))
}

// ── Drawing functions ────────────────────────────────────────────────────

function drawSky(ctx, h) {
  const topColor = rgbToStr(themeColor('#1a0008', '#080e2e', '#1a1200', h))
  const midColor = rgbToStr(themeColor('#2a0810', '#0c1228', '#3a2a08', h))
  const botColor = rgbToStr(themeColor('#3a0010', '#141830', '#d4941a', h))
  const grad = ctx.createLinearGradient(0, 0, 0, HORIZON)
  grad.addColorStop(0, topColor)
  grad.addColorStop(0.55, midColor)
  grad.addColorStop(1, botColor)
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, W, HORIZON)

  // Horizon glow — warm atmospheric haze at the horizon line
  const glowColor = themeColor('#3a0808', '#1a1830', '#f5a020', h)
  const hGrad = ctx.createLinearGradient(0, HORIZON - 40, 0, HORIZON + 10)
  hGrad.addColorStop(0, 'rgba(0,0,0,0)')
  hGrad.addColorStop(0.5, rgbToStr(glowColor, 0.12))
  hGrad.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = hGrad
  ctx.fillRect(0, HORIZON - 40, W, 50)
}

function drawStars(ctx, h, stars, time) {
  if (h >= 68) return
  const alpha = Math.max(0, (68 - h) / 68)
  for (let i = 0; i < stars.length; i++) {
    const s = stars[i]
    // Subtle twinkle per star
    const twinkle = 0.5 + 0.5 * Math.sin(time * 1.2 + i * 2.7)
    ctx.fillStyle = rgbToStr([255, 255, 255], alpha * 0.8 * twinkle)
    ctx.beginPath()
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
    ctx.fill()
  }
}

function drawCelestial(ctx, h, time) {
  // Blood moon (low) at top-left → sun (high) at upper-right
  const t = h / 100
  const x = lerpVal(120, W - 140, t)
  const y = lerpVal(60, 80, t)
  const radius = lerpVal(28, 36, t)
  const color = themeColor('#8b0000', '#c0782a', '#f5b041', h)
  const glowColor = themeColor('#3a0000', '#4a3010', '#f5c54280', h)

  // Glow
  const glowR = radius * 3
  const grad = ctx.createRadialGradient(x, y, radius * 0.5, x, y, glowR)
  grad.addColorStop(0, rgbToStr(color, 0.4))
  grad.addColorStop(0.5, rgbToStr(hexToRgb(rgbToStr(color)), 0.1))
  grad.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = grad
  ctx.fillRect(x - glowR, y - glowR, glowR * 2, glowR * 2)

  // Body with subtle pulse
  const pulse = 1 + Math.sin(time * 0.8) * 0.03
  ctx.beginPath()
  ctx.arc(x, y, radius * pulse, 0, Math.PI * 2)
  ctx.fillStyle = rgbToStr(color)
  ctx.fill()
}

function drawMountains(ctx, h) {
  const color = rgbToStr(themeColor('#2a0a10', '#3a4a5a', '#4a6a6a', h))
  const peaks = [
    [0, HORIZON], [60, HORIZON - 90], [140, HORIZON - 55],
    [220, HORIZON - 110], [330, HORIZON - 70], [420, HORIZON - 130],
    [530, HORIZON - 80], [620, HORIZON - 105], [720, HORIZON - 65],
    [810, HORIZON - 95], [W, HORIZON - 50], [W, HORIZON], [0, HORIZON],
  ]
  ctx.beginPath()
  ctx.moveTo(peaks[0][0], peaks[0][1])
  for (let i = 1; i < peaks.length; i++) ctx.lineTo(peaks[i][0], peaks[i][1])
  ctx.closePath()
  ctx.fillStyle = color
  ctx.fill()

  // Atmospheric haze between ranges — adds depth
  const hazeColor = themeColor('#2a0a10', '#1a2040', '#4a3a18', h)
  const haze = ctx.createLinearGradient(0, HORIZON - 100, 0, HORIZON)
  haze.addColorStop(0, 'rgba(0,0,0,0)')
  haze.addColorStop(1, rgbToStr(hazeColor, 0.15))
  ctx.fillStyle = haze
  ctx.fillRect(0, HORIZON - 100, W, 100)

  // Nearer range
  const color2 = rgbToStr(themeColor('#1a0508', '#2a3545', '#3a5a55', h))
  const near = [
    [0, HORIZON], [80, HORIZON - 50], [180, HORIZON - 30],
    [300, HORIZON - 60], [440, HORIZON - 35], [560, HORIZON - 55],
    [680, HORIZON - 40], [800, HORIZON - 50], [W, HORIZON - 25],
    [W, HORIZON], [0, HORIZON],
  ]
  ctx.beginPath()
  ctx.moveTo(near[0][0], near[0][1])
  for (let i = 1; i < near.length; i++) ctx.lineTo(near[i][0], near[i][1])
  ctx.closePath()
  ctx.fillStyle = color2
  ctx.fill()
}

function drawGround(ctx, h) {
  const color = rgbToStr(themeColor('#1a0a05', '#2a2a18', '#1a3a12', h))
  ctx.fillStyle = color
  ctx.fillRect(0, HORIZON, W, H - HORIZON)

  // Lighter ground strip right at horizon
  const strip = rgbToStr(themeColor('#2a1008', '#3a3a20', '#2a4a1a', h))
  ctx.fillStyle = strip
  ctx.fillRect(0, HORIZON, W, 6)
}

function drawTree(ctx, x, baseY, h, scale = 1) {
  const trunkColor = rgbToStr(themeColor('#1a0a05', '#3a2a15', '#2a1a0a', h))
  const leafColor = rgbToStr(themeColor('#1a0808', '#1a2a18', '#0a3a0a', h))

  const trunkH = 18 * scale
  const trunkW = 4 * scale
  const leafH = 28 * scale
  const leafW = 18 * scale

  if (h < 20) {
    // Dead trunk only
    ctx.fillStyle = trunkColor
    ctx.fillRect(x - trunkW / 2, baseY - trunkH, trunkW, trunkH)
    return
  }

  // Trunk
  ctx.fillStyle = trunkColor
  ctx.fillRect(x - trunkW / 2, baseY - trunkH, trunkW, trunkH)

  // Foliage triangle
  ctx.beginPath()
  ctx.moveTo(x, baseY - trunkH - leafH)
  ctx.lineTo(x - leafW, baseY - trunkH + 4)
  ctx.lineTo(x + leafW, baseY - trunkH + 4)
  ctx.closePath()
  ctx.fillStyle = leafColor
  ctx.fill()
}

function drawTrees(ctx, h) {
  const trees = [
    { x: 30, y: HORIZON + 15, s: 1.1 },
    { x: 70, y: HORIZON + 20, s: 0.8 },
    { x: 115, y: HORIZON + 12, s: 1.0 },
    { x: 155, y: HORIZON + 18, s: 0.7 },
    { x: 750, y: HORIZON + 14, s: 1.0 },
    { x: 800, y: HORIZON + 20, s: 0.85 },
    { x: 845, y: HORIZON + 10, s: 1.1 },
    { x: 880, y: HORIZON + 16, s: 0.7 },
  ]
  for (const t of trees) drawTree(ctx, t.x, t.y, h, t.s)
}

function drawCottage(ctx, x, baseY, w, roofH, wallH, h, alive, idx) {
  const wallColor = rgbToStr(themeColor('#1a0808', '#2a2220', '#3a2a1a', h))
  const roofColor = rgbToStr(themeColor('#0a0505', '#2a1a12', '#4a2a0a', h))

  if (!alive) {
    // Ruins — half walls, no roof
    ctx.fillStyle = wallColor
    ctx.fillRect(x, baseY - wallH * 0.4, w, wallH * 0.4)
    return
  }

  // Wall
  ctx.fillStyle = wallColor
  ctx.fillRect(x, baseY - wallH, w, wallH)

  // Roof triangle
  ctx.beginPath()
  ctx.moveTo(x - 4, baseY - wallH)
  ctx.lineTo(x + w / 2, baseY - wallH - roofH)
  ctx.lineTo(x + w + 4, baseY - wallH)
  ctx.closePath()
  ctx.fillStyle = roofColor
  ctx.fill()

  // Window glow when health > 50
  if (h > 50) {
    const alpha = Math.min(1, (h - 50) / 50)
    ctx.fillStyle = rgbToStr([245, 158, 11], alpha * 0.9)
    const winW = w * 0.2
    const winH = wallH * 0.25
    ctx.fillRect(x + w * 0.3, baseY - wallH * 0.7, winW, winH)
    ctx.fillRect(x + w * 0.55, baseY - wallH * 0.7, winW, winH)
  }
}

function drawVillage(ctx, h, time) {
  const baseY = HORIZON + 30
  const cottages = [
    { x: 200, w: 36, roofH: 18, wallH: 24 },
    { x: 245, w: 30, roofH: 15, wallH: 20 },
    { x: 280, w: 40, roofH: 20, wallH: 28 },
    { x: 328, w: 28, roofH: 14, wallH: 18 },
    { x: 360, w: 34, roofH: 17, wallH: 22 },
  ]

  // Houses appear one-by-one as health rises: thresholds at 10,20,30,40,50
  cottages.forEach((c, i) => {
    const threshold = 10 + i * 10
    const alive = h >= threshold
    drawCottage(ctx, c.x, baseY, c.w, c.roofH, c.wallH, h, alive, i)
  })

  // Smoke wisps when health > 60
  if (h > 60) {
    const alpha = Math.min(0.3, (h - 60) / 100)
    ctx.fillStyle = rgbToStr([180, 180, 180], alpha)
    for (let i = 0; i < 3; i++) {
      const cx = 260 + i * 50
      const cy = baseY - 55 - Math.sin(time * 0.5 + i * 2) * 8
      ctx.beginPath()
      ctx.arc(cx, cy, 4 + Math.sin(time + i) * 2, 0, Math.PI * 2)
      ctx.fill()
    }
  }
}

function drawCastle(ctx, h, time) {
  const baseY = HORIZON + 20
  const t = h / 100

  // Scale dimensions with health
  const towerH = 60 + t * 60      // 60–120
  const wallH = 30 + t * 30       // 30–60
  const wallW = 90 + t * 30       // 90–120

  const cx = W * 0.5

  const wallColor = rgbToStr(themeColor('#0a0505', '#2a2a2a', '#3a3a3a', h))
  const towerColor = rgbToStr(themeColor('#0a0404', '#252530', '#353540', h))
  const darkAccent = rgbToStr(themeColor('#050202', '#1a1a20', '#252530', h))

  // Main wall
  ctx.fillStyle = wallColor
  ctx.fillRect(cx - wallW / 2, baseY - wallH, wallW, wallH)

  // Left tower
  ctx.fillStyle = towerColor
  ctx.fillRect(cx - wallW / 2 - 12, baseY - towerH, 24, towerH)

  // Right tower
  ctx.fillRect(cx + wallW / 2 - 12, baseY - towerH, 24, towerH)

  // Center keep — taller
  const keepH = towerH * 1.15
  const keepW = 30
  ctx.fillRect(cx - keepW / 2, baseY - keepH, keepW, keepH)

  // Tower caps (crenellations)
  ctx.fillStyle = darkAccent
  const capW = 6
  for (let side = -1; side <= 1; side += 2) {
    const tx = side === 0 ? cx : cx + side * (wallW / 2)
    for (let i = -1; i <= 1; i += 2) {
      ctx.fillRect(tx + i * 5 - capW / 2, baseY - towerH - 6, capW, 6)
    }
  }
  // Keep cap
  ctx.beginPath()
  ctx.moveTo(cx - 18, baseY - keepH)
  ctx.lineTo(cx, baseY - keepH - 18)
  ctx.lineTo(cx + 18, baseY - keepH)
  ctx.closePath()
  ctx.fillStyle = darkAccent
  ctx.fill()

  // Battlements on wall top — only if h > 46
  if (h > 46) {
    const bCount = 5
    const spacing = wallW / (bCount + 1)
    ctx.fillStyle = wallColor
    for (let i = 1; i <= bCount; i++) {
      const bx = cx - wallW / 2 + i * spacing
      ctx.fillRect(bx - 3, baseY - wallH - 8, 6, 8)
    }
  }

  // Flags on towers — above 46%
  if (h > 46) {
    const flagColor = rgbToStr(themeColor('#5a1a1a', '#8a6a2a', '#2a6a2a', h))
    const wave = Math.sin(time * 2) * 3
    for (const tx of [cx - wallW / 2, cx + wallW / 2, cx]) {
      ctx.fillStyle = flagColor
      // Pole
      ctx.fillRect(tx - 1, baseY - (tx === cx ? keepH + 18 : towerH + 6) - 16, 2, 16)
      // Flag
      const fy = baseY - (tx === cx ? keepH + 18 : towerH + 6) - 16
      ctx.beginPath()
      ctx.moveTo(tx + 1, fy)
      ctx.lineTo(tx + 14, fy + 4 + wave)
      ctx.lineTo(tx + 1, fy + 10)
      ctx.closePath()
      ctx.fill()
    }
  }

  // Fires below 32%
  if (h < 32) {
    const fireAlpha = (32 - h) / 32
    for (const fx of [cx - 30, cx + 25, cx - wallW / 2 + 8]) {
      const fy = baseY - 10
      ctx.fillStyle = rgbToStr([255, 80, 20], fireAlpha * 0.8)
      ctx.beginPath()
      ctx.arc(fx, fy - Math.sin(time * 3) * 4, 5, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = rgbToStr([255, 200, 50], fireAlpha * 0.6)
      ctx.beginPath()
      ctx.arc(fx, fy - 6 - Math.sin(time * 4) * 3, 3, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  // Window glow when prospering (> 60)
  if (h > 60) {
    const alpha = Math.min(1, (h - 60) / 40)
    ctx.fillStyle = rgbToStr([245, 178, 50], alpha * 0.85)
    // Keep windows
    ctx.fillRect(cx - 4, baseY - keepH * 0.6, 8, 10)
    ctx.fillRect(cx - 4, baseY - keepH * 0.35, 8, 10)
    // Tower windows
    for (const tx of [cx - wallW / 2, cx + wallW / 2]) {
      ctx.fillRect(tx - 3, baseY - towerH * 0.6, 6, 8)
      ctx.fillRect(tx - 3, baseY - towerH * 0.35, 6, 8)
    }
  }
}

function drawTemple(ctx, h) {
  const baseY = HORIZON + 25
  const t = h / 100
  const spireH = 40 + t * 50     // 40–90
  const bodyW = 32
  const bodyH = 28 + t * 15

  const tx = 640

  const bodyColor = rgbToStr(themeColor('#0a0508', '#2a2030', '#352a40', h))
  const spireColor = rgbToStr(themeColor('#0a0308', '#2a1a35', '#3a2a50', h))

  // Temple body
  ctx.fillStyle = bodyColor
  ctx.fillRect(tx - bodyW / 2, baseY - bodyH, bodyW, bodyH)

  // Columns
  ctx.fillStyle = spireColor
  ctx.fillRect(tx - bodyW / 2 - 4, baseY - bodyH + 4, 4, bodyH - 4)
  ctx.fillRect(tx + bodyW / 2, baseY - bodyH + 4, 4, bodyH - 4)

  // Spire
  ctx.beginPath()
  ctx.moveTo(tx, baseY - bodyH - spireH)
  ctx.lineTo(tx - 10, baseY - bodyH)
  ctx.lineTo(tx + 10, baseY - bodyH)
  ctx.closePath()
  ctx.fillStyle = spireColor
  ctx.fill()

  // Purple glow when thriving (> 70)
  if (h > 70) {
    const alpha = Math.min(0.5, (h - 70) / 60)
    const grad = ctx.createRadialGradient(tx, baseY - bodyH - spireH * 0.5, 2, tx, baseY - bodyH - spireH * 0.5, 40)
    grad.addColorStop(0, rgbToStr([160, 80, 220], alpha))
    grad.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = grad
    ctx.fillRect(tx - 50, baseY - bodyH - spireH - 20, 100, spireH + 40)
  }

  // Door
  ctx.fillStyle = rgbToStr(themeColor('#050205', '#1a1018', '#1a1025', h))
  ctx.fillRect(tx - 5, baseY - 14, 10, 14)
}

function drawAmbientGlow(ctx, h) {
  if (h < 45) return
  // Warm ambient light pooling on ground from village/castle windows
  const alpha = Math.min(0.1, (h - 45) / 200)
  const cx = W * 0.5
  const grad = ctx.createRadialGradient(cx, HORIZON + 20, 10, cx, HORIZON + 20, 200)
  grad.addColorStop(0, rgbToStr([245, 178, 50], alpha))
  grad.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = grad
  ctx.fillRect(cx - 200, HORIZON, 400, 80)

  // Village glow pool
  const vx = 280
  const vGrad = ctx.createRadialGradient(vx, HORIZON + 25, 5, vx, HORIZON + 25, 100)
  vGrad.addColorStop(0, rgbToStr([245, 158, 11], alpha * 0.7))
  vGrad.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = vGrad
  ctx.fillRect(vx - 100, HORIZON, 200, 60)
}

function drawFog(ctx, h) {
  if (h >= 42) return
  const alpha = Math.min(0.5, (42 - h) / 42 * 0.5)
  const grad = ctx.createLinearGradient(0, HORIZON + 10, 0, H)
  grad.addColorStop(0, rgbToStr([10, 10, 20], alpha))
  grad.addColorStop(0.6, rgbToStr([15, 15, 25], alpha * 0.6))
  grad.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = grad
  ctx.fillRect(0, HORIZON + 10, W, H - HORIZON - 10)
}

function drawRain(ctx, h, time) {
  if (h >= 18) return
  const alpha = (18 - h) / 18 * 0.5
  ctx.strokeStyle = rgbToStr([140, 160, 200], alpha)
  ctx.lineWidth = 1
  const count = 60
  for (let i = 0; i < count; i++) {
    const x = (i * 37 + time * 120) % W
    const y = (i * 53 + time * 180) % H
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.lineTo(x - 4, y + 12)
    ctx.stroke()
  }
}

// ── Particle system ──────────────────────────────────────────────────────

function spawnParticle(h) {
  if (h < 50) {
    // Ember / fire spark
    return {
      x: 200 + Math.random() * 350,
      y: HORIZON + Math.random() * 40,
      vx: (Math.random() - 0.5) * 0.8,
      vy: -(0.3 + Math.random() * 0.8),
      life: 1,
      decay: 0.008 + Math.random() * 0.012,
      color: Math.random() > 0.5 ? [255, 100, 20] : [255, 180, 40],
      size: 1.5 + Math.random() * 2,
    }
  }
  // Firefly / gold floater
  return {
    x: 50 + Math.random() * (W - 100),
    y: HORIZON - 60 + Math.random() * 120,
    vx: (Math.random() - 0.5) * 0.3,
    vy: (Math.random() - 0.5) * 0.3,
    life: 1,
    decay: 0.004 + Math.random() * 0.006,
    color: Math.random() > 0.5 ? [100, 200, 80] : [240, 200, 60],
    size: 1 + Math.random() * 2,
  }
}

function updateParticles(particles, h, dt) {
  // Spawn — one at a time, only if below cap
  if (particles.length < MAX_PARTICLES && Math.random() < 0.15) {
    particles.push(spawnParticle(h))
  }

  // Update
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i]
    p.x += p.vx
    p.y += p.vy
    p.life -= p.decay
    if (p.life <= 0) {
      particles.splice(i, 1)
    }
  }
}

function drawParticles(ctx, particles) {
  for (const p of particles) {
    const r = p.size * p.life

    // Soft glow halo behind particle
    const glowR = r * 4
    const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, glowR)
    grad.addColorStop(0, rgbToStr(p.color, p.life * 0.25))
    grad.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = grad
    ctx.fillRect(p.x - glowR, p.y - glowR, glowR * 2, glowR * 2)

    // Core dot
    ctx.fillStyle = rgbToStr(p.color, p.life * 0.9)
    ctx.beginPath()
    ctx.arc(p.x, p.y, r, 0, Math.PI * 2)
    ctx.fill()
  }
}

// ── Main component ───────────────────────────────────────────────────────

const KingdomCanvas = forwardRef(function KingdomCanvas({ worldState, health: healthProp, lerpSpeedRef }, ref) {
  const canvasRef = useRef(null)
  const animRef = useRef(null)
  const stateRef = useRef({
    health: 50,
    targetHealth: 50,
    particles: [],
    time: 0,
    stars: Array.from({ length: 60 }, () => ({
      x: Math.random() * W,
      y: Math.random() * HORIZON * 0.85,
      r: 0.5 + Math.random() * 1.2,
    })),
  })

  // Compute target health from worldState or prop
  useEffect(() => {
    let h
    if (healthProp != null) {
      h = healthProp
    } else if (worldState) {
      const { trust = 50, courage = 50, solidarity = 50, awareness = 50 } = worldState
      h = (trust + courage + solidarity + awareness) / 4
    } else {
      h = 50
    }
    stateRef.current.targetHealth = Math.max(0, Math.min(100, h))
  }, [worldState, healthProp])

  // Expose imperative handle
  const setKingdomHealth = useCallback((val) => {
    stateRef.current.targetHealth = Math.max(0, Math.min(100, val))
  }, [])

  useImperativeHandle(ref, () => ({ setKingdomHealth }), [setKingdomHealth])

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let lastTime = performance.now()

    function frame(now) {
      const dt = (now - lastTime) / 1000
      lastTime = now

      const s = stateRef.current

      // Smooth lerp toward target — lerpSpeedRef overrides base rate for reveal beat
      const baseRate = lerpSpeedRef?.current ? lerpSpeedRef.current * 0.011 : 0.022
      const lerpSpeed = 1 - Math.pow(1 - baseRate, dt * 60)
      s.health = s.health + (s.targetHealth - s.health) * lerpSpeed
      s.time += dt

      const h = s.health

      // Clear
      ctx.clearRect(0, 0, W, H)

      // Layers back to front
      drawSky(ctx, h)
      drawStars(ctx, h, s.stars, s.time)
      drawCelestial(ctx, h, s.time)
      drawMountains(ctx, h)
      drawGround(ctx, h)
      drawTrees(ctx, h)
      drawVillage(ctx, h, s.time)
      drawCastle(ctx, h, s.time)
      drawTemple(ctx, h)
      updateParticles(s.particles, h, dt)
      drawParticles(ctx, s.particles)
      drawAmbientGlow(ctx, h)
      drawFog(ctx, h)
      drawRain(ctx, h, s.time)

      animRef.current = requestAnimationFrame(frame)
    }

    animRef.current = requestAnimationFrame(frame)
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current)
    }
  }, [])

  const h = stateRef.current.health

  return (
    <div style={{ width: '100%', fontFamily: 'Georgia, serif' }}>
      <canvas
        ref={canvasRef}
        width={W}
        height={H}
        style={{
          width: '100%',
          height: 'auto',
          display: 'block',
          borderRadius: '8px 8px 0 0',
        }}
      />
      <StatusBar health={stateRef.current.targetHealth} />
    </div>
  )
})

// ── Status bar below canvas ──────────────────────────────────────────────

function StatusBar({ health }) {
  const h = health
  return (
    <div style={{
      background: '#0a0a12',
      padding: '10px 16px',
      borderRadius: '0 0 8px 8px',
      display: 'flex',
      alignItems: 'center',
      gap: '14px',
    }}>
      <span style={{
        fontFamily: 'Georgia, serif',
        color: '#c0aa80',
        fontSize: '14px',
        whiteSpace: 'nowrap',
      }}>
        The Crossroads
      </span>
      <span style={{
        fontFamily: 'system-ui, sans-serif',
        color: '#8a8a9a',
        fontSize: '12px',
        whiteSpace: 'nowrap',
        minWidth: '150px',
      }}>
        {statusText(h)}
      </span>
      <div style={{
        flex: 1,
        height: '6px',
        background: '#1a1a2a',
        borderRadius: '3px',
        overflow: 'hidden',
      }}>
        <div style={{
          width: `${Math.max(0, Math.min(100, h))}%`,
          height: '100%',
          background: statusBarColor(h),
          borderRadius: '3px',
          transition: 'width 0.5s ease, background 0.5s ease',
        }} />
      </div>
      <span style={{
        fontFamily: 'system-ui, sans-serif',
        color: '#6a6a7a',
        fontSize: '11px',
        minWidth: '32px',
        textAlign: 'right',
      }}>
        {Math.round(h)}%
      </span>
    </div>
  )
}

export default KingdomCanvas
