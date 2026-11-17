import React, { useState, useRef, useEffect, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  UploadCloud, FileVideo, Download, Play, 
  Settings2, HardDrive, Cpu, Scissors, Video, 
  Menu, X, ChevronDown, CheckCircle2, AlertCircle, FileAudio,
  Volume2, VolumeX, Sparkles, Sun, Moon, Cloud, Zap, 
  ShieldCheck, Sliders, RefreshCw, Award, ArrowRight,
  Smile, Check
} from 'lucide-react';

// ==========================================
// PLAYFUL AUDIO SYNTHESIZER (ZERO-DEPENDENCY)
// ==========================================

const playSoundEffect = (type: 'kick' | 'pop' | 'success' | 'whoosh' | 'boing', enabled = true) => {
  if (!enabled || typeof window === 'undefined') return;
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    const now = ctx.currentTime;

    if (type === 'kick') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(280, now);
      osc.frequency.exponentialRampToValueAtTime(65, now + 0.12);
      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.005, now + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.13);
    } else if (type === 'pop') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(450, now);
      osc.frequency.exponentialRampToValueAtTime(920, now + 0.08);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.005, now + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.09);
    } else if (type === 'boing') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.linearRampToValueAtTime(440, now + 0.06);
      osc.frequency.exponentialRampToValueAtTime(150, now + 0.2);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.005, now + 0.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.21);
    } else if (type === 'whoosh') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(200, now);
      osc.frequency.exponentialRampToValueAtTime(480, now + 0.15);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.005, now + 0.16);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.17);
    } else if (type === 'success') {
      // Ascending major chord fanfare: C5, E5, G5, C6
      const freqs = [523.25, 659.25, 783.99, 1046.50];
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const start = now + idx * 0.08;
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.22, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.32);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + 0.33);
      });
    }
  } catch {
    // Ignore audio errors if blocked
  }
};

// ==========================================
// SOUND CONTEXT
// ==========================================

const SoundContext = React.createContext<{ soundEnabled: boolean; toggleSound: () => void; play: (t: 'kick' | 'pop' | 'success' | 'whoosh' | 'boing') => void }>({
  soundEnabled: true,
  toggleSound: () => {},
  play: () => {}
});

const useSound = () => React.useContext(SoundContext);

// ==========================================
// THEME CONTEXT (SUN / STARRY NIGHT SKY)
// ==========================================

type Theme = 'day' | 'night';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  isDark: boolean;
}

const ThemeContext = React.createContext<ThemeContextType>({
  theme: 'day',
  toggleTheme: () => {},
  isDark: false
});

const useTheme = () => React.useContext(ThemeContext);

// ==========================================
// KICKABLE ICON WRAPPER COMPONENT
// ==========================================

interface KickIconProps {
  icon: React.ElementType;
  className?: string;
  size?: number;
  onClick?: () => void;
}

const KickIcon: React.FC<KickIconProps> = ({ icon: Icon, className = '', size = 20, onClick }) => {
  const [kicking, setKicking] = useState(false);
  const { soundEnabled } = useSound();

  const handleTrigger = (e: React.MouseEvent) => {
    e.stopPropagation();
    setKicking(true);
    playSoundEffect('kick', soundEnabled);
    if (onClick) onClick();
    setTimeout(() => setKicking(false), 520);
  };

  return (
    <span 
      onClick={handleTrigger}
      className={`icon-kick-target cursor-pointer inline-flex items-center justify-center ${kicking ? 'kicking' : ''}`}
      title="Click for kick effect!"
    >
      <Icon size={size} className={className} />
    </span>
  );
};

// ==========================================
// REAL BROWSER HARDWARE MEDIA ENGINE
// ==========================================

const getSupportedVideoConfig = (preferredFormat: string, includeAudio: boolean) => {
  const mp4Types = includeAudio
    ? [
        'video/mp4;codecs=avc1.42E01E,mp4a.40.2',
        'video/mp4;codecs=avc1,mp4a.40.2',
        'video/mp4;codecs=h264,aac',
        'video/mp4'
      ]
    : ['video/mp4;codecs=avc1.42E01E', 'video/mp4;codecs=avc1', 'video/mp4'];

  const webmTypes = includeAudio
    ? [
        'video/webm;codecs=vp9,opus',
        'video/webm;codecs=vp8,opus',
        'video/webm;codecs=h264,opus',
        'video/webm'
      ]
    : ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm'];

  const candidates =
    preferredFormat === 'webm' || preferredFormat === 'mkv'
      ? [...webmTypes, ...mp4Types]
      : [...mp4Types, ...webmTypes];

  for (const type of candidates) {
    if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(type)) {
      const isMp4 = type.startsWith('video/mp4');
      const ext = isMp4
        ? preferredFormat === 'mov'
          ? 'mov'
          : 'mp4'
        : preferredFormat === 'mkv'
        ? 'mkv'
        : 'webm';
      return {
        mimeType: type,
        baseMime: isMp4 ? 'video/mp4' : 'video/webm',
        ext
      };
    }
  }

  return { mimeType: '', baseMime: 'video/webm', ext: 'webm' };
};

const encodeAudioBufferToWav = (audioBuffer: AudioBuffer, targetSampleRate = 44100): Blob => {
  const numChannels = Math.min(2, audioBuffer.numberOfChannels);
  const ratio = audioBuffer.sampleRate / targetSampleRate;
  const newLength = Math.floor(audioBuffer.length / ratio);
  const bytesPerSample = 2;
  const blockAlign = numChannels * bytesPerSample;
  const dataSize = newLength * blockAlign;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, numChannels, true);
  view.setUint32(24, targetSampleRate, true);
  view.setUint32(28, targetSampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, 16, true);
  writeString(36, 'data');
  view.setUint32(40, dataSize, true);

  const channels: Float32Array[] = [];
  for (let c = 0; c < numChannels; c++) {
    channels.push(audioBuffer.getChannelData(c));
  }

  let offset = 44;
  for (let i = 0; i < newLength; i++) {
    const srcIdx = Math.min(audioBuffer.length - 1, Math.floor(i * ratio));
    for (let c = 0; c < numChannels; c++) {
      const sample = Math.max(-1, Math.min(1, channels[c][srcIdx]));
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
      offset += 2;
    }
  }

  return new Blob([buffer], { type: 'audio/wav' });
};

// ==========================================
// CONTAINER DURATION REPAIR ENGINE (WHATSAPP & ANDROID FIX)
// ==========================================

const findSequence = (buf: Uint8Array, seq: number[], start = 0, end = buf.length): number => {
  const seqLen = seq.length;
  const limit = Math.min(buf.length, end) - seqLen;
  for (let i = start; i <= limit; i++) {
    let match = true;
    for (let j = 0; j < seqLen; j++) {
      if (buf[i + j] !== seq[j]) {
        match = false;
        break;
      }
    }
    if (match) return i;
  }
  return -1;
};

const patchWebmDuration = (buffer: ArrayBuffer, durationSec: number): ArrayBuffer => {
  try {
    const u8 = new Uint8Array(buffer);
    const view = new DataView(buffer);
    const infoPos = findSequence(u8, [0x15, 0x49, 0xa9, 0x66], 0, Math.min(u8.length, 65536));
    if (infoPos === -1) return buffer;

    const durationMs = durationSec * 1000;
    const searchLimit = Math.min(u8.length, infoPos + 350);
    const durPos = findSequence(u8, [0x44, 0x89], infoPos, searchLimit);

    if (durPos !== -1) {
      const sizeByte = u8[durPos + 2];
      if (sizeByte === 0x84) {
        view.setFloat32(durPos + 3, durationMs, false);
        return buffer;
      } else if (sizeByte === 0x88) {
        view.setFloat64(durPos + 3, durationMs, false);
        return buffer;
      }
    }

    // Insert EBML Duration element into Info segment
    const durElement = new Uint8Array(11);
    durElement[0] = 0x44;
    durElement[1] = 0x89;
    durElement[2] = 0x88;
    const dv = new DataView(durElement.buffer);
    dv.setFloat64(3, durationMs, false);

    const lengthByte = u8[infoPos + 4];
    let vintLength = 1;
    let mask = 0x80;
    while (vintLength <= 8 && (lengthByte & mask) === 0) {
      mask >>= 1;
      vintLength++;
    }
    const insertPos = infoPos + 4 + vintLength;

    let oldInfoLength = lengthByte & (mask - 1);
    for (let k = 1; k < vintLength; k++) {
      oldInfoLength = (oldInfoLength << 8) | u8[infoPos + 4 + k];
    }

    const newBuffer = new Uint8Array(buffer.byteLength + durElement.length);
    newBuffer.set(u8.subarray(0, insertPos), 0);
    newBuffer.set(durElement, insertPos);
    newBuffer.set(u8.subarray(insertPos), insertPos + durElement.length);

    const newInfoLength = oldInfoLength + durElement.length;
    if (vintLength === 4) {
      newBuffer[infoPos + 4] = 0x10 | ((newInfoLength >> 24) & 0x0f);
      newBuffer[infoPos + 5] = (newInfoLength >> 16) & 0xff;
      newBuffer[infoPos + 6] = (newInfoLength >> 8) & 0xff;
      newBuffer[infoPos + 7] = newInfoLength & 0xff;
    } else if (vintLength === 2) {
      newBuffer[infoPos + 4] = 0x40 | ((newInfoLength >> 8) & 0x3f);
      newBuffer[infoPos + 5] = newInfoLength & 0xff;
    }

    return newBuffer.buffer;
  } catch (e) {
    console.warn('WebM duration patch skipped:', e);
    return buffer;
  }
};

const patchMp4Duration = (buffer: ArrayBuffer, durationSec: number): ArrayBuffer => {
  try {
    const u8 = new Uint8Array(buffer);
    const view = new DataView(buffer);

    // 1. Patch mvhd (Movie Header atom)
    let mvhdTimescale = 1000;
    const mvhdPos = findSequence(u8, [0x6d, 0x76, 0x68, 0x64], 0, Math.min(u8.length, 65536));
    if (mvhdPos !== -1) {
      const version = u8[mvhdPos + 4];
      if (version === 0) {
        mvhdTimescale = view.getUint32(mvhdPos + 16) || 1000;
        view.setUint32(mvhdPos + 20, Math.round(durationSec * mvhdTimescale));
      } else if (version === 1) {
        mvhdTimescale = view.getUint32(mvhdPos + 24) || 1000;
        view.setBigUint64(mvhdPos + 28, BigInt(Math.round(durationSec * mvhdTimescale)));
      }
    }

    // 2. Patch all tkhd (Track Header atoms) with movie timescale so track durations are valid
    let tkhdPos = 0;
    while ((tkhdPos = findSequence(u8, [0x74, 0x6b, 0x68, 0x64], tkhdPos, Math.min(u8.length, 65536))) !== -1) {
      const version = u8[tkhdPos + 4];
      if (version === 0) {
        view.setUint32(tkhdPos + 24, Math.round(durationSec * mvhdTimescale));
      } else if (version === 1) {
        view.setBigUint64(tkhdPos + 32, BigInt(Math.round(durationSec * mvhdTimescale)));
      }
      tkhdPos += 4;
    }

    // 3. Patch all mdhd (Media Header atoms) with their specific media track timescales
    let mdhdPos = 0;
    while ((mdhdPos = findSequence(u8, [0x6d, 0x64, 0x68, 0x64], mdhdPos, Math.min(u8.length, 65536))) !== -1) {
      const version = u8[mdhdPos + 4];
      if (version === 0) {
        const ts = view.getUint32(mdhdPos + 16) || 1000;
        view.setUint32(mdhdPos + 20, Math.round(durationSec * ts));
      } else if (version === 1) {
        const ts = view.getUint32(mdhdPos + 24) || 1000;
        view.setBigUint64(mdhdPos + 28, BigInt(Math.round(durationSec * ts)));
      }
      mdhdPos += 4;
    }

    // 4. Patch mehd (Movie Extends Header atom in mvex) if present
    const mehdPos = findSequence(u8, [0x6d, 0x65, 0x68, 0x64], 0, Math.min(u8.length, 65536));
    if (mehdPos !== -1) {
      const version = u8[mehdPos + 4];
      if (version === 0) {
        view.setUint32(mehdPos + 8, Math.round(durationSec * mvhdTimescale));
      } else if (version === 1) {
        view.setBigUint64(mehdPos + 8, BigInt(Math.round(durationSec * mvhdTimescale)));
      }
    }

    return buffer;
  } catch (e) {
    console.warn('MP4 duration patch skipped:', e);
    return buffer;
  }
};

const fixMediaDuration = async (blob: Blob, durationSec: number): Promise<Blob> => {
  if (!durationSec || durationSec <= 0) return blob;
  try {
    const arrayBuffer = await blob.arrayBuffer();
    const type = blob.type.toLowerCase();
    const isWebm = type.includes('webm') || (arrayBuffer.byteLength > 4 && new Uint8Array(arrayBuffer, 0, 4)[0] === 0x1a);
    const isMp4 = type.includes('mp4') || (arrayBuffer.byteLength > 8 && findSequence(new Uint8Array(arrayBuffer, 0, 64), [0x66, 0x74, 0x79, 0x70]) !== -1);

    let patched: ArrayBuffer = arrayBuffer;
    if (isWebm) {
      patched = patchWebmDuration(arrayBuffer, durationSec);
    } else if (isMp4) {
      patched = patchMp4Duration(arrayBuffer, durationSec);
    }
    return new Blob([patched], { type: blob.type });
  } catch (err) {
    console.warn('Error in fixMediaDuration:', err);
    return blob;
  }
};

interface VideoFileInfo {
  fps: number;
  hasAudio: boolean;
  timescale?: number;
}

