// ============================================================================
// RETRO ENGINE - Main Engine
// ============================================================================
// Core game loop and state management
// ============================================================================

import { MODES, getMode, getDisplaySize } from '../modes/modes.js';
import { SpriteManager, Renderer } from './sprites.js';
import { Input } from './input.js';
import { Audio } from './audio.js';

class Engine {
    constructor(canvasId) {
        // Get or create canvas
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) {
            this.canvas = document.createElement('canvas');
            this.canvas.id = canvasId;
            document.body.appendChild(this.canvas);
        }
        
        // Engine state
        this.mode = null;
        this.game = null;
        this.running = false;
        this.paused = false;
        
        // Core systems
        this.input = new Input();
        this.audio = new Audio();
        this.sprites = null;
        this.renderer = null;
        
        // Timing
        this.lastTime = 0;
        this.deltaTime = 0;
        this.frameTime = 0;
        this.fps = 0;
        this.frameCount = 0;
        this.fpsTimer = 0;
        
        // Frame rate limiting
        this.targetFPS = 60;
        this.frameInterval = 1000 / 60;
        this.accumulator = 0;
        
        // Callbacks
        this.onModeChange = null;
        this.onReady = null;
        
        // Bind loop
        this.loop = this.loop.bind(this);
    }
    
    /**
     * Set the display mode
     */
    async setMode(modeId) {
        const mode = getMode(modeId);
        if (!mode) {
            console.error(`Engine: Unknown mode '${modeId}'`);
            return false;
        }
        
        console.log(`Engine: Setting mode to '${mode.name}'`);
        
        this.mode = mode;
        this.targetFPS = mode.targetFPS;
        this.frameInterval = 1000 / this.targetFPS;
        
        // Update canvas dimensions
        this.canvas.width = mode.canvas.width;
        this.canvas.height = mode.canvas.height;
        
        // Apply display scaling via CSS
        const display = getDisplaySize(mode);
        this.canvas.style.width = display.width + 'px';
        this.canvas.style.height = display.height + 'px';
        this.canvas.style.imageRendering = 'pixelated';
        this.canvas.style.imageRendering = 'crisp-edges';
        
        // Handle non-square pixels (CPC Mode 0)
        if (mode.pixelAspect && mode.pixelAspect !== 1) {
            // Stretch width to compensate for wide pixels
            this.canvas.style.width = (display.width * mode.pixelAspect) + 'px';
        }
        
        // Create new renderer
        this.renderer = new Renderer(this.canvas, mode);
        
        // Create new sprite manager
        this.sprites = new SpriteManager(mode);
        
        // Callback
        if (this.onModeChange) {
            this.onModeChange(mode);
        }
        
        return true;
    }
    
    /**
     * Load a game
     */
    async loadGame(game) {
        if (!this.mode) {
            console.error('Engine: Must set mode before loading game');
            return false;
        }
        
        this.game = game;
        
        // Initialize game
        if (game.init) {
            await game.init(this);
        }
        
        // Load game sprites
        if (game.sprites) {
            await this.sprites.loadAll(game.sprites);
        }
        
        // Load game audio
        if (game.audio) {
            for (const [name, config] of Object.entries(game.audio.music || {})) {
                try {
                    await this.audio.loadMusic(name, config.src, config);
                } catch (e) {
                    console.warn(`Engine: Failed to load music '${name}'`);
                }
            }
            for (const [name, config] of Object.entries(game.audio.sfx || {})) {
                try {
                    await this.audio.loadSfx(name, config.src, config);
                } catch (e) {
                    console.warn(`Engine: Failed to load sfx '${name}'`);
                }
            }
        }
        
        // Callback
        if (this.onReady) {
            this.onReady();
        }
        
        console.log(`Engine: Loaded game '${game.name || 'Unknown'}'`);
        return true;
    }
    
    /**
     * Start the game loop
     */
    start() {
        if (this.running) return;
        
        this.running = true;
        this.lastTime = performance.now();
        
        // Start game
        if (this.game && this.game.start) {
            this.game.start(this);
        }
        
        // Begin loop
        requestAnimationFrame(this.loop);
        console.log('Engine: Started');
    }
    
    /**
     * Stop the game loop
     */
    stop() {
        this.running = false;
        console.log('Engine: Stopped');
    }
    
    /**
     * Pause/unpause
     */
    setPaused(paused) {
        this.paused = paused;
        
        if (paused) {
            this.audio.pauseMusic();
        } else {
            this.audio.resumeMusic();
        }
    }
    
    /**
     * Toggle pause
     */
    togglePause() {
        this.setPaused(!this.paused);
    }
    
    /**
     * Main game loop
     */
    loop(timestamp) {
        if (!this.running) return;
        
        // Calculate delta time
        this.deltaTime = timestamp - this.lastTime;
        this.lastTime = timestamp;
        
        // Cap delta to prevent spiral of death
        if (this.deltaTime > 100) {
            this.deltaTime = 100;
        }
        
        // FPS calculation
        this.frameCount++;
        this.fpsTimer += this.deltaTime;
        if (this.fpsTimer >= 1000) {
            this.fps = this.frameCount;
            this.frameCount = 0;
            this.fpsTimer = 0;
        }
        
        // Frame rate limiting (accumulator-based)
        this.accumulator += this.deltaTime;
        
        while (this.accumulator >= this.frameInterval) {
            // Update input
            this.input.update();
            
            // Update game (if not paused)
            if (!this.paused && this.game && this.game.update) {
                this.game.update(this, this.frameInterval);
            }
            
            this.accumulator -= this.frameInterval;
        }
        
        // Render
        if (this.game && this.game.render) {
            this.game.render(this);
        }
        
        // Continue loop
        requestAnimationFrame(this.loop);
    }
    
    /**
     * Get current mode constraints
     */
    getConstraints() {
        if (!this.mode) return null;
        
        return {
            maxBalls: this.mode.maxBallsOnScreen,
            maxHarpoons: this.mode.maxHarpoons,
            maxSprites: this.mode.maxSpritesOnScreen,
            maxPowerUps: this.mode.maxPowerUps,
            animFrames: this.mode.animFramesPerCharacter
        };
    }
    
    /**
     * Check if spawning is allowed
     */
    canSpawn(type, currentCount) {
        if (!this.mode) return true;
        
        switch (type) {
            case 'ball':
                return currentCount < this.mode.maxBallsOnScreen;
            case 'harpoon':
                return currentCount < this.mode.maxHarpoons;
            case 'powerup':
                return currentCount < this.mode.maxPowerUps;
            case 'sprite':
                return currentCount < this.mode.maxSpritesOnScreen;
            default:
                return true;
        }
    }
}

// ============================================================================
// EXPORTS
// ============================================================================

export { Engine, MODES };
