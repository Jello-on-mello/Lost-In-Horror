import { Sprite, Graphics, AnimatedSprite, Container, Assets } from 'https://cdn.jsdelivr.net/npm/pixi.js@8.x/dist/pixi.min.mjs';
import { Bullet } from '../Manager/BulletManager.js';

export class Player {
    constructor(app, playerTexture, gunTexture, rechamberAnimation, textureManager) {
        this.app = app;
        this.sprite = new Sprite();
        this.sprite.scale.set(0.75, 0.75);
        this.sprite.anchor.set(0.5);
        this.sprite.x = app.screen.width / 2;
        this.sprite.y = app.screen.height / 2;

        this.idleSprite = new Sprite(playerTexture);
        this.idleSprite.anchor.set(0.5);
        this.sprite.addChild(this.idleSprite);

        this.isDead = false;
        this.speed = 2.5;
        this.hp = 3;
        this.damage = 1;
        this.isDodging = false;
        this.invincible = false;

        this.dodgeDuration = 50; // Duration of the dodge in milliseconds
        this.dodgeSpeed = 10; // Speed during dodge
        this.dodgeCooldown = 1500; // Cooldown period after dodge in milliseconds
        this.dodgeTrail = [];
        this.lastDodgeTime = 0;

        // Gun animation setup
        this.gun = new AnimatedSprite(rechamberAnimation);
        this.gun.anchor.set(0.5);
        this.gun.animationSpeed = 0.1;
        this.gun.loop = false;
        this.gun.texture = gunTexture;

        // Set the gun's relative position
        this.gun.x = 2; // Adjust this value to position the gun horizontally
        this.gun.y = 5; // Adjust this value to position the gun vertically

        this.sprite.addChild(this.gun);

        this.rechamberAnimation = rechamberAnimation; // Store the animation frames

        this.bullets = [];
        this.currentShells = 4;
        this.MAX_SHELLS = 4;
        this.isReloading = false;
        this.shotCooldown = 500;
        this.lastShotTime = 0;
        this.keys = { up: false, down: false, left: false, right: false, shoot: false, reload: false ,dodge: false};

        // Reload animation
        this.reloadAnimationContainer = new Container();
        this.reloadArrows = [];
        this.initReloadAnimation();
        this.sprite.addChild(this.reloadAnimationContainer);

        // Store idle and walking textures
        this.idleTextures = {
            front: textureManager.getTexture('PlayerIdleDown'),
            back: textureManager.getTexture('PlayerIdleUp'),
            side: textureManager.getTexture('PlayerIdleSide')
        };

        this.walkingTextures = {
            front: textureManager.getTexture('PlayerWalkDown'),
            back: textureManager.getTexture('PlayerWalkUp'),
            side: textureManager.getTexture('PlayerWalkSide')
        };

        this.walkingSprites = {
            front: new AnimatedSprite(this.walkingTextures.front),
            back: new AnimatedSprite(this.walkingTextures.back),
            side: new AnimatedSprite(this.walkingTextures.side)
        };

        this.deathTextures = [
            textureManager.getTexture('PlayerDeath1'),
            textureManager.getTexture('PlayerDeath2')
        ];
    
        // Create death animation sprite
        this.deathSprite = new AnimatedSprite(this.deathTextures);
        this.deathSprite.anchor.set(0.5);
        this.deathSprite.animationSpeed = 0.1;
        this.deathSprite.loop = false;
        this.deathSprite.visible = false;
        this.sprite.addChild(this.deathSprite);

        // Set up walking animations
        for (const direction in this.walkingSprites) {
            const sprite = this.walkingSprites[direction];
            sprite.anchor.set(0.5);
            sprite.animationSpeed = 0.1;
            sprite.loop = true;
            sprite.visible = false;
            this.sprite.addChild(sprite);
        }

        this.setupControls();
    }

    takeDamage(damage = 1) {
        if (this.isDead) return; // Prevent taking damage if player is dead
    
        this.hp -= damage;
        console.log(`Player HP: ${this.hp}`);
        if (this.hp <= 0) {
            console.log('Game Over!');
            this.playDeathAnimation();
        }
    }

