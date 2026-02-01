// ============================================================================
// RETRO ENGINE - Mode Configurations
// ============================================================================
// Each mode defines display, sprite, gameplay, and export constraints
// ============================================================================

// ----------------------------------------------------------------------------
// COLOUR PALETTES
// ----------------------------------------------------------------------------

// 1-Bit: Pure black and white
const PALETTE_1BIT = ['#000000', '#FFFFFF'];

// ZX Spectrum: 15 colours (8 normal + 7 bright, black shared)
const PALETTE_SPECTRUM = [
    '#000000',  // 0: Black
    '#0000D7',  // 1: Blue
    '#D70000',  // 2: Red
    '#D700D7',  // 3: Magenta
    '#00D700',  // 4: Green
    '#00D7D7',  // 5: Cyan
    '#D7D700',  // 6: Yellow
    '#D7D7D7',  // 7: White
    // Bright variants
    '#000000',  // 8: Black (bright)
    '#0000FF',  // 9: Bright Blue
    '#FF0000',  // 10: Bright Red
    '#FF00FF',  // 11: Bright Magenta
    '#00FF00',  // 12: Bright Green
    '#00FFFF',  // 13: Bright Cyan
    '#FFFF00',  // 14: Bright Yellow
    '#FFFFFF'   // 15: Bright White
];

// Amstrad CPC: 27 colours (hardware palette)
const PALETTE_CPC = [
    '#000000',  // 0: Black
    '#000080',  // 1: Blue
    '#0000FF',  // 2: Bright Blue
    '#800000',  // 3: Red
    '#800080',  // 4: Magenta
    '#8000FF',  // 5: Mauve
    '#FF0000',  // 6: Bright Red
    '#FF0080',  // 7: Purple
    '#FF00FF',  // 8: Bright Magenta
    '#008000',  // 9: Green
    '#008080',  // 10: Cyan
    '#0080FF',  // 11: Sky Blue
    '#808000',  // 12: Yellow
    '#808080',  // 13: White
    '#8080FF',  // 14: Pastel Blue
    '#FF8000',  // 15: Orange
    '#FF8080',  // 16: Pink
    '#FF80FF',  // 17: Pastel Magenta
    '#00FF00',  // 18: Bright Green
    '#00FF80',  // 19: Sea Green
    '#00FFFF',  // 20: Bright Cyan
    '#80FF00',  // 21: Lime
    '#80FF80',  // 22: Pastel Green
    '#80FFFF',  // 23: Pastel Cyan
    '#FFFF00',  // 24: Bright Yellow
    '#FFFF80',  // 25: Pastel Yellow
    '#FFFFFF'   // 26: Bright White
];

// GX4000/CPC Plus: 4096 colours (12-bit RGB)
// We don't enumerate all - just note it's available
const PALETTE_PLUS = null;  // null = full RGB available

// Megadrive: 512 colours (9-bit RGB, 3 bits per channel)
// Can display 64 on screen (4 palettes × 16 colours)
const PALETTE_MEGADRIVE = null;  // null = calculated from 9-bit RGB

// ----------------------------------------------------------------------------
// MODE DEFINITIONS
// ----------------------------------------------------------------------------