const parseVideoFileHeader = async (file: File): Promise<VideoFileInfo> => {
  try {
    let fps = 30;
    let hasAudio = true;
    let foundFps = false;

    // Scan head slice (up to 4MB)
    const headSlice = await file.slice(0, Math.min(file.size, 4 * 1024 * 1024)).arrayBuffer();
    const buffersToScan: ArrayBuffer[] = [headSlice];

    // If file is > 2MB, also scan tail slice (last 6MB) where phone cameras write moov & stts
    if (file.size > 2 * 1024 * 1024) {
      try {
        const tailSlice = await file.slice(Math.max(0, file.size - 6 * 1024 * 1024), file.size).arrayBuffer();
        buffersToScan.push(tailSlice);
      } catch {}
    }

    for (const buf of buffersToScan) {
      const u8 = new Uint8Array(buf);
      const view = new DataView(buf);

      // Audio handler check
      if (findSequence(u8, [0x73, 0x6f, 0x75, 0x6e]) !== -1) {
        hasAudio = true;
      }

      // Check MP4 vide handler
      const videPos = findSequence(u8, [0x76, 0x69, 0x64, 0x65]);
      if (videPos !== -1) {
        // Look backwards for mdhd within 1000 bytes
        let mdhdPos = -1;
        for (let p = Math.max(0, videPos - 1000); p < videPos; p++) {
          if (u8[p] === 0x6d && u8[p + 1] === 0x64 && u8[p + 2] === 0x68 && u8[p + 3] === 0x64) {
            mdhdPos = p;
            break;
          }
        }

        let videoTimescale = 0;
        if (mdhdPos !== -1) {
          const ver = u8[mdhdPos + 4];
          const tsOffset = mdhdPos + (ver === 0 ? 16 : 24);
          if (tsOffset + 4 <= u8.length) {
            videoTimescale = view.getUint32(tsOffset);
          }
        }

        // Look forwards for stts within 120,000 bytes
        const sttsPos = findSequence(u8, [0x73, 0x74, 0x74, 0x73], videPos, Math.min(u8.length, videPos + 120000));
        if (sttsPos !== -1 && videoTimescale > 0) {
          const count = view.getUint32(sttsPos + 8);
          if (count > 0) {
            let totalSamples = 0;
            let totalDur = 0;
            const entriesToRead = Math.min(count, 128);
            for (let i = 0; i < entriesToRead; i++) {
              const entryOff = sttsPos + 12 + i * 8;
              if (entryOff + 8 <= u8.length) {
                const sCount = view.getUint32(entryOff);
                const sDelta = view.getUint32(entryOff + 4);
                totalSamples += sCount;
                totalDur += sCount * sDelta;
              }
            }
            if (totalDur > 0 && totalSamples > 0) {
              const calc = (videoTimescale * totalSamples) / totalDur;
              if (calc >= 15 && calc <= 144) {
                fps = Math.round(calc);
                foundFps = true;
                return { fps, hasAudio, timescale: videoTimescale };
              }
            }
          }
        }

        // If fragmented MP4 (fMP4), look for trun
        if (!foundFps && videoTimescale > 0) {
          const trunPos = findSequence(u8, [0x74, 0x72, 0x75, 0x6e]);
          if (trunPos !== -1) {
            const flags = (u8[trunPos + 5] << 16) | (u8[trunPos + 6] << 8) | u8[trunPos + 7];
            let off = trunPos + 12;
            if (flags & 0x0001) off += 4;
            if (flags & 0x0004) off += 4;
            if (flags & 0x0100 && off + 4 <= u8.length) {
              const dur = view.getUint32(off);
              if (dur > 0) {
                const calc = videoTimescale / dur;
                if (calc >= 15 && calc <= 144) {
                  fps = Math.round(calc);
                  foundFps = true;
                  return { fps, hasAudio, timescale: videoTimescale };
                }
              }
            }
          }
        }
      }

      // Check WebM
      if (u8.length >= 4 && u8[0] === 0x1a && u8[1] === 0x45 && u8[2] === 0xdf && u8[3] === 0xa3) {
        const durPos = findSequence(u8, [0x23, 0xe3, 0x83]);
        if (durPos !== -1 && durPos + 7 <= u8.length) {
          const sizeByte = u8[durPos + 3] & 0x0f;
          if (sizeByte === 4) {
            const ns = view.getUint32(durPos + 4);
            if (ns > 0) {
              const calc = 1e9 / ns;
              if (calc >= 15 && calc <= 144) {
                fps = Math.round(calc);
                return { fps, hasAudio };
              }
            }
          }
        }
      }
    }

    return { fps: 30, hasAudio: true };
  } catch (err) {
    return { fps: 30, hasAudio: true };
  }
};

// ==========================================
// MOCK SEO DATA & CONFIGURATION
// ==========================================

const seoPages: Record<string, any> = {
  '/video-compressor': {
    title: 'Free Open Sky Video Compressor | Reduce Video Size',
    h1: 'Cloud-Light Video Compressor',
    description: 'Compress videos online with open sky speed. Reduce video file size, adjust bitrate, choose formats, and download optimized videos with crisp quality.',
    content: 'Video compression reduces the file size of your videos by removing redundant data or lowering the bitrate smoothly. Our open sky tool uses real hardware acceleration right in your browser to maintain visual quality while saving precious storage space.'
  },
  '/video-converter': {
    title: 'Free Video Converter | Change Video Formats',
    h1: 'Online Video Format Converter',
    description: 'Convert videos between MP4, MKV, MOV, WebM, and AVI formats instantly in your browser with zero quality drop.',
    content: 'Format conversion makes your videos playable across all your devices, browsers, and mobile platforms. MP4 offers the broadest universal compatibility.'
  },
  '/video-to-mp3': {
    title: 'Video to MP3 Converter | Extract Audio Free',
    h1: 'Convert Video to Crystal MP3',
    description: 'Extract high-fidelity MP3 and lossless WAV audio from any video file. Fast, free, and completely private.',
    content: 'Need to save a podcast, speech, or music track from a video? Our high-speed audio extractor decodes the audio track and exports pure sound in standard MP3 or studio WAV.'
  },
  '/mp4-converter': {
    title: 'MP4 Converter | Convert Video to MP4 Free',
    h1: 'Convert Any Video to MP4',
    description: 'Easily convert MOV, MKV, AVI, and WebM to universal MP4 in your browser with hardware performance.',
    content: 'MP4 is the gold standard for video sharing. Convert your clips locally with hardware acceleration for seamless playback on iPhone, Android, and social media.'
  },
  '/video-codec-converter': {
    title: 'Video Codec Converter | Change H.264, VP9',
    h1: 'Video Codec Converter',
    description: 'Switch your video codec without uploading any file. Optimize between H.264 and VP9 codecs effortlessly.',
    content: 'Codecs determine compression efficiency. VP9 provides incredible compression for modern web browsers, while H.264 provides universal playback across older screens.'
  },
  '/h265-video-converter': {
    title: 'High Efficiency Video Compressor',
    h1: 'Next-Gen Video Compressor',
    description: 'Compress your clips to save up to 50% more storage with zero noticeable loss in visual clarity.',
    content: 'High efficiency compression provides superior bitrate-to-fidelity performance, allowing you to breeze through file upload limits on email and chat apps.'
  },
  '/video-resizer': {
    title: 'Video Resizer | Change Video Resolution',
    h1: 'Resize Video Resolution',
    description: 'Downscale 4K and 1080p videos to 720p or 480p to save maximum space in seconds.',
    content: 'Downscaling resolution is the single most effective way to shrink video weights for WhatsApp, Discord, or mobile messaging.'
  }
};

// ==========================================
// OPEN SKY ATMOSPHERE (ANIMATED CLOUDS, SUN/MOON THEME CHANGER, STARS, BALLOON)
// ==========================================

const nightStars = [
  { top: '8%', left: '12%', size: '3px', delay: '0.2s', duration: '2.8s', glow: 6 },
  { top: '14%', left: '28%', size: '2px', delay: '1.1s', duration: '3.4s', glow: 4 },
  { top: '6%', left: '44%', size: '4px', delay: '0.7s', duration: '2.2s', glow: 8 },
  { top: '22%', left: '60%', size: '2px', delay: '2.0s', duration: '4.1s', glow: 4 },
  { top: '10%', left: '76%', size: '3.5px', delay: '1.5s', duration: '2.9s', glow: 7 },
  { top: '18%', left: '88%', size: '2px', delay: '0.4s', duration: '3.1s', glow: 4 },
  { top: '28%', left: '8%', size: '2.5px', delay: '1.8s', duration: '3.6s', glow: 5 },
  { top: '35%', left: '22%', size: '3px', delay: '0.9s', duration: '2.5s', glow: 6 },
  { top: '30%', left: '40%', size: '2px', delay: '2.3s', duration: '3.8s', glow: 3 },
  { top: '42%', left: '55%', size: '3.5px', delay: '1.3s', duration: '2.7s', glow: 7 },
  { top: '34%', left: '72%', size: '2px', delay: '0.1s', duration: '3.3s', glow: 4 },
  { top: '48%', left: '84%', size: '3px', delay: '1.9s', duration: '3.0s', glow: 6 },
  { top: '56%', left: '16%', size: '2px', delay: '0.6s', duration: '4.0s', glow: 3 },
  { top: '64%', left: '32%', size: '3.5px', delay: '2.1s', duration: '2.6s', glow: 7 },
  { top: '58%', left: '48%', size: '2px', delay: '1.4s', duration: '3.5s', glow: 4 },
  { top: '68%', left: '68%', size: '2.5px', delay: '0.8s', duration: '3.2s', glow: 5 },
  { top: '62%', left: '92%', size: '3px', delay: '1.7s', duration: '2.9s', glow: 6 },
  { top: '78%', left: '6%', size: '2px', delay: '2.4s', duration: '3.7s', glow: 4 },
  { top: '82%', left: '24%', size: '3.5px', delay: '0.3s', duration: '2.4s', glow: 8 },
  { top: '74%', left: '52%', size: '2px', delay: '1.6s', duration: '3.3s', glow: 3 },
  { top: '86%', left: '78%', size: '3px', delay: '2.2s', duration: '3.1s', glow: 6 },
  { top: '92%', left: '42%', size: '2px', delay: '0.5s', duration: '3.9s', glow: 4 },
  { top: '90%', left: '64%', size: '2.5px', delay: '1.2s', duration: '2.8s', glow: 5 }
];

const OpenSkyAtmosphere = () => {
  const { play } = useSound();
  const { isDark, toggleTheme } = useTheme();
  const [balloonWobble, setBalloonWobble] = useState(false);
  const [celestialSpin, setCelestialSpin] = useState(false);

  const handleBalloonClick = () => {
    setBalloonWobble(true);
    play('boing');
    setTimeout(() => setBalloonWobble(false), 900);
  };

  const handleCelestialClick = () => {
    setCelestialSpin(true);
    play('whoosh');
    toggleTheme();
    setTimeout(() => setCelestialSpin(false), 650);
  };

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Starry Night Sky Starfield (Active in Night Mode) */}
      {isDark && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none transition-opacity duration-1000 opacity-100">
          {nightStars.map((s, idx) => (
            <div
              key={idx}
              className="absolute rounded-full bg-white animate-twinkle"
              style={{
                top: s.top,
                left: s.left,
                width: s.size,
                height: s.size,
                animationDelay: s.delay,
                animationDuration: s.duration,
                boxShadow: `0 0 ${s.glow}px rgba(255, 255, 255, 0.95)`
              }}
            />
          ))}

          {/* Shooting Star Streaking Across Night Sky */}
          <div className="absolute top-20 right-1/4 w-36 h-[2px] bg-gradient-to-r from-transparent via-cyan-200 to-white animate-shooting-star opacity-80" />
        </div>
      )}

      {/* Sun / Moon Theme Changer in Top Right */}
      <div 
        onClick={handleCelestialClick}
        className="pointer-events-auto absolute -top-12 -right-12 md:top-6 md:right-12 cursor-pointer z-10 transition-transform active:scale-90 group"
        title={isDark ? "Click the Moon to turn into Sunny Day! ☀️" : "Click the Sun to turn into Starry Night! 🌙"}
      >
        <div className={`relative w-44 h-44 md:w-56 md:h-56 ${celestialSpin ? 'scale-125 rotate-180' : ''} transition-all duration-700`}>
          {!isDark ? (
            /* Golden Radiant Sun (Day Sky) */
            <>
              {/* Rotating Sun Rays */}
              <div className="absolute inset-0 animate-sun-rays opacity-40">
                <svg viewBox="0 0 100 100" className="w-full h-full fill-amber-200">
                  <circle cx="50" cy="50" r="28" fill="none" stroke="rgba(253, 224, 71, 0.4)" strokeWidth="6" strokeDasharray="3 7" />
                  {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
                    <rect key={deg} x="48.5" y="4" width="3" height="12" rx="1.5" transform={`rotate(${deg} 50 50)`} fill="#fde047" opacity="0.6" />
                  ))}
                </svg>
              </div>
              {/* Sun Core with pulsing glow */}
              <div className="absolute inset-8 rounded-full bg-gradient-to-tr from-amber-400 via-amber-300 to-yellow-100 shadow-[0_0_80px_rgba(251,191,36,0.75)] animate-sun flex items-center justify-center">
                <Sun className="w-12 h-12 text-amber-800/50 transition-transform group-hover:rotate-45" />
              </div>
              {/* Interactive Hover Pill */}
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-amber-900/90 text-amber-100 text-[11px] font-bold px-3 py-1 rounded-full shadow-lg whitespace-nowrap border border-amber-300/40">
                Click for Night 🌙
              </div>
            </>
          ) : (
            /* Glowing Silver Crescent Moon (Starry Night Sky) */
            <>
              {/* Rotating Stardust Aura */}
              <div className="absolute inset-0 animate-sun-rays opacity-50">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <circle cx="50" cy="50" r="28" fill="none" stroke="rgba(199, 210, 254, 0.4)" strokeWidth="4" strokeDasharray="2 6" />
                  {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
                    <circle key={deg} cx="50" cy="6" r="1.8" transform={`rotate(${deg} 50 50)`} fill="#e0e7ff" opacity="0.8" />
                  ))}
                </svg>
              </div>
              {/* Moon Core with ethereal lunar glow */}
              <div className="absolute inset-8 rounded-full bg-gradient-to-tr from-indigo-300 via-slate-100 to-white shadow-[0_0_80px_rgba(165,180,252,0.85)] animate-moon flex items-center justify-center border-2 border-indigo-200/60">
                <Moon className="w-12 h-12 text-indigo-950/70 transition-transform group-hover:-rotate-12 fill-indigo-100/60" />
              </div>
              {/* Interactive Hover Pill */}
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-indigo-950/95 text-sky-200 text-[11px] font-bold px-3 py-1 rounded-full shadow-lg whitespace-nowrap border border-indigo-400/50">
                Click for Day ☀️
              </div>
            </>
          )}
        </div>
      </div>

      {/* Floating Hot Air Balloon in mid-left */}
      <div 
        onClick={handleBalloonClick}
        className={`pointer-events-auto absolute top-28 left-4 md:left-24 z-10 cursor-pointer animate-balloon transition-all duration-300 ${balloonWobble ? 'scale-125 rotate-12' : ''}`}
        title="Floating high in the cloud! Click me!"
      >
        <div className="relative group">
          {/* Hot air balloon SVG */}
          <svg width="68" height="90" viewBox="0 0 68 90" className="drop-shadow-[0_12px_20px_rgba(2,132,199,0.25)]">
            {/* Balloon body */}
            <path d="M34 2 C 14 2 2 18 2 36 C 2 54 18 64 26 70 L 42 70 C 50 64 66 54 66 36 C 66 18 54 2 34 2 Z" fill="url(#balloonGrad)" />
            {/* Balloon Stripes */}
            <path d="M22 4 C 15 16 14 56 28 69" stroke="#ffffff" strokeWidth="2.5" strokeOpacity="0.75" fill="none" />
            <path d="M46 4 C 53 16 54 56 40 69" stroke="#ffffff" strokeWidth="2.5" strokeOpacity="0.75" fill="none" />
            <path d="M34 2 L 34 70" stroke={isDark ? "#c7d2fe" : "#fef08a"} strokeWidth="2" strokeOpacity="0.9" fill="none" />
            {/* Basket ropes */}
            <line x1="28" y1="70" x2="30" y2="78" stroke="#64748b" strokeWidth="1.5" />
            <line x1="40" y1="70" x2="38" y2="78" stroke="#64748b" strokeWidth="1.5" />
            {/* Basket */}
            <rect x="29" y="78" width="10" height="9" rx="2" fill="#b45309" stroke="#78350f" strokeWidth="1" />
            {/* Glowing Lantern underneath at night */}
            {isDark && (
              <circle cx="34" cy="89" r="3.5" fill="#fef08a" filter="drop-shadow(0 0 8px #facc15)" />
            )}
            
            <defs>
              <linearGradient id="balloonGrad" x1="0" y1="0" x2="68" y2="90" gradientUnits="userSpaceOnUse">
                {isDark ? (
                  <>
                    <stop stopColor="#6366f1" />
                    <stop offset="0.45" stopColor="#a855f7" />
                    <stop offset="1" stopColor="#06b6d4" />
                  </>
                ) : (
                  <>
                    <stop stopColor="#38bdf8" />
                    <stop offset="0.45" stopColor="#818cf8" />
                    <stop offset="1" stopColor="#f472b6" />
                  </>
                )}
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/95 dark:bg-slate-900/95 text-sky-900 dark:text-sky-200 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm whitespace-nowrap border border-sky-200 dark:border-slate-700">
            {isDark ? "Star Voyager!" : "Fly High!"}
          </div>
        </div>
      </div>

      {/* Gentle soaring birds */}
      <div className="absolute top-20 right-1/3 opacity-30 animate-pulse">
        <svg width="40" height="18" viewBox="0 0 40 18" fill="none" stroke={isDark ? "#818cf8" : "#0369a1"} strokeWidth="2" strokeLinecap="round">
          <path d="M2 12 Q 10 2 20 10 Q 30 2 38 12" />
        </svg>
      </div>
      <div className="absolute top-36 right-1/4 opacity-25 scale-75">
        <svg width="40" height="18" viewBox="0 0 40 18" fill="none" stroke={isDark ? "#818cf8" : "#0369a1"} strokeWidth="2" strokeLinecap="round">
          <path d="M2 12 Q 10 2 20 10 Q 30 2 38 12" />
        </svg>
      </div>

      {/* Layer 1: High Fluffy Distant Cloud */}
      <div className={`absolute top-12 left-0 right-0 animate-cloud-slow transition-opacity duration-700 ${isDark ? 'opacity-35' : 'opacity-60'}`}>
        <svg viewBox="0 0 1200 240" className={`w-[1400px] h-auto max-w-none fill-current ${isDark ? 'text-indigo-950/70' : 'text-white/50'}`}>
          <path d="M120 180 C 90 180 60 160 60 130 C 60 95 95 70 135 75 C 160 40 215 30 260 55 C 295 20 365 25 395 65 C 440 60 475 90 470 135 C 500 145 510 180 470 180 Z" />
          <path d="M720 190 C 690 190 660 170 660 140 C 660 105 695 80 735 85 C 760 50 815 40 860 65 C 895 30 965 35 995 75 C 1040 70 1075 100 1070 145 C 1100 155 1110 190 1070 190 Z" />
        </svg>
      </div>

      {/* Layer 2: Midground Drifting Clouds with Soft Shadows (Desktop only for max mobile 60 FPS) */}
      <div className={`hidden md:block absolute top-44 left-[-150px] animate-cloud-medium transition-opacity duration-700 ${isDark ? 'opacity-40' : 'opacity-85'}`}>
        <svg width="780" height="190" viewBox="0 0 780 190" fill="none">
          <path 
            d="M80 160 C 40 160 10 135 10 95 C 10 55 50 30 95 40 C 130 -5 205 -10 260 25 C 305 -15 390 -5 425 45 C 480 35 530 75 520 125 C 560 135 570 160 530 160 Z" 
            fill="url(#cloudGrad1)" 
            filter="drop-shadow(0 16px 24px rgba(2, 132, 199, 0.12))"
          />
          <defs>
            <linearGradient id="cloudGrad1" x1="0" y1="0" x2="0" y2="190" gradientUnits="userSpaceOnUse">
              {isDark ? (
                <>
                  <stop stopColor="#1e293b" stopOpacity="0.85" />
                  <stop offset="1" stopColor="#0f172a" stopOpacity="0.6" />
                </>
              ) : (
                <>
                  <stop stopColor="#ffffff" stopOpacity="0.95" />
                  <stop offset="1" stopColor="#e0f2fe" stopOpacity="0.8" />
                </>
              )}
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Layer 3: Lower Breezy Clouds (Desktop only for max mobile 60 FPS) */}
      <div className={`hidden md:block absolute top-[520px] -right-20 animate-cloud-fast transition-opacity duration-700 ${isDark ? 'opacity-35' : 'opacity-75'}`}>
        <svg width="680" height="170" viewBox="0 0 680 170" fill="none">
          <path 
            d="M60 140 C 30 140 5 120 5 90 C 5 55 40 35 75 42 C 105 5 170 0 215 30 C 255 -5 325 5 355 45 C 400 40 440 70 435 110 C 470 120 475 140 440 140 Z" 
            fill="url(#cloudGrad2)"
            filter="drop-shadow(0 12px 20px rgba(3, 105, 161, 0.1))"
          />
          <defs>
            <linearGradient id="cloudGrad2" x1="0" y1="0" x2="0" y2="170" gradientUnits="userSpaceOnUse">
              {isDark ? (
                <>
                  <stop stopColor="#1e293b" stopOpacity="0.8" />
                  <stop offset="1" stopColor="#312e81" stopOpacity="0.5" />
                </>
              ) : (
                <>
                  <stop stopColor="#ffffff" stopOpacity="0.95" />
                  <stop offset="1" stopColor="#bae6fd" stopOpacity="0.75" />
                </>
              )}
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
};

