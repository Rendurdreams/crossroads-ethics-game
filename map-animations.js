/**
 * MAP ANIMATION TRIGGER SYSTEM
 * Drop this into your codebase. Import or <script src> it.
 *
 * SETUP:
 *   const map = new MapAnimator({
 *     mapEl:    document.getElementById('your-map-img'),
 *     svgEl:    document.getElementById('your-svg-overlay'),
 *     videoDir: './assets/videos/',   // folder where your .mp4s live
 *   });
 *
 * THEN register your regions:
 *   map.addRegion('citadel', {
 *     polygon:  [[58,0],[100,0],[100,48],[72,55],[60,42],[58,20]], // % coords
 *     hoverFill: 'rgba(224,92,0,0.28)',
 *     hoverStroke: 'rgba(255,140,0,0.9)',
 *     pin: { x: 82, y: 22, label: 'The Burning Citadel', style: 'fire' },
 *   });
 *
 * THEN wire triggers to your game logic:
 *   map.onRegionClick('citadel', () => yourGame.openDilemma('citadel'));
 *
 *   map.trigger('citadel', 'pulse');          // one-shot pulse
 *   map.trigger('citadel', 'video', 'fire.mp4'); // fullscreen video overlay
 *   map.trigger('citadel', 'completed');      // mark done, dim the pin
 *   map.trigger('citadel', 'unlock');         // animate in a new region
 */

class MapAnimator {
  constructor({ mapEl, svgEl, videoDir = '' }) {
    this.mapEl    = mapEl;
    this.svgEl    = svgEl;
    this.videoDir = videoDir;
    this.regions  = {};

    this._injectStyles();
    this._buildVideoOverlay();
  }

  // ─────────────────────────────────────────────
  // REGISTER A REGION
  // ─────────────────────────────────────────────
  addRegion(id, {
    polygon,          // [[x,y], ...] in % of map dimensions
    hoverFill   = 'rgba(200,168,76,0.22)',
    hoverStroke = 'rgba(200,168,76,0.8)',
    pin         = null,  // { x, y, label, style }
  }) {
    // Build SVG path
    const pts = polygon.map(([x, y]) => `${x},${y}`).join(' ');
    const poly = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    poly.setAttribute('points', pts);
    poly.setAttribute('fill', 'transparent');
    poly.setAttribute('stroke', 'transparent');
    poly.setAttribute('data-region', id);
    poly.classList.add('ma-region');
    poly.style.cssText = `cursor:pointer; transition: fill .25s, stroke .25s;`;

    poly.addEventListener('mouseenter', () => {
      poly.style.fill   = hoverFill;
      poly.style.stroke = hoverStroke;
      poly.style.strokeWidth = '1.5';
    });
    poly.addEventListener('mouseleave', () => {
      poly.style.fill   = 'transparent';
      poly.style.stroke = 'transparent';
    });

    this.svgEl.appendChild(poly);

    // Build pin if provided
    let pinEl = null;
    if (pin) {
      pinEl = this._buildPin(pin);
      this.mapEl.parentElement.appendChild(pinEl);
    }

    this.regions[id] = { id, poly, pinEl, hoverFill, hoverStroke, _callbacks: {} };
    return this; // chainable
  }

  // ─────────────────────────────────────────────
  // BIND CLICK HANDLER
  // ─────────────────────────────────────────────
  onRegionClick(id, callback) {
    const r = this._get(id);
    r.poly.addEventListener('click', callback);
    if (r.pinEl) r.pinEl.addEventListener('click', callback);
    return this;
  }

