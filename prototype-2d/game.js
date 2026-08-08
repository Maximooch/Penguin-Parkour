const canvas = document.querySelector('#game');
const ctx = canvas.getContext('2d');
const startScreen = document.querySelector('#start-screen');
const startButton = document.querySelector('#start-button');
const audioToggle = document.querySelector('#audio-toggle');
const objective = document.querySelector('#objective');
const levelLabel = document.querySelector('#level-label');
const status = document.querySelector('#status');
const toast = document.querySelector('#toast');
const shardDots = [...document.querySelectorAll('.shard-dot')];

let width = window.innerWidth;
let height = window.innerHeight;
let dpr = Math.min(window.devicePixelRatio || 1, 2);
let lastTime = 0;
let toastTimer;
let platforms = [];
let shards = [];
let glyphs = [];
let door = null;

const keys = new Set();
const justPressed = new Set();
const images = { idle: [], run: [] };
const spriteSources = {
  idle: ['frame_00.png', 'frame_01.png', 'frame_02.png'],
  run: ['frame_00.png', 'frame_01.png', 'frame_02.png', 'frame_03.png', 'frame_04.png', 'frame_05.png'],
};

const levels = [
  {
    name: 'The Drowned Steps',
    themeLabel: 'low tide / first light',
    startX: 120,
    checkpointX: 1000,
    worldWidth: 2720,
    music: 'assets/audio/music/drowned-steps.ogg',
    door: { x: 2205, y: 285, w: 82, h: 100 },
    palette: { skyTop: '#122c3a', skyBottom: '#07131d', mountainA: '#142f3a', mountainB: '#0e2731', ruins: 'rgba(24, 55, 59, .85)', surface: '#28565a', edge: '#5a8b7a', glyph: 'rgba(121,208,196,.34)', moon: '#d7d9bd' },
    platforms: [
      { x: -80, y: 548, w: 450, h: 60, type: 'ground' }, { x: 418, y: 475, w: 145, h: 18 },
      { x: 610, y: 405, w: 150, h: 18 }, { x: 820, y: 500, w: 145, h: 18 },
      { x: 1000, y: 420, w: 175, h: 18 }, { x: 1215, y: 326, w: 165, h: 18 },
      { x: 1430, y: 438, w: 150, h: 18 }, { x: 1610, y: 355, w: 195, h: 18 },
      { x: 1850, y: 470, w: 175, h: 18 }, { x: 2070, y: 385, w: 190, h: 18 },
      { x: 2320, y: 510, w: 400, h: 60, type: 'ground' },
    ],
    shards: [{ x: 475, y: 430, label: 'the tide shard' }, { x: 1280, y: 280, label: 'the sunken shard' }, { x: 1695, y: 308, label: 'the listening shard' }],
    glyphs: [{ x: 575, y: 515, s: 1.1 }, { x: 785, y: 510, s: .7 }, { x: 1160, y: 385, s: .9 }, { x: 1388, y: 505, s: 1.2 }, { x: 1795, y: 520, s: .8 }, { x: 2255, y: 470, s: 1.15 }],
  },
  {
    name: 'The Bell Gallery',
    themeLabel: 'wind through the high halls',
    startX: 120,
    checkpointX: 1480,
    worldWidth: 3140,
    music: 'assets/audio/music/bell-gallery.ogg',
    door: { x: 2930, y: 395, w: 82, h: 100 },
    palette: { skyTop: '#172d3c', skyBottom: '#08141e', mountainA: '#1a3542', mountainB: '#102936', ruins: 'rgba(29, 61, 68, .88)', surface: '#315e62', edge: '#78a28d', glyph: 'rgba(233,184,110,.34)', moon: '#e2d2a7' },
    platforms: [
      { x: -80, y: 548, w: 300, h: 60, type: 'ground' }, { x: 300, y: 460, w: 150, h: 18 },
      { x: 530, y: 380, w: 125, h: 18 }, { x: 750, y: 300, w: 150, h: 18 },
      { x: 980, y: 415, w: 175, h: 18 }, { x: 1230, y: 335, w: 140, h: 18 },
      { x: 1450, y: 255, w: 170, h: 18 }, { x: 1700, y: 370, w: 155, h: 18 },
      { x: 1920, y: 285, w: 160, h: 18 }, { x: 2140, y: 425, w: 210, h: 18 },
      { x: 2440, y: 320, w: 180, h: 18 }, { x: 2740, y: 500, w: 470, h: 60, type: 'ground' },
    ],
    shards: [{ x: 360, y: 415, label: 'the bell shard' }, { x: 1535, y: 210, label: 'the high shard' }, { x: 2500, y: 275, label: 'the wind shard' }],
    glyphs: [{ x: 280, y: 515, s: .8 }, { x: 675, y: 505, s: .9 }, { x: 920, y: 500, s: 1.2 }, { x: 1400, y: 490, s: .75 }, { x: 1860, y: 505, s: 1 }, { x: 2385, y: 510, s: .9 }, { x: 2680, y: 500, s: 1.1 }],
  },
  {
    name: 'The Blue Archive',
    themeLabel: 'the ice remembers',
    startX: 120,
    checkpointX: 1520,
    worldWidth: 3320,
    music: 'assets/audio/music/blue-archive.ogg',
    door: { x: 3110, y: 260, w: 82, h: 100 },
    palette: { skyTop: '#142b43', skyBottom: '#070f1e', mountainA: '#183555', mountainB: '#10283d', ruins: 'rgba(25, 57, 78, .9)', surface: '#315f70', edge: '#75a7a8', glyph: 'rgba(137,193,224,.36)', moon: '#c4d7de' },
    platforms: [
      { x: -80, y: 548, w: 330, h: 60, type: 'ground' }, { x: 350, y: 470, w: 130, h: 18 },
      { x: 565, y: 385, w: 150, h: 18 }, { x: 800, y: 465, w: 140, h: 18 },
      { x: 1040, y: 345, w: 165, h: 18 }, { x: 1280, y: 250, w: 145, h: 18 },
      { x: 1510, y: 400, w: 165, h: 18 }, { x: 1750, y: 300, w: 140, h: 18 },
      { x: 1970, y: 205, w: 170, h: 18 }, { x: 2210, y: 330, w: 155, h: 18 },
      { x: 2440, y: 440, w: 185, h: 18 }, { x: 2700, y: 350, w: 160, h: 18 },
      { x: 2940, y: 270, w: 190, h: 18 }, { x: 3160, y: 510, w: 350, h: 60, type: 'ground' },
    ],
    shards: [{ x: 610, y: 320, label: 'the ink shard' }, { x: 2045, y: 140, label: 'the archive shard' }, { x: 2775, y: 285, label: 'the memory shard' }],
    glyphs: [{ x: 500, y: 520, s: .8 }, { x: 965, y: 515, s: 1.1 }, { x: 1220, y: 500, s: .7 }, { x: 1690, y: 500, s: 1 }, { x: 2160, y: 490, s: .9 }, { x: 2385, y: 515, s: 1.2 }, { x: 2890, y: 500, s: .75 }],
  },
];

