import {gothicTitle,relicRule} from '../ui/GothicArt.js';
/** MONKEY MIND III | MODULE
 * Loads the registered assets; handles missing art and optional audio.
 * Customization map: docs/CUSTOMIZATION.md
 */
import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/gameConfig.js';
import { ASSET_PATH, assetManifest } from '../config/assetManifest.js';

export class PreloadScene extends Phaser.Scene {
    constructor() { super('PreloadScene'); }

    preload() {
        this.failedAssets = [];
        this.failedAudio = [];
        const x = GAME_WIDTH / 2, y = GAME_HEIGHT / 2;
        this.cameras.main.setBackgroundColor('#10090d');
        const frame=this.add.graphics();frame.lineStyle(1,0x8b663b,.75).strokeRect(34,34,GAME_WIDTH-68,GAME_HEIGHT-68);frame.lineStyle(1,0x513329,.7).strokeRect(41,41,GAME_WIDTH-82,GAME_HEIGHT-82);
        gothicTitle(this,x,y-133,590,3);
        relicRule(this,x,y-10,540,3);
        this.status = this.add.text(x, y+30, 'Preparing the adventure…', { fontFamily:'Georgia, serif',fontSize: '22px', color: '#e0cda8', align: 'center', wordWrap: { width: 1100 } }).setOrigin(.5);
        const rail=this.add.graphics();rail.fillStyle(0x27141b,1).fillRect(x-260,y+75,520,20);rail.lineStyle(2,0xb58c54,1).strokeRect(x-263,y+72,526,26);
        const bar = this.add.rectangle(x - 258, y + 85, 516, 16, 0xaa3740).setOrigin(0, .5).setScale(0, 1);
        const percent = this.add.text(x, y + 128, '0%', { fontFamily:'Georgia, serif',fontSize: '22px', color: '#E8C078' }).setOrigin(.5);
        const progress = v => { bar.setScale(v, 1); percent.setText(`${Math.round(v * 100)}%`); };
        const error = file => { if (assetManifest.audio.some(a=>a.key===file.key)) this.failedAudio.push(file.key); else this.failedAssets.push(file.key); console.error('[Asset failed]', file.key, file.src); };
        this.load.on('progress', progress);
        this.load.on('loaderror', error);
        const cleanup = () => { this.load.off('progress', progress); this.load.off('loaderror', error); this.events.off('shutdown', cleanup); };
        this.load.once('complete', () => { progress(1); cleanup(); });
        this.events.once('shutdown', cleanup);
        this.load.setPath(ASSET_PATH);
        for (const a of assetManifest.images) this.load.image(a.key, a.url);
        for (const a of assetManifest.atlases) this.load.atlas(a.key, a.textureURL, a.atlasURL);
        for (const a of assetManifest.audio) this.load.audio(a.key, a.url);
    }

    create() {
        const missing = [...new Set([...this.failedAssets, ...[...assetManifest.images, ...assetManifest.atlases].filter(a => !this.textures.exists(a.key)).map(a=>a.key)])];
        if (missing.length) {
            this.status.setColor('#EF7777').setText(`Required artwork failed to load (${missing.length}):\n${missing.slice(0,8).join(', ')}${missing.length>8?' …':''}\nCheck F12 > Console for full details.`);
            console.error('[Required assets missing]', missing);
            const retry = this.add.text(GAME_WIDTH/2,GAME_HEIGHT/2+200,'RELOAD GAME',{fontFamily:'Arial',fontSize:'25px',backgroundColor:'#304359',padding:{x:24,y:12},color:'#fff0cc'}).setOrigin(.5).setInteractive({useHandCursor:true});
            retry.once('pointerdown',()=>globalThis.location?.reload());
            return;
        }
        const audioMissing = [...new Set([...this.failedAudio,...assetManifest.audio.filter(a=>!this.cache.audio.exists(a.key)).map(a=>a.key)])];
        if(audioMissing.length)console.warn('[Audio unavailable — continuing]',audioMissing);
        this.status.setText(audioMissing.length ? 'Artwork ready. Some audio is unavailable.' : 'Character library ready.');
        this.time.delayedCall(350, () => this.scene.start('TitleScene'));
    }
}
