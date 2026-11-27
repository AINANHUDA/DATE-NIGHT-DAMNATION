# DATE NIGHT DAMNATION

*Dinner reservations can wait.*

**Beta 0.3 · Noncommercial indie game project**

[Play the game](https://monkey-mind-iii-rescue.vercel.app/) · [Report a bug](https://github.com/AINANHUDA/MONKEY-MIND-III/issues)

## The story

Ainan had one plan: enjoy a peaceful dinner with Jennifer. Unfortunately, Maliha has other ideas. When Jennifer is kidnapped, a quiet date becomes a journey through haunted woods, a desolate harbor and a cursed sanctuary. Armed with a sword, questionable jokes and an unreasonable supply of bananas, Ainan must confront an army of clones, Mini Maliha and the architect of the chaos herself.

Date Night Damnation combines 2D platforming, arcade fighting, gothic horror atmosphere and absurd comedy. Formerly known as MONKEY MIND III — THE RESCUE.

## Features

- Cinematic story sequences, character dialogue, voice audio and subtitles.
- Side-scrolling exploration, traps, collectibles, checkpoints and healing items.
- Melee combos, ranged attacks, guarding, dashing and special abilities.
- Mini Maliha and a multi-phase final boss encounter.
- Drag-based mobile joystick and illustrated ability buttons in the Beta 0.3 UI update.
- Gothic title typography, ornamental health meters and banana counters.
- Atmospheric horror music and environmental ambience in the horror audio update.
- Difficulty settings, chapter selection and saved campaign progress.

## Controls

| Action | Keyboard |
| --- | --- |
| Move | A / D or left / right arrows |
| Jump | Space / W |
| Dash | Shift |
| Guard | I / S |
| Slash | J |
| Heavy attack | K |
| Skill | L |
| Banana projectile | U |
| Ultimate | O |
| Pause | Esc |
| Toggle audio | M |
| Toggle voices | V |

**Mobile (Beta 0.3):** drag the joystick left or right to move, upward to jump and downward to guard. Use the illustrated action buttons to attack. Landscape orientation is recommended. Physical-device testing is ongoing.

Choose **Start Story** for a new campaign or **Continue Save** to resume progress, after installing the story-start fix.

## Run locally

Built with JavaScript, Phaser 3, Vite and Node.js. Clone the repository and install dependencies:

```powershell
git clone https://github.com/AINANHUDA/MONKEY-MIND-III.git
cd MONKEY-MIND-III
npm.cmd ci
npm.cmd run dev
```

Open http://localhost:5173/. On macOS or Linux, use `npm` instead of `npm.cmd`.

## Project structure

| Directory | Purpose |
| --- | --- |
| `src/config/` | Asset registry, story dialogue and game configuration |
| `src/scenes/` | Menus, cinematics, exploration and boss battles |
| `src/combat/`, `src/characters/`, `src/world/` | Combat logic, characters, animation and level design |
| `src/audio/` | Music, sound management and voice metadata |
| `src/ui/`, `src/systems/` | HUD, touch controls, display and saves |
| `public/assets/` | Artwork, fonts and audio files |
| `tests/`, `tools/` | Regression checks and release tooling |
| `docs/` | Customization and deployment guides |

## Development and deployment

Run automated checks before publishing:

```powershell
node tools/qa-check.cjs
```

The production website is hosted on Vercel. The connected GitHub `main` branch triggers deployments. The release builder prepares approved public assets; a successful build is not a substitute for gameplay testing.

Developer guides: [Customization](docs/CUSTOMIZATION.md) · [Source map](docs/SOURCE-MAP.md) · [Asset catalog](docs/ASSET-CATALOG.md) · [Deployment](docs/DEPLOYMENT.md)

## Beta status and feedback

The game remains in development. The Beta 0.3 update introduces a gothic interface and revised mobile input, followed by a name change and audio revisions. Full campaign playthroughs, physical mobile-device compatibility, loading performance and audio balance still require testing. The hosted build may lag behind locally installed updates.

When reporting a bug, include your device, browser, chapter, steps to reproduce it and a screenshot or recording if possible.

## Credits and asset permissions

- **AETHER CLASH by Bang Tutorial** — modified character artwork and other assets under [CC BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/). [Original project](https://github.com/bangtutorial/aether-clash).
- Rajdhani font — SIL Open Font License. Consult the bundled notices for all other fonts and third-party materials.
- See [credits](public/credits.html) and [license notices](public/licenses/) for attribution and applicable terms.

The project is noncommercial. No blanket license is granted over third-party assets. Blasphemous-inspired visuals do not imply affiliation with its creators. Imported Blasphemous 2 audio is intended for private testing only unless redistribution permission is obtained; publish original or appropriately licensed replacements instead. This README does not certify that every asset currently in a local or hosted build has been cleared for redistribution.
