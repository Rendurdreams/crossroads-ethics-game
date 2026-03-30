/**
 * AnimatedMap — Replaces KingdomCanvas (Three.js / R3F)
 *
 * Props (same interface as KingdomCanvas):
 *   worldState   — { Honesty: 0–100, Courage: 0–100, Loyalty: 0–100, Empathy: 0–100 }
 *   lerpSpeedRef — React ref with lerp speed multiplier (not used directly but kept for compat)
 *
 * Zone ↔ Meter mapping:
 *   Fire (top-right castle)  →  Courage
 *   Water (center river)     →  Honesty (trust)
 *   Purple (bottom-right)    →  Empathy (awareness)
 *   Compass (top-center)     →  Loyalty (solidarity)
 *
 * Dependencies: gsap (npm install gsap)
 */

import { useEffect, useRef, useCallback } from "react";
import gsap from "gsap";
import mapSrc from "../assets/Map1.png";
import s from "./AnimatedMap.module.css";

// ── Helpers ──────────────────────────────────────────
function lerp(a, b, t) { return a + (b - a) * t; }
function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
function norm(v) { return clamp(v, 0, 100) / 100; } // 0–100 → 0–1

export default function AnimatedMap({ worldState, lerpSpeedRef }) {
  const sceneRef       = useRef(null);
  const layerRefs      = useRef({});
  const cursorRef      = useRef(null);
  const proxRefs       = useRef({});
  const labelRefs      = useRef({});
  const compassRef     = useRef(null);
  const compassGlowRef = useRef(null);
  const fireZoneRef    = useRef(null);
  const waterZoneRef   = useRef(null);
  const purpleZoneRef  = useRef(null);
  const embersRef      = useRef(null);
  const sparksRef      = useRef(null);
  const particlesRef   = useRef(null);
  const tweensRef      = useRef([]);        // for cleanup
  const intervalsRef   = useRef([]);        // for cleanup
  const meterState     = useRef({ Honesty: 50, Courage: 50, Loyalty: 50, Empathy: 50 });

  // ═══════════════════════════════════════
  // GAME-STATE REACTIVITY
  // ═══════════════════════════════════════
  useEffect(() => {
    if (!worldState) return;
    const target = { ...meterState.current };
    const next   = {
      Honesty: worldState.Honesty  ?? target.Honesty,
      Courage: worldState.Courage  ?? target.Courage,
      Loyalty: worldState.Loyalty  ?? target.Loyalty,
      Empathy: worldState.Empathy  ?? target.Empathy,
    };

    // Smoothly lerp internal meter state
    gsap.to(target, {
      Honesty: next.Honesty,
      Courage: next.Courage,
      Loyalty: next.Loyalty,
      Empathy: next.Empathy,
      duration: 2,
      ease: "power2.inOut",
      onUpdate: () => {
        meterState.current = { ...target };
        applyMeterVisuals(target);
      }
    });
  }, [worldState]);

  const applyMeterVisuals = useCallback((m) => {
    const courage = norm(m.Courage);
    const honesty = norm(m.Honesty);
    const empathy = norm(m.Empathy);
    const loyalty = norm(m.Loyalty);

    // Fire zone: opacity + scale driven by Courage
    if (fireZoneRef.current) {
      const base = 0.15;
      fireZoneRef.current.style.opacity = base + courage * (1 - base);
      fireZoneRef.current.style.transform = `scale(${0.9 + courage * 0.15})`;
    }

    // Water zone: opacity driven by Honesty
    if (waterZoneRef.current) {
      waterZoneRef.current.style.opacity = 0.15 + honesty * 0.85;
    }

    // Purple zone: opacity + filter driven by Empathy
    if (purpleZoneRef.current) {
      const base = 0.15;
      purpleZoneRef.current.style.opacity = base + empathy * (1 - base);
    }

    // Compass: spin speed + glow driven by Loyalty
    if (compassRef.current) {
      // Speed: 120s (slow) at 0, 20s (fast) at 100
      const dur = 120 - loyalty * 100;
      compassRef.current.style.animationDuration = dur + "s";
    }
    if (compassGlowRef.current) {
      compassGlowRef.current.style.opacity = 0.1 + loyalty * 0.7;
    }
  }, []);

  // ═══════════════════════════════════════
  // GSAP INIT + CLEANUP
  // ═══════════════════════════════════════
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    const layers = [
      { el: layerRefs.current.bg,  depth: 0.015 },
      { el: layerRefs.current.mid, depth: 0.025 },
      { el: layerRefs.current.fg,  depth: 0.04  },
      { el: layerRefs.current.ui,  depth: 0.05  },
    ];

    let cx = scene.offsetWidth / 2;
    let cy = scene.offsetHeight / 2;

    const onResize = () => {
      cx = scene.offsetWidth / 2;
      cy = scene.offsetHeight / 2;
    };
    window.addEventListener("resize", onResize);

    // ── Mouse parallax ──
    const onMouseMove = (e) => {
      const rect = scene.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const dx = (mx - cx) / cx;
      const dy = (my - cy) / cy;

      layers.forEach((l) => {
        if (!l.el) return;
        gsap.to(l.el, {
          x: dx * -l.depth * 800,
          y: dy * -l.depth * 500,
          duration: 1.6,
          ease: "power2.out",
          overwrite: "auto"
        });
      });

      // Cursor light
      if (cursorRef.current) {
        gsap.to(cursorRef.current, {
          left: e.clientX,
          top: e.clientY,
          duration: 0.4,
          ease: "power1.out",
          overwrite: "auto"
        });
      }

      // Zone proximity
      updateProximity(mx, my, scene.offsetWidth, scene.offsetHeight);
    };
    scene.addEventListener("mousemove", onMouseMove);

    // ── Click ripple ──
    const onClick = (e) => {
      const ripple = document.createElement("div");
      ripple.className = s.clickRipple;
      ripple.style.left = e.clientX + "px";
      ripple.style.top = e.clientY + "px";
      scene.appendChild(ripple);
      gsap.to(ripple, {
        width: 200, height: 200, opacity: 0, borderWidth: 0,
        duration: 1.2, ease: "power2.out",
        onComplete: () => ripple.remove()
      });
    };
    scene.addEventListener("click", onClick);

    // ── Ambient breathing (GSAP tweens) ──
    const t = [];
    t.push(gsap.to(fireZoneRef.current,   { y: "+=4", x: "+=2",    duration: 4,   ease: "sine.inOut", yoyo: true, repeat: -1 }));
    t.push(gsap.to(purpleZoneRef.current,  { y: "+=3", x: "-=1.5",  duration: 6,   ease: "sine.inOut", yoyo: true, repeat: -1 }));
    t.push(gsap.to(waterZoneRef.current,   { scaleX: 1.005, scaleY: 1.003, duration: 5, ease: "sine.inOut", yoyo: true, repeat: -1 }));
    tweensRef.current = t;

    // ── Ember particles ──
    const emberId = setInterval(() => spawnEmber(embersRef.current), 300);
    const sparkId = setInterval(() => spawnSpark(sparksRef.current), 500);
    const dustId  = setInterval(() => spawnDust(particlesRef.current, scene), 1200);
    intervalsRef.current = [emberId, sparkId, dustId];

    // Initial dust burst
    for (let i = 0; i < 10; i++) setTimeout(() => spawnDust(particlesRef.current, scene), i * 300);

    // ── Entrance timeline ──
    const entrance = gsap.timeline();
    entrance
      .set(Object.values(layerRefs.current), { opacity: 0, scale: 1.1 })
      .to(layerRefs.current.bg,  { opacity: 1, scale: 1, duration: 2.5, ease: "power2.out" })
      .to(layerRefs.current.mid, { opacity: 1, scale: 1, duration: 2,   ease: "power2.out" }, "-=2")
      .to(layerRefs.current.fg,  { opacity: 1, scale: 1, duration: 2,   ease: "power2.out" }, "-=1.5")
      .to(layerRefs.current.ui,  { opacity: 1, scale: 1, duration: 1.5, ease: "power2.out" }, "-=1");

    // Apply initial meter state
    applyMeterVisuals(meterState.current);

    // ── Cleanup ──
    return () => {
      window.removeEventListener("resize", onResize);
      scene.removeEventListener("mousemove", onMouseMove);
      scene.removeEventListener("click", onClick);
      tweensRef.current.forEach((tw) => tw.kill());
      intervalsRef.current.forEach(clearInterval);
      entrance.kill();
    };
  }, [applyMeterVisuals]);

  // ── Proximity logic ──
  const zoneDefs = useRef([
    { key: "fire",   cx: 0.82, cy: 0.2  },
    { key: "water",  cx: 0.25, cy: 0.52 },
    { key: "purple", cx: 0.78, cy: 0.82 },
  ]);

  function updateProximity(mx, my, vw, vh) {
    zoneDefs.current.forEach((z) => {
      const zx = z.cx * vw;
      const zy = z.cy * vh;
      const dist = Math.hypot(mx - zx, my - zy);
      const maxDist = vw * 0.3;
      const intensity = Math.max(0, 1 - dist / maxDist);

      if (proxRefs.current[z.key])  proxRefs.current[z.key].style.opacity  = intensity * 0.8;
      if (labelRefs.current[z.key]) labelRefs.current[z.key].style.opacity = intensity > 0.3 ? Math.min(1, (intensity - 0.3) * 2.5) : 0;
    });

    // Compass label
    if (labelRefs.current.compass) {
      const cdist = Math.hypot(mx - 0.42 * vw, my - 0.06 * vh);
      labelRefs.current.compass.style.opacity = cdist < vw * 0.12 ? Math.min(1, (1 - cdist / (vw * 0.12)) * 2) : 0;
    }
  }

  // ═══════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════
  return (
    <div className={s.scene} ref={sceneRef}>
      {/* SVG filters */}
      <svg className={s.svgFilters}>
        <defs>
          <filter id="water-ripple" x="-10%" y="-10%" width="120%" height="120%">
            <feTurbulence type="fractalNoise" baseFrequency="0.015 0.025" numOctaves="3" seed="2" result="noise">
              <animate attributeName="baseFrequency" values="0.015 0.025;0.018 0.03;0.015 0.025" dur="8s" repeatCount="indefinite"/>
            </feTurbulence>
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="6" xChannelSelector="R" yChannelSelector="G"/>
          </filter>
        </defs>
      </svg>

      {/* BG layer — map image */}
      <div className={`${s.parallaxLayer} ${s.layerBg}`} ref={(el) => (layerRefs.current.bg = el)}>
        <img className={s.mapImg} src={mapSrc} alt="Kingdom Map" draggable="false" />
      </div>

      {/* MID layer — water, purple, proximity glows */}
      <div className={`${s.parallaxLayer} ${s.layerMid}`} ref={(el) => (layerRefs.current.mid = el)}>
        <div className={`${s.waterZone} ${s.zone}`} ref={waterZoneRef}>
          <div className={s.waterSurface} />
          <div className={s.waterHighlights} />
          <div className={s.waterCaustics} />
        </div>

        <div className={`${s.purpleZone} ${s.zone}`} ref={purpleZoneRef}>
          <div className={s.purpleMist} />
          <div className={s.purpleCore} />
          <div className={s.purpleSparks} ref={sparksRef} />
        </div>

        <div className={`${s.zoneProximity} ${s.proxFire}`}   ref={(el) => (proxRefs.current.fire = el)} />
        <div className={`${s.zoneProximity} ${s.proxWater}`}  ref={(el) => (proxRefs.current.water = el)} />
        <div className={`${s.zoneProximity} ${s.proxPurple}`} ref={(el) => (proxRefs.current.purple = el)} />
      </div>

      {/* FG layer — fire, compass */}
      <div className={`${s.parallaxLayer} ${s.layerFg}`} ref={(el) => (layerRefs.current.fg = el)}>
        <div className={`${s.fireZone} ${s.zone}`} ref={fireZoneRef}>
          <div className={`${s.fireLayer} ${s.fireOuter}`} />
          <div className={`${s.fireLayer} ${s.fireMid}`} />
          <div className={`${s.fireLayer} ${s.fireCore}`} />
          <div className={s.fireEmbers} ref={embersRef} />
        </div>

        <div className={`${s.compassZone} ${s.zone}`}>
          <div className={s.compassSpinner} ref={compassRef} style={{ animation: "compassSpin 80s linear infinite" }}>
            <img src={mapSrc} alt="" draggable="false" />
          </div>
        </div>
        <div className={s.compassGlow} ref={compassGlowRef} />
      </div>

      {/* UI layer — labels */}
      <div className={`${s.parallaxLayer} ${s.layerUi}`} ref={(el) => (layerRefs.current.ui = el)}>
        <div className={`${s.zoneLabel} ${s.labelFire}`}    ref={(el) => (labelRefs.current.fire = el)}>Dragon&apos;s Keep</div>
        <div className={`${s.zoneLabel} ${s.labelWater}`}   ref={(el) => (labelRefs.current.water = el)}>Crystalvein River</div>
        <div className={`${s.zoneLabel} ${s.labelPurple}`}  ref={(el) => (labelRefs.current.purple = el)}>The Blighted Wood</div>
        <div className={`${s.zoneLabel} ${s.labelCompass}`} ref={(el) => (labelRefs.current.compass = el)}>True North</div>
      </div>

      {/* Atmosphere */}
      <div className={s.vignette} />
      <div className={s.grain} />
      <div className={s.cursorLight} ref={cursorRef} />
      <div className={s.particleContainer} ref={particlesRef} />
    </div>
  );
}

