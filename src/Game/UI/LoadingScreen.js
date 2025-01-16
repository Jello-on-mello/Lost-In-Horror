import { Container, Graphics, Sprite, Text, TextStyle } from 'https://cdn.jsdelivr.net/npm/pixi.js@8.x/dist/pixi.min.mjs';

export class LoadingScreen {
    constructor(app, textureManager) {
        this.app = app;
        this.textureManager = textureManager;
        this.container = new Container();
        this.progressBar = new Graphics();
        this.spriteContainer = new Container(); // Renamed from spiralContainer
        this.loadedSprites = [];
        this.loadingText = new Text('Loading Game...', new TextStyle({
            fontFamily: 'Arial',
            fontSize: 50,
            fill: '#ffffff'
        }));

        // Grid configuration
        this.gridConfig = {
            cols: 12,          // Increased columns
            rows: 12   ,          // Increased rows
            cellSize: 60,      // Slightly smaller cells
            offsetX: 10,       // Adjusted offset
            offsetY: 10,       // More space from top
            layerOffset: 5,    // Y-offset between stacked sprites
            maxAlpha: 0.8,     // Maximum opacity for base layer
            alphaDecay: 0.2    // How much to reduce alpha per layer
        };

        this.init();
    }

    init() {
        // Create a black background
        const background = new Graphics();
        background.beginFill(0x000000);
        background.drawRect(0, 0, this.app.screen.width, this.app.screen.height);
        background.endFill();
        this.container.addChild(background);

        // Add sprite container before progress bar and text
        this.spriteContainer.x = 0;
        this.spriteContainer.y = 0;
        this.container.addChild(this.spriteContainer);

        // Create a progress bar
        this.progressBar.beginFill(0xffffff);
        this.progressBar.drawRect(0, this.app.screen.height - 50, 0, 20);
        this.progressBar.endFill();
        this.container.addChild(this.progressBar);

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
        const spritesCount = this.loadedSprites.length;
        const baseRow = Math.floor(spritesCount / this.gridConfig.cols);
        const col = spritesCount % this.gridConfig.cols;
        const layer = Math.floor(baseRow / this.gridConfig.rows);
        const row = baseRow % this.gridConfig.rows;

        sprite.anchor.set(0.5);
        sprite.scale.set(0.4); // Slightly smaller sprites
            
        // Calculate base position
        sprite.x = col * this.gridConfig.cellSize + this.gridConfig.cellSize / 2 + this.gridConfig.offsetX;
        sprite.y = row * this.gridConfig.cellSize + this.gridConfig.cellSize / 2 + this.gridConfig.offsetY;
            
        // Add layer offset if stacking
        if (layer > 0) {
            sprite.y -= layer * this.gridConfig.layerOffset;
            // Reduce alpha for stacked sprites
            sprite.alpha = Math.max(
                this.gridConfig.maxAlpha - (layer * this.gridConfig.alphaDecay),
                0.2
            );
        } else {
            sprite.alpha = this.gridConfig.maxAlpha;
        }
            
        // Add a slight random rotation
        sprite.rotation = (Math.random() - 0.5) * 0.3;
            
        this.loadedSprites.push(sprite);
        this.spriteContainer.addChild(sprite);
    }

    update(delta) {
        // Optional: Add subtle animation to the sprites
        this.loadedSprites.forEach(sprite => {
            sprite.rotation += 0.001 * delta;
        });
    }

    hide() {
        this.app.stage.removeChild(this.container);
    }
}