// main.js
import { Application, Graphics, Assets } from 'pixi.js';
import { Player } from './player.js';
import { Enemy } from './enemy.js';

(async () => {
    // Tworzenie aplikacji PIXI
    const app = new Application();

    await app.init({
        width: window.innerWidth, // Szerokość aplikacji (dopasowana do okna przeglądarki)
        height: window.innerHeight, // Wysokość aplikacji
        antialias: true, // Włącz antyaliasing dla lepszej jakości grafiki
        backgroundColor: 0x1099bb // Kolor tła
    });

    document.body.appendChild(app.view); // Dodanie widoku aplikacji do dokumentu

    // Wczytanie tekstur gracza i inicjalizacja obiektu gracza
    const RechamberAnimation = [
        '/src/Sprites/TOZ-106_Fired_4.png',
        '/src/Sprites/TOZ-106_Fired_1.png',
        '/src/Sprites/TOZ-106_Fired_2.png',
        '/src/Sprites/TOZ-106_Fired_3.png',
        '/src/Sprites/TOZ-106_Fired_4.png'
    ];
    await Assets.load(RechamberAnimation);
    const GunTexture = await Assets.load('/src/Sprites/TOZ-106.png');
    const playerTexture = await Assets.load('https://pixijs.io/examples/examples/assets/bunny.png');
    const player = new Player(app, playerTexture, GunTexture, RechamberAnimation);

    app.stage.addChild(player.sprite);

    const targetCircle = new Graphics();
    targetCircle.beginFill(0xffffff);
    targetCircle.drawCircle(0, 0, 8);
    targetCircle.endFill();
    targetCircle.lineStyle(1, 0x111111, 0.87);
    app.stage.addChild(targetCircle);

    app.stage.interactive = true;
    app.stage.hitArea = app.screen;

    app.stage.on('pointermove', (e) => {
        targetCircle.position.copyFrom(e.global);
    });

    const enemy = new Enemy(app, player); // Tworzenie wroga

    app.ticker.add(() => {
        player.update(targetCircle);
        enemy.update(); // Aktualizacja wroga
    });
})();