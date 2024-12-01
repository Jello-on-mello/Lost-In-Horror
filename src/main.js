// main.js
import { Application, Graphics, Assets } from 'pixi.js';
import { Player } from './player.js';

(async () => {
    // Tworzenie aplikacji PIXI
    const app = new Application({
        width: window.innerWidth, // Szerokość aplikacji (dopasowana do okna przeglądarki)
        height: window.innerHeight, // Wysokość aplikacji
        antialias: true, // Włącz antyaliasing dla lepszej jakości grafiki
        backgroundColor: 0x1099bb // Kolor tła
    });

    document.body.appendChild(app.view); // Dodanie widoku aplikacji do dokumentu

    // Wczytanie tekstury gracza i inicjalizacja obiektu gracza
    const playerTexture = await Assets.load('https://pixijs.io/examples/examples/assets/bunny.png');
    const player = new Player(app, playerTexture);

    app.stage.addChild(player.sprite); // Dodanie gracza do sceny

    // Tworzenie okręgu celu
    const targetCircle = new Graphics();
    targetCircle.beginFill(0xffffff); // Kolor wypełnienia okręgu
    targetCircle.drawCircle(0, 0, 8); // Rysowanie okręgu
    targetCircle.endFill();
    targetCircle.lineStyle(1, 0x111111, 0.87); // Obramowanie okręgu
    app.stage.addChild(targetCircle); // Dodanie okręgu do sceny

    // Ustawienie interakcji dla sceny
    app.stage.interactive = true;
    app.stage.hitArea = app.screen; // Ustawienie obszaru aktywnego na cały ekran

    // Obsługa ruchu celu (poruszanie wskaźnikiem)
    app.stage.on('pointermove', (e) => {
        targetCircle.position.copyFrom(e.global);
    });

    // Dodanie funkcji aktualizacji do głównej pętli gry
    app.ticker.add(() => {
        player.update(targetCircle); // Aktualizacja gracza i broni
    });
})();