    setupControls() {
        window.addEventListener('keydown', (e) => {
            if (e.code === 'KeyW') this.keys.up = true;
            if (e.code === 'KeyS') this.keys.down = true;
            if (e.code === 'KeyA') this.keys.left = true;
            if (e.code === 'KeyD') this.keys.right = true;
            if (e.code === 'Space') this.keys.shoot = true;
            if (e.code === 'KeyR') this.keys.reload = true;
            if (e.code === 'ShiftLeft') this.keys.dodge = true;
        });
    
        window.addEventListener('keyup', (e) => {
            if (e.code === 'KeyW') this.keys.up = false;
            if (e.code === 'KeyS') this.keys.down = false;
            if (e.code === 'KeyA') this.keys.left = false;
            if (e.code === 'KeyD') this.keys.right = false;
            if (e.code === 'Space') this.keys.shoot = false;
            if (e.code === 'KeyR') this.keys.reload = false;
            if (e.code === 'ShiftLeft') this.keys.dodge = false;
        });
    }

    shootShotgun() {
        if (this.currentShells <= 0 || this.isReloading) return;

        const spreadAngle = 0.261799; // ~15 degrees
        const numberOfBullets = 5;
        const shotDelay = 10;

        for (let i = 0; i < numberOfBullets; i++) {
            setTimeout(() => {
                const direction = this.gun.rotation + (Math.random() - 0.5) * spreadAngle;
                const spawnPoint = { x: this.sprite.x + this.gun.x, y: this.sprite.y + this.gun.y };
                const bullet = new Bullet('player', direction, 5, spawnPoint, 1, this.damage); // Pass damage value
                bullet.bullets.forEach(b => this.app.stage.addChild(b));
                this.bullets.push(bullet);
            }, i * shotDelay);
        }

        this.currentShells--;
        this.gun.textures = this.rechamberAnimation; // Ensure the textures are set for the animation
        this.gun.gotoAndPlay(0); // Play firing animation
    }


    reload() {
        if (!this.isReloading && this.currentShells < this.MAX_SHELLS) {
            this.isReloading = true;
            this.startReloadAnimation();

            setTimeout(() => {
                this.currentShells = this.MAX_SHELLS;
                this.isReloading = false;
                this.completeReloadAnimation();
            }, 2000); // 2 seconds reload time
        }
    }

    initReloadAnimation() {
        const shellSpacing = 15; // Space between shells
        const yOffset = 40; // Position below the player
        for (let i = 0; i < 4; i++) {
            const shell = new Graphics();

            // Draw shell body (orange)
            shell.beginFill(0xff4500);
            shell.drawRect(-3, -5, 6, 10);
            shell.endFill();

            // Draw shell cap (brass/yellow)
            shell.beginFill(0xffd700);
            shell.drawRect(-3, 5, 6, 5);
            shell.endFill();

            shell.x = i * shellSpacing - (1.5 * shellSpacing); // Center shells horizontally
            shell.y = yOffset;
            shell.visible = false;

            this.reloadArrows.push(shell); // Repurposing the reloadArrows array for shells
            this.reloadAnimationContainer.addChild(shell);
        }

        this.reloadAnimationContainer.visible = false;
        this.sprite.addChild(this.reloadAnimationContainer); // Attach animation to player
    }

    startReloadAnimation() {
        this.reloadAnimationContainer.visible = true;

        const reloadTime = 2000; // Total reload time in ms
        const segmentTime = reloadTime / 4; // Time for each shell to show
        let currentShell = 0;

        const showShell = () => {
            if (currentShell < this.reloadArrows.length) {
                this.reloadArrows[currentShell].visible = true;
                currentShell++;
            }

            if (currentShell === this.reloadArrows.length) {
                setTimeout(() => {
                    this.completeReloadAnimation(); // Trigger completion once the last shell shows
                }, 100); // Brief delay to make the last shell’s green state visible
            }
        };

        this.reloadInterval = setInterval(showShell, segmentTime);
    }

    completeReloadAnimation() {
        clearInterval(this.reloadInterval);

        // Turn all shells green
        this.reloadArrows.forEach((shell) => {
            shell.tint = 0x00ff00; // Apply green tint
        });

        // Keep the shells visible for a noticeable period after turning green
        setTimeout(() => {
            this.reloadArrows.forEach((shell) => {
                shell.visible = false; // Hide the shells after a brief delay
                shell.tint = 0xffffff; // Reset the tint for next reload
            });
            this.reloadAnimationContainer.visible = false;
        }, 1000); // Keep shells visible for 1 second after reload
    }

