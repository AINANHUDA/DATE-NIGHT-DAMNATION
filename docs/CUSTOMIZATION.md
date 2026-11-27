# Customize MONKEY MIND III — THE RESCUE

Start with [Source map](SOURCE-MAP.md) and [Asset catalog](ASSET-CATALOG.md). These point to the actual game files, not discarded reference repositories.

## Artwork

- Characters: `public/assets/characters/{ainan,jennifer,maliha,mini-maliha}/`. Replace the compact WebP atlas **and its matching JSON** together. Keep frame names and texture keys stable. For a different atlas layout, update `src/config/characterAtlasData.json` (anchors, cell dimensions, animation frames, FPS, durations, emitters and metrics). Keep GPU texture dimensions at or below 4096 pixels. Portrait and cut-in images can be swapped separately. Character display heights are set in each scene's `setCharacter` calls.
- Backgrounds: change files in `public/assets/backgrounds/`, or edit their URLs in `src/config/assetManifest.js`. Chapter backgrounds are selected by `src/config/storyDialogue.js`; exploration regions by `src/world/ExpeditionLayout.js`; arena background by `src/scenes/BossBattleScene.js`.
- Terrain: replace ground/ledge/prop PNGs under `public/assets/tilesets/expedition/`. Change geometry in `src/world/ExpeditionLayout.js`. The procedural items and traps are drawn in `src/scenes/ChaseScene.js`, so changing those drawings requires code edits.
- Effects: `public/assets/effects/aether/`. Original effect keys (solan, naja, rhea, etc.) are intentionally kept because combat scripts use them. Change their URLs in the asset manifest, not every combat call.

## Story and audio

- Edit `src/config/storyDialogue.js` for dialogue, titles, speaker IDs, background keys and next-scene routing. Keep cinematic event tags (third field of certain lines) unless you also change their handlers in StoryScene.
- Recorded voices live in `public/assets/audio/campaign/voices/` with names such as `prologue-0.ogg`. Update matching text in `src/audio/voiceLines.json` and replace the recording whenever you change a line. Text edits do not automatically regenerate speech. Changing line count/order requires matching voice IDs and updating the regression expectation.
- Music and ambience: `public/assets/audio/campaign/music/`, `ambient/`; sound effects: `sfx/`. Final battle MP3 and fight/KO announcer remain under the original audio paths; see the asset catalog. Keep formats or update URLs accordingly. AudioDirector controls playback, volume and ducking; scenes choose tracks.

## Gameplay

| Change | Edit |
|---|---|
| Speed, gravity, jumps, dash | `src/combat/Movement.js` — MOTION |
| Sword damage, reach, cooldowns | `src/combat/FightRules.js` — ATTACKS |
| Combo and hit-stop | `src/combat/CombatFlow.js` |
| Boss attack types, damage, timings and phases | `src/combat/BossDirector.js` — MINI, FINAL, TEMPO |
| Boss health, appearance, player and arena combat | `src/scenes/BossBattleScene.js` |
| Map length, bananas required, gaps, enemy and potion locations | `src/world/ExpeditionLayout.js` |
| Potion healing, clone behavior, item pickup and projectile details | `src/scenes/ChaseScene.js` |
| Checkpoint and gate health/ammunition | `src/world/CampaignBalance.js` — supplies |
| Difficulty damage, save validation and chapter progression | `src/systems/CampaignProfile.js` |
| Keyboard and touch buttons | `src/ui/FightInput.js` — CODE and button calls |
| Menu design | `src/scenes/TitleScene.js`, `src/scenes/MenuScene.js` |
| HUD, camera, shadows, particles | `src/ui/Presentation.js` and gameplay scenes |
| Screen size, mobile and CSS | `src/config/gameConfig.js`, `src/ui/MobileDisplay.js`, `src/styles/global.css` |

Change values in small steps and run `node tools/qa-check.cjs` after each change. Some tests assert specific balance values, map counts and dialogue/audio alignment; if you intentionally change those designs, update the corresponding expected values, never remove a failing test just to pass QA. Existing browser saves use map-coordinate IDs, so large map edits can invalidate old checkpoints or collectibles.

## Licensing

Keep [credits](../public/credits.html) and [license notices](../public/licenses/). The Aether Clash artwork is CC BY-NC 4.0. Replace it with original or appropriately licensed assets before any commercial use. Do not relabel imported artwork as original work.
