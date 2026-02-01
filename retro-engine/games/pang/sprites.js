// ============================================================================
// PANG - Sprite Definitions
// ============================================================================
// Defines sprites for all modes (software individual + hardware tilesheet)
// ============================================================================

const PANG_SPRITES = {
    // ========================================================================
    // PLAYER SPRITE
    // ========================================================================
    player: {
        // Software modes - individual files
        software: {
            '1bit': {
                idle: ['assets/pang/1bit/player_idle.png'],
                walk: [
                    'assets/pang/1bit/player_walk_1.png',
                    'assets/pang/1bit/player_walk_2.png'
                ]
            },
            '8bit-basic': {
                idle: ['assets/pang/8bit-basic/player_idle.png'],
                walk: [
                    'assets/pang/8bit-basic/player_walk_1.png',
                    'assets/pang/8bit-basic/player_walk_2.png',
                    'assets/pang/8bit-basic/player_walk_3.png',
                    'assets/pang/8bit-basic/player_walk_4.png'
                ]
            },
            '8bit-cpc': {
                idle: ['assets/pang/8bit-cpc/player_walk_1.png'],
                walk: [
                    'assets/pang/8bit-cpc/player_walk_1.png',
                    'assets/pang/8bit-cpc/player_walk_2.png',
                    'assets/pang/8bit-cpc/player_walk_3.png',
                    'assets/pang/8bit-cpc/player_walk_4.png',
                    'assets/pang/8bit-cpc/player_walk_5.png'
                ]
            }
        },
        
        // Hardware modes - tilesheets
        tilesheet: {
            '8bit-plus': {
                src: 'assets/pang/8bit-plus/player.png',
                tileWidth: 30,
                tileHeight: 30,
                animations: {
                    idle: { row: 0, frames: [0], speed: 0 },
                    walk: { row: 0, frames: [0, 1, 2, 3, 4], speed: 0.15 }
                }
            },
            '16bit': {
                src: 'assets/pang/16bit/player.png',
                tileWidth: 32,
                tileHeight: 32,
                animations: {
                    idle: { row: 0, frames: [0], speed: 0 },
                    walk: { row: 0, frames: [0, 1, 2, 3, 4, 5, 6, 7], speed: 0.12 }
                }
            }
        }
    },
    
    // ========================================================================
    // BALL SPRITES (all sizes)
    // ========================================================================
    balls: {
        software: {
            '1bit': {
                large:  ['assets/pang/1bit/ball_large.png'],
                medium: ['assets/pang/1bit/ball_medium.png'],
                small:  ['assets/pang/1bit/ball_small.png']
            },
            '8bit-basic': {
                large:  ['assets/pang/8bit-basic/ball_large.png'],
                medium: ['assets/pang/8bit-basic/ball_medium.png'],
                small:  ['assets/pang/8bit-basic/ball_small.png']
            },
            '8bit-cpc': {
                large:  ['assets/pang/8bit-cpc/ball_large.png'],
                medium: ['assets/pang/8bit-cpc/ball_medium.png'],
                small:  ['assets/pang/8bit-cpc/ball_small.png']
            }
        },
        
        tilesheet: {
            '8bit-plus': {
                src: 'assets/pang/8bit-plus/balls.png',
                tileWidth: 16,
                tileHeight: 16,
                frames: {
                    large:  { col: 0, row: 0 },
                    medium: { col: 1, row: 0 },
                    small:  { col: 2, row: 0 }
                }
            },
            '16bit': {
                src: 'assets/pang/16bit/balls.png',
                tileWidth: 16,
                tileHeight: 16,
                frames: {
                    large:  { col: 0, row: 0 },
                    medium: { col: 1, row: 0 },
                    small:  { col: 2, row: 0 }
                }
            }
        }
    },
    
    // ========================================================================
    // HARPOON SPRITES
    // ========================================================================
    harpoonHead: {
        software: {
            '1bit': {
                default: ['assets/pang/1bit/harpoon_head.png']
            },
            '8bit-basic': {
                default: ['assets/pang/8bit-basic/harpoon_head.png']
            },
            '8bit-cpc': {
                default: ['assets/pang/8bit-cpc/harpoon_head.png']
            }
        },
        
        tilesheet: {
            '8bit-plus': {
                src: 'assets/pang/8bit-plus/harpoon.png',
                tileWidth: 16,
                tileHeight: 20,
                frames: {
                    default: { col: 0, row: 0 }
                }
            },
            '16bit': {
                src: 'assets/pang/16bit/harpoon.png',
                tileWidth: 16,
                tileHeight: 20,
                frames: {
                    default: { col: 0, row: 0 }
                }
            }
        }
    },
    
    harpoonBody: {
        software: {
            '1bit': {
                default: ['assets/pang/1bit/harpoon_body.png']
            },
            '8bit-basic': {
                default: ['assets/pang/8bit-basic/harpoon_body.png']
            },
            '8bit-cpc': {
                default: ['assets/pang/8bit-cpc/harpoon_body.png']
            }
        },
        
        tilesheet: {
            '8bit-plus': {
                src: 'assets/pang/8bit-plus/harpoon.png',
                tileWidth: 8,
                tileHeight: 12,
                frames: {
                    default: { col: 2, row: 0 }
                }
            },
            '16bit': {
                src: 'assets/pang/16bit/harpoon.png',
                tileWidth: 8,
                tileHeight: 12,
                frames: {
                    default: { col: 2, row: 0 }
                }
            }
        }
    },
    
    // ========================================================================
    // BACKGROUND
    // ========================================================================
    background: {
        software: {
            '1bit': {
                default: ['assets/pang/1bit/background.png']
            },
            '8bit-basic': {
                default: ['assets/pang/8bit-basic/background.png']
            },
            '8bit-cpc': {
                default: ['assets/pang/8bit-cpc/background.png']
            }
        },
        
        tilesheet: {
            '8bit-plus': {
                src: 'assets/pang/8bit-plus/background.png',
                tileWidth: 320,
                tileHeight: 200,
                frames: {
                    default: { col: 0, row: 0 }
                }
            },
            '16bit': {
                src: 'assets/pang/16bit/background.png',
                tileWidth: 320,
                tileHeight: 224,
                frames: {
                    default: { col: 0, row: 0 }
                }
            }
        }
    }
};

