import { Assets } from 'https://cdn.jsdelivr.net/npm/pixi.js@8.x/dist/pixi.min.mjs';

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
            const texture = await Assets.load(`./src/Sprites/Tiles/${textureName}.png`);
            this.textures[textureName] = texture;
            updateProgress(texture);
        }

        // Load additional textures for player gun and animations
        const RechamberAnimation = [
            './src/Sprites/Gun/TOZ-106_Fired_4.png',
            './src/Sprites/Gun/TOZ-106_Fired_1.png',
            './src/Sprites/Gun/TOZ-106_Fired_2.png',
            './src/Sprites/Gun/TOZ-106_Fired_3.png',
            './src/Sprites/Gun/TOZ-106_Fired_4.png'
        ];

        for (const path of RechamberAnimation) {
            const texture = await Assets.load(path);
            const index = RechamberAnimation.indexOf(path);
            this.textures[`RechamberAnimation${index}`] = texture;
            updateProgress(texture);
        }

        const gunTexture = await Assets.load('./src/Sprites/Gun/TOZ-106.png');
        this.textures['GunTexture'] = gunTexture;
        updateProgress(gunTexture);

        const playerTexture = await Assets.load('./src/Sprites/Player/Player Idle Front.png');
        this.textures['PlayerTexture'] = playerTexture;
        updateProgress(playerTexture);

        const playerIdleUp = await Assets.load('./src/Sprites/Player/Player Idle Back.png');
        this.textures['PlayerIdleUp'] = playerIdleUp;
        updateProgress(playerIdleUp);

        const playerIdleSide = await Assets.load('./src/Sprites/Player/Player Idle Side.png');
        this.textures['PlayerIdleSide'] = playerIdleSide;
        updateProgress(playerIdleSide);

        const playerIdleDown = await Assets.load('./src/Sprites/Player/Player Idle Front.png');
        this.textures['PlayerIdleDown'] = playerIdleDown;
        updateProgress(playerIdleDown);

        // Load walking animations
        const playerWalkDown = [
            await Assets.load('./src/Sprites/Player/Player Moving Front 1.png'),
            await Assets.load('./src/Sprites/Player/Player Moving Front 2.png'),
            await Assets.load('./src/Sprites/Player/Player Moving Front 3.png')
        ];
        this.textures['PlayerWalkDown'] = playerWalkDown;
        playerWalkDown.forEach(texture => updateProgress(texture));

        const playerWalkUp = [
            await Assets.load('./src/Sprites/Player/Player Moving Back 1.png'),
            await Assets.load('./src/Sprites/Player/Player Moving Back 2.png'),
            await Assets.load('./src/Sprites/Player/Player Moving Back 3.png'),
            await Assets.load('./src/Sprites/Player/Player Moving Back 4.png')
        ];
        this.textures['PlayerWalkUp'] = playerWalkUp;
        playerWalkUp.forEach(texture => updateProgress(texture));

        const playerWalkSide = [
            await Assets.load('./src/Sprites/Player/Player Moving Side 1.png'),
            await Assets.load('./src/Sprites/Player/Player Moving Side 2.png'),
            await Assets.load('./src/Sprites/Player/Player Moving Side 3.png')
        ];
        this.textures['PlayerWalkSide'] = playerWalkSide;
        playerWalkSide.forEach(texture => updateProgress(texture));

        // Load Slime textures
        const slimeIdle = await Assets.load('./src/Sprites/Slime/SlimeIdle.png');
        this.textures['SlimeIdle'] = [slimeIdle];
        updateProgress(slimeIdle);

        const slimeWalkUp = [];
        const slimeWalkDown = [];
        const slimeWalkSide = [];
        for (let i = 1; i <= 12; i++) {
            const walkUp = await Assets.load(`./src/Sprites/Slime/SlimeMovingUp (${i}).png`);
            slimeWalkUp.push(walkUp);
            updateProgress(walkUp);

            const walkDown = await Assets.load(`./src/Sprites/Slime/SlimeMovingDown (${i}).png`);
            slimeWalkDown.push(walkDown);
            updateProgress(walkDown);

            const walkSide = await Assets.load(`./src/Sprites/Slime/SlimeMovingSide (${i}).png`);
            slimeWalkSide.push(walkSide);
            updateProgress(walkSide);
        }
        this.textures['SlimeWalkUp'] = slimeWalkUp;
        this.textures['SlimeWalkDown'] = slimeWalkDown;
        this.textures['SlimeWalkSide'] = slimeWalkSide;

        // Load death animation textures
        const playerDeath1 = await Assets.load('./src/Sprites/Player/Player Death 1.png');
        this.textures['PlayerDeath1'] = playerDeath1;
        updateProgress(playerDeath1);

        const playerDeath2 = await Assets.load('./src/Sprites/Player/Player Death 2.png');
        this.textures['PlayerDeath2'] = playerDeath2;
        updateProgress(playerDeath2);
    }

    getTexture(name) {
        return this.textures[name];
    }
}