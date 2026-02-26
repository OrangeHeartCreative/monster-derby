/* -------------------------------------------------
 *  GameOverScene – victory / defeat screen
 * ------------------------------------------------- */
import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config.js';

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super('GameOverScene');
  }

  create(data) {
    const victory     = data.victory     ?? false;
    const score       = data.score       ?? 0;
    const aiDestroyed = data.aiDestroyed ?? 0;
    const totalOpponents = data.totalOpponents ?? 4;
    const playerMonsterName = data.playerMonsterName ?? 'MONSTER';
    const selectedMonster = data.selectedMonster ?? null;

    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2,
      GAME_WIDTH, GAME_HEIGHT, 0x0a0a0a);

    /* ---- result banner ---- */
    const bannerText  = victory ? 'VICTORY!' : 'WRECKED!';
    const bannerColor = victory ? '#ffcc00' : '#ff4444';

    this.add.text(GAME_WIDTH / 2, 130, bannerText, {
      fontSize: '72px', fontFamily: 'monospace', color: bannerColor,
      stroke: '#000', strokeThickness: 8
    }).setOrigin(0.5);

    /* ---- stats ---- */
    this.add.text(GAME_WIDTH / 2, 260, `FINAL SCORE: ${score}`, {
      fontSize: '28px', fontFamily: 'monospace', color: '#fff',
      stroke: '#000', strokeThickness: 4
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 310, `MONSTERS DESTROYED: ${aiDestroyed} / ${totalOpponents}`, {
      fontSize: '20px', fontFamily: 'monospace', color: '#ff8800',
      stroke: '#000', strokeThickness: 3
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 350, `YOUR MONSTER: ${playerMonsterName.toUpperCase()}`, {
      fontSize: '16px', fontFamily: 'monospace', color: '#88ff88',
      stroke: '#000', strokeThickness: 3
    }).setOrigin(0.5);

    /* ---- prompts ---- */
    const restart = this.add.text(GAME_WIDTH / 2, 440, 'PRESS ENTER TO PLAY AGAIN', {
      fontSize: '20px', fontFamily: 'monospace', color: '#fff',
      stroke: '#000', strokeThickness: 3
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 480, 'PRESS ESC FOR MENU', {
      fontSize: '14px', fontFamily: 'monospace', color: '#888',
      stroke: '#000', strokeThickness: 2
    }).setOrigin(0.5);

    this.tweens.add({
      targets: restart, alpha: 0.25,
      yoyo: true, repeat: -1, duration: 600
    });

    /* ---- input ---- */
    this.input.keyboard.once('keydown-ENTER', () => this.scene.start('GameScene', { selectedMonster }));
    this.input.keyboard.once('keydown-ESC',   () => this.scene.start('MenuScene'));
  }
}
