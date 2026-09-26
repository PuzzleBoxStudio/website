# PuzzleBox Studio — cinematic static prototype

A clean new static site direction for PuzzleBox Studio, inspired by the cinematic scroll/HUD feel of the Iron Man reference site without copying its IP or assets.

## Current visual reference

The site now uses the rootbound relic logo as the closest brand reference:

- Source: `C:\Users\xpert\Documents\HermesImages\PuzzleBoxStudio\Logo\primal_round\puzzlebox_primal_1_rootbound_relic_246092212647387.png`
- Site copy: `assets/rootbound-relic-reference.png`

Design cues pulled from the image:

- pale chipped bone/ivory puzzle pieces
- muddy teal-gray insets
- rust-red plates
- realistic brown roots/vines wrapping across the cube
- moss and forest-floor dirt
- soft warm ember glow from the center
- no cyan neon, no clean sci-fi circuits, no glossy plastic

## Art direction

A PuzzleBox Studio site that feels like a rootbound handcrafted puzzle relic being examined inside a dark forest archive, using chipped ivory stone, muddy teal-gray inserts, rust plates, real vines, moss, forest dirt, and warm ember light, with precise HUD-style archive readouts and one signature interaction: scroll-scrubbing through the relic awakening.

## Files

- `index.html` — semantic single-page structure
- `styles.css` — dark rootbound relic/HUD visual system
- `script.js` — procedural canvas relic reveal and scroll interaction
- `assets/rootbound-relic-reference.png` — current logo/reference image

## Open locally

Double-click `index.html`, or serve the folder:

```bash
python3 -m http.server 3000
```

Then open:

```text
http://localhost:3000
```

## Production next step

Replace the procedural canvas object with a real Blender-rendered PuzzleBox relic image sequence based on the rootbound logo reference. Recommended frame sequence: 80–120 optimized WebP frames, 1920x1080, with a poster fallback.
