# 8-BIT PLUS MODE RULES
## Amstrad GX4000 / CPC Plus Style (1990-1991)

This document defines the MANDATORY rules for 8-Bit Plus Mode rendering.
All code changes affecting 8-Bit Plus Mode MUST comply with these rules.

**This mode is EXPORTABLE to real GX4000/CPC Plus hardware via CPCtelera (CPR format).**

---

## REFERENCE HARDWARE

- **Target Systems**: Amstrad GX4000 (console), CPC 464+, CPC 6128+ (1990-1991)
- **CPU**: Zilog Z80A @ 4 MHz (same as standard CPC)
- **RAM**: 64KB standard + 16KB ASIC RAM
- **Graphics**: Original CRTC + **ASIC chip** (key upgrade)
- **Sound Chip**: General Instrument AY-3-8912 + DMA
- **Storage**: CPR cartridge (up to 512KB ROM)

---

## RULE 1: COMPATIBILITY FIRST (CRITICAL)

**CPC Plus EXTENDS, not REPLACES, CPC Classic.**

### Design Philosophy

- Base game logic and assets should **work without ASIC**
- ASIC features are **enhancements**, not requirements
- Think "upgrade path", not separate game

### Why This Matters

- Easier porting between CPC and Plus
- Same codebase, two targets
- Plus version feels **richer, not fundamentally different**

---

## RULE 2: THE ASIC CHIP (KEY DIFFERENCE FROM CPC)

The GX4000/Plus has an ASIC chip providing features unavailable on standard CPC:

| Feature               | Standard CPC | GX4000/Plus        |
|-----------------------|--------------|---------------------|
| Colour palette        | 27 colours   | **4096 colours**   |
| Hardware sprites      | None         | **16 sprites**     |
| Sprite size           | N/A          | **16×16 pixels**   |
| Sprite zoom           | N/A          | **2× magnification**|
| Hardware scroll       | Limited      | **Pixel-smooth**   |
| DMA sound             | No           | **Yes**            |
| Split rasters         | Manual       | **Automatic**      |

**The ASIC makes the Plus dramatically more capable than standard CPC.**

---

## RULE 3: SCREEN MODES

**Same modes as CPC Classic:**

| Mode | Resolution  | Colours | Use Case              |
|------|-------------|---------|----------------------|
| 0    | 160 × 200   | 16      | Backgrounds          |
| 1    | 320 × 200   | 4       | Higher resolution    |
| 2    | 640 × 200   | 2       | Text (rare)          |

**No new resolutions** - Plus uses same video modes.

### Recommended Approach

**Mode 1 background (320×200, 4 colours) + hardware sprites (15 colours)**

This gives effectively 19 colours on screen (4 background + 15 sprites).

---

## RULE 4: COLOUR PALETTE (4096 COLOURS - BIG WIN)

The Plus uses 12-bit RGB colour (4 bits per channel):

### Colour Format

```
12-bit RGB: RRRRGGGGBBBB
Each channel: 0-15 (16 levels)
Total combinations: 16 × 16 × 16 = 4096 colours
```

### Palette Limitations (Still Apply!)

- **16 colours** on screen simultaneously (same as CPC Mode 0)
- **4 colours** in Mode 1
- But chosen from **4096** instead of 27

### Palette Rules

| Do | Don't |
|----|-------|
| Use richer palette entries | Use more colours on screen |
| Subtle colour gradations | Palette animation as gameplay mechanic |
| Better shadows/highlights | Excessive palette cycling |

---

## RULE 5: HARDWARE SPRITES (YES, BUT CAREFUL)

The Plus provides **16 hardware sprites** managed by the ASIC:

| Property              | Value          | Notes                              |
|-----------------------|----------------|-------------------------------------|
| Number of sprites     | 16             | Hard limit, cannot exceed          |
| Size                  | 16 × 16 pixels | Fixed size                         |
| Colours per sprite    | 15 + transparent| From separate sprite palette       |
| Magnification         | 1× or 2×       | Per-sprite setting                 |
| Priority              | Sprite 0 = front| Lower number = higher priority    |
| Position              | Pixel accurate | X: 0-639, Y: 0-255                 |
| Collision detection   | Hardware       | Register indicates overlaps        |

