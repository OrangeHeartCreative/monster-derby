# Changelog

All notable changes to this project are documented in this file.

## [0.2.0] - 2026-02-25

### Added
- 8-monster roster with unique stat profiles.
- Title-screen monster selection UI with live stat preview.
- Dynamic AI lineup generation based on the selected monster.
- Game over summary with selected monster and dynamic destroy count.

### Changed
- Improved driving handling by reducing excessive drift.
- Added lateral grip model to reduce continuous spin-outs.
- Tuned oil slick behavior to be punishing but controllable.
- Updated HUD foe counter and match flow for 8 total cars (player + 7 AI).

### Fixed
- Selection now persists when restarting from game over.

## [0.1.0] - 2026-02-25

### Added
- Initial Phaser 3 + Vite game scaffold.
- Top-down demolition derby core loop.
- Keyboard controls, AI cars, collisions, scoring, HUD.
- Powerups (Speed Boost, Shield, Mega Ram) and pitfalls (Oil Slick, Pit Hole, Spike Strip).
- Procedurally generated placeholder textures and menu/game-over scenes.
