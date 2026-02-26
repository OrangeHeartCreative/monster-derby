/* -------------------------------------------------
 *  PreloadScene – generate every placeholder texture
 *  so the game needs zero external image files.
 * ------------------------------------------------- */
import Phaser from 'phaser';
import { MONSTER_ROSTER } from '../config.js';

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super('PreloadScene');
  }

  /* ---- helpers --------------------------------------------------- */

  /** Return an integer colour darkened by `amount` (0-255). */
  static darken(color, amount) {
    const r = Math.max(0, ((color >> 16) & 0xff) - amount);
    const g = Math.max(0, ((color >> 8) & 0xff) - amount);
    const b = Math.max(0, (color & 0xff) - amount);
    return (r << 16) | (g << 8) | b;
  }

  /* ---- lifecycle ------------------------------------------------- */

  create() {
    const t = this.add.text(400, 300, 'GENERATING ASSETS…', {
      fontSize: '18px', fontFamily: 'monospace', color: '#888'
    }).setOrigin(0.5);

    this.generateCarTextures();
    this.generatePowerupTextures();
    this.generatePitfallTextures();
    this.generateParticleTextures();
    this.generateObstacleTexture();

    t.destroy();
    this.scene.start('MenuScene');
  }

  /* ---- car textures (facing RIGHT = 0°) ------------------------- */

  generateCarTextures() {
    MONSTER_ROSTER.forEach(monster => {
      this.makeCarTexture(monster.textureKey, monster.color);
    });
  }

  makeCarTexture(key, bodyColor) {
    const g = this.add.graphics();
    const w = 44;
    const h = 28;
    const dark = PreloadScene.darken(bodyColor, 60);

    // Wheels (four corners)
    g.fillStyle(0x222222);
    g.fillRect(2, 0, 8, 6);
    g.fillRect(2, h - 6, 8, 6);
    g.fillRect(w - 10, 0, 8, 6);
    g.fillRect(w - 10, h - 6, 8, 6);
    // Wheel highlight
    g.fillStyle(0x444444);
    g.fillRect(3, 1, 6, 2);
    g.fillRect(3, h - 5, 6, 2);
    g.fillRect(w - 9, 1, 6, 2);
    g.fillRect(w - 9, h - 5, 6, 2);

    // Body outline
    g.fillStyle(dark);
    g.fillRect(6, 2, w - 12, h - 4);
    // Body fill
    g.fillStyle(bodyColor);
    g.fillRect(8, 4, w - 16, h - 8);

    // Front grille (right edge)
    g.fillStyle(0x333333);
    g.fillRect(w - 12, 6, 4, h - 12);

    // Monster eyes
    g.fillStyle(0xffffff);
    g.fillRect(w - 10, 5, 5, 5);
    g.fillRect(w - 10, h - 10, 5, 5);
    g.fillStyle(0xff0000);
    g.fillRect(w - 8, 6, 3, 3);
    g.fillRect(w - 8, h - 9, 3, 3);

    // Teeth
    g.fillStyle(0xffffff);
    for (let i = 0; i < 3; i++) {
      g.fillRect(w - 6, 8 + i * 4, 2, 2);
    }

    // Exhaust
    g.fillStyle(0x777777);
    g.fillRect(6, 8, 3, 3);
    g.fillRect(6, h - 11, 3, 3);

    g.generateTexture(key, w, h);
    g.destroy();
  }

  /* ---- powerup textures ----------------------------------------- */

  generatePowerupTextures() {
    this.makePowerupTexture('power_speed',    0x00ff00);
    this.makePowerupTexture('power_shield',   0x4488ff);
    this.makePowerupTexture('power_mega_ram', 0xff4444);
  }

  makePowerupTexture(key, color) {
    const g = this.add.graphics();
    const s = 22;

    // Outer glow
    g.fillStyle(color, 0.25);
    g.fillCircle(s / 2, s / 2, s / 2);

    // Main body
    g.fillStyle(color);
    g.fillCircle(s / 2, s / 2, s / 2 - 2);

    // Highlight
    g.fillStyle(0xffffff, 0.4);
    g.fillCircle(s / 2 - 2, s / 2 - 2, 3);

    // Icon hints
    g.fillStyle(0xffffff);
    if (key.includes('speed')) {
      g.fillTriangle(s / 2, 4, s / 2 + 5, s / 2, s / 2 - 2, s / 2);
      g.fillTriangle(s / 2, s - 4, s / 2 - 5, s / 2, s / 2 + 2, s / 2);
    } else if (key.includes('shield')) {
      g.fillRect(s / 2 - 3, 5, 6, 12);
      g.fillRect(s / 2 - 5, 5, 10, 3);
    } else {
      // star / burst
      g.fillRect(s / 2 - 1, 5, 2, s - 10);
      g.fillRect(5, s / 2 - 1, s - 10, 2);
    }

    g.generateTexture(key, s, s);
    g.destroy();
  }

  /* ---- pitfall textures ----------------------------------------- */

  generatePitfallTextures() {
    this.makePitfallOil();
    this.makePitfallPit();
    this.makePitfallSpikes();
  }

  makePitfallOil() {
    const g = this.add.graphics();
    const s = 36;
    g.fillStyle(0x553311);
    g.fillCircle(s / 2, s / 2, s / 2);
    g.fillStyle(0x886622);
    g.fillCircle(s / 2 - 2, s / 2 - 2, s / 2 - 4);
    g.fillStyle(0xaa8844, 0.4);
    g.fillCircle(s / 2 + 4, s / 2 - 4, 5);
    g.generateTexture('oil_slick', s, s);
    g.destroy();
  }

  makePitfallPit() {
    const g = this.add.graphics();
    const s = 36;
    g.fillStyle(0x222222);
    g.fillCircle(s / 2, s / 2, s / 2);
    g.fillStyle(0x111111);
    g.fillCircle(s / 2, s / 2, s / 2 - 4);
    g.fillStyle(0x000000);
    g.fillCircle(s / 2, s / 2, s / 2 - 8);
    g.generateTexture('pit_hole', s, s);
    g.destroy();
  }

  makePitfallSpikes() {
    const g = this.add.graphics();
    const s = 36;
    g.fillStyle(0x884400);
    g.fillRect(0, 0, s, s);
    g.fillStyle(0xff8800);
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        const cx = 5 + i * 8;
        const cy = 5 + j * 8;
        g.fillTriangle(cx, cy - 3, cx + 3, cy + 3, cx - 3, cy + 3);
      }
    }
    g.generateTexture('spike_strip', s, s);
    g.destroy();
  }

  /* ---- particle textures ---------------------------------------- */

  generateParticleTextures() {
    this.makeSquare('spark',  0xffee44, 4);
    this.makeSquare('smoke',  0x888888, 6);
    this.makeSquare('debris', 0xaa6633, 3);
  }

  makeSquare(key, color, size) {
    const g = this.add.graphics();
    g.fillStyle(color);
    g.fillRect(0, 0, size, size);
    g.generateTexture(key, size, size);
    g.destroy();
  }

  /* ---- obstacle texture ----------------------------------------- */

  generateObstacleTexture() {
    const g = this.add.graphics();
    const r = 18;
    g.fillStyle(0x444444);
    g.fillCircle(r, r, r);
    g.fillStyle(0x333333);
    g.fillCircle(r, r, r - 4);
    g.fillStyle(0x222222);
    g.fillCircle(r, r, r - 9);
    g.generateTexture('obstacle', r * 2, r * 2);
    g.destroy();
  }
}
