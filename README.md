# Monster Derby

Top-down retro demolition derby built with **Phaser 3** and **Vite**.

## Quick Start

```bash
npm install
npm run dev
```

Open **http://localhost:5173** in your browser.

## Controls

| Key | Action |
|---|---|
| `Arrow keys` / `WASD` | Steer and accelerate |
| `SPACE` | Brake |
| `ENTER` | Start / restart |
| `ESC` | Back to menu (game-over screen) |

## Gameplay

Choose your monster, then survive and destroy the entire rival lineup.

### Monster Selection

- Pick from **8 unique monsters** on the title screen (`LEFT` / `RIGHT`)
- Each monster has differentiated stats (speed, acceleration, turn, HP, grip)
- Press `ENTER` or `SPACE` to lock your selection and start

### Match Format

- Single-player derby arena at **800x600**
- **8 total cars per match** (you + 7 AI opponents)
- Win by destroying all rivals before your HP reaches zero

### Powerups

| Pickup | Effect |
|---|---|
| **Speed Boost** (green) | +60% top speed for 5 s |
| **Shield** (blue) | Absorbs the next 2 hits |
| **Mega Ram** (red) | 3× collision damage for 6 s |

### Pitfalls

| Hazard | Effect |
|---|---|
| **Oil Slick** (brown) | Brief spin-out with reduced traction |
| **Pit Hole** (black) | 30 HP damage + teleport to random spot |
| **Spike Strip** (orange) | 15 HP damage + heavy slow |

## Build for Production

```bash
npm run build
```

Output is in `dist/`.

## Tech

- **Phaser 3** (Arcade physics, procedurally generated placeholder textures)
- **Vite** dev server and bundler
- Zero external image or audio assets required
