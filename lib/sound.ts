// Original short festival cues. Audio stays quiet between customer interactions.
export class StageSound {
 private context: AudioContext | null = null;
 private mix: GainNode | null = null;
 private master: GainNode | null = null;
 private voices = new Set<{ oscillator: OscillatorNode; gain: GainNode; at: number }>();
 private level = .7;
 private silent = false;
 get volume() { return this.level; }
 set volume(value: number) { const next = Number.isFinite(value) ? Math.max(0, Math.min(1, value)) : .7; if (next !== this.level) { this.level = next; this.updateOutput(); } }
 get muted() { return this.silent; }
 set muted(value: boolean) { if (value !== this.silent) { this.silent = value; this.updateOutput(); } }

 async unlock() {
  try {
   if (!this.context) {
    const Audio = window.AudioContext || (window as any).webkitAudioContext;
    if (!Audio) return false;
    const c: AudioContext = new Audio(); this.context = c;
    this.mix = c.createGain(); this.master = c.createGain();
    const compressor = c.createDynamicsCompressor();
    compressor.threshold.value = -12; compressor.knee.value = 12;
    compressor.ratio.value = 5; compressor.attack.value = .003; compressor.release.value = .12;
    const limiter = c.createWaveShaper(), curve = new Float32Array(2049);
    for (let i = 0; i < curve.length; i++) curve[i] = .94 * Math.tanh((i / 1024 - 1) * 1.2);
    limiter.curve = curve;
    this.mix.connect(compressor); compressor.connect(limiter); limiter.connect(this.master); this.master.connect(c.destination);
    this.master.gain.value = this.silent ? 0 : this.level;
   }
   if (this.context.state !== "running") await this.context.resume();
   return this.context.state === "running";
  } catch { return false; }
 }

