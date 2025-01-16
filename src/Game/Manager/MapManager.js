import { Container, TilingSprite , Graphics,Sprite } from 'https://cdn.jsdelivr.net/npm/pixi.js@8.x/dist/pixi.min.mjs';
import { EnemyManager } from './EnemyManager.js';

export class MapManager {
    constructor(app, player, textureManager, enemyManager) {
        this.app = app;
        this.player = player;
        this.textureManager = textureManager;
        this.enemyManager = enemyManager; // Assign enemyManager
        this.rooms = [];
        this.currentRoom = null;
        this.roomSize = { width: 750, height: 750 };
        this.roomContainer = new Container();
        this.doorCooldown = false;
        this.spawnRoom = null;
        this.shopRoom = null;
        this.bossRoom = null;
        this.currentFloor = 1;
        this.maxFloors = 4;
        this.app.stage.addChild(this.roomContainer);

        this.doorSize = 100;

        this.generateMap();
        app.ticker.add(this.update.bind(this));
    }

    generateMap() {
        const directions = ['north', 'south', 'east', 'west'];
        const roomData = {};

        const generateRoom = (id, x, y, type = 'default') => {
            return {
                id,
                x,
                y,
                connections: { north: null, south: null, east: null, west: null },
                visited: false,
                isSpecial: false,
                type,
                grid: Array.from({ length: 10 }, () =>
                    Array.from({ length: 10 }, () => ({
                        tile: "tile055",
                        decoration: "none",
                        enemy_spawn: false
                    }))
                )
            };
        };

        roomData[0] = generateRoom(0, 0, 0);
        let currentId = 1;
        let frontier = [roomData[0]];

        while (currentId < 6) {
            const currentRoom = frontier[Math.floor(Math.random() * frontier.length)];
            const availableDirections = directions.filter(
                dir => !currentRoom.connections[dir]
            );

            if (availableDirections.length === 0) {
                frontier = frontier.filter(r => r.id !== currentRoom.id);
                continue;
            }

            const direction = availableDirections[Math.floor(Math.random() * availableDirections.length)];
            let newX = currentRoom.x;
            let newY = currentRoom.y;

            if (direction === 'north') newY -= 1;
            if (direction === 'south') newY += 1;
            if (direction === 'east') newX += 1;
            if (direction === 'west') newX -= 1;

            const existingRoom = Object.values(roomData).find(r => r.x === newX && r.y === newY);
            if (existingRoom) {
                if (!existingRoom.connections[this.getOppositeDirection(direction)]) {
                    currentRoom.connections[direction] = existingRoom;
                    existingRoom.connections[this.getOppositeDirection(direction)] = currentRoom;
                }
            } else {
                const newRoom = generateRoom(currentId, newX, newY);
                roomData[currentId] = newRoom;
                currentRoom.connections[direction] = newRoom;
                newRoom.connections[this.getOppositeDirection(direction)] = currentRoom;
                frontier.push(newRoom);
                currentId++;
            }
        }

        this.rooms = Object.values(roomData);

        this.addSpecialRoom('spawnRoom');
        this.addSpecialRoom('shopRoom');
        this.addSpecialRoom('bossRoom');

        this.validateConnections();
    }

    moveToRoom(direction) {
        if (!this.currentRoom || !this.currentRoom.connections[direction]) {
            console.error(`Cannot move to room in direction: ${direction}`);
            return;
        }
    
        if (this.enemyManager.enemies.length > 0) {
            console.log('Cannot move to another room while enemies are alive.');
            return;
        }
    
        const nextRoom = this.currentRoom.connections[direction];
        this.loadCurrentRoom(nextRoom, direction);
    }

