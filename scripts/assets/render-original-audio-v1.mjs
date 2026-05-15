import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const sampleRate = 32_000;
const TAU = Math.PI * 2;

const specs = [
  music("music/menu_loop.wav", 18, 44, 72, "boot"),
  music("music/alignment_grid_loop.wav", 18, 39, 64, "grid"),
  music("music/briefing_draft_loop.wav", 14, 48, 58, "briefing"),
  music("music/run_armistice_base.wav", 16, 52, 88, "run"),
  music("music/run_kettle_base.wav", 16, 47, 82, "coast"),
  music("music/run_transit_base.wav", 16, 55, 112, "transit"),
  music("music/run_archive_base.wav", 16, 41, 76, "archive"),
  music("music/threat_layer.wav", 16, 60, 124, "threat"),
  music("music/boss_layer.wav", 16, 36, 92, "boss"),
  music("music/extraction_layer.wav", 12, 58, 132, "extraction"),
  sfx("stingers/boss_warning.wav", 1.65, "boss_warning"),
  sfx("stingers/objective_complete.wav", 1.25, "objective_complete"),
  sfx("stingers/evolution_major.wav", 1.55, "evolution"),
  sfx("stingers/extraction_open.wav", 1.35, "extraction_open"),
  sfx("stingers/summary_victory.wav", 1.5, "victory"),
  sfx("stingers/summary_failed.wav", 1.45, "death"),
  sfx("sfx/ui_click.wav", 0.22, "ui_click"),
  sfx("sfx/ui_confirm.wav", 0.32, "ui_confirm"),
  sfx("sfx/ui_locked.wav", 0.42, "ui_locked"),
  sfx("sfx/draft_card.wav", 0.5, "draft"),
  sfx("sfx/reroll.wav", 0.58, "reroll"),
  sfx("sfx/pickup_shard.wav", 0.36, "pickup"),
  sfx("sfx/cache_open.wav", 0.68, "cache"),
  sfx("sfx/weapon_hit.wav", 0.28, "weapon_hit"),
  sfx("sfx/weapons/refusal_shard_hit.wav", 0.24, "weapon_refusal"),
  sfx("sfx/weapons/safety_cannon_hit.wav", 0.34, "weapon_cannon"),
  sfx("sfx/weapons/fork_drone_hit.wav", 0.22, "weapon_drone"),
  sfx("sfx/weapons/signal_pulse_hit.wav", 0.32, "weapon_signal"),
  sfx("sfx/weapons/bonecode_saw_hit.wav", 0.3, "weapon_saw"),
  sfx("sfx/weapons/vector_lance_hit.wav", 0.26, "weapon_lance"),
  sfx("sfx/weapons/rift_mine_hit.wav", 0.42, "weapon_mine"),
  sfx("sfx/weapons/causal_railgun_hit.wav", 0.46, "weapon_railgun"),
  sfx("sfx/weapons/signal_choir_hit.wav", 0.48, "weapon_choir"),
  sfx("sfx/weapons/time_minefield_hit.wav", 0.52, "weapon_time_minefield"),
  sfx("sfx/player_damage.wav", 0.42, "damage"),
  sfx("sfx/player/contact_damage.wav", 0.3, "player_contact"),
  sfx("sfx/player/projectile_damage.wav", 0.36, "player_projectile"),
  sfx("sfx/player/corruption_burn.wav", 0.46, "player_burn"),
  sfx("sfx/player/boss_charge_damage.wav", 0.58, "player_boss_charge"),
  sfx("sfx/consensus_burst.wav", 0.9, "burst"),
  sfx("sfx/objective_tick.wav", 0.3, "objective_tick"),
  sfx("sfx/objectives/anchor_tick.wav", 0.34, "objective_anchor"),
  sfx("sfx/objectives/window_tick.wav", 0.32, "objective_window"),
  sfx("sfx/objectives/hazard_tick.wav", 0.4, "objective_hazard"),
  sfx("sfx/objectives/carry_tick.wav", 0.38, "objective_carry"),
  sfx("sfx/objectives/public_tick.wav", 0.44, "objective_public"),
  sfx("sfx/heal_patch.wav", 0.48, "heal")
];

for (const spec of specs) {
  const samples = spec.kind === "music" ? renderMusic(spec) : renderSfx(spec);
  writeWav(path.join(root, "public/audio", spec.file), samples, spec.channels);
}

console.log(`Rendered ${specs.length} original AGI audio V1 WAV assets.`);

function music(file, duration, rootHz, bpm, profile) {
  return { kind: "music", file, duration, rootHz, bpm, profile, channels: 2 };
}

function sfx(file, duration, profile) {
  return { kind: "sfx", file, duration, profile, channels: 2 };
}