const MODES = {
    // ========================================================================
    // 1-BIT MODE - ZX81 / Mac Classic / Game Boy DMG style
    // ========================================================================
    '1bit': {
        id: '1bit',
        name: '1-Bit',
        description: 'Monochrome - ZX81 / Early Mac style',
        
        // Display
        canvas: { width: 256, height: 192 },
        displayScale: 4,
        
        // Colour
        palette: PALETTE_1BIT,
        maxColours: 2,
        backgroundColour: '#000000',
        foregroundColour: '#FFFFFF',
        
        // Sprites
        spriteSystem: 'software',
        useTilesheet: false,
        spriteSize: { width: 16, height: 16 },
        maxSpriteColours: 2,
        maxSpritesOnScreen: 16,
        
        // Animation
        animFramesPerCharacter: 2,  // Minimal - fake bob
        targetFPS: 25,
        
        // Gameplay constraints
        maxBallsOnScreen: 8,
        maxHarpoons: 1,
        maxPowerUps: 2,
        
        // Audio
        soundChannels: 1,
        
        // Visual effects
        allowDithering: true,
        scanlines: false,
        
        // Export
        exportable: false,
        exportTarget: null
    },
    
    // ========================================================================
    // 8-BIT BASIC - ZX Spectrum style
    // ========================================================================
    '8bit-basic': {
        id: '8bit-basic',
        name: '8-Bit Basic',
        description: 'ZX Spectrum style - attribute clash',
        
        // Display
        canvas: { width: 256, height: 192 },
        displayScale: 4,
        
        // Colour
        palette: PALETTE_SPECTRUM,
        maxColours: 15,
        attributeClash: true,
        attributeSize: { width: 8, height: 8 },
        
        // Sprites
        spriteSystem: 'software',
        useTilesheet: false,
        spriteSize: { width: 16, height: 16 },
        maxSpriteColours: 2,  // Per 8×8 attribute cell
        maxSpritesOnScreen: 8,
        
        // Animation
        animFramesPerCharacter: 4,
        targetFPS: 25,
        
        // Gameplay constraints
        maxBallsOnScreen: 12,
        maxHarpoons: 1,
        maxPowerUps: 3,
        
        // Audio
        soundChannels: 1,  // Beeper
        
        // Visual effects
        allowDithering: false,
        scanlines: false,
        
        // Export
        exportable: false,
        exportTarget: null
    },
    
    // ========================================================================
    // 8-BIT CPC - Amstrad CPC Mode 0
    // ========================================================================
    '8bit-cpc': {
        id: '8bit-cpc',
        name: '8-Bit CPC',
        description: 'Amstrad CPC Mode 0 - 160×200, 16 colours',
        
        // Display
        canvas: { width: 160, height: 200 },
        displayScale: 4,
        pixelAspect: 2,  // Mode 0 pixels are 2× wide
        
        // Colour
        palette: PALETTE_CPC,
        maxColours: 16,  // 16 from 27 per screen
        
        // Sprites
        spriteSystem: 'software',
        useTilesheet: false,
        spriteSize: { width: 16, height: 16 },
        maxSpriteColours: 16,
        maxSpritesOnScreen: 12,
        
        // Animation
        animFramesPerCharacter: 4,
        targetFPS: 25,
        
        // Gameplay constraints
        maxBallsOnScreen: 12,
        maxHarpoons: 1,
        maxPowerUps: 4,
        
        // Audio
        soundChannels: 3,  // AY-3-8912
        
        // Visual effects
        allowDithering: true,
        scanlines: false,
        
        // Export
        exportable: true,
        exportTarget: 'cpctelera',
        cpcMode: 0,
        outputFormats: ['dsk', 'cdt', 'sna']
    },
    
    // ========================================================================
    // 8-BIT PLUS - GX4000 / CPC Plus
    // ========================================================================
    '8bit-plus': {
        id: '8bit-plus',
        name: '8-Bit Plus',
        description: 'GX4000 / CPC Plus - Hardware sprites',
        
        // Display
        canvas: { width: 320, height: 200 },
        displayScale: 3,
        
        // Colour
        palette: PALETTE_PLUS,  // 4096 available
        maxColours: 4096,
        palettePerLine: 16,  // 16 colours per scanline
        
        // Sprites - HARDWARE (ASIC)
        spriteSystem: 'hardware',
        useTilesheet: true,
        hardwareSprites: true,
        spriteSize: { width: 16, height: 16 },
        maxHardwareSprites: 16,
        spriteColours: 15,  // + transparent
        spriteMagnification: [1, 2],  // Can 2× zoom
        
        // Animation
        animFramesPerCharacter: 4,
        targetFPS: 50,
        
        // Gameplay constraints
        maxBallsOnScreen: 14,  // 16 sprites - player - harpoon
        maxHarpoons: 2,
        maxPowerUps: 4,
        
        // Audio
        soundChannels: 3,  // AY-3-8912 + DMA
        
        // Visual effects
        allowDithering: true,
        scanlines: false,
        hardwareScroll: true,
        
        // Export
        exportable: true,
        exportTarget: 'cpctelera',
        cpcMode: 1,
        useASIC: true,
        outputFormats: ['cpr']  // Cartridge
    },
    
    // ========================================================================
    // 16-BIT - Megadrive / Arcade style
    // ========================================================================
    '16bit': {
        id: '16bit',
        name: '16-Bit',
        description: 'Megadrive / Arcade - 320×224',
        
        // Display
        canvas: { width: 320, height: 224 },
        displayScale: 3,
        
        // Colour
        palette: PALETTE_MEGADRIVE,
        maxColours: 512,
        palettesAvailable: 4,  // 4 × 16 colours
        coloursPerPalette: 16,
        
        // Sprites - HARDWARE (tile-based)
        spriteSystem: 'hardware',
        useTilesheet: true,
        hardwareSprites: true,
        tileSize: 8,  // 8×8 base tiles
        spriteSize: { width: 16, height: 16 },  // Composed of tiles
        maxSpriteSize: { width: 32, height: 32 },
        maxSpritesOnScreen: 80,
        maxSpritesPerLine: 20,
        
        // Animation
        animFramesPerCharacter: 8,
        targetFPS: 60,
        
        // Gameplay constraints
        maxBallsOnScreen: 24,
        maxHarpoons: 2,
        maxPowerUps: 6,
        
        // Audio
        soundChannels: 10,  // 6 FM + 4 PSG
        
        // Visual effects
        allowDithering: true,
        scanlines: true,
        hardwareScroll: true,
        
        // Export
        exportable: false,
        exportTarget: null
    }
};

// ----------------------------------------------------------------------------
// MODE HELPER FUNCTIONS
// ----------------------------------------------------------------------------

/**
 * Get a mode by ID
 */
function getMode(modeId) {
    return MODES[modeId] || null;
}

/**
 * Get all available modes
 */
function getAllModes() {
    return Object.values(MODES);
}

/**
 * Get modes that are exportable
 */
function getExportableModes() {
    return Object.values(MODES).filter(m => m.exportable);
}

/**
 * Validate a colour against a mode's palette
 */
function validateColour(colour, mode) {
    if (!mode.palette) return colour;  // No restriction
    
    // Find nearest palette colour
    if (mode.palette.includes(colour)) return colour;
    
    // TODO: Implement nearest colour matching
    return mode.palette[0];
}

/**
 * Check if a sprite count is within mode limits
 */
function canSpawnSprite(currentCount, mode) {
    return currentCount < mode.maxSpritesOnScreen;
}

/**
 * Get the effective canvas size with scaling
 */
function getDisplaySize(mode) {
    return {
        width: mode.canvas.width * mode.displayScale,
        height: mode.canvas.height * mode.displayScale
    };
}

// ----------------------------------------------------------------------------
// EXPORTS
// ----------------------------------------------------------------------------

export {
    MODES,
    PALETTE_1BIT,
    PALETTE_SPECTRUM,
    PALETTE_CPC,
    getMode,
    getAllModes,
    getExportableModes,
    validateColour,
    canSpawnSprite,
    getDisplaySize
};
