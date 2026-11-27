/** MONKEY MIND III | MODULE
 * Canvas dimensions, renderer, scaling, physics and pointer settings.
 * Customization map: docs/CUSTOMIZATION.md
 */
import Phaser from 'phaser';

export const GAME_WIDTH = 1280;
export const GAME_HEIGHT = 720;

export const gameConfig = {

    type: Phaser.AUTO,

    parent: 'app',

    width: GAME_WIDTH,
    height: GAME_HEIGHT,

    backgroundColor: '#101418',

    pixelArt: false,
    antialias: true,
    roundPixels: true,

    render: {
        antialias: true,
        antialiasGL: true
    },

    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },

    physics: {
        default: 'arcade',

        arcade: {
            gravity: {
                y: 900
            },

            debug: false
        }
    },

    input: {
        activePointers: 6,
        keyboard: true,
        mouse: true,
        touch: true
    },

    fps: {
        target: 60,
        forceSetTimeOut: false
    },

    audio: {
        disableWebAudio: false
    }

};