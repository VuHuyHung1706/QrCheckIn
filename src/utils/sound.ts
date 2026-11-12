// Web Audio API synthesizer for natural bubble pop, splash & firework explosion sound
class SoundManager {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
  }

  public playPopSound() {
    this.playFireworkPopSound();
  }

  public playSplashSound() {
    this.playFireworkPopSound();
  }

  // Realistic Firework Explosion sound: Punchy pop + water splash + high sparkle crackles
  public playFireworkPopSound() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }

      const now = this.ctx.currentTime;

      // 1. Initial firework burst "thump/pop"
      const osc = this.ctx.createOscillator();
      const gainOsc = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(70, now + 0.14);

      gainOsc.gain.setValueAtTime(0.35, now);
      gainOsc.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

      osc.connect(gainOsc);
      gainOsc.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.16);

      // 2. Air burst / Splash noise
      const bufferSize = Math.floor(this.ctx.sampleRate * 0.22);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1200, now);
      filter.Q.setValueAtTime(1.5, now);

      const gainNoise = this.ctx.createGain();
      gainNoise.gain.setValueAtTime(0.18, now);
      gainNoise.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

      whiteNoise.connect(filter);
      filter.connect(gainNoise);
      gainNoise.connect(this.ctx.destination);

      whiteNoise.start(now);

      // 3. Delicate Firework Sparkle Crackles (3 micro-clicks)
      [0.05, 0.09, 0.14].forEach((delay) => {
        const crackleOsc = this.ctx!.createOscillator();
        const crackleGain = this.ctx!.createGain();

        crackleOsc.type = 'sine';
        crackleOsc.frequency.setValueAtTime(1200 + Math.random() * 800, now + delay);
        crackleOsc.frequency.exponentialRampToValueAtTime(300, now + delay + 0.04);

        crackleGain.gain.setValueAtTime(0.08, now + delay);
        crackleGain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.04);

        crackleOsc.connect(crackleGain);
        crackleGain.connect(this.ctx!.destination);

        crackleOsc.start(now + delay);
        crackleOsc.stop(now + delay + 0.04);
      });
    } catch {
      // Audio might be blocked until user interacts, safely ignore
    }
  }

  public playSuccessSound() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }

      const now = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 chord
      
      notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        const startTime = now + idx * 0.08;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.15, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.35);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.35);
      });
    } catch {
      // safely ignore
    }
  }
}

export const soundManager = new SoundManager();
