// ============================================================================
// PANG - Game Logic
// ============================================================================
// Core Pang gameplay, adapted for the multi-mode retro engine
// ============================================================================

import { PANG_SPRITES, BALL_SIZES, PLAYER_SIZES, BALL_SPEEDS } from './sprites.js';

// ============================================================================
// GAME CONFIGURATION
// ============================================================================

const PangGame = {
    name: 'Pang',
    version: '1.0.0',
    
    // Sprite definitions
    sprites: PANG_SPRITES,
    
    // Audio definitions (optional - will use fallbacks if not found)
    audio: {
        music: {
            title: { src: 'assets/pang/audio/title.mp3', volume: 0.5 },
            game:  { src: 'assets/pang/audio/game.mp3', volume: 0.4 }
        },
        sfx: {
            harpoon: { src: 'assets/pang/audio/harpoon.wav', volume: 0.6 },
            pop:     { src: 'assets/pang/audio/pop.wav', volume: 0.8 },
            hurt:    { src: 'assets/pang/audio/hurt.wav', volume: 0.8 }
        }
    },
    
    // ========================================================================
    // GAME STATE
    // ========================================================================
    
    state: 'title',  // title | playing | paused | levelCleared | timeout | gameOver | cleared
    
    // Player
    player: null,
    
    // Game objects
    balls: [],
    harpoons: [],
    
    // Stats
    lives: 3,
    score: 0,
    highScore: 100000,
    levelTimer: 60,
    currentLevel: 1,
    
    // Timing
    lastShotTime: 0,
    harpoonCooldown: 350,
    
    // Mode-specific values (set in init)
    config: null,
    
    // ========================================================================
    // LEVEL DEFINITIONS
    // ========================================================================
    
    levels: {
        1: {
            name: 'MT. FUJI',
            stage: 1,
            timer: 60,
            balls: [
                { x: 0.5, y: 0.6, size: 'large', dir: 1 }
            ]
        },
        2: {
            name: 'MT. FUJI',
            stage: 2,
            timer: 70,
            balls: [
                { x: 0.25, y: 0.5, size: 'large', dir: 1 },
                { x: 0.75, y: 0.5, size: 'large', dir: -1 }
            ]
        },
        3: {
            name: 'MT. FUJI',
            stage: 3,
            timer: 80,
            balls: [
                { x: 0.2, y: 0.4, size: 'large', dir: 1 },
                { x: 0.5, y: 0.6, size: 'medium', dir: -1 },
                { x: 0.8, y: 0.4, size: 'large', dir: -1 }
            ]
        }
    },
    
    // ========================================================================
    // INITIALIZATION
    // ========================================================================
    
    async init(engine) {
        console.log('Pang: Initializing for mode', engine.mode.id);
        
        // Get mode-specific configuration
        this.config = this.getModeConfig(engine.mode);
        
        // Initialize player
        this.player = {
            x: engine.mode.canvas.width / 2,
            y: this.config.floorY - this.config.playerHeight / 2,
            width: this.config.playerWidth,
            height: this.config.playerHeight,
            speed: this.config.playerSpeed,
            facing: 1,
            isWalking: false,
            walkTimer: 0,
            bobOffset: 0
        };
        
        // Set up input callback for state transitions
        engine.input.onKeyDown = (code) => this.handleKeyPress(code, engine);
    },
    
    /**
     * Get mode-specific game configuration
     */
    getModeConfig(mode) {
        const W = mode.canvas.width;
        const H = mode.canvas.height;
        
        // Layout
        const hudHeight = Math.floor(H * 0.24);
        const borderSize = 8;
        const floorY = H - hudHeight - borderSize;
        const playfieldTop = borderSize;
        const playfieldHeight = floorY - playfieldTop;
        
        // Get mode-specific sizes
        const ballSizes = BALL_SIZES[mode.id] || BALL_SIZES['8bit-plus'];
        const playerSize = PLAYER_SIZES[mode.id] || PLAYER_SIZES['8bit-plus'];
        const ballSpeeds = BALL_SPEEDS[mode.id] || BALL_SPEEDS['8bit-plus'];
        
        return {
            width: W,
            height: H,
            hudHeight,
            borderSize,
            floorY,
            playfieldTop,
            playfieldBottom: floorY,
            playfieldHeight,
            playfieldLeft: borderSize,
            playfieldRight: W - borderSize,
            playfieldWidth: W - borderSize * 2,
            playerWidth: playerSize.width,
            playerHeight: playerSize.height,
            playerSpeed: mode.id === '8bit-cpc' ? 1.5 : 2.0,
            ballRadius: ballSizes,
            ballSpeed: ballSpeeds,
            gravity: 0.12,
            bounceVY: -4.5,
            harpoonSpeed: 6,
            harpoonHeadW: 16,
            harpoonHeadH: 20,
            harpoonBodyW: 8,
            harpoonBodyH: 12,
            scoreValues: { large: 100, medium: 200, small: 500 },
            splitTo: { large: 'medium', medium: 'small', small: null },
            maxBalls: mode.maxBallsOnScreen,
            maxHarpoons: mode.maxHarpoons,
            animFrames: mode.animFramesPerCharacter
        };
    },
    
    // ========================================================================
    // GAME CONTROL
    // ========================================================================
    
    start(engine) {
        this.state = 'title';
    },
    
    handleKeyPress(code, engine) {
        engine.audio.unlock();
        
        if (this.state === 'title') {
            if (code === 'Space' || code === 'Enter' || code === 'KeyZ') {
                this.startGame(engine);
            }
            return;
        }
        
        if (this.state === 'playing' && code === 'KeyP') {
            engine.togglePause();
            return;
        }
        
        if (code === 'Escape') {
            this.returnToTitle(engine);
            return;
        }
        
        if (this.state === 'levelCleared') {
            if (code === 'Space' || code === 'Enter' || code === 'KeyZ') {
                this.currentLevel++;
                if (this.levels[this.currentLevel]) {
                    this.state = 'playing';
                    this.spawnLevel(engine);
                } else {
                    this.state = 'cleared';
                }
            }
            return;
        }
        
        if (this.state === 'gameOver' || this.state === 'cleared') {
            if (code === 'KeyR') {
                this.startGame(engine);
            }
            return;
        }
        
        if (this.state === 'timeout') {
            if (code === 'Space' || code === 'Enter' || code === 'KeyZ') {
                this.spawnLevel(engine);
                this.state = 'playing';
            }
            return;
        }
    },
    
    startGame(engine) {
        this.lives = 3;
        this.score = 0;
        this.currentLevel = 1;
        this.state = 'playing';
        engine.setPaused(false);
        engine.audio.playMusic('game');
        this.spawnLevel(engine);
    },
    
    returnToTitle(engine) {
        this.state = 'title';
        engine.setPaused(false);
        this.balls = [];
        this.harpoons = [];
        engine.audio.playMusic('title');
    },
    
    spawnLevel(engine) {
        this.balls = [];
        this.harpoons = [];
        
        const levelConfig = this.levels[this.currentLevel];
        if (!levelConfig) {
            this.state = 'cleared';
            return;
        }
        
        this.levelTimer = levelConfig.timer;
        
        this.player.x = this.config.width / 2;
        this.player.y = this.config.floorY - this.config.playerHeight / 2;
        this.player.facing = 1;
        this.player.isWalking = false;
        this.player.walkTimer = 0;
        this.player.bobOffset = 0;
        
        for (const ballDef of levelConfig.balls) {
            const size = ballDef.size;
            const radius = this.config.ballRadius[size];
            const speed = this.config.ballSpeed[size];
            
            const x = this.config.playfieldLeft + radius + 
                      (this.config.playfieldWidth - radius * 2) * ballDef.x;
            const y = this.config.playfieldTop + radius + 
                      (this.config.playfieldHeight - radius * 2) * ballDef.y;
            
            const dir = ballDef.dir || (Math.random() < 0.5 ? -1 : 1);
            
            this.balls.push({ x, y, vx: dir * speed, vy: -2.5, size, radius });
        }
    },
    
    loseLife(engine) {
        engine.audio.playSfx('hurt');
        this.lives--;
        this.harpoons = [];
        
        if (this.lives <= 0) {
            this.state = 'gameOver';
            engine.audio.pauseMusic();
        } else {
            this.spawnLevel(engine);
        }
    },
    
    // ========================================================================
    // UPDATE
    // ========================================================================
    
    update(engine, dt) {
        if (this.state !== 'playing') return;
        
        this.levelTimer -= dt / 1000;
        if (this.levelTimer <= 0) {
            this.levelTimer = 0;
            this.state = 'timeout';
            this.harpoons = [];
            return;
        }
        
        this.updatePlayer(engine, dt);
        this.updateHarpoons(engine, dt);
        this.updateBalls(engine, dt);
        this.checkCollisions(engine);
        
        if (this.balls.length === 0 && this.state === 'playing') {
            this.state = 'levelCleared';
            this.harpoons = [];
        }
    },
    
    updatePlayer(engine, dt) {
        const input = engine.input;
        const movingLeft = input.isDown('left');
        const movingRight = input.isDown('right');
        
        this.player.isWalking = movingLeft || movingRight;
        
        if (movingLeft) {
            this.player.x -= this.player.speed;
            this.player.facing = -1;
        }
        if (movingRight) {
            this.player.x += this.player.speed;
            this.player.facing = 1;
        }
        
        if (this.player.isWalking) {
            this.player.walkTimer += 0.2;
            this.player.bobOffset = Math.sin(this.player.walkTimer * 2) * 1.0;
        } else {
            this.player.walkTimer = 0;
            this.player.bobOffset = 0;
        }
        
        const minX = this.config.playfieldLeft + this.player.width / 2;
        const maxX = this.config.playfieldRight - this.player.width / 2;
        this.player.x = Math.max(minX, Math.min(maxX, this.player.x));
        
        if (input.isDown('fire')) {
            const now = performance.now();
            if (now - this.lastShotTime > this.harpoonCooldown) {
                if (engine.canSpawn('harpoon', this.harpoons.length)) {
                    this.fireHarpoon(engine);
                    this.lastShotTime = now;
                }
            }
        }
    },
    
    fireHarpoon(engine) {
        engine.audio.playSfx('harpoon');
        this.harpoons.push({
            x: this.player.x,
            yBottom: this.player.y - this.player.height / 2,
            yTop: this.player.y - this.player.height / 2,
            active: true
        });
    },
    
    updateHarpoons(engine, dt) {
        for (let i = this.harpoons.length - 1; i >= 0; i--) {
            const h = this.harpoons[i];
            h.yTop -= this.config.harpoonSpeed;
            if (h.yTop <= this.config.playfieldTop) {
                this.harpoons.splice(i, 1);
            }
        }
    },
    
    updateBalls(engine, dt) {
        const floorY = this.config.floorY;
        const ceilingY = this.config.playfieldTop;
        const leftWall = this.config.playfieldLeft;
        const rightWall = this.config.playfieldRight;
        
        for (const ball of this.balls) {
            ball.vy += this.config.gravity;
            ball.x += ball.vx;
            ball.y += ball.vy;
            
            if (ball.x - ball.radius < leftWall) {
                ball.x = leftWall + ball.radius;
                ball.vx = Math.abs(ball.vx);
            } else if (ball.x + ball.radius > rightWall) {
                ball.x = rightWall - ball.radius;
                ball.vx = -Math.abs(ball.vx);
            }
            
            if (ball.y - ball.radius < ceilingY) {
                ball.y = ceilingY + ball.radius;
                ball.vy = Math.abs(ball.vy);
            }
            
            if (ball.y + ball.radius > floorY) {
                ball.y = floorY - ball.radius;
                ball.vy = this.config.bounceVY;
            }
        }
    },
    
    checkCollisions(engine) {
        const playerHitbox = {
            x: this.player.x - this.player.width * 0.4,
            y: this.player.y - this.player.height * 0.45,
            width: this.player.width * 0.8,
            height: this.player.height * 0.9
        };
        
        for (const ball of this.balls) {
            if (this.rectCircleCollision(playerHitbox, ball)) {
                this.loseLife(engine);
                return;
            }
        }
        
        for (let hi = this.harpoons.length - 1; hi >= 0; hi--) {
            const h = this.harpoons[hi];
            
            for (let bi = this.balls.length - 1; bi >= 0; bi--) {
                const ball = this.balls[bi];
                
                if (this.harpoonHitsBall(h, ball)) {
                    engine.audio.playSfx('pop');
                    this.score += this.config.scoreValues[ball.size];
                    
                    this.harpoons.splice(hi, 1);
                    this.balls.splice(bi, 1);
                    
                    const nextSize = this.config.splitTo[ball.size];
                    if (nextSize && engine.canSpawn('ball', this.balls.length + 2)) {
                        this.spawnSplitBalls(ball.x, ball.y, nextSize);
                    }
                    
                    break;
                }
            }
        }
        
        if (this.score > this.highScore) {
            this.highScore = this.score;
        }
    },
    
    spawnSplitBalls(x, y, size) {
        const radius = this.config.ballRadius[size];
        const speed = this.config.ballSpeed[size];
        
        this.balls.push({ x: x - 5, y, vx: -speed, vy: -2.5, size, radius });
        this.balls.push({ x: x + 5, y, vx: speed, vy: -2.5, size, radius });
    },
    
    rectCircleCollision(rect, circle) {
        const distX = Math.abs(circle.x - rect.x - rect.width / 2);
        const distY = Math.abs(circle.y - rect.y - rect.height / 2);
        
        if (distX > rect.width / 2 + circle.radius) return false;
        if (distY > rect.height / 2 + circle.radius) return false;
        if (distX <= rect.width / 2) return true;
        if (distY <= rect.height / 2) return true;
        
        const dx = distX - rect.width / 2;
        const dy = distY - rect.height / 2;
        return dx * dx + dy * dy <= circle.radius * circle.radius;
    },
    
    harpoonHitsBall(h, ball) {
        const harpoonRect = {
            x: h.x - this.config.harpoonBodyW / 2,
            y: h.yTop,
            width: this.config.harpoonBodyW,
            height: h.yBottom - h.yTop + this.config.harpoonHeadH
        };
        return this.rectCircleCollision(harpoonRect, ball);
    },
    
    // ========================================================================
    // RENDER
    // ========================================================================
    
    render(engine) {
        const renderer = engine.renderer;
        
        if (this.state === 'title') {
            this.renderTitleScreen(engine);
            return;
        }
        
        renderer.clear('#000000');
        this.renderBackground(engine);
        this.renderPlayer(engine);
        this.renderHarpoons(engine);
        this.renderBalls(engine);
        this.renderHUD(engine);
        
        if (engine.paused) {
            this.renderOverlay(engine, 'PAUSED', '#ffff00');
        } else if (this.state === 'levelCleared') {
            const nextExists = this.levels[this.currentLevel + 1];
            const subtitle = nextExists 
                ? `Press FIRE for Level ${this.currentLevel + 1}` 
                : 'Press FIRE to see your score!';
            this.renderOverlay(engine, `LEVEL ${this.currentLevel} CLEARED!`, '#00ff00', subtitle);
        } else if (this.state === 'timeout') {
            this.renderOverlay(engine, 'TIME OUT!', '#ff4444', 'Press FIRE to retry');
        } else if (this.state === 'gameOver') {
            this.renderOverlay(engine, 'GAME OVER', '#ff0000', 'Press R to restart');
        } else if (this.state === 'cleared') {
            this.renderOverlay(engine, 'CONGRATULATIONS!', '#00ffff', `Final Score: ${this.score} - Press R`);
        }
    },
    
    renderTitleScreen(engine) {
        const renderer = engine.renderer;
        const W = this.config.width;
        const H = this.config.height;
        
        renderer.clear('#000020');
        
        renderer.drawText('PANG!', W / 2, H / 2 - 30, {
            colour: '#ffff00',
            font: 'bold 24px monospace',
            align: 'center',
            baseline: 'middle'
        });
        
        renderer.drawText(`Mode: ${engine.mode.name}`, W / 2, H / 2, {
            colour: '#888888',
            font: '10px monospace',
            align: 'center',
            baseline: 'middle'
        });
        
        if (Math.floor(performance.now() / 500) % 2 === 0) {
            renderer.drawText('PRESS FIRE TO START', W / 2, H / 2 + 30, {
                colour: '#ffffff',
                font: '10px monospace',
                align: 'center',
                baseline: 'middle'
            });
        }
        
        renderer.drawText('ARROWS/WASD = Move  |  SPACE/Z = Fire', W / 2, H - 20, {
            colour: '#666666',
            font: '8px monospace',
            align: 'center',
            baseline: 'middle'
        });
    },
    
    renderBackground(engine) {
        const renderer = engine.renderer;
        const cfg = this.config;
        
        renderer.drawRect(cfg.playfieldLeft, cfg.playfieldTop, 
                          cfg.playfieldWidth, cfg.playfieldHeight * 0.5, '#5080b0');
        
        renderer.drawRect(cfg.playfieldLeft, cfg.playfieldTop + cfg.playfieldHeight * 0.5,
                          cfg.playfieldWidth, cfg.playfieldHeight * 0.5, '#a08050');
        
        this.renderBorder(engine);
    },
    
    renderBorder(engine) {
        const renderer = engine.renderer;
        const cfg = this.config;
        const size = cfg.borderSize;
        
        const borderColour = '#404070';
        const highlightColour = '#6060a0';
        const shadowColour = '#202040';
        
        renderer.drawRect(0, 0, cfg.width, size, borderColour);
        renderer.drawRect(0, 0, cfg.width, 1, highlightColour);
        
        renderer.drawRect(0, 0, size, cfg.floorY + size, borderColour);
        renderer.drawRect(0, 0, 1, cfg.floorY + size, highlightColour);
        
        renderer.drawRect(cfg.width - size, 0, size, cfg.floorY + size, borderColour);
        renderer.drawRect(cfg.width - 1, 0, 1, cfg.floorY + size, shadowColour);
        
        renderer.drawRect(size, cfg.floorY, cfg.width - size * 2, size, borderColour);
        renderer.drawRect(size, cfg.floorY + size - 1, cfg.width - size * 2, 1, shadowColour);
    },
    
    renderPlayer(engine) {
        const renderer = engine.renderer;
        const sprites = engine.sprites;
        const player = this.player;
        
        const px = player.x - player.width / 2;
        const py = player.y - player.height / 2 + player.bobOffset;
        
        const playerSprite = sprites.get('player');
        
        if (playerSprite && playerSprite.type !== 'placeholder') {
            const animation = player.isWalking ? 'walk' : 'idle';
            const frameIndex = Math.floor(player.walkTimer) % this.config.animFrames;
            
            renderer.drawSprite(playerSprite, animation, frameIndex, px, py, {
                flipX: player.facing === -1
            });
        } else {
            renderer.drawRect(px, py, player.width, player.height, '#00ccaa');
        }
    },
    
    renderHarpoons(engine) {
        const renderer = engine.renderer;
        const cfg = this.config;
        
        for (const h of this.harpoons) {
            const bodyStart = h.yTop + cfg.harpoonHeadH;
            const bodyEnd = h.yBottom;
            const bodyHeight = bodyEnd - bodyStart;
            
            if (bodyHeight > 0) {
                renderer.drawRect(h.x - 2, bodyStart, 4, bodyHeight, '#cc9900');
            }
            
            renderer.drawRect(h.x - 6, h.yTop, 12, 16, '#ffcc00');
        }
    },
    
    renderBalls(engine) {
        const renderer = engine.renderer;
        const colours = { large: '#ff3333', medium: '#ff6644', small: '#ff9955' };
        
        for (const ball of this.balls) {
            renderer.drawCircle(ball.x, ball.y, ball.radius, colours[ball.size]);
            renderer.drawCircle(
                ball.x - ball.radius * 0.3, 
                ball.y - ball.radius * 0.3, 
                ball.radius * 0.25, 
                'rgba(255, 255, 255, 0.4)'
            );
        }
    },
    
    renderHUD(engine) {
        const renderer = engine.renderer;
        const cfg = this.config;
        
        const hudY = cfg.floorY + cfg.borderSize;
        renderer.drawRect(0, hudY, cfg.width, cfg.hudHeight, '#000000');
        
        const textY = hudY + 4;
        
        renderer.drawText('SCORE', 8, textY, { colour: '#8888cc', font: '8px monospace' });
        renderer.drawText(String(this.score).padStart(6, '0'), 8, textY + 10, { colour: '#ffffff', font: '8px monospace' });
        
        const levelConfig = this.levels[this.currentLevel] || { name: 'STAGE', stage: 1 };
        renderer.drawText(levelConfig.name, cfg.width / 2, textY, { 
            colour: '#8888cc', font: '8px monospace', align: 'center' 
        });
        renderer.drawText(`LEVEL ${this.currentLevel}`, cfg.width / 2, textY + 10, { 
            colour: '#ffffff', font: '8px monospace', align: 'center' 
        });
        
        renderer.drawText(`LIVES: ${this.lives}`, 8, textY + 24, { colour: '#ffffff', font: '8px monospace' });
        
        const timeLeft = Math.max(0, Math.ceil(this.levelTimer));
        const timeColour = timeLeft <= 10 ? '#ff4444' : '#ffffff';
        renderer.drawText(`TIME ${String(timeLeft).padStart(3, '0')}`, cfg.width - 8, cfg.playfieldTop + 4, {
            colour: timeColour, font: '8px monospace', align: 'right'
        });
        
        renderer.drawText('HI-SCORE', cfg.width - 8, textY, { colour: '#8888cc', font: '8px monospace', align: 'right' });
        renderer.drawText(String(this.highScore).padStart(6, '0'), cfg.width - 8, textY + 10, { colour: '#ffffff', font: '8px monospace', align: 'right' });
    },
    
    renderOverlay(engine, title, colour, subtitle = null) {
        const renderer = engine.renderer;
        const cfg = this.config;
        
        renderer.drawRect(0, 0, cfg.width, cfg.height, 'rgba(0, 0, 0, 0.75)');
        
        renderer.drawText(title, cfg.width / 2, cfg.height / 2 - 10, {
            colour: colour,
            font: 'bold 16px monospace',
            align: 'center',
            baseline: 'middle'
        });
        
        if (subtitle) {
            renderer.drawText(subtitle, cfg.width / 2, cfg.height / 2 + 15, {
                colour: '#aaaaaa',
                font: '10px monospace',
                align: 'center',
                baseline: 'middle'
            });
        }
    }
};

// ============================================================================
// EXPORTS
// ============================================================================

export { PangGame };
