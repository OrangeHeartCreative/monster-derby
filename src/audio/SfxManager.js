/* -------------------------------------------------
 *  SfxManager – procedural sound effects via Web Audio API
 *  No external audio files needed.
 * ------------------------------------------------- */

let ctx = null;

/** Lazily creates and returns the shared AudioContext. */
function getCtx() {
  if (!ctx) {
    ctx = new (globalThis.AudioContext || globalThis.webkitAudioContext)();
  }
  return ctx;
}

/** Resume the AudioContext (must be called from a user gesture). */
export function resumeAudio() {
  const c = getCtx();
  if (c.state === 'suspended') c.resume();
}

/* ================================================================
 *  ENGINE LOOP
 *  Low rumbling oscillator whose pitch rises with speed.
 * ================================================================ */

let engineOsc = null;
let engineGain = null;
let engineRunning = false;

export function startEngine() {
  if (engineRunning) return;
  const c = getCtx();

  engineOsc = c.createOscillator();
  engineOsc.type = 'sawtooth';
  engineOsc.frequency.setValueAtTime(45, c.currentTime);

  engineGain = c.createGain();
  engineGain.gain.setValueAtTime(0.07, c.currentTime);

  const filter = c.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(250, c.currentTime);

  engineOsc.connect(filter);
  filter.connect(engineGain);
  engineGain.connect(c.destination);
  engineOsc.start();
  engineRunning = true;
}

/**
 * Update the engine pitch/volume based on current speed (0-1 normalised).
 * Call every frame while the game is playing.
 */
export function updateEngine(speedNorm) {
  if (!engineRunning) return;
  const c = getCtx();
  const t = c.currentTime;
  const freq = 45 + speedNorm * 65;
  const vol  = 0.04 + speedNorm * 0.06;
  engineOsc.frequency.setTargetAtTime(freq, t, 0.06);
  engineGain.gain.setTargetAtTime(vol, t, 0.06);
}

export function stopEngine() {
  if (!engineRunning) return;
  try { engineOsc.stop(); } catch (_) { /* already stopped */ }
  engineOsc = null;
  engineGain = null;
  engineRunning = false;
}

/* ================================================================
 *  COLLISION / CROWD ROAR
 *  Short burst of filtered noise + a crowd-like cheer.
 * ================================================================ */

export function playCrash(intensity) {
  const c = getCtx();
  const t = c.currentTime;
  const vol = 0.10 + Math.min(intensity, 1) * 0.18;
  const dur = 0.15 + Math.min(intensity, 1) * 0.15;

  /* --- metallic crunch (noise burst) --- */
  const bufLen = Math.ceil(c.sampleRate * dur);
  const buf = c.createBuffer(1, bufLen, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < bufLen; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / bufLen);
  }

  const noise = c.createBufferSource();
  noise.buffer = buf;

  const filt = c.createBiquadFilter();
  filt.type = 'bandpass';
  filt.frequency.setValueAtTime(800, t);
  filt.Q.setValueAtTime(1.5, t);

  const gain = c.createGain();
  gain.gain.setValueAtTime(vol, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + dur);

  noise.connect(filt);
  filt.connect(gain);
  gain.connect(c.destination);
  noise.start(t);
  noise.stop(t + dur);

  /* --- crowd roar (longer rumble of filtered noise) --- */
  const crowdDur = 0.35 + Math.min(intensity, 1) * 0.45;
  const crowdLen = Math.ceil(c.sampleRate * crowdDur);
  const crowdBuf = c.createBuffer(1, crowdLen, c.sampleRate);
  const crowdData = crowdBuf.getChannelData(0);
  for (let i = 0; i < crowdLen; i++) {
    crowdData[i] = (Math.random() * 2 - 1) * (1 - i / crowdLen);
  }

  const crowdSrc = c.createBufferSource();
  crowdSrc.buffer = crowdBuf;

  const crowdFilt = c.createBiquadFilter();
  crowdFilt.type = 'bandpass';
  crowdFilt.frequency.setValueAtTime(350, t);
  crowdFilt.Q.setValueAtTime(0.6, t);

  const crowdGain = c.createGain();
  crowdGain.gain.setValueAtTime(vol * 0.5, t);
  crowdGain.gain.setTargetAtTime(0.001, t + crowdDur * 0.4, crowdDur * 0.3);

  crowdSrc.connect(crowdFilt);
  crowdFilt.connect(crowdGain);
  crowdGain.connect(c.destination);
  crowdSrc.start(t);
  crowdSrc.stop(t + crowdDur);
}