// ============================================================================
// MODE-SPECIFIC SCALING
// ============================================================================

// Ball sizes per mode (radius in pixels)
const BALL_SIZES = {
    '1bit': {
        large:  16,
        medium: 10,
        small:  6
    },
    '8bit-basic': {
        large:  16,
        medium: 10,
        small:  6
    },
    '8bit-cpc': {
        large:  12,  // Smaller for 160px width
        medium: 8,
        small:  5
    },
    '8bit-plus': {
        large:  20,
        medium: 12,
        small:  7
    },
    '16bit': {
        large:  24,
        medium: 14,
        small:  8
    }
};

// Player sizes per mode
const PLAYER_SIZES = {
    '1bit':      { width: 16, height: 16 },
    '8bit-basic': { width: 16, height: 16 },
    '8bit-cpc':   { width: 15, height: 15 },  // Adjusted for 160px width
    '8bit-plus':  { width: 30, height: 30 },
    '16bit':      { width: 32, height: 32 }
};

// Ball speeds per mode (pixels per frame)
const BALL_SPEEDS = {
    '1bit': {
        large:  0.6,
        medium: 1.0,
        small:  1.3
    },
    '8bit-basic': {
        large:  0.6,
        medium: 1.0,
        small:  1.3
    },
    '8bit-cpc': {
        large:  0.5,  // Slower for narrower screen
        medium: 0.8,
        small:  1.0
    },
    '8bit-plus': {
        large:  0.8,
        medium: 1.2,
        small:  1.6
    },
    '16bit': {
        large:  1.0,
        medium: 1.5,
        small:  2.0
    }
};

// ============================================================================
// EXPORTS
// ============================================================================

export { PANG_SPRITES, BALL_SIZES, PLAYER_SIZES, BALL_SPEEDS };
