/** MONKEY MIND III | MODULE
 * Registers sprite animations and applies character origin and scale.
 * Customization map: docs/CUSTOMIZATION.md
 */
import Phaser from 'phaser';
import { CHARACTERS } from '../config/assetManifest.js';

export function animationKey(id, state) { return `${id}:${state}`; }

export function registerCharacterAnimations(scene) {
    for (const c of Object.values(CHARACTERS)) {
        if (!scene.textures.exists(c.texture)) throw new Error(`Missing texture: ${c.texture}`);
        const texture = scene.textures.get(c.texture);
        texture.setFilter(Phaser.Textures.FilterMode.NEAREST);
        for (const [state, data] of Object.entries(c.animations)) {
            const key = animationKey(c.id, state);
            if (scene.anims.exists(key)) continue;
            const rate = state === 'run' ? Math.min(data.fps, 9) : data.fps;
            const frames = data.frames.map((frame, index) => {
                if (!texture.has(frame)) throw new Error(`Missing frame: ${c.id}/${frame}`);
                // Phaser adds this duration to the base frame duration.
                const ms = data.durationsMs?.[index];
                return { key: c.texture, frame, duration: Number.isFinite(ms) ? Math.max(0, ms - 1000 / rate) : 0 };
            });
            scene.anims.create({ key, frames, frameRate: rate, repeat: data.repeat });
        }
    }
}

export function setCharacter(sprite, id, height = 275) {
    const c = CHARACTERS[id];
    const idle = c.animations.idle.frames[0];
    const nativeHeight = c.metrics.states.idle.frames[0].height;
    sprite.anims.stop();
    sprite.setTexture(c.texture, idle);
    sprite.setOrigin(c.anchor.x / c.cellWidth, c.anchor.y / c.cellHeight);
    sprite.setScale(height / nativeHeight);
    sprite.play(animationKey(id, 'idle'));
    return sprite;
}