### Hardware Sprite Advantages

1. **No CPU cost for drawing** - ASIC overlays sprites
2. **No background corruption** - Sprites don't erase background
3. **Pixel-perfect positioning** - Any X/Y coordinate
4. **Consistent performance** - 16 sprites always same speed

### Rules for Portability (IMPORTANT)

**Hardware sprites should be used for:**
- Player
- Balls
- Enemies
- Projectiles

**Background remains software-rendered.**

**⚠️ Do NOT design gameplay that REQUIRES hardware sprites.**

On classic CPC: Replace hardware sprites with software equivalents.

---

## RULE 6: HARDWARE SCROLLING (OPTIONAL)

ASIC allows hardware scrolling:

| Property          | Value              | Notes                    |
|-------------------|--------------------|--------------------------|
| Horizontal        | Pixel-smooth       | ASIC soft scroll         |
| Vertical          | Pixel-smooth       | ASIC soft scroll         |
| Split screen      | Hardware           | Different scroll per zone|

### Usage Rules

- Use ONLY for cosmetic smoothness
- Game must still work with software scrolling fallback
- Don't make gameplay depend on smooth scrolling

---

## RULE 7: DISPLAY SPECIFICATIONS

| Property          | Value           | Notes                              |
|-------------------|-----------------|-------------------------------------|
| Resolution        | 320 × 200       | Mode 1 (4 colours) or Mode 0 (16)  |
| Pixel Aspect      | 1:1             | Square pixels in Mode 1            |
| Screen Colours    | 16              | From 4096 available                |
| Sprite Colours    | 15              | Separate sprite palette            |
| Border            | Programmable    | Can display sprites over border    |
| Frame Rate        | 50 FPS          | Full 50Hz with hardware sprites    |
| Display Scale     | 3×              | For modern displays                |

---

## RULE 8: PERFORMANCE CONSTRAINTS

With hardware sprites, the Plus is MUCH more capable:

| Constraint              | Value  | Reason                           |
|-------------------------|--------|----------------------------------|
| Hardware sprites        | 16     | ASIC hard limit                  |
| Max balls on screen     | 14     | 16 sprites - player - harpoon   |
| Max harpoons            | 2      | Dual player possible             |
| Max power-ups           | 4      | Share sprite budget              |
| Animation frames        | 4      | Cartridge ROM is plentiful       |
| Background sprites      | 8      | Software rendered extras         |

### CPU Budget (Greatly Improved)

Because hardware sprites don't need CPU rendering:

```
Per frame (at 50fps = 80,000 cycles):
- Game logic:        20,000 cycles
- Collision:         10,000 cycles
- Background update: 20,000 cycles (if scrolling)
- Sound:              5,000 cycles
- Sprite setup:       5,000 cycles (just set ASIC registers)
- Headroom:          20,000 cycles

Compare to standard CPC where sprite rendering takes 60,000+ cycles!
```

---

## RULE 9: SPRITE ALLOCATION STRATEGY

### For Pang

```
Sprite 0:  Player
Sprite 1:  Harpoon 1
Sprite 2:  Harpoon 2 (if dual player)
Sprites 3-14: Balls (up to 12)
Sprite 15: Power-up / Effect
```

### Sprite Palette (15 colours)

| Slot | Colour          | Hex       | Usage           |
|------|-----------------|-----------|-----------------|
| 0    | Transparent     | -         | Always          |
| 1    | Bright Red      | `#FF0000` | Large balls     |
| 2    | Orange          | `#FF8800` | Medium balls    |
| 3    | Yellow          | `#FFFF00` | Small balls, Harpoon |
| 4    | Bright Green    | `#00FF00` | Power-ups       |
| 5    | Skin tone       | `#FFAA88` | Player          |
| 6    | Brown           | `#885500` | Player clothes  |
| 7    | White           | `#FFFFFF` | Highlights      |
| 8    | Cyan            | `#00FFFF` | Player accent   |
| 9    | Pink            | `#FF88FF` | Effects         |
| 10   | Dark Red        | `#880000` | Ball shadow     |
| 11   | Dark Orange     | `#884400` | Ball shadow     |
| 12   | Dark Blue       | `#000088` | Player shadow   |
| 13   | Grey            | `#888888` | Metal           |
| 14   | Black           | `#000000` | Outlines        |

