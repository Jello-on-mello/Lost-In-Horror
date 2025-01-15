import { Graphics } from 'pixi.js';

export class Bullet {
    constructor(faction, direction, speed, spawnPoint, numBullets, damage) {
        this.faction = faction;
        this.direction = direction;
        this.speed = speed;
        this.damage = damage; // Add damage property
        this.bullets = [];

        for (let i = 0; i < numBullets; i++) {
            const bullet = new Graphics();
            bullet.beginFill(0xfff200);
            bullet.drawRect(-2, -5, 4, 10);
            bullet.endFill();

            bullet.x = spawnPoint.x;
            bullet.y = spawnPoint.y;

            bullet.vx = Math.cos(direction) * speed;
            bullet.vy = Math.sin(direction) * speed;

            this.bullets.push(bullet);
        }
    }

    update() {
        this.bullets.forEach(bullet => {
            bullet.x += bullet.vx;
            bullet.y += bullet.vy;
        });
    }

    checkCollision(enemies) {
        const bulletsToRemove = [];
    
        this.bullets.forEach((bullet, bulletIndex) => {
            enemies.forEach((enemy) => {
                // Skip if enemy is null, destroyed, or doesn't have a sprite
                if (!enemy || enemy.isDead || !enemy.sprite || enemy.sprite._destroyed) return;
    
                if (this.isColliding(bullet, enemy.sprite)) {
                    enemy.takeDamage(this.damage); // Use bullet's damage value
                    bullet.destroy();
                    bulletsToRemove.push(bulletIndex);
                }
            });
        });

        // Remove bullets after iteration
        bulletsToRemove.sort((a, b) => b - a).forEach(index => {
            this.bullets.splice(index, 1);
        });
    }

    isColliding(bullet, enemySprite) {
        // Skip if sprite is null, destroyed, or has no parent
        if (!bullet || bullet._destroyed || !bullet.parent) return false;
        if (!enemySprite || enemySprite._destroyed || !enemySprite.parent) return false;
    
        const bulletBounds = bullet.getBounds ? bullet.getBounds() : null;
        const enemyBounds = enemySprite.getBounds ? enemySprite.getBounds() : null;
    
        if (!bulletBounds || !enemyBounds) return false;
    
        return (
            bulletBounds.x < enemyBounds.x + enemyBounds.width &&
            bulletBounds.x + bulletBounds.width > enemyBounds.x &&
            bulletBounds.y < enemyBounds.y + enemyBounds.height &&
            bulletBounds.y + bulletBounds.height > enemyBounds.y
        );
    }

    despawn() {
        this.bullets.forEach(bullet => bullet.destroy());
        this.bullets = [];
    }
}