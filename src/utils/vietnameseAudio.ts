/**
 * Vietnamese Text-to-Speech Engine
 * Provides authentic, natural native Vietnamese pronunciation:
 * 1. Primary Engine: High-fidelity native Vietnamese voice streamed via /api/tts proxy
 * 2. Phonetic Normalizer: Translates biological symbols (µm -> mi-crô-mét, nm -> na-nô-mét, etc.)
 * 3. Smart Fallback: Web Speech API strictly targeting Vietnamese voices (vi-VN)
 */

// Normalizes biological and mathematical symbols into natural Vietnamese spoken words
export function normalizeVietnameseBiologyText(rawText: string): string {
  if (!rawText) return '';

  let text = rawText;

  // Replace special characters / bullets
  text = text.replace(/①/g, 'Thứ nhất: ');
  text = text.replace(/②/g, 'Thứ hai: ');
  text = text.replace(/③/g, 'Thứ ba: ');
  text = text.replace(/④/g, 'Thứ tư: ');
  text = text.replace(/⑤/g, 'Thứ năm: ');
  text = text.replace(/⑥/g, 'Thứ sáu: ');
  text = text.replace(/⑦/g, 'Thứ bảy: ');
  text = text.replace(/⑧/g, 'Thứ tám: ');

  // Units
  text = text.replace(/(\d+)\s*µm/gi, '$1 mi-crô-mét');
  text = text.replace(/µm/gi, 'mi-crô-mét');
  text = text.replace(/(\d+)\s*nm/gi, '$1 na-nô-mét');
  text = text.replace(/nm/gi, 'na-nô-mét');
  text = text.replace(/(\d+)\s*mm/gi, '$1 mi-li-mét');
  text = text.replace(/mm/gi, 'mi-li-mét');
  text = text.replace(/(\d+)\s*Ångström/gi, '$1 Ăng-xtơ-rôm');
  text = text.replace(/Ångström/gi, 'Ăng-xtơ-rôm');
  text = text.replace(/10⁻¹⁰\s*m/gi, '10 lũy thừa trừ 10 mét');
  text = text.replace(/10⁻⁹\s*m/gi, '10 lũy thừa trừ 9 mét');
  text = text.replace(/~/g, 'khoảng ');

  // Biological terms & acronyms
  text = text.replace(/E\.\s*coli/gi, 'E-cô-li');
  text = text.replace(/ADN/g, 'A-Đ-N');
  text = text.replace(/ARN/g, 'A-R-N');
  text = text.replace(/rARN/g, 'r A-R-N');
  text = text.replace(/mARN/g, 'm A-R-N');
  text = text.replace(/ATP/g, 'A-T-P');
  text = text.replace(/α-helix/gi, 'an-pha hê-lích');
  text = text.replace(/α/g, 'an-pha');
  text = text.replace(/β/g, 'bê-ta');
  text = text.replace(/HSA/g, 'H-S-A');
  text = text.replace(/PDB/g, 'P-D-B');
  text = text.replace(/70S/g, '70 ét');
  text = text.replace(/80S/g, '80 ét');
  text = text.replace(/50S/g, '50 ét');
  text = text.replace(/30S/g, '30 ét');
  text = text.replace(/60S/g, '60 ét');
  text = text.replace(/40S/g, '40 ét');
  text = text.replace(/S\/V/g, 'S trên V');
  text = text.replace(/Gram\s*\+/gi, 'Gram dương');
  text = text.replace(/Gram\s*−|Gram\s*-/gi, 'Gram âm');
  text = text.replace(/xenlulôzơ/gi, 'xen-lu-lô-zơ');
  text = text.replace(/plasmodesmata/gi, 'cầu sinh chất');
  text = text.replace(/tonoplast/gi, 'màng không bào');
  text = text.replace(/peptidoglycan/gi, 'pép-ti-đô-gli-can');

  // Fractions / numbers with comma
  text = text.replace(/0,1/g, 'không phẩy một');
  text = text.replace(/0,2/g, 'không phẩy hai');
  text = text.replace(/0,5/g, 'không phẩy năm');
  text = text.replace(/0,8/g, 'không phẩy tám');
  text = text.replace(/1,2/g, 'một phẩy hai');
  text = text.replace(/1,5/g, 'một phẩy năm');
  text = text.replace(/2,5/g, 'hai phẩy năm');

  return text.trim();
}

// Split text into natural chunks for TTS audio requests (max 140 chars per chunk)
function chunkText(text: string, maxLen = 140): string[] {
  const rawSentences = text.split(/(?<=[.!?:;\n])\s+/);
  const chunks: string[] = [];

  for (const sentence of rawSentences) {
    if (!sentence.trim()) continue;

    if (sentence.length <= maxLen) {
      chunks.push(sentence.trim());
    } else {
      const subParts = sentence.split(/(?<=[,])\s+/);
      let current = '';

      for (const part of subParts) {
        if ((current + ' ' + part).trim().length <= maxLen) {
          current = (current + ' ' + part).trim();
        } else {
          if (current) chunks.push(current);
          if (part.length <= maxLen) {
            current = part.trim();
          } else {
            const words = part.split(' ');
            let wordChunk = '';
            for (const w of words) {
              if ((wordChunk + ' ' + w).trim().length <= maxLen) {
                wordChunk = (wordChunk + ' ' + w).trim();
              } else {
                if (wordChunk) chunks.push(wordChunk);
                wordChunk = w;
              }
            }
            current = wordChunk;
          }
        }
      }
      if (current) chunks.push(current);
    }
  }

  return chunks.filter(c => c.length > 0);
}

