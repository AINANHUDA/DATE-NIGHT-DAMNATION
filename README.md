# MONKEY MIND III — THE RESCUE

A noncommercial story-driven platformer and arcade fighter built with Phaser and Vite. Beta release.

**Play:** https://monkey-mind-iii-rescue.vercel.app

## Run locally

Requires Node.js and npm. In the game directory (Windows PowerShell):

```powershell
npm.cmd ci
npm.cmd run dev
```

Open http://localhost:5173. On other systems use npm instead of npm.cmd.

## Controls

A/D or arrow keys move; Space/W jumps; Shift dashes; I/S guards; J slash; K heavy; L skill; U shoot; O ultimate; Esc pause; M audio; V voices. Touch controls are available in landscape.

## Project layout

- `src/config/`: asset registry, story dialogue, character metadata and engine settings.
- `src/scenes/`: title, story, exploration, boss battle and menus.
- `src/combat/`, `src/characters/`, `src/world/`: rules, animations and map layout.
- `src/audio/`, `src/ui/`, `src/systems/`: sound, input, display and saves.
- `public/assets/`: runtime art, audio and fonts.
- `tests/`, `tools/`: regression checks and release builder.

## Developer guides

- [Customization](docs/CUSTOMIZATION.md)
- [Source map](docs/SOURCE-MAP.md)
- [Asset catalog](docs/ASSET-CATALOG.md)
- [Deployment](docs/DEPLOYMENT.md)

Run `node tools/qa-check.cjs` for automated checks. Browser playtesting is still required.

## Credits and licenses

AETHER CLASH by Bang Tutorial — modified character art, effects and other assets (CC BY-NC 4.0). https://github.com/bangtutorial/aether-clash. See [credits](public/credits.html) and [license notices](public/licenses/). Rajdhani font: SIL OFL. No blanket license is granted for this mixed-asset project.
