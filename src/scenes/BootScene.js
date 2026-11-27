/** MONKEY MIND III | MODULE
 * Initial boot and preloader transition.
 * Customization map: docs/CUSTOMIZATION.md
 */

import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
    }

    create() {
        console.info('[Scene] BootScene started.');

        this.cameras.main.setBackgroundColor('#101418');

        this.scene.start('PreloadScene');
    }
}
