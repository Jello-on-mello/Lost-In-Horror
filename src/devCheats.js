import { Player } from './player.js';
import { MapManager } from './mapManager.js';

class DevCheats {
    constructor(player, mapManager) {
        this.player = player;
        this.mapManager = mapManager;
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

        window.makePlayerUnkillable = () => {
            if (!this.cheatsEnabled) {
                console.log('DevCheats are not enabled.');
                return;
            }
            this.player.takeDamage = () => {
                console.log('Player is unkillable.');
            };
            console.log('Player is now unkillable.');
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
    }
}

export default DevCheats;