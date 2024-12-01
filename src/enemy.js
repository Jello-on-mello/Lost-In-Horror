import { Graphics } from 'pixi.js';

export class Enemy {
    constructor(app, player) {
        this.app = app;
        this.player = player;
        this.sprite = new Graphics();

        // Rysowanie wroga jako prostokąt
        this.sprite.beginFill(0xff0000); // Czerwony kolor wroga
        this.sprite.drawRect(-15, -15, 30, 30); // Prostokąt 30x30
        this.sprite.endFill();

        this.hp = 5; // Zdrowie wroga
        this.speed = 1; // Prędkość poruszania się wroga

        this.respawn(); // Umieść wroga w centrum ekranu
        app.stage.addChild(this.sprite); // Dodaj wroga do sceny
    }

    respawn() {
        this.sprite.x = this.app.screen.width / 2 + 222;
        this.sprite.y = this.app.screen.height / 2 + 222;
        this.hp = 5; // Reset zdrowia
    }

    update() {
        // Obliczanie kierunku do gracza
        const dx = this.player.sprite.x - this.sprite.x;
        const dy = this.player.sprite.y - this.sprite.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Normalizacja wektora kierunku
        const directionX = dx / distance;
        const directionY = dy / distance;

        // Przesuwanie w stronę gracza
        this.sprite.x += directionX * this.speed;
        this.sprite.y += directionY * this.speed;

        // Sprawdzanie kolizji z graczem
        if (this.checkCollision(this.player.sprite)) {
            this.player.takeDamage(); // Gracz traci HP
            this.respawn(); // Wróg respawnuje się
        }

        // Sprawdzanie kolizji z pociskami
        this.player.bullets.forEach((bullet, index) => {
            if (this.checkCollision(bullet)) {
                this.hp--; // Wróg traci HP
                bullet.destroy(); // Zniszcz pocisk
                this.player.bullets.splice(index, 1); // Usuń pocisk z tablicy

                if (this.hp <= 0) {
                    this.respawn(); // Wróg respawnuje się
                }
            }
        });
    }

    checkCollision(sprite) {
        const boundsA = this.sprite.getBounds();
        const boundsB = sprite.getBounds();
        return boundsA.x + boundsA.width > boundsB.x &&
               boundsA.x < boundsB.x + boundsB.width &&
               boundsA.y + boundsA.height > boundsB.y &&
               boundsA.y < boundsB.y + boundsB.height;
    }
}
