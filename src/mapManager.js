import { Container, Graphics, Text } from 'pixi.js';
import * as PIXI from 'pixi.js';

export class MapManager {
    constructor(app, player, textureManager) {
        this.app = app;
        this.player = player; // Reference to the player
        this.textureManager = textureManager; // Reference to the texture manager
        this.rooms = [];
        this.currentRoom = null;
        this.roomSize = { width: 720, height: 720 }; // Fixed room size
        this.roomContainer = new Container();
        this.doorCooldown = false; // Cooldown for door transitions
        this.spawnRoom = null;
        this.shopRoom = null;
        this.bossRoom = null;
        this.currentFloor = 1;
        this.maxFloors = 4;
        this.app.stage.addChild(this.roomContainer);

        this.doorSize = 100; // Size of the doors

        this.generateMap();
        if (this.spawnRoom) {
            this.loadCurrentRoom(this.spawnRoom); // Load the spawn room first
        } else {
            console.error("No spawn room generated to load");
        }

        app.ticker.add(this.update.bind(this));
    }

    generateMap() {
        const directions = ['north', 'south', 'east', 'west'];
        const roomData = {};
    
        const generateRoom = (id, x, y) => {
            return {
                id,
                x,
                y,
                connections: { north: null, south: null, east: null, west: null },
                visited: false,
                isSpecial: false,
                type: null,
            };
        };
    
        roomData[0] = generateRoom(0, 0, 0); // Starting room at the center (0, 0)
    
        let currentId = 1;
        let frontier = [roomData[0]];
    
        while (currentId < 5) {
            const currentRoom = frontier[Math.floor(Math.random() * frontier.length)];
            const availableDirections = directions.filter(
                dir => !currentRoom.connections[dir] // Check if direction is already connected
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
                // Ensure bi-directional connection only if both sides are valid
                if (!existingRoom.connections[this.getOppositeDirection(direction)]) {
                    currentRoom.connections[direction] = existingRoom;
                    existingRoom.connections[this.getOppositeDirection(direction)] = currentRoom;
                }
            } else {
                // Create a new room
                const newRoom = generateRoom(currentId, newX, newY);
                roomData[currentId] = newRoom;
                currentRoom.connections[direction] = newRoom;
                newRoom.connections[this.getOppositeDirection(direction)] = currentRoom;
                frontier.push(newRoom);
                currentId++;
            }
        }
    
        this.rooms = Object.values(roomData);
    
        // Add special rooms
        this.addSpecialRoom('spawnRoom');
        this.addSpecialRoom('shopRoom');
        this.addSpecialRoom('bossRoom');
    
        // Validate connections
        this.validateConnections();
    }
    
    addSpecialRoom(type) {
        const directions = ['north', 'south', 'east', 'west'];
        const nonSpecialRooms = this.rooms.filter(room => !room.isSpecial && Object.values(room.connections).filter(conn => conn).length < 4);
    
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
        };
    
        targetRoom.connections[direction] = newRoom;
        newRoom.connections[this.getOppositeDirection(direction)] = targetRoom;
        this.rooms.push(newRoom);

        // Assign the special room to the corresponding property
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
                    // Fix the connection mismatch
                    connectedRoom.connections[this.getOppositeDirection(dir)] = room;
                }
            }
        });
    }

    moveToRoom(direction) {
        if (!this.currentRoom) {
            console.error("Current room is not defined");
            return;
        }

        if (!this.currentRoom.connections) {
            console.error("Current room has no connections");
            return;
        }

        const targetRoom = this.currentRoom.connections[direction];
        if (!targetRoom) {
            console.error(`No room in the ${direction} direction`);
            return;
        }

        // Directly load the target room without animation
        this.loadCurrentRoom(targetRoom, direction);
    }

    getOppositeDirection(direction) {
        const opposites = {
            north: 'south',
            south: 'north',
            east: 'west',
            west: 'east',
        };
        return opposites[direction];
    }

    loadCurrentRoom(room, fromDirection = null) {
    this.currentRoom = room;
    this.roomContainer.removeChildren();

    // Draw the current room with textures
    const floorTextures = {
        1: 'DestroyedGreenTallGrass',
        2: 'DestroyedDarkGreenTallGrass',
        3: 'DestroyedGoldTallGrass',
        4: 'DestroyedCrimsonTallGrass'
    };
    const textureName = floorTextures[this.currentFloor];
    const texture = this.textureManager.getTexture(textureName);

    // Create a tiled sprite for the room background
    const tiledSprite = new PIXI.TilingSprite(texture, this.roomSize.width, this.roomSize.height);
    this.roomContainer.addChild(tiledSprite);

    // Add room ID text
    let roomTextContent = `Room ${room.id} Floor ${this.currentFloor}`;
    if (room.isSpecial) {
        roomTextContent += ` ${room.type.toUpperCase().replace('ROOM', '')}`;
    }
    const roomText = new Text(roomTextContent, {
        fill: 'white',
        fontSize: 24,
    });
    roomText.x = 10;
    roomText.y = 10;
    this.roomContainer.addChild(roomText);

    // Draw connections to adjacent rooms
    this.drawRoomConnections();

    // Position player near entrance if coming from another room
    if (fromDirection) {
        this.placePlayerNearEntrance(fromDirection);
    }

    // Ensure player is rendered on top of the map
    this.app.stage.addChild(this.player.sprite);

    // Set door cooldown to prevent immediate re-entry
    this.doorCooldown = true;
    setTimeout(() => {
        this.doorCooldown = false;
    }, 1000); // 1 second cooldown
}

    drawRoomConnections() {
        for (const direction in this.currentRoom.connections) {
            if (!this.currentRoom.connections[direction]) continue; // Skip non-existent connections

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

            // Apply tint based on the room type
            const connectedRoom = this.currentRoom.connections[direction];
            if (connectedRoom) {
                switch (connectedRoom.type) {
                    case 'spawnRoom':
                        door.tint = 0x00ff00; // Green tint for spawn room
                        break;
                    case 'shopRoom':
                        door.tint = 0xffff00; // Yellow tint for shop room
                        break;
                    case 'bossRoom':
                        door.tint = 0xff0000; // Red tint for boss room
                        break;
                    default:
                        door.tint = 0xffffff; // Default light tint for normal rooms
                        break;
                }
            }

            door.interactive = true;
            door.buttonMode = true;
            door.on('pointerdown', () => this.moveToRoom(direction));
            door.endFill();

            this.roomContainer.addChild(door);
        }

        // Add a special door for the boss room to go to the next floor
        if (this.currentRoom.type === 'bossRoom' && this.currentFloor < this.maxFloors) {
            const nextFloorDoor = new Graphics();
            nextFloorDoor.beginFill(0xff0000); // Red color for the next floor door
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
        if (this.currentFloor >= this.maxFloors) {
            console.log("Congratulations! You've won the game!");
            return;
        }

        this.currentFloor++;
        this.generateMap();
        this.loadCurrentRoom(this.spawnRoom);
    }

    placePlayerNearEntrance(fromDirection) {
        const offset = 50; // Distance from the door

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
            return; // Skip door checks if cooldown is active
        }

        for (const direction in this.currentRoom.connections) {
            const doorBounds = this.getDoorBounds(direction);

            if (!doorBounds) {
                console.error(`Invalid door bounds for direction: ${direction}`);
                continue;
            }

            if (this.isPlayerTouchingDoor(doorBounds)) {
                this.moveToRoom(direction);
                break; // Prevent multiple transitions in one frame
            }
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