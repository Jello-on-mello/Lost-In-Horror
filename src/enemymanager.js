import { Slime } from './Enemies/Slime';

export class EnemyManager {
    constructor(app, player, mapManager) {
        this.app = app;
        this.player = player;
        this.mapManager = mapManager;
        this.enemies = [];
        this.cooldownSet = false; // Add a flag to track cooldown state
        this.clearedRooms = new Set(); // Track cleared rooms
    }

    spawnEnemiesForRoom(room) {
        if (this.mapManager.devCheats && this.mapManager.devCheats.disableEnemySpawning) {
            console.log('Enemy spawning is disabled.');
            return;
        }

        console.log(`Spawning enemies for room: ${room.type}`); // Debugging information
    
        if (room.type === 'spawnRoom' || room.type === 'shopRoom' || this.clearedRooms.has(room.id)) return;
    
        const enemyClasses = {
            1: [Slime], // Add Slime as a floor 1 enemy
        };
    
        const bossClasses = {
            1: [Slime], // Add Slime as a floor 1 boss
        };
    
        const currentFloor = this.mapManager.currentFloor;
        const enemyClass = room.type === 'bossRoom' ? bossClasses[currentFloor] : enemyClasses[currentFloor];
        const roomSize = this.mapManager.roomSize; // Get the room size from MapManager
    
        if (room.type === 'bossRoom') {
            const boss = new enemyClass[0](this.app, this.player, room, roomSize, 3, 2); // Example speed and damage
            this.enemies.push(boss);
            this.app.stage.addChild(boss.sprite);
            console.log(`Spawned boss: ${boss.constructor.name} at (${boss.sprite.x}, ${boss.sprite.y})`); // Debugging information
        } else {
            const numEnemies = Math.floor(Math.random() * 5) + 3; // Random number of enemies between 3 and 7
            for (let i = 0; i < numEnemies; i++) {
                const randomIndex = Math.floor(Math.random() * enemyClass.length);
                const enemy = new enemyClass[randomIndex](this.app, this.player, room, roomSize, 2, 1); // Example speed and damage
                this.enemies.push(enemy);
                this.app.stage.addChild(enemy.sprite);
                console.log(`Spawned enemy: ${enemy.constructor.name} at (${enemy.sprite.x}, ${enemy.sprite.y})`); // Debugging information
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

    despawnEnemies() {
        this.enemies.forEach(enemy => enemy.despawn());
        this.enemies = [];
    }
}