---

## RULE 10: CPR CARTRIDGE CONSTRAINTS

GX4000 games come on cartridges (CPR format):

| Property          | Value              | Notes                    |
|-------------------|--------------------|--------------------------|
| Min size          | 128 KB             | Basic cartridge          |
| Max size          | 512 KB             | Bank-switched            |
| Bank size         | 16 KB              | Switched into &C000      |
| ROM access        | Fast               | No loading time          |

### Design Rules for CPR

- **No dynamic loading** - All assets available at boot
- Data must be **fixed-address** and **banked carefully**
- Avoid massive unique graphics
- ROM-based means no saving (use passwords)

### Memory Mapping

```
&0000-&3FFF: RAM (Bank 0)
&4000-&7FFF: RAM (Bank 1)
&8000-&BFFF: RAM (Bank 2)
&C000-&FFFF: Cartridge ROM (bank-switched) / Screen RAM
```

---

## RULE 11: SHARED ASSET STRATEGY (IMPORTANT)

To keep conversion between CPC and Plus easy:

### Design Assets In:

- Mode 1 (320×200)
- 4 colours
- Software-sprite compatible

### CPC Plus Version:

- Uses **same graphics**
- With **richer palette entries** (from 4096)
- And **hardware sprites layered on top**

### This Means:

- One codebase
- Two export targets
- Plus version feels enhanced, not different

---

## RULE 12: SOUND SPECIFICATIONS

Same AY-3-8912 as standard CPC, **plus DMA**:

| Property          | Value              | Notes                    |
|-------------------|--------------------|--------------------------|
| Channels          | 3 tone + 1 noise   | AY chip                  |
| DMA Sound         | Yes                | Sample playback          |
| Sample Rate       | Up to 15.6kHz      | DMA limitation           |
| Volume Levels     | 16 per channel     | 4-bit                    |

### DMA Sound

- Frees CPU from sample playback
- Up to 15.6kHz sample rate
- 8-bit samples
- Good for speech, sound effects

---

## RULE 13: VISUAL EFFECTS

### ALLOWED

- Full 4096-colour palette
- Hardware sprites (16 max)
- Sprite magnification (2×)
- Pixel-smooth scrolling
- Palette changes per scanline
- DMA sound samples
- Screen splits
- Sprite-to-sprite collision detection

### FORBIDDEN

- More than 16 hardware sprites
- Sprites larger than 16×16 (or 32×32 zoomed)
- More than 16 colours per scanline (background)
- More than 15 colours per sprite palette
- Alpha transparency (use palette index 0)
- Anti-aliasing
- Gameplay that requires ASIC features

---

## RULE 14: PLUS VS STANDARD CPC COMPARISON

| Feature              | Standard CPC      | Plus/GX4000        |
|----------------------|-------------------|---------------------|
| Palette              | 27 colours        | 4096 colours        |
| Sprites              | Software only     | 16 hardware         |
| Scrolling            | CPU intensive     | Hardware smooth     |
| Frame rate           | 25fps typical     | 50fps achievable    |
| Export format        | .DSK / .CDT       | .CPR cartridge      |

### Compatibility Note

- Plus software CAN run standard CPC code (backwards compatible)
- Standard CPC CANNOT run Plus-specific features
- Games using ASIC features are Plus/GX4000 only

---

## RULE 15: IMPLEMENTATION CHECKLIST

When implementing or modifying 8-Bit Plus mode, verify:

### Graphics
- [ ] Resolution is 320 × 200
- [ ] Colours are from 4096-colour palette (12-bit RGB)
- [ ] Background limited to 4 colours (Mode 1) or 16 (Mode 0)
- [ ] Frame rate targets 50 FPS
- [ ] No anti-aliasing on canvas context

