
import './styles/global.css';

import { GameEngine } from './core/GameEngine.js';

import { BootScene } from './scenes/BootScene.js';
import { PreloadScene } from './scenes/PreloadScene.js';

const engine = new GameEngine();

engine.start([
    BootScene,
    PreloadScene
]);

if (import.meta.hot) {
    import.meta.hot.dispose(() => {
        engine.destroy();
    });
}
