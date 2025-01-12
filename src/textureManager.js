import { Assets, Texture, Rectangle } from 'pixi.js';

export class TextureManager {
    constructor(spriteSheetPath) {
        this.spriteSheetPath = spriteSheetPath;
        this.textures = {};
    }

    async loadTextures() {
        // Load individual grass textures
        for (let i = 0; i <= 222; i++) {
            const textureName = `tile${i.toString().padStart(3, '0')}`;
            this.textures[textureName] = await Assets.load(`./src/Sprites/Grass/${textureName}.png`);
        }

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

    getTexture(name) {
        return this.textures[name];
    }
}