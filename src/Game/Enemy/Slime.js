import { AnimatedSprite } from 'https://cdn.jsdelivr.net/npm/pixi.js@8.x/dist/pixi.min.mjs';

export class Slime {
    constructor(app, player, room, roomSize, textureManager, stage = 1) {
        this.app = app;
        this.player = player;
        this.room = room;
        this.roomSize = roomSize;
        this.textureManager = textureManager;
        this.stage = stage;
    
        this.hp = 1;
        this.speed = stage === 1 ? 0.25 : stage === 2 ? 0.5 : stage === 3 ? 0.75 : 1;
        this.damage = 1;
    
        this.isDead = false;
        this.wandering = false;
        this.wanderTarget = null;
    
        this.textures = {
            idle: this.textureManager.getTexture('SlimeIdle'),
            walkUp: this.textureManager.getTexture('SlimeWalkUp'),
            walkDown: this.textureManager.getTexture('SlimeWalkDown'),
            walkSide: this.textureManager.getTexture('SlimeWalkSide')
        };
    
        this.sprite = new AnimatedSprite(this.textures.idle);
        this.sprite.anchor.set(0.5);
        this.sprite.animationSpeed = 0.1;
        this.sprite.scale.set(stage === 1 ? 0.5 : stage === 2 ? 0.25 : stage === 3 ? 0.125 : 0.0625);
        this.sprite.play();
    
        let spawnX, spawnY, distance;
        do {
            spawnX = Math.random() * roomSize.width;
            spawnY = Math.random() * roomSize.height;
            const dx = this.player.sprite.x - spawnX;
            const dy = this.player.sprite.y - spawnY;
            distance = Math.sqrt(dx * dx + dy * dy);
        } while (distance < 100);
    
        this.sprite.x = spawnX;
        this.sprite.y = spawnY;
    
        // Ensure room.enemies is initialized
        if (!this.room.enemies) {
            this.room.enemies = [];
        }
    }

    update(enemies) {
        if (this.isDead) return;

        if (this.player.isDead) {
            if (!this.wandering) {
                this.startWandering();
            }
            this.wander();
        } else {
            this.chasePlayer();
        }

        enemies.forEach(enemy => {
            if (enemy !== this && !enemy.isDead) {
                const ex = enemy.sprite.x - this.sprite.x;
                const ey = enemy.sprite.y - this.sprite.y;
                const edistance = Math.sqrt(ex * ex + ey * ey);

                if (edistance < 30) {
                    const overlap = 30 - edistance;
                    this.sprite.x -= (ex / edistance) * overlap / 2;
                    this.sprite.y -= (ey / edistance) * overlap / 2;
                    enemy.sprite.x += (ex / edistance) * overlap / 2;
                    enemy.sprite.y += (ey / edistance) * overlap / 2;
                }
            }
        });
    }

    chasePlayer() {
        const dx = this.player.sprite.x - this.sprite.x;
        const dy = this.player.sprite.y - this.sprite.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 15) {
            this.player.takeDamage(this.damage);
        }

        this.sprite.x += (dx / distance) * this.speed;
        this.sprite.y += (dy / distance) * this.speed;

        if (Math.abs(dx) > Math.abs(dy)) {
            this.sprite.textures = this.textures.walkSide;
            this.sprite.scale.x = dx > 0 ? Math.abs(this.sprite.scale.x) : -Math.abs(this.sprite.scale.x);
        } else {
            this.sprite.textures = dy > 0 ? this.textures.walkDown : this.textures.walkUp;
        }
        this.sprite.play();
    }

    startWandering() {
        this.wandering = true;
        this.setWanderTarget();
    }

    setWanderTarget() {
        this.wanderTarget = {
            x: Math.random() * this.roomSize.width,
            y: Math.random() * this.roomSize.height
        };
    }

    wander() {
        if (!this.wanderTarget) {
            this.setWanderTarget();
        }

        const dx = this.wanderTarget.x - this.sprite.x;
        const dy = this.wanderTarget.y - this.sprite.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 5) {
            this.setWanderTarget();
        } else {
            this.sprite.x += (dx / distance) * this.speed;
            this.sprite.y += (dy / distance) * this.speed;

            if (Math.abs(dx) > Math.abs(dy)) {
                this.sprite.textures = this.textures.walkSide;
                this.sprite.scale.x = dx > 0 ? Math.abs(this.sprite.scale.x) : -Math.abs(this.sprite.scale.x);
            } else {
                this.sprite.textures = dy > 0 ? this.textures.walkDown : this.textures.walkUp;
            }
            this.sprite.play();
        }
    }

    onPlayerDeath() {
        this.startWandering();
    }

    takeDamage(damage) {
        this.hp -= damage;
        if (this.hp <= 0) {
            console.log('Slime died');
            this.isDead = true;
            const { x, y } = this.sprite; // Store the position before destroying the sprite
            this.sprite.destroy();
            this.split(x, y); // Pass the position to the split method
        }
    }
    
    split(x, y) {
        if (this.stage < 4) {
            for (let i = 0; i < 2; i++) {
                const newSlime = new Slime(this.app, this.player, this.room, this.roomSize, this.textureManager, this.stage + 1);
                newSlime.sprite.x = x; // Set the position to the place of death
                newSlime.sprite.y = y; // Set the position to the place of death
                
                this.room.enemies.push(newSlime); // Add the new slime to the room's enemy list
                this.app.enemyManager.enemies.push(newSlime); // Add the new slime to the enemy manager's list
                this.app.stage.addChild(newSlime.sprite); // Add the new slime to the stage
            }
        }
    }

    despawn() {
        this.sprite.destroy();
    }
}