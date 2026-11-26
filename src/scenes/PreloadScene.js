
import Phaser from 'phaser';

import {
    GAME_WIDTH,
    GAME_HEIGHT
} from '../config/gameConfig.js';

import {
    ASSET_PATH,
    assetManifest
} from '../config/assetManifest.js';

export class PreloadScene extends Phaser.Scene {
    constructor() {
        super('PreloadScene');
    }

    preload() {
        const centerX = GAME_WIDTH / 2;
        const centerY = GAME_HEIGHT / 2;
        const failedAssets = [];

        this.cameras.main.setBackgroundColor('#101418');

        this.add.text(
            centerX,
            centerY - 100,
            'MONKEY MIND III',
            {
                fontFamily: 'monospace',
                fontSize: '48px',
                fontStyle: 'bold',
                color: '#e8c078'
            }
        ).setOrigin(0.5);

        const statusText = this.add.text(
            centerX,
            centerY - 25,
            'INITIALIZING RESOURCES',
            {
                fontFamily: 'monospace',
                fontSize: '18px',
                color: '#a0a8b0'
            }
        ).setOrigin(0.5);

        // Loading bar background
        this.add.rectangle(
            centerX,
            centerY + 30,
            480,
            12,
            0x292f36
        );

        const progressBar = this.add.rectangle(
            centerX - 240,
            centerY + 30,
            480,
            12,
            0xe8c078
        ).setOrigin(0, 0.5);

        progressBar.setScale(0, 1);

        const percentage = this.add.text(
            centerX,
            centerY + 65,
            '0%',
            {
                fontFamily: 'monospace',
                fontSize: '16px',
                color: '#e8c078'
            }
        ).setOrigin(0.5);

        // Loading progress
        this.load.on('progress', (value) => {
            progressBar.setScale(value, 1);
            percentage.setText(
                `${Math.round(value * 100)}%`
            );
        });

        // Asset loading errors
        this.load.on('loaderror', (file) => {
            failedAssets.push(file.key);
            console.error(
                `[Assets] Failed to load: ${file.key}`
            );
        });

        // Loading completed
        this.load.once('complete', () => {
            progressBar.setScale(1, 1);
            percentage.setText('100%');

            if (failedAssets.length > 0) {
                statusText.setText('RESOURCE LOADING ERROR');
                statusText.setColor('#ef6666');
            } else {
                statusText.setText('ALL SYSTEMS READY');
                statusText.setColor('#75d6a0');
            }
        });

        this.load.setPath(ASSET_PATH);

        // Load images
        for (const asset of assetManifest.images) {
            this.load.image(asset.key, asset.url);
        }

        // Load sprite sheets
        for (const asset of assetManifest.spritesheets) {
            this.load.spritesheet(
                asset.key,
                asset.url,
                asset.frameConfig
            );
        }

        // Load texture atlases
        for (const asset of assetManifest.atlases) {
            this.load.atlas(
                asset.key,
                asset.textureURL,
                asset.atlasURL
            );
        }

        // Load audio
        for (const asset of assetManifest.audio) {
            this.load.audio(asset.key, asset.urls);
        }

        // Load tilemaps
        for (const asset of assetManifest.tilemaps) {
            this.load.tilemapTiledJSON(
                asset.key,
                asset.url
            );
        }

        console.info('[Assets] Loading initialized.');
    }

    create() {
        console.info('[Scene] PreloadScene complete.');
    }
}
