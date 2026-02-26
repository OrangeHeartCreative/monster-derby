/* -------------------------------------------------
 *  Monster Derby – Game Constants
 * ------------------------------------------------- */

export const GAME_WIDTH = 800;
export const GAME_HEIGHT = 600;

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
  ACCELERATION: 400,
  DRAG: 200,
  TURN_SPEED: 180,        // degrees / s
  BOUNCE: 0.8,
  HP: 100
};

/* ---------- AI ---------- */
export const AI = {
  MAX_SPEED: 200,
  ACCELERATION: 350,
  DRAG: 200,
  TURN_SPEED: 160,
  BOUNCE: 0.8,
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
    OIL_SLICK:   { duration: 1500, color: 0x886622, name: 'OIL SLICK' },
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