  // ─────────────────────────────────────────────
  // TRIGGERS  — call these from your game logic
  // ─────────────────────────────────────────────
  trigger(id, type, payload) {
    const r = this._get(id);

    switch (type) {

      // Flash-pulse the region once (e.g. on new event arriving)
      case 'pulse':
        this._pulse(r, payload?.color);
        break;

      // Play a video as a fullscreen blend overlay (screen blend mode)
      // payload = filename string, e.g. 'fire.mp4'
      case 'video':
        this._playOverlay(payload);
        break;

      // Play video INSIDE a target element (e.g. your dilemma panel)
      // payload = { file: 'fire.mp4', el: HTMLElement }
      case 'video-in':
        this._playInEl(payload.file, payload.el);
        break;

      // Mark region as done — dims the pin, stops pulsing
      case 'completed':
        r.pinEl?.classList.add('ma-pin--done');
        r.poly.style.pointerEvents = 'none';
        break;

      // Unlock region — animates pin in from hidden
      case 'unlock':
        r.pinEl?.classList.add('ma-pin--visible');
        this._pulse(r, payload?.color, 3); // triple pulse on unlock
        break;

      // Tint the region a persistent color (e.g. after a choice)
      // payload = 'rgba(r,g,b,a)'
      case 'tint':
        r.poly.style.fill = payload;
        r.poly.style.transition = 'fill 1.2s ease';
        break;

      // Shake the pin (danger / crisis event)
      case 'shake':
        r.pinEl?.classList.add('ma-shake');
        r.pinEl?.addEventListener('animationend', () =>
          r.pinEl.classList.remove('ma-shake'), { once: true });
        break;

      // FOG effect — adds a dark semi-transparent shimmer over the region
      case 'fog':
        r.poly.style.fill = 'rgba(60,20,80,0.35)';
        r.poly.style.animation = 'ma-fog 4s ease-in-out infinite';
        break;
    }
    return this;
  }

  // ─────────────────────────────────────────────
  // INTERNAL HELPERS
  // ─────────────────────────────────────────────

  _get(id) {
    if (!this.regions[id]) throw new Error(`MapAnimator: no region '${id}' registered`);
    return this.regions[id];
  }

  _pulse(r, color = r.hoverFill, count = 1) {
    let i = 0;
    const flash = () => {
      r.poly.style.fill = color;
      r.poly.style.stroke = r.hoverStroke;
      setTimeout(() => {
        r.poly.style.fill   = 'transparent';
        r.poly.style.stroke = 'transparent';
        if (++i < count) setTimeout(flash, 400);
      }, 300);
    };
    flash();
  }

  _playOverlay(filename) {
    this._overlayVideo.src = this.videoDir + filename;
    this._overlayEl.style.display = 'block';
    this._overlayEl.style.animation = 'none';
    // force reflow then re-apply animation
    void this._overlayEl.offsetWidth;
    this._overlayEl.style.animation = 'ma-overlay-fadeinout 5s ease forwards';
    this._overlayVideo.play();
    setTimeout(() => {
      this._overlayEl.style.display = 'none';
      this._overlayVideo.src = '';
    }, 5200);
  }

  _playInEl(filename, targetEl) {
    let vid = targetEl.querySelector('.ma-inline-video');
    if (!vid) {
      vid = document.createElement('video');
      vid.className = 'ma-inline-video';
      vid.autoplay = true; vid.loop = true; vid.muted = true; vid.playsInline = true;
      vid.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block;';
      targetEl.appendChild(vid);
    }
    vid.src = this.videoDir + filename;
    vid.play();
  }

  _buildPin({ x, y, label, style = 'default', hidden = false }) {
    const pin = document.createElement('div');
    pin.className = `ma-pin ma-pin--${style}${hidden ? '' : ' ma-pin--visible'}`;
    pin.style.cssText = `position:absolute; left:${x}%; top:${y}%; transform:translate(-50%,-50%);
      pointer-events:auto; cursor:pointer; display:flex; flex-direction:column;
      align-items:center; gap:4px; z-index:4;`;

    pin.innerHTML = `
      <div class="ma-pin-dot"></div>
      <div class="ma-pin-label">${label}</div>
    `;
    return pin;
  }

  _buildVideoOverlay() {
    this._overlayEl = document.createElement('div');
    this._overlayEl.style.cssText = `
      position:fixed; inset:0; z-index:9999; display:none; pointer-events:none;
    `;
    this._overlayVideo = document.createElement('video');
    this._overlayVideo.muted = true;
    this._overlayVideo.playsInline = true;
    this._overlayVideo.style.cssText = `
      width:100%; height:100%; object-fit:cover;
      opacity:0.5; mix-blend-mode:screen;
    `;
    this._overlayEl.appendChild(this._overlayVideo);
    document.body.appendChild(this._overlayEl);
  }

