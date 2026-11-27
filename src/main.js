/** MONKEY MIND III | MODULE
 * Application entry point: boot, font loading, scene order and mobile viewport.
 * Customization map: docs/CUSTOMIZATION.md
 */
import './styles/global.css';
import { installMobileDisplay } from './ui/MobileDisplay.js';
const cleanupDisplay = installMobileDisplay();
import { GameEngine } from './core/GameEngine.js';
import { BootScene } from './scenes/BootScene.js';
import { PreloadScene } from './scenes/PreloadScene.js';
import { TitleScene } from './scenes/TitleScene.js';
import { StoryScene } from './scenes/StoryScene.js';
import { ChaseScene } from './scenes/ChaseScene.js';
import { MenuScene } from './scenes/MenuScene.js';
import { BossBattleScene } from './scenes/BossBattleScene.js';
const engine = new GameEngine();
const scenes = [BootScene, PreloadScene, TitleScene, StoryScene, ChaseScene, BossBattleScene, MenuScene];
let disposed = false;
async function boot() {
    if (typeof FontFace !== 'undefined' && document.fonts) {
        const face = new FontFace('Rajdhani', `url(${import.meta.env.BASE_URL}assets/fonts/Rajdhani-Bold.ttf)`, {weight:'700'});
        try { await Promise.race([face.load().then(f => document.fonts.add(f)), new Promise(resolve => setTimeout(resolve, 1000))]); } catch (error) { console.warn('[Font] Using fallback', error); }
    }
    if (!disposed) engine.start(scenes);
}
boot();
if (import.meta.hot) import.meta.hot.dispose(() => { disposed = true; cleanupDisplay(); engine.destroy(); });
