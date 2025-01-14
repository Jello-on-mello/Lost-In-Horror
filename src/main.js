import { Application } from 'pixi.js';
import { Player } from './player.js';
import { MapManager } from './mapManager.js';
import { TextureManager } from './textureManager.js';
import { createCrosshair } from './crosshair.js';
import DevCheats from './devCheats.js';

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

    // Retrieve textures from TextureManager
    const GunTexture = textureManager.getTexture('GunTexture');
    const playerTexture = textureManager.getTexture('PlayerTexture');
    const RechamberAnimation = [
        textureManager.getTexture('RechamberAnimation0'),
        textureManager.getTexture('RechamberAnimation1'),
        textureManager.getTexture('RechamberAnimation2'),
        textureManager.getTexture('RechamberAnimation3'),
        textureManager.getTexture('RechamberAnimation4')
    ];

    // Create player instance
    const player = new Player(app, playerTexture, GunTexture, RechamberAnimation, textureManager);
    app.stage.addChild(player.sprite);

    // Initialize MapManager without templates
    const mapManager = new MapManager(app, player, textureManager);

    // Ensure the room and player are added correctly in Z-index order
    app.stage.addChild(mapManager.roomContainer); // Map layer
    app.stage.addChild(player.sprite);           // Player on top
    app.stage.addChild(crosshair);               // UI element on top

    // Initialize DevCheats
    new DevCheats(player, mapManager);

    // Main game loop
    app.ticker.add(() => {
        mapManager.update();
        player.update(crosshair);
    });
})();