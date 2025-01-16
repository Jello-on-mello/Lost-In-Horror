import { Slime } from '../Enemy/Slime.js';

export class EnemyManager {
    constructor(app, player, mapManager, textureManager) {
        this.app = app;
        this.player = player;
        this.mapManager = mapManager;
        this.textureManager = textureManager;
        this.enemies = [];
        this.cooldownSet = false; // Add a flag to track cooldown state
        this.clearedRooms = new Set(); // Track cleared rooms
    }

    spawnEnemiesForRoom(room) {
        console.log(`Spawning enemies for room: ${room.type}`); // Debugging information
    
        if (room.type === 'spawnRoom' || room.type === 'shopRoom' || this.clearedRooms.has(room.id)) return;
    
        const enemyClasses = {
            1: [{ type: Slime, cost: 4 },{ type: Slime, cost: 3 }], // Add Slime as a floor 1 enemy with a cost of 1 token
        };
    
        const bossClasses = {
            1: [{ type: Slime }], // Add Slime as a floor 1 boss
        };
    
        const currentFloor = this.mapManager.currentFloor;
        const enemyClass = room.type === 'bossRoom' ? bossClasses[currentFloor] : enemyClasses[currentFloor];
        const roomSize = this.mapManager.roomSize; // Get the room size from MapManager
    
        if (room.type === 'bossRoom') {
            // Select and spawn one random boss
            const randomIndex = Math.floor(Math.random() * bossClasses[currentFloor].length);
            const selectedBoss = bossClasses[currentFloor][randomIndex];
            const boss = new selectedBoss.type(this.app, this.player, room, roomSize, this.textureManager, 2, 1); // Example speed and damage
            this.enemies.push(boss);
            this.app.stage.addChild(boss.sprite);
            console.log(`Spawned boss: ${boss.constructor.name} at (${boss.sprite.x}, ${boss.sprite.y})`); // Debugging information
        } else {
            let enemyTokens = 10; // Set the number of tokens for regular rooms
    
            while (enemyTokens > 0) {
                const randomIndex = Math.floor(Math.random() * enemyClass.length);
                const selectedEnemy = enemyClass[randomIndex];
    
                if (enemyTokens >= selectedEnemy.cost) {
                    const enemy = new selectedEnemy.type(this.app, this.player, room, roomSize, this.textureManager, 2, 1); // Example speed and damage
                    this.enemies.push(enemy);
                    this.app.stage.addChild(enemy.sprite);
                    console.log(`Spawned enemy: ${enemy.constructor.name} at (${enemy.sprite.x}, ${enemy.sprite.y})`); // Debugging information
                    enemyTokens -= selectedEnemy.cost;
                } else {
                    break; // Stop spawning if there are not enough tokens for the selected enemy
                }
            }
        }
    }

    update() {
        this.enemies.forEach(enemy => enemy.update(this.enemies));
    
        // Remove dead enemies
        this.enemies = this.enemies.filter(enemy => !enemy.isDead);
    
        // Prevent room or floor traversal if enemies are alive
        if (this.enemies.length > 0) {
            if (!this.cooldownSet) {
                this.mapManager.doorCooldown = true;
                this.cooldownSet = true; // Set the flag to true
            }
        } else {
            if (this.cooldownSet) {
                this.mapManager.doorCooldown = false;
                this.cooldownSet = false; // Reset the flag
                this.clearedRooms.add(this.mapManager.currentRoom.id); // Mark the room as cleared
            }
        }
    }

    onPlayerDeath() {
        this.enemies.forEach(enemy => enemy.onPlayerDeath());
    }

    despawnEnemies() {
        this.enemies.forEach(enemy => enemy.despawn());
        this.enemies = [];
    }
}