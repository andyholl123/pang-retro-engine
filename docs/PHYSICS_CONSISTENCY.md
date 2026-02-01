# PHYSICS CONSISTENCY ACROSS MODES

## Overview

All game modes share the same physics behavior, normalized to ensure consistent gameplay regardless of resolution or frame rate. The **8-Bit Plus (GX4000)** mode at **50 FPS** is the reference implementation.

---

## REFERENCE MODE

| Property | Value |
|----------|-------|
| **Reference Mode** | 8-Bit Plus (GX4000) |
| **Reference FPS** | 50 |
| **Reference Resolution** | 320 × 200 |

All physics values are defined at 50 FPS and scaled appropriately for other modes.

---

## BASE PHYSICS VALUES (at 50 FPS)

| Property | Value | Unit |
|----------|-------|------|
| Gravity | 0.15 | pixels/frame² |
| Bounce Velocity | -5.5 | pixels/frame (upward) |
| Spawn Velocity Y | -3.0 | pixels/frame (upward) |
| Ball Speed (Large) | 1.0 | pixels/frame |
| Ball Speed (Medium) | 1.4 | pixels/frame |
| Ball Speed (Small) | 1.8 | pixels/frame |
| Player Speed | 2.5 | pixels/frame |
| Harpoon Speed | 7.0 | pixels/frame |

---

## MODE SCALING

### Frame Rate Compensation

Different modes run at different frame rates:

| Mode | Target FPS | FPS Ratio |
|------|------------|-----------|
| 1-Bit | 25 | 2.0 |
| 8-Bit Basic | 25 | 2.0 |
| 8-Bit CPC | 25 | 2.0 |
| 8-Bit Plus | 50 | 1.0 (reference) |
| 16-Bit | 60 | 0.833 |

**Velocity values** are multiplied by `fpsRatio` to maintain consistent real-time speed.

**Acceleration values** (gravity) are multiplied by `fpsRatio²` because acceleration compounds per frame.

### Resolution Scaling

Different modes have different resolutions:

| Mode | Resolution | X Scale | Y Scale |
|------|------------|---------|---------|
| 1-Bit | 256 × 192 | 0.8 | 0.96 |
| 8-Bit Basic | 256 × 192 | 0.8 | 0.96 |
| 8-Bit CPC | 160 × 200 | 0.5 | 1.0 |
| 8-Bit Plus | 320 × 200 | 1.0 | 1.0 |
| 16-Bit | 320 × 224 | 1.0 | 1.12 |

**Horizontal speeds** are scaled by X factor.

**Vertical speeds** are scaled by Y factor.

---

## CALCULATED PHYSICS PER MODE

### Ball Speeds (Horizontal)

| Mode | Large | Medium | Small |
|------|-------|--------|-------|
| 1-Bit | 1.6 | 2.24 | 2.88 |
| 8-Bit Basic | 1.6 | 2.24 | 2.88 |
| 8-Bit CPC | 1.0 | 1.4 | 1.8 |
| 8-Bit Plus | 1.0 | 1.4 | 1.8 |
| 16-Bit | 0.83 | 1.17 | 1.5 |

### Gravity

| Mode | Gravity (px/frame²) |
|------|---------------------|
| 1-Bit | 0.576 |
| 8-Bit Basic | 0.576 |
| 8-Bit CPC | 0.6 |
| 8-Bit Plus | 0.15 |
| 16-Bit | 0.104 |

### Bounce Velocity

| Mode | Bounce VY (px/frame) |
|------|-----------------------|
| 1-Bit | -10.56 |
| 8-Bit Basic | -10.56 |
| 8-Bit CPC | -11.0 |
| 8-Bit Plus | -5.5 |
| 16-Bit | -3.85 |

---

## WHY THIS APPROACH?

### Problem: Inconsistent Gameplay

Without normalization:
- 60 FPS mode would have balls moving ~2.4× faster than 25 FPS mode
- Lower resolution modes would feel cramped with same-speed objects
- Different modes would feel like different games

### Solution: Frame-Rate Independent Physics

1. **Define all physics at reference FPS (50)**
2. **Scale velocities by FPS ratio** to maintain consistent real-time speed
3. **Scale by resolution** to maintain consistent screen-relative speed
4. **Test gameplay feel** across all modes

---

## BALL BEHAVIOR SUMMARY

All balls across all modes:
- Bounce at the same height (relative to screen)
- Travel at the same speed (relative to screen width)
- Split with consistent timing
- Feel the same to play

The 8-Bit Plus mode is the "gold standard" - if the game feels right there, it should feel right everywhere.

---

## IMPLEMENTATION

In `index.html`:

```javascript
// Reference values
const REFERENCE_FPS = 50;
const BASE_PHYSICS = {
    gravity: 0.15,
    bounceVelocity: -5.5,
    // ... etc
};

// In getModeConfig():
const fpsRatio = REFERENCE_FPS / mode.targetFPS;
const scale = SCALE_FACTORS[mode.id];

return {
    gravity: BASE_PHYSICS.gravity * scale.y * (fpsRatio * fpsRatio),
    bounceVY: BASE_PHYSICS.bounceVelocity * scale.y * fpsRatio,
    // ... etc
};
```

---

## REVISION HISTORY

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-01-26 | Initial physics consistency implementation |

---

**IMPORTANT: Any changes to physics must maintain cross-mode consistency.**
**Test gameplay in ALL modes after any physics changes.**
