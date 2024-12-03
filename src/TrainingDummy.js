import { Sprite, AnimatedSprite, Graphics, Assets } from 'pixi.js';

export class TrainingDummy {
    constructor(app, idleTexture, shotTextures, depletedTextures) {
        this.app = app;
        this.hp = 10;

        // Create the enemy sprite for idle state
        this.idleSprite = new Sprite(idleTexture);
        this.idleSprite.anchor.set(0.5);
        this.idleSprite.x = app.screen.width - 150;
        this.idleSprite.y = app.screen.height / 2;

        // Scale the idle sprite to be smaller (half size)
        this.idleSprite.scale.set(0.5);
        this.scale = 0.5;  // Store the scale factor for manual bounding box calculation

        this.app.stage.addChild(this.idleSprite);

        // Create the shot animation
        this.shotAnimation = new AnimatedSprite(shotTextures.map((frame) => Assets.get(frame)));
        this.shotAnimation.anchor.set(0.5);
        this.shotAnimation.animationSpeed = 0.15;
        this.shotAnimation.loop = false;
        this.shotAnimation.visible = false;
        this.shotAnimation.x = this.idleSprite.x;
        this.shotAnimation.y = this.idleSprite.y;

        // Scale the shot animation to match the reduced size
        this.shotAnimation.scale.set(0.5);

        this.app.stage.addChild(this.shotAnimation);

        // Create the depleted animation
        this.depletedAnimation = new AnimatedSprite(depletedTextures.map((frame) => Assets.get(frame)));
        this.depletedAnimation.anchor.set(0.5);
        this.depletedAnimation.animationSpeed = 0.15;
        this.depletedAnimation.loop = false;
        this.depletedAnimation.visible = false;
        this.depletedAnimation.x = this.idleSprite.x;
        this.depletedAnimation.y = this.idleSprite.y;

        // Scale the depleted animation to match the reduced size
        this.depletedAnimation.scale.set(0.5);

        this.app.stage.addChild(this.depletedAnimation);
    }

    takeDamage() {
        // No cooldown check, damage is always applied
        this.hp--;
        console.log(`Enemy HP: ${this.hp}`);

        if (this.hp <= 0) {
            this.die();
        } else {
            this.showShotAnimation();
        }
    }

    showShotAnimation() {
        this.idleSprite.visible = false; // Hide idle sprite
        this.shotAnimation.visible = true;
        this.shotAnimation.gotoAndPlay(0);

        this.shotAnimation.onComplete = () => {
            this.shotAnimation.visible = false;
            if (this.hp > 0) {
                this.idleSprite.visible = true; // Show idle sprite if dummy is still alive
            }
        };
    }

    die() {
        this.idleSprite.visible = false;
        this.shotAnimation.visible = false;
        this.depletedAnimation.visible = true;
        this.depletedAnimation.gotoAndPlay(0);

        setTimeout(() => {
            this.resetDummy(); // Reset the dummy after the animation
        }, 1000); // 1 second delay to let the depleted animation play
    }

    resetDummy() {
        this.hp = 10; // Reset health
        this.idleSprite.visible = true; // Show the idle sprite
        this.depletedAnimation.visible = false; // Hide the depleted animation
        console.log('Dummy has been reset!');
    }

    /**
     * Checks if a given bullet intersects with the dummy and applies damage if true.
     * @param {Graphics} bullet - The bullet object.
     */
    checkCollision(bullet) {
        // Manually calculate the scaled bounding box of the dummy
        const enemyBounds = {
            x: this.idleSprite.x - this.idleSprite.width * this.scale / 2,
            y: this.idleSprite.y - this.idleSprite.height * this.scale / 2,
            width: this.idleSprite.width * this.scale,
            height: this.idleSprite.height * this.scale
        };

        // Get the bounding box of the bullet
        const bulletBounds = bullet.getBounds();

        // Faster rectangle intersection check
        if (
            bulletBounds.x < enemyBounds.x + enemyBounds.width &&
            bulletBounds.x + bulletBounds.width > enemyBounds.x &&
            bulletBounds.y < enemyBounds.y + enemyBounds.height &&
            bulletBounds.y + bulletBounds.height > enemyBounds.y
        ) {
            this.takeDamage();
            bullet.destroy(); // Remove the bullet after collision
        }
    }
}