const state = {
  started: false,
  won: false,
  levelIndex: 0,
  shards: 0,
  checkpoint: 120,
  checkpointY: 500,
  cameraX: 0,
  particles: [],
};

const player = {
  x: 120, y: 448, w: 34, h: 48, vx: 0, vy: 0,
  grounded: false, coyote: 0, jumpBuffer: 0, jumps: 0, dashAvailable: true,
  dashTimer: 0, facing: 1, frame: 0,
};

const audioState = {
  music: null,
  musicSource: '',
  muted: false,
  volume: .42,
  context: null,
  sfx: {},
};

function currentLevel() { return levels[state.levelIndex]; }

function spawnYAt(x) {
  const platform = platforms
    .filter((candidate) => x + 24 > candidate.x && x + 10 < candidate.x + candidate.w)
    .sort((a, b) => a.y - b.y)[0];
  return platform ? platform.y - player.h - 2 : 440;
}

function resize() {
  width = window.innerWidth;
  height = window.innerHeight;
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.floor(width * dpr);
  canvas.height = Math.floor(height * dpr);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function loadSprites() {
  return Promise.all(Object.entries(spriteSources).flatMap(([mode, files]) => files.map((file) => new Promise((resolve) => {
    const image = new Image();
    image.onload = () => { images[mode].push(image); resolve(); };
    image.onerror = resolve;
    image.src = `assets/penguin/${mode}/${file}`;
  }))));
}

function prepareAudio() {
  audioState.sfx.jump = new Audio('assets/audio/sfx/jump.wav');
  audioState.sfx.land = new Audio('assets/audio/sfx/land.wav');
  Object.values(audioState.sfx).forEach((sound) => { sound.preload = 'auto'; sound.volume = .34; });
}

function unlockAudio() {
  if (!audioState.context) audioState.context = new (window.AudioContext || window.webkitAudioContext)();
  if (audioState.context.state === 'suspended') audioState.context.resume();
}

function playSfx(name, rate = 1) {
  if (audioState.muted || !audioState.sfx[name]) return;
  const sound = audioState.sfx[name].cloneNode();
  sound.volume = .34;
  sound.playbackRate = rate;
  sound.play().catch(() => {});
}

function playTone(frequency, duration = .12, type = 'sine', volume = .035) {
  if (audioState.muted) return;
  unlockAudio();
  const oscillator = audioState.context.createOscillator();
  const gain = audioState.context.createGain();
  oscillator.type = type;
  oscillator.frequency.value = frequency;
  gain.gain.setValueAtTime(volume, audioState.context.currentTime);
  gain.gain.exponentialRampToValueAtTime(.001, audioState.context.currentTime + duration);
  oscillator.connect(gain).connect(audioState.context.destination);
  oscillator.start();
  oscillator.stop(audioState.context.currentTime + duration);
}

function setMusic(source) {
  if (audioState.musicSource === source && audioState.music) {
    if (state.started && !audioState.muted) audioState.music.play().catch(() => {});
    return;
  }
  if (audioState.music) {
    audioState.music.pause();
    audioState.music.currentTime = 0;
  }
  audioState.musicSource = source;
  audioState.music = new Audio(source);
  audioState.music.loop = true;
  audioState.music.volume = audioState.volume;
  if (state.started && !audioState.muted) audioState.music.play().catch(() => {});
}

function toggleAudio() {
  audioState.muted = !audioState.muted;
  audioToggle.textContent = audioState.muted ? 'sound off' : 'sound on';
  audioToggle.classList.toggle('is-muted', audioState.muted);
  audioToggle.setAttribute('aria-pressed', String(audioState.muted));
  if (audioState.muted) {
    if (audioState.music) audioState.music.pause();
  } else {
    unlockAudio();
    if (audioState.music && state.started) audioState.music.play().catch(() => {});
  }
}

function resetPlayer() {
  player.x = state.checkpoint;
  player.y = state.checkpointY;
  player.vx = 0;
  player.vy = 0;
  player.grounded = false;
  player.coyote = 0;
  player.jumpBuffer = 0;
  player.dashTimer = 0;
  player.dashAvailable = true;
  player.jumps = 0;
  updateHud();
}

function loadLevel(index, announce = true) {
  const level = levels[index];
  state.levelIndex = index;
  state.shards = 0;
  state.checkpoint = level.startX;
  state.cameraX = 0;
  state.won = false;
  platforms = level.platforms;
  shards = level.shards.map((shard) => ({ ...shard, collected: false }));
  glyphs = level.glyphs;
  door = { ...level.door };
  state.checkpointY = spawnYAt(level.startX);
  resetPlayer();
  setMusic(level.music);
  updateHud();
  if (announce) showToast(`${level.name} · ${level.themeLabel}`);
}

function begin() {
  if (state.started) return;
  state.started = true;
  startScreen.classList.add('hidden');
  unlockAudio();
  setMusic(currentLevel().music);
  showToast('The first hall is still warm.');
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2800);
}

