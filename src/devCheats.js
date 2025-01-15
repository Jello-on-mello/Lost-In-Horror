import { Player } from './player.js';
import { MapManager } from './mapManager.js';
import { Slime } from './Enemies/Slime.js';

class DevCheats {
    constructor(player, mapManager, enemyManager) {
        this.player = player;
        this.mapManager = mapManager;
        this.enemyManager = enemyManager;
        this.cheatsEnabled = false;
        this.initConsoleCommands();
    }

    initConsoleCommands() {
        window.DevCheats = () => {
            this.cheatsEnabled = true;
            console.log('DevCheats enabled. Type your cheat commands in the console.');
        };

        window.teleportToFloor = (floor) => {
            if (!this.cheatsEnabled) {
                console.log('DevCheats are not enabled.');
                return;
            }
            if (floor < 1 || floor > this.mapManager.maxFloors) {
                console.log('Invalid floor number.');
                return;
            }
            this.mapManager.currentFloor = floor;
            this.mapManager.generateMap();
            this.mapManager.loadCurrentRoom(this.mapManager.spawnRoom);
            console.log(`Teleported to floor ${floor}.`);
        };

        window.teleportToRoom = (roomType) => {
            if (!this.cheatsEnabled) {
                console.log('DevCheats are not enabled.');
                return;
            }
            const room = this.mapManager.rooms.find(r => r.type === roomType);
            if (!room) {
                console.log(`No ${roomType} found.`);
                return;
            }
            this.mapManager.loadCurrentRoom(room);
            console.log(`Teleported to ${roomType}.`);
        };

        window.regenerateMap = () => {
            if (!this.cheatsEnabled) {
                console.log('DevCheats are not enabled.');
                return;
            }
            this.mapManager.generateMap();
            this.mapManager.loadCurrentRoom(this.mapManager.spawnRoom);
            console.log('Map regenerated.');
        };

        window.killAllEnemies = () => {
            if (!this.cheatsEnabled) return console.log('DevCheats are not enabled.');
            this.enemyManager.enemies.forEach(e => e.takeDamage(999999));
            console.log('All enemies killed.');
        };
    
        window.godMode = (enable) => {
            if (!this.cheatsEnabled) return console.log('DevCheats are not enabled.');
            if (enable) {
                this.player.takeDamage = () => console.log('GodMode active.');
                console.log('GodMode enabled.');
            } else {
                delete this.player.takeDamage;
                console.log('GodMode disabled.');
            }
        };
    
        window.spawnEnemyAt = (enemyType, x, y) => {
            if (!this.cheatsEnabled) return console.log('DevCheats are not enabled.');
            let enemy;
            switch (enemyType) {
                case 'Slime':
                    enemy = new Slime(
                        this.mapManager.app, this.player, this.mapManager.currentRoom, this.mapManager.roomSize
                    );
                    break;
                // Add more cases for different enemy types if needed
                default:
                    return console.log(`Unknown enemy type: ${enemyType}`);
            }
            enemy.sprite.x = x;
            enemy.sprite.y = y;
            this.enemyManager.enemies.push(enemy);
            this.mapManager.app.stage.addChild(enemy.sprite);
            console.log(`Spawned ${enemyType} at (${x}, ${y}).`);
        };
    }
}

export default DevCheats;