import { Container, Graphics, Text } from 'pixi.js';

export class MapManager {
    constructor(app, player) {
        this.app = app;
        this.player = player; // Reference to the player
        this.rooms = [];
        this.currentRoom = null;
        this.roomSize = { width: app.screen.width, height: app.screen.height }; // Room takes full canvas size
        this.roomContainer = new Container();
        this.app.stage.addChild(this.roomContainer);

        this.doorSize = 100; // Size of the doors

        this.generateMap();
        this.loadCurrentRoom(this.rooms[0]);

        // Start listening for player movement
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

        // Create a starting room at the center (0, 0)
        roomData[0] = generateRoom(0, 0, 0);

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
        roomGraphic.drawRect(0, 0, this.roomSize.width, this.roomSize.height);
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
    }

    drawRoomConnections() {
        for (const direction in this.currentRoom.connections) {
            const door = new Graphics();
            door.beginFill(0xAAAAAA);

            switch (direction) {
                case 'north':
                    door.drawRect(this.roomSize.width / 2 - this.doorSize / 2, 0, this.doorSize, 20);
                    door.interactive = true;
                    door.buttonMode = true;
                    door.on('pointerdown', () => this.moveToRoom(direction));
                    break;
                case 'south':
                    door.drawRect(this.roomSize.width / 2 - this.doorSize / 2, this.roomSize.height - 20, this.doorSize, 20);
                    door.interactive = true;
                    door.buttonMode = true;
                    door.on('pointerdown', () => this.moveToRoom(direction));
                    break;
                case 'east':
                    door.drawRect(this.roomSize.width - 20, this.roomSize.height / 2 - this.doorSize / 2, 20, this.doorSize);
                    door.interactive = true;
                    door.buttonMode = true;
                    door.on('pointerdown', () => this.moveToRoom(direction));
                    break;
                case 'west':
                    door.drawRect(0, this.roomSize.height / 2 - this.doorSize / 2, 20, this.doorSize);
                    door.interactive = true;
                    door.buttonMode = true;
                    door.on('pointerdown', () => this.moveToRoom(direction));
                    break;
            }

            door.endFill();
            this.roomContainer.addChild(door);
        }
    }

    placePlayerNearEntrance(fromDirection) {
        const offset = 50; // Offset near the door
        switch (fromDirection) {
            case 'north':
                this.player.x = this.roomSize.width / 2;
                this.player.y = offset;
                break;
            case 'south':
                this.player.x = this.roomSize.width / 2;
                this.player.y = this.roomSize.height - offset;
                break;
            case 'east':
                this.player.x = this.roomSize.width - offset;
                this.player.y = this.roomSize.height / 2;
                break;
            case 'west':
                this.player.x = offset;
                this.player.y = this.roomSize.height / 2;
                break;
        }
    }

    moveToRoom(direction) {
        const nextRoom = this.currentRoom.connections[direction];
        if (nextRoom) {
            this.loadCurrentRoom(nextRoom, this.getOppositeDirection(direction));
        }
    }

    // Update function for player movement and door interaction
    update() {
        // Check if the player is near a door to trigger room transition
        for (const direction in this.currentRoom.connections) {
            const door = this.getDoorBounds(direction);

            // Check if the player is inside the door bounds
            if (this.isPlayerNearDoor(door)) {
                this.moveToRoom(direction);
                break; // Move only to one room at a time
            }
        }
    }

    // Get door bounds for each direction
    getDoorBounds(direction) {
        switch (direction) {
            case 'north':
                return {
                    x: this.roomSize.width / 2 - this.doorSize / 2,
                    y: 0,
                    width: this.doorSize,
                    height: 20
                };
            case 'south':
                return {
                    x: this.roomSize.width / 2 - this.doorSize / 2,
                    y: this.roomSize.height - 20,
                    width: this.doorSize,
                    height: 20
                };
            case 'east':
                return {
                    x: this.roomSize.width - 20,
                    y: this.roomSize.height / 2 - this.doorSize / 2,
                    width: 20,
                    height: this.doorSize
                };
            case 'west':
                return {
                    x: 0,
                    y: this.roomSize.height / 2 - this.doorSize / 2,
                    width: 20,
                    height: this.doorSize
                };
        }
    }

    // Check if the player is near a door (within the door bounds)
    isPlayerNearDoor(door) {
        return (
            this.player.x >= door.x &&
            this.player.x <= door.x + door.width &&
            this.player.y >= door.y &&
            this.player.y <= door.y + door.height
        );
    }
}
