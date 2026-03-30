# Claude Code Integration Prompt

Copy-paste this into Claude Code in your game codebase:

---

```
I'm replacing the KingdomCanvas (Three.js / React Three Fiber) component
with a new 2D animated map. The ready-to-integrate files are at:

  /Users/jay/MapAnimation/integration/AnimatedMap.jsx
  /Users/jay/MapAnimation/integration/AnimatedMap.module.css
  /Users/jay/MapAnimation/Map1.png

Here's what I need you to do:

1. INSTALL GSAP
   npm install gsap
   (We already have framer-motion — keep it, they coexist fine.)

2. COPY FILES INTO THE CODEBASE
   - Copy Map1.png → src/assets/Map1.png
   - Copy AnimatedMap.jsx → src/components/AnimatedMap.jsx
   - Copy AnimatedMap.module.css → src/components/AnimatedMap.module.css

3. FIX THE IMAGE IMPORT PATH
   In AnimatedMap.jsx, the import says:
     import mapSrc from "../assets/Map1.png";
   Adjust this path if the codebase puts assets elsewhere.

4. WIRE UP IN Host.jsx
   Find where KingdomCanvas is rendered and replace it with AnimatedMap.
   It takes the same prop shape:
     <AnimatedMap worldState={worldState} lerpSpeedRef={lerpSpeedRef} />

   The worldState object must have: { Honesty, Courage, Loyalty, Empathy }
   each as 0–100 numbers. Verify the existing prop names match — if the
   game uses different keys (like "trust" instead of "Honesty"), add a
   mapping object at the top of Host.jsx.

5. ADD COMPASS KEYFRAMES TO CSS
   The compass spin uses a CSS @keyframes that must be global (not in the
   CSS module) because it's set via inline style. Add this to src/index.css:

   @keyframes compassSpin {
     from { transform: rotate(0deg); }
     to   { transform: rotate(360deg); }
   }

6. OPTIONAL: REMOVE THREE.JS DEPENDENCIES
   Once confirmed working, remove unused Three.js packages:
     npm uninstall three @react-three/fiber @react-three/drei
   And delete the old components under src/components/three/

7. VERIFY
   - Run the dev server (npm run dev)
   - Confirm the map renders at 60fps
   - Confirm zones react when worldState changes
   - Move your mouse — parallax + cursor light + proximity labels should work
   - Click anywhere — ripple effect should appear

DO NOT modify AnimatedMap.jsx or AnimatedMap.module.css beyond the
asset import path fix. The component is tested and working.
```

---

## Zone ↔ Meter Mapping Reference

| Zone             | Game Meter  | Effect at 0         | Effect at 100       |
|------------------|-------------|---------------------|---------------------|
| Fire (castle)    | Courage     | Faint glow          | Blazing, scaled up  |
| Water (river)    | Honesty     | Barely visible       | Full shimmer + ripple |
| Purple (forest)  | Empathy     | Dim mist             | Vivid pulsing glow  |
| Compass (top)    | Loyalty     | Very slow spin (120s)| Fast spin (20s) + bright glow |

## Architecture Notes

- Component uses `useRef` + `useEffect` for GSAP — no GSAP/React conflicts
- All tweens and intervals are cleaned up on unmount
- Particles are DOM elements (not canvas) — keeps it simple, performs fine for this count
- The SVG turbulence filter for water is inline in JSX
- CSS Module handles all class scoping — no global style leaks except compassSpin keyframe