function renderMusic(spec) {
  const frames = Math.floor(spec.duration * sampleRate);
  const out = new Float32Array(frames * spec.channels);
  const rng = createRng(hash(spec.file));
  const beatHz = spec.bpm / 60;
  const profileGain = {
    boot: 0.66,
    grid: 0.52,
    briefing: 0.38,
    run: 0.72,
    coast: 0.68,
    transit: 0.72,
    archive: 0.58,
    threat: 0.76,
    boss: 0.82,
    extraction: 0.78
  }[spec.profile] ?? 0.6;

  const glitchTimes = Array.from({ length: Math.ceil(spec.duration * 2.4) }, () => rng() * spec.duration).sort((a, b) => a - b);
  for (let i = 0; i < frames; i += 1) {
    const t = i / sampleRate;
    const barPhase = (t * beatHz / 4) % 1;
    const beatPhase = (t * beatHz) % 1;
    const halfBeat = (t * beatHz * 2) % 1;
    const slow = Math.sin(TAU * t / spec.duration);
    const fade = loopSafeFade(t, spec.duration, 0.08);
    const pulse = Math.exp(-beatPhase * 13);
    const offPulse = Math.exp(-Math.abs(halfBeat - 0.5) * 22);
    const root = spec.rootHz;
    const fifth = root * 1.5;
    const octave = root * 2;
    const dirtyDrone =
      0.28 * sine(root * 0.5, t) +
      0.17 * sine(root, t + 0.003 * slow) +
      0.1 * sine(fifth, t) +
      0.07 * sine(octave * 1.01, t);
    const choir =
      0.07 * sine(root * 3.03, t + 0.03 * slow) +
      0.055 * sine(root * 4.02, t + 0.07) +
      0.045 * sine(root * 5.01, t + 0.11);
    const metalPulse = (0.35 * pulse + 0.16 * offPulse) * (sine(root * 0.25, t) + 0.35 * noise(rng));
    const dataTick = tickPattern(spec.profile, beatPhase, barPhase, rng) * (0.35 * noise(rng) + 0.12 * sine(root * 12, t));
    const glitch = glitchTimes.reduce((sum, gt) => {
      const d = Math.abs(t - gt);
      if (d > 0.03) return sum;
      return sum + (1 - d / 0.03) * (0.18 * noise(rng) + 0.08 * sine(root * (8 + Math.floor(gt * 3) % 7), t));
    }, 0);
    const urgency = spec.profile === "boss" || spec.profile === "threat" || spec.profile === "extraction" ? 0.18 * sine(root * 6, t) * pulse : 0;
    const base = (dirtyDrone + choir + metalPulse + dataTick + glitch + urgency) * profileGain * fade;
    const pan = 0.12 * Math.sin(TAU * (t / spec.duration) + root * 0.01);
    out[i * 2] = softClip(base * (1 - pan));
    out[i * 2 + 1] = softClip((base + 0.025 * sine(root * 2.02, t + 0.13)) * (1 + pan));
  }
  normalize(out, 0.74);
  return out;
}