    addSpecialRoom(type) {
        const directions = ['north', 'south', 'east', 'west'];
        const nonSpecialRooms = this.rooms.filter(room => !room.isSpecial && Object.values(room.connections).filter(conn => conn).length < 4 && !room.hasSpecialConnection);
    
        if (nonSpecialRooms.length === 0) {
            console.error(`No available rooms to connect the ${type}`);
            return;
        }
    
        const targetRoom = nonSpecialRooms[Math.floor(Math.random() * nonSpecialRooms.length)];
        const availableDirections = directions.filter(dir => !targetRoom.connections[dir]);
    
        if (availableDirections.length === 0) {
            console.error(`No available directions to connect the ${type}`);
            return;
        }
    
        const direction = availableDirections[Math.floor(Math.random() * availableDirections.length)];
        let newX = targetRoom.x;
        let newY = targetRoom.y;
    
        if (direction === 'north') newY -= 1;
        if (direction === 'south') newY += 1;
        if (direction === 'east') newX += 1;
        if (direction === 'west') newX -= 1;
    
        const newRoom = {
            id: this.rooms.length,
            x: newX,
            y: newY,
            connections: { north: null, south: null, east: null, west: null },
            visited: false,
            isSpecial: true,
            type,
            grid: Array.from({ length: 10 }, () =>
                Array.from({ length: 10 }, () => ({
                    tile: "tile055",
                    decoration: "none",
                    enemy_spawn: false
                }))
            )
        };
    
        targetRoom.connections[direction] = newRoom;
        newRoom.connections[this.getOppositeDirection(direction)] = targetRoom;
        targetRoom.hasSpecialConnection = true; // Mark the target room as having a special connection
        newRoom.hasSpecialConnection = true; // Mark the new special room as having a special connection
        this.rooms.push(newRoom);
    
        if (type === 'spawnRoom') this.spawnRoom = newRoom;
        if (type === 'shopRoom') this.shopRoom = newRoom;
        if (type === 'bossRoom') this.bossRoom = newRoom;
    }

    validateConnections() {
        this.rooms.forEach(room => {
            for (const dir in room.connections) {
                const connectedRoom = room.connections[dir];
                if (
                    connectedRoom &&
                    connectedRoom.connections[this.getOppositeDirection(dir)] !== room
                ) {
                    console.error(
                        `Connection mismatch: Room ${room.id} has ${dir} pointing to Room ${connectedRoom.id}, but the reverse is not true.`
                    );
                    connectedRoom.connections[this.getOppositeDirection(dir)] = room;
                }
            }
        });
    }

    loadCurrentRoom(room, fromDirection = null) {
        this.currentRoom = room;
        this.roomContainer.removeChildren();
    
        this.player.despawnBullets();
    
        const tileMap = {
            1: "tile055",
            2: "tile058",
            3: "tile049",
            4: "tile052"
        };
    
        const tile = tileMap[this.currentFloor] || "tile055";
    
        const tiledSprite = new TilingSprite(
            this.textureManager.getTexture(tile),
            this.roomSize.width,
            this.roomSize.height
        );
        this.roomContainer.addChild(tiledSprite);
    
        console.log(
            `Room ID: ${room.id}, Floor: ${this.currentFloor}, Type: ${room.type.toUpperCase()}, Shape: ${
                this.getRoomShape(room)
            }`
        );
    
        if (!room.decorations) {
            room.decorations = this.generateDecorationsForRoom();
        }
        this.addDecorationsToRoom(room.decorations);
    
        this.drawRoomConnections(); // Ensure doors are added after decorations
    
        if (fromDirection) {
            this.placePlayerNearEntrance(fromDirection);
        }
    
        this.app.stage.addChild(this.player.sprite);
    
        this.doorCooldown = true;
        setTimeout(() => {
            this.doorCooldown = false;
        }, 1000);

        // Call spawnEnemiesForRoom when a room is loaded
        this.enemyManager.spawnEnemiesForRoom(room);
    }

