# 8-BIT CPC MODE RULES
## Amstrad CPC Classic Style (1984-1990)

This document defines the MANDATORY rules for 8-Bit CPC Mode rendering.
All code changes affecting 8-Bit CPC Mode MUST comply with these rules.

**This mode is EXPORTABLE to real Amstrad CPC hardware via CPCtelera (DSK format).**

---

## REFERENCE HARDWARE

- **Target System**: Amstrad CPC 464 / 664 / 6128 (1984-1990)
- **CPU**: Zilog Z80A @ 4 MHz
- **RAM**: 64KB (464) / 128KB (6128)
- **Graphics Chip**: Motorola 6845 CRTC + Gate Array
- **Sound Chip**: General Instrument AY-3-8912
- **Storage**: DSK (floppy) or CDT (tape)

---

## RULE 1: SCREEN MODE SELECTION

The CPC has 3 screen modes. **Choose ONE per game:**

| Mode | Resolution  | Colours | Pixel Aspect | Typical Use        |
|------|-------------|---------|--------------|-------------------|
| 0    | 160 × 200   | 16      | 2:1 (wide)   | Heavy colour games |
| 1    | 320 × 200   | 4       | 1:1 (tall)   | **RECOMMENDED**   |
| 2    | 640 × 200   | 2       | 1:2          | Text/CAD          |

### Mode 1 (RECOMMENDED)

**Mode 1 is the "Spectrum killer" mode:**
- 320×200 resolution
- 4 colours simultaneously
- Tall pixels (1:1 aspect)
- Clean, readable, NO attribute clash
- Best for: Arcade games, platformers, Pang/Breakout style

### Mode 0 (OPTIONAL)

- 160×200 resolution
- 16 colours simultaneously
- Chunky wide pixels (2:1 aspect)
- Use ONLY if you design specifically for it

**⚠️ Do NOT mix Mode 0 + Mode 1 mid-screen unless you really know what you're doing.**

### This Engine Uses Mode 0

For maximum colour flexibility, this engine defaults to Mode 0 (160×200, 16 colours). However, Mode 1 may be preferred for cleaner graphics in some games.

---

## RULE 2: COLOUR PALETTE (27 COLOURS)

The CPC can display colours from a palette of 27:

- **Mode 0**: Choose ANY 16 colours from 27
- **Mode 1**: Choose ANY 4 colours from 27

### Full 27-Colour Hardware Palette

| Index | Name            | Hex Code  | RGB              |
|-------|-----------------|-----------|------------------|
| 0     | Black           | `#000000` | (0, 0, 0)        |
| 1     | Blue            | `#000080` | (0, 0, 128)      |
| 2     | Bright Blue     | `#0000FF` | (0, 0, 255)      |
| 3     | Red             | `#800000` | (128, 0, 0)      |
| 4     | Magenta         | `#800080` | (128, 0, 128)    |
| 5     | Mauve           | `#8000FF` | (128, 0, 255)    |
| 6     | Bright Red      | `#FF0000` | (255, 0, 0)      |
| 7     | Purple          | `#FF0080` | (255, 0, 128)    |
| 8     | Bright Magenta  | `#FF00FF` | (255, 0, 255)    |
| 9     | Green           | `#008000` | (0, 128, 0)      |
| 10    | Cyan            | `#008080` | (0, 128, 128)    |
| 11    | Sky Blue        | `#0080FF` | (0, 128, 255)    |
| 12    | Yellow          | `#808000` | (128, 128, 0)    |
| 13    | White           | `#808080` | (128, 128, 128)  |
| 14    | Pastel Blue     | `#8080FF` | (128, 128, 255)  |
| 15    | Orange          | `#FF8000` | (255, 128, 0)    |
| 16    | Pink            | `#FF8080` | (255, 128, 128)  |
| 17    | Pastel Magenta  | `#FF80FF` | (255, 128, 255)  |
| 18    | Bright Green    | `#00FF00` | (0, 255, 0)      |
| 19    | Sea Green       | `#00FF80` | (0, 255, 128)    |
| 20    | Bright Cyan     | `#00FFFF` | (0, 255, 255)    |
| 21    | Lime            | `#80FF00` | (128, 255, 0)    |
| 22    | Pastel Green    | `#80FF80` | (128, 255, 128)  |
| 23    | Pastel Cyan     | `#80FFFF` | (128, 255, 255)  |
| 24    | Bright Yellow   | `#FFFF00` | (255, 255, 0)    |
| 25    | Pastel Yellow   | `#FFFF80` | (255, 255, 128)  |
| 26    | Bright White    | `#FFFFFF` | (255, 255, 255)  |

