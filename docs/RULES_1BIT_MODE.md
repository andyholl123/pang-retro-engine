# 1-BIT MODE RULES
## Classic Macintosh Style (1984-1990)

This document defines the MANDATORY rules for 1-Bit Mode rendering.
All code changes affecting 1-Bit Mode MUST comply with these rules.

---

## REFERENCE HARDWARE

- **Target System**: Apple Macintosh 128K / 512K / Plus / SE (1984-1990)
- **Display Model**: 1-bit monochrome bitmap
- **Native Resolution**: 512×342 (original Mac), 256×192 (engine)
- **Also Similar To**: Early PC Hercules, Atari ST High-Res mono
- **NOT Like**: Game Boy (has 4 shades), ZX Spectrum (has colours), E-Ink (has grey)

---

## RULE 1: COLOUR MODEL (ABSOLUTE)

| Colour   | Hex Code  | Binary |
|----------|-----------|--------|
| Black    | `#000000` | 0 (off) |
| White    | `#FFFFFF` | 1 (on)  |

**THIS IS ABSOLUTE. THERE ARE NO OTHER VALUES.**

- No greys - FORBIDDEN
- No colours - FORBIDDEN
- No brightness levels - FORBIDDEN
- No transparency/alpha - FORBIDDEN
- Every pixel is either ON or OFF

**If you have a grey pixel, you have failed.**

---

## RULE 2: RESOLUTION & ASPECT

| Property          | Engine Value  | Original Mac | Notes                    |
|-------------------|---------------|--------------|--------------------------|
| Resolution        | 256 × 192     | 512 × 342    | Scaled for performance   |
| Pixel Aspect      | 1:1 (Square)  | 1:1 (Square) | No stretching            |
| Display Scale     | 4×            | N/A          | CSS rendering            |
| Frame Rate        | 25 FPS        | ~60 FPS      | Authentic retro feel     |

### Critical Display Rules

- Do NOT rescale or blur
- Do NOT simulate CRT softness
- Square pixels only
- Crisp, hard edges

---

## RULE 3: SHADING & DITHERING (CRITICAL)

All "grey" tones must be faked using **ORDERED DITHERING**.

### Allowed Dithering Methods

| Pattern Type       | Use Case                    | Priority |
|--------------------|-----------------------------|----------|
| 2×2 checkerboard   | 50% grey, UI elements       | HIGH     |
| 4×4 ordered/Bayer  | Gradual shading, backgrounds| HIGH     |

### The 4×4 Bayer Matrix

```
     0   8   2  10
    12   4  14   6
     3  11   1   9
    15   7  13   5
```

Values 0-15. Divide by 16 for threshold (0.0 to 0.9375).

### FORBIDDEN Dithering Methods

| Method                | Why Forbidden                              |
|-----------------------|--------------------------------------------|
| Floyd-Steinberg       | Error diffusion looks computed, not drawn  |
| Blue noise            | Not period-accurate                        |
| Random/grain          | Causes shimmer, not stable                 |
| Noise dithering       | Looks photographic, not artistic           |

**Visual Goal: Patterns that look DRAWN, not COMPUTED.**

### Dithering Application

For each pixel at position (x, y):
1. Calculate source luminance (0.0 to 1.0)
2. Get Bayer threshold: `BAYER[y % 4][x % 4] / 16`
3. If luminance > threshold → WHITE
4. If luminance ≤ threshold → BLACK

### Luminance Formula

```
luminance = (0.299 × R + 0.587 × G + 0.114 × B) / 255
```

---

## RULE 4: BACKGROUND RULES (CRITICAL FOR READABILITY)

### Backgrounds MUST Be:

| Type               | When to Use                  |
|--------------------|------------------------------|
| Flat WHITE         | Default, cleanest option     |
| Flat BLACK         | Dark scenes, space, caves    |
| Light ordered dither | Subtle atmosphere only     |

### Background Guidelines

- **Back off the density** - Mac mono needs to feel cleaner than Spectrum
- Avoid dense dithering across large areas
- Large backgrounds should remain **calm and readable**
- Classic Mac games favoured **clarity over texture**
- Let shapes do the work, not texture

### Good Background Approach

```
✓ Lighter dithers (75%+ white)
✓ Larger pattern sizes
✓ More empty space
✓ Clear silhouettes
✓ Simple gradients (dithered)
```

### Bad Background Approach

```
✗ Heavy dense patterns
✗ Noisy demo-scene textures
✗ Complex detail everywhere
✗ Multiple dither layers
✗ Busy mid-tones
```

---

## RULE 5: SPRITE RULES

| Property              | Value          | Notes                              |
|-----------------------|----------------|-------------------------------------|
| Format                | PNG (1-bit)    | Only B&W pixels                    |
| Colours               | 2 only         | Black + White, nothing else        |
| Transparency          | 1-bit mask     | Opaque or invisible, no alpha      |
| Size                  | 16 × 16 px     | Standard sprite size               |
| Animation Frames      | 2 max          | Minimal animation                  |
| Internal dithering    | MINIMAL        | Keep sprites readable              |