    generateDecorationsForRoom() {
        const decorations = [];
        const decorationTiles = {
            1: ["tile185","tile186","tile195","tile167", "tile168", "tile169", "tile170", "tile171", "tile172", "tile173", "tile174", "tile177", "tile178", "tile179"],
            2: ["tile180", "tile181", "tile182", "tile183", "tile184", "tile175", "tile176"],
            3: ["tile187", "tile188", "tile189","tile198", "tile199", "tile200", "tile201","tile203", "tile204", "tile205"],
            4: ["tile210", "tile211", "tile212", "tile213", "tile214", "tile215"]
        };
    
        const tiles = decorationTiles[this.currentFloor] || [];
        const numDecorations = Math.floor(Math.random() * 15); // Increase the number of decorations
    
        for (let i = 0; i < numDecorations; i++) {
            const tile = tiles[Math.floor(Math.random() * tiles.length)];
            const x = Math.floor(Math.random() * (this.roomSize.width - 30)) + 15; // Ensure decoration is within room boundaries
            const y = Math.floor(Math.random() * (this.roomSize.height - 30)) + 15; // Ensure decoration is within room boundaries
            decorations.push({ tile, x, y });
        }
    
        return decorations;
    }

    addDecorationsToRoom(decorations) {
        const decorationSprites = [];
    
        decorations.forEach(decoration => {
            const sprite = new Sprite(this.textureManager.getTexture(decoration.tile));
            sprite.x = decoration.x;
            sprite.y = decoration.y;
    
            // Check for overlapping decorations
            let overlap = false;
            for (const existingSprite of decorationSprites) {
                if (this.isOverlapping(sprite, existingSprite)) {
                    overlap = true;
                    break;
                }
            }
    
            if (!overlap) {
                this.roomContainer.addChild(sprite);
                decorationSprites.push(sprite);
            }
        });
    }
    
    isOverlapping(sprite1, sprite2) {
        const bounds1 = sprite1.getBounds();
        const bounds2 = sprite2.getBounds();
    
        return (
            bounds1.x < bounds2.x + bounds2.width &&
            bounds1.x + bounds1.width > bounds2.x &&
            bounds1.y < bounds2.y + bounds2.height &&
            bounds1.y + bounds1.height > bounds2.y
        );
    }
    
    getRoomShape(room) {
        const connections = Object.values(room.connections).filter(conn => conn).length;
        if (connections === 1) return 'DeadEnd';
        if (connections === 2) {
            if (room.connections.north && room.connections.south) return 'Vertical';
            if (room.connections.east && room.connections.west) return 'Horizontal';
            return 'LShape';
        }
        if (connections === 3) return 'TShape';
        if (connections === 4) return 'CrossShape';
        return 'Default';
    }

    drawRoomConnections() {
        for (const direction in this.currentRoom.connections) {
            if (!this.currentRoom.connections[direction]) continue;

            const door = new Graphics();
            door.beginFill(0xaaaaaa);

            switch (direction) {
                case 'north':
                    door.drawRect(
                        this.roomSize.width / 2 - this.doorSize / 2,
                        0,
                        this.doorSize,
                        20
                    );
                    break;
                case 'south':
                    door.drawRect(
                        this.roomSize.width / 2 - this.doorSize / 2,
                        this.roomSize.height - 20,
                        this.doorSize,
                        20
                    );
                    break;
                case 'east':
                    door.drawRect(
                        this.roomSize.width - 20,
                        this.roomSize.height / 2 - this.doorSize / 2,
                        20,
                        this.doorSize
                    );
                    break;
                case 'west':
                    door.drawRect(
                        0,
                        this.roomSize.height / 2 - this.doorSize / 2,
                        20,
                        this.doorSize
                    );
                    break;
            }

            const connectedRoom = this.currentRoom.connections[direction];
            if (connectedRoom) {
                switch (connectedRoom.type) {
                    case 'spawnRoom':
                        door.tint = 0x00ff00;
                        break;
                    case 'shopRoom':
                        door.tint = 0xffff00;
                        break;
                    case 'bossRoom':
                        door.tint = 0xff0000;
                        break;
                    default:
                        door.tint = 0xffffff;
                        break;
                }
            }

            door.interactive = true;
            door.buttonMode = true;
            door.on('pointerdown', () => this.moveToRoom(direction));
            door.endFill();

            this.roomContainer.addChild(door);
        }

        if (this.currentRoom.type === 'bossRoom' && this.currentFloor < this.maxFloors) {
            const nextFloorDoor = new Graphics();
            nextFloorDoor.beginFill(0xff0000);
            nextFloorDoor.drawRect(
                this.roomSize.width / 2 - this.doorSize / 2,
                this.roomSize.height / 2 - this.doorSize / 2,
                this.doorSize,
                this.doorSize
            );
            nextFloorDoor.endFill();
            nextFloorDoor.interactive = true;
            nextFloorDoor.buttonMode = true;
            nextFloorDoor.on('pointerdown', () => this.moveToNextFloor());
            this.roomContainer.addChild(nextFloorDoor);
        }
    }