 private updateOutput() {
  if (!this.context || !this.master) return;
  const t = this.context.currentTime;
  this.hold(this.master.gain, t);
  this.master.gain.setTargetAtTime(this.silent ? 0 : this.level, t, .008);
 }
 private hold(param: AudioParam, at: number) {
  if (typeof param.cancelAndHoldAtTime === "function") param.cancelAndHoldAtTime(at);
  else { const value = param.value; param.cancelScheduledValues(at); param.setValueAtTime(value, at); }
 }
 private tone(f: number, at: number, length: number, level: number, type: OscillatorType = "sine") {
  const c = this.context;
  if (!c || !this.mix || c.state !== "running" || this.silent || !this.level) return;
  const oscillator = c.createOscillator(), gain = c.createGain();
  const voice = { oscillator, gain, at };
  oscillator.type = type; oscillator.frequency.setValueAtTime(f, at);
  gain.gain.setValueAtTime(.0001, at);
  gain.gain.exponentialRampToValueAtTime(level, at + .005);
  gain.gain.exponentialRampToValueAtTime(.0001, at + length);
  oscillator.connect(gain); gain.connect(this.mix); this.voices.add(voice);
  oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); this.voices.delete(voice); };
  oscillator.start(at); oscillator.stop(at + length + .02);
 }
 private chime(f: number, at: number, length = .5, strength = 1) {
  this.tone(f, at, length, .105 * strength, "triangle");
  this.tone(f * 2, at, length * .68, .028 * strength);
  this.tone(f * 3, at, length * .36, .008 * strength);
 }
 private handbell(at: number, strength = 1, high = false) {
  const f = 1046.5 * (high ? 1.006 : .994);
  [[1, .085, .62], [2.01, .032, .42], [2.74, .015, .3], [4.08, .007, .2]].forEach(([ratio, gain, length]) => this.tone(f * ratio, at, length, gain * strength));
 }
 private chord(notes: number[], at: number, length: number, strength = 1) {
  notes.forEach(f => this.tone(f, at, length, .038 * strength, "triangle"));
 }
 private begin() { this.stop(); return this.context?.state === "running" ? this.context.currentTime + .02 : null; }

 // Two bright phrases at the same lively tempo, with the final tail inside the chosen duration.
 bell(seconds = 5) {
  const t = this.begin(); if (t === null) return;
  const duration = Number.isFinite(seconds) ? Math.min(5, Math.max(3, seconds)) : 5;
  const cadenceAt = duration - .75;
  [0, .10, .24, .35, .51, .66, .87].forEach((s, i) => this.handbell(t + s, i % 2 ? .65 : 1, i % 2 === 0));
  const phrase: [number, number][] = [[.18, 523.25], [.4, 659.25], [.62, 783.99], [.96, 1046.5], [1.26, 880], [1.48, 783.99], [1.7, 659.25], [1.94, 783.99], [2.25, 1046.5], [2.50, 523.25], [2.72, 659.25], [2.94, 783.99], [3.28, 1046.5], [3.58, 880], [3.80, 783.99], [4.02, 987.77]];
  phrase.filter(([s]) => s < cadenceAt - .12).forEach(([s, f]) => this.chime(f, t + s, .38, .82));
  for (let i = 0; i * .56 < cadenceAt; i++) this.tone(i % 2 ? 196 : 130.81, t + i * .56, .25, .095, "triangle");
  this.chime(1046.5, t + cadenceAt, .71, .9);
  this.chord([261.63, 329.63, 392], t + cadenceAt, .71);
 }

 // Light, bouncy accompaniment; the wheel's own ticks remain clearly audible.
 spin(durationMs = 5200) {
  const t = this.begin(); if (t === null) return;
  const end = Math.max(0, durationMs / 1000 - .5), beat = .25;
  const tune = [523.25, 659.25, 783.99, 659.25, 587.33, 783.99, 880, 783.99];
  for (let i = 0; i * beat < end; i++) {
   this.chime(tune[i % tune.length], t + i * beat, .15, .3);
   if (i % 2 === 0) this.tone(i % 4 ? 196 : 130.81, t + i * beat, .13, .052, "triangle");
  }
 }
 tick() { this.tone(1250, (this.context?.currentTime ?? 0) + .003, .025, .065, "triangle"); }

 // Every prize receives this same complete celebration, without a grand-prize tier.
 win() {
  const t = this.begin(); if (t === null) return;
  [0, .11, .26, .38, .56, .73].forEach((s, i) => this.handbell(t + s, i % 2 ? .58 : .84, i % 2 === 0));
  const phrase: [number, number][] = [[.06, 392], [.22, 523.25], [.38, 659.25], [.54, 783.99], [.84, 1046.5], [1.13, 880], [1.32, 783.99], [1.52, 659.25], [1.74, 783.99], [2.03, 1046.5]];
  phrase.forEach(([s, f], i) => this.chime(f, t + s, i === phrase.length - 1 ? 1.05 : .38));
  this.chord([261.63, 329.63, 392], t + .06, .65, .9);
  this.chord([261.63, 349.23, 440], t + 1.13, .4, .8);
  this.chord([261.63, 329.63, 392, 523.25], t + 2.03, 1.05);
  this.tone(130.81, t + 2.03, .9, .105, "triangle");
 }

 stop() {
  const c = this.context; if (!c) return;
  const now = c.currentTime;
  for (const voice of this.voices) {
   try {
    if (voice.at > now) { voice.gain.gain.cancelScheduledValues(now); voice.gain.gain.setValueAtTime(0, now); voice.oscillator.stop(now); }
    else { this.hold(voice.gain.gain, now); voice.gain.gain.setTargetAtTime(.0001, now, .006); voice.oscillator.stop(now + .035); }
   } catch { /* An already ended oscillator has no remaining sound. */ }
  }
 }
 dispose() { this.stop(); const c = this.context; this.context = null; this.master = null; this.mix = null; this.voices.clear(); if (c && c.state !== "closed") void c.close().catch(() => {}); }
}