// ==========================================
// CELEBRATION CONFETTI
// ==========================================

const CelebrationConfetti = () => {
  const pieces = Array.from({ length: 36 });
  const colors = ['#38bdf8', '#818cf8', '#f472b6', '#facc15', '#34d399', '#fb923c'];

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {pieces.map((_, i) => {
        const left = `${Math.random() * 100}%`;
        const delay = `${Math.random() * 0.8}s`;
        const duration = `${2 + Math.random() * 2}s`;
        const color = colors[i % colors.length];
        const size = `${8 + Math.random() * 10}px`;

        return (
          <div
            key={i}
            className="absolute rounded-sm"
            style={{
              left,
              top: '-20px',
              width: size,
              height: size,
              backgroundColor: color,
              animation: `confetti-fall ${duration} ease-out ${delay} forwards`,
              boxShadow: `0 2px 6px ${color}80`
            }}
          />
        );
      })}
    </div>
  );
};

// ==========================================
// PLAYFUL SKY MASCOT ("NIMBUS")
// ==========================================

const NimbusMascot = () => {
  const [tipIndex, setTipIndex] = useState(0);
  const [showBubble, setShowBubble] = useState(false);
  const [wiggling, setWiggling] = useState(false);
  const { play } = useSound();

  const tips = [
    "🎈 Did you know? Lowering 1080p to 720p reduces file size by over 45% with almost no visible blur!",
    "☁️ Cloudless Privacy: All encoding happens right inside your browser's hardware. 0 bytes uploaded!",
    "🚀 Discord Tip: Select the 8 MB preset to send videos anywhere without Discord Nitro!",
    "✨ WebM vs MP4: WebM gives smaller files for web browsers, while MP4 plays on literally every device!",
    "🎵 Extract Audio: Switch mode to Audio Extractor to grab podcast audio directly into crystal MP3!"
  ];

  const handleClick = () => {
    setWiggling(true);
    play('pop');
    setTipIndex((prev) => (prev + 1) % tips.length);
    setShowBubble(true);
    setTimeout(() => setWiggling(false), 500);
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end">
      {showBubble && (
        <div className="mb-3 max-w-xs glass-sky-strong p-3.5 rounded-2xl shadow-xl border border-white dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 animate-in fade-in slide-in-from-bottom-2 relative">
          <button 
            onClick={() => setShowBubble(false)}
            className="absolute top-1.5 right-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          >
            <X size={12} />
          </button>
          <div className="font-bold text-sky-700 dark:text-sky-400 mb-1 flex items-center gap-1">
            <Sparkles size={12} /> Nimbus Sky Tip
          </div>
          <p className="leading-relaxed">{tips[tipIndex]}</p>
        </div>
      )}

      <button
        onClick={handleClick}
        className={`group glass-sky-strong p-3 rounded-full shadow-lg border-2 border-white dark:border-slate-700 hover:border-sky-300 dark:hover:border-sky-500 transition-all kickable flex items-center gap-2 ${wiggling ? 'kicking' : ''}`}
        title="Hi! I am Nimbus. Click me for video tips!"
      >
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-sky-400 to-indigo-500 flex items-center justify-center text-white shadow-md">
          <Smile className="w-5 h-5 group-hover:rotate-12 transition-transform" />
        </div>
        <span className="text-xs font-bold text-sky-900 dark:text-sky-200 pr-1 hidden sm:inline">Ask Nimbus</span>
      </button>
    </div>
  );
};

