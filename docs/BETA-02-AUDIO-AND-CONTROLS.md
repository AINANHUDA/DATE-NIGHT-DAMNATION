# Beta 0.2 — Neon Arcade: audio, controls and HUD

This patch changes presentation, not the story, voice recordings, damage values, save format or campaign layout. The new music is original instrumental retro synth-pop; it does not contain The Weeknd recordings or extracted viral meme samples. Three new comedy effects are original synthesized sounds.

## Customize the audio

Replace the following files with your own original or properly licensed recordings, retaining format and path. The stable runtime keys are in `src/config/assetManifest.js`. Volume and ducking are in `src/audio/AudioDirector.js`. Voice clips and subtitles are intentionally not changed.

| Scene | File | Original track |
| --- | --- | --- |
| Menu and date | `public/assets/audio/campaign/music/date.ogg` | Midnight Rendezvous |
| Woods | `public/assets/audio/campaign/music/woods.ogg` | Neon Jungle |
| Harbor | `public/assets/audio/campaign/music/harbor.ogg` | Harbor After Dark |
| Sanctuary | `public/assets/audio/campaign/music/sanctuary.ogg` | Violet Curse |
| Bosses | `public/assets/audio/music/final-battle.mp3` | Solar Showdown |
| Ending | `public/assets/audio/campaign/music/victory.ogg` | Sunrise Escape |

All sound effects are in `public/assets/audio/campaign/sfx/`. `meme-faa.ogg` is a synthesized falling-vowel sound triggered on KO, `meme-bonk.ogg` is a cartoon impact for confirmed strong hits (rate limited), and `meme-scratch.ogg` is an original glitch/scratch sound at Maliha's entry. Ordinary attacks, pickups, warnings and healing retain separate event cues.

## Customize controls and HUD

- `src/ui/FightInput.js`: `CONTROL_LAYOUT` (logical 1280×720 positions, radius, label, shortcut, color) and `CONTROL_ICONS` (32×32 vector polylines). The same input state powers desktop, landscape canvas and portrait dock.
- `src/styles/global.css`: `.mm-touch-*` rules for the portrait dock; layout reserves space below the canvas. Landscape gives the largest playfield.
- `src/scenes/MenuScene.js`: pause button.
- `src/ui/Presentation.js`: shared HUD panel and segmented meter rendering.
- `src/scenes/ChaseScene.js` and `src/scenes/BossBattleScene.js`: HUD geometry, labels and resource values.

## Verify and publish

Run `node tools/qa-check.cjs` and `npm.cmd run dev`. Test mobile touch and rotation before pushing. `node tests/phase11.mjs` tests the new controls, dock logic and asset registry. Browser/device playtesting remains necessary. The music is synthesized original demo-quality instrumentation, not studio-mastered commercial music.
