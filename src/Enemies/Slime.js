import { Graphics } from 'pixi.js';

export class Slime {
    constructor(app, player, room, roomSize, speed = 2, damage = 1) {
        this.app = app;
        this.player = player;
        this.room = room;
        this.hp = 4;
        this.isDead = false;
        this.speed = speed;
        this.damage = damage;

        this.sprite = new Graphics();
        this.sprite.beginFill(0x00ff00);
        this.sprite.drawRect(-15, -15, 30, 30);
        this.sprite.endFill();

        // Ensure the enemy spawns at a safe distance from the player
        let spawnX, spawnY, distance;
        do {
            spawnX = Math.random() * roomSize.width;
            spawnY = Math.random() * roomSize.height;
            const dx = this.player.sprite.x - spawnX;
            const dy = this.player.sprite.y - spawnY;
            distance = Math.sqrt(dx * dx + dy * dy);
        } while (distance < 100); // Adjust the minimum distance as needed

        console.log(`Spawning Slime at (${spawnX}, ${spawnY}) in room of size (${roomSize.width}, ${roomSize.height})`); // Debugging information

        this.sprite.x = spawnX;
        this.sprite.y = spawnY;
    }

    update() {
        if (this.isDead) return;
    
        const dx = this.player.sprite.x - this.sprite.x;
        const dy = this.player.sprite.y - this.sprite.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
    
        if (distance < 15) {
            this.player.takeDamage(this.damage);
        }
    
        this.sprite.x += (dx / distance) * this.speed;
        this.sprite.y += (dy / distance) * this.speed;
    }

    takeDamage() {
        this.hp--;
        if (this.hp <= 0) {
            this.isDead = true;
            this.sprite.destroy();
        }
    }

    despawn() {
        this.sprite.destroy();
    }
}