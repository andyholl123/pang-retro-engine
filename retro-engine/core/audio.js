// ============================================================================
// RETRO ENGINE - Audio Manager
// ============================================================================
// Sound effects and music playback
// ============================================================================

class Audio {
    constructor() {
        // Track storage
        this.music = new Map();
        this.sfx = new Map();
        
        // Currently playing music
        this.currentMusic = null;
        this.musicVolume = 0.5;
        this.sfxVolume = 0.8;
        
        // Mute states
        this.musicMuted = false;
        this.sfxMuted = false;
        
        // Audio context (for advanced features)
        this.context = null;
        
        // Has user interacted? (needed for autoplay policy)
        this.unlocked = false;
    }
    
    /**
     * Unlock audio (must be called from user interaction)
     */
    unlock() {
        if (this.unlocked) return;
        
        // Create and resume audio context
        if (!this.context) {
            this.context = new (window.AudioContext || window.webkitAudioContext)();
        }
        
        if (this.context.state === 'suspended') {
            this.context.resume();
        }
        
        this.unlocked = true;
        console.log('Audio: Unlocked');
    }
    
    /**
     * Load a music track
     */
    loadMusic(name, src, options = {}) {
        const audio = new window.Audio(src);
        audio.loop = options.loop !== false;  // Default to looping
        audio.volume = this.musicVolume * (options.volume || 1);
        
        this.music.set(name, {
            audio: audio,
            volume: options.volume || 1
        });
        
        return new Promise((resolve, reject) => {
            audio.addEventListener('canplaythrough', () => resolve(), { once: true });
            audio.addEventListener('error', () => reject(new Error(`Failed to load: ${src}`)), { once: true });
            audio.load();
        });
    }
    
    /**
     * Load a sound effect
     */
    loadSfx(name, src, options = {}) {
        const audio = new window.Audio(src);
        audio.volume = this.sfxVolume * (options.volume || 1);
        
        this.sfx.set(name, {
            audio: audio,
            volume: options.volume || 1
        });
        
        return new Promise((resolve, reject) => {
            audio.addEventListener('canplaythrough', () => resolve(), { once: true });
            audio.addEventListener('error', () => reject(new Error(`Failed to load: ${src}`)), { once: true });
            audio.load();
        });
    }
    
    /**
     * Play a music track
     */
    playMusic(name, fadeIn = false) {
        this.unlock();
        
        // Stop current music
        if (this.currentMusic) {
            this.stopMusic();
        }
        
        const track = this.music.get(name);
        if (!track) {
            console.warn(`Audio: Music '${name}' not found`);
            return;
        }
        
        track.audio.currentTime = 0;
        track.audio.volume = this.musicMuted ? 0 : this.musicVolume * track.volume;
        
        if (fadeIn) {
            track.audio.volume = 0;
            this.fadeIn(track.audio, this.musicVolume * track.volume, 1000);
        }
        
        track.audio.play().catch(e => {
            console.warn('Audio: Music play failed:', e);
        });
        
        this.currentMusic = name;
    }
    
    /**
     * Stop current music
     */
    stopMusic(fadeOut = false) {
        if (!this.currentMusic) return;
        
        const track = this.music.get(this.currentMusic);
        if (!track) return;
        
        if (fadeOut) {
            this.fadeOut(track.audio, 500, () => {
                track.audio.pause();
                track.audio.currentTime = 0;
            });
        } else {
            track.audio.pause();
            track.audio.currentTime = 0;
        }
        
        this.currentMusic = null;
    }
    
    /**
     * Pause current music
     */
    pauseMusic() {
        if (!this.currentMusic) return;
        
        const track = this.music.get(this.currentMusic);
        if (track) {
            track.audio.pause();
        }
    }
    
    /**
     * Resume current music
     */
    resumeMusic() {
        if (!this.currentMusic) return;
        
        const track = this.music.get(this.currentMusic);
        if (track) {
            track.audio.play().catch(() => {});
        }
    }
    
    /**
     * Play a sound effect
     */
    playSfx(name) {
        this.unlock();
        
        if (this.sfxMuted) return;
        
        const sound = this.sfx.get(name);
        if (!sound) {
            console.warn(`Audio: SFX '${name}' not found`);
            return;
        }
        
        // Clone for overlapping sounds
        const clone = sound.audio.cloneNode();
        clone.volume = this.sfxVolume * sound.volume;
        clone.play().catch(() => {});
    }
    
    /**
     * Set music volume (0-1)
     */
    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume));
        
        if (this.currentMusic && !this.musicMuted) {
            const track = this.music.get(this.currentMusic);
            if (track) {
                track.audio.volume = this.musicVolume * track.volume;
            }
        }
    }
    
    /**
     * Set SFX volume (0-1)
     */
    setSfxVolume(volume) {
        this.sfxVolume = Math.max(0, Math.min(1, volume));
    }
    
    /**
     * Mute/unmute music
     */
    muteMusic(muted) {
        this.musicMuted = muted;
        
        if (this.currentMusic) {
            const track = this.music.get(this.currentMusic);
            if (track) {
                track.audio.volume = muted ? 0 : this.musicVolume * track.volume;
            }
        }
    }
    
    /**
     * Mute/unmute SFX
     */
    muteSfx(muted) {
        this.sfxMuted = muted;
    }
    
    /**
     * Mute/unmute all audio
     */
    muteAll(muted) {
        this.muteMusic(muted);
        this.muteSfx(muted);
    }
    
    /**
     * Fade in audio
     */
    fadeIn(audio, targetVolume, duration) {
        const startVolume = audio.volume;
        const startTime = performance.now();
        
        const tick = () => {
            const elapsed = performance.now() - startTime;
            const progress = Math.min(1, elapsed / duration);
            
            audio.volume = startVolume + (targetVolume - startVolume) * progress;
            
            if (progress < 1) {
                requestAnimationFrame(tick);
            }
        };
        
        requestAnimationFrame(tick);
    }
    
    /**
     * Fade out audio
     */
    fadeOut(audio, duration, onComplete) {
        const startVolume = audio.volume;
        const startTime = performance.now();
        
        const tick = () => {
            const elapsed = performance.now() - startTime;
            const progress = Math.min(1, elapsed / duration);
            
            audio.volume = startVolume * (1 - progress);
            
            if (progress < 1) {
                requestAnimationFrame(tick);
            } else if (onComplete) {
                onComplete();
            }
        };
        
        requestAnimationFrame(tick);
    }
}

// ============================================================================
// EXPORTS
// ============================================================================

export { Audio };
