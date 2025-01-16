import { Container, Graphics, Sprite, Text, TextStyle } from 'https://cdn.jsdelivr.net/npm/pixi.js@8.x/dist/pixi.min.mjs';

export class LoadingScreen {
    constructor(app, textureManager) {
        this.app = app;
        this.textureManager = textureManager;
        this.container = new Container();
        this.progressBar = new Graphics();
        this.spiralContainer = new Container();
        this.playerSprite = new Sprite();
        this.loadedSprites = [];
        this.loadingText = new Text('Loading Game...', new TextStyle({
            fontFamily: 'Arial',
            fontSize: 50,
            fill: '#ffffff'
        }));

        this.init();
    }

    init() {
        // Create a black background
        const background = new Graphics();
        background.beginFill(0x000000);
        background.drawRect(0, 0, this.app.screen.width, this.app.screen.height);
        background.endFill();
        this.container.addChild(background);

        // Create a progress bar
        this.progressBar.beginFill(0xffffff);
        this.progressBar.drawRect(0, this.app.screen.height - 50, 0, 20);
        this.progressBar.endFill();
        this.container.addChild(this.progressBar);

        // Create a spinning spiral
        this.spiralContainer.x = this.app.screen.width / 2;
        this.spiralContainer.y = this.app.screen.height / 2;
        this.container.addChild(this.spiralContainer);

        // Create a player sprite
        this.playerSprite.anchor.set(0.5);
        this.spiralContainer.addChild(this.playerSprite);

        // Add loading text
        this.loadingText.anchor.set(0.5);
        this.loadingText.x = this.app.screen.width / 2;
        this.loadingText.y = 50;
        this.container.addChild(this.loadingText);

        this.app.stage.addChild(this.container);
    }

    updateProgress(progress) {
        const barWidth = this.app.screen.width * progress;
        this.progressBar.clear();
        this.progressBar.beginFill(0xffffff);
        this.progressBar.drawRect(0, this.app.screen.height - 50, barWidth, 20);
        this.progressBar.endFill();
    }

    addLoadedSprite(sprite) {
        this.loadedSprites.push(sprite);
        this.spiralContainer.addChild(sprite);
    }

    update(delta) {
        // Rotate the spiral container
        this.spiralContainer.rotation += 0.05 * delta;

        // Position loaded sprites in a spiral pattern
        const angleStep = (Math.PI * 2) / this.loadedSprites.length;
        this.loadedSprites.forEach((sprite, index) => {
            const angle = index * angleStep;
            const radius = 50 + index * 10;
            sprite.x = Math.cos(angle) * radius;
            sprite.y = Math.sin(angle) * radius;
        });

        // Rotate the player sprite
        this.playerSprite.rotation += 0.1 * delta;
    }

    hide() {
        this.app.stage.removeChild(this.container);
    }
}