    moveToNextFloor() {
        this.currentFloor++;
        this.generateMap();
        this.loadCurrentRoom(this.spawnRoom);
    }

    getNextFloorDoorBounds() {
        if (this.currentRoom.type !== 'bossRoom' || this.currentFloor >= this.maxFloors) {
            return null;
        }
    
        const doorSize = this.doorSize;
        return {
            x: this.roomSize.width / 2 - doorSize / 2,
            y: this.roomSize.height / 2 - doorSize / 2,
            width: doorSize,
            height: doorSize,
        };
    }

    placePlayerNearEntrance(fromDirection) {
        const offset = 50;

        switch (fromDirection) {
            case 'north':
                this.player.sprite.x = this.roomSize.width / 2;
                this.player.sprite.y = this.roomSize.height - offset;
                break;
            case 'south':
                this.player.sprite.x = this.roomSize.width / 2;
                this.player.sprite.y = offset;
                break;
            case 'east':
                this.player.sprite.x = offset;
                this.player.sprite.y = this.roomSize.height / 2;
                break;
            case 'west':
                this.player.sprite.x = this.roomSize.width - offset;
                this.player.sprite.y = this.roomSize.height / 2;
                break;
        }

        console.log(
            `Player placed near ${fromDirection} door at (${this.player.sprite.x}, ${this.player.sprite.y}).`
        );
    }

    update() {
        if (!this.currentRoom) {
            console.error("No current room loaded.");
            return;
        }

        if (this.doorCooldown) {
            return;
        }

        for (const direction in this.currentRoom.connections) {
            const doorBounds = this.getDoorBounds(direction);

            if (!doorBounds) {
                console.error(`Invalid door bounds for direction: ${direction}`);
                continue;
            }

            if (this.isPlayerTouchingDoor(doorBounds)) {
                this.moveToRoom(direction);
                break;
            }
        }

        // Check if the player is touching the next floor door
        const nextFloorDoorBounds = this.getNextFloorDoorBounds();
        if (nextFloorDoorBounds && this.isPlayerTouchingDoor(nextFloorDoorBounds)) {
            this.moveToNextFloor();
        }
    }

    getDoorBounds(direction) {
        const doorWidth = this.doorSize;
        const doorHeight = 20;

        switch (direction) {
            case 'north':
                return {
                    x: this.roomSize.width / 2 - doorWidth / 2,
                    y: 0,
                    width: doorWidth,
                    height: doorHeight,
                };
            case 'south':
                return {
                    x: this.roomSize.width / 2 - doorWidth / 2,
                    y: this.roomSize.height - doorHeight,
                    width: doorWidth,
                    height: doorHeight,
                };
            case 'east':
                return {
                    x: this.roomSize.width - doorHeight,
                    y: this.roomSize.height / 2 - doorWidth / 2,
                    width: doorHeight,
                    height: doorWidth,
                };
            case 'west':
                return {
                    x: 0,
                    y: this.roomSize.height / 2 - doorWidth / 2,
                    width: doorHeight,
                    height: doorWidth,
                };
        }
    }

    getOppositeDirection(direction) {
        const opposites = {
            north: 'south',
            south: 'north',
            east: 'west',
            west: 'east'
        };
        return opposites[direction];
    }

    isPlayerTouchingDoor(doorBounds) {
        const playerBounds = this.player.sprite.getBounds();

        return (
            playerBounds.x + playerBounds.width > doorBounds.x &&
            playerBounds.x < doorBounds.x + doorBounds.width &&
            playerBounds.y + playerBounds.height > doorBounds.y &&
            playerBounds.y < doorBounds.y + doorBounds.height
        );
    }
}