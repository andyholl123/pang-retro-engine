// ============================================================================
// RETRO ENGINE - Sprite Manager
// ============================================================================
// Handles loading and rendering sprites for both:
// - Software modes (individual PNG files)
// - Hardware modes (tilesheets)
// ============================================================================

class SpriteManager {
    constructor(mode) {
        this.mode = mode;
        this.cache = new Map();
        this.loaded = false;
    }
    
    /**
     * Load all sprites for a game
     * @param {Object} spriteDefinitions - Sprite configuration object
     */
    async loadAll(spriteDefinitions) {
        const promises = [];
        
        for (const [name, def] of Object.entries(spriteDefinitions)) {
            promises.push(this.loadSprite(name, def));
        }
        
        await Promise.all(promises);
        this.loaded = true;
        console.log(`SpriteManager: Loaded ${this.cache.size} sprites for mode ${this.mode.id}`);
    }
    
    /**
     * Load a single sprite (handles both software and tilesheet)
     */
    async loadSprite(name, definition) {
        try {
            let sprite;
            
            if (this.mode.useTilesheet && definition.tilesheet?.[this.mode.id]) {
                // Hardware mode - load tilesheet
                sprite = await this.loadTilesheet(definition.tilesheet[this.mode.id]);
            } else if (definition.software?.[this.mode.id]) {
                // Software mode - load individual images
                sprite = await this.loadSoftwareSprite(definition.software[this.mode.id]);
            } else {
                // Fallback - try to find any available asset
                sprite = await this.loadFallback(definition);
            }
            
            if (sprite) {
                sprite.name = name;
                this.cache.set(name, sprite);
            }
        } catch (err) {
            console.warn(`SpriteManager: Failed to load sprite '${name}':`, err);
            // Create placeholder
            this.cache.set(name, this.createPlaceholder(name, definition));
        }
    }
    
    /**
     * Load a tilesheet sprite (for hardware modes)
     */
    async loadTilesheet(config) {
        const image = await this.loadImage(config.src);
        
        const sprite = {
            type: 'tilesheet',
            image: image,
            tileWidth: config.tileWidth || this.mode.spriteSize.width,
            tileHeight: config.tileHeight || this.mode.spriteSize.height,
            animations: config.animations || {},
            frames: config.frames || {},
            
            /**
             * Get frame rectangle for animation
             */
            getAnimationFrame(animation, frameIndex) {
                const anim = this.animations[animation];
                if (!anim) {
                    return { sx: 0, sy: 0, sw: this.tileWidth, sh: this.tileHeight };
                }
                
                const frame = anim.frames[frameIndex % anim.frames.length];
                const row = anim.row || 0;
                
                return {
                    sx: frame * this.tileWidth,
                    sy: row * this.tileHeight,
                    sw: this.tileWidth,
                    sh: this.tileHeight
                };
            },
            
            /**
             * Get frame rectangle for static frame
             */
            getStaticFrame(frameName) {
                const frame = this.frames[frameName];
                if (!frame) {
                    return { sx: 0, sy: 0, sw: this.tileWidth, sh: this.tileHeight };
                }
                
                return {
                    sx: (frame.col || 0) * this.tileWidth,
                    sy: (frame.row || 0) * this.tileHeight,
                    sw: this.tileWidth,
                    sh: this.tileHeight
                };
            }
        };
        
        return sprite;
    }
    
    /**
     * Load software sprite (individual images per frame)
     */
    async loadSoftwareSprite(config) {
        const animations = {};
        
        for (const [animName, files] of Object.entries(config)) {
            if (Array.isArray(files)) {
                animations[animName] = await Promise.all(
                    files.map(f => this.loadImage(f))
                );
            }
        }
        
        const sprite = {
            type: 'software',
            animations: animations,
            
            /**
             * Get image for animation frame
             */
            getAnimationFrame(animation, frameIndex) {
                const frames = this.animations[animation];
                if (!frames || frames.length === 0) {
                    // Return first frame of first animation as fallback
                    const firstAnim = Object.values(this.animations)[0];
                    return firstAnim ? firstAnim[0] : null;
                }
                return frames[frameIndex % frames.length];
            },
            
            /**
             * Get static frame (first frame of named animation)
             */
            getStaticFrame(frameName) {
                const frames = this.animations[frameName];
                return frames ? frames[0] : null;
            }
        };
        
        return sprite;
    }
    
