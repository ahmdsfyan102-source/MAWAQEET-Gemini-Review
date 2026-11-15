import type { CustomAudioEntity, SoundMode } from '../types/models';

class WebAudioFileManager {
  private audioEl: HTMLAudioElement | null = null;
  private audioCtx: AudioContext | null = null;
  private stopTimer: number | null = null;
  private onCompleteCb: (() => void) | null = null;

  stopAudio(): void {
    if (this.stopTimer !== null) {
      window.clearTimeout(this.stopTimer);
      this.stopTimer = null;
    }
    if (this.audioEl) {
      try {
        this.audioEl.pause();
        this.audioEl.currentTime = 0;
      } catch {
        // ignore
      }
      this.audioEl = null;
    }
    if (this.audioCtx) {
      try {
        void this.audioCtx.close();
      } catch {
        // ignore
      }
      this.audioCtx = null;
    }
    if (this.onCompleteCb) {
      const cb = this.onCompleteCb;
      this.onCompleteCb = null;
      cb();
    }
  }

  private scheduleDurationStop(durationSeconds?: number): void {
    if (durationSeconds && durationSeconds > 0) {
      this.stopTimer = window.setTimeout(() => {
        this.stopAudio();
      }, durationSeconds * 1000);
    }
  }

  private playHarmonicSequence(
    notes: number[],
    stepSec: number,
    durationSeconds?: number,
    onCompletion?: () => void
  ): void {
    this.stopAudio();
    this.onCompleteCb = onCompletion ?? null;
    try {
      const Ctx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      if (!Ctx) {
        this.stopAudio();
        return;
      }
      const ctx = new Ctx();
      this.audioCtx = ctx;
      const now = ctx.currentTime;
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * stepSec);
        gain.gain.setValueAtTime(0.001, now + idx * stepSec);
        gain.gain.exponentialRampToValueAtTime(0.16, now + idx * stepSec + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * stepSec + stepSec * 2.1);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * stepSec);
        osc.stop(now + idx * stepSec + stepSec * 2.2);
      });
      const seqMs = Math.round((notes.length * stepSec + 0.6) * 1000);
      const maxMs =
        durationSeconds && durationSeconds > 0
          ? Math.min(durationSeconds * 1000, seqMs)
          : seqMs;
      this.stopTimer = window.setTimeout(() => {
        this.stopAudio();
      }, maxMs);
    } catch {
      this.stopAudio();
    }
  }

  playUrl(url: string, durationSeconds?: number, onCompletion?: () => void): void {
    this.stopAudio();
    this.onCompleteCb = onCompletion ?? null;
    const el = new Audio(url);
    this.audioEl = el;
    el.addEventListener('ended', () => {
      this.stopAudio();
    });
    el.addEventListener('error', () => {
      this.playHarmonicSequence([523.25, 659.25, 783.99, 1046.5], 0.22, durationSeconds, onCompletion);
    });
    this.scheduleDurationStop(durationSeconds);
    void el.play().catch(() => {
      this.playHarmonicSequence([523.25, 659.25, 783.99, 1046.5], 0.22, durationSeconds, onCompletion);
    });
  }

  playForSoundMode(options: {
    soundMode: SoundMode | string;
    customAudioPath?: string | null;
    customAudioFiles?: CustomAudioEntity[];
    durationSeconds?: number;
    vibrationEnabled?: boolean;
    onCompletion?: () => void;
  }): void {
    const {
      soundMode,
      customAudioPath,
      customAudioFiles = [],
      durationSeconds = 30,
      vibrationEnabled = true,
      onCompletion,
    } = options;

    if (
      vibrationEnabled &&
      soundMode !== 'silent' &&
      typeof navigator !== 'undefined' &&
      'vibrate' in navigator
    ) {
      try {
        navigator.vibrate([300, 200, 300]);
      } catch {
        // ignore
      }
    }

    if (soundMode === 'silent' || soundMode === 'vibrate_only') {
      this.stopAudio();
      onCompletion?.();
      return;
    }

    if (soundMode === 'custom_file' && customAudioPath) {
      const matched = customAudioFiles.find((a) => a.internalFilePath === customAudioPath);
      if (matched?.dataUrl) {
        this.playUrl(matched.dataUrl, durationSeconds, onCompletion);
        return;
      }
    }

    if (soundMode === 'adhan_1' || soundMode === 'adhan_full') {
      this.playHarmonicSequence(
        [293.66, 329.63, 392.0, 440.0, 392.0, 349.23, 329.63, 293.66],
        0.45,
        durationSeconds,
        onCompletion
      );
      return;
    }

    if (soundMode === 'adhan_2') {
      this.playHarmonicSequence(
        [329.63, 392.0, 440.0, 493.88, 440.0, 392.0, 329.63],
        0.42,
        durationSeconds,
        onCompletion
      );
      return;
    }

    this.playHarmonicSequence(
      [523.25, 659.25, 783.99, 1046.5],
      0.22,
      durationSeconds,
      onCompletion
    );
  }
}

export const AudioFileManager = new WebAudioFileManager();
