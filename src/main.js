// main.js
import { Application, Graphics, Assets } from 'pixi.js';
import { Player } from './player.js';

(async () => {
    
    // Tworzenie aplikacji PIXI
    const Monitor = document.getElementById('myCanvas');
    const app = new Application();

    await app.init({
        view: Monitor,
        width: 1000,
        height: 500,// Wysokość aplikacji
        antialias: true, // Włącz antyaliasing dla lepszej jakości grafiki
        backgroundColor: 0x1099bb, // Kolor tła
    });

    // Create and configure a target circle for aiming
    const targetCircle = new Graphics();
    targetCircle.beginFill(0xffffff);
    targetCircle.drawCircle(0, 0, 8);
    targetCircle.endFill();
    targetCircle.lineStyle(1, 0x111111, 0.87);
    app.stage.addChild(targetCircle);

    // Enable interactivity and set hit area to the entire screen
    app.stage.interactive = true;
    app.stage.hitArea = app.screen;

    // Update target position to follow the mouse
    app.stage.on('pointermove', (e) => {
        targetCircle.position.copyFrom(e.global);
    });


    // Load assets for player gun and animations
    const RechamberAnimation = [
        '/src/Sprites/TOZ-106/TOZ-106_Fired_4.png',
        '/src/Sprites/TOZ-106/TOZ-106_Fired_1.png',
        '/src/Sprites/TOZ-106/TOZ-106_Fired_2.png',
        '/src/Sprites/TOZ-106/TOZ-106_Fired_3.png',
        '/src/Sprites/TOZ-106/TOZ-106_Fired_4.png'
    ];

    // Preload all assets
    await Assets.load(RechamberAnimation);
    const GunTexture = await Assets.load('/src/Sprites/TOZ-106/TOZ-106.png');
    const playerTexture = await Assets.load('https://pixijs.io/examples/examples/assets/bunny.png');

    // Create player instance
    const player = new Player(app, playerTexture, GunTexture, RechamberAnimation);
    app.stage.addChild(player.sprite);

    // Main game loop
    app.ticker.add(() => {
        player.update(targetCircle); // Update player
    });
})();