    dodge() {
        if (this.isDodging || Date.now() - this.lastDodgeTime < this.dodgeCooldown) return;

        this.isDodging = true;
        this.invincible = true;
        this.lastDodgeTime = Date.now();

        const originalSpeed = this.speed;
        this.speed = this.dodgeSpeed;

        const direction = {
            x: (this.keys.left ? -1 : 0) + (this.keys.right ? 1 : 0),
            y: (this.keys.up ? -1 : 0) + (this.keys.down ? 1 : 0)
        };

        const normalize = (vector) => {
            const length = Math.sqrt(vector.x * vector.x + vector.y * vector.y);
            return { x: vector.x / length, y: vector.y / length };
        };

        const normalizedDirection = normalize(direction);

        const dodgeInterval = setInterval(() => {
            this.createDodgeTrail();
        }, 10); // Create trail every 10ms

        const dodgeMovement = setInterval(() => {
            this.sprite.x += normalizedDirection.x * this.dodgeSpeed;
            this.sprite.y += normalizedDirection.y * this.dodgeSpeed;
        }, 16); // Move every 16ms (approx. 60fps)

        setTimeout(() => {
            clearInterval(dodgeInterval);
            clearInterval(dodgeMovement);
            this.isDodging = false;
            this.invincible = false;
            this.speed = originalSpeed;
        }, this.dodgeDuration);
    }

    createDodgeTrail() {
        const trailSprite = new Sprite(this.idleSprite.texture);
        trailSprite.x = this.sprite.x;
        trailSprite.y = this.sprite.y;
        trailSprite.anchor.set(0.5);
        trailSprite.alpha = 0.5; // Start with half opacity
        trailSprite.scale.set(this.sprite.scale.x, this.sprite.scale.y); // Match player scale

        this.app.stage.addChild(trailSprite);
        this.dodgeTrail.push(trailSprite);

        setTimeout(() => {
            this.app.stage.removeChild(trailSprite);
            this.dodgeTrail = this.dodgeTrail.filter(s => s !== trailSprite);
        }, 150); // Remove trail sprite after 100ms
    }s

    createDodgeTrail() {
        const trailSprite = new Sprite(this.idleSprite.texture);
        trailSprite.x = this.sprite.x;
        trailSprite.y = this.sprite.y;
        trailSprite.anchor.set(0.5);
        trailSprite.alpha = 0.5; // Start with half opacity
        trailSprite.scale.set(this.sprite.scale.x, this.sprite.scale.y); // Match player scale

        this.app.stage.addChild(trailSprite);
        this.dodgeTrail.push(trailSprite);

        setTimeout(() => {
            
            this.app.stage.removeChild(trailSprite);
            this.dodgeTrail = this.dodgeTrail.filter(s => s !== trailSprite);
        }, 100); // Remove trail sprite after 100ms
    }

    playDeathAnimation() {
        // Disable player movement
        this.keys.up = false;
        this.keys.down = false;
        this.keys.left = false;
        this.keys.right = false;
        this.keys.shoot = false;
        this.keys.reload = false;
    
        // Set isDead flag to true
        this.isDead = true;
    
        // Notify the enemy manager that the player is dead
        this.app.enemyManager.onPlayerDeath();
    
        // Hide other sprites
        this.idleSprite.visible = false;
        for (const direction in this.walkingSprites) {
            this.walkingSprites[direction].visible = false;
            this.walkingSprites[direction].stop();
        }
    
        // Play death animation
        this.deathSprite.visible = true;
        this.deathSprite.gotoAndPlay(0);

        setTimeout(() => {
            // Reset player state
            this.reset();
            
            // Reset enemies
            if (this.app.enemyManager) {
                this.app.enemyManager.despawnEnemies();
            }
    
            // Reset map to floor 1 and spawn room
            if (this.app.mapManager) {
                this.app.mapManager.currentFloor = 1;
                this.app.mapManager.generateMap();
                if (this.app.mapManager.spawnRoom) {
                    this.app.mapManager.loadCurrentRoom(this.app.mapManager.spawnRoom);
                }
            }
        }, 2000); // Wait 2 seconds before reset
    }
    
    
    updateGunRotation(targetCircle) {
        const dx = targetCircle.x - this.sprite.x;
        const dy = targetCircle.y - this.sprite.y;
        const angle = Math.atan2(dy, dx);
        this.gun.rotation = angle;

        // Flip the gun sprite vertically if aiming left
        if (angle > Math.PI / 2 || angle < -Math.PI / 2) {
            this.gun.scale.y = -1;
        } else {
            this.gun.scale.y = 1;
        }

        if (angle > -Math.PI / 4 && angle <= Math.PI / 4) {
            this.idleSprite.texture = this.idleTextures.side; // Right
            this.idleSprite.scale.x = 1; // Ensure the texture is not flipped horizontally
        } else if (angle > Math.PI / 4 && angle <= (3 * Math.PI) / 4) {
            this.idleSprite.texture = this.idleTextures.front; // Up
            this.idleSprite.scale.x = 1; // Ensure the texture is not flipped horizontally
        } else if (angle > (3 * Math.PI) / 4 || angle <= -(3 * Math.PI) / 4) {
            this.idleSprite.texture = this.idleTextures.side; // Left
            this.idleSprite.scale.x = -1; // Flip the texture horizontally
        } else {
            this.idleSprite.texture = this.idleTextures.back; // Down
            this.idleSprite.scale.x = 1; // Ensure the texture is not flipped horizontally
        }
    }