function updateHud() {
  const level = currentLevel();
  shardDots.forEach((dot, i) => dot.classList.toggle('collected', i < state.shards));
  levelLabel.textContent = `level ${String(state.levelIndex + 1).padStart(2, '0')} · ${level.name.toLowerCase()}`;
  objective.textContent = state.won ? 'The observatory is awake' : state.shards === shards.length ? 'Reach the moon door' : `Find the three lantern shards · ${state.shards}/3`;
  status.textContent = state.won ? 'A new constellation answers.' : state.shards === shards.length ? 'The moon door remembers your name.' : player.dashAvailable ? level.themeLabel : 'A breath, then another leap.';
}

function handleInput() {
  if (justPressed.has('Enter') && !state.started) begin();
  if (justPressed.has('KeyR')) {
    loadLevel(state.levelIndex);
    if (!state.started) begin();
    showToast('The expedition begins again.');
  }
  if (!state.started || state.won) return;

  const left = keys.has('ArrowLeft') || keys.has('KeyA');
  const right = keys.has('ArrowRight') || keys.has('KeyD');
  const jumpPressed = justPressed.has('Space') || justPressed.has('ArrowUp') || justPressed.has('KeyW');
  if (jumpPressed) player.jumpBuffer = .12;
  if (player.jumpBuffer > 0) {
    if (player.grounded || player.coyote > 0) {
      player.vy = -12.4;
      player.grounded = false;
      player.coyote = 0;
      player.jumpBuffer = 0;
      player.jumps = 1;
      playSfx('jump', 1.04);
      burst(player.x + player.w / 2, player.y + player.h, 5, '#d9c79e');
    } else if (player.jumps < 2) {
      player.vy = -11.2;
      player.jumps = 2;
      player.jumpBuffer = 0;
      playTone(520, .14, 'triangle', .045);
      burst(player.x + player.w / 2, player.y + player.h / 2, 8, '#79d0c4');
      showToast('Second wind.');
    }
  }
  if (justPressed.has('ShiftLeft') || justPressed.has('ShiftRight')) {
    if (player.dashAvailable) {
      const direction = right ? 1 : left ? -1 : player.facing;
      player.vx = direction * 13;
      player.vy *= .25;
      player.dashTimer = .13;
      player.dashAvailable = false;
      playTone(180, .18, 'sawtooth', .04);
      burst(player.x + player.w / 2, player.y + player.h / 2, 12, '#e9b86e');
    }
  }
}

