import { Sprite, Graphics, AnimatedSprite, Container, Assets } from 'pixi.js';
import { Bullet } from './bullet.js';

export class Player {
    constructor(app, playerTexture, gunTexture, rechamberAnimation, textureManager) {
        this.app = app;
        this.sprite = new Sprite(playerTexture);
        this.sprite.scale.set(1.5, 1.5);
        this.sprite.anchor.set(0.5);
        this.sprite.x = app.screen.width / 2;
        this.sprite.y = app.screen.height / 2;
    
        this.speed = 5;
        this.hp = 3;
    
        // Gun animation setup
        this.gun = new AnimatedSprite(rechamberAnimation);
        this.gun.anchor.set(0.5);
        this.gun.animationSpeed = 0.1;
        this.gun.loop = false;
        this.gun.texture = gunTexture;
        this.sprite.addChild(this.gun);
    
        this.rechamberAnimation = rechamberAnimation; // Store the animation frames
    
        this.bullets = [];
        this.currentShells = 4;
        this.MAX_SHELLS = 4;
        this.isReloading = false;
        this.shotCooldown = 500;
        this.lastShotTime = 0;
        this.keys = { up: false, down: false, left: false, right: false, shoot: false, reload: false };
    
        // Reload animation
        this.reloadAnimationContainer = new Container();
        this.reloadArrows = [];
        this.initReloadAnimation();
        this.sprite.addChild(this.reloadAnimationContainer);
    
        this.setupControls();
    }
    
    takeDamage(damage = 1) {
        this.hp -= damage;
        console.log(`Player HP: ${this.hp}`);
        if (this.hp <= 0) {
            console.log('Game Over!');
            this.hp = 3; // Reset for testing purposes
        }
    }

    setupControls() {
        window.addEventListener('keydown', (e) => {
            if (e.code === 'ArrowUp') this.keys.up = true;
            if (e.code === 'ArrowDown') this.keys.down = true;
            if (e.code === 'ArrowLeft') this.keys.left = true;
            if (e.code === 'ArrowRight') this.keys.right = true;
            if (e.code === 'Space') this.keys.shoot = true;
            if (e.code === 'KeyR') this.keys.reload = true;
        });

        window.addEventListener('keyup', (e) => {
            if (e.code === 'ArrowUp') this.keys.up = false;
            if (e.code === 'ArrowDown') this.keys.down = false;
            if (e.code === 'ArrowLeft') this.keys.left = false;
            if (e.code === 'ArrowRight') this.keys.right = false;
            if (e.code === 'Space') this.keys.shoot = false;
            if (e.code === 'KeyR') this.keys.reload = false;
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
                const bullet = new Bullet('player', direction, 5, spawnPoint, 1);
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
    } 

    update(targetCircle) {
        if (this.keys.up) this.sprite.y -= this.speed;
        if (this.keys.down) this.sprite.y += this.speed;
        if (this.keys.left) this.sprite.x -= this.speed;
        if (this.keys.right) this.sprite.x += this.speed;

        this.sprite.x = Math.max(0, Math.min(this.sprite.x, this.app.screen.width));
        this.sprite.y = Math.max(0, Math.min(this.sprite.y, this.app.screen.height));

        if (this.keys.shoot && Date.now() - this.lastShotTime >= this.shotCooldown) {
            this.shootShotgun();
            this.lastShotTime = Date.now();
        }

        if (this.keys.reload) {
            this.reload();
        }

        this.updateGunRotation(targetCircle);

        this.bullets.forEach(bullet => {
            bullet.update();
            bullet.checkCollision(this.app.enemyManager.enemies); // Check for collisions with enemies
        });

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

    despawnBullets() {
        this.bullets.forEach(bullet => bullet.despawn());
        this.bullets = [];
    }
}