    /**
     * Try to load from any available source
     */
    async loadFallback(definition) {
        // Try software sources first
        if (definition.software) {
            for (const [modeId, config] of Object.entries(definition.software)) {
                try {
                    return await this.loadSoftwareSprite(config);
                } catch (e) {
                    continue;
                }
            }
        }
        
        // Try tilesheet sources
        if (definition.tilesheet) {
            for (const [modeId, config] of Object.entries(definition.tilesheet)) {
                try {
                    return await this.loadTilesheet(config);
                } catch (e) {
                    continue;
                }
            }
        }
        
        return null;
    }
    
    /**
     * Create a placeholder sprite when loading fails
     */
    createPlaceholder(name, definition) {
        const width = this.mode.spriteSize.width;
        const height = this.mode.spriteSize.height;
        
        // Create canvas for placeholder
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        
        // Draw placeholder (magenta rectangle with X)
        ctx.fillStyle = '#FF00FF';
        ctx.fillRect(0, 0, width, height);
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(width, height);
        ctx.moveTo(width, 0);
        ctx.lineTo(0, height);
        ctx.stroke();
        
        return {
            type: 'placeholder',
            image: canvas,
            width: width,
            height: height,
            getAnimationFrame() {
                return this.image;
            },
            getStaticFrame() {
                return this.image;
            }
        };
    }
    
    /**
     * Load an image from URL
     */
    loadImage(src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = () => reject(new Error(`Failed to load: ${src}`));
            img.src = src;
        });
    }
    
    /**
     * Get a loaded sprite by name
     */
    get(name) {
        return this.cache.get(name);
    }
    
    /**
     * Check if a sprite is loaded
     */
    has(name) {
        return this.cache.has(name);
    }
    
    /**
     * Check if sprite is ready (loaded and not placeholder)
     */
    isReady(name) {
        const sprite = this.cache.get(name);
        return sprite && sprite.type !== 'placeholder';
    }
}

// ============================================================================
// RENDERER - Draws sprites to canvas (mode-aware)
// ============================================================================

class Renderer {
    constructor(canvas, mode) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.mode = mode;
        
        // Disable smoothing for crisp pixels
        this.ctx.imageSmoothingEnabled = false;
        