// ═══════════════════════════════════════
// PARTICLE FACTORIES
// ═══════════════════════════════════════
function spawnEmber(container) {
  if (!container) return;
  const p = document.createElement("div");
  const size = 1.5 + Math.random() * 3;
  Object.assign(p.style, {
    position: "absolute", borderRadius: "50%", pointerEvents: "none", opacity: "0",
    width: size + "px", height: size + "px",
    background: `rgba(255,${140 + Math.random() * 80},${20 + Math.random() * 40},0.9)`,
    left: (30 + Math.random() * 40) + "%", bottom: "20%",
    boxShadow: `0 0 ${size * 2}px rgba(255,120,0,0.5)`
  });
  container.appendChild(p);
  gsap.to(p, { y: -(100 + Math.random() * 200), x: (Math.random() - 0.5) * 80, opacity: 0.9, duration: 0.01 });
  gsap.to(p, { y: -(200 + Math.random() * 300), x: (Math.random() - 0.5) * 120, opacity: 0, duration: 2 + Math.random() * 2, ease: "power1.out", delay: 0.01, onComplete: () => p.remove() });
}

function spawnSpark(container) {
  if (!container) return;
  const p = document.createElement("div");
  const size = 1 + Math.random() * 2.5;
  Object.assign(p.style, {
    position: "absolute", borderRadius: "50%", pointerEvents: "none", opacity: "0",
    width: size + "px", height: size + "px",
    background: `rgba(${180 + Math.random() * 60},${80 + Math.random() * 60},${220 + Math.random() * 35},0.8)`,
    left: (20 + Math.random() * 60) + "%", bottom: (10 + Math.random() * 40) + "%",
    boxShadow: `0 0 ${size * 3}px rgba(160,60,220,0.4)`
  });
  container.appendChild(p);
  gsap.to(p, { y: -(30 + Math.random() * 80), x: (Math.random() - 0.5) * 50, opacity: 0.7, duration: 0.5, ease: "power1.out" });
  gsap.to(p, { opacity: 0, duration: 2 + Math.random() * 3, delay: 0.5, ease: "power1.in", onComplete: () => p.remove() });
}

function spawnDust(container, scene) {
  if (!container || !scene) return;
  const p = document.createElement("div");
  const size = 1 + Math.random() * 2;
  const isGold = Math.random() > 0.4;
  Object.assign(p.style, {
    position: "absolute", borderRadius: "50%", pointerEvents: "none", opacity: "0",
    width: size + "px", height: size + "px",
    background: isGold
      ? `rgba(255,${180 + Math.random() * 40},${60 + Math.random() * 40},0.5)`
      : `rgba(${160 + Math.random() * 40},${100 + Math.random() * 40},${200 + Math.random() * 55},0.4)`,
    left: (Math.random() * 100) + "%", top: (Math.random() * 100) + "%",
  });
  container.appendChild(p);
  gsap.to(p, { opacity: 0.6, duration: 1.5, ease: "power1.in" });
  gsap.to(p, { y: -(40 + Math.random() * 100), x: (Math.random() - 0.5) * 80, duration: 8 + Math.random() * 6, ease: "none" });
  gsap.to(p, { opacity: 0, duration: 2, delay: 4 + Math.random() * 4, onComplete: () => p.remove() });
}
