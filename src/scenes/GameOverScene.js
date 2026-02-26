/* -------------------------------------------------
 *  GameOverScene – polished victory / defeat screen
 * ------------------------------------------------- */
import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config.js';

const CX = GAME_WIDTH / 2;

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

    /* ---- background (same palette as menu / preload) ---- */
    const bg = this.add.graphics();
    bg.fillStyle(0x0e0e0e);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    const glowHue = victory ? 0x1a1800 : 0x1a0808;
    bg.fillStyle(glowHue, 0.55);
    bg.fillCircle(CX, 240, 380);
    bg.fillStyle(0x1a1408, 0.2);
    bg.fillCircle(CX, 240, 480);

    /* decorative dividers (gold tone, matching menu) */
    bg.lineStyle(1, 0x443300, 0.35);
    bg.lineBetween(100, 185, GAME_WIDTH - 100, 185);
    bg.lineBetween(100, 400, GAME_WIDTH - 100, 400);

    /* ---- logo with glow (same as menu) ---- */
    this.add.image(CX, 52, 'logo').setScale(0.65).setAlpha(0.85);
    const logoGlow = this.add.circle(CX, 52, 38, 0xff4400, 0.06);
    this.tweens.add({
      targets: logoGlow, alpha: 0.12, scaleX: 1.12, scaleY: 1.12,
      yoyo: true, repeat: -1, duration: 1800, ease: 'Sine.easeInOut'
    });

    /* ---- branding ---- */
    this.add.text(CX, 100, 'CRASH  DERBY', {
      fontSize: '18px', fontFamily: 'monospace', color: '#ff4444',
      stroke: '#000', strokeThickness: 3
    }).setOrigin(0.5).setAlpha(0.5);

    /* ---- result banner ---- */
    const bannerText  = victory ? 'VICTORY!' : 'WRECKED!';
    const bannerColor = victory ? '#ffcc00' : '#ff4444';

    const banner = this.add.text(CX, 148, bannerText, {
      fontSize: '58px', fontFamily: 'monospace', color: bannerColor,
      stroke: '#000', strokeThickness: 8
    }).setOrigin(0.5).setScale(0.8);

    /* pop-in animation */
    this.tweens.add({
      targets: banner, scaleX: 1, scaleY: 1,
      duration: 400, ease: 'Back.easeOut'
    });

    /* ---- stats panel (matching menu panel style) ---- */
    this.add.rectangle(CX, 295, 340, 150, 0x111111, 0.5)
      .setStrokeStyle(1, 0x443300, 0.4);

    this.add.text(CX, 232, 'FINAL SCORE', {
      fontSize: '10px', fontFamily: 'monospace', color: '#886644'
    }).setOrigin(0.5);

    this.add.text(CX, 264, String(score), {
      fontSize: '36px', fontFamily: 'monospace', color: '#fff',
      stroke: '#000', strokeThickness: 5
    }).setOrigin(0.5);

    this.add.text(CX, 310, `DESTROYED   ${aiDestroyed} / ${totalOpponents}`, {
      fontSize: '16px', fontFamily: 'monospace', color: '#ff8800',
      stroke: '#000', strokeThickness: 3
    }).setOrigin(0.5);

    this.add.text(CX, 342, `PILOT   ${playerMonsterName.toUpperCase()}`, {
      fontSize: '13px', fontFamily: 'monospace', color: '#66cc66',
      stroke: '#000', strokeThickness: 2
    }).setOrigin(0.5);

    /* ---- prompts (gold pulsing, same as menu start prompt) ---- */
    const restart = this.add.text(CX, 435, '\u25BA  ENTER TO PLAY AGAIN  \u25C4', {
      fontSize: '17px', fontFamily: 'monospace', color: '#ffcc00',
      stroke: '#000', strokeThickness: 4
    }).setOrigin(0.5);

    this.add.text(CX, 470, 'ESC  \u2192  MENU', {
      fontSize: '11px', fontFamily: 'monospace', color: '#886644'
    }).setOrigin(0.5);

    this.tweens.add({
      targets: restart, alpha: 0.20,
      yoyo: true, repeat: -1, duration: 700, ease: 'Sine.easeInOut'
    });

    /* ---- version tag (matching menu) ---- */
    this.add.text(GAME_WIDTH - 8, GAME_HEIGHT - 6, 'v1.0', {
      fontSize: '9px', fontFamily: 'monospace', color: '#333'
    }).setOrigin(1, 1);

    /* ---- input ---- */
    this.input.keyboard.once('keydown-ENTER', () => this.scene.start('GameScene', { selectedMonster }));
    this.input.keyboard.once('keydown-ESC',   () => this.scene.start('MenuScene'));
  }
}
