/* -------------------------------------------------
 *  GameScene – main gameplay loop
 * ------------------------------------------------- */
import Phaser from 'phaser';
import { Player } from '../entities/Player.js';
import { AiCar }  from '../entities/AiCar.js';
import { Hud }    from '../ui/Hud.js';
import * as CFG   from '../config.js';

export class GameScene extends Phaser.Scene {

  constructor() {
    super('GameScene');
  }

  /* ============================================================= */
  /*  CREATE                                                        */
  /* ============================================================= */

  create(data = {}) {
    this.gameState   = 'countdown'; // countdown | playing | gameover
    this.aiCarsAlive = 0;
    this.selectedMonster = data.selectedMonster ?? CFG.MONSTER_ROSTER[0];
    this.totalAiCount = 0;

    this.buildArena();
    this.spawnPlayer();
    this.spawnAiCars();
    this.wireCollisions();
    this.initSpawners();

    this.hud = new Hud(this);
    this.startCountdown();
  }

  /* ---- arena ---------------------------------------------------- */

  buildArena() {
    const W = CFG.GAME_WIDTH;
    const H = CFG.GAME_HEIGHT;
    const T = CFG.ARENA.WALL_THICKNESS;

    /* floor */
    this.add.rectangle(W / 2, H / 2, W, H, CFG.COLORS.ARENA_FLOOR).setDepth(0);

    /* subtle grid */
    const grid = this.add.graphics().setDepth(1);
    grid.lineStyle(1, 0x4a4a3a, 0.3);
    for (let x = 0; x <= W; x += 40) grid.lineBetween(x, 0, x, H);
    for (let y = 0; y <= H; y += 40) grid.lineBetween(0, y, W, y);

    /* visual walls */
    const WC = CFG.COLORS.ARENA_WALL;
    this.add.rectangle(W / 2, T / 2,     W, T, WC).setDepth(5);
    this.add.rectangle(W / 2, H - T / 2, W, T, WC).setDepth(5);
    this.add.rectangle(T / 2, H / 2,     T, H, WC).setDepth(5);
    this.add.rectangle(W - T / 2, H / 2, T, H, WC).setDepth(5);

    /* hazard stripes */
    const stripes = this.add.graphics().setDepth(6);
    for (let x = 0; x < W; x += 20) {
      stripes.fillStyle(x % 40 === 0 ? 0xffcc00 : 0x333333);
      stripes.fillRect(x, 0, 10, 6);
      stripes.fillRect(x, H - 6, 10, 6);
    }
    for (let y = 0; y < H; y += 20) {
      stripes.fillStyle(y % 40 === 0 ? 0xffcc00 : 0x333333);
      stripes.fillRect(0, y, 6, 10);
      stripes.fillRect(W - 6, y, 6, 10);
    }

    /* physics boundary */
    this.physics.world.setBounds(
      CFG.ARENA.INNER_X, CFG.ARENA.INNER_Y,
      CFG.ARENA.INNER_W, CFG.ARENA.INNER_H
    );

    /* obstacles (tire stacks) */
    this.obstacles = this.physics.add.staticGroup();
    const spots = [
      { x: 200, y: 180 }, { x: 600, y: 180 },
      { x: 200, y: 420 }, { x: 600, y: 420 },
      { x: 400, y: 300 }
    ];
    spots.forEach(p => {
      const o = this.obstacles.create(p.x, p.y, 'obstacle');
      o.setDepth(4);
      o.body.setCircle(18);
      o.refreshBody();
    });
  }

  /* ---- entities ------------------------------------------------- */

  spawnPlayer() {
    this.player = new Player(
      this,
      400,
      480,
      this.selectedMonster.textureKey,
      this.selectedMonster.stats
    );
    this.player.monsterName = this.selectedMonster.name;
  }

