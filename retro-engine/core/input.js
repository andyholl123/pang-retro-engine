// ============================================================================
// RETRO ENGINE - Input Handler
// ============================================================================
// Keyboard input management with action mapping
// ============================================================================

class Input {
    constructor() {
        // Raw key states
        this.keys = {};
        
        // Key just pressed this frame
        this.justPressed = {};
        
        // Key just released this frame
        this.justReleased = {};
        
        // Previous frame's key states
        this.previousKeys = {};
        
        // Action mappings (action name -> array of key codes)
        this.actions = {
            left:   ['ArrowLeft', 'KeyA'],
            right:  ['ArrowRight', 'KeyD'],
            up:     ['ArrowUp', 'KeyW'],
            down:   ['ArrowDown', 'KeyS'],
            fire:   ['Space', 'KeyZ', 'KeyK'],
            start:  ['Enter', 'Space'],
            pause:  ['KeyP', 'Escape'],
            back:   ['Escape', 'Backspace']
        };
        
        // Callbacks for specific key events
        this.onKeyDown = null;
        this.onKeyUp = null;
        
        // Bind event listeners
        this.bindEvents();
    }
    
    /**
     * Bind keyboard event listeners
     */
    bindEvents() {
        window.addEventListener('keydown', (e) => {
            // Prevent default for game keys
            if (this.isGameKey(e.code)) {
                e.preventDefault();
            }
            
            this.keys[e.code] = true;
            
            // Callback
            if (this.onKeyDown) {
                this.onKeyDown(e.code);
            }
        });
        
        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
            
            // Callback
            if (this.onKeyUp) {
                this.onKeyUp(e.code);
            }
        });
        
        // Handle window blur (release all keys)
        window.addEventListener('blur', () => {
            this.releaseAll();
        });
    }
    
    /**
     * Check if a key code is used by the game
     */
    isGameKey(code) {
        for (const keyCodes of Object.values(this.actions)) {
            if (keyCodes.includes(code)) {
                return true;
            }
        }
        return false;
    }
    
    /**
     * Update input state (call once per frame)
     */
    update() {
        // Calculate just pressed/released
        for (const code of Object.keys(this.keys)) {
            this.justPressed[code] = this.keys[code] && !this.previousKeys[code];
            this.justReleased[code] = !this.keys[code] && this.previousKeys[code];
        }
        
        // Store current state for next frame
        this.previousKeys = { ...this.keys };
    }
    
    /**
     * Release all keys
     */
    releaseAll() {
        this.keys = {};
        this.justPressed = {};
        this.justReleased = {};
        this.previousKeys = {};
    }
    
    /**
     * Check if an action is currently held
     */
    isDown(action) {
        const keyCodes = this.actions[action];
        if (!keyCodes) return false;
        
        return keyCodes.some(code => this.keys[code]);
    }
    
    /**
     * Check if an action was just pressed this frame
     */
    isPressed(action) {
        const keyCodes = this.actions[action];
        if (!keyCodes) return false;
        
        return keyCodes.some(code => this.justPressed[code]);
    }
    
    /**
     * Check if an action was just released this frame
     */
    isReleased(action) {
        const keyCodes = this.actions[action];
        if (!keyCodes) return false;
        
        return keyCodes.some(code => this.justReleased[code]);
    }
    
    /**
     * Check if a specific key is held
     */
    isKeyDown(code) {
        return this.keys[code] || false;
    }
    
    /**
     * Check if a specific key was just pressed
     */
    isKeyPressed(code) {
        return this.justPressed[code] || false;
    }
    
    /**
     * Check if a specific key was just released
     */
    isKeyReleased(code) {
        return this.justReleased[code] || false;
    }
    
    /**
     * Add a new action mapping
     */
    mapAction(action, keyCodes) {
        this.actions[action] = Array.isArray(keyCodes) ? keyCodes : [keyCodes];
    }
    
    /**
     * Add keys to an existing action
     */
    addToAction(action, keyCodes) {
        if (!this.actions[action]) {
            this.actions[action] = [];
        }
        const codes = Array.isArray(keyCodes) ? keyCodes : [keyCodes];
        this.actions[action].push(...codes);
    }
    
    /**
     * Get horizontal axis (-1 = left, 0 = none, 1 = right)
     */
    getAxisX() {
        let axis = 0;
        if (this.isDown('left')) axis -= 1;
        if (this.isDown('right')) axis += 1;
        return axis;
    }
    
    /**
     * Get vertical axis (-1 = up, 0 = none, 1 = down)
     */
    getAxisY() {
        let axis = 0;
        if (this.isDown('up')) axis -= 1;
        if (this.isDown('down')) axis += 1;
        return axis;
    }
}

// ============================================================================
// EXPORTS
// ============================================================================

export { Input };
