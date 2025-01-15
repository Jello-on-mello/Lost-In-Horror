import { Application } from 'pixi.js';
import { MapManager } from './Game/Manager/MapManager.js';
import { EnemyManager } from './Game/Manager/EnemyManager.js';
import CheatManager from './Game/Manager/CheatManager.js';
import { TextureManager } from './Game/Manager/textureManager.js';
import { Player } from './Game/Player/Player.js';
import { createCrosshair } from './Game/Player/crosshair.js';



(async () => {
    // Ensure the canvas element exists
    const Monitor = document.getElementById('myCanvas');
    const app = new Application();

    await app.init({
        view: Monitor,
        width: 750,
        height: 750,
        antialias: true,
        backgroundColor: 0x1099bb,
    });

    // Create and configure the crosshair
    const crosshair = createCrosshair();
    app.stage.addChild(crosshair);

    // Enable interactivity and set hit area to the entire screen
    app.stage.interactive = true;
    app.stage.hitArea = app.screen;

    // Update crosshair position to follow the mouse
    app.stage.on('pointermove', (e) => {
        crosshair.position.copyFrom(e.global);
    });

    // Initialize TextureManager and load textures
    const textureManager = new TextureManager('./src/Sprites/Grass/GRASS+_Spritesheet.png');
    await textureManager.loadTextures();

    // Initialize EnemyManager
    const enemyManager = new EnemyManager(app, null, null); // Pass null for player and mapManager initially

    // Initialize MapManager without loading the current room
    const mapManager = new MapManager(app, null, textureManager, enemyManager);

    // Set the mapManager in enemyManager
    enemyManager.mapManager = mapManager;

    // Create player instance
    const player = new Player(app, textureManager.getTexture('PlayerTexture'), textureManager.getTexture('GunTexture'), [
        textureManager.getTexture('RechamberAnimation0'),
        textureManager.getTexture('RechamberAnimation1'),
        textureManager.getTexture('RechamberAnimation2'),
        textureManager.getTexture('RechamberAnimation3'),
        textureManager.getTexture('RechamberAnimation4')
    ], textureManager);

    // Set the player in enemyManager and mapManager
    enemyManager.player = player;
    mapManager.player = player;

    // Load the current room after the player is set
    if (mapManager.spawnRoom) {
        mapManager.loadCurrentRoom(mapManager.spawnRoom);
    } else {
        console.error("No spawn room generated to load");
    }

    app.stage.addChild(player.sprite);

    // Ensure the room and player are added correctly in Z-index order
    app.stage.addChild(mapManager.roomContainer); // Map layer
    app.stage.addChild(player.sprite);           // Player on top
    app.stage.addChild(crosshair);               // UI element on top

    // Initialize CheatManager
    new CheatManager(player, mapManager, enemyManager);

    // Make enemyManager accessible from the player
    app.enemyManager = enemyManager;

    // Main game loop
    app.ticker.add(() => {
        mapManager.update();
        player.update(crosshair);
        enemyManager.update();
    });
})();