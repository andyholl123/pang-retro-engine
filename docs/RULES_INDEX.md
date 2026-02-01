# RETRO ENGINE - MODE RULES INDEX

This folder contains hardware-accurate specification documents for each display mode.
**ALL code changes MUST comply with the relevant mode's rules.**

---

## QUICK REFERENCE

| Mode         | Resolution | Colours        | Sprites           | FPS | Export |
|--------------|------------|----------------|-------------------|-----|--------|
| 1-Bit        | 256×192    | 2 (B&W)        | 16 (software)     | 25  | No     |
| 8-Bit Basic  | 256×192    | 15 (clash)     | 8 (software)      | 25  | No     |
| 8-Bit CPC    | 160×200    | 16 from 27     | 12 (software)     | 25  | Yes    |
| 8-Bit Plus   | 320×200    | 16 from 4096   | 16 (hardware)     | 50  | Yes    |
| 16-Bit       | 320×224    | 64 from 512    | 80 (hardware)     | 60  | No     |

---

## RULE DOCUMENTS

| File                          | Target Hardware                         |
|-------------------------------|-----------------------------------------|
| `RULES_1BIT_MODE.md`          | Classic Macintosh (1984-1990)           |
| `RULES_8BIT_BASIC_MODE.md`    | ZX Spectrum 48K/128K (1982-1992)        |
| `RULES_8BIT_CPC_MODE.md`      | Amstrad CPC 464/6128 (1984-1990)        |
| `RULES_8BIT_PLUS_MODE.md`     | Amstrad GX4000/CPC Plus (1990-1991)     |
| `RULES_16BIT_MODE.md`         | Mega Drive/Genesis + Neo Geo (1988-96)  |
| `PHYSICS_CONSISTENCY.md`      | Cross-mode physics standardization      |

---

## CONSTRAINT SUMMARY

### Maximum Objects On Screen

| Object       | 1-Bit | 8-Basic | 8-CPC | 8-Plus | 16-Bit |
|--------------|-------|---------|-------|--------|--------|
| Sprites      | 16    | 8       | 12    | 16     | 80     |
| Balls        | 8     | 12      | 12    | 14     | 24     |
| Harpoons     | 1     | 1       | 1     | 2      | 2      |
| Power-ups    | 2     | 3       | 4     | 4      | 6      |
| Anim frames  | 2     | 4       | 4     | 4      | 8      |

### Sprite System Type

| Mode         | Type      | Notes                              |
|--------------|-----------|-------------------------------------|
| 1-Bit        | Software  | CPU renders to framebuffer         |
| 8-Bit Basic  | Software  | CPU renders with attribute clash   |
| 8-Bit CPC    | Software  | CPU renders to Mode 0 VRAM         |
| 8-Bit Plus   | Hardware  | ASIC chip handles 16×16 sprites    |
| 16-Bit       | Hardware  | VDP handles 8×8 to 32×32 sprites   |

### Asset Format

| Mode         | Format              | Notes                              |
|--------------|---------------------|-------------------------------------|
| 1-Bit        | Individual PNGs     | 1-bit with dithering patterns      |
| 8-Bit Basic  | Individual PNGs     | 2 colours per sprite (INK+PAPER)   |
| 8-Bit CPC    | Individual PNGs     | 4bpp, 16 colours                   |
| 8-Bit Plus   | Tilesheet PNG       | 16×16 tiles, 4bpp, 15+trans        |
| 16-Bit       | Tilesheet PNG       | 8×8 tiles composable to 32×32      |

---

## KEY DIFFERENCES BETWEEN MODES

### 1-Bit (Classic Mac) vs Others
- Only 2 colours (black and white) - ABSOLUTE
- Uses ordered dithering (4×4 Bayer) for backgrounds ONLY
- Foreground elements should be SOLID (not dithered)
- Prioritises CLARITY over texture
- Think LaserWriter print quality
- Classic Mac style: line art + fill, shapes first