  spawnAiCars() {
    const spawnPoints = [
      { x: 90,  y: 90 },
      { x: 400, y: 90 },
      { x: 710, y: 90 },
      { x: 90,  y: 300 },
      { x: 710, y: 300 },
      { x: 90,  y: 510 },
      { x: 400, y: 510 },
      { x: 710, y: 510 }
    ];

    const opponents = CFG.MONSTER_ROSTER
      .filter(m => m.id !== this.selectedMonster.id)
      .slice(0, CFG.GAMEPLAY.OPPONENT_COUNT);

    this.aiCars = this.add.group();
    opponents.forEach((monster, idx) => {
      const spawn = spawnPoints[idx];
      const ai = new AiCar(this, spawn.x, spawn.y, monster.textureKey, monster.name);
      this.aiCars.add(ai);
    });

    this.aiCarsAlive = opponents.length;
    this.totalAiCount = opponents.length;
  }

  /* ---- collisions ----------------------------------------------- */

  wireCollisions() {
    /* cars ↔ obstacles */
    this.physics.add.collider(this.player, this.obstacles);
    this.physics.add.collider(this.aiCars, this.obstacles);

    /* player ↔ AI */
    this.physics.add.collider(
      this.player, this.aiCars,
      this.onPlayerHitAi, null, this
    );

    /* AI ↔ AI */
    this.physics.add.collider(
      this.aiCars, this.aiCars,
      this.onAiHitAi, null, this
    );

    /* powerup / pitfall groups (populated later by spawners) */
    this.powerupGroup = this.physics.add.group();
    this.pitfallGroup = this.physics.add.group();

    /* player ↔ powerups */
    this.physics.add.overlap(
      this.player, this.powerupGroup,
      this.onCollectPowerup, null, this
    );
    /* AI ↔ powerups */
    this.physics.add.overlap(
      this.aiCars, this.powerupGroup,
      this.onAiCollectPowerup, null, this
    );

    /* any car ↔ pitfalls */
    this.physics.add.overlap(
      this.player, this.pitfallGroup,
      this.onCarHitPitfall, null, this
    );
    this.physics.add.overlap(
      this.aiCars, this.pitfallGroup,
      this.onCarHitPitfall, null, this
    );
  }

  /* ============================================================= */
  /*  COLLISION CALLBACKS                                           */
  /* ============================================================= */

  onPlayerHitAi(player, ai) {
    if (!player.alive || !ai.alive) return;
    const relSpeed = this.relativeSpeed(player, ai);
    if (relSpeed < CFG.COMBAT.MIN_COLLISION_SPEED) return;

    const base = relSpeed * CFG.COMBAT.COLLISION_DAMAGE_FACTOR;
    ai.takeDamage(base * player.damageMultiplier);
    player.takeDamage(base * ai.damageMultiplier);
    player.addScore(CFG.SCORE.HIT);

    this.collisionFx(player, ai, relSpeed);
  }

  onAiHitAi(a, b) {
    if (!a.alive || !b.alive) return;
    const relSpeed = this.relativeSpeed(a, b);
    if (relSpeed < CFG.COMBAT.MIN_COLLISION_SPEED) return;

    const base = relSpeed * CFG.COMBAT.COLLISION_DAMAGE_FACTOR;
    a.takeDamage(base * b.damageMultiplier);
    b.takeDamage(base * a.damageMultiplier);

    this.collisionFx(a, b, relSpeed);
  }

  /* ---------- powerup collection --------------------------------- */

  onCollectPowerup(player, pu) {
    if (!player.alive || !pu.active) return;
    player.applyPowerup(pu.getData('type'), pu.getData('cfg'));
    player.addScore(CFG.SCORE.POWERUP);
    this.showFloatingText(pu.x, pu.y, pu.getData('cfg').name + '!', '#00ff00');
    this.pickupFx(pu);
    pu.destroy();
  }

  onAiCollectPowerup(ai, pu) {
    if (!ai.alive || !pu.active) return;
    const type = pu.getData('type');
    const cfg  = pu.getData('cfg');
    this.applyPowerupToAi(ai, type, cfg);
    pu.destroy();
  }