function update(dt) {
  handleInput();
  justPressed.clear();
  if (!state.started || state.won) {
    updateParticles(dt);
    return;
  }

  const level = currentLevel();
  player.jumpBuffer = Math.max(0, player.jumpBuffer - dt);
  const left = keys.has('ArrowLeft') || keys.has('KeyA');
  const right = keys.has('ArrowRight') || keys.has('KeyD');
  const direction = (right ? 1 : 0) - (left ? 1 : 0);
  if (direction) {
    player.vx += direction * 0.72 * dt * 60;
    player.vx = Math.max(-6.3, Math.min(6.3, player.vx));
    player.facing = direction;
  } else if (player.dashTimer <= 0) {
    player.vx *= Math.pow(.78, dt * 60);
  }
  if (player.dashTimer > 0) player.dashTimer -= dt;
  player.vy += 0.58 * dt * 60;
  player.vy = Math.min(player.vy, 16);
  player.coyote = Math.max(0, player.coyote - dt);

  const previousBottom = player.y + player.h;
  const wasGrounded = player.grounded;
  player.x += player.vx * dt * 60;
  player.y += player.vy * dt * 60;
  player.grounded = false;

  for (const platform of platforms) {
    const overlapsX = player.x + player.w - 5 > platform.x && player.x + 5 < platform.x + platform.w;
    const crossesTop = previousBottom <= platform.y + 5 && player.y + player.h >= platform.y;
    if (overlapsX && crossesTop && player.vy >= 0) {
      if (!wasGrounded && player.vy > 1) playSfx('land', .92 + Math.random() * .12);
      player.y = platform.y - player.h;
      player.vy = 0;
      player.grounded = true;
      player.coyote = .11;
      player.jumps = 0;
      player.dashAvailable = true;
    }
  }

  if (player.y > 700) {
    resetPlayer();
    showToast('The tide took you back to the last marker.');
  }
  if (player.x > level.checkpointX && state.checkpoint < level.checkpointX) {
    state.checkpoint = level.checkpointX;
    state.checkpointY = spawnYAt(level.checkpointX);
    showToast('Checkpoint marked in salt.');
  }
  for (const shard of shards) {
    if (!shard.collected && Math.hypot(player.x + player.w / 2 - shard.x, player.y + player.h / 2 - shard.y) < 35) {
      shard.collected = true;
      state.shards += 1;
      playTone(720 + state.shards * 80, .22, 'sine', .05);
      burst(shard.x, shard.y, 18, '#ffd596');
      showToast(`${shard.label} joins your lantern.`);
      updateHud();
    }
  }
  if (state.shards === shards.length && player.x > door.x - 20 && player.x < door.x + door.w && player.y < door.y + door.h) {
    if (state.levelIndex < levels.length - 1) {
      playTone(880, .32, 'sine', .05);
      loadLevel(state.levelIndex + 1);
    } else {
      state.won = true;
      playTone(1040, .5, 'sine', .06);
      burst(player.x + player.w / 2, player.y + player.h / 2, 44, '#ffd596');
      showToast('The observatory opens. You made it.');
      updateHud();
    }
  }

  const maxCamera = Math.max(0, level.worldWidth - width * .52);
  state.cameraX += (player.x - width * .34 - state.cameraX) * Math.min(1, dt * 4.5);
  state.cameraX = Math.max(0, Math.min(maxCamera, state.cameraX));
  player.frame += dt * (Math.abs(player.vx) > .4 ? 11 : 3);
  updateParticles(dt);
  updateHud();
}