### Hardware Sprites
- [ ] Maximum 16 hardware sprites used
- [ ] Each sprite is 16×16 (or 32×32 with 2× zoom)
- [ ] Sprite palette limited to 15 colours + transparent
- [ ] Sprite 0 always transparent
- [ ] Tilesheet format used for sprite assets

### Constraints
- [ ] Max 14 balls enforced (sprite budget)
- [ ] Max 2 harpoons enforced
- [ ] Gameplay doesn't REQUIRE ASIC features

### Portability
- [ ] Same logic works with software sprites (CPC fallback)
- [ ] Assets designed for Mode 1 compatibility
- [ ] No dependency on hardware scrolling for gameplay

---

## RULE 16: THE GOLDEN RULE (CPC PLUS)

> **A CPC Plus game should feel RICHER — not fundamentally different.**

This means:
- Enhanced visuals from better palette
- Smoother gameplay from hardware sprites
- Same core mechanics as CPC version
- "Premium" feel without breaking compatibility

---

## CLASSIC GX4000/PLUS GAME REFERENCES

For visual inspiration (the GX4000 library is small but quality):

- **Pang** (1990) - The actual GX4000 version, our reference
- **Burnin' Rubber** (1990) - Pack-in game, good sprite use
- **Navy Seals** (1990) - Action game
- **Robocop 2** (1990) - Good use of Plus features
- **Switchblade** (1990) - Smooth scrolling
- **No Exit** (1990) - Puzzle game

Modern Plus demos showing hardware potential:
- **Batman Forever Demo** - Incredible Plus graphics
- **Amstrad Eterno** - Modern Plus demo

---

## COLOUR GENERATION CODE

```javascript
// Generate 4096-colour Plus palette
function generatePlusPalette() {
    const palette = [];
    for (let r = 0; r < 16; r++) {
        for (let g = 0; g < 16; g++) {
            for (let b = 0; b < 16; b++) {
                const r8 = Math.round(r * 255 / 15);
                const g8 = Math.round(g * 255 / 15);
                const b8 = Math.round(b * 255 / 15);
                palette.push(`#${r8.toString(16).padStart(2,'0')}${g8.toString(16).padStart(2,'0')}${b8.toString(16).padStart(2,'0')}`);
            }
        }
    }
    return palette;
}

// Snap any colour to nearest Plus colour (12-bit)
function snapToPlusColour(hexColour) {
    const r = parseInt(hexColour.slice(1, 3), 16);
    const g = parseInt(hexColour.slice(3, 5), 16);
    const b = parseInt(hexColour.slice(5, 7), 16);
    
    // Snap to 4-bit (16 levels)
    const r4 = Math.round(r / 255 * 15);
    const g4 = Math.round(g / 255 * 15);
    const b4 = Math.round(b / 255 * 15);
    
    // Convert back to 8-bit for display
    const r8 = Math.round(r4 * 255 / 15);
    const g8 = Math.round(g4 * 255 / 15);
    const b8 = Math.round(b4 * 255 / 15);
    
    return `#${r8.toString(16).padStart(2,'0')}${g8.toString(16).padStart(2,'0')}${b8.toString(16).padStart(2,'0')}`;
}
```

---

## REVISION HISTORY

| Version | Date       | Changes                                    |
|---------|------------|--------------------------------------------|
| 1.0     | 2025-01-26 | Initial rules document                     |
| 1.1     | 2025-01-26 | Added compatibility rules, shared asset strategy, golden rule |

---

**ANY CODE CHANGES TO 8-BIT PLUS MODE MUST COMPLY WITH THESE RULES.**
**THIS MODE MUST REMAIN EXPORTABLE TO REAL GX4000/CPC PLUS HARDWARE.**
**HARDWARE SPRITE LIMIT OF 16 IS ABSOLUTE - NO EXCEPTIONS.**
**REMEMBER: PLUS SHOULD ENHANCE, NOT REPLACE CPC GAMEPLAY.**
