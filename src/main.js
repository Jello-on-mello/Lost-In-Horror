import { Application, Graphics, Assets } from 'pixi.js';
import { Player } from './player.js';
import { TrainingDummy } from './TrainingDummy.js'; // Import the new class

(async () => {
    
    // Tworzenie aplikacji PIXI
    const Monitor = document.getElementById('myCanvas');
    const app = new Application();

    await app.init({
        view: Monitor,
        width: 720,
        height: 720,
        antialias: true,
        backgroundColor: 0x1099bb,
    });

    // Create and configure a target circle for aiming
    const targetCircle = new Graphics();
    targetCircle.beginFill(0xffffff);
    targetCircle.drawCircle(0, 0, 8);
    targetCircle.endFill();
    targetCircle.lineStyle(1, 0x111111, 0.87);
    app.stage.addChild(targetCircle);

    // Enable interactivity and set hit area to the entire screen
    app.stage.interactive = true;
    app.stage.hitArea = app.screen;

    // Update target position to follow the mouse
    app.stage.on('pointermove', (e) => {
        targetCircle.position.copyFrom(e.global);
    });

    // Load assets for player gun and animations
    const RechamberAnimation = [
        '/src/Sprites/TOZ-106/TOZ-106_Fired_4.png',
        '/src/Sprites/TOZ-106/TOZ-106_Fired_1.png',
        '/src/Sprites/TOZ-106/TOZ-106_Fired_2.png',
        '/src/Sprites/TOZ-106/TOZ-106_Fired_3.png',
        '/src/Sprites/TOZ-106/TOZ-106_Fired_4.png'
    ];

    const EnemyIdle = 'src/Sprites/Training Dummy/TrainingDummy_Idle.png';
    const EnemyShot = [
        'src/Sprites/Training Dummy/TrainingDummy_Damage_1.png',
        'src/Sprites/Training Dummy/TrainingDummy_Damage_2.png',
        'src/Sprites/Training Dummy/TrainingDummy_Damage_3.png',
        'src/Sprites/Training Dummy/TrainingDummy_Damage_4.png',
        'src/Sprites/Training Dummy/TrainingDummy_Damage_5.png',
        'src/Sprites/Training Dummy/TrainingDummy_Damage_6.png',
        'src/Sprites/Training Dummy/TrainingDummy_Damage_7.png'
    ];
    const EnemyDepleted = [
        'src/Sprites/Training Dummy/TrainingDummy_Death_1.png',
        'src/Sprites/Training Dummy/TrainingDummy_Death_2.png',
        'src/Sprites/Training Dummy/TrainingDummy_Death_3.png',
        'src/Sprites/Training Dummy/TrainingDummy_Death_4.png',
        'src/Sprites/Training Dummy/TrainingDummy_Death_5.png',
        'src/Sprites/Training Dummy/TrainingDummy_Death_6.png',
        'src/Sprites/Training Dummy/TrainingDummy_Death_7.png',

    ];

    // Preload all assets
    await Assets.load(RechamberAnimation);
    const GunTexture = await Assets.load('/src/Sprites/TOZ-106/TOZ-106.png');
    const playerTexture = await Assets.load('https://pixijs.io/examples/examples/assets/bunny.png');
    const idleTexture = await Assets.load(EnemyIdle);
    await Assets.load(EnemyShot);
    await Assets.load(EnemyDepleted);

    // Create player instance
    const player = new Player(app, playerTexture, GunTexture, RechamberAnimation);
    app.stage.addChild(player.sprite);

    // Create the enemy instance
    const enemy = new TrainingDummy(app, idleTexture, EnemyShot, EnemyDepleted);
    
    // Main game loop
    app.ticker.add(() => {
        player.update(targetCircle); // Update player

        // Check if any bullets collide with the enemy
        for (let i = player.bullets.length - 1; i >= 0; i--) {
            const bullet = player.bullets[i];

            // Get the bounding box of both the bullet and the enemy
            const bulletBounds = bullet.getBounds();
            const enemyBounds = enemy.idleSprite.getBounds();

            // Check for overlap between the bullet and enemy
            if (
                bulletBounds.x < enemyBounds.x + enemyBounds.width &&
                bulletBounds.x + bulletBounds.width > enemyBounds.x &&
                bulletBounds.y < enemyBounds.y + enemyBounds.height &&
                bulletBounds.y + bulletBounds.height > enemyBounds.y
            ) {
                // If there is a collision, handle it
                enemy.takeDamage();
                player.bullets.splice(i, 1);
                bullet.destroy();
            }
        }
});
})();
