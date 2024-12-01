// player.js
import { Sprite, Graphics } from 'pixi.js';

export class Player {
    constructor(app, texture) {
        this.app = app;
        this.sprite = new Sprite(texture); // Tworzenie sprite'a gracza
        this.sprite.anchor.set(0.5); // Ustawienie punktu kotwiczenia na środek
        this.sprite.x = app.screen.width / 2; // Ustawienie pozycji gracza na środku ekranu (X)
        this.sprite.y = app.screen.height / 2; // Ustawienie pozycji gracza na środku ekranu (Y)

        this.speed = 5; // Prędkość poruszania się gracza

        // Tworzenie grafiki broni
        this.gun = new Graphics();
        this.gun.beginFill(0x000000); // Kolor broni
        this.gun.drawRect(-5, -20, 10, 30); // Prostokąt reprezentujący broń
        this.gun.endFill();
        this.sprite.addChild(this.gun); // Dodanie broni jako dziecka sprite'a gracza

        // Właściwości strzelby
        this.bullets = []; // Tablica do przechowywania pocisków
        this.currentShells = 4; // Aktualna liczba pocisków w magazynku
        this.MAX_SHELLS = 4; // Maksymalna liczba pocisków
        this.isReloading = false; // Flaga wskazująca, czy przeładowanie trwa
        this.shotCooldown = 500; // Czas oczekiwania pomiędzy strzałami w milisekundach
        this.lastShotTime = 0; // Czas ostatniego strzału
        this.keys = { up: false, down: false, left: false, right: false, shoot: false, reload: false }; // Stan klawiszy

        this.setupControls(); // Inicjalizacja sterowania
    }

    setupControls() {
        // Obsługa naciśnięcia klawiszy
        window.addEventListener('keydown', (e) => {
            if (e.code === 'ArrowUp') this.keys.up = true;
            if (e.code === 'ArrowDown') this.keys.down = true;
            if (e.code === 'ArrowLeft') this.keys.left = true;
            if (e.code === 'ArrowRight') this.keys.right = true;
            if (e.code === 'Space') this.keys.shoot = true; // Strzelanie za pomocą spacji
            if (e.code === 'KeyR') this.keys.reload = true; // Przeładowanie za pomocą 'R'
        });

        // Obsługa zwolnienia klawiszy
        window.addEventListener('keyup', (e) => {
            if (e.code === 'ArrowUp') this.keys.up = false;
            if (e.code === 'ArrowDown') this.keys.down = false;
            if (e.code === 'ArrowLeft') this.keys.left = false;
            if (e.code === 'ArrowRight') this.keys.right = false;
            if (e.code === 'Space') this.keys.shoot = false; // Przestanie strzelać
            if (e.code === 'KeyR') this.keys.reload = false; // Przestanie przeładowywać
        });
    }

    // Funkcja odpowiedzialna za strzelanie z broni
    shootShotgun() {
        if (this.currentShells <= 0 || this.isReloading) return; // Brak amunicji lub przeładowanie w toku

        const spreadAngle = 0.261799; // Kąt rozrzutu strzału w radianach (~15 stopni)
        const numberOfBullets = 5; // Liczba pocisków w jednym strzale
        const shotDelay = 10; // Opóźnienie pomiędzy strzałami w milisekundach

        for (let i = 0; i < numberOfBullets; i++) {
            setTimeout(() => {
                const bullet = new Graphics();
                bullet.beginFill(0xff0000); // Kolor pocisku
                bullet.drawRect(-2, -5, 4, 10); // Kształt pocisku
                bullet.endFill();

                const offsetX = Math.cos(this.gun.rotation) * 30; // Pozycja początkowa pocisku (X)
                const offsetY = Math.sin(this.gun.rotation) * 30; // Pozycja początkowa pocisku (Y)

                bullet.x = this.sprite.x + this.gun.x + offsetX;
                bullet.y = this.sprite.y + this.gun.y + offsetY;

                const randomAngle = this.gun.rotation + (Math.random() - 0.5) * spreadAngle;
                bullet.vx = Math.cos(randomAngle) * 5; // Prędkość pocisku w osi X
                bullet.vy = Math.sin(randomAngle) * 5; // Prędkość pocisku w osi Y

                this.app.stage.addChild(bullet); // Dodanie pocisku do sceny
                this.bullets.push(bullet); // Przechowywanie pocisku w tablicy
            }, i * shotDelay);
        }

        this.currentShells--; // Zmniejsz licznik pocisków
    }

    // Funkcja odpowiedzialna za przeładowanie broni
    reload() {
        if (!this.isReloading && this.currentShells < this.MAX_SHELLS) {
            this.isReloading = true;
            setTimeout(() => {
                this.currentShells = this.MAX_SHELLS; // Uzupełnij magazynek
                this.isReloading = false; // Zakończ przeładowanie
            }, 2000); // Czas przeładowania: 2 sekundy
        }
    }

    // Funkcja aktualizująca rotację broni w kierunku celu
    updateGunRotation(targetCircle) {
        const dx = targetCircle.x - this.sprite.x;
        const dy = targetCircle.y - this.sprite.y;
        this.gun.rotation = Math.atan2(dy, dx); // Obliczanie kąta
    }

    // Główna funkcja aktualizacji gracza
    update(targetCircle) {
        if (this.keys.up) this.sprite.y -= this.speed; // Ruch do góry
        if (this.keys.down) this.sprite.y += this.speed; // Ruch w dół
        if (this.keys.left) this.sprite.x -= this.speed; // Ruch w lewo
        if (this.keys.right) this.sprite.x += this.speed; // Ruch w prawo

        // Zapobiegaj wychodzeniu poza ekran
        this.sprite.x = Math.max(0, Math.min(this.sprite.x, this.app.screen.width));
        this.sprite.y = Math.max(0, Math.min(this.sprite.y, this.app.screen.height));

        // Strzelanie
        if (this.keys.shoot && Date.now() - this.lastShotTime >= this.shotCooldown) {
            this.shootShotgun();
            this.lastShotTime = Date.now(); // Zapisz czas strzału
        }

        // Przeładowanie
        if (this.keys.reload) {
            this.reload();
        }

        this.updateGunRotation(targetCircle); // Aktualizuj rotację broni

        // Aktualizacja pozycji pocisków
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            bullet.x += bullet.vx;
            bullet.y += bullet.vy;

            // Usunięcie pocisków, które wyszły poza ekran
            if (bullet.x < 0 || bullet.x > this.app.screen.width || bullet.y < 0 || bullet.y > this.app.screen.height) {
                this.bullets.splice(i, 1);
                bullet.destroy(); // Usuwanie obiektu pocisku
            }
        }
    }
}