### Palette Rules

- Palette can change per frame, but **keep it stable**
- Avoid raster trick dependency
- Colour 0 is typically used for transparency in sprites

---

## RULE 3: SPRITES (CRITICAL - SOFTWARE ONLY)

**The CPC has NO hardware sprites. ALL sprites are software-rendered.**

This is the most important constraint:

| Property              | Value          | Notes                              |
|-----------------------|----------------|-------------------------------------|
| Type                  | **Software**   | CPU copies to video RAM            |
| Rendering             | Masked blits   | XOR blits or pre-masked data       |
| Recommended Size      | 16 × 16 px     | Good balance of detail/speed       |
| Max Size              | 24 × 24 px     | Larger = slower                    |
| Animation Frames      | 4 max          | RAM constraints                    |
| Colours per Sprite    | 4 (Mode 1)     | Or 16 (Mode 0)                     |
| Transparency          | Colour 0 mask  | Or separate mask data              |

### Sprite Rules for Performance

1. **Keep sprites small**
2. **Avoid excessive overlapping**
3. **Limit per-frame sprite count**
4. **Prefer monochrome or 2-colour sprites in Mode 1**

This ensures 48K compatibility and good performance.

### Mode 0 Pixel Encoding (CRITICAL FOR EXPORT)

Mode 0 has complex pixel encoding - 2 pixels per byte, bits interleaved:

```
Byte: [P1:3][P0:3][P1:2][P0:2][P1:1][P0:1][P1:0][P0:0]
      Bit 7  Bit 6  Bit 5  Bit 4  Bit 3  Bit 2  Bit 1  Bit 0

Where P0 = left pixel, P1 = right pixel
Each pixel is 4 bits (0-15 palette index)
```

**CPCtelera handles this encoding. For browser, we use standard 4bpp.**

---

## RULE 4: BACKGROUNDS & ART STYLE

**Key Advantage: NO attribute clash - colour is per pixel!**

### Art Style Guidelines

| Do | Don't |
|----|-------|
| Use flat fills | Use excessive dithering |
| Keep it clean | Make it busy |
| Simple pattern shading | Complex textures |
| Low contrast shading | High contrast noise |

**CPC looks best when it's clean, not busy.**

### Background Guidelines

- Colour is per-pixel, not per-cell (unlike Spectrum)
- Shading should be simple and pattern-based
- Avoid full-screen bitmap swaps
- Prefer tiled/reusable background elements

---

## RULE 5: DISPLAY SPECIFICATIONS

| Property          | Value           | Notes                              |
|-------------------|-----------------|-------------------------------------|
| Resolution        | 160 × 200       | Mode 0 (or 320×200 Mode 1)         |
| Pixel Aspect      | 2:1 (Mode 0)    | Pixels are TWICE as wide as tall   |
| Colours           | 16 from 27      | Simultaneous colours (Mode 0)      |
| Border            | Variable        | Surrounds screen area              |
| Frame Rate        | 25 FPS (PAL)    | 50Hz VSYNC, game at 25fps          |
| Display Scale     | 4×              | Plus 2× width for pixel aspect     |

### Actual Display Size (Mode 0)

Due to 2:1 pixel aspect, 160×200 displays as if it were 320×200:

```
Native: 160 × 200 pixels
Visual: 320 × 200 equivalent (each pixel is 2× wide)
CSS:    640 × 800 at 4× scale (or 1280 × 800 with aspect correction)
```

---

## RULE 6: PERFORMANCE CONSTRAINTS

The Z80 at 4MHz with NO sprite hardware means strict limits:

| Constraint              | Value  | Reason                           |
|-------------------------|--------|----------------------------------|
| Max sprites on screen   | 12     | CPU rendering limit              |
| Max balls on screen     | 12     | Include in sprite budget         |
| Max harpoons            | 1      | Single player game               |
| Max power-ups           | 4      | Additional sprite budget         |
| Animation frames        | 4      | RAM constraints                  |