/* ================================================================
 *  EXPLOSION
 *  Low-frequency boom + noise burst.
 * ================================================================ */

export function playExplosion() {
  const c = getCtx();
  const t = c.currentTime;

  /* --- boom (sine sweep down) --- */
  const osc = c.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(160, t);
  osc.frequency.exponentialRampToValueAtTime(30, t + 0.5);

  const oscGain = c.createGain();
  oscGain.gain.setValueAtTime(0.35, t);
  oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.55);

  osc.connect(oscGain);
  oscGain.connect(c.destination);
  osc.start(t);
  osc.stop(t + 0.6);

  /* --- crackle (noise burst) --- */
  const dur = 0.45;
  const bufLen = Math.ceil(c.sampleRate * dur);
  const buf = c.createBuffer(1, bufLen, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < bufLen; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufLen, 2);
  }

  const noise = c.createBufferSource();
  noise.buffer = buf;

  const filt = c.createBiquadFilter();
  filt.type = 'lowpass';
  filt.frequency.setValueAtTime(1200, t);
  filt.frequency.exponentialRampToValueAtTime(200, t + dur);

  const nGain = c.createGain();
  nGain.gain.setValueAtTime(0.28, t);
  nGain.gain.exponentialRampToValueAtTime(0.001, t + dur);

  noise.connect(filt);
  filt.connect(nGain);
  nGain.connect(c.destination);
  noise.start(t);
  noise.stop(t + dur);

  /* --- crowd roar (big cheer on destruction) --- */
  const crowdDur = 1.2;
  const crowdLen = Math.ceil(c.sampleRate * crowdDur);
  const crowdBuf = c.createBuffer(1, crowdLen, c.sampleRate);
  const crowdData = crowdBuf.getChannelData(0);
  for (let i = 0; i < crowdLen; i++) {
    /* shape: swell up then fade – simulates crowd reaction */
    const pos = i / crowdLen;
    const env = pos < 0.15 ? pos / 0.15 : Math.pow(1 - (pos - 0.15) / 0.85, 1.5);
    crowdData[i] = (Math.random() * 2 - 1) * env;
  }

  const crowdSrc = c.createBufferSource();
  crowdSrc.buffer = crowdBuf;

  /* band-pass keeps it in the "human voice" range */
  const crowdFilt = c.createBiquadFilter();
  crowdFilt.type = 'bandpass';
  crowdFilt.frequency.setValueAtTime(420, t);
  crowdFilt.Q.setValueAtTime(0.45, t);

  /* second filter adds body to the roar */
  const crowdFilt2 = c.createBiquadFilter();
  crowdFilt2.type = 'peaking';
  crowdFilt2.frequency.setValueAtTime(700, t);
  crowdFilt2.gain.setValueAtTime(6, t);
  crowdFilt2.Q.setValueAtTime(0.8, t);

  const crowdGain = c.createGain();
  crowdGain.gain.setValueAtTime(0.22, t);
  crowdGain.gain.setTargetAtTime(0.001, t + crowdDur * 0.5, crowdDur * 0.25);

  crowdSrc.connect(crowdFilt);
  crowdFilt.connect(crowdFilt2);
  crowdFilt2.connect(crowdGain);
  crowdGain.connect(c.destination);
  crowdSrc.start(t + 0.08);  /* tiny delay so boom hits first */
  crowdSrc.stop(t + crowdDur);
}