    update(targetCircle) {
        if (this.isDead) return; // Prevent update if player is dead

        if (this.keys.dodge && !this.isDodging) {
            this.dodge();
        } 
    
        let isMoving = false;
    
        // Update player position based on key inputs
        if (this.keys.up) {
            this.sprite.y -= this.speed;
            isMoving = true;
        }
        if (this.keys.down) {
            this.sprite.y += this.speed;
            isMoving = true;
        }
        if (this.keys.left) {
            this.sprite.x -= this.speed;
            isMoving = true;
        }
        if (this.keys.right) {
            this.sprite.x += this.speed;
            isMoving = true;
        }
    
        // Ensure player stays within screen bounds
        this.sprite.x = Math.max(0, Math.min(this.sprite.x, this.app.screen.width));
        this.sprite.y = Math.max(0, Math.min(this.sprite.y, this.app.screen.height));
    
        // Handle shooting
        if (this.keys.shoot && Date.now() - this.lastShotTime >= this.shotCooldown) {
            this.shootShotgun();
            this.lastShotTime = Date.now();
        }
    
        // Handle reloading
        if (this.keys.reload) {
            this.reload();
        }
    
        // Update gun rotation
        this.updateGunRotation(targetCircle);
    
        // Switch between idle and walking animations
        if (isMoving) {
            this.idleSprite.visible = false;
            for (const direction in this.walkingSprites) {
                this.walkingSprites[direction].visible = false;
                this.walkingSprites[direction].stop();
            }
            if (this.keys.up) {
                this.walkingSprites.back.visible = true;
                this.walkingSprites.back.play();
            } else if (this.keys.down) {
                this.walkingSprites.front.visible = true;
                this.walkingSprites.front.play();
            } else if (this.keys.left) {
                this.walkingSprites.side.visible = true;
                this.walkingSprites.side.scale.x = -1; // Flip the texture horizontally
                this.walkingSprites.side.play();
            } else if (this.keys.right) {
                this.walkingSprites.side.visible = true;
                this.walkingSprites.side.scale.x = 1; // Ensure the texture is not flipped horizontally
                this.walkingSprites.side.play();
            }
        } else {
            this.idleSprite.visible = true;
            for (const direction in this.walkingSprites) {
                this.walkingSprites[direction].visible = false;
                this.walkingSprites[direction].stop();
            }
        }
        
    
        // Update bullets
        this.bullets.forEach(bullet => {
            bullet.update();
            bullet.checkCollision(this.app.enemyManager.enemies); // Check for collisions with enemies
        });
    
        // Remove bullets that are out of bounds
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            bullet.bullets.forEach(b => {
                if (b.x < 0 || b.x > this.app.screen.width || b.y < 0 || b.y > this.app.screen.height) {
                    b.destroy();
                    bullet.bullets.splice(bullet.bullets.indexOf(b), 1);
                }
            });
            if (bullet.bullets.length === 0) {
                this.bullets.splice(i, 1);
            }
        }
    }

    reset() {
        this.isDead = false;
        this.hp = 3;
        this.currentShells = 4;
        this.isReloading = false;
        this.sprite.x = this.app.screen.width / 2;
        this.sprite.y = this.app.screen.height / 2;
        
        // Reset visuals
        this.idleSprite.visible = true;
        this.deathSprite.visible = false;
        for (const direction in this.walkingSprites) {
            this.walkingSprites[direction].visible = false;
            this.walkingSprites[direction].stop();
        }
        this.despawnBullets();
    }
    

    despawnBullets() {
        this.bullets.forEach(bullet => bullet.despawn());
        this.bullets = [];
        this.clearDodgeTrail(); // Clear dodge trail when entering a new room
    }

    clearDodgeTrail() {
        this.dodgeTrail.forEach(trailSprite => {
            this.app.stage.removeChild(trailSprite);
        });
        this.dodgeTrail = [];
    }
}