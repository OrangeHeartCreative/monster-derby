/* -------------------------------------------------
 *  Crash Derby Monsters – Game Constants
 * ------------------------------------------------- */

export const GAME_WIDTH = 800;
export const GAME_HEIGHT = 600;

export const MONSTER_ROSTER = [
  {
    id: 'fang',
    name: 'Fang',
    textureKey: 'monster_fang',
    color: 0x22cc22,
    stats: { maxSpeed: 260, acceleration: 360, drag: 320, turnSpeed: 155, bounce: 0.62, hp: 95, sideGrip: 0.92, sideGripBrake: 0.96 }
  },
  {
    id: 'brute',
    name: 'Brute',
    textureKey: 'monster_brute',
    color: 0xcc2222,
    stats: { maxSpeed: 225, acceleration: 320, drag: 360, turnSpeed: 135, bounce: 0.58, hp: 130, sideGrip: 0.93, sideGripBrake: 0.97 }
  },
  {
    id: 'viper',
    name: 'Viper',
    textureKey: 'monster_viper',
    color: 0x22aaff,
    stats: { maxSpeed: 285, acceleration: 410, drag: 280, turnSpeed: 165, bounce: 0.66, hp: 85, sideGrip: 0.90, sideGripBrake: 0.95 }
  },
  {
    id: 'magma',
    name: 'Magma',
    textureKey: 'monster_magma',
    color: 0xff6622,
    stats: { maxSpeed: 245, acceleration: 355, drag: 340, turnSpeed: 145, bounce: 0.64, hp: 110, sideGrip: 0.92, sideGripBrake: 0.96 }
  },
  {
    id: 'specter',
    name: 'Specter',
    textureKey: 'monster_specter',
    color: 0x9933cc,
    stats: { maxSpeed: 275, acceleration: 390, drag: 300, turnSpeed: 175, bounce: 0.65, hp: 90, sideGrip: 0.91, sideGripBrake: 0.95 }
  },
  {
    id: 'titan',
    name: 'Titan',
    textureKey: 'monster_titan',
    color: 0x777777,
    stats: { maxSpeed: 215, acceleration: 300, drag: 380, turnSpeed: 125, bounce: 0.56, hp: 140, sideGrip: 0.94, sideGripBrake: 0.97 }
  },
  {
    id: 'blitz',
    name: 'Blitz',
    textureKey: 'monster_blitz',
    color: 0xffcc00,
    stats: { maxSpeed: 295, acceleration: 430, drag: 260, turnSpeed: 170, bounce: 0.68, hp: 80, sideGrip: 0.90, sideGripBrake: 0.94 }
  },
  {
    id: 'thorn',
    name: 'Thorn',
    textureKey: 'monster_thorn',
    color: 0x22aa55,
    stats: { maxSpeed: 250, acceleration: 345, drag: 335, turnSpeed: 150, bounce: 0.62, hp: 115, sideGrip: 0.92, sideGripBrake: 0.96 }
  }
];

export const GAMEPLAY = {
  OPPONENT_COUNT: 4
};

/* ---------- Arena ---------- */
export const ARENA = {
  WALL_THICKNESS: 20,
  INNER_X: 22,
  INNER_Y: 22,
  INNER_W: 756,
  INNER_H: 556
};

/* ---------- Player ---------- */
export const PLAYER = {
  MAX_SPEED: 250,
  ACCELERATION: 360,
  DRAG: 320,
  TURN_SPEED: 155,        // degrees / s
  BOUNCE: 0.65,
  SIDE_GRIP: 0.92,
  SIDE_GRIP_BRAKE: 0.96,
  HP: 100
};

/* ---------- AI ---------- */
export const AI = {
  MAX_SPEED: 200,
  ACCELERATION: 350,
  DRAG: 260,
  TURN_SPEED: 160,
  BOUNCE: 0.65,
  HP: 80,
  TARGET_SWITCH_TIME: 2000,
  AGGRESSION: 0.35         // base chance to target player
};

/* ---------- Combat ---------- */
export const COMBAT = {
  COLLISION_DAMAGE_FACTOR: 0.12,
  MIN_COLLISION_SPEED: 60,
  INVULNERABILITY_MS: 500
};

/* ---------- Powerups ---------- */
export const POWERUPS = {
  SPAWN_INTERVAL: 6000,
  MAX_COUNT: 3,
  TYPES: {
    SPEED:    { duration: 5000, multiplier: 1.6, color: 0x00ff00, name: 'SPEED BOOST' },
    SHIELD:   { hits: 2, color: 0x4488ff, name: 'SHIELD' },
    MEGA_RAM: { duration: 6000, multiplier: 3,   color: 0xff4444, name: 'MEGA RAM' }
  }
};

/* ---------- Pitfalls ---------- */
export const PITFALLS = {
  SPAWN_INTERVAL: 8000,
  MAX_COUNT: 4,
  TYPES: {
    OIL_SLICK:   { duration: 900, color: 0x886622, name: 'OIL SLICK' },
    PIT_HOLE:    { damage: 30,     color: 0x111111, name: 'PIT HOLE' },
    SPIKE_STRIP: { damage: 15,     color: 0xff8800, name: 'SPIKES' }
  }
};

/* ---------- Scoring ---------- */
export const SCORE = {
  HIT: 10,
  DESTROY: 100,
  POWERUP: 50,
  COMBO_WINDOW: 2000,
  COMBO_MULTIPLIER: 0.5
};

/* ---------- Colours ---------- */
export const COLORS = {
  PLAYER: 0x22cc22,
  AI: [0xcc2222, 0x2255dd, 0xaa22cc, 0xdd8822],
  ARENA_FLOOR: 0x3a3a2a,
  ARENA_WALL: 0x666666,
  OBSTACLE: 0x555555
};