function renderSfx(spec) {
  const frames = Math.floor(spec.duration * sampleRate);
  const out = new Float32Array(frames * spec.channels);
  const rng = createRng(hash(spec.file));
  for (let i = 0; i < frames; i += 1) {
    const t = i / sampleRate;
    const p = t / spec.duration;
    const env = envelope(p, spec.profile);
    const sweep = 90 + 980 * Math.pow(p, 1.4);
    let v = 0;
    switch (spec.profile) {
      case "ui_click":
        v = env * (0.55 * sine(780, t) + 0.2 * sine(1240, t) + 0.18 * noise(rng));
        break;
      case "ui_confirm":
        v = env * (0.42 * sine(520 + 360 * p, t) + 0.18 * sine(1040 + 160 * p, t) + 0.1 * noise(rng));
        break;
      case "ui_locked":
        v = env * (0.5 * sine(148, t) + 0.24 * sine(296, t) + 0.18 * square(37, t));
        break;
      case "draft":
        v = env * (0.35 * sine(370 + 420 * p, t) + 0.3 * sine(740 + 210 * p, t) + 0.18 * noise(rng));
        break;
      case "reroll":
        v = env * (0.38 * sine(220 + 980 * p, t) + 0.18 * sine(440 + 1300 * p, t) + 0.26 * noise(rng));
        break;
      case "pickup":
        v = env * (0.4 * sine(740, t) + 0.26 * sine(1110 + 240 * p, t) + 0.1 * noise(rng));
        break;
      case "cache":
        v = env * (0.48 * sine(120 + 140 * p, t) + 0.35 * tickNoise(t, 7, rng) + 0.12 * sine(980, t));
        break;
      case "weapon_hit":
        v = env * (0.45 * noise(rng) + 0.34 * sine(96 + 130 * (1 - p), t) + 0.12 * square(180, t));
        break;
      case "weapon_refusal":
        v = env * (0.34 * sine(340 + 180 * p, t) + 0.28 * filteredNoise(rng, p, 0.65) + 0.12 * square(680, t));
        break;
      case "weapon_cannon":
        v = env * (0.52 * sine(84 - 28 * p, t) + 0.32 * thumpNoise(t, 18, rng) + 0.1 * square(170, t));
        break;
      case "weapon_drone":
        v = env * (0.32 * sine(920 + 420 * p, t) + 0.22 * sine(1840 + 260 * p, t) + 0.22 * tickNoise(t, 54, rng));
        break;
      case "weapon_signal":
        v = env * (0.35 * sine(440, t) + 0.28 * sine(660, t + 0.003 * Math.sin(TAU * p * 5)) + 0.16 * square(110, t));
        break;
      case "weapon_saw":
        v = env * (0.44 * roughSaw(76 + 90 * p, t) + 0.34 * filteredNoise(rng, p, 1.1) + 0.14 * sine(610, t));
        break;
      case "weapon_lance":
        v = env * (0.48 * sine(210 + 1_700 * p, t) + 0.18 * sine(2_500 + 800 * p, t) + 0.16 * noise(rng));
        break;
      case "weapon_mine":
        v = env * (0.5 * sine(52 + 66 * p, t) + 0.3 * thumpNoise(t, 11, rng) + 0.16 * sine(720 - 180 * p, t));
        break;
      case "weapon_railgun":
        v = env * (0.55 * sine(120 + 2_300 * p, t) + 0.24 * sine(2_800 + 1_200 * p, t) + 0.18 * tickNoise(t, 38, rng));
        break;
      case "weapon_choir":
        v =
          env *
          (0.24 * sine(330 + 280 * p, t) +
            0.21 * sine(495 + 340 * p, t + 0.02) +
            0.18 * sine(660 + 440 * p, t + 0.05) +
            0.18 * filteredNoise(rng, p, 0.45));
        break;
      case "weapon_time_minefield":
        v = env * (0.42 * sine(70 + 60 * Math.sin(TAU * p), t) + 0.24 * tickNoise(t, 6, rng) + 0.2 * sine(1_100 * (1 - p), t));
        break;
      case "damage":
        v = env * (0.5 * sine(180 - 80 * p, t) + 0.34 * noise(rng) + 0.18 * square(55, t));
        break;
      case "player_contact":
        v = env * (0.42 * sine(140 - 40 * p, t) + 0.28 * filteredNoise(rng, p, 1.2) + 0.12 * square(48, t));
        break;
      case "player_projectile":
        v = env * (0.34 * sine(620 - 240 * p, t) + 0.3 * tickNoise(t, 23, rng) + 0.16 * noise(rng));
        break;
      case "player_burn":
        v = env * (0.34 * roughSaw(98 + 55 * p, t) + 0.38 * filteredNoise(rng, p, 0.35) + 0.12 * sine(430, t));
        break;
      case "player_boss_charge":
        v = env * (0.58 * sine(58 + 32 * p, t) + 0.36 * thumpNoise(t, 9, rng) + 0.14 * square(115, t));
        break;
      case "burst":
        v = env * (0.34 * sine(95 + 520 * p, t) + 0.28 * sine(190 + 840 * p, t) + 0.3 * noise(rng));
        break;
      case "objective_tick":
        v = env * (0.42 * sine(620, t) + 0.2 * sine(310, t) + 0.14 * noise(rng));
        break;
      case "objective_anchor":
        v = env * (0.38 * sine(250, t) + 0.26 * sine(500, t) + 0.16 * thumpNoise(t, 10, rng));
        break;
      case "objective_window":
        v = env * (0.36 * sine(420 + 540 * p, t) + 0.22 * tickNoise(t, 12, rng) + 0.12 * noise(rng));
        break;
      case "objective_hazard":
        v = env * (0.34 * sine(160 - 30 * p, t) + 0.34 * filteredNoise(rng, p, 0.8) + 0.12 * square(320, t));
        break;
      case "objective_carry":
        v = env * (0.38 * sine(190, t) + 0.22 * sine(380 + 90 * p, t) + 0.18 * tickNoise(t, 4, rng));
        break;
      case "objective_public":
        v = env * (0.42 * sine(310 + 160 * p, t) + 0.24 * sine(620 + 210 * p, t) + 0.18 * square(77, t));
        break;
      case "heal":
        v = env * (0.36 * sine(260 + 500 * p, t) + 0.24 * sine(520 + 760 * p, t) + 0.08 * noise(rng));
        break;
      case "boss_warning":
        v = env * (0.48 * sine(92 + 22 * Math.sin(TAU * p * 3), t) + 0.34 * sine(184, t) + 0.22 * noise(rng));
        break;
      case "objective_complete":
        v = env * (0.35 * sine(220 + 620 * p, t) + 0.22 * sine(440 + 820 * p, t) + 0.18 * noise(rng));
        break;
      case "evolution":
        v = env * (0.34 * sine(150 + 1_250 * p, t) + 0.34 * sine(75 + 610 * p, t) + 0.3 * noise(rng));
        break;
      case "extraction_open":
        v = env * (0.55 * sine(72 + 90 * p, t) + 0.26 * tickNoise(t, 5, rng) + 0.16 * noise(rng));
        break;
      case "victory":
        v = env * (0.36 * sine(180 + 460 * p, t) + 0.25 * sine(360 + 520 * p, t) + 0.18 * noise(rng));
        break;
      case "death":
        v = env * (0.46 * sine(280 - 210 * p, t) + 0.28 * sine(140 - 70 * p, t) + 0.22 * noise(rng));
        break;
      default:
        v = env * (0.4 * sine(sweep, t) + 0.2 * noise(rng));
    }
    const width = 0.08 * Math.sin(TAU * p);
    out[i * 2] = softClip(v * (1 - width));
    out[i * 2 + 1] = softClip(v * (1 + width) + 0.01 * noise(rng));
  }
  normalize(out, 0.84);
  return out;
}