function burst(x, y, count, color) {
  for (let i = 0; i < count; i += 1) {
    state.particles.push({ x, y, vx: (Math.random() - .5) * 4, vy: (Math.random() - .75) * 4, life: .35 + Math.random() * .5, max: .7, color, size: 1 + Math.random() * 2.5 });
  }
}

function updateParticles(dt) {
  state.particles = state.particles.filter((p) => {
    p.life -= dt;
    p.x += p.vx * dt * 60;
    p.y += p.vy * dt * 60;
    p.vy += .06 * dt * 60;
    return p.life > 0;
  });
}

function drawBackground() {
  const palette = currentLevel().palette;
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, palette.skyTop);
  gradient.addColorStop(.56, '#0b202a');
  gradient.addColorStop(1, palette.skyBottom);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  ctx.save();
  for (let i = 0; i < 48; i += 1) {
    const x = (i * 163 - state.cameraX * .08) % (width + 40);
    const y = 70 + ((i * 71) % Math.max(130, height * .48));
    ctx.fillStyle = i % 6 === 0 ? '#e9b86e' : '#9cc8c0';
    ctx.globalAlpha = i % 6 === 0 ? .45 : .18;
    ctx.fillRect(x < -5 ? x + width + 40 : x, y, i % 4 === 0 ? 2 : 1, i % 4 === 0 ? 2 : 1);
  }
  ctx.restore();

  drawMountainLayer(.12, height * .58, palette.mountainA, 150, 190);
  drawMountainLayer(.22, height * .7, palette.mountainB, 110, 120);
  drawMoon(palette.moon);
}