### CPU Budget Per Frame (at 25fps)

```
Z80 @ 4MHz = 4,000,000 cycles/second
At 25fps = 160,000 cycles per frame

12 sprites × 5,000 cycles = 60,000 cycles
Background restore:         30,000 cycles
Game logic:                 15,000 cycles
Sound:                       5,000 cycles
Overhead:                   10,000 cycles
------------------------------------------
Total:                     120,000 cycles (leaves 40K headroom)
```

---

## RULE 7: MEMORY & FILE CONSTRAINTS (DSK-FRIENDLY)

### Practical Limits

- Sprites + tiles should be **tiled and reused**
- Store compressed if possible (simple RLE)
- Avoid full-screen bitmap swaps
- Avoid huge unique background images

### Safe Assumptions

- 64K machine minimum
- Single-load or level-based loading
- Assets stored as raw bitplane data or simple RLE

### RAM Budget (64KB system)

| Area              | Size    | Notes                          |
|-------------------|---------|--------------------------------|
| Screen RAM        | 16 KB   | &C000-&FFFF                    |
| System/ROM shadow | 4 KB    | Low memory                     |
| Available         | ~44 KB  | For game code/data             |

---

## RULE 8: TIMING & EFFECTS

### No Reliance On:

- Stable raster interrupts
- Cycle-exact tricks
- Frame-perfect timing

### Game Logic Should Tolerate:

- Frame drops
- Variable CPU time

### Allowed Raster Tricks (Optional)

- Split-screen different palettes
- Gradient skies (change shades per line)
- Status bar with different palette
- Maximum practical: 4-8 splits per frame

**For basic engine, use a single palette. Raster tricks are optional enhancement.**

---

## RULE 9: SOUND SPECIFICATIONS

The CPC uses the AY-3-8912 sound chip:

| Property          | Value              | Notes                    |
|-------------------|--------------------|--------------------------|
| Channels          | 3 tone             | Square wave generators   |
| Noise Channel     | 1 (shared)         | White noise              |
| Frequency Range   | 30Hz - 125kHz      | Practical: 100Hz-10kHz   |
| Volume Levels     | 16 per channel     | 4-bit volume             |
| Envelope          | Hardware           | Attack/decay/sustain     |

### Sound Budget

- AY chip is memory-mapped, minimal CPU overhead
- Music playback: ~2,000-5,000 cycles per frame
- Sound effects: ~500-1,000 cycles each

---

## RULE 10: VISUAL EFFECTS

### ALLOWED

- Full palette (16 colours from 27)
- Palette changes (between frames)
- Screen shake
- Sprite colour cycling
- Dithering patterns (sparse)
- Hardware scrolling (CRTC register manipulation)

### FORBIDDEN

- More than 16 colours simultaneously (without raster tricks)
- Colours outside the 27-colour hardware palette
- Anti-aliasing
- Alpha transparency (use colour 0 masking)
- Real-time palette interpolation
- Heavy dithering / complex textures

---

## RULE 11: CPCTELERA EXPORT REQUIREMENTS

For export to real CPC hardware, assets must follow CPCtelera format:

### Sprite Export Format

```c
// CPCtelera sprite definition
// Width in BYTES (Mode 0: width = pixels/2)
const u8 sprite_player[SPRITE_HEIGHT * SPRITE_WIDTH_BYTES] = {
    0x00, 0x00, 0x0F, 0xF0, 0x00, 0x00, 0x00, 0x00,  // Row 0
    // ... more rows
};

#define SPRITE_PLAYER_W  8   // Width in bytes (16 pixels in Mode 0)
#define SPRITE_PLAYER_H  16  // Height in pixels
```

### Palette Export Format

```c
// CPCtelera palette (firmware colour numbers)
const u8 palette[16] = {
    0x54, // Black (HW: 0x54)
    0x44, // Blue
    0x55, // Bright Blue
    // ... etc
};
```

### Firmware vs Hardware Colour Numbers

CPC has two numbering systems:
- **Firmware numbers**: 0-26 (used in BASIC)
- **Hardware numbers**: Different mapping (used by Gate Array)

CPCtelera provides conversion macros.

---

