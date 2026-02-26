# Monster Derby

Top-down retro demolition derby built with **Phaser 3** and **Vite**.

## Controls

### Menu

| Key | Action |
|---|---|
| `LEFT` / `A` | Previous monster |
| `RIGHT` / `D` | Next monster |
| `ENTER` / `SPACE` | Confirm selection and start |

### In-Game

| Key | Action |
|---|---|
| `Arrow keys` / `WASD` | Steer (change facing direction) |
| `SPACE` | Accelerate (thrust in facing direction) |

### Game Over

| Key | Action |
|---|---|
| `ENTER` | Play again (same monster) |
| `ESC` | Return to menu |

## Gameplay

Choose your monster, then survive and destroy the entire rival lineup.

### Monster Selection

- Pick from **8 unique monsters** on the title screen (`LEFT` / `RIGHT` or `A` / `D`)
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
- Defensive input validation on audio, physics, and UI code paths