### 8-Bit Basic (Spectrum) vs 8-Bit CPC
- Spectrum: Higher resolution (256×192) but attribute clash
- CPC: Mode 0: 160×200/16 colours, Mode 1: 320×200/4 colours
- Spectrum: 15 colours, 2 per 8×8 cell (attribute system)
- CPC: **No attribute clash** - colour is per-pixel
- CPC: Software sprites only - all rendering is CPU
- CPC: "Spectrum killer" in Mode 1 - clean and readable

### 8-Bit CPC vs 8-Bit Plus
- Same CPU (Z80 @ 4MHz), same screen modes
- **CPC: Software sprites only**, 27-colour palette
- **Plus: 16 hardware sprites**, 4096-colour palette
- Plus enables 50fps (CPC typically 25fps)
- Plus should **enhance, not replace** CPC gameplay
- Design for CPC first, add Plus enhancements

### 8-Bit Plus vs 16-Bit
- Plus: 16 sprites, 16×16 fixed size, 50fps
- 16-Bit: 80 sprites, variable sizes (8-32px), 60fps
- 16-Bit: Much more powerful, arcade quality
- Plus: Still 8-bit CPU limitations
- **16-Bit Design Rule**: Must work on both MD and Neo Geo

### 16-Bit Specific Constraints (NEW)
- **No true alpha blending** - shadows via duplicate sprites only
- **512 colour palette** (9-bit RGB: 8 levels per channel)
- **64 max on-screen colours** (4 palettes × 16)
- **UI limited to 4 colours** per Rule 2
- **20 sprites max per scanline** (MD hardware limit)
- **CRT safe margins**: 8px from edges for HUD
- **No raster tricks** - must be platform-agnostic
- **No photographic gradients** - ordered dithering only (if any)
- **Golden Rule**: "Design like you don't know which 16-bit machine you're shipping on"

---

## EXPORT TARGETS

### Exportable Modes

| Mode       | Format        | Toolchain    | Target Hardware      |
|------------|---------------|--------------|----------------------|
| 8-Bit CPC  | .DSK / .CDT   | CPCtelera    | Amstrad CPC 464/6128 |
| 8-Bit Plus | .CPR          | CPCtelera    | Amstrad GX4000       |

### Non-Exportable Modes

| Mode         | Reason                                      |
|--------------|---------------------------------------------|
| 1-Bit        | Classic Mac export not currently supported  |
| 8-Bit Basic  | Spectrum export not currently supported     |
| 16-Bit       | Megadrive export not currently supported    |

These modes are browser-play only for now.

---

## WHEN MODIFYING CODE

### Before Making Changes

1. **Identify which mode(s) are affected**
2. **Read the corresponding RULES file**
3. **Check constraint limits**
4. **Verify colour palette compliance**
5. **Ensure sprite limits are respected**

### Code Review Checklist

- [ ] Colours are valid for target mode's palette
- [ ] Sprite count does not exceed mode limit
- [ ] Ball count does not exceed mode limit
- [ ] Animation frame count matches mode spec
- [ ] Resolution matches mode specification
- [ ] Frame rate target is appropriate

### Testing

1. **Test in each mode separately**
2. **Verify constraint enforcement**
3. **Check visual authenticity**
4. **Confirm export still works (CPC/Plus modes)**
5. **Test physics feel is consistent across modes** (see `PHYSICS_CONSISTENCY.md`)

---

## ADDING NEW MODES (Future)

If adding a new mode, create a RULES file with:

1. Reference hardware specifications
2. Display specifications (resolution, colours, aspect)
3. Sprite specifications (count, size, colours)
4. Performance constraints (CPU budget, limits)
5. Sound specifications
6. Memory constraints
7. Allowed/forbidden visual effects
8. Implementation checklist
9. Reference games for visual style
10. Code snippets for palette/colour handling

Name the file: `RULES_[MODE_NAME]_MODE.md`

---

## CONTACT / UPDATES

These rules documents are based on official hardware specifications and extensive testing. If you find inaccuracies or need clarification, please flag for review.

**Last Updated**: 2025-01-26

---

**REMEMBER: AUTHENTICITY IS THE GOAL.**
**If it couldn't run on the original hardware, it shouldn't be in that mode.**