## RULE 12: IMPLEMENTATION CHECKLIST

When implementing or modifying 8-Bit CPC mode, verify:

### Graphics
- [ ] Resolution is 160 × 200 (Mode 0) or 320 × 200 (Mode 1)
- [ ] Pixel aspect ratio applied (2:1 for Mode 0)
- [ ] Only valid CPC 27-colour palette colours used
- [ ] Mode 0: Max 16 colours | Mode 1: Max 4 colours
- [ ] Frame rate capped at 25 FPS
- [ ] No anti-aliasing on canvas context

### Sprites (Software Only)
- [ ] All sprites are software-rendered
- [ ] Max 12 sprites on screen enforced
- [ ] Sprite sizes appropriate for CPU budget
- [ ] Transparency uses colour index 0
- [ ] Max 4 animation frames per character

### Constraints
- [ ] Max 12 balls enforced
- [ ] Max 1 harpoon enforced
- [ ] No reliance on cycle-exact timing

### Art Style
- [ ] Flat fills preferred over dithering
- [ ] Clean, not busy
- [ ] No full-screen bitmap swaps

---

## RULE 13: THE GOLDEN RULE (CPC CLASSIC)

> **If it wouldn't run smoothly on a stock CPC 464 from tape, it's too fancy.**

This means:
- Software sprites only
- Conservative sprite counts
- Simple backgrounds
- Stable frame rate
- 64K compatible

---

## CLASSIC CPC GAME REFERENCES

For visual inspiration, reference these authentic CPC games:

**Mode 1 (4 colours, clean):**
- **Gryzor (Contra)** (1987) - Excellent Mode 1 graphics
- **Rick Dangerous** (1989) - Clean sprite work

**Mode 0 (16 colours):**
- **Turrican** (1990) - Pushing CPC limits
- **Prince of Persia** (1990) - Smooth animation
- **Chase H.Q.** (1989) - Colourful arcade port
- **Rainbow Islands** (1990) - Vibrant palette use
- **Pang** (1990) - Original CPC version reference
- **Prehistorik 2** (1993) - Late-era CPC excellence

---

## COLOUR PALETTE CONSTANTS

```javascript
const CPC_HARDWARE_PALETTE = [
    '#000000', // 0: Black
    '#000080', // 1: Blue
    '#0000FF', // 2: Bright Blue
    '#800000', // 3: Red
    '#800080', // 4: Magenta
    '#8000FF', // 5: Mauve
    '#FF0000', // 6: Bright Red
    '#FF0080', // 7: Purple
    '#FF00FF', // 8: Bright Magenta
    '#008000', // 9: Green
    '#008080', // 10: Cyan
    '#0080FF', // 11: Sky Blue
    '#808000', // 12: Yellow
    '#808080', // 13: White
    '#8080FF', // 14: Pastel Blue
    '#FF8000', // 15: Orange
    '#FF8080', // 16: Pink
    '#FF80FF', // 17: Pastel Magenta
    '#00FF00', // 18: Bright Green
    '#00FF80', // 19: Sea Green
    '#00FFFF', // 20: Bright Cyan
    '#80FF00', // 21: Lime
    '#80FF80', // 22: Pastel Green
    '#80FFFF', // 23: Pastel Cyan
    '#FFFF00', // 24: Bright Yellow
    '#FFFF80', // 25: Pastel Yellow
    '#FFFFFF'  // 26: Bright White
];

// Default 16-colour game palette (indices into above)
const CPC_GAME_PALETTE = [0, 2, 11, 6, 15, 24, 18, 12, 16, 13, 26, 10, 1, 4, 14, 13];
```

---

## REVISION HISTORY

| Version | Date       | Changes                                    |
|---------|------------|--------------------------------------------|
| 1.0     | 2025-01-26 | Initial rules document                     |
| 1.1     | 2025-01-26 | Added Mode 1 recommendation, golden rule, art style guidelines |

---

**ANY CODE CHANGES TO 8-BIT CPC MODE MUST COMPLY WITH THESE RULES.**
**THIS MODE MUST REMAIN EXPORTABLE TO REAL CPC HARDWARE.**
**REMEMBER: EVERYTHING IS SOFTWARE-RENDERED. NO HARDWARE SPRITES.**