function drawMountainLayer(speed, base, color, step, peak) {
  ctx.save();
  ctx.translate(-(state.cameraX * speed) % step, 0);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(-step, height);
  for (let x = -step; x < width + step * 2; x += step) {
    ctx.lineTo(x, base);
    ctx.lineTo(x + step * .5, base - peak * (0.55 + ((x / step) % 2) * .25));
    ctx.lineTo(x + step, base);
  }
  ctx.lineTo(width + step * 2, height);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawMoon(color) {
  const moonX = width * .78 - state.cameraX * .03;
  const moonY = height * .2;
  const glow = ctx.createRadialGradient(moonX, moonY, 8, moonX, moonY, 90);
  glow.addColorStop(0, 'rgba(255,225,164,.25)');
  glow.addColorStop(1, 'rgba(255,225,164,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(moonX - 100, moonY - 100, 200, 200);
  ctx.fillStyle = color;
  ctx.globalAlpha = .78;
  ctx.beginPath(); ctx.arc(moonX, moonY, 31, 0, Math.PI * 2); ctx.fill();
  ctx.globalAlpha = 1;
  ctx.fillStyle = '#b6c2ab';
  ctx.globalAlpha = .3;
  ctx.beginPath(); ctx.arc(moonX - 11, moonY - 7, 7, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(moonX + 12, moonY + 12, 10, 0, Math.PI * 2); ctx.fill();
  ctx.globalAlpha = 1;
}

function drawRuins() {
  const palette = currentLevel().palette;
  ctx.save();
  ctx.translate(-state.cameraX, 0);
  for (let x = -40; x < currentLevel().worldWidth; x += 190) {
    const h = 65 + ((x / 190) % 3) * 26;
    ctx.fillStyle = palette.ruins;
    ctx.fillRect(x, 548 - h, 17, h);
    ctx.fillRect(x + 49, 548 - h * .86, 17, h * .86);
    ctx.fillRect(x - 4, 548 - h, 74, 9);
    ctx.fillStyle = 'rgba(7, 18, 24, .55)';
    ctx.fillRect(x + 20, 548 - h + 14, 24, h - 14);
  }
  ctx.restore();
}

function drawPlatforms() {
  const palette = currentLevel().palette;
  ctx.save();
  ctx.translate(-state.cameraX, 0);
  for (const platform of platforms) {
    ctx.fillStyle = platform.type === 'ground' ? '#173e42' : palette.surface;
    ctx.fillRect(platform.x, platform.y, platform.w, platform.h);
    ctx.fillStyle = platform.type === 'ground' ? '#3f7870' : palette.edge;
    ctx.fillRect(platform.x, platform.y, platform.w, 3);
    ctx.fillStyle = 'rgba(11,31,35,.55)';
    for (let x = platform.x + 13; x < platform.x + platform.w - 5; x += 38) ctx.fillRect(x, platform.y + 8, 2, platform.h - 8);
  }
  ctx.restore();
}

function drawGlyphs() {
  ctx.save();
  ctx.translate(-state.cameraX, 0);
  for (const glyph of glyphs) {
    ctx.save();
    ctx.translate(glyph.x, glyph.y);
    ctx.scale(glyph.s, glyph.s);
    ctx.strokeStyle = currentLevel().palette.glyph;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.arc(0, 0, 15, 0, Math.PI * 2);
    ctx.moveTo(-9, 0); ctx.lineTo(9, 0); ctx.moveTo(0, -9); ctx.lineTo(0, 9);
    ctx.moveTo(-7, -7); ctx.lineTo(7, 7); ctx.moveTo(7, -7); ctx.lineTo(-7, 7);
    ctx.stroke();
    ctx.restore();
  }
  ctx.restore();
}

function drawShards() {
  ctx.save();
  ctx.translate(-state.cameraX, 0);
  shards.forEach((shard, index) => {
    if (shard.collected) return;
    const pulse = Math.sin(performance.now() / 380 + index) * 3;
    ctx.shadowColor = '#ffd596'; ctx.shadowBlur = 20;
    ctx.fillStyle = '#f2c67f';
    ctx.beginPath();
    ctx.moveTo(shard.x, shard.y - 17 - pulse);
    ctx.lineTo(shard.x + 9, shard.y);
    ctx.lineTo(shard.x, shard.y + 18 + pulse);
    ctx.lineTo(shard.x - 9, shard.y);
    ctx.closePath(); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = 'rgba(255,239,195,.75)';
    ctx.stroke();
  });
  ctx.restore();
}

function drawDoor() {
  ctx.save();
  ctx.translate(-state.cameraX, 0);
  const unlocked = state.shards === shards.length;
  ctx.fillStyle = unlocked ? 'rgba(233,184,110,.16)' : 'rgba(10,26,31,.8)';
  ctx.strokeStyle = unlocked ? '#e9b86e' : '#5b7d75';
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.roundRect(door.x, door.y, door.w, door.h, 40); ctx.fill(); ctx.stroke();
  ctx.strokeStyle = unlocked ? '#ffd596' : 'rgba(121,208,196,.4)';
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.arc(door.x + 41, door.y + 49, 18, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(door.x + 26, door.y + 49); ctx.lineTo(door.x + 56, door.y + 49); ctx.moveTo(door.x + 41, door.y + 34); ctx.lineTo(door.x + 41, door.y + 64); ctx.stroke();
  ctx.fillStyle = '#bdc9b4'; ctx.font = '10px DM Mono, monospace'; ctx.fillText('MOON DOOR', door.x - 3, door.y - 12);
  ctx.restore();
}

function drawPlayer() {
  const spriteSize = 88;
  const x = player.x - state.cameraX + player.w / 2 - spriteSize / 2;
  const y = player.y + player.h - spriteSize - 1;
  const mode = Math.abs(player.vx) > .45 ? 'run' : 'idle';
  const frames = images[mode];
  const image = frames.length ? frames[Math.floor(player.frame) % frames.length] : null;
  ctx.save();
  if (player.dashTimer > 0) {
    ctx.globalAlpha = .18;
    ctx.fillStyle = '#e9b86e';
    ctx.fillRect(x - player.facing * 25, y + 14, 55, 26);
    ctx.globalAlpha = 1;
  }
  ctx.translate(x + spriteSize / 2, y + spriteSize / 2);
  ctx.scale(player.facing, 1);
  ctx.translate(-spriteSize / 2, -spriteSize / 2);
  if (image) {
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(image, 0, 0, spriteSize, spriteSize);
  } else {
    drawFallbackPenguin(spriteSize / 2, spriteSize / 2);
  }
  ctx.restore();
}

function drawFallbackPenguin(x, y) {
  ctx.fillStyle = '#d7ded5'; ctx.beginPath(); ctx.ellipse(x, y, 16, 22, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#1b2c34'; ctx.beginPath(); ctx.ellipse(x, y - 5, 12, 17, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#f0c377'; ctx.beginPath(); ctx.moveTo(x + 12, y - 5); ctx.lineTo(x + 22, y); ctx.lineTo(x + 12, y + 4); ctx.fill();
  ctx.fillStyle = '#e9b86e'; ctx.fillRect(x - 12, y + 18, 9, 3); ctx.fillRect(x + 4, y + 18, 9, 3);
}

function drawParticles() {
  ctx.save(); ctx.translate(-state.cameraX, 0);
  for (const p of state.particles) {
    ctx.globalAlpha = Math.max(0, p.life / p.max);
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x, p.y, p.size, p.size);
  }
  ctx.restore(); ctx.globalAlpha = 1;
}

function render() {
  ctx.clearRect(0, 0, width, height);
  drawBackground();
  drawRuins();
  drawGlyphs();
  drawPlatforms();
  drawDoor();
  drawShards();
  drawParticles();
  drawPlayer();
  if (state.won) {
    ctx.fillStyle = 'rgba(7,19,26,.42)'; ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = '#f8e8c6'; ctx.textAlign = 'center';
    ctx.font = '500 13px DM Mono, monospace'; ctx.fillText('THE OLD LIGHT REMEMBERS', width / 2, height / 2 - 16);
    ctx.font = '500 42px Georgia, serif'; ctx.fillText('Expedition complete', width / 2, height / 2 + 30);
    ctx.textAlign = 'left';
  }
}

function frame(time) {
  const dt = Math.min(.033, (time - lastTime) / 1000 || .016);
  lastTime = time;
  update(dt);
  render();
  requestAnimationFrame(frame);
}

window.addEventListener('resize', resize);
window.addEventListener('keydown', (event) => {
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(event.code)) event.preventDefault();
  if (!keys.has(event.code)) justPressed.add(event.code);
  keys.add(event.code);
});
window.addEventListener('keyup', (event) => keys.delete(event.code));
startButton.addEventListener('click', begin);
audioToggle.addEventListener('click', toggleAudio);
resize();
prepareAudio();
loadLevel(0, false);
loadSprites().then(() => requestAnimationFrame(frame));
