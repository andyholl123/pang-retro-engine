# 8-BIT BASIC MODE RULES
## ZX Spectrum Style (1982-1992)

This document defines the MANDATORY rules for 8-Bit Basic Mode rendering.
All code changes affecting 8-Bit Basic Mode MUST comply with these rules.

---

## REFERENCE HARDWARE

- **Target System**: Sinclair ZX Spectrum 48K / 128K (1982-1992)
- **CPU**: Zilog Z80A @ 3.5 MHz
- **RAM**: 48KB or 128KB
- **Graphics Chip**: ULA (Uncommitted Logic Array)
- **Also Similar To**: Timex Sinclair 2068, ZX Spectrum +2/+3

---

## RULE 1: COLOUR PALETTE (15 COLOURS)

The Spectrum has 15 unique colours (8 colours × 2 brightness levels, minus duplicate black).

**Key Points:**
- Maximum 15 colours total (7 colours × BRIGHT + black)
- Black has NO BRIGHT variant (both are #000000)
- Do NOT assume free mixing of colours - attribute system limits this

| Index | Name          | Normal Hex | Bright Hex | Bright |
|-------|---------------|------------|------------|--------|
| 0     | Black         | `#000000`  | `#000000`  | N/A    |
| 1     | Blue          | `#0000D7`  | `#0000FF`  | Yes    |
| 2     | Red           | `#D70000`  | `#FF0000`  | Yes    |
| 3     | Magenta       | `#D700D7`  | `#FF00FF`  | Yes    |
| 4     | Green         | `#00D700`  | `#00FF00`  | Yes    |
| 5     | Cyan          | `#00D7D7`  | `#00FFFF`  | Yes    |
| 6     | Yellow        | `#D7D700`  | `#FFFF00`  | Yes    |
| 7     | White         | `#D7D7D7`  | `#FFFFFF`  | Yes    |

**ONLY THESE 15 COLOURS ARE PERMITTED.**

---

## RULE 2: ATTRIBUTE CLASH (CRITICAL)

This is the defining characteristic of Spectrum graphics.

### The Attribute System

- Screen is divided into **8×8 pixel cells** (called "attribute cells")
- Each cell can have ONLY **2 colours**: INK (foreground) + PAPER (background)
- **BRIGHT applies to the WHOLE CELL, not per pixel** - both INK and PAPER share the same BRIGHT flag
- Resolution: 256×192 pixels = 32×24 attribute cells

### Attribute Byte Format

```
Bit 7: FLASH (0=off, 1=flashing)
Bit 6: BRIGHT (0=normal, 1=bright)
Bits 5-3: PAPER colour (0-7)
Bits 2-0: INK colour (0-7)
```

### What This Means

- If a sprite crosses an 8×8 cell boundary, it affects that cell's colours
- Two different coloured sprites CANNOT overlap in the same cell without clash
- Careful game design places sprites to minimise clash, OR embraces it as aesthetic

### Clash Avoidance Strategies

1. **Monochrome sprites**: Use same INK across sprite, transparent PAPER
2. **Grid alignment**: Align sprites to 8×8 boundaries where possible
3. **Colour zoning**: Different screen areas use different INK/PAPER pairs
4. **Black backgrounds**: Black PAPER hides clash (most common solution)

---

## RULE 3: DISPLAY SPECIFICATIONS

| Property          | Value           | Notes                              |
|-------------------|-----------------|-------------------------------------|
| Resolution        | 256 × 192       | Fixed, non-negotiable              |
| Border            | 48px all sides  | Can be any of 8 colours            |
| Attribute Grid    | 32 × 24 cells   | Each cell is 8×8 pixels            |
| Aspect Ratio      | 4:3             | Pixels are slightly tall on CRT    |
| Frame Rate        | 25 FPS (PAL)    | 50Hz interrupt, game at 25fps      |
| Display Scale     | 4×              | For modern displays                |

### Memory Layout

- **Pixel data**: 6144 bytes (256×192 / 8 bits per byte)
- **Attribute data**: 768 bytes (32×24 cells)
- **Total display**: 6912 bytes

---

## RULE 4: SPRITE SPECIFICATIONS

The Spectrum has NO hardware sprites. All sprites are software-rendered.

| Property              | Value          | Notes                              |
|-----------------------|----------------|-------------------------------------|
| Type                  | Software       | CPU copies pixels to screen RAM    |
| Format                | 1-bit mask     | Pixels on/off, colour from attribs |
| Recommended Size      | 16 × 16 px     | 2×2 attribute cells               |
| Max Size              | 24 × 24 px     | Larger = more clash, slower       |
| Animation Frames      | 4 max          | Memory constraints                 |
| Colours per Sprite    | 2              | INK + PAPER (attribute limit)     |

### Sprite Rendering Cost

Each sprite requires CPU time to:
1. Erase previous position (restore background)
2. Store new background
3. Draw sprite with mask

**More sprites = slower game.** Budget carefully.

---

## RULE 5: PERFORMANCE CONSTRAINTS

The Z80 at 3.5MHz is SLOW by modern standards.

| Constraint              | Value  | Reason                           |
|-------------------------|--------|----------------------------------|
| Max sprites on screen   | 8      | CPU cannot handle more at 25fps  |
| Max balls on screen     | 12     | Balls are small, simple shapes   |
| Max harpoons            | 1      | Reduces collision checks         |
| Max power-ups           | 3      | Visual clarity                   |
| Animation frames        | 4      | RAM constraints (48K total)      |

### CPU Budget Per Frame (at 25fps)

- ~140,000 T-states available per frame
- Sprite draw: ~2,000-5,000 T-states each (depending on size)
- Collision detection: ~500-2,000 T-states
- Game logic: ~10,000-20,000 T-states
- Sound: ~5,000 T-states

**Must leave time for drawing or game slows down.**

---

## RULE 6: ATTRIBUTE CLASH SIMULATION

For authentic Spectrum look, the renderer SHOULD simulate attribute clash.

### Implementation

```javascript
// Each 8×8 cell tracks current INK and PAPER
const attributes = new Array(32 * 24).fill({ ink: 7, paper: 0, bright: 1 });

// When drawing a pixel:
function setPixel(x, y, isInk) {
    const cellX = Math.floor(x / 8);
    const cellY = Math.floor(y / 8);
    const cellIndex = cellY * 32 + cellX;
    
    // Pixel uses cell's INK or PAPER colour
    const attr = attributes[cellIndex];
    const colour = isInk ? attr.ink : attr.paper;
    // Draw pixel with that colour...
}

// When a sprite enters a cell, it sets that cell's INK
function setSpriteColour(cellX, cellY, inkColour, bright) {
    const cellIndex = cellY * 32 + cellX;
    attributes[cellIndex] = { 
        ink: inkColour, 
        paper: attributes[cellIndex].paper,
        bright: bright 
    };
}
```

### Clash Behaviour

When two differently-coloured sprites overlap in the same cell:
- The LAST sprite drawn "wins" and sets the cell's INK
- Previous sprite's pixels in that cell change to new INK colour
- This creates the characteristic "colour bleed"

---

## RULE 7: GAME ELEMENT COLOURS

Recommended colour assignments for Pang:

| Element          | INK    | PAPER  | Bright | Notes                    |
|------------------|--------|--------|--------|--------------------------|
| Background       | -      | Black  | No     | Solid black avoids clash |
| Player           | Cyan   | Black  | Yes    | High visibility          |
| Balls (large)    | Red    | Black  | Yes    | Danger colour            |
| Balls (medium)   | Yellow | Black  | Yes    | Warning colour           |
| Balls (small)    | White  | Black  | Yes    | Fast, bright             |
| Harpoon          | Yellow | Black  | Yes    | Matches player action    |
| Border/walls     | Blue   | Black  | No     | Frame the play area      |
| HUD text         | White  | Black  | Yes    | Maximum readability      |
| Score numbers    | Green  | Black  | Yes    | Distinct from gameplay   |

---

## RULE 8: SOUND SPECIFICATIONS

The Spectrum has a simple BEEPER (1-bit audio).

| Property          | Value              | Notes                    |
|-------------------|--------------------|--------------------------|
| Channels          | 1                  | Single beeper            |
| Type              | Square wave        | On/off only              |
| Frequency Range   | ~100Hz - 10kHz     | Practical range          |
| Volume Control    | None               | Always same volume       |

### 128K Models

The 128K Spectrum has an AY-3-8912 sound chip:

| Property          | Value              |
|-------------------|--------------------|
| Channels          | 3 tone + 1 noise   |
| Waveform          | Square waves       |
| Envelope          | Hardware envelope  |

For this engine, we target 48K (beeper) for maximum compatibility.

---

## RULE 9: VISUAL EFFECTS

### ALLOWED
- Attribute colour changes (INK/PAPER/BRIGHT)
- FLASH attribute (alternates INK/PAPER at 1.56Hz)
- Border colour changes
- Screen shake (offset rendering)
- Colour cycling (change palette indices)

### FORBIDDEN
- More than 2 colours per 8×8 cell
- Anti-aliasing
- Alpha transparency
- Gradients (except via attribute clever tricks)
- More than 15 colours on screen
- Mixing BRIGHT and non-BRIGHT in same cell

---

## RULE 10: MEMORY CONSTRAINTS

The 48K Spectrum has limited RAM:

| Area              | Size    | Notes                           |
|-------------------|---------|----------------------------------|
| Screen RAM        | 6912 B  | Fixed location, cannot move     |
| System variables  | ~256 B  | Reserved by ROM                 |
| Available to game | ~40 KB  | For code, data, sprites, sound  |

### Memory Budget Recommendation

| Asset Type        | Budget    | Notes                          |
|-------------------|-----------|--------------------------------|
| Game code         | 16 KB     | Logic, rendering, input        |
| Sprite data       | 4 KB      | All animation frames           |
| Level data        | 8 KB      | Backgrounds, layouts           |
| Sound data        | 2 KB      | Beeper routines                |
| Variables/buffers | 4 KB      | Game state, back buffers       |
| **Headroom**      | 6 KB      | Safety margin                  |

---

## RULE 11: LOADING SCREEN

Classic Spectrum games have iconic loading screens with attribute art.

### Specifications
- Resolution: 256 × 192 with attributes
- Often uses BRIGHT colours
- Frequently has loading stripes in border
- Displays while game loads from tape (nostalgic)

---

## RULE 12: SOFTWARE-DEFINED BACKGROUNDS (PREFERRED)

For Spectrum mode, **software-defined backgrounds** are preferred over PNG images.

### Why Software Backgrounds?

Original Spectrum games like Pang, Manic Miner, and Jet Set Willy used simple geometric shapes for backgrounds because:

1. **Attribute clash** - complex backgrounds cause visual mess with moving sprites
2. **Memory** - 48KB total RAM, backgrounds must be economical
3. **Performance** - simple shapes are faster to render
4. **Authenticity** - matches the look of original games

### Implementation

Backgrounds use a single INK colour (typically **CYAN**) dithered on black PAPER:

- **Rectangles** - platforms, buildings, ground
- **Polygons** - mountains, hills (like Mt. Fuji in original Pang)
- **Circles** - sun, moon, decorative elements

Each shape has a **dither level** controlling density:
- 0.0 = solid black (invisible)
- 0.5 = 50% dither (checkerboard pattern)
- 1.0 = solid cyan (all INK pixels)

### Example: Mt. Fuji Style Mountain

```javascript
{
    type: 'polygon',
    points: [
        { x: 0.5, y: 0.1 },  // Peak
        { x: 0.1, y: 0.7 },  // Left base
        { x: 0.9, y: 0.7 }   // Right base
    ],
    dither: 0.6  // 60% cyan pixels
}
```

### Colour Choice

- Use **CYAN** for main background elements (authentic Spectrum look)
- Black PAPER throughout (avoids attribute clash)
- Single INK colour per screen area

---

## RULE 13: IMPLEMENTATION CHECKLIST

When implementing or modifying 8-Bit Basic mode, verify:

### Colour Rules
- [ ] Only 15 Spectrum palette colours used
- [ ] Maximum 2 colours per 8×8 cell enforced
- [ ] BRIGHT flag applies to whole cell (both INK and PAPER)
- [ ] No per-pixel colour changes
- [ ] No gradients within any 8×8 block

### Attribute System
- [ ] Attribute clash simulated OR avoided with black PAPER
- [ ] Sprites inherit background cell's attribute colours
- [ ] Colour designed per 8×8 block, not per sprite

### Technical Constraints
- [ ] Canvas is 256 × 192 native resolution
- [ ] Frame rate capped at 25 FPS
- [ ] Max 8 sprites on screen
- [ ] Max 12 balls enforced
- [ ] Max 1 harpoon enforced
- [ ] Max 4 animation frames per character
- [ ] No anti-aliasing on canvas context

### Art Style
- [ ] Flat fills used, not smooth gradients
- [ ] Any dithering uses fixed patterns (checkerboard), not noise
- [ ] Black background preferred for gameplay
- [ ] Multi-colour reserved for static screens only

---

## RULE 13: PRACTICAL GAME DESIGN RULES (CRITICAL)

These rules ensure authentic Spectrum visuals and avoid common mistakes.

### The Golden Rule

**Design colour per 8×8 block, NOT per sprite or per object.**

Every visual decision must consider the attribute cell, not the individual pixel or sprite.

### Hard Limits - NEVER Violate These

| Forbidden | Why |
|-----------|-----|
| More than 2 colours per 8×8 block | Attribute system limitation |
| Per-pixel colour changes | Not how the hardware works |
| Gradients inside a block | Impossible with 2 colours |
| Colour following moving sprites | Sprites inherit cell attributes |

### Sprite Design Rules

1. **Sprites are bitmap pixels, NOT hardware sprites**
   - The Spectrum has no sprite hardware
   - Sprites are drawn directly to screen RAM
   
2. **Sprites inherit the attribute colour of the background cell**
   - A sprite cannot bring its own colour into a cell
   - The cell's INK/PAPER determines what colours appear
   
3. **To avoid colour clash:**
   - Use **monochrome sprites** (single INK colour)
   - Match sprite colour to background PAPER
   - Accept that clash is unavoidable when sprites cross attribute boundaries
   - Keep fast-moving objects away from colour boundaries

### Practical Colour Usage

| Guideline | Recommendation |
|-----------|----------------|
| Background | **Prefer BLACK** - hides clash completely |
| Gameplay area | Limit to **2-4 total colours** |
| Colour usage | **Sparse** - player, enemies, pickups, UI accents only |
| Movement | Keep fast objects away from colour boundaries |

### When More Colours Are Acceptable

**Static screens ONLY:**
- Title screens
- Loading screens  
- Menus
- Game over screens

**Never for gameplay:** Movement + many colours = visual mess (attribute clash chaos)

### Art Style Guidelines

| Do | Don't |
|----|-------|
| Use **flat fills** | Use gradients |
| Use **patterned shading** | Use smooth shading |
| Use **fixed checkerboard patterns** | Use noise/error-diffusion dithering |
| Design per 8×8 cell | Design per pixel |

### Dithering Rules (If Needed)

- Use **fixed patterns** only (checkerboard, stripe)
- Pattern must repeat within 8×8 cell
- Avoid random noise dithering
- Avoid Floyd-Steinberg or error-diffusion
- Dithering creates illusion of more colours but still limited to 2 per cell

---

## CLASSIC SPECTRUM GAME REFERENCES

For visual inspiration, reference these authentic Spectrum games:

- **Manic Miner** (1983) - Clean 2-colour sprites, black background
- **Jet Set Willy** (1984) - Colourful but careful clash management
- **Knight Lore** (1984) - Isometric, monochrome sprites
- **Head Over Heels** (1987) - Excellent clash-free design
- **Rainbow Islands** (1989) - Colourful, well-managed attributes
- **Cobra** (1986) - Good action game attribute handling
- **Renegade** (1987) - Multi-coloured with some clash

### Clash as Aesthetic

Some games EMBRACE clash as part of their look:
- **Skool Daze** (1984)
- **Atic Atac** (1983)

This is a valid artistic choice.

---

## ATTRIBUTE COLOUR CONSTANTS

```javascript
const SPECTRUM_COLOURS = {
    // Normal brightness
    BLACK:   '#000000',
    BLUE:    '#0000D7',
    RED:     '#D70000',
    MAGENTA: '#D700D7',
    GREEN:   '#00D700',
    CYAN:    '#00D7D7',
    YELLOW:  '#D7D700',
    WHITE:   '#D7D7D7',
    
    // Bright variants
    BRIGHT_BLACK:   '#000000', // Same as normal
    BRIGHT_BLUE:    '#0000FF',
    BRIGHT_RED:     '#FF0000',
    BRIGHT_MAGENTA: '#FF00FF',
    BRIGHT_GREEN:   '#00FF00',
    BRIGHT_CYAN:    '#00FFFF',
    BRIGHT_YELLOW:  '#FFFF00',
    BRIGHT_WHITE:   '#FFFFFF'
};

const SPECTRUM_PALETTE = [
    '#000000', '#0000D7', '#D70000', '#D700D7',
    '#00D700', '#00D7D7', '#D7D700', '#D7D7D7',
    '#000000', '#0000FF', '#FF0000', '#FF00FF',
    '#00FF00', '#00FFFF', '#FFFF00', '#FFFFFF'
];
```

---

## REVISION HISTORY

| Version | Date       | Changes                          |
|---------|------------|----------------------------------|
| 1.0     | 2025-01-26 | Initial rules document           |
| 1.1     | 2025-01-26 | Added RULE 13: Practical Game Design Rules |

---

**ANY CODE CHANGES TO 8-BIT BASIC MODE MUST COMPLY WITH THESE RULES.**
**THE ATTRIBUTE CLASH SYSTEM IS SACRED - DO NOT BYPASS IT.**
