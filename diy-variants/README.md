# DIY guide · variation round (12 variants)

Review round for the DIY project mobile app: four screens, three directions
each. Built on the same dc-runtime + iOS 26 frame as the published prototype,
so every variant is clickable and Claude Design-tweakable.

Open `index.html` for the overview, or any variation page directly:

| File | V1 | V2 | V3 |
|---|---|---|---|
| `Explore Variations.dc.html` | Carousel (slimmed headline) | Projects catalogue | Cover feed |
| `Guide Variations.dc.html` | Classic hero | Compact split + “View in 3D assembly” | Immersive full-bleed |
| `Steps Variations.dc.html` | Checklist (44 pt step checkboxes) | “Up next” card | Timeline rail |
| `Profile Variations.dc.html` | Stat tiles | Project shelf | Signed out / offline / empty |

Every page has a toolbar with variant chips and device-size chips —
SE (375 × 667), Standard (393 × 852), Pro Max (430 × 932) — and accepts
deep links: `?v=2&size=se`.

## Approved audit fixes folded into every variant

- Onboarding headline block slimmed (Explore V1) or dropped in steady state
  (Explore V2/V3).
- Redundant per-step "Not started / In progress" status lines removed; state
  is carried by the step check ring/fill and the progress bar.
- Parts-sheet per-row hairlines removed; a single rule separates the
  "Estimated cost" total.
- Offline banner and empty state de-boxed (Profile V3) — plain lines, no
  bordered containers.
- "Prototype 0.4.0" version footer removed everywhere.
- Signed-out copy tightened: "Keep your builds with you. Sign in to save
  progress on every device."
- AR control: dropped in Guide V1/V3; in Guide V2 the slot has a clear job —
  "View in 3D assembly" opens the interactive 3D player. The label stays
  honest (not "View in AR") until real AR exists.
- All guide costs render as NOK in display copy ("About NOK 1,200");
  underlying guide data untouched pending spec re-lock.
- Profile V1 stat is a pure label/value pair ("Parts spent" / "NOK 1,840")
  so retail-anchor labels can swap in without layout changes.

## iPhone-size requirements

- No magic-number bottom offsets: the tab bar exports its metrics
  (`IOSTabBarMetrics` in `ios-frame.jsx`; bottom 46 = 34 safe area + 12 gap,
  height 58). Scrolling content reserves `inset` (116 px) and floating CTAs
  anchor to the same metrics.
- Heroes and product imagery scale from the device canvas (percent heights,
  aspect-ratio boxes, `object-fit: contain`) — no fixed image heights.
- On SE, product identity + primary action stay above the fold on Explore
  and the guide header in all variants.
- Tap targets ≥ 44 pt, including the step-number checkboxes (44 × 44 hit
  area around the 30 px visual) and the sheets' close buttons.

## ios-frame.jsx extension (non-breaking)

`IOSDevice` gains an optional `size` prop (`se` / `standard` / `promax`);
explicit `width`/`height` still win and the default stays 402 × 874. New
exports: `IOS_SIZES`, `IOSTabBar`, `IOSTabBarMetrics`. Existing pages that
use the frame are unaffected.

## Files

- `Explore/Guide/Steps/Profile Variations.dc.html` — the four variation pages
- `index.html` — round overview with deep links
- `ios-frame.jsx` — extended device frame (see above)
- `support.js` — dc-runtime (unchanged copy)
- `Etagere Assembly.dc.html`, `animations-v3.jsx`, `tweaks-panel.jsx`,
  `etagere-scene.jsx`, `stainless-etagere.obj` — the 3D assembly player used
  by Guide V1/V2/V3 ("Watch assembly" / "View in 3D assembly")
- `Ori Build Guide.dc.html` — unmodified reference copy so ORI links resolve
  (back link points to Explore)
- `assets/elements/` — product cutouts and part photos
