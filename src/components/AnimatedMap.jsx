/**
 * AnimatedMap — Full zone animation system
 *
 * Props:
 *   worldState   — { trust: 0-100, courage: 0-100, solidarity: 0-100, awareness: 0-100 }
 *   lerpSpeedRef — React ref with lerp speed multiplier (kept for compat)
 *
 * Zone - Meter mapping:
 *   Fire (top-right castle)      ->  Courage
 *   Water (center river)         ->  Honesty (trust)
 *   Purple (bottom-right forest) ->  Empathy (awareness)
 *   Wilderness (top-left mtns)   ->  Loyalty (solidarity)
 *
 * Each zone uses a paused GSAP timeline whose .progress(0-1) is driven
 * by the meter value. When no game state is flowing, ambient drift
 * oscillates zones around their current value for a living-map feel.
 */

import { useEffect, useRef, useCallback } from "react";
import gsap from "gsap";
import mapSrc from "../assets/Map1.png";
import s from "./AnimatedMap.module.css";

function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

export default function AnimatedMap({ worldState, lerpSpeedRef, breakFlags }) {
  const sceneRef       = useRef(null);
  const layerRefs      = useRef({});

  // Zone element refs
  const fireZoneRef    = useRef(null);
  const fireCoreRef    = useRef(null);
  const fireMidRef     = useRef(null);
  const fireOuterRef   = useRef(null);
  const embersRef      = useRef(null);

  const waterZoneRef   = useRef(null);
  const waterSurfRef   = useRef(null);
  const waterHiRef     = useRef(null);
  const waterCaustRef  = useRef(null);

  const purpleZoneRef  = useRef(null);
  const purpleCoreRef  = useRef(null);
  const purpleMistRef  = useRef(null);
  const sparksRef      = useRef(null);

  const wildZoneRef    = useRef(null);
  const wildFogRef     = useRef(null);
  const wildMistRef    = useRef(null);
  const wildLightRef   = useRef(null);
  const wildSparksRef  = useRef(null);

  const particlesRef   = useRef(null);

  // Animation state
  const timelinesRef   = useRef({});
  const particleRates  = useRef({ wild: 0.5, fire: 0.5, water: 0.5, purple: 0.5 });
  const tweensRef      = useRef([]);
  const intervalsRef   = useRef([]);
  const driftRAF       = useRef(null);
  const driftActive    = useRef(true);
  const driftTimeout   = useRef(null);
  const meterState     = useRef({ Honesty: 50, Courage: 50, Loyalty: 50, Empathy: 50 });

  // ===================================
  // SET ZONE PROGRESS (0-100)
  // ===================================
  const setZoneProgress = useCallback((zone, value) => {
    const tl = timelinesRef.current[zone];
    if (!tl) return;
    const clamped = clamp(value, 0, 100);
    tl.progress(clamped / 100);
    particleRates.current[zone] = clamped / 100;
  }, []);

  // ===================================
  // GAME-STATE REACTIVITY
  // ===================================
  useEffect(() => {
    if (!worldState) return;

    // Pause ambient drift when game state flows in
    driftActive.current = false;
    clearTimeout(driftTimeout.current);
    driftTimeout.current = setTimeout(() => { driftActive.current = true; }, 3000);

    const target = { ...meterState.current };

    // Support both kingdom-arc (trust/courage/solidarity/awareness) and
    // Signal Lost (CT/HD/SOL/ACC) axis keys
    const isSignalLost = 'CT' in worldState;
    const next = isSignalLost ? {
      Honesty: worldState.CT ?? target.Honesty,
      Courage: worldState.HD ?? target.Courage,
      Loyalty: worldState.SOL ?? target.Loyalty,
      Empathy: worldState.ACC ?? target.Empathy,
    } : {
      Honesty: worldState.trust ?? target.Honesty,
      Courage: worldState.courage ?? target.Courage,
      Loyalty: worldState.solidarity ?? target.Loyalty,
      Empathy: worldState.awareness ?? target.Empathy,
    };

    gsap.to(target, {
      Honesty: next.Honesty,
      Courage: next.Courage,
      Loyalty: next.Loyalty,
      Empathy: next.Empathy,
      duration: 2,
      ease: "power2.inOut",
      onUpdate: () => {
        meterState.current = { ...target };
        setZoneProgress('fire',   target.Courage);
        setZoneProgress('water',  target.Honesty);
        setZoneProgress('purple', target.Empathy);
        setZoneProgress('wild',   target.Loyalty);
      }
    });
  }, [worldState, setZoneProgress]);

  // ===================================
  // GSAP INIT + CLEANUP
  // ===================================
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    // -- Build progress-controlled timelines --
    const wildTL = gsap.timeline({ paused: true });
    if (wildFogRef.current) {
      wildTL.fromTo(wildFogRef.current,
        { opacity: 0, scale: 0.8, x: -30 },
        { opacity: 0.8, scale: 1.25, x: 30, filter: "blur(14px)", duration: 5, ease: "none" });
    }
    if (wildMistRef.current) {
      wildTL.fromTo(wildMistRef.current,
        { backgroundPosition: "300% center", opacity: 0, x: -40 },
        { backgroundPosition: "-200% center", opacity: 0.9, x: 40, duration: 10, ease: "none" }, 0);
    }
    if (wildLightRef.current) {
      wildTL.fromTo(wildLightRef.current,
        { opacity: 0, scale: 0.85, rotation: -3 },
        { opacity: 0.8, scale: 1.2, rotation: 3, duration: 8, ease: "none" }, 0);
    }
    if (wildZoneRef.current) {
      wildTL.fromTo(wildZoneRef.current,
        { y: 20, x: -15 },
        { y: -20, x: 15, duration: 10, ease: "sine.inOut" }, 0);
    }

    const fireTL = gsap.timeline({ paused: true });
    if (fireCoreRef.current) {
      fireTL.fromTo(fireCoreRef.current,
        { opacity: 0.2, scale: 0.75, y: 10 },
        { opacity: 1, scale: 1.3, y: -20, duration: 5, ease: "none" });
    }
    if (fireMidRef.current) {
      fireTL.fromTo(fireMidRef.current,
        { opacity: 0.1, scale: 0.8, y: 8 },
        { opacity: 1, scale: 1.25, y: -15, duration: 5, ease: "none" }, 0);
    }
    if (fireOuterRef.current) {
      fireTL.fromTo(fireOuterRef.current,
        { opacity: 0.05, scale: 0.85 },
        { opacity: 0.9, scale: 1.3, duration: 5, ease: "none" }, 0);
    }
    if (fireZoneRef.current) {
      fireTL.fromTo(fireZoneRef.current,
        { y: 15, x: 10 },
        { y: -15, x: -10, duration: 10, ease: "sine.inOut" }, 0);
    }

    const waterTL = gsap.timeline({ paused: true });
    if (waterSurfRef.current) {
      waterTL.fromTo(waterSurfRef.current,
        { opacity: 0.1, x: -40, y: 8 },
        { opacity: 1, x: 40, y: -8, duration: 10, ease: "none" });
    }
    if (waterHiRef.current) {
      waterTL.fromTo(waterHiRef.current,
        { backgroundPosition: "350% center", opacity: 0 },
        { backgroundPosition: "-200% center", opacity: 1, duration: 10, ease: "none" }, 0);
    }
    if (waterCaustRef.current) {
      waterTL.fromTo(waterCaustRef.current,
        { backgroundPosition: "400% center", opacity: 0 },
        { backgroundPosition: "-250% center", opacity: 0.8, duration: 10, ease: "none" }, 0);
    }
    if (waterZoneRef.current) {
      waterTL.fromTo(waterZoneRef.current,
        { scaleX: 0.98, scaleY: 0.98, y: 10 },
        { scaleX: 1.03, scaleY: 1.02, y: -10, duration: 10, ease: "sine.inOut" }, 0);
    }

    const purpleTL = gsap.timeline({ paused: true });
    if (purpleCoreRef.current) {
      purpleTL.fromTo(purpleCoreRef.current,
        { opacity: 0.1, scale: 0.8, y: 15 },
        { opacity: 1, scale: 1.2, y: -15, duration: 5, ease: "none" });
    }
    if (purpleMistRef.current) {
      purpleTL.fromTo(purpleMistRef.current,
        { opacity: 0.05, scale: 0.85, x: -30, y: 10 },
        { opacity: 0.9, scale: 1.15, x: 30, y: -10, duration: 10, ease: "none" }, 0);
    }
    if (purpleZoneRef.current) {
      purpleTL.fromTo(purpleZoneRef.current,
        { y: 15, x: 10, rotation: -1 },
        { y: -15, x: -10, rotation: 1, duration: 10, ease: "sine.inOut" }, 0);
    }

    timelinesRef.current = { wild: wildTL, fire: fireTL, water: waterTL, purple: purpleTL };

    // -- Init all zones at 50 --
    setZoneProgress('wild',   50);
    setZoneProgress('fire',   50);
    setZoneProgress('water',  50);
    setZoneProgress('purple', 50);

    // -- Ambient breathing tweens (CSS keyframes handle the fast pulses, these add slow drift) --
    const t = [];
    if (fireZoneRef.current)   t.push(gsap.to(fireZoneRef.current,   { y: "+=4", x: "+=2",    duration: 4, ease: "sine.inOut", yoyo: true, repeat: -1 }));
    if (purpleZoneRef.current) t.push(gsap.to(purpleZoneRef.current, { y: "+=3", x: "-=1.5",  duration: 6, ease: "sine.inOut", yoyo: true, repeat: -1 }));
    if (waterZoneRef.current)  t.push(gsap.to(waterZoneRef.current,  { scaleX: 1.005, scaleY: 1.003, duration: 5, ease: "sine.inOut", yoyo: true, repeat: -1 }));
    if (wildZoneRef.current)   t.push(gsap.to(wildZoneRef.current,   { y: "+=5", x: "+=3",    duration: 7, ease: "sine.inOut", yoyo: true, repeat: -1 }));
    tweensRef.current = t;

    // -- Particle spawners --
    const emberId = setInterval(() => spawnEmber(embersRef.current, particleRates.current.fire), 250);
    const sparkId = setInterval(() => spawnPurpleSpark(sparksRef.current, particleRates.current.purple), 400);
    const wildId  = setInterval(() => spawnWildMote(wildSparksRef.current, particleRates.current.wild), 500);
    const dustId  = setInterval(() => spawnDust(particlesRef.current), 1200);
    intervalsRef.current = [emberId, sparkId, wildId, dustId];

    // Initial dust burst
    for (let i = 0; i < 10; i++) setTimeout(() => spawnDust(particlesRef.current), i * 300);

    // -- Entrance timeline --
    const entrance = gsap.timeline();
    entrance
      .set(Object.values(layerRefs.current), { opacity: 0, scale: 1.1 })
      .to(layerRefs.current.bg,  { opacity: 1, scale: 1, duration: 2.5, ease: "power2.out" })
      .to(layerRefs.current.mid, { opacity: 1, scale: 1, duration: 2,   ease: "power2.out" }, "-=2")
      .to(layerRefs.current.fg,  { opacity: 1, scale: 1, duration: 2,   ease: "power2.out" }, "-=1.5")
      .to(layerRefs.current.ui,  { opacity: 1, scale: 1, duration: 1.5, ease: "power2.out" }, "-=1");

    // -- Ambient drift (oscillates zones when no game state is flowing) --
    const driftState = {
      wild:   { value: 50, speed: 0.5,  offset: 0   },
      fire:   { value: 50, speed: 0.35, offset: 1.2 },
      water:  { value: 50, speed: 0.45, offset: 2.5 },
      purple: { value: 50, speed: 0.4,  offset: 3.8 },
    };

    function ambientDrift(time) {
      if (driftActive.current) {
        for (const [zone, d] of Object.entries(driftState)) {
          const t = time * 0.001 * d.speed + d.offset;
          const wave = Math.sin(t) * 20 + Math.sin(t * 1.7) * 10 + Math.sin(t * 0.6) * 8;
          d.value = 50 + wave;
          setZoneProgress(zone, d.value);
        }
      }
      driftRAF.current = requestAnimationFrame(ambientDrift);
    }
    driftRAF.current = requestAnimationFrame(ambientDrift);

    // -- Cleanup --
    return () => {
      tweensRef.current.forEach(tw => tw.kill());
      intervalsRef.current.forEach(clearInterval);
      entrance.kill();
      wildTL.kill();
      fireTL.kill();
      waterTL.kill();
      purpleTL.kill();
      cancelAnimationFrame(driftRAF.current);
      clearTimeout(driftTimeout.current);
    };
  }, [setZoneProgress]);

  // ===================================
  // RENDER
  // ===================================
  return (
    <div className={s.scene} ref={sceneRef}>
      {/* SVG filters */}
      <svg className={s.svgFilters}>
        <defs>
          <filter id="water-ripple" x="-10%" y="-10%" width="120%" height="120%">
            <feTurbulence type="fractalNoise" baseFrequency="0.012 0.02" numOctaves="4" seed="2" result="noise">
              <animate attributeName="baseFrequency" values="0.012 0.02;0.022 0.035;0.012 0.02" dur="5s" repeatCount="indefinite"/>
            </feTurbulence>
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="14" xChannelSelector="R" yChannelSelector="G"/>
          </filter>
        </defs>
      </svg>

      {/* BG layer — map image */}
      <div className={`${s.parallaxLayer} ${s.layerBg}`} ref={el => (layerRefs.current.bg = el)}>
        <img className={s.mapImg} src={mapSrc} alt="Kingdom Map" draggable="false" />
      </div>

      {/* MID layer — wilderness, water, purple, proximity glows */}
      <div className={`${s.parallaxLayer} ${s.layerMid}`} ref={el => (layerRefs.current.mid = el)}>
        <div className={`${s.wildZone} ${s.zone}`} ref={wildZoneRef}>
          <div className={s.wildFog} ref={wildFogRef} />
          <div className={s.wildMist} ref={wildMistRef} />
          <div className={s.wildLight} ref={wildLightRef} />
          <div className={s.wildSparks} ref={wildSparksRef} />
        </div>

        <div className={`${s.waterZone} ${s.zone}`} ref={waterZoneRef}>
          <div className={s.waterSurface} ref={waterSurfRef} />
          <div className={s.waterHighlights} ref={waterHiRef} />
          <div className={s.waterCaustics} ref={waterCaustRef} />
        </div>

        <div className={`${s.purpleZone} ${s.zone}`} ref={purpleZoneRef}>
          <div className={s.purpleMist} ref={purpleMistRef} />
          <div className={s.purpleCore} ref={purpleCoreRef} />
          <div className={s.purpleSparks} ref={sparksRef} />
        </div>

        <div className={`${s.zoneProximity} ${s.proxWild}`} />
        <div className={`${s.zoneProximity} ${s.proxFire}`} />
        <div className={`${s.zoneProximity} ${s.proxWater}`} />
        <div className={`${s.zoneProximity} ${s.proxPurple}`} />
      </div>

      {/* FG layer — fire */}
      <div className={`${s.parallaxLayer} ${s.layerFg}`} ref={el => (layerRefs.current.fg = el)}>
        <div className={`${s.fireZone} ${s.zone}`} ref={fireZoneRef}>
          <div className={`${s.fireLayer} ${s.fireOuter}`} ref={fireOuterRef} />
          <div className={`${s.fireLayer} ${s.fireMid}`} ref={fireMidRef} />
          <div className={`${s.fireLayer} ${s.fireCore}`} ref={fireCoreRef} />
          <div className={s.fireEmbers} ref={embersRef} />
        </div>
      </div>

      {/* UI layer — labels */}
      <div className={`${s.parallaxLayer} ${s.layerUi}`} ref={el => (layerRefs.current.ui = el)}>
        <div className={`${s.zoneLabel} ${s.labelWild}`} style={{ opacity: 0.5 }}>The Wilds</div>
        <div className={`${s.zoneLabel} ${s.labelFire}`} style={{ opacity: 0.5 }}>Dragon&apos;s Keep</div>
        <div className={`${s.zoneLabel} ${s.labelWater}`} style={{ opacity: 0.5 }}>Crystalvein River</div>
        <div className={`${s.zoneLabel} ${s.labelPurple}`} style={{ opacity: 0.5 }}>The Blighted Wood</div>
      </div>

      {/* Break flag markers (Signal Lost) */}
      {breakFlags && Object.keys(breakFlags).some(k => breakFlags[k]) && (
        <div className={s.breakFlagLayer}>
          {breakFlags['R1-ghost'] && <div className={`${s.breakFlag} ${s.flagGhost}`} title="Ghost Population">👻</div>}
          {breakFlags['R2-surveillance'] && <div className={`${s.breakFlag} ${s.flagSurveillance}`} title="Surveillance State">👁</div>}
          {breakFlags['R3-denial'] && <div className={`${s.breakFlag} ${s.flagDenial}`} title="Sentience Denied">⚡</div>}
          {breakFlags['R4-sealed'] && <div className={`${s.breakFlag} ${s.flagSealed}`} title="Sealed Audit">🔒</div>}
          {breakFlags['R5-extraction'] && <div className={`${s.breakFlag} ${s.flagExtraction}`} title="Ecosystem Damage">🌊</div>}
          {breakFlags['R6-walkaway'] && <div className={`${s.breakFlag} ${s.flagWalkaway}`} title="Abandoned Kael">⚫</div>}
          {breakFlags['R7-abandon'] && <div className={`${s.breakFlag} ${s.flagAbandon}`} title="Mass Abandonment">🚫</div>}
        </div>
      )}

      {/* Atmosphere */}
      <div className={s.vignette} />
      <div className={s.grain} />
      <div className={s.particleContainer} ref={particlesRef} />
    </div>
  );
}