        // Set canvas size
        this.canvas.width = mode.canvas.width;
        this.canvas.height = mode.canvas.height;
    }
    
    /**
     * Clear the canvas
     */
    clear(colour = '#000000') {
        this.ctx.fillStyle = colour;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    /**
     * Draw a sprite
     * @param {Object} sprite - Sprite from SpriteManager
     * @param {string} animation - Animation name
     * @param {number} frameIndex - Frame index
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {Object} options - { flipX, flipY, scale, alpha }
     */
    drawSprite(sprite, animation, frameIndex, x, y, options = {}) {
        if (!sprite) return;
        
        const { flipX = false, flipY = false, scale = 1, alpha = 1 } = options;
        
        this.ctx.save();
        this.ctx.globalAlpha = alpha;
        
        if (sprite.type === 'tilesheet') {
            this.drawTilesheetSprite(sprite, animation, frameIndex, x, y, flipX, flipY, scale);
        } else if (sprite.type === 'software' || sprite.type === 'placeholder') {
            this.drawSoftwareSprite(sprite, animation, frameIndex, x, y, flipX, flipY, scale);
        }
        
        this.ctx.restore();
    }
    
    /**
     * Draw a tilesheet-based sprite
     */
    drawTilesheetSprite(sprite, animation, frameIndex, x, y, flipX, flipY, scale) {
        const frame = sprite.getAnimationFrame(animation, frameIndex);
        
        const w = frame.sw * scale;
        const h = frame.sh * scale;
        
        this.ctx.save();
        this.ctx.translate(x + w / 2, y + h / 2);
        
        if (flipX) this.ctx.scale(-1, 1);
        if (flipY) this.ctx.scale(1, -1);
        
        this.ctx.drawImage(
            sprite.image,
            frame.sx, frame.sy, frame.sw, frame.sh,
            -w / 2, -h / 2, w, h
        );
        
        this.ctx.restore();
    }
    
    /**
     * Draw a software sprite (individual images)
     */
    drawSoftwareSprite(sprite, animation, frameIndex, x, y, flipX, flipY, scale) {
        const image = sprite.getAnimationFrame(animation, frameIndex);
        if (!image) return;
        
        const w = (image.width || sprite.width || this.mode.spriteSize.width) * scale;
        const h = (image.height || sprite.height || this.mode.spriteSize.height) * scale;
        
        this.ctx.save();
        this.ctx.translate(x + w / 2, y + h / 2);
        
        if (flipX) this.ctx.scale(-1, 1);
        if (flipY) this.ctx.scale(1, -1);
        
        this.ctx.drawImage(image, -w / 2, -h / 2, w, h);
        
        this.ctx.restore();
    }
    
    /**
     * Draw a static sprite frame
     */
    drawStaticSprite(sprite, frameName, x, y, options = {}) {
        if (!sprite) return;
        
        const { flipX = false, flipY = false, scale = 1, alpha = 1 } = options;
        
        this.ctx.save();
        this.ctx.globalAlpha = alpha;
        
        if (sprite.type === 'tilesheet') {
            const frame = sprite.getStaticFrame(frameName);
            const w = frame.sw * scale;
            const h = frame.sh * scale;
            
            this.ctx.translate(x + w / 2, y + h / 2);
            if (flipX) this.ctx.scale(-1, 1);
            if (flipY) this.ctx.scale(1, -1);
            
            this.ctx.drawImage(
                sprite.image,
                frame.sx, frame.sy, frame.sw, frame.sh,
                -w / 2, -h / 2, w, h
            );
        } else {
            const image = sprite.getStaticFrame(frameName);
            if (image) {
                const w = image.width * scale;
                const h = image.height * scale;
                
                this.ctx.translate(x + w / 2, y + h / 2);
                if (flipX) this.ctx.scale(-1, 1);
                if (flipY) this.ctx.scale(1, -1);
                
                this.ctx.drawImage(image, -w / 2, -h / 2, w, h);
            }
        }
        
        this.ctx.restore();
    }
    
    /**
     * Draw a filled rectangle
     */
    drawRect(x, y, width, height, colour) {
        this.ctx.fillStyle = colour;
        this.ctx.fillRect(x, y, width, height);
    }
    
    /**
     * Draw a stroked rectangle
     */
    drawRectOutline(x, y, width, height, colour, lineWidth = 1) {
        this.ctx.strokeStyle = colour;
        this.ctx.lineWidth = lineWidth;
        this.ctx.strokeRect(x, y, width, height);
    }
    
    /**
     * Draw a filled circle
     */
    drawCircle(x, y, radius, colour) {
        this.ctx.fillStyle = colour;
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    /**
     * Draw text
     */
    drawText(text, x, y, options = {}) {
        const {
            colour = '#FFFFFF',
            font = '8px monospace',
            align = 'left',
            baseline = 'top'
        } = options;
        
        this.ctx.fillStyle = colour;
        this.ctx.font = font;
        this.ctx.textAlign = align;
        this.ctx.textBaseline = baseline;
        this.ctx.fillText(text, x, y);
    }
    
    /**
     * Draw an image directly
     */
    drawImage(image, x, y, width, height) {
        if (!image || !image.complete) return;
        this.ctx.drawImage(image, x, y, width || image.width, height || image.height);
    }
}

// ============================================================================
// EXPORTS
// ============================================================================

export { SpriteManager, Renderer };
