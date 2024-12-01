import { Application, Assets, Sprite, Graphics } from 'pixi.js';

(async () => {
    const app = new Application();
    await app.init({
        width: window.innerWidth,
        height: window.innerHeight,
        antialias: true,
        backgroundColor: 0x1099bb
    });

    app.canvas.style.position = 'absolute';
    document.body.appendChild(app.canvas);

    // Create a player sprite
    const Player_Texture = await Assets.load('https://pixijs.io/examples/examples/assets/bunny.png');
    const player = new Sprite(Player_Texture);
    player.anchor.set(0.5); // Center the sprite
    player.x = app.screen.width / 2;
    player.y = app.screen.height / 2;

    // Add the player sprite to the stage
    app.stage.addChild(player);

    // Create a gun sprite (simple rectangle for illustration)
    const gun = new Graphics();
    gun.beginFill(0x000000); // Black color for the gun
    gun.drawRect(-5, -20, 10, 30); // Draw the gun as a rectangle
    gun.endFill();
    gun.x = 0;
    gun.y = 0; // Position it relative to the player sprite

    player.addChild(gun); // Attach the gun to the player

    // Create a target circle (visible)
    const targetCircle = app.stage.addChild(
        new Graphics().circle(0, 0, 8).fill({ color: 0xffffff }).stroke({ color: 0x111111, alpha: 0.87, width: 1 })
    );

    app.stage.eventMode = 'static';

    app.stage.hitArea = app.screen;

    app.stage.addEventListener('pointermove', (e) => {
        targetCircle.position.copyFrom(e.global);
    });

    // Bullet container to manage multiple bullets
    const bullets = [];

    // Player movement speed
    const speed = 5;

    // Listen to keyboard events for player movement
    const keys = {
        up: false,
        down: false,
        left: false,
        right: false,
        shoot: false
    };

    // Track keys down
    window.addEventListener('keydown', (e) => {
        if (e.code === 'ArrowUp') keys.up = true;
        if (e.code === 'ArrowDown') keys.down = true;
        if (e.code === 'ArrowLeft') keys.left = true;
        if (e.code === 'ArrowRight') keys.right = true;
        if (e.code === 'Space') keys.shoot = true; // Space to shoot
    });

    // Track keys up
    window.addEventListener('keyup', (e) => {
        if (e.code === 'ArrowUp') keys.up = false;
        if (e.code === 'ArrowDown') keys.down = false;
        if (e.code === 'ArrowLeft') keys.left = false;
        if (e.code === 'ArrowRight') keys.right = false;
        if (e.code === 'Space') keys.shoot = false; // Stop shooting when space is released
    });

    // Function to create and shoot bullets
    function shootBullet() {
        const bullet = new Graphics();
        bullet.beginFill(0xff0000); // Red color for the bullet
        bullet.drawRect(-2, -5, 4, 10); // Bullet shape (small rectangle)
        bullet.endFill();

        // Calculate the bullet spawn position (end of the gun)
        const gunLength = 30; // Length of the gun
        const offsetX = Math.cos(gun.rotation) * gunLength; // X offset based on rotation
        const offsetY = Math.sin(gun.rotation) * gunLength; // Y offset based on rotation

        // Set the bullet's initial position at the end of the gun (relative to the gun's position)
        bullet.x = player.x + gun.x + offsetX;
        bullet.y = player.y + gun.y + offsetY;

        app.stage.addChild(bullet); // Add bullet to stage
        bullets.push(bullet); // Add bullet to the array for tracking

        // Bullet velocity in the direction the gun is pointing
        bullet.vx = Math.cos(gun.rotation) * 10; // Bullet speed in the X direction
        bullet.vy = Math.sin(gun.rotation) * 10; // Bullet speed in the Y direction
    }

    // Function to update the gun's angle to point at the target circle
    function updateGunRotation() {
        // Get the position of the target circle
        const targetX = targetCircle.x;
        const targetY = targetCircle.y;

        // Calculate the angle between the player and the target circle using Math.atan2
        const angle = Math.atan2(targetY - player.y, targetX - player.x);

        // Rotate the gun to face the target circle
        gun.rotation = angle;
    }

    // Game loop for updating the player position, bullets, and gun
    app.ticker.add(() => {
        // Update gun rotation to point at the target circle
        updateGunRotation();

        // Player movement
        if (keys.up) player.y -= speed;
        if (keys.down) player.y += speed;
        if (keys.left) player.x -= speed;
        if (keys.right) player.x += speed;

        // Prevent the player from going off-screen
        player.x = Math.max(0, Math.min(player.x, app.screen.width));
        player.y = Math.max(0, Math.min(player.y, app.screen.height));

        // Shooting
        if (keys.shoot) {
            shootBullet(); // Shoot a bullet when the spacebar is pressed
        }

        // Move the bullets and remove those that go off-screen
        for (let i = bullets.length - 1; i >= 0; i--) {
            const bullet = bullets[i];
            bullet.x += bullet.vx; // Move bullet along X direction
            bullet.y += bullet.vy; // Move bullet along Y direction

            // Remove bullet when it goes off-screen
            if (bullet.x < 0 || bullet.x > app.screen.width || bullet.y < 0 || bullet.y > app.screen.height) {
                bullets.splice(i, 1); // Remove bullet from the array
                bullet.destroy(); // Remove bullet from the stage
            }
        }
    });
})();
