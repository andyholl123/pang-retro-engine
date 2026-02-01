# 16-BIT MODE RULES
## Sega Mega Drive / Genesis & Neo Geo Arcade Style (1988-1996)

This document defines the MANDATORY rules for 16-Bit Mode rendering.
All code changes affecting 16-Bit Mode MUST comply with these rules.

**Design Philosophy**: Design like you don't know which 16-bit arcade machine you're shipping on.
If it runs and looks right everywhere, it's correct.

---

## TARGET PLATFORMS

| Platform | Year | Notes |
|----------|------|-------|
| **Sega Mega Drive / Genesis** | 1988-1997 | Primary target |
| **Neo Geo (MVS / AES)** | 1990-2004 | Arcade reference |
| **CPS1/CPS2 Arcade** | 1988-1996 | Visual reference |
| **PC Engine** | 1987-1994 | Similar capabilities |

### Supported Genres

- Arcade beat 'em ups (Final Fight / Streets of Rage)
- Sprite-scaled racers (OutRun-style)
- Top-down racers (Super Sprint / Neo Drift Out style)
- Single-screen action (Pang, Breakout)

---

## RULE 1: RESOLUTION & SCREEN (ABSOLUTE)

| Property | Value | Notes |
|----------|-------|-------|
| **Resolution** | 320 × 224 | Fixed, NTSC standard |
| **Scaling** | NONE | No scaling, stretching, or letterboxing |
| **Aspect Ratio** | 10:7 | Square pixels on CRT |
| **Display Scale** | 3× | For modern displays |
| **Frame Rate** | 60 FPS | NTSC (50 FPS PAL) |

### CRT Overscan Safety

```
+----------------------------------------+
|  UNSAFE ZONE (may be cut off on CRT)   |
|  +----------------------------------+  |
|  |      SAFE ZONE (HUD here)        |  |  <- 8px margin
|  |                                  |  |
|  |       GAMEPLAY AREA              |  |
|  |                                  |  |
|  +----------------------------------+  |
+----------------------------------------+

Safe margins: 8px from each edge
HUD should be within 8-24px from top/bottom
```

### Screen Framing Rules

