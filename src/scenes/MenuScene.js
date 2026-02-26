/* -------------------------------------------------
 *  MenuScene – title screen
 * ------------------------------------------------- */
import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, MONSTER_ROSTER } from '../config.js';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  create() {
    this.selectedIndex = 0;

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
    this.previewCar = this.add.image(400, 340, MONSTER_ROSTER[0].textureKey).setScale(2.4);

    this.selectionTitle = this.add.text(GAME_WIDTH / 2, 410, '', {
      fontSize: '22px', fontFamily: 'monospace', color: '#fff',
      stroke: '#000', strokeThickness: 4
    }).setOrigin(0.5);

    this.selectionStats = this.add.text(GAME_WIDTH / 2, 446, '', {
      fontSize: '14px', fontFamily: 'monospace', color: '#bbb'
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 476, 'LEFT/RIGHT TO CHOOSE MONSTER', {
      fontSize: '13px', fontFamily: 'monospace', color: '#ffaa44'
    }).setOrigin(0.5);

    /* ---- controls ---- */
    const controlLines = [
      'ARROW KEYS / WASD — DRIVE',
      'SPACE — BRAKE',
      'COLLECT POWERUPS · DODGE PITFALLS'
    ];
    controlLines.forEach((line, i) => {
      this.add.text(GAME_WIDTH / 2, 502 + i * 18, line, {
        fontSize: '14px', fontFamily: 'monospace', color: '#aaa'
      }).setOrigin(0.5);
    });

    /* ---- start prompt ---- */
    const startTxt = this.add.text(GAME_WIDTH / 2, 582, 'PRESS ENTER TO START', {
      fontSize: '18px', fontFamily: 'monospace', color: '#fff',
      stroke: '#000', strokeThickness: 4
    }).setOrigin(0.5);

    this.tweens.add({
      targets: startTxt, alpha: 0.25,
      yoyo: true, repeat: -1, duration: 600
    });

    /* ---- input ---- */
    this.input.keyboard.on('keydown-LEFT', () => this.shiftSelection(-1));
    this.input.keyboard.on('keydown-A', () => this.shiftSelection(-1));
    this.input.keyboard.on('keydown-RIGHT', () => this.shiftSelection(1));
    this.input.keyboard.on('keydown-D', () => this.shiftSelection(1));

    this.input.keyboard.on('keydown-ENTER', () => this.startGame());
    this.input.keyboard.on('keydown-SPACE', () => this.startGame());

    this.updateSelectionDisplay();
  }

  shiftSelection(dir) {
    this.selectedIndex = Phaser.Math.Wrap(this.selectedIndex + dir, 0, MONSTER_ROSTER.length);
    this.updateSelectionDisplay();
  }

  updateSelectionDisplay() {
    const monster = MONSTER_ROSTER[this.selectedIndex];
    const stats = monster.stats;
    this.previewCar.setTexture(monster.textureKey);
    this.selectionTitle.setText(`${monster.name.toUpperCase()}`);
    this.selectionStats.setText(
      `SPD ${Math.round(stats.maxSpeed)}   ACC ${Math.round(stats.acceleration)}   HP ${Math.round(stats.hp)}   TURN ${Math.round(stats.turnSpeed)}`
    );
  }

  startGame() {
    const selectedMonster = MONSTER_ROSTER[this.selectedIndex];
    this.scene.start('GameScene', { selectedMonster });
  }
}
