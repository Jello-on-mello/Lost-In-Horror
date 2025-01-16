import { Graphics } from 'https://cdn.jsdelivr.net/npm/pixi.js@8.x/dist/pixi.min.mjs';

export function createCrosshair() {
    const crosshair = new Graphics();
    crosshair.beginFill(0xffffff);
    crosshair.drawCircle(0, 0, 8);
    crosshair.endFill();
    crosshair.lineStyle(1, 0x111111, 0.87);
    return crosshair;
}