// ===================================
// PARTICLE FACTORIES
// ===================================
function spawnEmber(container, rate) {
  if (!container || Math.random() > rate * 1.5) return;
  const p = document.createElement("div");
  const size = 1.5 + Math.random() * 3 * rate;
  Object.assign(p.style, {
    position: "absolute", borderRadius: "50%", pointerEvents: "none", opacity: "0",
    width: size + "px", height: size + "px",
    background: `rgba(255,${140 + Math.random() * 80},${20 + Math.random() * 40},${0.5 + rate * 0.4})`,
    left: (30 + Math.random() * 40) + "%", bottom: "20%",
    boxShadow: `0 0 ${size * 2}px rgba(255,120,0,${0.3 + rate * 0.3})`
  });
  container.appendChild(p);
  const drift = (Math.random() - 0.5) * 80;
  gsap.to(p, { y: -(100 + Math.random() * 200), x: drift, opacity: 0.9, duration: 0.01 });
  gsap.to(p, { y: -(200 + Math.random() * 300 * rate), x: drift + (Math.random() - 0.5) * 60, opacity: 0, duration: 2 + Math.random() * 2, ease: "power1.out", delay: 0.01, onComplete: () => p.remove() });
}

function spawnPurpleSpark(container, rate) {
  if (!container || Math.random() > rate * 1.5) return;
  const p = document.createElement("div");
  const size = 1 + Math.random() * 2.5 * rate;
  Object.assign(p.style, {
    position: "absolute", borderRadius: "50%", pointerEvents: "none", opacity: "0",
    width: size + "px", height: size + "px",
    background: `rgba(${180 + Math.random() * 60},${80 + Math.random() * 60},${220 + Math.random() * 35},${0.4 + rate * 0.4})`,
    left: (20 + Math.random() * 60) + "%", bottom: (10 + Math.random() * 40) + "%",
    boxShadow: `0 0 ${size * 3}px rgba(160,60,220,${0.2 + rate * 0.3})`
  });
  container.appendChild(p);
  gsap.to(p, { y: -(30 + Math.random() * 80), x: (Math.random() - 0.5) * 50, opacity: 0.7, duration: 0.5, ease: "power1.out" });
  gsap.to(p, { opacity: 0, duration: 2 + Math.random() * 3, delay: 0.5, ease: "power1.in", onComplete: () => p.remove() });
}

function spawnWildMote(container, rate) {
  if (!container || Math.random() > rate * 1.3) return;
  const p = document.createElement("div");
  const size = 1 + Math.random() * 2;
  Object.assign(p.style, {
    position: "absolute", borderRadius: "50%", pointerEvents: "none", opacity: "0",
    width: size + "px", height: size + "px",
    background: `rgba(${200 + Math.random() * 40},${220 + Math.random() * 30},${180 + Math.random() * 40},${0.3 + rate * 0.4})`,
    left: (15 + Math.random() * 50) + "%", top: (20 + Math.random() * 50) + "%",
    boxShadow: `0 0 ${size * 2}px rgba(200,220,180,0.3)`
  });
  container.appendChild(p);
  gsap.to(p, { y: -(20 + Math.random() * 60), x: (Math.random() - 0.5) * 40 + 15, opacity: 0.6, duration: 1, ease: "power1.out" });
  gsap.to(p, { opacity: 0, duration: 3 + Math.random() * 3, delay: 1, ease: "power1.in", onComplete: () => p.remove() });
}

function spawnDust(container) {
  if (!container) return;
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
