import { Container, Graphics, Text, TilingSprite } from 'pixi.js';

export class MapManager {
    constructor(app, player, textureManager) {
        this.app = app;
        this.player = player;
        this.textureManager = textureManager;
        this.rooms = [];
        this.currentRoom = null;
        this.roomSize = { width: 720, height: 720 };
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
        if (this.spawnRoom) {
            this.loadCurrentRoom(this.spawnRoom);
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

        roomData[0] = generateRoom(0, 0, 0);

        let currentId = 1;
        let frontier = [roomData[0]];

        while (currentId < 5) {
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
    
        this.player.despawnBullets();
    
        const roomShape = this.getRoomShape(room);
    
        const texture = this.textureManager.getTexture(roomShape);
        const tiledSprite = new TilingSprite(texture, this.roomSize.width, this.roomSize.height);
        this.roomContainer.addChild(tiledSprite);
    
        console.log(`Room ${room.id} Floor ${this.currentFloor} ${room.isSpecial ? room.type.toUpperCase().replace('ROOM', '') : ''} Shape: ${roomShape}`);
    
        this.drawRoomConnections();
    
        if (fromDirection) {
            this.placePlayerNearEntrance(fromDirection);
        }
    
        this.app.stage.addChild(this.player.sprite);
    
        this.doorCooldown = true;
        setTimeout(() => {
            this.doorCooldown = false;
        }, 1000);
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
        if (this.currentFloor >= this.maxFloors) {
            console.log("Congratulations! You've won the game!");
            return;
        }

        this.currentFloor++;
        this.generateMap();
        this.loadCurrentRoom(this.spawnRoom);
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