  applyPowerupToAi(ai, type, cfg) {
    switch (type) {
      case 'SPEED':
        ai.speedMultiplier = cfg.multiplier;
        ai.setTint(0x00ff00);
        this.time.delayedCall(cfg.duration, () => {
          ai.speedMultiplier = 1;
          if (ai.alive) ai.clearTint();
        });
        break;
      case 'SHIELD':
        ai.shieldHits = cfg.hits;
        ai.setTint(0x4488ff);
        break;
      case 'MEGA_RAM':
        ai.damageMultiplier = cfg.multiplier;
        ai.setTint(0xff4444);
        this.time.delayedCall(cfg.duration, () => {
          ai.damageMultiplier = 1;
          if (ai.alive) ai.clearTint();
        });
        break;
      default:
        break;
    }
  }

  /* ---------- pitfall interaction -------------------------------- */

  onCarHitPitfall(car, pit) {
    if (!car.alive || !pit.active) return;

    /* debounce per-car per-pitfall */
    const tag = `_pit_${pit.x|0}_${pit.y|0}`;
    const now = this.time.now;
    if (car[tag] && now - car[tag] < 1000) return;
    car[tag] = now;

    const type = pit.getData('type');
    const cfg  = pit.getData('cfg');

    switch (type) {
      case 'OIL_SLICK':
        car.body.setAngularVelocity(Phaser.Math.Between(-220, 220));
        car.body.setDrag(car.baseDrag * 0.55, car.baseDrag * 0.55);
        this.time.delayedCall(cfg.duration, () => {
          if (car.alive) {
            car.body.setAngularVelocity(0);
            car.body.setDrag(car.baseDrag, car.baseDrag);
          }
        });
        break;
      case 'PIT_HOLE':
        car.takeDamage(cfg.damage);
        this.relocateCar(car);
        break;
      case 'SPIKE_STRIP':
        car.takeDamage(cfg.damage);
        car.body.velocity.scale(0.3);
        break;
      default:
        break;
    }
  }

  /* ============================================================= */
  /*  SPAWNERS                                                      */
  /* ============================================================= */

  initSpawners() {
    this.powerupTimer = this.time.addEvent({
      delay: CFG.POWERUPS.SPAWN_INTERVAL,
      callback: this.spawnPowerup,
      callbackScope: this,
      loop: true,
      paused: true
    });

    this.pitfallTimer = this.time.addEvent({
      delay: CFG.PITFALLS.SPAWN_INTERVAL,
      callback: this.spawnPitfall,
      callbackScope: this,
      loop: true,
      paused: true
    });
  }

  spawnPowerup() {
    if (this.gameState !== 'playing') return;
    if (this.powerupGroup.countActive() >= CFG.POWERUPS.MAX_COUNT) return;

    const keys = Object.keys(CFG.POWERUPS.TYPES);
    const typeKey = Phaser.Utils.Array.GetRandom(keys);
    const cfg  = CFG.POWERUPS.TYPES[typeKey];
    const tex  = `power_${typeKey.toLowerCase()}`;
    const pos  = this.safePosition();

    const pu = this.physics.add.sprite(pos.x, pos.y, tex).setDepth(5);
    pu.body.setImmovable(true);
    pu.body.setAllowGravity(false);
    pu.setData('type', typeKey);
    pu.setData('cfg', cfg);
    this.powerupGroup.add(pu);

    this.tweens.add({
      targets: pu, scaleX: 1.3, scaleY: 1.3,
      yoyo: true, repeat: -1, duration: 500
    });

    /* auto-despawn */
    this.time.delayedCall(15000, () => { if (pu.active) pu.destroy(); });
  }

