import { Assets , Sprite } from 'https://cdn.jsdelivr.net/npm/pixi.js@8.x/dist/pixi.min.mjs';

export class TextureManager {
    constructor(spriteSheetPath) {
        this.spriteSheetPath = spriteSheetPath;
        this.textures = {};
    }

    async loadTextures(onProgress) {
        const totalTextures = 222 + 1 + 5 + 1 + 1 + 3 + 4 + 12 * 3 + 2; // Total number of textures to load
        let loadedTextures = 0;

        const updateProgress = (texture) => {
            loadedTextures++;
            const progress = loadedTextures / totalTextures;
            if (onProgress) onProgress(progress, texture);
        };

        // Load individual grass textures
        for (let i = 0; i <= 222; i++) {
            const textureName = `tile${i.toString().padStart(3, '0')}`;
            this.textures[textureName] = await Assets.load(`./src/Sprites/Tiles/${textureName}.png`);
            updateProgress(this.textures[textureName]);
        }

        // Load additional textures for player gun and animations
        const RechamberAnimation = [
            './src/Sprites/Gun/TOZ-106_Fired_4.png',
            './src/Sprites/Gun/TOZ-106_Fired_1.png',
            './src/Sprites/Gun/TOZ-106_Fired_2.png',
            './src/Sprites/Gun/TOZ-106_Fired_3.png',
            './src/Sprites/Gun/TOZ-106_Fired_4.png'
        ];

        await Assets.load(RechamberAnimation);
        RechamberAnimation.forEach((path, index) => {
            this.textures[`RechamberAnimation${index}`] = Assets.get(path);
            updateProgress(this.textures[`RechamberAnimation${index}`]);
        });

        this.textures['GunTexture'] = await Assets.load('./src/Sprites/Gun/TOZ-106.png');
        updateProgress(this.textures['GunTexture']);
        this.textures['PlayerTexture'] = await Assets.load('./src/Sprites/Player/Player Idle Front.png');
        updateProgress(this.textures['PlayerTexture']);
        this.textures['PlayerIdleUp'] = await Assets.load('./src/Sprites/Player/Player Idle Back.png');
        updateProgress(this.textures['PlayerIdleUp']);
        this.textures['PlayerIdleSide'] = await Assets.load('./src/Sprites/Player/Player Idle Side.png');
        updateProgress(this.textures['PlayerIdleSide']);
        this.textures['PlayerIdleDown'] = await Assets.load('./src/Sprites/Player/Player Idle Front.png');
        updateProgress(this.textures['PlayerIdleDown']);

        // Load walking animations
        this.textures['PlayerWalkDown'] = [
            await Assets.load('./src/Sprites/Player/Player Moving Front 1.png'),
            await Assets.load('./src/Sprites/Player/Player Moving Front 2.png'),
            await Assets.load('./src/Sprites/Player/Player Moving Front 3.png')
        ];
        this.textures['PlayerWalkDown'].forEach(texture => updateProgress(texture));
        this.textures['PlayerWalkUp'] = [
            await Assets.load('./src/Sprites/Player/Player Moving Back 1.png'),
            await Assets.load('./src/Sprites/Player/Player Moving Back 2.png'),
            await Assets.load('./src/Sprites/Player/Player Moving Back 3.png'),
            await Assets.load('./src/Sprites/Player/Player Moving Back 4.png')
        ];
        this.textures['PlayerWalkUp'].forEach(texture => updateProgress(texture));
        this.textures['PlayerWalkSide'] = [
            await Assets.load('./src/Sprites/Player/Player Moving Side 1.png'),
            await Assets.load('./src/Sprites/Player/Player Moving Side 2.png'),
            await Assets.load('./src/Sprites/Player/Player Moving Side 3.png')
        ];
        this.textures['PlayerWalkSide'].forEach(texture => updateProgress(texture));

        // Load Slime textures
        this.textures['SlimeIdle'] = [await Assets.load('./src/Sprites/Slime/SlimeIdle.png')];
        updateProgress(this.textures['SlimeIdle'][0]);
        this.textures['SlimeWalkUp'] = [];
        this.textures['SlimeWalkDown'] = [];
        this.textures['SlimeWalkSide'] = [];
        for (let i = 1; i <= 12; i++) {
            this.textures['SlimeWalkUp'].push(await Assets.load(`./src/Sprites/Slime/SlimeMovingUp (${i}).png`));
            updateProgress(this.textures['SlimeWalkUp'][i - 1]);
            this.textures['SlimeWalkDown'].push(await Assets.load(`./src/Sprites/Slime/SlimeMovingDown (${i}).png`));
            updateProgress(this.textures['SlimeWalkDown'][i - 1]);
            this.textures['SlimeWalkSide'].push(await Assets.load(`./src/Sprites/Slime/SlimeMovingSide (${i}).png`));
            updateProgress(this.textures['SlimeWalkSide'][i - 1]);
        }

        // Load death animation textures
        this.textures['PlayerDeath1'] = await Assets.load('./src/Sprites/Player/Player Death 1.png');
        updateProgress(this.textures['PlayerDeath1']);
        this.textures['PlayerDeath2'] = await Assets.load('./src/Sprites/Player/Player Death 2.png');
        updateProgress(this.textures['PlayerDeath2']);
    }

    getTexture(name) {
        return this.textures[name];
    }
}