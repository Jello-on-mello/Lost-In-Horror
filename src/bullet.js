import { Graphics } from 'pixi.js';

export class Bullet {
    constructor(faction, direction, speed, spawnPoint, numBullets) {
        this.faction = faction;
        this.direction = direction;
        this.speed = speed;
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

    despawn() {
        this.bullets.forEach(bullet => bullet.destroy());
        this.bullets = [];
    }
}