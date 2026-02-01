# Amstrad CPC Game Development Rules

> **Comprehensive hardware constraints and rendering rules for authentic Amstrad CPC game development**
> Based on deep analysis of CPCtelera framework and official Amstrad CPC documentation.

---

## Table of Contents

1. [Hardware Overview](#1-hardware-overview)
2. [Video Modes](#2-video-modes)
3. [Color System](#3-color-system)
4. [Memory Architecture](#4-memory-architecture)
5. [Video Memory Layout](#5-video-memory-layout)
6. [Sprite Rendering](#6-sprite-rendering)
7. [Keyboard & Joystick](#7-keyboard--joystick)
8. [Audio System](#8-audio-system)
9. [Memory Banking (128K+)](#9-memory-banking-128k)
10. [GX4000 / CPC Plus Specifics](#10-gx4000--cpc-plus-specifics)
11. [Best Practices](#11-best-practices)
12. [Pixel Format Reference](#12-pixel-format-reference)

---

## 1. Hardware Overview

### CPU
- **Zilog Z80A** @ 4 MHz (effective ~3.3 MHz due to memory contention)
- 8-bit processor with 16-bit address bus
- 64KB directly addressable memory

### Gate Array
- Custom ASIC handling video generation, memory mapping, and I/O
- Controls palette, video mode, and ROM/RAM banking

### CRTC (6845)
- Cathode Ray Tube Controller
- Generates video timing signals
- Programmable for custom screen sizes

### Models
| Model | RAM | Year | Notes |
|-------|-----|------|-------|
| CPC 464 | 64KB | 1984 | Integrated cassette |
| CPC 664 | 64KB | 1985 | Integrated 3" disk |
| CPC 6128 | 128KB | 1985 | 128KB RAM, disk drive |
| GX4000 | 64KB | 1990 | Console, enhanced features |
| CPC Plus | 128KB | 1990 | Enhanced CPC 6128 |

---

## 2. Video Modes

The Amstrad CPC has **three standard video modes**:

### Mode 0 (Low Resolution, High Color)
```
Resolution:    160 × 200 pixels
Colors:        16 simultaneous (from 27 palette)
Bytes/pixel:   1 byte = 2 pixels
Screen width:  80 bytes
Pixel aspect:  2:1 (wide pixels)
```
**Use for:** Games requiring many colors, detailed sprites

### Mode 1 (Medium Resolution, Medium Color)
```
Resolution:    320 × 200 pixels
Colors:        4 simultaneous (from 27 palette)
Bytes/pixel:   1 byte = 4 pixels
Screen width:  80 bytes
Pixel aspect:  1:1 (square pixels)
```
**Use for:** Balanced games, text with graphics

### Mode 2 (High Resolution, Low Color)
```
Resolution:    640 × 200 pixels
Colors:        2 simultaneous (from 27 palette)
Bytes/pixel:   1 byte = 8 pixels
Screen width:  80 bytes
Pixel aspect:  1:2 (tall pixels)
```
**Use for:** Text applications, wireframe graphics

### Screen Constants
```c
#define SCREEN_WIDTH_BYTES   80    // All modes
#define SCREEN_HEIGHT       200    // Standard height
#define SCREEN_SIZE      16384    // 16KB (0x4000 bytes)
#define VMEM_START       0xC000   // Default video memory start
#define VMEM_END         0xFFFF   // Video memory end
```

---

## 3. Color System

### The 27-Color Palette

The CPC has a fixed hardware palette of **27 colors** (3 levels × 3 channels = 27).

#### Firmware Colors (0-26)
Used by BASIC and firmware routines:

| FW | Name | FW | Name | FW | Name |
|----|------|----|----- |----|------|
| 0 | Black | 9 | Green | 18 | Bright Green |
| 1 | Blue | 10 | Cyan | 19 | Sea Green |
| 2 | Bright Blue | 11 | Sky Blue | 20 | Bright Cyan |
| 3 | Red | 12 | Yellow | 21 | Lime |
| 4 | Magenta | 13 | White | 22 | Pastel Green |
| 5 | Mauve | 14 | Pastel Blue | 23 | Pastel Cyan |
| 6 | Bright Red | 15 | Orange | 24 | Bright Yellow |
| 7 | Purple | 16 | Pink | 25 | Pastel Yellow |
| 8 | Bright Magenta | 17 | Pastel Magenta | 26 | Bright White |

#### Hardware Colors (Gate Array Values)
Used by direct hardware programming:

| HW | Name | HW | Name | HW | Name |
|----|------|----|----- |----|------|
| 0x14 | Black | 0x16 | Green | 0x12 | Bright Green |
| 0x04 | Blue | 0x06 | Cyan | 0x02 | Sea Green |
| 0x15 | Bright Blue | 0x17 | Sky Blue | 0x13 | Bright Cyan |
| 0x1C | Red | 0x1E | Yellow | 0x1A | Lime |
| 0x18 | Magenta | 0x00 | White | 0x19 | Pastel Green |
| 0x1D | Mauve | 0x1F | Pastel Blue | 0x1B | Pastel Cyan |
| 0x0C | Bright Red | 0x0E | Orange | 0x0A | Bright Yellow |
| 0x05 | Purple | 0x07 | Pink | 0x03 | Pastel Yellow |
| 0x0D | Bright Magenta | 0x0F | Pastel Magenta | 0x0B | Bright White |

### RGB Values (for Emulation/Web)
```javascript
const CPC_PALETTE = {
    // Standard colors
    black:          '#000000',  // FW 0,  HW 0x14
    blue:           '#000080',  // FW 1,  HW 0x04
    brightBlue:     '#0000FF',  // FW 2,  HW 0x15
    red:            '#800000',  // FW 3,  HW 0x1C
    magenta:        '#800080',  // FW 4,  HW 0x18
    mauve:          '#8000FF',  // FW 5,  HW 0x1D
    brightRed:      '#FF0000',  // FW 6,  HW 0x0C
    purple:         '#FF0080',  // FW 7,  HW 0x05
    brightMagenta:  '#FF00FF',  // FW 8,  HW 0x0D
    green:          '#008000',  // FW 9,  HW 0x16
    cyan:           '#008080',  // FW 10, HW 0x06
    skyBlue:        '#0080FF',  // FW 11, HW 0x17
    yellow:         '#808000',  // FW 12, HW 0x1E
    white:          '#808080',  // FW 13, HW 0x00
    pastelBlue:     '#8080FF',  // FW 14, HW 0x1F
    orange:         '#FF8000',  // FW 15, HW 0x0E
    pink:           '#FF8080',  // FW 16, HW 0x07
    pastelMagenta:  '#FF80FF',  // FW 17, HW 0x0F
    brightGreen:    '#00FF00',  // FW 18, HW 0x12
    seaGreen:       '#00FF80',  // FW 19, HW 0x02
    brightCyan:     '#00FFFF',  // FW 20, HW 0x13
    lime:           '#80FF00',  // FW 21, HW 0x1A
    pastelGreen:    '#80FF80',  // FW 22, HW 0x19
    pastelCyan:     '#80FFFF',  // FW 23, HW 0x1B
    brightYellow:   '#FFFF00',  // FW 24, HW 0x0A
    pastelYellow:   '#FFFF80',  // FW 25, HW 0x03
    brightWhite:    '#FFFFFF'   // FW 26, HW 0x0B
};
```

### Palette Ink Assignment
- **Pen 0-15**: Screen colors (Mode 0: all 16, Mode 1: 0-3, Mode 2: 0-1)
- **Pen 16**: Border color

---

## 4. Memory Architecture

### Standard Memory Map (64KB)
```
0x0000 - 0x3FFF : RAM Bank 0 / Lower ROM (BASIC/OS)
0x4000 - 0x7FFF : RAM Bank 1 (often used as back buffer)
0x8000 - 0xBFFF : RAM Bank 2
0xC000 - 0xFFFF : RAM Bank 3 / Screen Memory / Upper ROM
```

### Video Memory Default
```
Standard screen: 0xC000 - 0xFFFF (16KB)
Back buffer:     0x4000 - 0x7FFF (when using double buffering)
```

### Memory Pages (for cpct_setVideoMemoryPage)
```c
#define cpct_pageC0  0x30  // 0xC000-0xFFFF (default)
#define cpct_page80  0x20  // 0x8000-0xBFFF
#define cpct_page40  0x10  // 0x4000-0x7FFF
#define cpct_page00  0x00  // 0x0000-0x3FFF
```

---

## 5. Video Memory Layout

### Screen Line Organization
The CPC screen is **NOT** stored linearly. It uses an interlaced layout:

```
Lines 0,8,16,24...  -> 0xC000 + (line/8)*80
Lines 1,9,17,25...  -> 0xC800 + (line/8)*80
Lines 2,10,18,26... -> 0xD000 + (line/8)*80
Lines 3,11,19,27... -> 0xD800 + (line/8)*80
Lines 4,12,20,28... -> 0xE000 + (line/8)*80
Lines 5,13,21,29... -> 0xE800 + (line/8)*80
Lines 6,14,22,30... -> 0xF000 + (line/8)*80
Lines 7,15,23,31... -> 0xF800 + (line/8)*80
```

### Screen Pointer Calculation
```c
// Calculate video memory address for coordinates (x in bytes, y in pixels)
#define cpctm_screenPtr(VMEM, X, Y) \
    (void*)((VMEM) + 80 * ((unsigned int)((Y) >> 3)) + 2048 * ((Y) & 7) + (X))

// Example: Get pointer to (10, 50) from default video memory
u8* ptr = cpctm_screenPtr(CPCT_VMEM_START, 10, 50);
```

### Character Cell (8 lines)
```
Each 8-line character block spans:
- Line 0: base address
- Line 1: base + 0x800
- Line 2: base + 0x1000
- Line 3: base + 0x1800
- Line 4: base + 0x2000
- Line 5: base + 0x2800
- Line 6: base + 0x3000
- Line 7: base + 0x3800
```

---

## 6. Sprite Rendering

### Sprite Data Format

#### Mode 0 (2 pixels per byte)
```
Byte bits:  [7] [6] [5] [4] [3] [2] [1] [0]
Pixel 0:     7   3   5   1   -   -   -   -
Pixel 1:     -   -   -   -   6   2   4   0

Pixel value = 4 bits (0-15)
```

#### Mode 1 (4 pixels per byte)
```
Byte bits:  [7] [6] [5] [4] [3] [2] [1] [0]
Pixel 0:     7   -   3   -   -   -   -   -
Pixel 1:     -   6   -   2   -   -   -   -
Pixel 2:     -   -   -   -   5   -   1   -
Pixel 3:     -   -   -   -   -   4   -   0

Pixel value = 2 bits (0-3)
```

#### Mode 2 (8 pixels per byte)
```
Byte bits:  [7] [6] [5] [4] [3] [2] [1] [0]
Pixels:      0   1   2   3   4   5   6   7

Pixel value = 1 bit (0-1)
```

### Sprite Drawing Functions
```c
// Basic sprite drawing (no transparency)
void cpct_drawSprite(void *sprite, void* memory, u8 width, u8 height);

// Masked sprite (with transparency mask interleaved)
void cpct_drawSpriteMasked(void *sprite, void* memory, u8 width, u8 height);

// Blended sprite (XOR, AND, OR operations)
void cpct_drawSpriteBlended(void *memory, u8 height, u8 width, void *sprite);

// Solid color box
void cpct_drawSolidBox(void *memory, u8 colour_pattern, u8 width, u8 height);
```

### Sprite Width Limits
- Maximum sprite width: **63 bytes** (due to LDIR instruction limitations)
- For wider sprites, split into multiple parts

### Sprite Size Calculations
| Mode | Pixels Wide | Bytes Wide | Example |
|------|-------------|------------|---------|
| 0 | 16 px | 8 bytes | 16×16 sprite = 8×16 bytes |
| 0 | 32 px | 16 bytes | 32×32 sprite = 16×32 bytes |
| 1 | 16 px | 4 bytes | 16×16 sprite = 4×16 bytes |
| 1 | 32 px | 8 bytes | 32×32 sprite = 8×32 bytes |
| 2 | 16 px | 2 bytes | 16×16 sprite = 2×16 bytes |
| 2 | 32 px | 4 bytes | 32×32 sprite = 4×32 bytes |

### Horizontal Sprite Flipping
```c
void cpct_hflipSpriteM0(u8 width, u8 height, void* sprite);  // Mode 0
void cpct_hflipSpriteM1(u8 width, u8 height, void* sprite);  // Mode 1
void cpct_hflipSpriteM2(u8 width, u8 height, void* sprite);  // Mode 2
```

### Transparency Tables
For drawing sprites with a transparent color (without mask data):
```c
// Create a transparency table for Mode 0, pen 0 as transparent
cpctm_createTransparentMaskTable(myTable, 0x2100, M0, 0);

// Draw using the table
cpct_drawSpriteMaskedAlignedTable(sprite, pmem, width, height, myTable);
```

---

## 7. Keyboard & Joystick

### Keyboard Matrix
The CPC keyboard is organized as a 10×8 matrix (80 keys/buttons).

### Key Scanning
```c
// Scan entire keyboard (store in cpct_keyboardStatusBuffer)
cpct_scanKeyboard();      // Standard scan
cpct_scanKeyboard_f();    // Fast scan (no firmware check)
cpct_scanKeyboard_i();    // Interrupt-safe scan
cpct_scanKeyboard_if();   // Interrupt-safe fast scan

// Check if a specific key is pressed
if (cpct_isKeyPressed(Key_Space)) { /* Space pressed */ }
if (cpct_isKeyPressed(Joy0_Fire1)) { /* Joy 0 fire 1 */ }
```

### Common Key Definitions
```c
// Cursor keys
Key_CursorUp, Key_CursorDown, Key_CursorLeft, Key_CursorRight

// Function keys
Key_F0, Key_F1, Key_F2, Key_F3, Key_F4, Key_F5, Key_F6, Key_F7, Key_F8, Key_F9

// Special keys
Key_Space, Key_Enter, Key_Return, Key_Esc, Key_Tab
Key_Shift, Key_Control, Key_CapsLock, Key_Del, Key_Clr

// Letter keys
Key_A through Key_Z

// Number keys
Key_0 through Key_9

// Joystick 0 (directly connected)
Joy0_Up, Joy0_Down, Joy0_Left, Joy0_Right
Joy0_Fire1, Joy0_Fire2, Joy0_Fire3

// Joystick 1 (directly connected - shared with keys)
Joy1_Up (Key_6), Joy1_Down (Key_5), Joy1_Left (Key_R), Joy1_Right (Key_T)
Joy1_Fire1 (Key_G), Joy1_Fire2 (Key_F), Joy1_Fire3 (Key_B)
```

---

## 8. Audio System

### AY-3-8912 PSG (Programmable Sound Generator)
- **3 square wave channels** (A, B, C)
- **1 noise generator** (shared across channels)
- **Envelope generator** (shared)
- **Frequency range**: ~30 Hz to ~125 kHz

### Channel Bitmasks
```c
#define AY_CHANNEL_A    0b00000001
#define AY_CHANNEL_B    0b00000010
#define AY_CHANNEL_C    0b00000100
#define AY_CHANNEL_ALL  0b00000111
```

### Arkos Tracker Player
```c
// Initialize and play music
cpct_akp_musicInit(songdata);   // Load song
cpct_akp_musicPlay();           // Play one frame (call each frame)
cpct_akp_stop();                // Stop music

// Sound effects
cpct_akp_SFXInit(sfx_data);     // Load SFX
cpct_akp_SFXPlay(sfx_num, volume, note, speed, pitch, channel);
cpct_akp_SFXStop(channel_mask); // Stop SFX on channels
cpct_akp_SFXStopAll();          // Stop all SFX
```

---

## 9. Memory Banking (128K+)

### Available on CPC 6128, CPC Plus, and expanded systems

### Bank Selection
```c
// Bank numbers (bits 3-5 of Gate Array register 3)
#define BANK_0  (0 << 3)  // Default 64K expansion
#define BANK_1  (1 << 3)
#define BANK_2  (2 << 3)
// ... up to BANK_7 for 512K expansions

// RAM configurations (bits 0-2)
#define RAMCFG_0  0  // Standard: RAM 0-3 mapped to 0000-FFFF
#define RAMCFG_1  1  // RAM 7 at C000-FFFF
#define RAMCFG_2  2  // RAM 4-7 mapped to 0000-FFFF
#define RAMCFG_3  3  // RAM 3 at 4000-7FFF, RAM 7 at C000-FFFF
#define RAMCFG_4  4  // RAM 4 at 4000-7FFF
#define RAMCFG_5  5  // RAM 5 at 4000-7FFF
#define RAMCFG_6  6  // RAM 6 at 4000-7FFF
#define RAMCFG_7  7  // RAM 7 at 4000-7FFF

// Switch memory configuration
cpct_pageMemory(BANK_0 | RAMCFG_4);  // Map RAM 4 to 4000-7FFF
```

### Double Buffering with Banking
```c
// Use 0x4000-0x7FFF as back buffer
#define SCR_BUFF  (u8*)0x4000

// Clear both buffers
cpct_memset(CPCT_VMEM_START, 0x00, 0x4000);  // Screen
cpct_memset(SCR_BUFF, 0x00, 0x4000);          // Back buffer

// Swap buffers
cpct_setVideoMemoryPage(cpct_page40);  // Show back buffer
cpct_setVideoMemoryPage(cpct_pageC0);  // Show main screen
```

---

## 10. GX4000 / CPC Plus Specifics

### Enhanced Features
The GX4000 and CPC Plus have additional hardware capabilities:

### Extended Palette (4096 Colors)
```
- 12-bit color (4 bits per R/G/B channel)
- 32 hardware palette entries
- Palette split (different palettes per scanline via raster interrupts)
```

### Hardware Sprites
```
- 16 hardware sprites
- Up to 16×16 pixels each
- Independent of background
- Hardware zoom (×1, ×2, ×4)
- Collision detection
```

### Programmable Raster Interrupts
```
- Set interrupt at any scanline
- Enable palette changes, sprite updates per scanline
- Allows parallax scrolling, split-screen effects
```

### DMA Sound
```
- 8-bit PCM audio playback
- 3 DMA channels
- Sample rates up to 15.6 kHz
```

### Cartridge Support
```
- ROM cartridges up to 512KB
- Bank switching for larger games
- Instant load (no tape/disk)
```

### GX4000 Sprite Constraints
```
- 16 sprites maximum on screen
- Each sprite: 16×16 pixels max at ×1 zoom
- Sprite data: 128 bytes each (16×16 @ 4bpp = 128 bytes)
- Sprites can overlap but total pixels per scanline limited
```

---

## 11. Best Practices

### Initialization Pattern
```c
void initializeCPC() {
    // 1. Disable firmware to prevent interference
    cpct_disableFirmware();
    
    // 2. Convert firmware colors to hardware colors
    cpct_fw2hw(palette, num_colors);
    
    // 3. Set palette
    cpct_setPalette(palette, num_colors);
    
    // 4. Set border color
    cpct_setBorder(palette[border_color_index]);
    
    // 5. Set video mode
    cpct_setVideoMode(mode);  // 0, 1, or 2
    
    // 6. Clear screen
    cpct_clearScreen(0);
}
```

### Game Loop Pattern
```c
void main(void) {
    initializeCPC();
    
    while(1) {
        // Wait for VSYNC to avoid tearing
        cpct_waitVSYNC();
        
        // Scan keyboard/joystick
        cpct_scanKeyboard();
        
        // Update game logic
        updateGame();
        
        // Clear/redraw screen
        renderGame();
        
        // Play music frame
        cpct_akp_musicPlay();
    }
}
```

### Screen Clearing
```c
// Standard clear (98ms, ~5 VSYNCs)
cpct_clearScreen(0x00);

// Fast clear - 8 byte chunks (41ms, ~2 VSYNCs)
cpct_clearScreen_f8(0x0000);

// Fastest clear - 64 byte chunks (34ms, ~1.7 VSYNCs)
cpct_clearScreen_f64(0x0000);
```

### Efficient Sprite Drawing
```c
// Pre-calculate screen pointer once
u8* pvideo = cpct_getScreenPtr(CPCT_VMEM_START, x, y);

// Draw sprite at calculated position
cpct_drawSprite(sprite_data, pvideo, width, height);
```

### Tile-Based Rendering
```c
// Set tileset once
cpct_etm_setTileset2x4(tileset);

// Draw tilemap
cpct_etm_drawTilemap2x4_f(map_width, map_height, pvideomem, tilemap);

// Update portion of tilemap
cpct_etm_drawTileBox2x4(x, y, w, h, map_width, pvideomem, tilemap);
```

---

## 12. Pixel Format Reference

### Mode 0: 2 Pixels Per Byte
```
Bit layout: [P0b3][P0b1][P1b3][P1b1][P0b2][P0b0][P1b2][P1b0]
            bit 7  bit 6  bit 5  bit 4  bit 3  bit 2  bit 1  bit 0

Pixel 0 = bit7 << 3 | bit3 << 2 | bit5 << 1 | bit1
Pixel 1 = bit6 << 3 | bit2 << 2 | bit4 << 1 | bit0
```

### Converting Pixels to Bytes (Mode 0)
```c
// Convert two palette indices (0-15) to a Mode 0 byte
u8 cpct_px2byteM0(u8 px0, u8 px1);

// Example: Create a byte with color 5 (left) and color 10 (right)
u8 byte = cpct_px2byteM0(5, 10);
```

### Converting Pixels to Bytes (Mode 1)
```c
// Convert four palette indices (0-3) to a Mode 1 byte
u8 cpct_px2byteM1(u8 px0, u8 px1, u8 px2, u8 px3);

// Example: Create a byte with colors 0, 1, 2, 3
u8 byte = cpct_px2byteM1(0, 1, 2, 3);
```

### Blend Modes
```c
// Available blend operations for cpct_drawSpriteBlended
CPCT_BLEND_XOR  = 0xAE  // background ^ sprite
CPCT_BLEND_AND  = 0xA6  // background & sprite
CPCT_BLEND_OR   = 0xB6  // background | sprite
CPCT_BLEND_ADD  = 0x86  // background + sprite
CPCT_BLEND_ADC  = 0x8E  // background + sprite + carry
CPCT_BLEND_SBC  = 0x9E  // background - sprite - carry
CPCT_BLEND_SUB  = 0x96  // background - sprite
CPCT_BLEND_LDI  = 0x7E  // sprite only (overwrite)
CPCT_BLEND_NOP  = 0x00  // background only (no change)
```

---

## Quick Reference Card

### Screen Dimensions by Mode
| Mode | Width (px) | Height (px) | Colors | Bytes/Line |
|------|------------|-------------|--------|------------|
| 0 | 160 | 200 | 16 | 80 |
| 1 | 320 | 200 | 4 | 80 |
| 2 | 640 | 200 | 2 | 80 |

### Memory Constants
```c
CPCT_VMEM_START   = (u8*)0xC000   // Video memory start
SCREEN_SIZE       = 0x4000        // 16384 bytes
SCREEN_WIDTH      = 80            // bytes per line
SCREEN_HEIGHT     = 200           // lines
```

### Timing (at 50Hz)
```
1 VSYNC = 20ms = 1/50th second
Frame rate target: 50 FPS (Europe) or 60 FPS (NTSC)
CPU cycles per frame: ~80,000 (at 4MHz)
```

### Type Definitions
```c
typedef unsigned char       u8;   // 0 to 255
typedef signed char         i8;   // -128 to 127
typedef unsigned int       u16;   // 0 to 65535
typedef signed int         i16;   // -32768 to 32767
typedef unsigned long      u32;   // 0 to 4,294,967,295
typedef signed long        i32;   // -2B to +2B
```

---

## References

- **CPCtelera**: http://lronaldo.github.io/cpctelera/
- **CPC Wiki**: https://www.cpcwiki.eu/
- **Amstrad CPC Technical Manual**: Official Amstrad documentation
- **Gate Array**: https://www.cpcwiki.eu/index.php/Gate_Array
- **CRTC**: https://www.cpcwiki.eu/index.php/CRTC

---

*Document generated from analysis of CPCtelera framework v1.5*
*For use with the retro game engine project*
