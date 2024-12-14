import { Container, Graphics, Text } from 'pixi.js';

export class MapManager {
    constructor(app, player) {
        this.app = app;
        this.player = player; // Reference to the player
        this.rooms = [];
        this.currentRoom = null;
        this.roomSize = { width: 720, height: 720 }; // Fixed room size
        this.roomContainer = new Container();
        this.doorCooldown = false; // Cooldown for door transitions
        this.app.stage.addChild(this.roomContainer);

        this.doorSize = 100; // Size of the doors

        this.generateMap();
        this.loadCurrentRoom(this.rooms[0]);

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
                connections: {},
                visited: false
            };
        };

        roomData[0] = generateRoom(0, 0, 0); // Starting room at the center (0, 0)

        let currentId = 1;
        let frontier = [roomData[0]];

        while (currentId < 5) {
            const currentRoom = frontier[Math.floor(Math.random() * frontier.length)];
            const availableDirections = directions.filter(dir => !currentRoom.connections[dir]);

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

            if (!existingRoom) {
                const newRoom = generateRoom(currentId, newX, newY);
                roomData[currentId] = newRoom;
                currentRoom.connections[direction] = newRoom;
                newRoom.connections[this.getOppositeDirection(direction)] = currentRoom;
                frontier.push(newRoom);
                currentId++;
            } else {
                currentRoom.connections[direction] = existingRoom;
                existingRoom.connections[this.getOppositeDirection(direction)] = currentRoom;
            }
        }

        this.rooms = Object.values(roomData);
    }

    getOppositeDirection(direction) {
        return {
            north: 'south',
            south: 'north',
            east: 'west',
            west: 'east'
        }[direction];
    }

    loadCurrentRoom(room, fromDirection = null) {
        this.currentRoom = room;
        this.roomContainer.removeChildren();

        // Draw the current room
        const roomGraphic = new Graphics();
        roomGraphic.beginFill(0x333333);
        roomGraphic.drawRect(0, 0, this.roomSize.width, this.roomSize.height); // Fixed size
        roomGraphic.endFill();

        // Add room ID text
        const roomText = new Text(`Room ${room.id}`, {
            fill: 'white',
            fontSize: 24
        });
        roomText.x = 10;
        roomText.y = 10;
        roomGraphic.addChild(roomText);

        this.roomContainer.addChild(roomGraphic);

        // Draw connections to adjacent rooms
        this.drawRoomConnections();

        // Position player near entrance if coming from another room
        if (fromDirection) {
            this.placePlayerNearEntrance(fromDirection);
        }

        // Ensure player is rendered on top of the map
        this.app.stage.addChild(this.player.sprite);
    }

    drawRoomConnections() {
        for (const direction in this.currentRoom.connections) {
            const door = new Graphics();
            door.beginFill(0xAAAAAA);

            switch (direction) {
                case 'north':
                    door.drawRect(this.roomSize.width / 2 - this.doorSize / 2, 0, this.doorSize, 20);
                    break;
                case 'south':
                    door.drawRect(this.roomSize.width / 2 - this.doorSize / 2, this.roomSize.height - 20, this.doorSize, 20);
                    break;
                case 'east':
                    door.drawRect(this.roomSize.width - 20, this.roomSize.height / 2 - this.doorSize / 2, 20, this.doorSize);
                    break;
                case 'west':
                    door.drawRect(0, this.roomSize.height / 2 - this.doorSize / 2, 20, this.doorSize);
                    break;
            }

            door.interactive = true;
            door.buttonMode = true;
            door.on('pointerdown', () => this.moveToRoom(direction));
            door.endFill();

            this.roomContainer.addChild(door);
        }
    }

    placePlayerNearEntrance(fromDirection) {
        const offset = 50; // Distance from the door

        switch (fromDirection) {
            case 'north': // Entering from the north
                this.player.sprite.x = this.roomSize.width / 2;
                this.player.sprite.y = offset;
                break;
            case 'south': // Entering from the south
                this.player.sprite.x = this.roomSize.width / 2;
                this.player.sprite.y = this.roomSize.height - offset;
                break;
            case 'east': // Entering from the east
                this.player.sprite.x = this.roomSize.width - offset;
                this.player.sprite.y = this.roomSize.height / 2;
                break;
            case 'west': // Entering from the west
                this.player.sprite.x = offset;
                this.player.sprite.y = this.roomSize.height / 2;
                break;
        }

        console.log(`Player placed near ${fromDirection} door at (${this.player.sprite.x}, ${this.player.sprite.y}).`);
    }

    moveToRoom(direction) {
        if (this.doorCooldown) {
            console.log("Door transition on cooldown. Please wait.");
            return;
        }

        const nextRoom = this.currentRoom.connections[direction];

        if (nextRoom) {
            console.log(`Moving from Room ${this.currentRoom.id} to Room ${nextRoom.id} via ${direction}`);

            // Set cooldown
            this.doorCooldown = true;
            setTimeout(() => {
                this.doorCooldown = false;
            }, 1000); // 1-second cooldown

            // Load the new room, passing the opposite direction
            this.loadCurrentRoom(nextRoom, this.getOppositeDirection(direction));
        } else {
            console.error(`No room connected to the ${direction} of Room ${this.currentRoom.id}`);
        }
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
                    height: doorHeight
                };
            case 'south':
                return {
                    x: this.roomSize.width / 2 - doorWidth / 2,
                    y: this.roomSize.height - doorHeight,
                    width: doorWidth,
                    height: doorHeight
                };
            case 'east':
                return {
                    x: this.roomSize.width - doorHeight,
                    y: this.roomSize.height / 2 - doorWidth / 2,
                    width: doorHeight,
                    height: doorWidth
                };
            case 'west':
                return {
                    x: 0,
                    y: this.roomSize.height / 2 - doorWidth / 2,
                    width: doorHeight,
                    height: doorWidth
                };
            default:
                return null;
        }
    }

    isPlayerTouchingDoor(doorBounds) {
        const playerBounds = this.player.sprite.getBounds();

        return (
            playerBounds.x < doorBounds.x + doorBounds.width &&
            playerBounds.x + playerBounds.width > doorBounds.x &&
            playerBounds.y < doorBounds.y + doorBounds.height &&
            playerBounds.y + playerBounds.height > doorBounds.y
        );
    }
}