### Sprite Style Guidelines

**Prefer:**
- Solid black on white background
- Solid white on black background
- Clean, high-contrast edges
- 1px black outlines around characters

**Avoid:**
- Heavy dithering inside sprites
- Mid-tone sprites on mid-tone backgrounds
- Soft or fuzzy edges
- Anti-aliased appearance

### Sprite Edge Quality

- Edges must be **clean and high-contrast**
- No blurry boundaries
- Sharp pixel definition
- Clear figure-ground separation

---

## RULE 6: CONTRAST RULES (MANDATORY)

| Rule | Description |
|------|-------------|
| Strong separation | Always maintain strong figure–background contrast |
| No mid-on-mid | Never place mid-tone sprites against mid-tone backgrounds |
| Text contrast | UI text must be BLACK on WHITE or WHITE on BLACK |
| Never dither text | Text is ALWAYS solid, never patterned |

### Contrast Hierarchy

1. **Foreground elements**: Mostly solid (black or white)
2. **Midground elements**: Light dither OK
3. **Background elements**: Lightest dither or solid
4. **UI/HUD**: Solid colours only, maximum contrast

---

## RULE 7: MOTION & READABILITY

| Rule | Requirement |
|------|-------------|
| Pattern stability | Patterns must remain stable when scrolling |
| No shimmer | Avoid shimmering or crawling dithers |
| Minimum pattern | Avoid patterns smaller than 2×2 pixels |
| Legibility first | Prioritise legibility over realism |

### Why This Matters

When objects move across dithered backgrounds:
- Small patterns cause visual noise
- Dense patterns obscure sprite edges
- Unstable patterns distract the eye

**READABILITY > AESTHETICS**

---

## RULE 8: SOFTWARE-DEFINED BACKGROUNDS (PREFERRED)

For 1-bit mode, **software-defined backgrounds** are preferred over PNG images:

### Why Software Backgrounds?
- More authentic to original Mac games
- Controlled, deliberate dithering
- No "processed photo" look
- Smaller file size (just code)
- Can be parameterized per level

### Implementation

Backgrounds are defined as simple geometric shapes:
- **Rectangles** - ground, buildings, platforms
- **Polygons** - mountains, hills, silhouettes  
- **Circles** - sun, moon, decorative elements

Each shape has a **dither level** (0.0 to 1.0):
- 0.0 = solid black (no pixels)
- 0.5 = 50% dither (checkerboard)
- 1.0 = solid white (all pixels)

### Example Definition

```javascript
{
    type: 'polygon',
    points: [
        { x: 0.5, y: 0.1 },  // Peak (normalized 0-1)
        { x: 0.1, y: 0.7 },  // Left base
        { x: 0.9, y: 0.7 }   // Right base
    ],
    dither: 0.6  // 60% white pixels
}
```

---

## RULE 9: ARTISTIC STYLE GUIDANCE

### Think Like a Mac Artist

Classic Mac graphics are:
- **Line art + fill** (not photo-realistic)
- **Shapes first, texture second**
- **Deliberate and designed** (not processed)

### Use Dithering To Suggest:

| Element      | Dither Level | Notes                    |
|--------------|--------------|--------------------------|
| Shadows      | 25-50%       | Under objects, depth     |
| Depth        | Gradient     | Distance, atmosphere     |
| Atmosphere   | 10-25%       | Fog, haze, soft light    |

### DO NOT Use Dithering For:

- Photographic realism
- Complex textures
- Surface detail
- Noise effects

### Reference Games (Study These)

| Game              | Year | Excellent For                    |
|-------------------|------|----------------------------------|
| Dark Castle       | 1986 | Dithered backgrounds, atmosphere |
| Lode Runner (Mac) | 1984 | Clean gameplay sprites           |
| StuntCopter       | 1986 | Simple, readable graphics        |
| Shufflepuck Café  | 1988 | Shading and depth                |
| Crystal Quest     | 1987 | Action game clarity              |
| Shadowgate        | 1987 | Atmospheric dithering            |

---

## RULE 9: WHEN DITHERING IS APPROPRIATE

### ✅ DITHER THESE

| Element               | Recommended Level |
|-----------------------|-------------------|
| Terrain shading       | 25-75%            |
| Clouds / fog          | 10-25%            |
| Mountains / silhouettes| 50-75%           |
| Shadows               | 25-50%            |
| Distance fade         | Gradient          |

### ❌ NEVER DITHER THESE

| Element               | Reason                        |
|-----------------------|-------------------------------|
| UI panels             | Must be crisp and readable    |
| Text (any)            | Legibility is paramount       |
| Fast-moving objects   | Causes visual noise           |
| Player sprite core    | Must read instantly           |
| HUD elements          | Functional, not decorative    |

---

## RULE 10: THE GOLDEN RULE

> **If the image would look wrong printed on a 1986 LaserWriter, it's wrong.**

### The LaserWriter Test

Ask yourself:
- Would this print clearly at 300 DPI?
- Are the patterns clean and regular?
- Is there strong contrast?
- Can you read everything instantly?

