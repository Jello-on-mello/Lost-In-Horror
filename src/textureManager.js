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
        this.textures['PlayerTexture'] = await Assets.load('./src/Sprites/Player/Player Idle Front.png');
        this.textures['PlayerIdleUp'] = await Assets.load('./src/Sprites/Player/Player Idle Back.png');
        this.textures['PlayerIdleSide'] = await Assets.load('./src/Sprites/Player/Player Idle Side.png');
        this.textures['PlayerIdleDown'] = await Assets.load('./src/Sprites/Player/Player Idle Front.png');

        // Load walking animations
        this.textures['PlayerWalkDown'] = [
            await Assets.load('./src/Sprites/Player/Player Moving Front 1.png'),
            await Assets.load('./src/Sprites/Player/Player Moving Front 2.png'),
            await Assets.load('./src/Sprites/Player/Player Moving Front 3.png')
        ];
        this.textures['PlayerWalkUp'] = [
            await Assets.load('./src/Sprites/Player/Player Moving Back 1.png'),
            await Assets.load('./src/Sprites/Player/Player Moving Back 2.png'),
            await Assets.load('./src/Sprites/Player/Player Moving Back 3.png'),
            await Assets.load('./src/Sprites/Player/Player Moving Back 4.png')
        ];
        this.textures['PlayerWalkSide'] = [
            await Assets.load('./src/Sprites/Player/Player Moving Side 1.png'),
            await Assets.load('./src/Sprites/Player/Player Moving Side 2.png'),
            await Assets.load('./src/Sprites/Player/Player Moving Side 3.png'),
            await Assets.load('./src/Sprites/Player/Player Moving Side 4.png')
        ];

        RechamberAnimation.forEach((path, index) => {
            this.textures[`RechamberAnimation${index}`] = Assets.get(path);
        });
    }

    getTexture(name) {
        return this.textures[name];
    }
}