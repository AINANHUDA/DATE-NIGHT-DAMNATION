
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
