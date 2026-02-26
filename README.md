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

Destroy all four AI monsters before they wreck you!

### Powerups

| Pickup | Effect |
|---|---|
| **Speed Boost** (green) | +60% top speed for 5 s |
| **Shield** (blue) | Absorbs the next 2 hits |
| **Mega Ram** (red) | 3× collision damage for 6 s |

### Pitfalls

| Hazard | Effect |
|---|---|
| **Oil Slick** (brown) | Spin-out – loss of control for 1.5 s |
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