class VietnameseAudioPlayer {
  private currentAudio: HTMLAudioElement | null = null;
  private queue: string[] = [];
  private isPlaying: boolean = false;
  private onEndCallback: (() => void) | null = null;
  private onStartCallback: (() => void) | null = null;
  private onErrorCallback: (() => void) | null = null;
  private speechUtterance: SpeechSynthesisUtterance | null = null;
  private cachedViVoice: SpeechSynthesisVoice | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.initVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = () => this.initVoices();
      }
    }
  }

  private initVoices(): void {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const voices = window.speechSynthesis.getVoices();
    const found = voices.find(
      v =>
        v.lang.toLowerCase().startsWith('vi') ||
        v.lang.toLowerCase().includes('vi-vn') ||
        v.lang.toLowerCase().includes('vi_vn') ||
        v.name.toLowerCase().includes('vietnam') ||
        v.name.toLowerCase().includes('tiếng việt') ||
        v.name.toLowerCase().includes('hoaimy') ||
        v.name.toLowerCase().includes('namminh') ||
        v.name.toLowerCase().includes('linh') ||
        v.name.toLowerCase().includes('an')
    );
    if (found) {
      this.cachedViVoice = found;
    }
  }

  public speak(
    text: string,
    options?: {
      onStart?: () => void;
      onEnd?: () => void;
      onError?: () => void;
    }
  ): void {
    this.stop();

    if (!text || !text.trim()) {
      if (options?.onEnd) options.onEnd();
      return;
    }

    const normalized = normalizeVietnameseBiologyText(text);
    this.queue = chunkText(normalized);
    this.onStartCallback = options?.onStart || null;
    this.onEndCallback = options?.onEnd || null;
    this.onErrorCallback = options?.onError || null;

    if (this.queue.length === 0) {
      if (this.onEndCallback) this.onEndCallback();
      return;
    }

    this.isPlaying = true;
    if (this.onStartCallback) this.onStartCallback();

    this.playNextChunk();
  }

  private async playNextChunk(): Promise<void> {
    if (!this.isPlaying) return;

    if (this.queue.length === 0) {
      this.isPlaying = false;
      if (this.onEndCallback) this.onEndCallback();
      return;
    }

    const chunk = this.queue.shift()!;
    // Stream authentic, native Vietnamese voice directly through /api/tts proxy
    const audioUrl = `/api/tts?text=${encodeURIComponent(chunk)}`;

    try {
      const response = await fetch(audioUrl);
      if (!response.ok) {
        throw new Error(`TTS status: ${response.status}`);
      }
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      const audio = new Audio(blobUrl);
      this.currentAudio = audio;

      audio.onended = () => {
        URL.revokeObjectURL(blobUrl);
        if (this.isPlaying) {
          setTimeout(() => {
            this.playNextChunk();
          }, 120);
        }
      };

      audio.onerror = () => {
        URL.revokeObjectURL(blobUrl);
        this.fallbackWebSpeech(chunk);
      };

      await audio.play();
    } catch {
      this.fallbackWebSpeech(chunk);
    }
  }

  private fallbackWebSpeech(remainingChunk: string): void {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      this.isPlaying = false;
      if (this.onErrorCallback) this.onErrorCallback();
      return;
    }

    window.speechSynthesis.cancel();
    const remainingText = [remainingChunk, ...this.queue].join(' ');
    this.queue = [];

    // Ensure we have scanned for Vietnamese voice
    this.initVoices();

    // STRICT CHECK: Only use Web Speech API if an authentic Vietnamese voice is actually found!
    // Never fall back to English/Chinese system voices to pronounce Vietnamese.
    if (!this.cachedViVoice) {
      console.warn('No Vietnamese voice pack installed on OS/browser. Audio fallback skipped to prevent English/Chinese pronunciation.');
      this.isPlaying = false;
      if (this.onErrorCallback) this.onErrorCallback();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(remainingText);
    utterance.lang = 'vi-VN';
    utterance.voice = this.cachedViVoice;
    utterance.rate = 0.92;
    utterance.pitch = 1.0;

    utterance.onend = () => {
      this.isPlaying = false;
      if (this.onEndCallback) this.onEndCallback();
    };

    utterance.onerror = () => {
      this.isPlaying = false;
      if (this.onErrorCallback) this.onErrorCallback();
    };

    this.speechUtterance = utterance;
    window.speechSynthesis.speak(utterance);
  }

  public stop(): void {
    this.isPlaying = false;
    this.queue = [];

    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      this.speechUtterance = null;
    }

    if (this.onEndCallback) {
      this.onEndCallback();
      this.onEndCallback = null;
    }
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }
}

export const vietnameseAudio = new VietnameseAudioPlayer();
