import { Assets, Texture, Rectangle } from 'pixi.js';

export class TextureManager {
    constructor(spriteSheetPath) {
        this.spriteSheetPath = spriteSheetPath;
        this.textures = {};
    }

    async loadTextures() {
        const spriteSheet = await Assets.load(this.spriteSheetPath);
        this.createTexturesFromSpriteSheet(spriteSheet);

        // Load additional textures for player gun and animations
        const RechamberAnimation = [
            './src/Sprites/TOZ-106/TOZ-106_Fired_4.png',
            './src/Sprites/TOZ-106/TOZ-106_Fired_1.png',
            './src/Sprites/TOZ-106/TOZ-106_Fired_2.png',
            './src/Sprites/TOZ-106/TOZ-106_Fired_3.png',
            './src/Sprites/TOZ-106/TOZ-106_Fired_4.png'
        ];

        await Assets.load(RechamberAnimation);
        this.textures['GunTexture'] = await Assets.load('./src/Sprites/TOZ-106/TOZ-106.png');
        this.textures['PlayerTexture'] = await Assets.load('https://pixijs.io/examples/examples/assets/bunny.png');

        RechamberAnimation.forEach((path, index) => {
            this.textures[`RechamberAnimation${index}`] = Assets.get(path);
        });
    }

    createTexturesFromSpriteSheet(spriteSheet) {
        const colors = ['Brown', 'Gold', 'Crimson', 'Green', 'DarkGreen'];
        const positions = ['TopLeft', 'TopCenter', 'TopRight', 'MiddleLeft', 'MiddleCenter', 'MiddleRight', 'BottomLeft', 'BottomCenter', 'BottomRight'];

        // Define 3x3 squares
        colors.forEach((color, colorIndex) => {
            this.textures[`${color}TallGrass`] = [];
            positions.forEach((position, posIndex) => {
                this.textures[`${color}TallGrass`].push(new Texture(spriteSheet, new Rectangle((posIndex % 3) * 16, Math.floor(posIndex / 3) * 16 + colorIndex * 48, 16, 16)));
            });
        });

        // Define singular tall grass and destroyed tall grass
        colors.forEach((color, colorIndex) => {
            this.textures[`Singular${color}TallGrass`] = new Texture(spriteSheet, new Rectangle(0, 240 + colorIndex * 16, 16, 16));
            this.textures[`SingularDestroyed${color}TallGrass`] = new Texture(spriteSheet, new Rectangle(32, 240 + colorIndex * 16, 16, 16));
        });

        // Define destroyed tall grass positions
        colors.forEach((color, colorIndex) => {
            this.textures[`Destroyed${color}TallGrass`] = [];
            positions.forEach((position, posIndex) => {
                this.textures[`Destroyed${color}TallGrass`].push(new Texture(spriteSheet, new Rectangle((posIndex % 3) * 16, 320 + Math.floor(posIndex / 3) * 16 + colorIndex * 48, 16, 16)));
            });
        });

        // Define leaves patches
        colors.forEach((color, colorIndex) => {
            this.textures[`Large${color}LeavesPatch`] = new Texture(spriteSheet, new Rectangle(0, 560 + colorIndex * 16, 16, 16));
            this.textures[`Medium${color}LeavesPatch`] = new Texture(spriteSheet, new Rectangle(16, 560 + colorIndex * 16, 16, 16));
            this.textures[`Small${color}LeavesPatch`] = new Texture(spriteSheet, new Rectangle(32, 560 + colorIndex * 16, 16, 16));
        });

        // Define decorations
        this.textures['LargeGreenBush1'] = new Texture(spriteSheet, new Rectangle(0, 640, 16, 16));
        this.textures['SmallGreenBush1'] = new Texture(spriteSheet, new Rectangle(16, 640, 16, 16));
        this.textures['LargeGreenBush2'] = new Texture(spriteSheet, new Rectangle(32, 640, 16, 16));
        this.textures['SmallGreenBush2'] = new Texture(spriteSheet, new Rectangle(48, 640, 16, 16));
        this.textures['GreenPlant1'] = new Texture(spriteSheet, new Rectangle(0, 656, 16, 16));
        this.textures['GreenPlant2'] = new Texture(spriteSheet, new Rectangle(16, 656, 16, 16));
        this.textures['GreenPlant3'] = new Texture(spriteSheet, new Rectangle(32, 656, 16, 16));
        this.textures['GreenPlant4'] = new Texture(spriteSheet, new Rectangle(48, 656, 16, 16));
        this.textures['GreenPlant5'] = new Texture(spriteSheet, new Rectangle(64, 656, 16, 16));
        this.textures['GreenPlant6'] = new Texture(spriteSheet, new Rectangle(80, 656, 16, 16));
        this.textures['DarkGreenPlant1'] = new Texture(spriteSheet, new Rectangle(96, 656, 16, 16));
        this.textures['DarkGreenPlant2'] = new Texture(spriteSheet, new Rectangle(112, 656, 16, 16));
        this.textures['GreenVine1'] = new Texture(spriteSheet, new Rectangle(0, 672, 16, 16));
        this.textures['GreenVine2'] = new Texture(spriteSheet, new Rectangle(16, 672, 16, 16));
        this.textures['GreenVine3'] = new Texture(spriteSheet, new Rectangle(32, 672, 16, 16));
        this.textures['BlueFlower'] = new Texture(spriteSheet, new Rectangle(0, 688, 16, 16));
        this.textures['DarkBlueFlower'] = new Texture(spriteSheet, new Rectangle(16, 688, 16, 16));
        this.textures['CrimsonFlower'] = new Texture(spriteSheet, new Rectangle(32, 688, 16, 16));
        this.textures['OrangeFlower'] = new Texture(spriteSheet, new Rectangle(48, 688, 16, 16));
    }

    getTexture(name) {
        return this.textures[name];
    }
}