  _injectStyles() {
    if (document.getElementById('ma-styles')) return;
    const s = document.createElement('style');
    s.id = 'ma-styles';
    s.textContent = `
      /* ── PIN STYLES ── */
      .ma-pin { opacity: 0; transition: opacity .6s ease; }
      .ma-pin--visible { opacity: 1; }
      .ma-pin--done .ma-pin-dot { opacity: 0.3 !important; animation: none !important; }
      .ma-pin--done .ma-pin-dot::after { display: none !important; }
      .ma-pin--done .ma-pin-label { opacity: 0.3; }

      .ma-pin-dot {
        width: 12px; height: 12px; border-radius: 50%; position: relative;
        background: currentColor;
      }
      .ma-pin-dot::after {
        content: ''; position: absolute; inset: -4px; border-radius: 50%;
        border: 2px solid currentColor;
        animation: ma-ripple 2.2s ease-out infinite;
      }
      .ma-pin-label {
        font-size: 10px; white-space: nowrap;
        text-shadow: 0 1px 4px rgba(0,0,0,.9), 0 0 10px currentColor;
      }

      /* Pin color themes — set color on .ma-pin-dot and .ma-pin-label via currentColor */
      .ma-pin--fire   { color: #ff8844; }
      .ma-pin--shadow { color: #cc55ff; }
      .ma-pin--forest { color: #55cc88; }
      .ma-pin--water  { color: #44ccee; }
      .ma-pin--gold   { color: #f0d080; }
      .ma-pin--ice    { color: #aaddff; }
      .ma-pin--default{ color: #c9a84c; }

      /* ── ANIMATIONS ── */
      @keyframes ma-ripple {
        0%   { transform: scale(1); opacity: .8; }
        100% { transform: scale(3.5); opacity: 0; }
      }
      @keyframes ma-overlay-fadeinout {
        0%   { opacity: 0; }
        12%  { opacity: 1; }
        80%  { opacity: 1; }
        100% { opacity: 0; }
      }
      @keyframes ma-fog {
        0%, 100% { opacity: .3; }
        50%       { opacity: .6; }
      }
      @keyframes ma-shake {
        0%,100% { transform: translate(-50%,-50%) translateX(0); }
        20%     { transform: translate(-50%,-50%) translateX(-5px); }
        40%     { transform: translate(-50%,-50%) translateX(5px); }
        60%     { transform: translate(-50%,-50%) translateX(-4px); }
        80%     { transform: translate(-50%,-50%) translateX(4px); }
      }
      .ma-shake { animation: ma-shake .5s ease; }
    `;
    document.head.appendChild(s);
  }
}

// ─────────────────────────────────────────────
// USAGE EXAMPLE (remove or adapt for your codebase)
// ─────────────────────────────────────────────
/*
const map = new MapAnimator({
  mapEl:    document.getElementById('map-img'),
  svgEl:    document.getElementById('region-svg'),
  videoDir: './videos/',
});

map.addRegion('citadel', {
  polygon: [[58,0],[100,0],[100,48],[72,55],[60,42],[58,20]],
  hoverFill:   'rgba(224,92,0,0.28)',
  hoverStroke: 'rgba(255,140,0,0.9)',
  pin: { x: 82, y: 22, label: 'The Burning Citadel', style: 'fire' },
});

// Hook into YOUR game logic:
map.onRegionClick('citadel', () => {
  myGame.openDilemma('citadel');
});

// Call triggers from anywhere in your code:
map.trigger('citadel', 'video', 'fire_explosion.mp4');   // fullscreen screen-blend
map.trigger('citadel', 'pulse');                          // flash the region
map.trigger('citadel', 'completed');                      // dim when done
map.trigger('citadel', 'shake');                          // danger alert
map.trigger('citadel', 'tint', 'rgba(255,60,0,0.3)');    // persistent aftermath color
map.trigger('citadel', 'fog');                            // cursed/mystery state
map.trigger('citadel', 'unlock');                         // new area unlocked

// Play video inside a panel element (e.g. your dilemma UI):
map.trigger('citadel', 'video-in', {
  file: 'fire_ambience.mp4',
  el:   document.getElementById('your-panel-video-slot'),
});
*/
