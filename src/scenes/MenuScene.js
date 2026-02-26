/* -------------------------------------------------
 *  MenuScene – title screen
 * ------------------------------------------------- */
import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config.js';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  create() {
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2,
      GAME_WIDTH, GAME_HEIGHT, 0x1a1a0a);

    /* ---- title ---- */
    this.add.text(GAME_WIDTH / 2, 100, 'MONSTER', {
      fontSize: '64px', fontFamily: 'monospace', color: '#ff4444',
      stroke: '#000', strokeThickness: 6
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 175, 'DERBY', {
      fontSize: '80px', fontFamily: 'monospace', color: '#ffcc00',
      stroke: '#000', strokeThickness: 8
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 250, 'DEMOLITION ARENA', {
      fontSize: '18px', fontFamily: 'monospace', color: '#777'
    }).setOrigin(0.5);

    /* ---- decorative cars ---- */
    if (this.textures.exists('player')) {
      this.add.image(280, 340, 'player').setScale(2);
      this.add.image(520, 340, 'ai_red').setScale(2).setFlipX(true);
    }

    /* ---- controls ---- */
    const controlLines = [
      'ARROW KEYS / WASD — DRIVE',
      'SPACE — BRAKE',
      'COLLECT POWERUPS · DODGE PITFALLS'
    ];
    controlLines.forEach((line, i) => {
      this.add.text(GAME_WIDTH / 2, 410 + i * 28, line, {
        fontSize: '14px', fontFamily: 'monospace', color: '#aaa'
      }).setOrigin(0.5);
    });

    /* ---- start prompt ---- */
    const startTxt = this.add.text(GAME_WIDTH / 2, 530, 'PRESS ENTER TO START', {
      fontSize: '22px', fontFamily: 'monospace', color: '#fff',
      stroke: '#000', strokeThickness: 4
    }).setOrigin(0.5);

    this.tweens.add({
      targets: startTxt, alpha: 0.25,
      yoyo: true, repeat: -1, duration: 600
    });

    /* ---- input ---- */
    this.input.keyboard.once('keydown-ENTER', () => this.scene.start('GameScene'));
    this.input.keyboard.once('keydown-SPACE', () => this.scene.start('GameScene'));
  }
}
