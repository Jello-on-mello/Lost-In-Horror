import { AnimatedSprite } from 'https://cdn.jsdelivr.net/npm/pixi.js@8.x/dist/pixi.min.mjs';

export class Slime {
    constructor(app, player, room, roomSize, textureManager, speed = 2, damage = 1) {
        this.app = app;
        this.player = player;
        this.room = room;
        this.hp = 4;
        this.isDead = false;
        this.speed = speed;
        this.damage = damage;
        this.textureManager = textureManager;

        // Load textures and handle errors
        try {
            this.textures = {
                idle: this.textureManager.getTexture('SlimeIdle'),
                walkUp: this.textureManager.getTexture('SlimeWalkUp'),
                walkDown: this.textureManager.getTexture('SlimeWalkDown'),
                walkSide: this.textureManager.getTexture('SlimeWalkSide')
            };
        } catch (error) {
            console.error('Error loading textures:', error);
            throw error;
        }

        // Ensure all textures are loaded
        if (!this.textures.idle || !this.textures.walkUp || !this.textures.walkDown || !this.textures.walkSide) {
            throw new Error('One or more textures are not loaded correctly');
        }

        this.sprite = new AnimatedSprite(this.textures.idle);
        this.sprite.anchor.set(0.5);
        this.sprite.animationSpeed = 0.1;
        this.sprite.scale.set(0.25); // Scale down the sprite to 50% of its original size
        this.sprite.play();

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

    update(enemies) {
        if (this.isDead) return;

        const dx = this.player.sprite.x - this.sprite.x;
        const dy = this.player.sprite.y - this.sprite.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 15) {
            this.player.takeDamage(this.damage);
        }

        this.sprite.x += (dx / distance) * this.speed;
        this.sprite.y += (dy / distance) * this.speed;

        // Update animation based on movement direction
        if (Math.abs(dx) > Math.abs(dy)) {
            this.sprite.textures = this.textures.walkSide;
            this.sprite.scale.x = dx > 0 ? 0.25 : -0.25; // Flip sprite based on direction and scale down
        } else {
            this.sprite.textures = dy > 0 ? this.textures.walkDown : this.textures.walkUp;
        }
        this.sprite.play();

        // Check for collisions with other enemies
        enemies.forEach(enemy => {
            if (enemy !== this && !enemy.isDead) {
                const ex = enemy.sprite.x - this.sprite.x;
                const ey = enemy.sprite.y - this.sprite.y;
                const edistance = Math.sqrt(ex * ex + ey * ey);

                if (edistance < 30) { // Adjust the minimum distance as needed
                    const overlap = 30 - edistance;
                    this.sprite.x -= (ex / edistance) * overlap / 2;
                    this.sprite.y -= (ey / edistance) * overlap / 2;
                    enemy.sprite.x += (ex / edistance) * overlap / 2;
                    enemy.sprite.y += (ey / edistance) * overlap / 2;
                }
            }
        });
    }

    takeDamage(damage) {
        this.hp -= damage;
        if (this.hp <= 0) {
            this.isDead = true;
            this.sprite.destroy();
        }
    }

    despawn() {
        this.sprite.destroy();
    }
}