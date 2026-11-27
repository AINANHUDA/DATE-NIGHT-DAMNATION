# Source map

| File | Responsibility |
|---|---|
| [src/main.js](../src/main.js) | Application entry point: boot, font loading, scene order and mobile viewport. |
| [src/core/GameEngine.js](../src/core/GameEngine.js) | Phaser engine initialization and lifecycle. |
| [src/config/gameConfig.js](../src/config/gameConfig.js) | Canvas dimensions, renderer, scaling, physics and pointer settings. |
| [src/config/assetManifest.js](../src/config/assetManifest.js) | Asset registry: stable runtime keys mapped to images, atlases and audio under public/assets. |
| [src/config/characterAtlasData.json](../src/config/characterAtlasData.json) | Character atlas metadata: anchors, frame names, FPS, timing, emitters and hit/animation metrics. |
| [src/config/storyDialogue.js](../src/config/storyDialogue.js) | Story chapter names, speaker IDs, backgrounds, dialogue, cinematic event cues and next scene. |
| [src/characters/CharacterAnimations.js](../src/characters/CharacterAnimations.js) | Registers sprite animations and applies character origin and scale. |
| [src/combat/FightRules.js](../src/combat/FightRules.js) | Base attack damage, reach, cooldowns and visual effect keys. |
| [src/combat/Movement.js](../src/combat/Movement.js) | Walk/run speed, acceleration, gravity, jump and dash tuning (pixels and seconds). |
| [src/combat/CombatFlow.js](../src/combat/CombatFlow.js) | Combat clock, combo cancellation, hit-stop, projectile intersections and impact feedback. |
| [src/combat/BossDirector.js](../src/combat/BossDirector.js) | Mini Maliha and Maliha attack patterns, damage, warnings, phase thresholds and difficulty tempo. |
| [src/combat/CinematicDirector.js](../src/combat/CinematicDirector.js) | Ultimate cut-ins, combat freeze and chapter transitions. |
| [src/world/ExpeditionLayout.js](../src/world/ExpeditionLayout.js) | Map length, regions, platform geometry, hazards, enemy/potion positions and banana requirements. |
| [src/world/CampaignBalance.js](../src/world/CampaignBalance.js) | Checkpoint healing, boss-entry supplies and nearest-banana hints. |
| [src/systems/CampaignProfile.js](../src/systems/CampaignProfile.js) | Local storage saves, recovery, chapter selection, default settings and damage difficulty. |
| [src/audio/AudioDirector.js](../src/audio/AudioDirector.js) | Music, ambience, voice playback, ducking, effect volume and scene cleanup. |
| [src/audio/voiceLines.json](../src/audio/voiceLines.json) | Text index for recorded dialogue and combat taunts. Not an audio generator. |
| [src/scenes/BootScene.js](../src/scenes/BootScene.js) | Initial boot and preloader transition. |
| [src/scenes/PreloadScene.js](../src/scenes/PreloadScene.js) | Loads the registered assets; handles missing art and optional audio. |
| [src/scenes/TitleScene.js](../src/scenes/TitleScene.js) | Main menu, opening gate, title artwork and continue/new game. |
| [src/scenes/StoryScene.js](../src/scenes/StoryScene.js) | Cinematic staging, actor positioning, text reveal and chapter events. |
| [src/scenes/ChaseScene.js](../src/scenes/ChaseScene.js) | Exploration simulation, enemies, collectibles, player health, level HUD and boss gate. |
| [src/scenes/BossBattleScene.js](../src/scenes/BossBattleScene.js) | Both boss arenas: fighters, player attacks, HP, HUD, cage, KO and rescue progression. |
| [src/scenes/MenuScene.js](../src/scenes/MenuScene.js) | Pause menu, settings, chapter replay and restart routing. |
| [src/ui/FightInput.js](../src/ui/FightInput.js) | Keyboard bindings (CODE), mobile button positions, input buffering and touch handling. |
| [src/ui/Presentation.js](../src/ui/Presentation.js) | HUD meters, portraits, background sizing, camera smoothing, lighting and particles. |
| [src/ui/MobileDisplay.js](../src/ui/MobileDisplay.js) | Safe-area viewport, fullscreen support and resize cleanup. |
| [src/styles/global.css](../src/styles/global.css) | Browser canvas styling, page sizing and mobile touch behavior. |
| [tools/qa-check.cjs](../tools/qa-check.cjs) | Checks assets, atlas geometry, source syntax and all regression suites. |
| [tools/release-build.mjs](../tools/release-build.mjs) | Builds a deployment folder using only approved runtime assets; preserves Vercel link. |

## Regression tests

- `tests/phase7c.mjs` — Combat and combo chains
- `tests/phase7d.mjs` — Boss abilities
- `tests/phase7e.mjs` — Cinematic transitions
- `tests/phase7f.mjs` — Audio and dialogue
- `tests/phase7g.mjs` — Save and menus
- `tests/phase7h.mjs` — Visual presentation
- `tests/phase8a.mjs` — Keyboard recovery
- `tests/phase8b.mjs` — Level and balance
- `tests/phase8c.mjs` — Combat responsiveness
- `tests/phase8d.mjs` — Mobile controls
- `tests/phase8e.mjs` — Stability and save recovery
- `tests/phase8f.mjs` — Release builder
