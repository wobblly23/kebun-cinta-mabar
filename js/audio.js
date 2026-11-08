// js/audio.js - Web Audio API Procedural Synthesizer for "Kebun Cinta Kita"
// No external MP3 files needed; 100% reliable, zero 404s, works offline and on all browsers!

class SoundSystem {
  constructor() {
    this.ctx = null;
    this.bgmNode = null;
    this.bgmGain = null;
    this.sfxGain = null;
    this.masterGain = null;
    this.isMuted = false;
    this.bgmEnabled = true;
    this.bgmInterval = null;
    this.currentStep = 0;
    this.initialized = false;
  }

  init() {
    if (this.initialized) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.35;
      this.masterGain.connect(this.ctx.destination);

      this.bgmGain = this.ctx.createGain();
      this.bgmGain.gain.value = 0.25;
      this.bgmGain.connect(this.masterGain);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.value = 0.45;
      this.sfxGain.connect(this.masterGain);

      this.initialized = true;
      if (this.bgmEnabled) {
        this.startBGM();
      }
    } catch (e) {
      console.warn('Web Audio not supported or blocked:', e);
    }
  }

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // --- Sound Effects ---

  // Earthy till sound (Hoe)
  playTill() {
    if (!this.initialized || this.isMuted) return;
    this.resume();
    const t = this.ctx.currentTime;
    
    // Noise buffer for dirt scrape
    const bufferSize = this.ctx.sampleRate * 0.12;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(320, t);
    filter.Q.setValueAtTime(2.0, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.5, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.12);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    noise.start(t);
  }

  // Water splash / sprinkle
  playWater() {
    if (!this.initialized || this.isMuted) return;
    this.resume();
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, t);
    osc.frequency.exponentialRampToValueAtTime(200, t + 0.18);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.18);
  }

  // Seed planting rustle
  playPlant() {
    if (!this.initialized || this.isMuted) return;
    this.resume();
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440, t);
    osc.frequency.setValueAtTime(587.33, t + 0.06);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.15);
  }

  // Pop & cheerful chime on harvest
  playHarvest() {
    if (!this.initialized || this.isMuted) return;
    this.resume();
    const t = this.ctx.currentTime;

    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + idx * 0.05);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.25, t + idx * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.05 + 0.15);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t + idx * 0.05);
      osc.stop(t + idx * 0.05 + 0.16);
    });
  }

  // Kiss sound (cute "mwah" + sparkles)
  playKiss() {
    if (!this.initialized || this.isMuted) return;
    this.resume();
    const t = this.ctx.currentTime;

    // Pop
    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(450, t);
    osc.frequency.exponentialRampToValueAtTime(900, t + 0.08);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.09);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.09);

    // Sparkles
    const chimes = [880, 1174.66, 1396.91, 1760];
    chimes.forEach((f, i) => {
      const s = this.ctx.createOscillator();
      s.type = 'triangle';
      s.frequency.setValueAtTime(f, t + 0.08 + i * 0.04);
      const sg = this.ctx.createGain();
      sg.gain.setValueAtTime(0.2, t + 0.08 + i * 0.04);
      sg.gain.exponentialRampToValueAtTime(0.001, t + 0.08 + i * 0.04 + 0.2);
      s.connect(sg);
      sg.connect(this.sfxGain);
      s.start(t + 0.08 + i * 0.04);
      s.stop(t + 0.08 + i * 0.04 + 0.22);
    });
  }

  // Hug / affection chime
  playHug() {
    if (!this.initialized || this.isMuted) return;
    this.resume();
    const t = this.ctx.currentTime;
    const chords = [392.00, 493.88, 587.33, 783.99]; // G major
    chords.forEach(f => {
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, t);
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(0.18, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
      osc.connect(g);
      g.connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + 0.42);
    });
  }

  // Petting animals (soft happy chime)
  playPet() {
    if (!this.initialized || this.isMuted) return;
    this.resume();
    const t = this.ctx.currentTime;
    const notes = [659.25, 783.99, 987.77];
    notes.forEach((f, i) => {
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, t + i * 0.07);
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(0.25, t + i * 0.07);
      g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.07 + 0.18);
      osc.connect(g);
      g.connect(this.sfxGain);
      osc.start(t + i * 0.07);
      osc.stop(t + i * 0.07 + 0.19);
    });
  }

  // Coin jingle
  playCoin() {
    if (!this.initialized || this.isMuted) return;
    this.resume();
    const t = this.ctx.currentTime;
    [987.77, 1318.51].forEach((f, i) => {
      const osc = this.ctx.createOscillator();
      osc.type = 'square';
      osc.frequency.setValueAtTime(f, t + i * 0.08);
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(0.15, t + i * 0.08);
      g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.08 + 0.2);
      osc.connect(g);
      g.connect(this.sfxGain);
      osc.start(t + i * 0.08);
      osc.stop(t + i * 0.08 + 0.22);
    });
  }

  // Bot activity chirp
  playBotChirp() {
    if (!this.initialized || this.isMuted) return;
    this.resume();
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, t);
    osc.frequency.exponentialRampToValueAtTime(1200, t + 0.09);
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.12, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
    osc.connect(g);
    g.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.1);
  }

  // --- Background Music: Cozy Farm Acoustic Chiptune ---
  startBGM() {
    if (this.bgmInterval) return;
    if (!this.initialized) return;

    // Peaceful 16-step cozy chord progression in C major / F major / G major
    const melodyNotes = [
      523.25, 659.25, 783.99, 659.25, // C - E - G - E
      587.33, 698.46, 880.00, 698.46, // D - F - A - F
      659.25, 783.99, 987.77, 783.99, // E - G - B - G
      523.25, 783.99, 1046.50, 783.99 // C - G - C6 - G
    ];

    const bassNotes = [
      130.81, 130.81, 130.81, 130.81, // C3
      174.61, 174.61, 174.61, 174.61, // F3
      196.00, 196.00, 196.00, 196.00, // G3
      130.81, 164.81, 196.00, 130.81  // C3, E3, G3, C3
    ];

    this.currentStep = 0;
    const stepDuration = 320; // ms per eighth-note

    this.bgmInterval = setInterval(() => {
      if (this.isMuted || !this.bgmEnabled || !this.ctx) return;
      this.resume();

      const t = this.ctx.currentTime;
      const mFreq = melodyNotes[this.currentStep % melodyNotes.length];
      const bFreq = bassNotes[this.currentStep % bassNotes.length];

      // Soft Lead / Kalimba sound
      const mOsc = this.ctx.createOscillator();
      mOsc.type = 'triangle';
      mOsc.frequency.setValueAtTime(mFreq, t);

      const mGain = this.ctx.createGain();
      mGain.gain.setValueAtTime(0.12, t);
      mGain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);

      mOsc.connect(mGain);
      mGain.connect(this.bgmGain);
      mOsc.start(t);
      mOsc.stop(t + 0.29);

      // Warm Bass (plays on beat 0, 2, 4...)
      if (this.currentStep % 2 === 0) {
        const bOsc = this.ctx.createOscillator();
        bOsc.type = 'sine';
        bOsc.frequency.setValueAtTime(bFreq, t);

        const bGain = this.ctx.createGain();
        bGain.gain.setValueAtTime(0.16, t);
        bGain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);

        bOsc.connect(bGain);
        bGain.connect(this.bgmGain);
        bOsc.start(t);
        bOsc.stop(t + 0.46);
      }

      this.currentStep = (this.currentStep + 1) % 16;
    }, stepDuration);
  }

  stopBGM() {
    if (this.bgmInterval) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
  }

  toggleBGM() {
    this.bgmEnabled = !this.bgmEnabled;
    if (this.bgmEnabled) {
      this.startBGM();
    } else {
      this.stopBGM();
    }
    return this.bgmEnabled;
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.value = this.isMuted ? 0 : 0.35;
    }
    return this.isMuted;
  }
}

// Global instance
window.soundSystem = new SoundSystem();
