/* -------------------------------------------------
 *  Monster Derby – Entry Point
 * ------------------------------------------------- */
import Phaser from 'phaser';
import { PreloadScene } from './scenes/PreloadScene.js';
import { MenuScene }    from './scenes/MenuScene.js';
import { GameScene }    from './scenes/GameScene.js';
import { GameOverScene } from './scenes/GameOverScene.js';
import { GAME_WIDTH, GAME_HEIGHT } from './config.js';

const config = {
  type: Phaser.AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  pixelArt: true,
  backgroundColor: '#000000',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false
    }
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  scene: [PreloadScene, MenuScene, GameScene, GameOverScene]
};

new Phaser.Game(config);
