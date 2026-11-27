# Beta 0.3 — Relic UI

Apply over Beta 0.2 Neon Arcade and the Story Start Fix. This patch replaces only interface, input, scene presentation and regression-test source files. It also includes the previous story-start fix. No audio, voice text, character atlases, backgrounds, balance data, manifest, save data or deployment configuration are included.

## Controls

Drag the left joystick: left/right movement, up flick jump (recenter before another jump), down hold guard. Release to return to neutral. Independent buttons for dash, guard, jump, slash, heavy, shot, skill, ultimate. The game remains a side-scroller: horizontal movement uses the existing digital movement logic. Keyboard controls unchanged. Portrait uses a dedicated touch dock, landscape follows the game canvas. The attack icons are original vector artwork, not copied from Mobile Legends. Ultimate charge and ammo come from real game state; dash countdown uses the combat clock. No fabricated cooldown timers for abilities without a separate cooldown.

## Customization

- `src/ui/RelicControls.js`: ability SVG illustrations and stick dead zone, up/down thresholds.
- `src/ui/FightInput.js`: input buffering, pointer capture, visual feedback, cooldown numbers.
- `src/styles/global.css`: physical screen sizes, layout, button materials and gold trim.
- `src/ui/GothicArt.js`: static blackletter title composition and gold ornaments. Lettering uses rendered STIX mathematical blackletter glyph outlines (STIX project, SIL Open Font License 1.1), with original Roman numeral geometry and styling. No font files are distributed in this update. The design is inspired by gothic action games; no Blasphemous logo, game art or proprietary UI assets are used.
- `src/scenes/TitleScene.js`, `PreloadScene.js`, `MenuScene.js`: title/loading/menu layout and colors.
- `src/ui/Presentation.js`, `src/scenes/ChaseScene.js`, `BossBattleScene.js`: ornate HUD and banana seal; HP, ammo and count remain tied to the existing game values.

## Validation

All 14 source regression suites passed in the preserved Beta 0.2 + story-fix fixture. Chromium DOM tests checked six viewport sizes, physical attack targets, joystick drag/release, portrait separation and title-vector canvas rendering. The browser test used a lightweight scene/canvas harness, not a complete Phaser playthrough. Full Vite production build and phone playtesting must be done in the actual project. Loading-screen styling changes do not alter the asset-loading strategy or promise faster loading.

Run `node tools/qa-check.cjs`, `node tests/story-start.mjs`, and `npm.cmd run dev` before publishing. Automatic Vercel deployment uses the existing Git workflow.
