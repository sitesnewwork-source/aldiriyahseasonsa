// Enhanced sound effects using Web Audio API - no external files needed
let audioCtx: AudioContext | null = null;

const getAudioContext = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioCtx;
};

type SoundType = "soft" | "success" | "info" | "click" | "error" | "whoosh" | "pop" | "notification" | "delete" | "urgent" | "message" | "visitor" | "pending_action" | "otp_incoming" | "otp_reminder";

const SOUND_MUTE_KEY = "admin_sound_muted";

export const isSoundMuted = (): boolean => {
  try { return localStorage.getItem(SOUND_MUTE_KEY) === "true"; } catch { return false; }
};

export const setSoundMuted = (muted: boolean) => {
  try { localStorage.setItem(SOUND_MUTE_KEY, String(muted)); } catch {}
};

export const playChime = (type: SoundType = "soft") => {
  try {
    if (isSoundMuted()) return;
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    switch (type) {
      case "click": {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(800, now + 0.05);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.1);
        break;
      }

      case "pop": {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(1200, now + 0.04);
        osc.frequency.exponentialRampToValueAtTime(600, now + 0.1);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.2);
        break;
      }

      case "whoosh": {
        const bufferSize = ctx.sampleRate * 0.15;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        const filter = ctx.createBiquadFilter();
        filter.type = "bandpass";
        filter.frequency.setValueAtTime(2000, now);
        filter.frequency.exponentialRampToValueAtTime(500, now + 0.15);
        filter.Q.value = 2;
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        noise.start(now);
        break;
      }

      case "error": {
        [300, 250].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "square";
          osc.frequency.setValueAtTime(freq, now + i * 0.1);
          gain.gain.setValueAtTime(0.04, now + i * 0.1);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.12);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + i * 0.1);
          osc.stop(now + i * 0.1 + 0.15);
        });
        break;
      }

      case "delete": {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(500, now);
        osc.frequency.exponentialRampToValueAtTime(150, now + 0.2);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.3);
        break;
      }

      case "notification": {
        [880, 1100, 1320].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, now + i * 0.1);
          gain.gain.setValueAtTime(0, now + i * 0.1);
          gain.gain.linearRampToValueAtTime(0.07, now + i * 0.1 + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.3);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + i * 0.1);
          osc.stop(now + i * 0.1 + 0.35);
        });
        break;
      }

      case "urgent": {
        // Alarm-style alert: loud repeating two-tone siren
        const tones = [880, 1100, 880, 1100, 880, 1100];
        tones.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const osc2 = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "square";
          osc2.type = "triangle";
          osc.frequency.setValueAtTime(freq, now + i * 0.15);
          osc2.frequency.setValueAtTime(freq * 0.5, now + i * 0.15);
          gain.gain.setValueAtTime(0, now + i * 0.15);
          gain.gain.linearRampToValueAtTime(0.12, now + i * 0.15 + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.15 + 0.13);
          osc.connect(gain);
          osc2.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + i * 0.15);
          osc.stop(now + i * 0.15 + 0.15);
          osc2.start(now + i * 0.15);
          osc2.stop(now + i * 0.15 + 0.15);
        });
        // Strong vibration pattern
        if ("vibrate" in navigator) {
          navigator.vibrate([200, 100, 200, 100, 200, 100, 400]);
        }
        break;
      }

      case "message": {
        // Distinctive doorbell-like chime for new contact messages
        // Two-note descending melody with harmonics + vibration
        const freqs = [1047, 784, 1047, 659];
        freqs.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const osc2 = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sine";
          osc2.type = "triangle";
          osc.frequency.setValueAtTime(freq, now + i * 0.15);
          osc2.frequency.setValueAtTime(freq * 1.5, now + i * 0.15);
          gain.gain.setValueAtTime(0, now + i * 0.15);
          gain.gain.linearRampToValueAtTime(0.09, now + i * 0.15 + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.15 + 0.4);
          osc.connect(gain);
          osc2.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + i * 0.15);
          osc.stop(now + i * 0.15 + 0.45);
          osc2.start(now + i * 0.15);
          osc2.stop(now + i * 0.15 + 0.45);
        });
        // Vibrate: long-short-long pattern
        if ("vibrate" in navigator) {
          navigator.vibrate([300, 100, 300, 100, 200]);
        }
        break;
      }

      case "visitor": {
        // Door chime / welcome sound: ascending bright tones
        const vFreqs = [523, 784, 1047];
        vFreqs.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const osc2 = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sine";
          osc2.type = "triangle";
          osc.frequency.setValueAtTime(freq, now + i * 0.12);
          osc2.frequency.setValueAtTime(freq * 2, now + i * 0.12);
          gain.gain.setValueAtTime(0, now + i * 0.12);
          gain.gain.linearRampToValueAtTime(0.08, now + i * 0.12 + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.5);
          osc.connect(gain);
          osc2.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + i * 0.12);
          osc.stop(now + i * 0.12 + 0.55);
          osc2.start(now + i * 0.12);
          osc2.stop(now + i * 0.12 + 0.55);
        });
        if ("vibrate" in navigator) {
          navigator.vibrate([100, 50, 100]);
        }
        break;
      }

      case "pending_action": {
        // Attention-grabbing alert: rising two-tone bell with urgency
        const bellFreqs = [659, 880, 1175, 880, 1175];
        bellFreqs.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const osc2 = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sine";
          osc2.type = "triangle";
          osc.frequency.setValueAtTime(freq, now + i * 0.18);
          osc2.frequency.setValueAtTime(freq * 1.5, now + i * 0.18);
          gain.gain.setValueAtTime(0, now + i * 0.18);
          gain.gain.linearRampToValueAtTime(0.1, now + i * 0.18 + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.18 + 0.35);
          osc.connect(gain);
          osc2.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + i * 0.18);
          osc.stop(now + i * 0.18 + 0.4);
          osc2.start(now + i * 0.18);
          osc2.stop(now + i * 0.18 + 0.4);
        });
        if ("vibrate" in navigator) {
          navigator.vibrate([150, 80, 150, 80, 300]);
        }
        break;
      }

      case "otp_incoming": {
        // Distinctive OTP alert: digital keypad tones (DTMF-inspired) with urgency
        // Short staccato beeps ascending rapidly, then a sustained attention tone
        const dtmfFreqs = [697, 941, 1209, 1477, 1633];
        dtmfFreqs.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const osc2 = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "square";
          osc2.type = "sine";
          osc.frequency.setValueAtTime(freq, now + i * 0.08);
          osc2.frequency.setValueAtTime(freq * 0.7, now + i * 0.08);
          gain.gain.setValueAtTime(0, now + i * 0.08);
          gain.gain.linearRampToValueAtTime(0.07, now + i * 0.08 + 0.01);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.07);
          osc.connect(gain);
          osc2.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + i * 0.08);
          osc.stop(now + i * 0.08 + 0.08);
          osc2.start(now + i * 0.08);
          osc2.stop(now + i * 0.08 + 0.08);
        });
        // Sustained attention tone after beeps
        const sustainOsc = ctx.createOscillator();
        const sustainOsc2 = ctx.createOscillator();
        const sustainGain = ctx.createGain();
        sustainOsc.type = "sine";
        sustainOsc2.type = "triangle";
        sustainOsc.frequency.setValueAtTime(1320, now + 0.5);
        sustainOsc2.frequency.setValueAtTime(1760, now + 0.5);
        sustainGain.gain.setValueAtTime(0, now + 0.5);
        sustainGain.gain.linearRampToValueAtTime(0.1, now + 0.52);
        sustainGain.gain.setValueAtTime(0.1, now + 0.7);
        sustainGain.gain.exponentialRampToValueAtTime(0.001, now + 1.1);
        sustainOsc.connect(sustainGain);
        sustainOsc2.connect(sustainGain);
        sustainGain.connect(ctx.destination);
        sustainOsc.start(now + 0.5);
        sustainOsc.stop(now + 1.2);
        sustainOsc2.start(now + 0.5);
        sustainOsc2.stop(now + 1.2);
        if ("vibrate" in navigator) {
          navigator.vibrate([80, 40, 80, 40, 80, 40, 80, 40, 80, 100, 400]);
        }
        break;
      }

      case "success": {
        [523, 659, 784].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const noteGain = ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, now + i * 0.08);
          noteGain.gain.setValueAtTime(0, now + i * 0.08);
          noteGain.gain.linearRampToValueAtTime(0.08, now + i * 0.08 + 0.02);
          noteGain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.4);
          osc.connect(noteGain);
          noteGain.connect(ctx.destination);
          osc.start(now + i * 0.08);
          osc.stop(now + i * 0.08 + 0.5);
        });
        break;
      }

      case "info":
      case "soft":
      default: {
        const freqs = type === "info" ? [440, 554] : [523, 659];
        const masterGain = ctx.createGain();
        masterGain.gain.setValueAtTime(0.08, now);
        masterGain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
        masterGain.connect(ctx.destination);

        freqs.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, now + i * 0.08);
          const noteGain = ctx.createGain();
          noteGain.gain.setValueAtTime(0, now + i * 0.08);
          noteGain.gain.linearRampToValueAtTime(1, now + i * 0.08 + 0.02);
          noteGain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.08 + 0.4);
          osc.connect(noteGain);
          noteGain.connect(masterGain);
          osc.start(now + i * 0.08);
          osc.stop(now + i * 0.08 + 0.5);
        });
        break;
      }
    }
  } catch {
    // Silently fail if audio isn't supported
  }
};

// Ripple effect helper - creates a visual ripple on click
export const createRipple = (event: React.MouseEvent<HTMLElement>) => {
  const button = event.currentTarget;
  const rect = button.getBoundingClientRect();
  const ripple = document.createElement("span");
  const size = Math.max(rect.width, rect.height);
  const x = event.clientX - rect.left - size / 2;
  const y = event.clientY - rect.top - size / 2;

  ripple.style.cssText = `
    position: absolute;
    width: ${size}px;
    height: ${size}px;
    left: ${x}px;
    top: ${y}px;
    border-radius: 50%;
    background: currentColor;
    opacity: 0.15;
    transform: scale(0);
    animation: ripple-effect 0.5s ease-out forwards;
    pointer-events: none;
    z-index: 10;
  `;

  button.style.position = button.style.position || "relative";
  button.style.overflow = "hidden";
  button.appendChild(ripple);

  setTimeout(() => ripple.remove(), 500);
};
