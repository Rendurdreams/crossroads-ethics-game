/**
 * CommandHUD — Cinematic background for Signal Lost host screen.
 *
 * Three visual states driven by session status:
 *   lobby / idle      → Static map with ambient pulse
 *   active            → Looping video (command HUD in motion)
 *   round_complete    → Reveal video plays once, then holds on static
 *
 * Props:
 *   phase: 'idle' | 'active' | 'reveal' | 'finished'
 *   worldHealth: 0-100 (drives tint/intensity)
 */

import { useRef, useEffect, useState } from 'react'
import staticSrc from '../assets/bg/command-hud-static.png'
import activeSrc from '../assets/bg/command-hud-active.mp4'
import revealSrc from '../assets/bg/command-hud-reveal.mp4'
import styles from './CommandHUD.module.css'

export default function CommandHUD({ phase = 'idle', worldHealth = 65 }) {
  const activeRef = useRef(null)
  const revealRef = useRef(null)
  const [revealDone, setRevealDone] = useState(false)

  // Control active video
  useEffect(() => {
    const vid = activeRef.current
    if (!vid) return
    if (phase === 'active') {
      vid.play().catch(() => {})
    } else {
      vid.pause()
    }
  }, [phase])

  // Control reveal video
  useEffect(() => {
    const vid = revealRef.current
    if (!vid) return
    if (phase === 'reveal') {
      setRevealDone(false)
      vid.currentTime = 0
      vid.play().catch(() => {})
    } else {
      vid.pause()
    }
  }, [phase])

  function handleRevealEnd() {
    setRevealDone(true)
  }

  // Tint based on world health: red glow when low, cyan when high
  const healthHue = worldHealth >= 50 ? 190 : 0
  const healthSat = Math.abs(worldHealth - 50) * 2
  const tintOpacity = 0.15 + (Math.abs(worldHealth - 50) / 100) * 0.2

  const showStatic = phase === 'idle' || phase === 'finished' || (phase === 'reveal' && revealDone)
  const showActive = phase === 'active'
  const showReveal = phase === 'reveal' && !revealDone

  return (
    <div className={styles.container}>
      {/* Static map — always loaded, shown in idle/finished/post-reveal */}
      <img
        src={staticSrc}
        alt=""
        className={`${styles.layer} ${styles.staticImg} ${showStatic ? styles.visible : styles.hidden}`}
      />

      {/* Active loop — plays during rounds */}
      <video
        ref={activeRef}
        src={activeSrc}
        muted
        loop
        playsInline
        preload="auto"
        className={`${styles.layer} ${styles.video} ${showActive ? styles.visible : styles.hidden}`}
      />

      {/* Reveal video — plays once on round close */}
      <video
        ref={revealRef}
        src={revealSrc}
        muted
        playsInline
        preload="auto"
        onEnded={handleRevealEnd}
        className={`${styles.layer} ${styles.video} ${showReveal ? styles.visible : styles.hidden}`}
      />

      {/* Health tint overlay */}
      <div
        className={styles.tintOverlay}
        style={{
          background: `radial-gradient(ellipse at center, hsla(${healthHue}, ${healthSat}%, 50%, ${tintOpacity}) 0%, transparent 70%)`
        }}
      />

      {/* Ambient scan line */}
      <div className={styles.scanLine} />

      {/* Vignette */}
      <div className={styles.vignette} />
    </div>
  )
}