- Keep HUD within safe margins (8px from edges)
- Vertical gameplay framing must work for both brawlers and racers
- Ground plane around 160-176px from top (for beat 'em ups)
- No reliance on edge-to-edge visibility

---

## RULE 2: COLOUR & PALETTE (CRITICAL)

### Colour Budget

| Element | Max Colours | Notes |
|---------|-------------|-------|
| **Total on screen** | 32-64 | Portable limit |
| **Background layers** | 8-16 | Per layer |
| **Sprites** | 8-16 | Per sprite |
| **UI/Text** | 4 | Keep simple |

### Palette Rules

- **Palettes fixed per level** - changes only between scenes
- **Palette cycling allowed** - but only for subtle effects (water, lights)
- **No mid-frame palette swaps** in gameplay
- Colour 0 of each palette is transparent (for sprites)

### Megadrive Colour Format (9-bit RGB)

```javascript
// Megadrive uses 3 bits per channel (8 levels each)
// Total: 8 × 8 × 8 = 512 possible colours

function snapTo16BitPalette(hexColour) {
    const r = parseInt(hexColour.slice(1, 3), 16);
    const g = parseInt(hexColour.slice(3, 5), 16);
    const b = parseInt(hexColour.slice(5, 7), 16);
    
    // Snap to 3-bit (8 levels) per channel
    const r3 = Math.round(r / 255 * 7);
    const g3 = Math.round(g / 255 * 7);
    const b3 = Math.round(b / 255 * 7);
    
    // Convert back to 8-bit for display
    const r8 = Math.round(r3 * 255 / 7);
    const g8 = Math.round(g3 * 255 / 7);
    const b8 = Math.round(b3 * 255 / 7);
    
    return `#${r8.toString(16).padStart(2,'0')}${g8.toString(16).padStart(2,'0')}${b8.toString(16).padStart(2,'0')}`;
}
```

### Palette Organisation

| Palette | Typical Usage |
|---------|---------------|
| 0 | Background 1, environment |
| 1 | Background 2, structures |
| 2 | Player, harpoon, power-ups |
| 3 | Balls, enemies, effects |

---

## RULE 3: RENDERING & GRAPHICS MODEL

### Tile-Based System

| Property | Value | Notes |
|----------|-------|-------|
| **Background tiles** | 8 × 8 pixels | Base unit |
| **Sprite blocks** | 16 × 16 pixels | Built from 8×8 tiles |
| **Max tiles in VRAM** | 2048 | Shared between BG and sprites |

### Transparency Rules

- **No true alpha blending** - hardware doesn't support it
- **One transparent colour per sprite** - always colour 0
- **Shadows** - implemented as darkened duplicate sprites (optional)
- Semi-transparent overlays FORBIDDEN in authentic mode

### Screen Composition (Back to Front)

```
1. Background colour (solid)
2. Plane B (back background layer)
3. Low-priority sprites
4. Plane A (front background layer)  
5. High-priority sprites
```

---

## RULE 4: SPRITE SPECIFICATIONS

### Hardware Limits

| Property | Mega Drive | Neo Geo | Portable Limit |
|----------|------------|---------|----------------|
| **Max sprites** | 80 | 380 | 80 |
| **Max per scanline** | 20 | 96 | 20 |
| **Sprite sizes** | 8-32px | 16-512px | 8-32px |
| **Colours per sprite** | 16 | 16 | 16 |

### Sprite Size Guidelines

| Element | Recommended Size | Notes |
|---------|------------------|-------|
| Player sprite | 16×16 to 32×32 | 48-64px for beat 'em ups |
| Small balls | 8×8 | Single tile |
| Medium balls | 16×16 | Standard sprite |
| Large balls | 24×24 | 3×3 tiles |
| HUD elements | 8×8 base | Compose from tiles |

### Sprite Overflow Behaviour

When exceeding scanline limits (20 per line):
- Sprites beyond limit are NOT drawn on that line
- Creates "sprite flicker" effect
- Lower-numbered sprites have priority

**Design Rule**: Spread sprites vertically. Don't cluster on same Y.

---

## RULE 5: PERFORMANCE & PORTABILITY (CRITICAL)

### What Is Allowed

- CPU-driven game logic
- Frame drops tolerated (must recover gracefully)
- Standard sprite/tile rendering
- Per-line scroll (parallax) - sparingly
- Palette cycling for water/light effects

### What Is FORBIDDEN

- Cycle-exact raster tricks
- Copper-only effects (Amiga-specific)
- Hardware-only features not on both platforms
- Per-scanline distortion tricks
- Rotation (no hardware support)
- True scaling (except sprite-strip tricks)

### Golden Rule

**If it requires knowing exact CPU cycle counts, don't do it.**
Game logic must remain platform-agnostic.

---

## RULE 6: ASSET & STORAGE CONSTRAINTS

### Memory Rules

| Constraint | Rule |
|------------|------|
| Tiling | Assets MUST be tiled and reused |
| Bitmap swaps | NO full-screen bitmap swaps mid-game |
| Loading | Level-based loading only |
| Storage | Assume cartridge/floppy-era limits |

### Asset Efficiency

- **Reuse sprite frames** - flip horizontally/vertically
- **Palette swap enemies** - same sprite, different palette
- **Tile backgrounds aggressively** - 8×8 tiles compose larger patterns
- **Compress where possible** - RLE for tile data

---

## RULE 7: ART STYLE GUIDANCE

### Visual Principles

| Principle | Description |
|-----------|-------------|
| **Strong silhouettes** | Characters readable at glance |
| **Clear contrast** | Foreground pops from background |
| **Limited colour ramps** | 3-4 shades per colour |
| **Subtle dithering** | Ordered only, if at all |
| **No gradients** | No photographic gradients |

### Art Style Rules

- Must look correct on **both CRT and LCD**
- Avoid single-pixel details that disappear on CRT
- Use clean, bold shapes
- Test on blurry display (CRT simulation)

### Dithering Guidelines

- **Ordered dithering only** (if used at all)
- **Never use noise/error diffusion**
- Keep patterns stable (no shimmer)
- Prefer flat fills over dithered areas

---

## RULE 8: GENRE-SPECIFIC CONSTRAINTS

### Beat 'Em Up Rules (Streets of Rage / Final Fight)

| Property | Value |
|----------|-------|
| Camera | Side-scrolling, limited vertical |
| Ground plane | 160-176px from top |
| Player height | 48-64px sprites |
| Enemy height | Slightly taller than player |
| HUD position | Top, max 32px height |
| Parallax | Avoid excessive |

### Sprite-Scaled Racer Rules (OutRun-style)

| Property | Value |
|----------|-------|
| Perspective | Sprite scaling, NOT polygons |
| Road | Horizontally scaled sprite strips OR tile rows |
| Horizon | High enough for 224px vertical framing |
| Scenery | Reuse sprites aggressively |
| Distortion | No per-scanline tricks required |

### Top-Down Racer Rules (Super Sprint / Neo Drift Out)

| Property | Value |
|----------|-------|
| Camera | Fixed or gently scrolling |
| Track | Tile-based, NOT full bitmaps |
| Cars | Small sprites, limited animation |
| Opponents | Palette swaps allowed |
| Rotation | Avoid unless optional effect |

### Single-Screen Action (Pang / Breakout)

| Property | Value |
|----------|-------|
| Camera | Fixed, no scrolling |
| Playfield | Tile-based border |
| Objects | Standard sprite sizes |
| HUD | Bottom or top, within safe zone |

---

## RULE 9: GAME ELEMENT ALLOCATION (PANG)

### Sprite Budget

| Object Type | Count | Size | Sprites Used |
|-------------|-------|------|--------------|
| Player 1 | 1 | 32×32 | 1 |
| Player 2 | 1 | 32×32 | 1 |
| Harpoons | 2 | 8×variable | 2-4 |
| Large balls | 4 | 24×24 | 4 |
| Medium balls | 8 | 16×16 | 8 |
| Small balls | 12 | 8×8 | 12 |
| Power-ups | 4 | 16×16 | 4 |
| Effects | 8 | 16×16 | 8 |
| HUD elements | 6 | various | 6 |
| **Total** | | | **~45-50** |

Leaves 30+ sprites for additional effects.

### Palette Assignment

| Palette | Usage | Colours |
|---------|-------|---------|
| 0 | Background, environment | Blues, browns, greens |
| 1 | Background 2, structures | Greys, metallics |
| 2 | Player, harpoon, power-ups | Skin, clothes, gold |
| 3 | Balls, enemies, effects | Reds, oranges, yellows |

---

## RULE 10: VISUAL EFFECTS SUMMARY

### ALLOWED

- 64 colours on screen (4 palettes × 16)
- 80 hardware sprites
- Variable sprite sizes (8×8 to 32×32)
- Horizontal/vertical sprite flip
- Two scrolling background planes
- Per-line scroll (parallax) - sparingly
- Sprite priority (behind/in front of backgrounds)
- Palette cycling (subtle effects only)
- Shadow sprites (darkened duplicates)

### FORBIDDEN

- More than 64 colours on screen
- More than 80 sprites
- More than 20 sprites per scanline
- True rotation (no hardware support)
- True scaling (except sprite-strip tricks)
- True alpha transparency
- Anti-aliasing
- Photographic gradients
- Noise dithering
- Raster tricks requiring cycle-exact timing

---

## RULE 11: SOUND SPECIFICATIONS

### Mega Drive Sound

| Chip | Channels | Usage |
|------|----------|-------|
| YM2612 FM | 6 | Music, complex SFX |
| SN76489 PSG | 4 | Simple SFX, percussion |
| DAC | 1 | 8-bit samples |

### Neo Geo Sound

| Chip | Channels | Usage |
|------|----------|-------|
| YM2610 | 4 FM + 7 ADPCM | Full audio |

### Portable Audio Rules

- Assume 6 FM channels + 4 PSG
- One sample channel (8-bit)
- No streaming audio
- Level-based music loading

---

## RULE 12: IMPLEMENTATION CHECKLIST

When implementing or modifying 16-Bit mode, verify:

### Display
- [ ] Resolution is 320 × 224 (no scaling/letterboxing)
- [ ] HUD within 8px safe margins
- [ ] Frame rate targets 60 FPS

### Colour
- [ ] Colours snapped to 9-bit RGB (512 colour palette)
- [ ] Maximum 64 colours on screen (4 × 16 palettes)
- [ ] Palettes fixed per level
- [ ] UI uses max 4 colours

### Sprites
- [ ] Maximum 80 sprites enforced
- [ ] Maximum 20 sprites per scanline considered
- [ ] Sprites use tile-based sizes (8×8 to 32×32)
- [ ] Colour 0 is transparent
- [ ] No true alpha blending used

### Performance
- [ ] No raster tricks required
- [ ] Frame drops handled gracefully
- [ ] Platform-agnostic game logic

### Assets
- [ ] Tilesheet format used
- [ ] Assets are tiled and reused
- [ ] No full-screen bitmap swaps

### Art Style
- [ ] Strong silhouettes
- [ ] Clear contrast
- [ ] No photographic gradients
- [ ] Ordered dithering only (if any)

---

## CLASSIC GAME REFERENCES

### Mega Drive / Genesis

| Game | Year | Reference For |
|------|------|---------------|
| Sonic the Hedgehog | 1991 | Iconic sprite work |
| Streets of Rage 2 | 1992 | Large detailed sprites |
| Gunstar Heroes | 1993 | Pushing sprite limits |
| Thunder Force IV | 1992 | Parallax scrolling |
| Shinobi III | 1993 | Smooth animation |

### Neo Geo / Arcade

| Game | Year | Reference For |
|------|------|---------------|
| Metal Slug | 1996 | Detailed sprites |
| King of Fighters | 1994+ | Character sprites |
| Windjammers | 1994 | Clean arcade action |
| Neo Drift Out | 1996 | Top-down racing |

### Cross-Platform Titles

| Game | Platforms | Reference For |
|------|-----------|---------------|
| Pang | Arcade/Multiple | Our target gameplay |
| Final Fight | CPS1/SNES | Beat 'em up design |
| OutRun | Arcade/MD | Sprite scaling |

---

## GOLDEN RULES

1. **Design like you don't know which 16-bit machine you're shipping on.**
2. **If it runs and looks right everywhere, it's correct.**
3. **No heroics, no demo-scene tricks.**
4. **CPU for logic, hardware for rendering.**
5. **When in doubt, be conservative.**

---

## REVISION HISTORY

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-01-26 | Initial rules document |
| 2.0 | 2025-01-26 | Major update: Cross-platform portability (MD + Neo Geo), genre-specific rules, art style guidance, forbidden effects list, CRT safety margins |

---

**ANY CODE CHANGES TO 16-BIT MODE MUST COMPLY WITH THESE RULES.**
**DESIGN FOR PORTABILITY. IF IT WOULDN'T RUN ON BOTH MD AND NEO GEO, DON'T DO IT.**
**THIS MODE REPRESENTS THE PEAK OF 2D SPRITE-BASED GAMING.**
