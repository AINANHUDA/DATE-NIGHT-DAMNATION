
import Phaser from 'phaser';
import { gameConfig } from '../config/gameConfig.js';

export class GameEngine {
    constructor() {
        this.game = null;
    }

    start(scenes) {
        if (this.game) {
            return this.game;
        }

        this.game = new Phaser.Game({
            ...gameConfig,
            scene: scenes
        });

        console.info('[Engine] MONKEY MIND III initialized.');

        return this.game;
    }

    getGame() {
        return this.game;
    }

    destroy() {
        if (this.game) {
            this.game.destroy(true);
            this.game = null;

            console.info('[Engine] Game destroyed.');
        }
    }
}