  spawnPitfall() {
    if (this.gameState !== 'playing') return;
    if (this.pitfallGroup.countActive() >= CFG.PITFALLS.MAX_COUNT) return;

    const keys    = Object.keys(CFG.PITFALLS.TYPES);
    const typeKey = Phaser.Utils.Array.GetRandom(keys);
    const cfg     = CFG.PITFALLS.TYPES[typeKey];
    const tex     = typeKey.toLowerCase();
    const pos     = this.safePosition();

    const pit = this.physics.add.sprite(pos.x, pos.y, tex).setDepth(2);
    pit.body.setImmovable(true);
    pit.body.setAllowGravity(false);
    pit.setData('type', typeKey);
    pit.setData('cfg', cfg);
    this.pitfallGroup.add(pit);

    /* oil evaporates */
    if (typeKey === 'OIL_SLICK') {
      this.time.delayedCall(20000, () => { if (pit.active) pit.destroy(); });
    }
  }

  /* ============================================================= */
  /*  COUNTDOWN                                                     */
  /* ============================================================= */

  startCountdown() {
    /* freeze everyone */
    this.player.body.enable = false;
    this.aiCars.children.each(ai => { ai.body.enable = false; });

    const label = this.add.text(400, 260, '3', {
      fontSize: '80px', fontFamily: 'monospace', color: '#ffcc00',
      stroke: '#000', strokeThickness: 6
    }).setOrigin(0.5).setDepth(100);

    let count = 3;
    this.time.addEvent({
      delay: 800,
      repeat: 3,
      callback: () => {
        count--;
        if (count > 0) {
          label.setText(String(count));
          this.tweens.add({
            targets: label, scaleX: 1.5, scaleY: 1.5,
            duration: 150, yoyo: true
          });
        } else if (count === 0) {
          label.setText('DEMOLISH!').setFontSize('48px').setColor('#ff4444');
          /* unfreeze */
          this.player.body.enable = true;
          this.aiCars.children.each(ai => { ai.body.enable = true; });
          this.gameState = 'playing';
          this.powerupTimer.paused = false;
          this.time.delayedCall(4000, () => { this.pitfallTimer.paused = false; });
        } else {
          label.destroy();
        }
      }
    });
  }

  /* ============================================================= */
  /*  UPDATE LOOP                                                   */
  /* ============================================================= */

  update(time, delta) {
    this.hud.refresh();

    if (this.gameState !== 'playing') return;

    this.player.update(time, delta);

    this.aiCars.children.each(ai => {
      if (ai.active && ai.alive) ai.update(time, delta);
    });

    /* smoke on low-HP cars */
    this.tickSmoke(this.player, 0.30);
    this.aiCars.children.each(ai => this.tickSmoke(ai, 0.25));

    /* lose check */
    if (!this.player.alive && this.gameState === 'playing') {
      this.endGame(false);
    }
  }

  /* ============================================================= */
  /*  AI DESTROYED                                                  */
  /* ============================================================= */

  onAiDestroyed(ai) {
    this.aiCarsAlive--;
    this.explosionFx(ai.x, ai.y);
    this.showFloatingText(ai.x, ai.y, `${ai.monsterName} DESTROYED!`, '#ff4444');
    this.player.addScore(CFG.SCORE.DESTROY);

    if (this.aiCarsAlive <= 0 && this.gameState === 'playing') {
      this.endGame(true);
    }
  }

  /* ============================================================= */
  /*  GAME OVER                                                     */
  /* ============================================================= */

  endGame(victory) {
    this.gameState = 'gameover';
    this.powerupTimer.paused = true;
    this.pitfallTimer.paused = true;

    this.aiCars.children.each(ai => {
      if (ai.body) {
        ai.body.setAcceleration(0);
        ai.body.setDrag(600, 600);
      }
    });

    this.time.delayedCall(1800, () => {
      this.scene.start('GameOverScene', {
        victory,
        score: this.player.score,
        aiDestroyed: this.totalAiCount - this.aiCarsAlive,
        totalOpponents: this.totalAiCount,
        playerMonsterName: this.player.monsterName,
        selectedMonster: this.selectedMonster
      });
    });
  }

