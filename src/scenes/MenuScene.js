/* -------------------------------------------------
 *  MenuScene – polished title screen
 * ------------------------------------------------- */
import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, MONSTER_ROSTER } from '../config.js';

const CX = GAME_WIDTH / 2;

export class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  create() {
    this.selectedIndex = 0;

    /* ---- background with subtle radial gradient ---- */
    const bg = this.add.graphics();
    bg.fillStyle(0x0e0e0e);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    bg.fillStyle(0x1a1008, 0.6);
    bg.fillCircle(CX, 280, 380);
    bg.fillStyle(0x1a1408, 0.25);
    bg.fillCircle(CX, 280, 480);

    /* decorative divider line */
    bg.lineStyle(1, 0x443300, 0.35);
    bg.lineBetween(80, 260, GAME_WIDTH - 80, 260);

    /* ---- logo (skull & crossed pistons) ---- */
    this.add.image(CX, 72, 'logo').setScale(1.1).setAlpha(0.9);

    /* subtle glow behind logo */
    const glow = this.add.circle(CX, 72, 55, 0xff4400, 0.07);
    this.tweens.add({
      targets: glow, alpha: 0.14, scaleX: 1.15, scaleY: 1.15,
      yoyo: true, repeat: -1, duration: 1800, ease: 'Sine.easeInOut'
    });

    /* ---- title text ---- */
    this.add.text(CX, 144, 'CRASH  DERBY', {
      fontSize: '44px', fontFamily: 'monospace', color: '#ff4444',
      stroke: '#000', strokeThickness: 6
    }).setOrigin(0.5);

    this.add.text(CX, 192, 'MONSTERS', {
      fontSize: '56px', fontFamily: 'monospace', color: '#ffcc00',
      stroke: '#220000', strokeThickness: 7
    }).setOrigin(0.5);

    this.add.text(CX, 240, 'DEMOLITION  ARENA', {
      fontSize: '13px', fontFamily: 'monospace',
      color: '#886644', letterSpacing: 6
    }).setOrigin(0.5);

    /* ---- car preview with platform ---- */
    /* shadow/platform ellipse */
    this.add.ellipse(CX, 338, 72, 14, 0x000000, 0.35);

    this.previewCar = this.add.image(CX, 318, MONSTER_ROSTER[0].textureKey).setScale(2.8);

    /* selection arrows */
    this.add.text(CX - 60, 318, '\u25C0', {
      fontSize: '22px', fontFamily: 'monospace', color: '#ffaa44'
    }).setOrigin(0.5);
    this.add.text(CX + 60, 318, '\u25B6', {
      fontSize: '22px', fontFamily: 'monospace', color: '#ffaa44'
    }).setOrigin(0.5);

    /* monster name */
    this.selectionTitle = this.add.text(CX, 358, '', {
      fontSize: '22px', fontFamily: 'monospace', color: '#fff',
      stroke: '#000', strokeThickness: 4
    }).setOrigin(0.5);

    /* stat bars */
    this.statBars = [];
    const statDefs = [
      { key: 'maxSpeed', label: 'SPD', max: 320, color: 0x44bbff },
      { key: 'acceleration', label: 'ACC', max: 460, color: 0x44ff66 },
      { key: 'hp', label: ' HP', max: 150, color: 0xff4444 },
      { key: 'turnSpeed', label: 'TRN', max: 200, color: 0xffaa22 }
    ];
    const barW = 100;
    const barH = 8;
    const barX = CX - 28;
    statDefs.forEach((def, i) => {
      const y = 386 + i * 18;
      this.add.text(barX - 42, y, def.label, {
        fontSize: '11px', fontFamily: 'monospace', color: '#888'
      }).setOrigin(0, 0.5);
      this.add.rectangle(barX, y, barW, barH, 0x222222).setOrigin(0, 0.5);
      const bar = this.add.rectangle(barX, y, barW, barH, def.color).setOrigin(0, 0.5);
      this.statBars.push({ bar, def });
    });

    /* ---- selector hint ---- */
    this.add.text(CX, 464, '\u25C0  \u25B6   CHOOSE YOUR MONSTER', {
      fontSize: '11px', fontFamily: 'monospace', color: '#ffaa44'
    }).setOrigin(0.5);

    /* ---- controls panel ---- */
    const panelY = 488;
    this.add.rectangle(CX, panelY + 24, 320, 60, 0x111111, 0.6)
      .setStrokeStyle(1, 0x333333, 0.4).setOrigin(0.5);

    const controls = [
      { lbl: 'STEER', val: 'ARROWS / WASD' },
      { lbl: 'GO',    val: 'SPACE' }
    ];
    controls.forEach((c, i) => {
      const y = panelY + 8 + i * 18;
      this.add.text(CX - 80, y, c.lbl, {
        fontSize: '11px', fontFamily: 'monospace', color: '#666'
      }).setOrigin(0, 0.5);
      this.add.text(CX + 80, y, c.val, {
        fontSize: '11px', fontFamily: 'monospace', color: '#ddd'
      }).setOrigin(1, 0.5);
    });
    this.add.text(CX, panelY + 46, 'RAM \u00b7 DESTROY \u00b7 SURVIVE', {
      fontSize: '10px', fontFamily: 'monospace', color: '#ff6644'
    }).setOrigin(0.5);

    /* ---- start prompt ---- */
    const startTxt = this.add.text(CX, 564, '\u25BA  PRESS ENTER TO START  \u25C4', {
      fontSize: '17px', fontFamily: 'monospace', color: '#ffcc00',
      stroke: '#000', strokeThickness: 4
    }).setOrigin(0.5);

    this.tweens.add({
      targets: startTxt, alpha: 0.20,
      yoyo: true, repeat: -1, duration: 700, ease: 'Sine.easeInOut'
    });

    /* ---- version tag ---- */
    this.add.text(GAME_WIDTH - 8, GAME_HEIGHT - 6, 'v1.0', {
      fontSize: '9px', fontFamily: 'monospace', color: '#333'
    }).setOrigin(1, 1);

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
    this.selectionTitle.setText(monster.name.toUpperCase());

    /* animate stat bars */
    this.statBars.forEach(({ bar, def }) => {
      const pct = Phaser.Math.Clamp(stats[def.key] / def.max, 0, 1);
      this.tweens.add({
        targets: bar, displayWidth: 100 * pct,
        duration: 200, ease: 'Cubic.easeOut'
      });
    });
  }

  startGame() {
    const selectedMonster = MONSTER_ROSTER[this.selectedIndex];
    this.scene.start('GameScene', { selectedMonster });
  }
}