// ==========================================
// SHARED UI: HEADER
// ==========================================

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { soundEnabled, toggleSound, play } = useSound();
  const { isDark, toggleTheme } = useTheme();

  const handleNavClick = () => {
    play('pop');
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 glass-sky backdrop-blur-xl border-b border-white/60 dark:border-slate-800/80 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link 
          to="/" 
          onClick={() => play('kick')}
          className="flex items-center space-x-2.5 group kickable"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 via-blue-600 to-indigo-600 flex items-center justify-center shadow-md shadow-sky-500/30 group-hover:rotate-12 transition-transform">
            <Video className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-black text-xl tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
              NovaCompress
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-sky-100 dark:bg-sky-950/80 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                {isDark ? "Night Sky" : "Open Sky"}
              </span>
            </span>
          </div>
        </Link>
        
        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center space-x-7 text-sm font-semibold text-slate-700 dark:text-slate-200">
          <Link to="/video-compressor" onClick={handleNavClick} className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors kickable">
            Compressor
          </Link>
          <Link to="/video-converter" onClick={handleNavClick} className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors kickable">
            Converter
          </Link>
          <Link to="/video-to-mp3" onClick={handleNavClick} className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors kickable">
            To MP3
          </Link>
          <Link to="/blog" onClick={handleNavClick} className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors kickable">
            Guides
          </Link>
          <Link to="/faq" onClick={handleNavClick} className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors kickable">
            FAQ
          </Link>
        </nav>

        {/* Action Controls */}
        <div className="hidden md:flex items-center space-x-3">
          {/* Theme Mode Button (Sun / Moon) */}
          <button
            onClick={() => {
              toggleTheme();
              play('whoosh');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all kickable flex items-center gap-1.5 ${
              isDark 
                ? 'bg-indigo-950/70 text-indigo-200 border-indigo-700/80 hover:bg-indigo-900/80 shadow-sm shadow-indigo-500/20' 
                : 'bg-amber-50 text-amber-900 border-amber-200 hover:bg-amber-100 shadow-sm'
            }`}
            title={isDark ? "Switch to Sunny Day Sky" : "Switch to Starry Night Sky"}
          >
            {isDark ? (
              <>
                <Moon size={14} className="text-indigo-300 fill-indigo-200/40" />
                <span>Night 🌙</span>
              </>
            ) : (
              <>
                <Sun size={14} className="text-amber-500" />
                <span>Day ☀️</span>
              </>
            )}
          </button>

          {/* Sound FX Toggle */}
          <button 
            onClick={() => {
              toggleSound();
              play('pop');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all kickable flex items-center gap-1.5 ${soundEnabled ? 'bg-sky-100 dark:bg-sky-950/70 text-sky-800 dark:text-sky-300 border-sky-300 dark:border-sky-800' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700'}`}
            title="Toggle Playful Kick & Action Sounds"
          >
            {soundEnabled ? <Volume2 size={14} className="text-sky-600 dark:text-sky-400" /> : <VolumeX size={14} />}
            <span>Sound {soundEnabled ? 'ON' : 'OFF'}</span>
          </button>

          <Link 
            to="/video-compressor" 
            onClick={() => play('kick')}
            className="btn-sky-primary px-5 py-2 rounded-xl font-bold text-sm flex items-center space-x-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Launch Studio</span>
          </Link>
        </div>

        {/* Mobile Toggle */}
        <div className="md:hidden flex items-center space-x-2">
          {/* Mobile Theme Toggle */}
          <button
            onClick={() => {
              toggleTheme();
              play('whoosh');
            }}
            className="p-2 rounded-lg bg-white/80 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200"
            title={isDark ? "Switch to Sunny Day" : "Switch to Starry Night"}
          >
            {isDark ? <Moon size={16} className="text-indigo-300" /> : <Sun size={16} className="text-amber-500" />}
          </button>

          <button 
            onClick={() => {
              toggleSound();
              play('pop');
            }}
            className="p-2 rounded-lg bg-white/80 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200"
          >
            {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>
          <button 
            className="p-2 rounded-lg bg-white/80 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200" 
            onClick={() => {
              play('pop');
              setMobileMenuOpen(!mobileMenuOpen);
            }}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileMenuOpen && (
        <div className="md:hidden glass-sky-strong border-b border-white px-5 py-5 space-y-3 flex flex-col text-slate-800 font-semibold shadow-lg">
          <Link to="/video-compressor" onClick={handleNavClick} className="py-2 px-3 rounded-lg hover:bg-sky-100 flex items-center justify-between">
            <span>Video Compressor</span>
            <ArrowRight size={14} className="text-sky-600" />
          </Link>
          <Link to="/video-converter" onClick={handleNavClick} className="py-2 px-3 rounded-lg hover:bg-sky-100 flex items-center justify-between">
            <span>Video Converter</span>
            <ArrowRight size={14} className="text-sky-600" />
          </Link>
          <Link to="/video-to-mp3" onClick={handleNavClick} className="py-2 px-3 rounded-lg hover:bg-sky-100 flex items-center justify-between">
            <span>Video to MP3</span>
            <ArrowRight size={14} className="text-sky-600" />
          </Link>
          <Link to="/blog" onClick={handleNavClick} className="py-2 px-3 rounded-lg hover:bg-sky-100 flex items-center justify-between">
            <span>Blog & Tutorials</span>
            <ArrowRight size={14} className="text-sky-600" />
          </Link>
          <Link to="/faq" onClick={handleNavClick} className="py-2 px-3 rounded-lg hover:bg-sky-100 flex items-center justify-between">
            <span>FAQ</span>
            <ArrowRight size={14} className="text-sky-600" />
          </Link>
          <div className="pt-2">
            <Link 
              to="/video-compressor" 
              onClick={handleNavClick}
              className="btn-sky-primary w-full py-2.5 rounded-xl font-bold text-center block text-sm"
            >
              Start Compressing
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

// ==========================================
// SHARED UI: FOOTER
// ==========================================

const Footer = () => {
  const { play } = useSound();

  return (
    <footer className="relative z-10 mt-32 border-t border-white/60 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/80 backdrop-blur-xl pt-16 pb-12 shadow-[0_-10px_30px_rgba(2,132,199,0.06)] dark:shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12 text-sm text-slate-600 dark:text-slate-300">
        <div>
          <div className="flex items-center space-x-2.5 mb-4">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-sm">
              <Video className="w-4 h-4" />
            </div>
            <span className="font-black text-lg text-slate-900 dark:text-white">NovaCompress</span>
          </div>
          <p className="leading-relaxed mb-6 font-medium">
            Breeze-fast, privacy-first media processing studio with open sky aesthetics. Compress, convert, and downscale videos right on your own machine.
          </p>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            100% Client-Side WebAssembly
          </div>
        </div>
        
        <div>
          <h3 className="font-bold text-slate-900 dark:text-white mb-4 text-base">Processing Tools</h3>
          <ul className="space-y-3 font-medium">
            <li><Link to="/video-compressor" onClick={() => play('pop')} className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors kickable">Video Compressor</Link></li>
            <li><Link to="/video-converter" onClick={() => play('pop')} className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors kickable">Video Converter</Link></li>
            <li><Link to="/video-to-mp3" onClick={() => play('pop')} className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors kickable">Video to MP3 Extractor</Link></li>
            <li><Link to="/video-resizer" onClick={() => play('pop')} className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors kickable">Video Resizer (4K to 1080p)</Link></li>
            <li><Link to="/video-codec-converter" onClick={() => play('pop')} className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors kickable">Codec Optimizer (VP9 / H.264)</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="font-bold text-slate-900 dark:text-white mb-4 text-base">Resources</h3>
          <ul className="space-y-3 font-medium">
            <li><Link to="/blog" onClick={() => play('pop')} className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors kickable">Compression Guides</Link></li>
            <li><Link to="/faq" onClick={() => play('pop')} className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors kickable">Frequently Asked Questions</Link></li>
            <li><Link to="/video-bitrate-calculator" onClick={() => play('pop')} className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors kickable">Bitrate Calculator</Link></li>
            <li><Link to="/about" onClick={() => play('pop')} className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors kickable">Our Hardware Engine</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="font-bold text-slate-900 dark:text-white mb-4 text-base">Company & Privacy</h3>
          <ul className="space-y-3 font-medium">
            <li><Link to="/about" onClick={() => play('pop')} className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors kickable">About Us</Link></li>
            <li><Link to="/privacy-policy" onClick={() => play('pop')} className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors kickable">Zero-Knowledge Privacy</Link></li>
            <li><Link to="/terms" onClick={() => play('pop')} className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors kickable">Terms of Service</Link></li>
            <li><Link to="/contact" onClick={() => play('pop')} className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors kickable">Contact Support</Link></li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-12 pt-8 border-t border-slate-200/80 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-4">
        <div>
          &copy; {new Date().getFullYear()} NovaCompress. Open sky browser architecture. All rights reserved.
        </div>
        <div className="flex items-center space-x-6">
          <span className="flex items-center gap-1 text-sky-700 dark:text-sky-400 font-semibold">
            <Cloud size={14} /> Powered by WebCodecs & Canvas Stream
          </span>
        </div>
      </div>
    </footer>
  );
};

// ==========================================
// CORE VIDEO TOOL COMPONENT
// ==========================================

interface CustomSelectOption {
  value: string;
  label: string;
}

interface CustomSelectProps {
  value: string;
  options: CustomSelectOption[];
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

const CustomSelect: React.FC<CustomSelectProps> = ({
  value,
  options,
  onChange,
  disabled = false,
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { play } = useSound();

  const selectedOption = options.find((opt) => opt.value === value) || options[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('pointerdown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('pointerdown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          if (!disabled) {
            play('pop');
            setIsOpen((prev) => !prev);
          }
        }}
        className={`w-full rounded-xl py-2.5 px-3.5 font-semibold text-xs sm:text-sm text-left flex items-center justify-between transition-all duration-200 border ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-sky-400 dark:hover:border-sky-500'
        } ${
          isOpen
            ? 'ring-2 ring-sky-400/50 border-sky-400 dark:border-sky-500 bg-white/95 dark:bg-slate-900/95 shadow-md'
            : 'bg-white/80 dark:bg-slate-900/80 border-sky-200/90 dark:border-slate-700/80 shadow-sm'
        } text-slate-800 dark:text-slate-100 backdrop-blur-md`}
      >
        <span className="truncate pr-2">{selectedOption ? selectedOption.label : value}</span>
        <ChevronDown
          size={16}
          className={`text-sky-600 dark:text-sky-400 shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-1.5 p-1.5 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-sky-200/90 dark:border-slate-700/80 shadow-2xl shadow-sky-500/10 dark:shadow-black/70 max-h-60 overflow-y-auto">
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  play('pop');
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`w-full px-3 py-2 rounded-xl text-left text-xs sm:text-sm font-semibold transition-all flex items-center justify-between gap-2 ${
                  isSelected
                    ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white font-bold shadow-sm'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-sky-50 dark:hover:bg-slate-800/80 hover:text-sky-600 dark:hover:text-sky-300'
                }`}
              >
                <span className="truncate">{option.label}</span>
                {isSelected && <Check size={15} className="shrink-0 text-white" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

interface DynamicPreset {
  id: string;
  label: string;
  platform: string;
  sizeMb: string;
  reductionPct: number;
  description: string;
  badge: string;
}

const getPresetsForFile = (fileSizeInBytes: number | null): DynamicPreset[] => {
  if (!fileSizeInBytes || fileSizeInBytes <= 0) {
    return [
      { id: 'wa-16', label: '16 MB limit', platform: 'WhatsApp', sizeMb: '16', reductionPct: 0, description: 'Universal WhatsApp 16 MB status & chat upload limit', badge: 'Chat' },
      { id: 'discord-20', label: '20 MB limit', platform: 'Discord', sizeMb: '19.5', reductionPct: 0, description: 'Fits Discord 20 MB free upload limit', badge: 'Free' },
      { id: 'email-25', label: '25 MB limit', platform: 'Gmail', sizeMb: '24', reductionPct: 0, description: 'Fits Gmail & Outlook 25 MB attachment cap', badge: 'Email' },
      { id: 'wa-64', label: '64 MB limit', platform: 'WhatsApp HD', sizeMb: '60', reductionPct: 0, description: 'WhatsApp HD 64 MB media limit', badge: 'HD' },
      { id: 'save-50', label: 'Half Size', platform: '50% Cut', sizeMb: '50', reductionPct: 50, description: 'Halves video file size with crisp clarity', badge: '-50%' }
    ];
  }

  const origMb = fileSizeInBytes / (1024 * 1024);
  const presets: DynamicPreset[] = [];

  // 1. WhatsApp Compatibility:
  if (origMb > 70) {
    const pctHd = Math.round((1 - 60 / origMb) * 100);
    presets.push({
      id: 'wa-hd',
      label: '60 MB',
      platform: 'WhatsApp HD',
      sizeMb: '60',
      reductionPct: pctHd,
      description: `Compress ${origMb.toFixed(1)} MB ➔ 60 MB to fit WhatsApp 64 MB HD limit (${pctHd}% smaller)`,
      badge: `-${pctHd}%`
    });
    const pctFast = Math.round((1 - 15.5 / origMb) * 100);
    presets.push({
      id: 'wa-fast',
      label: '15.5 MB',
      platform: 'WhatsApp Fast',
      sizeMb: '15.5',
      reductionPct: pctFast,
      description: `Instant WhatsApp chat & status: ${origMb.toFixed(1)} MB ➔ 15.5 MB (${pctFast}% smaller)`,
      badge: `-${pctFast}%`
    });
  } else if (origMb > 16) {
    const pct = Math.round((1 - 15.5 / origMb) * 100);
    presets.push({
      id: 'wa-std',
      label: '15.5 MB',
      platform: 'WhatsApp Chat',
      sizeMb: '15.5',
      reductionPct: pct,
      description: `Under WhatsApp 16 MB chat limit: ${origMb.toFixed(1)} MB ➔ 15.5 MB (${pct}% smaller)`,
      badge: `-${pct}%`
    });
  } else {
    const waMb = Math.max(0.8, +(origMb * 0.55).toFixed(1));
    const pct = Math.round((1 - waMb / origMb) * 100);
    presets.push({
      id: 'wa-opt',
      label: `${waMb} MB`,
      platform: 'WhatsApp Fit',
      sizeMb: `${waMb}`,
      reductionPct: pct,
      description: `Fast WhatsApp send: ${origMb.toFixed(1)} MB ➔ ${waMb} MB (${pct}% smaller)`,
      badge: `-${pct}%`
    });
  }

  // 2. Discord Compatibility (Free limit 20 MB):
  if (origMb > 20) {
    const pct = Math.round((1 - 19.5 / origMb) * 100);
    presets.push({
      id: 'discord-free',
      label: '19.5 MB',
      platform: 'Discord Free',
      sizeMb: '19.5',
      reductionPct: pct,
      description: `Fits Discord 20 MB free upload cap: ${origMb.toFixed(1)} MB ➔ 19.5 MB (${pct}% smaller)`,
      badge: `-${pct}%`
    });
  } else {
    const discMb = Math.max(0.8, +(origMb * 0.5).toFixed(1));
    const pct = Math.round((1 - discMb / origMb) * 100);
    presets.push({
      id: 'discord-fit',
      label: `${discMb} MB`,
      platform: 'Discord Fast',
      sizeMb: `${discMb}`,
      reductionPct: pct,
      description: `Fits Discord free upload: ${origMb.toFixed(1)} MB ➔ ${discMb} MB (${pct}% smaller)`,
      badge: `-${pct}%`
    });
  }

  // 3. Email / Gmail Compatibility (Strict 25 MB limit):
  if (origMb > 25) {
    const pct = Math.round((1 - 24 / origMb) * 100);
    presets.push({
      id: 'email-max',
      label: '24 MB',
      platform: 'Gmail Limit',
      sizeMb: '24',
      reductionPct: pct,
      description: `Fits Gmail & Outlook 25 MB attachment limit: ${origMb.toFixed(1)} MB ➔ 24 MB (${pct}% smaller)`,
      badge: `-${pct}%`
    });
  }

  // 4. 50% Reduction (Half Size):
  const halfMb = Math.max(0.5, +(origMb * 0.5).toFixed(1));
  presets.push({
    id: 'half-size',
    label: `${halfMb} MB`,
    platform: '50% Cut',
    sizeMb: `${halfMb}`,
    reductionPct: 50,
    description: `Cuts your ${origMb.toFixed(1)} MB video in half down to ${halfMb} MB with studio quality`,
    badge: '-50%'
  });

  // 5. 75% Reduction (Save 75%):
  const quarterMb = Math.max(0.3, +(origMb * 0.25).toFixed(1));
  presets.push({
    id: 'save-75',
    label: `${quarterMb} MB`,
    platform: 'Save 75%',
    sizeMb: `${quarterMb}`,
    reductionPct: 75,
    description: `Reduces your ${origMb.toFixed(1)} MB video down to ${quarterMb} MB (75% savings)`,
    badge: '-75%'
  });

  return presets;
};

const VideoTool = ({ defaultMode = 'compress' }) => {
  const { play } = useSound();
  const [file, setFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<{
    duration: number;
    width: number;
    height: number;
    fps?: number;
    hasAudio?: boolean;
  }>({ duration: 0, width: 0, height: 0, fps: 30, hasAudio: true });

  const resolutionOptions = useMemo(() => {
    const options = [
      { value: 'keep', label: `Keep Original Dimensions (${metadata.width > 0 ? `${metadata.width}×${metadata.height}` : 'Auto'})` }
    ];
    const h = metadata.height || 0;
    const w = metadata.width || 0;
    const maxDim = Math.max(h, w);
    const minDim = Math.min(h, w);

    if (h === 0 && w === 0) {
      return [
        { value: 'keep', label: 'Keep Original Dimensions' },
        { value: '1080p', label: '1080p (Full HD)' },
        { value: '720p', label: '720p (HD - Best for chats)' },
        { value: '480p', label: '480p (SD - Tiny size)' },
        { value: '360p', label: '360p (Ultra-Light - Max saving)' }
      ];
    }

    if (minDim >= 900 || maxDim >= 1800) {
      options.push({ value: '1080p', label: '1080p (Full HD)' });
    }
    if (minDim >= 600 || maxDim >= 1100) {
      options.push({ value: '720p', label: '720p (HD - Best for chats)' });
    }
    if (minDim >= 400 || maxDim >= 700) {
      options.push({ value: '480p', label: '480p (SD - Tiny size)' });
    }
    if (minDim >= 300 || maxDim >= 450) {
      options.push({ value: '360p', label: '360p (Ultra-Light - Max saving)' });
    }
    return options;
  }, [metadata.width, metadata.height]);

  const frameRateOptions = useMemo(() => {
    const detectedFps = metadata.fps ? Math.round(metadata.fps) : 30;
    const options = [
      { value: 'keep', label: `Original Frame Rate (${detectedFps} FPS)` }
    ];
    if (detectedFps !== 60 && detectedFps !== 50 && detectedFps !== 30 && detectedFps !== 24 && detectedFps >= 15) {
      options.push({ value: String(detectedFps), label: `${detectedFps} FPS (Match Source)` });
    }
    options.push({ value: '60', label: '60 FPS (Ultra Smooth)' });
    options.push({ value: '50', label: '50 FPS (PAL Smooth)' });
    options.push({ value: '30', label: '30 FPS (Standard Web & Mobile)' });
    options.push({ value: '24', label: '24 FPS (Fast Chat / WhatsApp)' });
    return options;
  }, [metadata.fps]);

  const [settings, setSettings] = useState({
    mode: defaultMode,
    outputFormat: 'mp4',
    resolution: 'keep',
    frameRate: 'keep',
    encodingSpeed: 'balanced',
    qualityPreset: 'medium',
    bitrateMode: 'auto',
    customBitrate: 2500,
    targetSize: '',
    audioAction: 'keep',
    audioFormat: 'mp3',
    audioBitrate: '128k'
  });

  const dynamicPresets = useMemo(() => {
    return getPresetsForFile(file ? file.size : null);
  }, [file]);

  const activePresetObj = useMemo(() => {
    if (!settings.targetSize) return null;
    return dynamicPresets.find(p => p.sizeMb === settings.targetSize) || null;
  }, [dynamicPresets, settings.targetSize]);

  useEffect(() => {
    if (!metadata.width) return;
    if (settings.resolution !== 'keep') {
      const exists = resolutionOptions.some(opt => opt.value === settings.resolution);
      if (!exists) {
        setSettings(prev => ({ ...prev, resolution: 'keep' }));
      }
    }
    if (settings.frameRate !== 'keep') {
      const exists = frameRateOptions.some(opt => opt.value === settings.frameRate);
      if (!exists) {
        setSettings(prev => ({ ...prev, frameRate: 'keep' }));
      }
    }
  }, [resolutionOptions, frameRateOptions]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState('');
  const [result, setResult] = useState<{ url: string; size: number; name: string; isAudio?: boolean } | null>(null);
  const [targetMessage, setTargetMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const abortRef = useRef(false);
  const activeRecorderRef = useRef<MediaRecorder | null>(null);
  const activeVideoElRef = useRef<HTMLVideoElement | null>(null);
  const activeAudioCtxRef = useRef<AudioContext | null>(null);

  const applyPreset = (targetMb: string) => {
    setSettings((prev) => {
      if (prev.targetSize === targetMb) {
        play('pop');
        return {
          ...prev,
          targetSize: '',
          bitrateMode: 'auto'
        };
      }
      play('boing');
      return {
        ...prev,
        mode: 'compress',
        targetSize: targetMb,
        bitrateMode: 'auto'
      };
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (selected.size > 2 * 1024 * 1024 * 1024) {
      setErrorMessage("File is too large for browser processing. Max 2GB.");
      return;
    }

    play('whoosh');
    setFile(selected);
    const url = URL.createObjectURL(selected);
    setVideoPreview(url);
    setResult(null);
    setProgress(0);
    setTargetMessage(null);
    setErrorMessage(null);

    parseVideoFileHeader(selected).then((info) => {
      setMetadata((prev) => ({
        ...prev,
        fps: info.fps,
        hasAudio: info.hasAudio
      }));
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped && dropped.type.startsWith('video/')) {
      play('whoosh');
      setFile(dropped);
      const url = URL.createObjectURL(dropped);
      setVideoPreview(url);
      setResult(null);
      setProgress(0);
      setTargetMessage(null);
      setErrorMessage(null);

      parseVideoFileHeader(dropped).then((info) => {
        setMetadata((prev) => ({
          ...prev,
          fps: info.fps,
          hasAudio: info.hasAudio
        }));
      });
    }
  };

  const cancelProcessing = () => {
    play('pop');
    abortRef.current = true;
    if (activeRecorderRef.current && activeRecorderRef.current.state !== 'inactive') {
      try {
        activeRecorderRef.current.stop();
      } catch {}
    }
    if (activeVideoElRef.current) {
      try {
        activeVideoElRef.current.pause();
        activeVideoElRef.current.muted = true;
        activeVideoElRef.current.volume = 0;
        activeVideoElRef.current.src = '';
        if (activeVideoElRef.current.parentNode) {
          activeVideoElRef.current.parentNode.removeChild(activeVideoElRef.current);
        }
      } catch {}
    }
    if (videoRef.current) {
      try {
        videoRef.current.pause();
      } catch {}
    }
    if (activeAudioCtxRef.current) {
      try {
        activeAudioCtxRef.current.close();
      } catch {}
      activeAudioCtxRef.current = null;
    }
    setIsProcessing(false);
    setProgress(0);
    setProgressText('Processing cancelled.');
  };

  const processVideo = async () => {
    if (!file || isProcessing) return;
    play('kick');
    setIsProcessing(true);
    abortRef.current = false;
    setProgress(3);
    setProgressText('Initializing hardware video encoder...');
    setTargetMessage(null);
    setErrorMessage(null);

    // Mute and pause the UI preview player so its sound never plays while compressing
    if (videoRef.current) {
      try {
        videoRef.current.pause();
        videoRef.current.muted = true;
      } catch {}
    }

    // CRITICAL FOR ANDROID CHROME & MOBILE WEBVIEW:
    // AudioContext MUST be created and resumed synchronously within the immediate user click gesture.
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    let audioCtx: AudioContext | null = null;
    if (AudioContextClass) {
      try {
        audioCtx = new AudioContextClass();
        activeAudioCtxRef.current = audioCtx;
        if (audioCtx.state === 'suspended') {
          audioCtx.resume().catch(() => {});
        }
      } catch (e) {
        console.warn('AudioContext pre-unlock warning:', e);
      }
    }

    try {
      const baseName = file.name.replace(/\.[^/.]+$/, '');

      // MODE 1: AUDIO EXTRACTION
      if (settings.mode === 'audio') {
        setProgressText('Decoding audio stream...');
        setProgress(25);
        const arrayBuffer = await file.arrayBuffer();
        if (abortRef.current) {
          if (audioCtx) audioCtx.close().catch(() => {});
          return;
        }

        const actx = audioCtx || new AudioContextClass();
        const decodedBuffer = await actx.decodeAudioData(arrayBuffer);
        if (abortRef.current) {
          actx.close().catch(() => {});
          return;
        }

        setProgress(65);
        setProgressText('Synthesizing studio audio stream...');

        const kbps = parseInt(settings.audioBitrate.replace('k', ''), 10) || 128;
        const sampleRate =
          settings.audioFormat === 'wav'
            ? 44100
            : kbps >= 256
            ? 44100
            : kbps >= 128
            ? 32000
            : 22050;

        const wavBlob = encodeAudioBufferToWav(decodedBuffer, sampleRate);
        await actx.close().catch(() => {});
        activeAudioCtxRef.current = null;

        setProgress(100);
        const outUrl = URL.createObjectURL(wavBlob);
        setResult({
          url: outUrl,
          size: wavBlob.size,
          name: `novacompress_${baseName}.wav`,
          isAudio: true
        });
        play('success');
        setShowCelebration(true);
        setTimeout(() => setShowCelebration(false), 3800);
        return;
      }

      // MODE 2: REAL HARDWARE VIDEO COMPRESSION & TRANSCODING
      let duration = Number.isFinite(metadata.duration) && metadata.duration > 0.1 
        ? metadata.duration 
        : 10;
      let targetW = metadata.width || 1280;
      let targetH = metadata.height || 720;

      if (settings.resolution !== 'keep') {
        const requestedH = parseInt(settings.resolution.replace('p', ''), 10);
        if (requestedH && targetH > 0) {
          const aspect = targetW / targetH;
          targetH = requestedH;
          targetW = Math.round(requestedH * aspect);
        }
      }
      targetW = Math.max(2, targetW % 2 === 0 ? targetW : targetW + 1);
      targetH = Math.max(2, targetH % 2 === 0 ? targetH : targetH + 1);

      const includeAudio = settings.audioAction !== 'remove';
      const audioBps = !includeAudio 
        ? 0 
        : settings.audioAction === 'voice' 
        ? 64000 
        : 128000;
      const targetMb = settings.targetSize ? parseFloat(settings.targetSize) : null;
      let videoBps = 2500000;

      const headroom = settings.encodingSpeed === 'studio' 
        ? 0.96 
        : settings.encodingSpeed === 'balanced' 
        ? 0.93 
        : 0.88;

      if (targetMb && targetMb > 0) {
        const targetBytes = targetMb * 1024 * 1024;
        const totalBits = targetBytes * 8;
        const totalBps = totalBits / duration;
        
        if (file.size <= targetBytes) {
          const originalBps = (file.size * 8) / duration;
          const preserveRatio = settings.encodingSpeed === 'studio' ? 0.98 : settings.encodingSpeed === 'balanced' ? 0.92 : 0.85;
          videoBps = Math.max(120000, Math.floor((originalBps - audioBps) * preserveRatio));
        } else {
          videoBps = Math.max(80000, Math.floor((totalBps - audioBps) * headroom));
        }
      } else if (settings.bitrateMode === 'custom') {
        videoBps = Math.max(60000, settings.customBitrate * 1000);
      } else {
        const originalBps = (file.size * 8) / duration;
        const presetFactor =
          settings.qualityPreset === 'fast'
            ? 0.35
            : settings.qualityPreset === 'medium'
            ? 0.55
            : 0.78;
        videoBps = Math.max(150000, Math.floor(originalBps * presetFactor - audioBps));
      }

      const { mimeType, baseMime, ext } = getSupportedVideoConfig(settings.outputFormat, includeAudio);
      const detectedSourceFps = metadata.fps ? Math.round(metadata.fps) : 30;
      const targetFps = settings.frameRate !== 'keep' 
        ? parseInt(settings.frameRate, 10) || 30 
        : Math.min(120, Math.max(15, detectedSourceFps));

      setProgress(6);
      setProgressText(`Warming up ${targetW}x${targetH} @ ${targetFps} FPS engine...`);

      const hiddenVideo = document.createElement('video');
      activeVideoElRef.current = hiddenVideo;
      hiddenVideo.src = URL.createObjectURL(file);
      hiddenVideo.playsInline = true;
      (hiddenVideo as any).webkitPlaysInline = true;
      hiddenVideo.setAttribute('playsinline', '');
      hiddenVideo.setAttribute('webkit-playsinline', '');
      hiddenVideo.crossOrigin = 'anonymous';
      hiddenVideo.preload = 'auto';
      // START MUTED AND ZERO VOLUME:
      hiddenVideo.muted = true;
      hiddenVideo.defaultMuted = true;
      hiddenVideo.volume = 0;
      hiddenVideo.setAttribute('muted', '');

      // CRITICAL FOR MOBILE: Give element real dimensions in viewport behind opaque UI.
      // Do NOT set 2px width or 0.01 opacity, which triggers Android Chromium power-saver throttling (10-14 FPS or 0 FPS stall).
      hiddenVideo.style.position = 'fixed';
      hiddenVideo.style.top = '0px';
      hiddenVideo.style.left = '0px';
      hiddenVideo.style.width = '320px';
      hiddenVideo.style.height = '240px';
      hiddenVideo.style.zIndex = '-999';
      hiddenVideo.style.pointerEvents = 'none';
      document.body.appendChild(hiddenVideo);

      await new Promise<void>((resolve) => {
        if (hiddenVideo.readyState >= 2) {
          resolve();
          return;
        }
        let isDone = false;
        const onReady = () => {
          if (!isDone && hiddenVideo.readyState >= 1) {
            isDone = true;
            resolve();
          }
        };
        hiddenVideo.addEventListener('loadedmetadata', onReady, { once: true });
        hiddenVideo.addEventListener('loadeddata', onReady, { once: true });
        hiddenVideo.addEventListener('canplay', onReady, { once: true });
        setTimeout(() => {
          if (!isDone) {
            isDone = true;
            resolve();
          }
        }, 1500);
        hiddenVideo.load();
      });

      if (Number.isFinite(hiddenVideo.duration) && hiddenVideo.duration > 0.1) {
        duration = hiddenVideo.duration;
      }

      const canvas = document.createElement('canvas');
      canvas.width = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext('2d', { alpha: false, desynchronized: true }) || canvas.getContext('2d');
      if (!ctx) throw new Error('Could not initialize 2D video frame buffer.');

      ctx.drawImage(hiddenVideo, 0, 0, targetW, targetH);

      const canvasStream = canvas.captureStream(targetFps);
      const combinedTracks: MediaStreamTrack[] = [...canvasStream.getVideoTracks()];

      // AUDIO ROUTING ENGINE: 100% SILENT THROUGH SPEAKERS, 100% CAPTURED INTO VIDEO
      let audioTrackAdded = false;

      if (includeAudio) {
        try {
          if (audioCtx) {
            if (audioCtx.state === 'suspended') {
              await audioCtx.resume().catch(() => {});
            }

            // createMediaElementSource disconnects the video's audio from default speakers completely!
            const sourceNode = audioCtx.createMediaElementSource(hiddenVideo);
            const destNode = audioCtx.createMediaStreamDestination();
            sourceNode.connect(destNode);

            // CRITICAL: We NEVER connect sourceNode or destNode to audioCtx.destination!
            // This guarantees ZERO audio is ever played through phone or PC speakers.
            
            // Now unmute hiddenVideo: all audio flows into destNode.stream, ZERO into speakers!
            hiddenVideo.muted = false;
            hiddenVideo.defaultMuted = false;
            hiddenVideo.volume = 1;
            hiddenVideo.removeAttribute('muted');

            // Attach dummy silent audio sink to keep mobile audio rendering pipeline active
            const dummyAudio = document.createElement('audio');
            dummyAudio.srcObject = destNode.stream;
            dummyAudio.muted = true;
            dummyAudio.volume = 0;
            dummyAudio.play().catch(() => {});

            const capturedAudioTracks = destNode.stream.getAudioTracks();
            if (capturedAudioTracks.length > 0) {
              capturedAudioTracks[0].enabled = true;
              combinedTracks.push(capturedAudioTracks[0]);
              audioTrackAdded = true;
            }
          }
        } catch (err) {
          console.warn('Web Audio capture setup error:', err);
          hiddenVideo.muted = true;
          hiddenVideo.volume = 0;
        }

        // Direct captureStream fallback
        if (!audioTrackAdded) {
          try {
            const directStream = (hiddenVideo as any).captureStream ? (hiddenVideo as any).captureStream() : (hiddenVideo as any).mozCaptureStream ? (hiddenVideo as any).mozCaptureStream() : null;
            if (directStream) {
              const directTracks = directStream.getAudioTracks();
              if (directTracks.length > 0) {
                combinedTracks.push(directTracks[0]);
                audioTrackAdded = true;
              }
            }
          } catch (e) {
            console.warn('Direct stream fallback error:', e);
          }
        }
      }

      const outputStream = new MediaStream(combinedTracks);
      const recorderOptions: MediaRecorderOptions = {
        videoBitsPerSecond: videoBps,
        ...(audioTrackAdded ? { audioBitsPerSecond: audioBps } : {}),
        ...(mimeType ? { mimeType } : {})
      };

      const recorder = new MediaRecorder(outputStream, recorderOptions);
      activeRecorderRef.current = recorder;
      const chunks: BlobPart[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      const encodedBlobPromise = new Promise<Blob>((resolve, reject) => {
        recorder.onstop = () => {
          const rawBlob = new Blob(chunks, { type: baseMime });
          resolve(rawBlob);
        };
        recorder.onerror = (event: any) => {
          reject(new Error(event?.error?.message || 'Hardware encoder error occurred.'));
        };
      });

      let hasEnded = false;
      let frameCallbackId: number | null = null;
      let animationFrameId: number | null = null;
      let renderIntervalId: number | null = null;
      let watchdogTimer: number | null = null;
      let lastTime = -1;
      let stallCount = 0;
      let frameCount = 0;

      const finishEncoding = () => {
        if (hasEnded) return;
        hasEnded = true;
        if (renderIntervalId !== null) window.clearInterval(renderIntervalId);
        if (watchdogTimer !== null) window.clearInterval(watchdogTimer);
        if (frameCallbackId !== null && 'cancelVideoFrameCallback' in hiddenVideo) {
          try {
            (hiddenVideo as any).cancelVideoFrameCallback(frameCallbackId);
          } catch {}
        }
        if (animationFrameId !== null) {
          cancelAnimationFrame(animationFrameId);
        }
        if (audioCtx) {
          audioCtx.close().catch(() => {});
          audioCtx = null;
          activeAudioCtxRef.current = null;
        }
        if (recorder.state !== 'inactive') {
          try {
            recorder.stop();
          } catch {}
        }
      };

      const renderCurrentFrame = () => {
        if (hasEnded || abortRef.current) return;
        
        ctx.drawImage(hiddenVideo, 0, 0, targetW, targetH);
        frameCount++;

        if (Number.isFinite(hiddenVideo.duration) && hiddenVideo.duration > 0.1) {
          duration = hiddenVideo.duration;
        }
        const effectiveDuration = Number.isFinite(duration) && duration > 0.5 ? duration : 10;
        const currentT = hiddenVideo.currentTime;
        const pct = Math.min(99, Math.max(8, Math.round((currentT / effectiveDuration) * 100)));
        setProgress(pct);

        if (pct < 15) {
          setProgressText(`⚡ Encoding ${targetW}x${targetH} @ strictly ${targetFps} FPS...`);
        } else if (pct < 85) {
          setProgressText(`✨ Optimizing ${targetW}x${targetH} (${frameCount} frames @ ${targetFps} FPS)...`);
        } else {
          setProgressText('📦 Finalizing MP4 container & audio sync...');
        }

        // Android stall recovery: only kick if genuinely stalled for > 1.2s (40 frames)
        if (hiddenVideo.paused || currentT === lastTime) {
          stallCount++;
          if (stallCount >= 40) {
            stallCount = 0;
            hiddenVideo.play().catch(() => {});
          }
        } else {
          stallCount = 0;
          lastTime = currentT;
        }

        if (hiddenVideo.currentTime >= effectiveDuration - 0.08 || hiddenVideo.ended) {
          finishEncoding();
        }
      };

      // Dual-drive compositor engine:
      // 1. Decoder pump (requestVideoFrameCallback) draws as soon as video hardware decodes a new frame
      // 2. Refresh pump (requestAnimationFrame) draws in sync with display refresh rate (60Hz / 120Hz)
      const pumpFrame = () => {
        if (hasEnded || abortRef.current) return;
        renderCurrentFrame();
        if ('requestVideoFrameCallback' in hiddenVideo && !hiddenVideo.ended && !hasEnded) {
          frameCallbackId = (hiddenVideo as any).requestVideoFrameCallback(pumpFrame);
        }
      };

      const pumpRaf = () => {
        if (hasEnded || abortRef.current) return;
        renderCurrentFrame();
        if (!hiddenVideo.ended && !hasEnded) {
          animationFrameId = window.requestAnimationFrame(pumpRaf);
        }
      };

      hiddenVideo.onended = () => {
        finishEncoding();
      };

      watchdogTimer = window.setInterval(() => {
        if (abortRef.current) {
          finishEncoding();
          return;
        }
        if (hiddenVideo.paused && !hiddenVideo.ended && !hasEnded) {
          hiddenVideo.play().catch(() => {});
        }
        const effectiveDuration = Number.isFinite(duration) && duration > 0.5 ? duration : 10;
        if (hiddenVideo.currentTime >= effectiveDuration - 0.08) {
          finishEncoding();
        }
      }, 250);

      // Pause preview player to free up Android hardware decoder session
      if (videoRef.current) {
        try {
          videoRef.current.pause();
        } catch {}
      }

      // Safe playback start: race with 600ms timeout so progress never freezes at 5% on Android
      const playPromise = hiddenVideo.play().catch(async (playErr) => {
        console.warn('Playback error, retrying muted:', playErr);
        hiddenVideo.muted = true;
        hiddenVideo.volume = 0;
        return hiddenVideo.play().catch(() => {});
      });

      await Promise.race([
        playPromise,
        new Promise((r) => setTimeout(r, 600))
      ]);

      // Start recorder and frame engines:
      recorder.start(100);

      if ('requestVideoFrameCallback' in hiddenVideo) {
        frameCallbackId = (hiddenVideo as any).requestVideoFrameCallback(pumpFrame);
      }
      animationFrameId = window.requestAnimationFrame(pumpRaf);

      const frameIntervalMs = Math.max(16, Math.floor(1000 / targetFps));
      renderIntervalId = window.setInterval(renderCurrentFrame, frameIntervalMs);

      const rawBlob = await encodedBlobPromise;
      finishEncoding();

      if (hiddenVideo.parentNode) {
        hiddenVideo.parentNode.removeChild(hiddenVideo);
      }

      outputStream.getTracks().forEach((t) => t.stop());
      URL.revokeObjectURL(hiddenVideo.src);

      if (abortRef.current) return;

      if (rawBlob.size === 0) {
        throw new Error('Encoded output was 0 bytes. Please try another format or resolution.');
      }

      setProgressText('Fixing container duration for WhatsApp & Gallery compatibility...');
      // CRITICAL: NEVER calculate duration from (frameCount / targetFps)!
      // The true video duration must always be used so the container is never truncated to 4 seconds!
      const exactDuration = Number.isFinite(hiddenVideo.duration) && hiddenVideo.duration > 0.1 
        ? hiddenVideo.duration 
        : (duration > 0.1 ? duration : 10);
      const finalBlob = await fixMediaDuration(rawBlob, exactDuration);

      setProgress(100);
      const finalUrl = URL.createObjectURL(finalBlob);
      const finalExt = rawBlob.type.includes('mp4') ? 'mp4' : rawBlob.type.includes('webm') ? 'webm' : ext;
      const finalFileName = `novacompress_${baseName}.${finalExt}`;

      if (targetMb) {
        const actualMb = finalBlob.size / (1024 * 1024);
        if (actualMb > targetMb * 1.1) {
          setTargetMessage(
            `Note: Final size is ${actualMb.toFixed(2)} MB. Lowering the resolution (e.g. to 480p or 360p) will help reach smaller targets.`
          );
        }
      }

      setResult({
        url: finalUrl,
        size: finalBlob.size,
        name: finalFileName,
        isAudio: false
      });
      play('success');
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 3800);
    } catch (err) {
      if (abortRef.current) return;
      console.error(err);
      setErrorMessage(
        err instanceof Error
          ? err.message
          : 'A critical error occurred while encoding this media file.'
      );
    } finally {
      if (activeVideoElRef.current) {
        try {
          activeVideoElRef.current.pause();
          activeVideoElRef.current.muted = true;
          activeVideoElRef.current.volume = 0;
          if (activeVideoElRef.current.parentNode) {
            activeVideoElRef.current.parentNode.removeChild(activeVideoElRef.current);
          }
        } catch {}
      }
      if (activeAudioCtxRef.current) {
        try {
          activeAudioCtxRef.current.close();
        } catch {}
        activeAudioCtxRef.current = null;
      }
      if (!abortRef.current) {
        setIsProcessing(false);
        setProgressText('');
      }
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const calcReduction = () => {
    if (!file || !result) return 0;
    const savings = file.size - result.size;
    if (savings <= 0) return 0;
    return Math.round((savings / file.size) * 100);
  };

  return (
    <div className="w-full max-w-5xl mx-auto mt-6 relative z-20">
      {showCelebration && <CelebrationConfetti />}

      {/* Full-Screen Centered Compressing Modal for Android & Desktop */}
      {isProcessing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-lg animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white/95 dark:bg-slate-900/95 border-2 border-sky-400/50 dark:border-sky-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl text-center space-y-6 relative overflow-hidden">
            {/* Top ambient highlight */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-600"></div>

            {/* Status Header Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-black bg-sky-100 dark:bg-sky-950/80 text-sky-700 dark:text-sky-300 border border-sky-300 dark:border-sky-800">
              <Zap size={14} className="text-amber-500 animate-bounce" />
              <span>Hardware Acceleration Active</span>
            </div>

            {/* Glowing Percentage Display */}
            <div className="relative w-32 h-32 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-slate-200 dark:border-slate-800"></div>
              <div 
                className="absolute inset-0 rounded-full border-4 border-sky-500 border-t-transparent animate-spin"
                style={{ animationDuration: '0.9s' }}
              ></div>
              <div className="flex flex-col items-center justify-center">
                <span className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">{progress}%</span>
                <span className="text-[10px] font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider">Compressed</span>
              </div>
            </div>

            {/* Dynamic Status Text */}
            <div className="space-y-1">
              <p className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-snug">{progressText}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {settings.mode === 'audio' 
                  ? 'Extracting studio audio stream...' 
                  : settings.targetSize 
                  ? `Targeting exact ${settings.targetSize} MB output` 
                  : `Encoding at ${settings.qualityPreset} quality preset`}
              </p>
            </div>

            {/* Sky Progress Bar with Shimmer */}
            <div className="space-y-2">
              <div className="w-full h-3.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden relative shadow-inner">
                <div 
                  className="h-full bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-600 rounded-full relative transition-all duration-200"
                  style={{ width: `${Math.max(4, progress)}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer"></div>
                </div>
              </div>
              <div className="flex justify-between items-center text-[11px] font-bold text-slate-500 dark:text-slate-400 px-1">
                <span>0% Start</span>
                <span>50%</span>
                <span>100% Done</span>
              </div>
            </div>

            {/* Cancel Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={cancelProcessing}
                className="w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/40 border border-rose-200 dark:border-rose-800 transition-colors flex items-center justify-center gap-2 kickable"
              >
                <X size={15} />
                <span>Cancel Encoding</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Studio Glass Card */}
      <div className="glass-sky-strong rounded-3xl shadow-2xl overflow-hidden transition-all duration-300">

        {/* State 1: Upload Dropzone */}
        {!file && (
          <div 
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`p-10 md:p-20 flex flex-col items-center justify-center text-center transition-all ${isDragging ? 'bg-sky-100/80 scale-[0.99] border-2 border-dashed border-sky-400' : ''}`}
          >
            {/* Playful Floating Cloud Badge with Kick */}
            <div 
              onClick={() => play('boing')}
              className="w-24 h-24 bg-gradient-to-tr from-sky-400 via-sky-300 to-blue-500 rounded-3xl flex items-center justify-center mb-6 shadow-xl shadow-sky-500/25 border-4 border-white kickable cursor-pointer"
            >
              <KickIcon icon={UploadCloud} size={44} className="text-white drop-shadow-sm" />
            </div>

            <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">
              Drop Your Video Into the <span className="text-gradient-sky text-glow-sky">Open Sky</span>
            </h2>
            <p className="text-slate-600 dark:text-slate-300 mb-8 max-w-md text-base leading-relaxed font-medium">
              Drag and drop files here, or browse from your device. Everything processes instantly in browser hardware with zero cloud storage.
            </p>

            {/* Quick Preset Buttons on Upload View */}
            <div className="flex flex-wrap justify-center items-center gap-2 mb-8 max-w-xl">
              <span className="text-xs font-extrabold text-slate-600 dark:text-slate-300 flex items-center gap-1 self-center mr-1">
                <Sparkles size={13} className="text-amber-500" /> Presets:
              </span>
              {dynamicPresets.map((p, idx) => {
                const isSelected = settings.targetSize === p.sizeMb;
                return (
                  <button
                    key={idx}
                    onClick={() => applyPreset(p.sizeMb)}
                    className={`text-xs font-bold px-3 py-1.5 rounded-full border transition-all kickable flex items-center gap-1.5 ${
                      isSelected 
                        ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white border-sky-400 shadow-md ring-2 ring-sky-300 dark:ring-sky-500' 
                        : 'bg-white/80 dark:bg-slate-800/80 text-sky-800 dark:text-sky-300 border-sky-200 dark:border-slate-700 hover:bg-sky-100 dark:hover:bg-slate-700'
                    }`}
                    title={isSelected ? "Click to deselect preset" : p.description}
                  >
                    <span>{p.platform}</span>
                    <span className="opacity-80 text-[11px]">({p.label})</span>
                    {p.badge && (
                      <span className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-white/25 text-white' : 'bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-300'}`}>
                        {p.badge}
                      </span>
                    )}
                    {isSelected && <span className="text-[10px] bg-white/30 rounded-full px-1">✕</span>}
                  </button>
                );
              })}
              {settings.targetSize && (
                <button
                  onClick={() => {
                    play('pop');
                    setSettings((prev) => ({ ...prev, targetSize: '' }));
                  }}
                  className="text-xs font-bold px-3 py-1.5 rounded-full text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-all flex items-center gap-1 kickable"
                  title="Deselect active preset"
                >
                  <X size={12} /> Clear ({settings.targetSize}MB)
                </button>
              )}
            </div>
            
            <label 
              onClick={() => play('pop')}
              className="btn-sky-primary px-8 py-4 rounded-2xl font-bold cursor-pointer flex items-center space-x-3 text-base shadow-lg kickable"
            >
              <KickIcon icon={UploadCloud} size={22} className="text-white" />
              <span>Select Video File</span>
              <input type="file" className="hidden" accept="video/*" onChange={handleFileUpload} />
            </label>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-xs font-medium text-slate-500">
              <span className="flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-emerald-600" /> 100% Private In-Browser
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Zap size={14} className="text-amber-500" /> GPU Hardware Accelerated
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <FileVideo size={14} className="text-sky-600" /> MP4, MOV, MKV, WebM (up to 2GB)
              </span>
            </div>
          </div>
        )}

        {/* State 2: Processing Workspace */}
        {file && !result && (
          <div className="grid grid-cols-1 lg:grid-cols-5 min-h-[520px]">
            {/* Left: Video Preview & Stats */}
            <div className="lg:col-span-2 bg-slate-900/5 dark:bg-slate-950/40 p-6 border-b lg:border-b-0 lg:border-r border-slate-200/80 dark:border-slate-800 flex flex-col justify-between">
              <div>
                <div className="rounded-2xl overflow-hidden bg-slate-950 aspect-video flex items-center justify-center mb-5 border-2 border-white dark:border-slate-800 shadow-inner relative group">
                  {videoPreview ? (
                    <video 
                      ref={videoRef}
                      src={videoPreview} 
                      className="w-full h-full object-contain" 
                      controls={!isProcessing}
                      onLoadedMetadata={(e) => {
                        const v = e.currentTarget;
                        const d = v.duration;
                        const w = v.videoWidth;
                        const h = v.videoHeight;
                        setMetadata((prev) => ({
                          ...prev,
                          duration: Number.isFinite(d) && d > 0 ? d : 10,
                          width: w > 0 ? w : 1280,
                          height: h > 0 ? h : 720
                        }));
                      }}
                    />
                  ) : (
                    <FileVideo className="w-12 h-12 text-slate-400" />
                  )}

                  {isProcessing && (
                    <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-sm flex flex-col items-center justify-center p-4 text-center text-white">
                      <div className="w-12 h-12 rounded-full border-3 border-sky-400 border-t-transparent animate-spin mb-3"></div>
                      <span className="text-xs font-bold text-sky-300 uppercase tracking-wider">Encoding in progress</span>
                    </div>
                  )}
                </div>

                {/* File Metadata Info Pill */}
                <div className="bg-white/80 dark:bg-slate-900/80 p-4 rounded-2xl border border-white dark:border-slate-800 shadow-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Source Video</span>
                    <span className="badge-sky text-[10px] font-extrabold px-2 py-0.5 rounded-full">Ready</span>
                  </div>
                  <p className="font-black text-slate-800 dark:text-slate-100 text-sm truncate" title={file.name}>{file.name}</p>
                  <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
                    <span className="font-extrabold text-sky-700 dark:text-sky-400">{formatSize(file.size)}</span>
                    {metadata.duration > 0 && (
                      <span className="text-slate-500 dark:text-slate-400 font-medium">
                        {Math.round(metadata.duration)}s • {metadata.width}×{metadata.height} • {Math.round(metadata.fps || 30)} FPS
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <button 
                onClick={() => {
                  play('pop');
                  setFile(null); 
                  setVideoPreview(null);
                }}
                className="mt-6 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 transition-colors flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-slate-200/80 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 kickable"
                disabled={isProcessing}
              >
                <RefreshCw size={13} /> Change File
              </button>
            </div>

            {/* Right: Settings Studio */}
            <div className="lg:col-span-3 p-6 md:p-8 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200/80 dark:border-slate-800">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-lg bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 flex items-center justify-center">
                      <Settings2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-slate-900 dark:text-white leading-none">Encoding Studio</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">Configure target weight and output parameters</p>
                    </div>
                  </div>

                  {/* Mode Pills */}
                  <div className="flex bg-slate-200/70 dark:bg-slate-800/80 p-1 rounded-xl">
                    <button 
                      onClick={() => {
                        play('pop');
                        setSettings({...settings, mode: 'compress'});
                      }}
                      className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all kickable ${settings.mode === 'compress' ? 'bg-white dark:bg-slate-700 text-sky-700 dark:text-sky-300 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
                      disabled={isProcessing}
                    >
                      Compress
                    </button>
                    <button 
                      onClick={() => {
                        play('pop');
                        setSettings({...settings, mode: 'audio'});
                      }}
                      className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all kickable ${settings.mode === 'audio' ? 'bg-white dark:bg-slate-700 text-sky-700 dark:text-sky-300 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
                      disabled={isProcessing}
                    >
                      Audio Extractor
                    </button>
                  </div>
                </div>

                {settings.mode === 'compress' ? (
                  <div className="space-y-5">
                    {/* Format & Resolution */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Output Format</label>
                        <CustomSelect
                          value={settings.outputFormat}
                          onChange={(val) => setSettings({...settings, outputFormat: val})}
                          disabled={isProcessing}
                          options={[
                            { value: 'mp4', label: 'MP4 (Universal standard)' },
                            { value: 'webm', label: 'WebM (Fast web embed)' },
                            { value: 'mov', label: 'MOV (QuickTime)' },
                            { value: 'mkv', label: 'MKV (Matroska)' }
                          ]}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Resolution Downscale</label>
                        <CustomSelect
                          value={settings.resolution}
                          onChange={(val) => setSettings({...settings, resolution: val})}
                          disabled={isProcessing}
                          options={resolutionOptions}
                        />
                      </div>
                    </div>

                    {/* Framerate & Performance Mode */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Frame Rate (FPS)</label>
                        <CustomSelect
                          value={settings.frameRate}
                          onChange={(val) => setSettings({...settings, frameRate: val})}
                          disabled={isProcessing}
                          options={frameRateOptions}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Encoding Engine Speed</label>
                        <CustomSelect
                          value={settings.encodingSpeed}
                          onChange={(val) => setSettings({...settings, encodingSpeed: val})}
                          disabled={isProcessing}
                          options={[
                            { value: 'turbo', label: '⚡ Turbo (Fastest Encoding)' },
                            { value: 'balanced', label: '⚖️ Balanced (Recommended)' },
                            { value: 'studio', label: '💎 Studio (Maximum Fidelity)' }
                          ]}
                        />
                      </div>
                    </div>

                    {/* Strict Target File Size */}
                    <div className="bg-sky-50/70 dark:bg-slate-900/60 p-4 rounded-2xl border border-sky-100 dark:border-slate-800 shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <KickIcon icon={Sliders} size={15} className="text-sky-600 dark:text-sky-400" />
                          <span>Exact Target File Size</span>
                        </label>
                        <span className="badge-sky text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                          Auto-Calculated
                        </span>
                      </div>

                      {/* Dynamic Calculated Preset Buttons */}
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        {dynamicPresets.map((p, i) => {
                          const isSelected = settings.targetSize === p.sizeMb;
                          return (
                            <button
                              key={i}
                              onClick={() => applyPreset(p.sizeMb)}
                              className={`text-xs font-bold px-2.5 py-1.5 rounded-xl border transition-all kickable flex items-center gap-1.5 ${
                                isSelected 
                                  ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white border-sky-400 shadow-sm ring-2 ring-sky-300 dark:ring-sky-500' 
                                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-sky-300 hover:text-sky-600 dark:hover:text-sky-400'
                              }`}
                              title={isSelected ? "Click to deselect preset" : p.description}
                            >
                              <span>{p.platform}</span>
                              <span className="opacity-80 text-[11px]">({p.label})</span>
                              {p.badge && (
                                <span className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-white/25 text-white' : 'bg-sky-100 dark:bg-sky-900/50 text-sky-700 dark:text-sky-300'}`}>
                                  {p.badge}
                                </span>
                              )}
                              {isSelected && <span className="text-[10px] bg-white/30 rounded-full px-1">✕</span>}
                            </button>
                          );
                        })}
                        {settings.targetSize && (
                          <button
                            onClick={() => {
                              play('pop');
                              setSettings((prev) => ({ ...prev, targetSize: '' }));
                            }}
                            className="text-xs font-bold px-2.5 py-1.5 rounded-xl text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-all flex items-center gap-1 kickable"
                            title="Deselect active preset"
                          >
                            <X size={11} /> Deselect
                          </button>
                        )}
                      </div>

                      {/* Clear Calculation Explainer Card */}
                      {activePresetObj && (
                        <div className="mb-3 p-3 rounded-xl bg-sky-50/90 dark:bg-sky-950/50 border border-sky-200 dark:border-sky-800 text-xs text-slate-700 dark:text-slate-200 flex items-start gap-2 shadow-sm animate-fadeIn">
                          <Sparkles size={15} className="text-amber-500 shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <div className="font-bold flex items-center gap-1.5 text-sky-900 dark:text-sky-100">
                              <span>{activePresetObj.platform} Preset</span>
                              <span className="bg-sky-200/80 dark:bg-sky-800 text-sky-900 dark:text-sky-100 text-[10px] px-1.5 py-0.2 rounded font-mono font-bold">
                                Target: {activePresetObj.label}
                              </span>
                              {activePresetObj.badge && (
                                <span className="bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 text-[10px] px-1.5 py-0.2 rounded font-bold">
                                  {activePresetObj.badge} reduction
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1">
                              {activePresetObj.description}
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="flex space-x-2">
                        <input 
                          type="number"
                          placeholder="Or type custom MB size (e.g. 15)"
                          className="w-full glass-input rounded-xl py-2 px-3 font-semibold text-sm"
                          value={settings.targetSize}
                          onChange={(e) => setSettings({...settings, targetSize: e.target.value, bitrateMode: 'auto'})}
                          disabled={isProcessing}
                        />
                        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 flex items-center text-slate-700 dark:text-slate-200 text-xs font-bold">
                          MB
                        </div>
                      </div>
                    </div>

                    {/* Audio & Quality Configuration */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {!settings.targetSize && (
                        <div>
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Compression Level</label>
                          <CustomSelect
                            value={settings.qualityPreset}
                            onChange={(val) => setSettings({...settings, qualityPreset: val})}
                            disabled={isProcessing}
                            options={[
                              { value: 'fast', label: 'Aggressive (Smallest file)' },
                              { value: 'medium', label: 'Balanced (Recommended)' },
                              { value: 'slow', label: 'High Fidelity (Maximum clarity)' }
                            ]}
                          />
                        </div>
                      )}

                      <div className={settings.targetSize ? 'sm:col-span-2' : ''}>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Audio Handling</label>
                        <CustomSelect
                          value={settings.audioAction}
                          onChange={(val) => setSettings({...settings, audioAction: val})}
                          disabled={isProcessing}
                          options={[
                            { value: 'keep', label: 'Keep Audio (128 kbps High Quality)' },
                            { value: 'voice', label: 'Voice Optimized (64 kbps - Saves Audio Space)' },
                            { value: 'remove', label: 'Remove Audio (Mute - Max Size Saving)' }
                          ]}
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Audio Extraction Options */
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Audio Format</label>
                      <CustomSelect
                        value={settings.audioFormat}
                        onChange={(val) => setSettings({...settings, audioFormat: val})}
                        disabled={isProcessing}
                        options={[
                          { value: 'wav', label: 'WAV (Studio Lossless 44.1kHz)' },
                          { value: 'mp3', label: 'MP3 (Universal Audio)' }
                        ]}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Audio Bitrate</label>
                      <CustomSelect
                        value={settings.audioBitrate}
                        onChange={(val) => setSettings({...settings, audioBitrate: val})}
                        disabled={isProcessing}
                        options={[
                          { value: '320k', label: '320 kbps (Studio Quality)' },
                          { value: '192k', label: '192 kbps (High Quality)' },
                          { value: '128k', label: '128 kbps (Standard Voice / Podcast)' }
                        ]}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Start Processing Action */}
              <div className="pt-6 mt-6 border-t border-slate-200/80 dark:border-slate-800">
                <button
                  onClick={processVideo}
                  disabled={isProcessing || !metadata.duration}
                  className="w-full btn-sky-primary py-3.5 rounded-2xl font-extrabold text-base flex items-center justify-center space-x-2.5 kickable disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-sky-500/30"
                >
                  <KickIcon icon={Play} size={18} className="fill-current text-white" />
                  <span>{metadata.duration ? 'Start Cloud-Speed Encoding' : 'Analyzing Video Stream...'}</span>
                </button>

                {errorMessage && (
                  <div className="mt-4 p-3.5 bg-rose-50 dark:bg-rose-950/70 border border-rose-200 dark:border-rose-800 rounded-xl flex items-start space-x-2.5 text-xs text-rose-800 dark:text-rose-300">
                    <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    <span>{errorMessage}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* State 3: Download Complete Result */}
        {result && (
          <div className="p-8 md:p-14 flex flex-col items-center justify-center text-center">
            {/* Victory Check badge */}
            <div 
              onClick={() => play('boing')}
              className="w-20 h-20 bg-emerald-100 dark:bg-emerald-950/80 rounded-full flex items-center justify-center mb-5 border-4 border-white dark:border-slate-700 shadow-xl shadow-emerald-500/20 kickable cursor-pointer"
            >
              <KickIcon icon={CheckCircle2} size={40} className="text-emerald-600 dark:text-emerald-400" />
            </div>

            <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2">
              Compression Complete!
            </h2>
            <p className="text-slate-600 dark:text-slate-300 mb-6 max-w-md text-sm font-medium">
              Your media has been freshly baked and optimized with hardware precision. Preview and download below.
            </p>

            {/* Playable Result Preview */}
            <div className="w-full max-w-lg mb-6 rounded-2xl overflow-hidden border-2 border-white dark:border-slate-700 shadow-lg bg-black">
              {result.isAudio ? (
                <div className="p-4 bg-sky-50 dark:bg-slate-900">
                  <audio src={result.url} controls className="w-full" />
                </div>
              ) : (
                <video src={result.url} controls className="w-full max-h-64 object-contain" />
              )}
            </div>
            
            {/* Savings Scorecard */}
            <div className="w-full max-w-lg bg-white/90 dark:bg-slate-900/90 border border-white dark:border-slate-800 rounded-2xl p-5 mb-5 shadow-sm text-left">
              <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-100 dark:border-slate-800 text-sm">
                <span className="text-slate-500 dark:text-slate-400">Original Size</span>
                <span className="font-bold text-slate-800 dark:text-slate-100">{formatSize(file!.size)}</span>
              </div>
              <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-100 dark:border-slate-800 text-sm">
                <span className="text-slate-500 dark:text-slate-400">Final Compressed Size</span>
                <span className="text-sky-600 dark:text-sky-400 font-black text-lg">{formatSize(result.size)}</span>
              </div>
              
              {calcReduction() > 0 && settings.mode !== 'audio' && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400 text-sm">Space Saved</span>
                  <span className="text-emerald-700 dark:text-emerald-300 font-black bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 px-3 py-1 rounded-full text-xs">
                    🎈 {calcReduction()}% Lighter!
                  </span>
                </div>
              )}
            </div>

            {targetMessage && (
              <div className="w-full max-w-lg bg-amber-50 dark:bg-amber-950/70 border border-amber-200 dark:border-amber-800 rounded-xl p-3.5 mb-6 text-left flex items-start space-x-2 text-xs text-amber-800 dark:text-amber-300">
                <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <span>{targetMessage}</span>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 mt-2 w-full max-w-md">
              <a 
                href={result.url} 
                download={result.name}
                onClick={() => play('success')}
                className="btn-sky-primary flex-1 py-3.5 px-6 rounded-2xl font-extrabold text-sm flex items-center justify-center space-x-2 shadow-lg kickable"
              >
                <KickIcon icon={Download} size={18} className="text-white" />
                <span>Download Optimized File</span>
              </a>
              <button 
                onClick={() => {
                  play('pop');
                  setFile(null);
                  setResult(null);
                  setVideoPreview(null);
                  setTargetMessage(null);
                }}
                className="bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 py-3.5 px-6 rounded-2xl font-bold text-sm transition-all kickable"
              >
                Process Another Video
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

// ==========================================
// PAGES & ROUTING
// ==========================================

const Home = () => {
  const { play } = useSound();

  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="pt-16 pb-16 px-4 text-center relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Playful Floating Badge */}
          <div 
            onClick={() => play('boing')}
            className="inline-flex items-center space-x-2 glass-sky-pill rounded-full px-4 py-1.5 mb-6 shadow-sm border border-white dark:border-slate-700 cursor-pointer kickable"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-black tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-sky-700 via-blue-700 to-indigo-700 dark:from-sky-300 dark:via-cyan-300 dark:to-indigo-300">
              ✨ 100% Client-Side • Zero Cloud Uploads • Open Sky Freedom
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tight mb-4 md:mb-6 leading-[1.14]">
            Compress Videos.<br />
            <span className="text-gradient-sky text-glow-sky dark:text-glow-night inline-block">
              Clear as an Open Sky.
            </span>
          </h1>

          <p className="text-base md:text-xl text-slate-700 dark:text-slate-300 mb-8 max-w-2xl mx-auto leading-relaxed font-medium">
            Breeze through Discord limits, WhatsApp chats, and email attachment restrictions. Squeeze video sizes by up to 80% without losing visual sharpness.
          </p>
        </div>

        {/* Video Tool Studio */}
        <VideoTool defaultMode="compress" />
      </section>

      {/* Playful Hardware Capabilities Ribbon */}
      <section className="py-8 relative z-10">
        <div className="max-w-5xl mx-auto px-4">
          <div className="glass-sky-pill py-3 px-6 rounded-2xl flex flex-wrap items-center justify-around gap-4 text-xs font-bold text-slate-700 dark:text-slate-200 border border-white/80 dark:border-slate-700">
            <div className="flex items-center gap-2">
              <Zap size={16} className="text-amber-500" />
              <span>GPU Acceleration: Active</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-emerald-600 dark:text-emerald-400" />
              <span>Zero Server Transmission</span>
            </div>
            <div className="flex items-center gap-2">
              <Award size={16} className="text-indigo-600 dark:text-indigo-400" />
              <span>Studio 60 FPS Engine</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-sky-500 dark:text-sky-400" />
              <span>No Watermarks Ever</span>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Tools Section */}
      <section className="py-20 relative z-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-3">
              All-in-One <span className="text-gradient-sky">Media Suite</span>
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 font-medium">Explore instant local tools built with native browser WebCodecs</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: FileVideo, title: "Video Converter", desc: "Convert seamlessly between MP4, MKV, MOV, and WebM", link: "/video-converter", color: "from-sky-500 to-blue-600" },
              { icon: FileAudio, title: "Video to MP3", desc: "Extract pristine audio tracks and export studio WAV or MP3", link: "/video-to-mp3", color: "from-indigo-500 to-purple-600" },
              { icon: Cpu, title: "Codec Optimizer", desc: "Select high-efficiency VP9 or universal H.264 profiles", link: "/video-codec-converter", color: "from-amber-500 to-orange-600" },
              { icon: HardDrive, title: "Video Resizer", desc: "Downscale 4K / 1080p to 720p or 480p for instant sharing", link: "/video-resizer", color: "from-emerald-500 to-teal-600" }
            ].map((tool, i) => (
              <Link 
                to={tool.link} 
                key={i} 
                onClick={() => play('kick')}
                className="glass-sky p-6 rounded-3xl border border-white dark:border-slate-800 hover:border-sky-300 dark:hover:border-sky-500 transition-all kickable group flex flex-col justify-between"
              >
                <div>
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${tool.color} flex items-center justify-center text-white mb-5 shadow-md shadow-sky-500/20 group-hover:scale-110 transition-transform`}>
                    <tool.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mb-2">{tool.title}</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium mb-4">{tool.desc}</p>
                </div>
                <div className="text-xs font-bold text-sky-600 dark:text-sky-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  <span>Open Tool</span>
                  <ArrowRight size={13} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Before vs After Quality Visual Showcase */}
      <section className="py-20 relative z-10 bg-white/40 dark:bg-slate-900/40 border-y border-white/60 dark:border-slate-800/80">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-12">
            <span className="badge-sky text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider mb-3 inline-block">
              Visual Demonstration
            </span>
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-3">
              <span className="text-gradient-sun">Insane 70% Cut.</span> <span className="text-gradient-sky">Crisp 100% Quality.</span>
            </h2>
            <p className="text-slate-600 dark:text-slate-300 text-sm max-w-xl mx-auto font-medium">
              Our hardware engine intelligently trims redundant color data while keeping edges, faces, and text razor-sharp.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="glass-sky-strong p-6 rounded-3xl border-2 border-white dark:border-slate-700 shadow-lg text-left">
              <div className="flex justify-between items-center mb-4">
                <span className="font-extrabold text-slate-800 dark:text-slate-200 text-sm">Before (Raw Footage)</span>
                <span className="bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 text-xs font-extrabold px-2.5 py-0.5 rounded-full">120 MB</span>
              </div>
              <div className="aspect-video bg-gradient-to-br from-slate-800 to-slate-950 rounded-2xl flex flex-col items-center justify-center text-white p-4 relative overflow-hidden">
                <FileVideo size={48} className="text-slate-400 mb-2" />
                <span className="text-xs font-bold text-slate-300">4K UHD Raw Camera File</span>
                <span className="text-[11px] text-slate-500 mt-1">Too heavy for Discord / Email attachments</span>
              </div>
            </div>

            <div className="glass-sky-strong p-6 rounded-3xl border-2 border-sky-300 dark:border-sky-500 shadow-xl text-left relative">
              <div className="absolute -top-3 right-6 badge-sunny text-[10px] font-extrabold px-3 py-0.5 rounded-full shadow-sm">
                Optimized in 4 seconds
              </div>
              <div className="flex justify-between items-center mb-4">
                <span className="font-extrabold text-sky-800 dark:text-sky-300 text-sm">After (NovaCompress)</span>
                <span className="bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 text-xs font-extrabold px-2.5 py-0.5 rounded-full">24 MB (80% Saved)</span>
              </div>
              <div className="aspect-video bg-gradient-to-br from-sky-900 to-indigo-950 rounded-2xl flex flex-col items-center justify-center text-white p-4 relative overflow-hidden border border-sky-400/30">
                <CheckCircle2 size={48} className="text-emerald-400 mb-2" />
                <span className="text-xs font-bold text-white">Full HD 1080p Crystal Clear</span>
                <span className="text-[11px] text-sky-200 mt-1">Instant delivery everywhere with zero quality loss</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 relative z-10">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="glass-sky p-8 rounded-3xl border border-white dark:border-slate-800 shadow-md">
            <div 
              onClick={() => play('boing')}
              className="w-16 h-16 mx-auto bg-gradient-to-tr from-sky-400 to-blue-500 rounded-2xl flex items-center justify-center mb-6 text-white shadow-lg shadow-sky-500/20 kickable cursor-pointer"
            >
              <KickIcon icon={ShieldCheck} size={30} className="text-white" />
            </div>
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mb-3">Air-Tight Privacy</h3>
            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
              Your files never touch remote cloud servers. All encoding operations run securely inside your browser's private sandbox.
            </p>
          </div>

          <div className="glass-sky p-8 rounded-3xl border border-white dark:border-slate-800 shadow-md">
            <div 
              onClick={() => play('boing')}
              className="w-16 h-16 mx-auto bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 text-white shadow-lg shadow-indigo-500/20 kickable cursor-pointer"
            >
              <KickIcon icon={Sliders} size={30} className="text-white" />
            </div>
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mb-3">Strict Target Precision</h3>
            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
              Target exact file sizes like 8MB or 25MB. The internal calculus calculates bitrates to hit limits without guesswork.
            </p>
          </div>

          <div className="glass-sky p-8 rounded-3xl border border-white dark:border-slate-800 shadow-md">
            <div 
              onClick={() => play('boing')}
              className="w-16 h-16 mx-auto bg-gradient-to-tr from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center mb-6 text-white shadow-lg shadow-emerald-500/20 kickable cursor-pointer"
            >
              <KickIcon icon={Scissors} size={30} className="text-white" />
            </div>
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mb-3">Zero Watermarks</h3>
            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
              Export pristine, watermark-free videos with complete freedom. No forced accounts, no fees, no subscriptions.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

// ==========================================
// SEO LANDING PAGE
// ==========================================

const SEOLandingPage = () => {
  const location = useLocation();
  const data = seoPages[location.pathname] || seoPages['/video-compressor'];
  
  let mode = 'compress';
  if (location.pathname.includes('mp3') || location.pathname.includes('audio')) {
    mode = 'audio';
  }

  return (
    <div className="pt-16 pb-16 px-4 relative z-10">
      <div className="max-w-4xl mx-auto text-center mb-12">
        <span className="badge-sky text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider mb-3 inline-block">
          Open Sky Video Studio
        </span>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight mb-4 leading-normal">
          <span className="night-gradient-heading inline-block pb-3 pt-1">
            {data.h1}
          </span>
        </h1>
        <p className="text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed font-medium">{data.description}</p>
      </div>

      <VideoTool defaultMode={mode} />

      <div className="max-w-3xl mx-auto mt-20 glass-sky p-8 md:p-12 rounded-3xl border border-white dark:border-slate-800 shadow-lg text-left">
        <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4">About this tool</h2>
        <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-8 font-medium">{data.content}</p>
        
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">How to use this tool</h3>
        <ol className="text-slate-600 dark:text-slate-300 space-y-3 list-decimal pl-5 text-sm font-medium">
          <li>Select or drop your video file into the open sky dropzone above.</li>
          <li>Choose your target file size (e.g. 8 MB for Discord) or desired format.</li>
          <li>Click 'Start Cloud-Speed Encoding'. Processing runs instantly on your device hardware.</li>
          <li>Download your freshly compressed, watermark-free file!</li>
        </ol>
      </div>
    </div>
  );
};

// ==========================================
// BLOG LIST PAGE
// ==========================================

const BlogList = () => {
  const { play } = useSound();

  return (
    <div className="max-w-7xl mx-auto px-4 py-16 relative z-10">
      <div className="text-center mb-14">
        <span className="badge-sky text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider mb-3 inline-block">
          Open Sky Academy
        </span>
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-3">Video Processing Guides</h1>
        <p className="text-slate-600 dark:text-slate-300 text-sm max-w-md mx-auto font-medium">Master bitrates, modern codecs, and compression techniques.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          "How to Compress Video for Discord (8MB Limit)",
          "H.264 vs VP9: Which Video Codec Wins in 2026?",
          "How to Reduce MP4 File Size for Email Attachments",
          "How to Extract Crisp MP3 Audio from Video in Browser",
          "Understanding Bitrate, CRF, and Target File Sizes",
          "Video Container vs Codec: What Is the Difference?"
        ].map((title, i) => (
          <div 
            key={i} 
            onClick={() => play('kick')}
            className="glass-sky rounded-3xl overflow-hidden border border-white dark:border-slate-800 shadow-md hover:border-sky-300 dark:hover:border-sky-500 transition-all cursor-pointer group kickable flex flex-col justify-between"
          >
            <div className="h-44 bg-gradient-to-tr from-sky-400 via-blue-500 to-indigo-600 flex items-center justify-center relative overflow-hidden">
              <Video className="w-12 h-12 text-white/80 group-hover:scale-125 transition-transform" />
            </div>
            <div className="p-6">
              <div className="text-[11px] font-extrabold text-sky-700 dark:text-sky-400 tracking-wider uppercase mb-2">TUTORIAL</div>
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mb-2 leading-snug group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">{title}</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">Explore best practices to compress, transcode, and share multimedia without losing quality.</p>
            </div>
            <div className="px-6 pb-6 pt-0">
              <span className="text-xs font-bold text-sky-600 dark:text-sky-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                Read Guide <ArrowRight size={13} />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ==========================================
// STATIC & FAQ PAGES
// ==========================================

const StaticPage = ({ title, children }: { title: string, children: React.ReactNode }) => (
  <div className="max-w-3xl mx-auto px-4 py-16 relative z-10">
    <div className="glass-sky p-8 md:p-12 rounded-3xl border border-white dark:border-slate-800 shadow-lg text-slate-700 dark:text-slate-200 text-sm leading-relaxed font-medium">
      <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-6">{title}</h1>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  </div>
);

const FAQPage = () => {
  const { play } = useSound();

  return (
    <div className="max-w-3xl mx-auto px-4 py-16 relative z-10">
      <div className="text-center mb-12">
        <span className="badge-sky text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider mb-3 inline-block">
          Support & Clarity
        </span>
        <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-3">Frequently Asked Questions</h1>
        <p className="text-slate-600 dark:text-slate-300 text-sm font-medium">Everything you need to know about our open sky media engine</p>
      </div>

      <div className="space-y-4">
        {[
          { q: "Is NovaCompress really free?", a: "Yes, 100% free! There are zero paywalls, zero watermarks, and no sign-up or credit card required." },
          { q: "Are my private videos uploaded to any server?", a: "Never! All encoding takes place locally inside your browser via hardware-accelerated WebAssembly and WebCodecs. Your files never leave your computer." },
          { q: "How can I fit a video under 8MB for Discord?", a: "Simply upload your video, click the '8 MB (Discord)' preset button, and hit Start Encoding. The engine will calculate the exact bitrate to match the limit." },
          { q: "Can I extract audio into an MP3 or WAV?", a: "Yes! Switch the mode pill to 'Audio Extractor', choose your format (WAV or MP3), and download the extracted audio stream." },
          { q: "Why is open sky encoding so fast?", a: "Because files are not uploaded or downloaded through the internet! The processing uses your device's native GPU/CPU codecs directly." }
        ].map((faq, i) => (
          <details 
            key={i} 
            onClick={() => play('pop')}
            className="group glass-sky border border-white dark:border-slate-800 rounded-2xl overflow-hidden transition-all shadow-sm"
          >
            <summary className="flex justify-between items-center font-bold cursor-pointer list-none p-5 text-slate-800 dark:text-slate-100 text-sm">
              <span>{faq.q}</span>
              <span className="transition-transform group-open:rotate-180 text-sky-600 dark:text-sky-400">
                <ChevronDown className="w-5 h-5" />
              </span>
            </summary>
            <div className="text-slate-600 dark:text-slate-300 text-xs px-5 pb-5 pt-0 leading-relaxed font-medium">
              {faq.a}
            </div>
          </details>
        ))}
      </div>
    </div>
  );
};

// ==========================================
// MAIN APP COMPONENT
// ==========================================

export default function App() {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('novacompress_theme');
      if (saved === 'night' || saved === 'day') return saved;
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'night';
      }
    }
    return 'day';
  });

  const toggleSound = () => {
    setSoundEnabled(!soundEnabled);
  };

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === 'day' ? 'night' : 'day';
      if (typeof window !== 'undefined') {
        localStorage.setItem('novacompress_theme', next);
      }
      return next;
    });
  };

  useEffect(() => {
    const isNight = theme === 'night';
    if (isNight) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }
  }, [theme]);

  const play = (type: 'kick' | 'pop' | 'success' | 'whoosh' | 'boing') => {
    playSoundEffect(type, soundEnabled);
  };

  // Global click kick effect on any clicked icon or button (Asynchronously dispatched to avoid mobile reflows)
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target) return;
      const kickEl = target.closest('.kickable, button, a, [data-kick], svg, .icon-kick-target') as HTMLElement;
      if (kickEl) {
        const svgEl = (kickEl.tagName.toLowerCase() === 'svg' ? kickEl : kickEl.querySelector('svg')) as HTMLElement;
        if (svgEl) {
          svgEl.classList.remove('kicking');
          requestAnimationFrame(() => {
            svgEl.classList.add('kicking');
            setTimeout(() => svgEl.classList.remove('kicking'), 550);
          });
        } else {
          kickEl.classList.remove('kick-bounce-active');
          requestAnimationFrame(() => {
            kickEl.classList.add('kick-bounce-active');
            setTimeout(() => kickEl.classList.remove('kick-bounce-active'), 500);
          });
        }
      }
    };

    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDark: theme === 'night' }}>
      <SoundContext.Provider value={{ soundEnabled, toggleSound, play }}>
        <Router>
          <div className="min-h-screen relative font-sans selection:bg-sky-400 selection:text-white transition-colors duration-500">
            {/* Open Sky Atmosphere with Animated Clouds, Sun/Moon Theme Changer, and Balloon */}
            <OpenSkyAtmosphere />

            {/* Interactive Nimbus Cloud Mascot */}
            <NimbusMascot />

            {/* Navigation Bar */}
            <Header />
            
            <main className="relative z-10 pb-12">
              <Routes>
                <Route path="/" element={<Home />} />
                
                {/* SEO Tool Pages */}
                <Route path="/video-compressor" element={<SEOLandingPage />} />
                <Route path="/video-converter" element={<SEOLandingPage />} />
                <Route path="/video-to-mp3" element={<SEOLandingPage />} />
                <Route path="/video-to-audio" element={<SEOLandingPage />} />
                <Route path="/compress-mp4" element={<SEOLandingPage />} />
                <Route path="/mp4-converter" element={<SEOLandingPage />} />
                <Route path="/video-codec-converter" element={<SEOLandingPage />} />
                <Route path="/video-to-mkv" element={<SEOLandingPage />} />
                <Route path="/video-to-mov" element={<SEOLandingPage />} />
                <Route path="/h264-video-converter" element={<SEOLandingPage />} />
                <Route path="/h265-video-converter" element={<SEOLandingPage />} />
                <Route path="/video-resizer" element={<SEOLandingPage />} />
                <Route path="/video-bitrate-calculator" element={<SEOLandingPage />} />
                
                {/* Content Pages */}
                <Route path="/blog" element={<BlogList />} />
                <Route path="/faq" element={<FAQPage />} />
                <Route path="/contact" element={
                  <StaticPage title="Contact Support">
                    <p>Have a question, feedback, or a feature suggestion? We'd love to hear from you!</p>
                    <div className="mt-6 bg-white/80 dark:bg-slate-800/80 border border-white dark:border-slate-700 p-6 rounded-2xl shadow-sm">
                      <p className="font-bold text-slate-800 dark:text-slate-100">Direct Email Support:</p>
                      <p className="text-sky-600 dark:text-sky-400 font-black mt-1">support@novacompress.example.com</p>
                    </div>
                  </StaticPage>
                } />
                <Route path="/terms" element={
                  <StaticPage title="Terms of Service">
                    <p><strong>Last Updated: November 2026</strong></p>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-4">1. Acceptance of Terms</h2>
                    <p>By using NovaCompress, you agree to these terms. The service is provided "as is" without warranties of any kind.</p>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-4">2. Local Browser Processing</h2>
                    <p>All video encoding and audio extraction occurs exclusively within your local browser sandbox. You retain full legal ownership and responsibility for media files processed on your machine.</p>
                  </StaticPage>
                } />
                <Route path="/about" element={
                  <StaticPage title="About NovaCompress">
                    <p>NovaCompress was built to give creators a liberating, fast, and 100% private video studio right in the web browser.</p>
                    <p className="mt-3">Using modern WebAssembly and native WebCodecs hardware pipelines, we process large 4K and 1080p clips locally without ever sending a single byte across external servers.</p>
                  </StaticPage>
                } />
                <Route path="/privacy-policy" element={
                  <StaticPage title="Zero-Knowledge Privacy Policy">
                    <p><strong>Last Updated: November 2026</strong></p>
                    <p>Your privacy is absolute. NovaCompress operates with zero server uploads. No video frames, audio tracks, or file metadata are ever transmitted or stored on remote servers.</p>
                  </StaticPage>
                } />
                
                {/* Fallback */}
                <Route path="*" element={<Home />} />
              </Routes>
            </main>

            {/* Footer */}
            <Footer />
          </div>
        </Router>
      </SoundContext.Provider>
    </ThemeContext.Provider>
  );
}
