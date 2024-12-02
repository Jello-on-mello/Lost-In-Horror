import { Sprite, Graphics, AnimatedSprite, Container, Assets } from 'pixi.js';

export class Player {
    constructor(app, playerTexture, gunTexture, rechamberAnimation) {
        this.app = app;
        this.sprite = new Sprite(playerTexture);
        this.sprite.anchor.set(0.5);
        this.sprite.x = app.screen.width - 850;
        this.sprite.y = app.screen.height / 2;

        this.speed = 5;
        this.hp = 3;

        // Gun animation setup
        this.gun = new AnimatedSprite(rechamberAnimation.map((frame) => Assets.get(frame)));
        this.gun.anchor.set(0.5);
        this.gun.animationSpeed = 0.1;
        this.gun.loop = false;
        this.gun.texture = gunTexture;
        this.sprite.addChild(this.gun);

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
        app.stage.addChild(this.reloadAnimationContainer);

        this.setupControls();
    }

    takeDamage() {
        this.hp--;
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
                const bullet = new Graphics();
                bullet.beginFill(0xff0000);
                bullet.drawRect(-2, -5, 4, 10);
                bullet.endFill();

                const offsetX = Math.cos(this.gun.rotation) * 30;
                const offsetY = Math.sin(this.gun.rotation) * 30;

                bullet.x = this.sprite.x + this.gun.x + offsetX;
                bullet.y = this.sprite.y + this.gun.y + offsetY;

                const randomAngle = this.gun.rotation + (Math.random() - 0.5) * spreadAngle;
                bullet.vx = Math.cos(randomAngle) * 5;
                bullet.vy = Math.sin(randomAngle) * 5;

                this.app.stage.addChild(bullet);
                this.bullets.push(bullet);
            }, i * shotDelay);
        }

        this.currentShells--;
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
        for (let i = 0; i < 2; i++) {
            const arrow = new Graphics();
            arrow.beginFill(0xffffff);
            arrow.drawPolygon([-10, 0, 10, 5, 10, -5]);
            arrow.endFill();
            arrow.rotation = (i * Math.PI) + Math.PI / 4;
            this.reloadArrows.push(arrow);
            this.reloadAnimationContainer.addChild(arrow);
        }
        this.reloadAnimationContainer.visible = false;
    }

    startReloadAnimation() {
        this.reloadAnimationContainer.visible = true;
        this.reloadAnimationContainer.position.set(this.sprite.x, this.sprite.y);

        this.reloadTicker = this.app.ticker.add(() => {
            this.reloadArrows.forEach((arrow, index) => {
                arrow.rotation += 0.1 * (index === 0 ? 1 : -1);
            });
        });
    }

    completeReloadAnimation() {
        this.app.ticker.remove(this.reloadTicker);
        this.reloadArrows.forEach((arrow) => {
            arrow.tint = 0x00ff00; // Turn green
        });

        setTimeout(() => {
            this.reloadAnimationContainer.visible = false;
            this.reloadArrows.forEach((arrow) => (arrow.tint = 0xffffff));
        }, 500);
    }

    updateGunRotation(targetCircle) {
        const dx = targetCircle.x - this.sprite.x;
        const dy = targetCircle.y - this.sprite.y;
        this.gun.rotation = Math.atan2(dy, dx);
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

        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            bullet.x += bullet.vx;
            bullet.y += bullet.vy;

            if (bullet.x < 0 || bullet.x > this.app.screen.width || bullet.y < 0 || bullet.y > this.app.screen.height) {
                this.bullets.splice(i, 1);
                bullet.destroy();
            }
        }
    }
}