  /* ============================================================= */
  /*  VISUAL EFFECTS                                                */
  /* ============================================================= */

  collisionFx(a, b, speed) {
    const mx = (a.x + b.x) / 2;
    const my = (a.y + b.y) / 2;
    const n  = Phaser.Math.Clamp(Math.floor(speed / 25), 4, 24);

    const em = this.add.particles(mx, my, 'spark', {
      speed: { min: 40, max: speed * 0.5 },
      angle: { min: 0, max: 360 },
      scale: { start: 1.5, end: 0 },
      lifespan: { min: 150, max: 450 },
      quantity: n,
      emitting: false
    }).setDepth(20);
    em.explode(n);
    this.time.delayedCall(500, () => em.destroy());

    this.cameras.main.shake(80, speed * 0.00004);
  }

  explosionFx(x, y) {
    const fire = this.add.particles(x, y, 'spark', {
      speed: { min: 80, max: 280 },
      angle: { min: 0, max: 360 },
      scale: { start: 2.5, end: 0 },
      tint: [0xff0000, 0xff4400, 0xff8800, 0xffcc00],
      lifespan: { min: 350, max: 750 },
      quantity: 30,
      emitting: false
    }).setDepth(20);
    fire.explode(30);

    const smoke = this.add.particles(x, y, 'smoke', {
      speed: { min: 15, max: 50 },
      angle: { min: 0, max: 360 },
      scale: { start: 2, end: 0 },
      alpha: { start: 0.6, end: 0 },
      lifespan: { min: 500, max: 1100 },
      quantity: 12,
      emitting: false
    }).setDepth(19);
    smoke.explode(12);

    this.cameras.main.shake(200, 0.012);

    this.time.delayedCall(1200, () => { fire.destroy(); smoke.destroy(); });
  }

  pickupFx(obj) {
    const em = this.add.particles(obj.x, obj.y, 'spark', {
      speed: { min: 30, max: 80 },
      angle: { min: 0, max: 360 },
      scale: { start: 1, end: 0 },
      tint: obj.getData('cfg').color,
      lifespan: 300,
      quantity: 8,
      emitting: false
    }).setDepth(20);
    em.explode(8);
    this.time.delayedCall(400, () => em.destroy());
  }

  tickSmoke(car, chance) {
    if (!car.alive) return;
    if (car.hp >= car.maxHp * 0.3) return;
    if (Math.random() > chance) return;

    const em = this.add.particles(car.x, car.y, 'smoke', {
      speed: { min: 8, max: 25 },
      angle: { min: 240, max: 300 },
      scale: { start: 0.7, end: 0 },
      alpha: { start: 0.45, end: 0 },
      lifespan: { min: 300, max: 600 },
      quantity: 1,
      emitting: false
    }).setDepth(15);
    em.explode(1);
    this.time.delayedCall(700, () => em.destroy());
  }

  showFloatingText(x, y, text, color) {
    const t = this.add.text(x, y, text, {
      fontSize: '16px', fontFamily: 'monospace', color,
      stroke: '#000', strokeThickness: 3
    }).setOrigin(0.5).setDepth(30);

    this.tweens.add({
      targets: t, y: y - 40, alpha: 0,
      duration: 1400, onComplete: () => t.destroy()
    });
  }

  /* ============================================================= */
  /*  UTILITIES                                                     */
  /* ============================================================= */

  relativeSpeed(a, b) {
    return new Phaser.Math.Vector2(
      a.body.velocity.x - b.body.velocity.x,
      a.body.velocity.y - b.body.velocity.y
    ).length();
  }

  safePosition() {
    const margin = 70;
    return {
      x: margin + Math.random() * (CFG.GAME_WIDTH  - margin * 2),
      y: margin + Math.random() * (CFG.GAME_HEIGHT - margin * 2)
    };
  }

  relocateCar(car) {
    const safe = this.safePosition();
    car.setPosition(safe.x, safe.y);
    car.body.reset(safe.x, safe.y);
  }
}