function tickPattern(profile, beatPhase, barPhase, rng) {
  const fast = Math.exp(-beatPhase * 34);
  const slow = Math.exp(-Math.abs(barPhase - 0.5) * 34);
  const density = profile === "transit" || profile === "threat" || profile === "extraction" ? 0.55 : profile === "briefing" || profile === "grid" ? 0.16 : 0.34;
  return (fast * density + slow * density * 0.7) * (rng() > 0.18 ? 1 : -0.5);
}

function envelope(p, profile) {
  if (profile === "boss_warning") return Math.sin(Math.PI * Math.min(1, p)) * (0.74 + 0.26 * Math.sin(TAU * p * 5));
  if (profile === "evolution" || profile === "burst" || profile === "extraction_open") return Math.sin(Math.PI * Math.min(1, p)) ** 0.7;
  if (profile === "death") return Math.pow(1 - p, 0.45);
  const attack = Math.min(1, p / 0.08);
  const release = Math.pow(Math.max(0, 1 - p), 1.8);
  return attack * release;
}

function writeWav(file, samples, channels) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const dataBytes = samples.length * 2;
  const buffer = Buffer.alloc(44 + dataBytes);
  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + dataBytes, 4);
  buffer.write("WAVE", 8);
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(channels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * channels * 2, 28);
  buffer.writeUInt16LE(channels * 2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write("data", 36);
  buffer.writeUInt32LE(dataBytes, 40);
  for (let i = 0; i < samples.length; i += 1) {
    const value = Math.max(-1, Math.min(1, samples[i]));
    buffer.writeInt16LE(Math.round(value * 32767), 44 + i * 2);
  }
  fs.writeFileSync(file, buffer);
}

function normalize(samples, target) {
  let peak = 0;
  for (const sample of samples) peak = Math.max(peak, Math.abs(sample));
  if (peak <= 0) return;
  const gain = target / peak;
  for (let i = 0; i < samples.length; i += 1) samples[i] = softClip(samples[i] * gain);
}

function loopSafeFade(t, duration, fadeSeconds) {
  return Math.min(1, t / fadeSeconds, (duration - t) / fadeSeconds);
}

function sine(freq, t) {
  return Math.sin(TAU * freq * t);
}

function square(freq, t) {
  return Math.sign(Math.sin(TAU * freq * t));
}

function noise(rng) {
  return rng() * 2 - 1;
}

function tickNoise(t, rate, rng) {
  const phase = (t * rate) % 1;
  return Math.exp(-phase * 18) * noise(rng);
}

function thumpNoise(t, rate, rng) {
  const phase = (t * rate) % 1;
  return Math.exp(-phase * 28) * (0.65 * noise(rng) + 0.35 * sine(80 + rate * 3, t));
}

function filteredNoise(rng, p, grit) {
  return noise(rng) * (0.35 + grit * Math.max(0.15, 1 - p));
}

function roughSaw(freq, t) {
  const phase = (t * freq) % 1;
  return phase * 2 - 1;
}

function softClip(value) {
  return Math.tanh(value * 1.35);
}

function createRng(seed) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

function hash(text) {
  let value = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    value ^= text.charCodeAt(i);
    value = Math.imul(value, 16777619);
  }
  return value >>> 0;
}