If yes → Good Mac graphics.
If no → Rethink your approach.

---

## RULE 11: GAME ELEMENT MAPPING

When converting coloured elements to 1-bit:

| Element              | Approach                         | Dither Level |
|----------------------|----------------------------------|--------------|
| Background sky       | Light dither or white            | 75-90%       |
| Background ground    | Medium-light dither              | 60-75%       |
| Balls (all sizes)    | Solid white, black outline       | 100% white   |
| Player               | Solid white, black outline       | 100% white   |
| Harpoon              | Solid white                      | 100% white   |
| Border/walls         | Solid black or dark dither       | 0-25%        |
| HUD background       | Solid black                      | 0%           |
| HUD text             | Solid white (NEVER dithered)     | 100% white   |

### Semantic Hints in Code

| Hint        | 1-Bit Result |
|-------------|--------------|
| 'background'| BLACK        |
| 'foreground'| WHITE        |
| 'auto'      | Luminance-based |

---

## RULE 12: CONSTRAINTS

| Constraint              | Value  | Reason                           |
|-------------------------|--------|----------------------------------|
| Max balls on screen     | 8      | Visual clarity with dithering    |
| Max harpoons            | 1      | Simplicity                       |
| Max power-ups           | 2      | Screen real estate               |
| Animation frames        | 2      | Minimal, deliberate animation    |
| Max sprites on screen   | 16     | Performance and clarity          |

---

## RULE 13: VISUAL EFFECTS

### ALLOWED

- Ordered dithering (Bayer 4×4, 2×2 checkerboard)
- Pattern fills using pre-generated dither textures
- Flashing/blinking (alternating solid black/white)
- Screen shake (position offset)
- Inverted colours (swap black ↔ white)
- Silhouettes

### FORBIDDEN

- Floyd-Steinberg / error diffusion dithering
- Blue noise / random dithering
- Any grey colours (#808080, etc.)
- Any coloured tints
- Smooth gradients (use stepped dither instead)
- Transparency / alpha blending
- Anti-aliasing
- Blur effects
- Glow effects
- CRT simulation

---

## RULE 14: AUDIO

1-bit mode should feel like a Mac Classic:

| Property          | Value              |
|-------------------|--------------------|
| Channels          | 1 (mono)           |
| Style             | Simple beeps/tones |
| Sample Rate       | 22050 Hz or lower  |

(Audio is shared across modes currently)

---

## RULE 15: IMPLEMENTATION CHECKLIST

### Colour Rules
- [ ] Only #000000 and #FFFFFF appear on screen
- [ ] No grey pixels anywhere
- [ ] No coloured pixels anywhere

### Dithering Rules
- [ ] Dithering uses 4×4 Bayer matrix ONLY
- [ ] Dither patterns tile seamlessly
- [ ] No error-diffusion dithering
- [ ] No random/noise dithering

### Text Rules
- [ ] Text is NEVER dithered
- [ ] Text is solid black on white OR white on black
- [ ] Text remains readable at all times

### Sprite Rules
- [ ] Sprites have clean, high-contrast edges
- [ ] Sprites read clearly against backgrounds
- [ ] Minimal internal sprite dithering

### Background Rules
- [ ] Backgrounds are light (calm, readable)
- [ ] No dense dithering across large areas
- [ ] Clear figure-ground separation

### Technical Rules
- [ ] Canvas is 256 × 192 native resolution
- [ ] Frame rate capped at 25 FPS
- [ ] Max 8 balls enforced
- [ ] Max 1 harpoon enforced
- [ ] Max 2 animation frames per character
- [ ] No anti-aliasing on canvas context

---

## CODE REFERENCE

### Bayer Matrix Constant

```javascript
const BAYER_4X4 = [
    [  0,  8,  2, 10 ],
    [ 12,  4, 14,  6 ],
    [  3, 11,  1,  9 ],
    [ 15,  7, 13,  5 ]
];
```

### Luminance Calculation

```javascript
function getLuminance(r, g, b) {
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}
```

### Simple Dither Check

```javascript
function shouldBeWhite(x, y, luminance) {
    const threshold = BAYER_4X4[y % 4][x % 4] / 16;
    return luminance > threshold;
}
```

### Practical Mac Dither Pipeline

For converting images to 1-bit Mac style:

1. Convert to greyscale
2. Increase contrast slightly
3. Apply Ordered/Bayer 4×4
4. Clamp output to pure black & white
5. **Manually simplify busy areas**

---

## REVISION HISTORY

| Version | Date       | Changes                                    |
|---------|------------|--------------------------------------------|
| 1.0     | 2025-01-26 | Initial rules document                     |
| 1.1     | 2025-01-26 | Complete rewrite with Classic Mac rules    |

---

**ANY CODE CHANGES TO 1-BIT MODE MUST COMPLY WITH THESE RULES.**

**REMEMBER: CLARITY OVER TEXTURE. READABILITY OVER REALISM.**

**IF IT WOULDN'T LOOK RIGHT ON A 1986 LASERWRITER, IT'S WRONG.**
