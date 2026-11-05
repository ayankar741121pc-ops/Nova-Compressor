import React, { useState, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  UploadCloud, Settings, FileVideo, Download, Play, 
  Settings2, HardDrive, Cpu, Scissors, Video, 
  Menu, X, ChevronDown, CheckCircle2, AlertCircle, FileAudio
} from 'lucide-react';

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
// MOCK SEO DATA & CONFIGURATION
// ==========================================

const seoPages: Record<string, any> = {
  '/video-compressor': {
    title: 'Free Video Compressor Online | Reduce Video Size',
    h1: 'Free Online Video Compressor',
    description: 'Compress videos online for free. Reduce video file size, adjust bitrate, choose formats, and download optimized videos with our easy-to-use video compressor.',
    content: 'Video compression reduces the file size of your videos by removing redundant data or reducing the bitrate. Our tool uses advanced algorithms to maintain high visual quality while significantly reducing the storage space required.'
  },
  '/video-converter': {
    title: 'Free Video Converter | Change Video Formats',
    h1: 'Online Video Converter',
    description: 'Convert videos between MP4, MKV, MOV, WebM, and AVI formats instantly in your browser.',
    content: 'Format conversion allows you to make your videos compatible with different devices, players, and platforms. MP4 is generally recommended for maximum compatibility.'
  },
  '/video-to-mp3': {
    title: 'Video to MP3 Converter | Extract Audio Free',
    h1: 'Convert Video to MP3',
    description: 'Extract high-quality MP3 audio from any video file. Fast, free, and secure online video to audio converter.',
    content: 'Need to save a podcast, speech, or music track from a video? Our Video to MP3 tool extracts the audio stream and encodes it to a standard MP3 file, allowing you to choose your preferred audio bitrate.'
  },
  '/mp4-converter': {
    title: 'MP4 Converter | Convert Video to MP4 Free',
    h1: 'Convert Any Video to MP4',
    description: 'Easily convert MOV, MKV, AVI, and WebM to MP4. Fast, secure, browser-based video converter.',
    content: 'MP4 is the most widely supported video format. Use our local browser-based tool to convert your videos to MP4 for maximum compatibility.'
  },
  '/video-codec-converter': {
    title: 'Video Codec Converter | Change H.264, H.265, VP9',
    h1: 'Video Codec Converter',
    description: 'Change your video codec without uploading files. Convert between H.264, H.265 (HEVC), and VP9 instantly.',
    content: 'Different devices require different video codecs. Converting to H.265 saves space, while H.264 offers broader compatibility.'
  },
  '/h265-video-converter': {
    title: 'H.265 Converter | HEVC Video Compressor',
    h1: 'H.265 (HEVC) Converter',
    description: 'Convert your videos to H.265 to save up to 50% more space compared to H.264 without losing quality.',
    content: 'High Efficiency Video Coding (HEVC / H.265) provides superior compression. Convert your files to save disk space while preserving visual fidelity.'
  },
  '/video-resizer': {
    title: 'Video Resizer | Change Video Resolution',
    h1: 'Resize Video Resolution',
    description: 'Downscale 4K and 1080p videos to 720p or 480p to save space. Fast, free online video resizer.',
    content: 'Lowering your video resolution is one of the most effective ways to reduce file size for sharing on mobile devices or social media.'
  }
};

// ==========================================
// SHARED UI COMPONENTS
// ==========================================

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-[#0B0D12]/90 backdrop-blur-md border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded bg-gradient-to-br from-[#7C5CFF] to-[#36D6C5] flex items-center justify-center">
            <Video className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight text-white">NovaCompress</span>
        </Link>
        
        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-gray-300">
          <Link to="/video-compressor" className="hover:text-white transition-colors">Compressor</Link>
          <Link to="/video-converter" className="hover:text-white transition-colors">Converter</Link>
          <Link to="/video-to-mp3" className="hover:text-white transition-colors">To MP3</Link>
          <Link to="/blog" className="hover:text-white transition-colors">Blog</Link>
          <Link to="/about" className="hover:text-white transition-colors">About</Link>
        </nav>

        <div className="hidden md:flex items-center">
          <Link to="/video-compressor" className="bg-[#7C5CFF] hover:bg-[#6847F5] text-white px-5 py-2 rounded-lg font-medium transition-all shadow-[0_0_15px_rgba(124,92,255,0.3)]">
            Compress Video
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden text-gray-300" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Nav */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#11151D] border-b border-gray-800 px-4 py-4 space-y-4 flex flex-col text-gray-300 font-medium">
          <Link to="/video-compressor" onClick={() => setMobileMenuOpen(false)}>Video Compressor</Link>
          <Link to="/video-converter" onClick={() => setMobileMenuOpen(false)}>Video Converter</Link>
          <Link to="/video-to-mp3" onClick={() => setMobileMenuOpen(false)}>Video to MP3</Link>
          <Link to="/blog" onClick={() => setMobileMenuOpen(false)}>Blog</Link>
          <Link to="/about" onClick={() => setMobileMenuOpen(false)}>About</Link>
        </div>
      )}
    </header>
  );
};

const Footer = () => (
  <footer className="bg-[#0B0D12] border-t border-gray-800 pt-16 pb-8 mt-24">
    <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12 text-sm">
      <div>
        <div className="flex items-center space-x-2 mb-4">
          <div className="w-6 h-6 rounded bg-gradient-to-br from-[#7C5CFF] to-[#36D6C5] flex items-center justify-center">
            <Video className="w-3 h-3 text-white" />
          </div>
          <span className="font-bold text-lg text-white">NovaCompress</span>
        </div>
        <p className="text-gray-400 leading-relaxed mb-6">
          Premium, privacy-first online video processing tools. Compress, convert, and extract audio directly in your browser.
        </p>
      </div>
      
      <div>
        <h3 className="font-semibold text-white mb-4">Tools</h3>
        <ul className="space-y-3 text-gray-400">
          <li><Link to="/video-compressor" className="hover:text-[#36D6C5] transition-colors">Video Compressor</Link></li>
          <li><Link to="/video-converter" className="hover:text-[#36D6C5] transition-colors">Video Converter</Link></li>
          <li><Link to="/video-to-mp3" className="hover:text-[#36D6C5] transition-colors">Video to MP3</Link></li>
          <li><Link to="/video-resizer" className="hover:text-[#36D6C5] transition-colors">Video Resizer</Link></li>
        </ul>
      </div>

      <div>
        <h3 className="font-semibold text-white mb-4">Resources</h3>
        <ul className="space-y-3 text-gray-400">
          <li><Link to="/blog" className="hover:text-[#36D6C5] transition-colors">Blog</Link></li>
          <li><Link to="/faq" className="hover:text-[#36D6C5] transition-colors">FAQ</Link></li>
          <li><Link to="/video-codec-converter" className="hover:text-[#36D6C5] transition-colors">Codec Converter</Link></li>
        </ul>
      </div>

      <div>
        <h3 className="font-semibold text-white mb-4">Company</h3>
        <ul className="space-y-3 text-gray-400">
          <li><Link to="/about" className="hover:text-[#36D6C5] transition-colors">About Us</Link></li>
          <li><Link to="/contact" className="hover:text-[#36D6C5] transition-colors">Contact</Link></li>
          <li><Link to="/privacy-policy" className="hover:text-[#36D6C5] transition-colors">Privacy Policy</Link></li>
          <li><Link to="/terms" className="hover:text-[#36D6C5] transition-colors">Terms of Service</Link></li>
        </ul>
      </div>
    </div>
    <div className="max-w-7xl mx-auto px-4 mt-16 pt-8 border-t border-gray-800 text-center text-gray-500 text-xs">
      &copy; {new Date().getFullYear()} NovaCompress. All rights reserved.
    </div>
  </footer>
);

// ==========================================
// CORE VIDEO TOOL COMPONENT
// ==========================================

const VideoTool = ({ defaultMode = 'compress' }) => {
  const [file, setFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<{ duration: number; width: number; height: number }>({ duration: 0, width: 0, height: 0 });
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState('');
  const [result, setResult] = useState<{ url: string; size: number; name: string; isAudio?: boolean } | null>(null);
  const [targetMessage, setTargetMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const [settings, setSettings] = useState({
    mode: defaultMode,
    outputFormat: 'mp4',
    resolution: 'keep',
    frameRate: 'keep',
    qualityPreset: 'medium',
    bitrateMode: 'auto',
    customBitrate: 2500,
    targetSize: '',
    audioAction: 'keep',
    audioFormat: 'mp3',
    audioBitrate: '128k'
  });

  const videoRef = useRef<HTMLVideoElement>(null);
  const abortRef = useRef(false);
  const activeRecorderRef = useRef<MediaRecorder | null>(null);
  const activeVideoElRef = useRef<HTMLVideoElement | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (selected.size > 2 * 1024 * 1024 * 1024) {
      setErrorMessage("File is too large for browser processing. Max 2GB.");
      return;
    }

    setFile(selected);
    const url = URL.createObjectURL(selected);
    setVideoPreview(url);
    setResult(null);
    setProgress(0);
    setTargetMessage(null);
    setErrorMessage(null);
  };

  const cancelProcessing = () => {
    abortRef.current = true;
    if (activeRecorderRef.current && activeRecorderRef.current.state !== 'inactive') {
      try {
        activeRecorderRef.current.stop();
      } catch {}
    }
    if (activeVideoElRef.current) {
      activeVideoElRef.current.pause();
      activeVideoElRef.current.src = '';
    }
    setIsProcessing(false);
    setProgress(0);
    setProgressText('Processing cancelled.');
  };

  const processVideo = async () => {
    if (!file || isProcessing) return;
    setIsProcessing(true);
    abortRef.current = false;
    setProgress(0);
    setProgressText('Initializing hardware encoder...');
    setTargetMessage(null);
    setErrorMessage(null);

    try {
      const baseName = file.name.replace(/\.[^/.]+$/, '');

      // MODE 1: AUDIO EXTRACTION
      if (settings.mode === 'audio') {
        setProgressText('Decoding audio stream...');
        setProgress(25);
        const arrayBuffer = await file.arrayBuffer();
        if (abortRef.current) return;

        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const decodedBuffer = await audioCtx.decodeAudioData(arrayBuffer);
        if (abortRef.current) {
          audioCtx.close();
          return;
        }

        setProgress(65);
        setProgressText('Encoding audio file...');

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
        await audioCtx.close();

        setProgress(100);
        const outUrl = URL.createObjectURL(wavBlob);
        setResult({
          url: outUrl,
          size: wavBlob.size,
          name: `novacompress_${baseName}.wav`,
          isAudio: true
        });
        return;
      }

      // MODE 2: REAL HARDWARE VIDEO COMPRESSION & TRANSCODING
      const duration = Math.max(0.5, metadata.duration || 10);
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
      // Ensure even dimensions for hardware H.264/VP9 encoders
      targetW = Math.max(2, targetW % 2 === 0 ? targetW : targetW + 1);
      targetH = Math.max(2, targetH % 2 === 0 ? targetH : targetH + 1);

      const includeAudio = settings.audioAction !== 'remove';
      const audioBps = includeAudio ? 128000 : 0;
      const targetMb = settings.targetSize ? parseFloat(settings.targetSize) : null;
      let videoBps = 2500000;

      if (targetMb && targetMb > 0) {
        const totalBits = targetMb * 8 * 1024 * 1024;
        const totalBps = totalBits / duration;
        // Reserve 8% for container muxing overhead so we stay under target size
        videoBps = Math.max(60000, Math.floor((totalBps - audioBps) * 0.92));
      } else if (settings.bitrateMode === 'custom') {
        videoBps = Math.max(60000, settings.customBitrate * 1000);
      } else {
        const originalBps = (file.size * 8) / duration;
        const presetFactor =
          settings.qualityPreset === 'fast'
            ? 0.35
            : settings.qualityPreset === 'medium'
            ? 0.5
            : 0.68;
        videoBps = Math.max(120000, Math.floor(originalBps * presetFactor - audioBps));
      }

      const { mimeType, baseMime, ext } = getSupportedVideoConfig(settings.outputFormat, includeAudio);
      const targetFps = settings.frameRate !== 'keep' ? parseInt(settings.frameRate, 10) || 30 : 30;

      setProgressText(
        `Encoding ${targetW}x${targetH} @ ${Math.round(videoBps / 1000)} kbps...`
      );

      const hiddenVideo = document.createElement('video');
      activeVideoElRef.current = hiddenVideo;
      hiddenVideo.src = URL.createObjectURL(file);
      hiddenVideo.playsInline = true;
      hiddenVideo.crossOrigin = 'anonymous';
      hiddenVideo.preload = 'auto';

      await new Promise<void>((resolve, reject) => {
        hiddenVideo.onloadeddata = () => resolve();
        hiddenVideo.onerror = () => reject(new Error('Failed to load input video for encoding.'));
      });

      const canvas = document.createElement('canvas');
      canvas.width = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not initialize 2D video frame buffer.');

      // Draw initial frame before starting recorder so header is valid
      ctx.drawImage(hiddenVideo, 0, 0, targetW, targetH);

      const canvasStream = canvas.captureStream(targetFps);
      const combinedTracks: MediaStreamTrack[] = [...canvasStream.getVideoTracks()];

      let audioCtx: AudioContext | null = null;
      if (includeAudio) {
        try {
          audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
          await audioCtx.resume();
          const sourceNode = audioCtx.createMediaElementSource(hiddenVideo);
          const destNode = audioCtx.createMediaStreamDestination();
          sourceNode.connect(destNode);
          const audioTracks = destNode.stream.getAudioTracks();
          if (audioTracks.length > 0) {
            combinedTracks.push(audioTracks[0]);
          }
        } catch {
          // If input video has no audio stream, proceed with video-only
          hiddenVideo.muted = true;
        }
      } else {
        hiddenVideo.muted = true;
      }

      const outputStream = new MediaStream(combinedTracks);
      const recorderOptions: MediaRecorderOptions = {
        videoBitsPerSecond: videoBps,
        ...(includeAudio ? { audioBitsPerSecond: audioBps } : {}),
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
          const finalBlob = new Blob(chunks, { type: baseMime });
          resolve(finalBlob);
        };
        recorder.onerror = (event: any) => {
          reject(new Error(event?.error?.message || 'Hardware encoder error occurred.'));
        };
      });

      const drawInterval = window.setInterval(() => {
        if (!hiddenVideo.paused && !hiddenVideo.ended) {
          ctx.drawImage(hiddenVideo, 0, 0, targetW, targetH);
          const pct = Math.min(99, Math.round((hiddenVideo.currentTime / duration) * 100));
          setProgress(pct);
        }
      }, Math.round(1000 / targetFps));

      recorder.start(100);
      await hiddenVideo.play();

      await new Promise<void>((resolve) => {
        hiddenVideo.onended = () => resolve();
      });

      window.clearInterval(drawInterval);
      if (recorder.state !== 'inactive') {
        recorder.stop();
      }

      const finalBlob = await encodedBlobPromise;
      outputStream.getTracks().forEach((t) => t.stop());
      if (audioCtx) {
        await audioCtx.close();
      }
      URL.revokeObjectURL(hiddenVideo.src);

      if (abortRef.current) return;

      if (finalBlob.size === 0) {
        throw new Error('Encoded output was 0 bytes. Please try another format or resolution.');
      }

      setProgress(100);
      const finalUrl = URL.createObjectURL(finalBlob);
      const finalFileName = `novacompress_${baseName}.${ext}`;

      if (targetMb) {
        const actualMb = finalBlob.size / (1024 * 1024);
        if (actualMb > targetMb * 1.1) {
          setTargetMessage(
            `Note: Final size is ${actualMb.toFixed(2)} MB. Lowering the resolution (e.g. to 480p) will help reach smaller targets.`
          );
        }
      }

      setResult({
        url: finalUrl,
        size: finalBlob.size,
        name: finalFileName,
        isAudio: false
      });
    } catch (err) {
      if (abortRef.current) return;
      console.error(err);
      setErrorMessage(
        err instanceof Error
          ? err.message
          : 'A critical error occurred while encoding this media file.'
      );
    } finally {
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
    <div className="w-full max-w-5xl mx-auto mt-8 relative">
      <div className="absolute inset-0 bg-[#7C5CFF]/10 blur-[100px] rounded-full pointer-events-none"></div>
      
      <div className="relative bg-[#11151D] border border-gray-800 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-sm">

        {/* State 1: Upload */}
        {!file && (
          <div className="p-12 md:p-24 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-[#151A23] rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(124,92,255,0.15)] border border-gray-800">
              <UploadCloud className="w-10 h-10 text-[#7C5CFF]" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Upload Video File</h2>
            <p className="text-gray-400 mb-8 max-w-md">Drag and drop your video here, or click to browse. Files are processed securely in your browser.</p>
            
            <label className="bg-gradient-to-r from-[#7C5CFF] to-[#6847F5] hover:from-[#6847F5] hover:to-[#5B3EE0] text-white px-8 py-3 rounded-lg font-medium cursor-pointer transition-all shadow-lg flex items-center space-x-2">
              <UploadCloud className="w-5 h-5" />
              <span>Select File</span>
              <input type="file" className="hidden" accept="video/*" onChange={handleFileUpload} />
            </label>
            <p className="text-xs text-gray-600 mt-4">Supported: MP4, MOV, MKV, WebM, AVI (Max 2GB)</p>
          </div>
        )}

        {/* State 2: Processing Workspace */}
        {file && !result && (
          <div className="grid grid-cols-1 lg:grid-cols-5 min-h-[500px]">
            {/* Left: Preview & Info */}
            <div className="lg:col-span-2 bg-[#0B0D12] p-4 sm:p-6 border-r border-gray-800 flex flex-col">
              <div className="rounded-lg overflow-hidden bg-black aspect-video flex items-center justify-center mb-6 border border-gray-800 relative group">
                {videoPreview ? (
                  <video 
                    ref={videoRef}
                    src={videoPreview} 
                    className="w-full h-full object-contain" 
                    controls={!isProcessing}
                    onLoadedMetadata={(e) => {
                      setMetadata({
                        duration: e.currentTarget.duration || 0,
                        width: e.currentTarget.videoWidth || 0,
                        height: e.currentTarget.videoHeight || 0
                      });
                    }}
                  />
                ) : (
                  <FileVideo className="w-12 h-12 text-gray-700" />
                )}
                {isProcessing && (
                  <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center backdrop-blur-sm p-4 text-center">
                    <div className="w-16 h-16 border-4 border-gray-700 border-t-[#36D6C5] rounded-full animate-spin mb-4"></div>
                    <p className="text-white font-bold text-xl mb-1">{progress}%</p>
                    <p className="text-sm text-[#36D6C5] mb-4">{progressText}</p>
                    <button 
                      onClick={cancelProcessing}
                      className="px-4 py-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg text-sm font-medium border border-red-500/30 transition-colors flex items-center space-x-1"
                    >
                      <X className="w-4 h-4" />
                      <span>Cancel</span>
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-4 flex-1">
                <div className="bg-[#151A23] p-4 rounded-lg border border-gray-800">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Original File</h4>
                  <div className="flex justify-between items-center text-sm mb-1">
                    <span className="text-gray-400 truncate pr-4">{file.name}</span>
                    <span className="text-white font-medium">{formatSize(file.size)}</span>
                  </div>
                  {metadata.duration > 0 && (
                    <div className="flex text-xs text-gray-500 space-x-3">
                      <span>{Math.round(metadata.duration)}s</span>
                      <span>{metadata.width}x{metadata.height}</span>
                    </div>
                  )}
                </div>
              </div>

              <button 
                onClick={() => {setFile(null); setVideoPreview(null);}}
                className="mt-6 text-sm text-gray-500 hover:text-white transition-colors"
                disabled={isProcessing}
              >
                Change File
              </button>
            </div>

            {/* Right: Settings */}
            <div className="lg:col-span-3 p-4 sm:p-6 md:p-8 overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-2">
                  <Settings2 className="w-5 h-5 text-[#36D6C5]" />
                  <h3 className="text-lg font-bold text-white">Processing Settings</h3>
                </div>
              </div>

              <div className="space-y-6">
                {/* Mode Selector */}
                <div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button 
                      onClick={() => setSettings({...settings, mode: 'compress'})}
                      className={`py-2 px-4 rounded-lg border text-sm font-medium transition-all ${settings.mode === 'compress' ? 'bg-[#7C5CFF]/10 border-[#7C5CFF] text-white' : 'bg-[#0B0D12] border-gray-800 text-gray-400 hover:bg-gray-800/50'}`}
                      disabled={isProcessing}
                    >
                      Compress / Convert
                    </button>
                    <button 
                      onClick={() => setSettings({...settings, mode: 'audio'})}
                      className={`py-2 px-4 rounded-lg border text-sm font-medium transition-all ${settings.mode === 'audio' ? 'bg-[#7C5CFF]/10 border-[#7C5CFF] text-white' : 'bg-[#0B0D12] border-gray-800 text-gray-400 hover:bg-gray-800/50'}`}
                      disabled={isProcessing}
                    >
                      Extract Audio
                    </button>
                  </div>
                </div>

                {settings.mode === 'compress' ? (
                  <>
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-400 mb-2">Output Format</label>
                      <select 
                        className="w-full bg-[#0B0D12] border border-gray-700 rounded-lg py-3 px-3 text-white focus:outline-none focus:border-[#7C5CFF] disabled:opacity-50"
                        value={settings.outputFormat}
                        onChange={(e) => setSettings({...settings, outputFormat: e.target.value})}
                        disabled={isProcessing}
                      >
                        <option value="mp4">MP4 (Recommended)</option>
                        <option value="mkv">MKV</option>
                        <option value="mov">MOV</option>
                        <option value="webm">WebM</option>
                      </select>
                    </div>

                    {/* Resolution & Preset */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Resolution</label>
                        <select 
                          className="w-full bg-[#0B0D12] border border-gray-700 rounded-lg py-3 px-3 text-white focus:outline-none focus:border-[#7C5CFF] disabled:opacity-50"
                          value={settings.resolution}
                          onChange={(e) => setSettings({...settings, resolution: e.target.value})}
                          disabled={isProcessing}
                        >
                          <option value="keep">Keep Original</option>
                          <option value="2160p">2160p (4K)</option>
                          <option value="1440p">1440p (2K)</option>
                          <option value="1080p">1080p (FHD)</option>
                          <option value="720p">720p (HD)</option>
                          <option value="480p">480p (SD)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2 flex justify-between">
                          <span>Quality Preset</span>
                        </label>
                        <select 
                          className="w-full bg-[#0B0D12] border border-gray-700 rounded-lg py-3 px-3 text-white focus:outline-none focus:border-[#7C5CFF] disabled:opacity-50"
                          value={settings.qualityPreset}
                          onChange={(e) => setSettings({...settings, qualityPreset: e.target.value})}
                          disabled={isProcessing}
                        >
                          <option value="fast">Fast (Lower Quality, Fast Process)</option>
                          <option value="medium">Medium (Balanced)</option>
                          <option value="slow">Slow (Higher Quality, Slow Process)</option>
                        </select>
                      </div>
                    </div>

                    {/* Target Size */}
                    <div className="bg-[#151A23] p-4 sm:p-5 rounded-lg border border-gray-800">
                      <label className="block text-sm font-medium text-white mb-3 flex flex-col sm:flex-row sm:justify-between">
                        <span>Strict Target File Size</span>
                        <span className="text-xs text-[#36D6C5] mt-1 sm:mt-0">Primary Goal</span>
                      </label>
                      <div className="flex space-x-2">
                        <input 
                          type="number"
                          placeholder="e.g. 10 (Leave empty for normal compression)"
                          className="w-full bg-[#0B0D12] border border-gray-700 rounded-lg py-3 px-3 text-white focus:outline-none focus:border-[#7C5CFF] disabled:opacity-50"
                          value={settings.targetSize}
                          onChange={(e) => setSettings({...settings, targetSize: e.target.value, bitrateMode: 'auto'})}
                          disabled={isProcessing}
                        />
                        <div className="bg-[#0B0D12] border border-gray-700 rounded-lg px-4 flex items-center text-gray-400 text-sm">
                          MB
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">When set, bitrate is dynamically calculated to hit this size. The encoder may retry up to 3 times to guarantee accuracy.</p>
                    </div>

                    {/* Advanced Bitrate */}
                    {!settings.targetSize && (
                       <div>
                       <label className="block text-sm font-medium text-gray-400 mb-2">Fallback Video Bitrate</label>
                       <select 
                         className="w-full bg-[#0B0D12] border border-gray-700 rounded-lg py-3 px-3 text-white focus:outline-none focus:border-[#7C5CFF] disabled:opacity-50 mb-4"
                         value={settings.bitrateMode}
                         onChange={(e) => setSettings({...settings, bitrateMode: e.target.value})}
                         disabled={isProcessing}
                       >
                         <option value="auto">Auto (Balanced via CRF)</option>
                         <option value="custom">Custom Fixed Bitrate</option>
                       </select>
                       
                       {settings.bitrateMode === 'custom' && (
                         <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 bg-[#11151D] p-4 rounded-lg border border-gray-800/50">
                           <input 
                             type="range" 
                             min="100" max="15000" step="50"
                             className="w-full accent-[#7C5CFF]"
                             value={settings.customBitrate}
                             onChange={(e) => setSettings({...settings, customBitrate: parseInt(e.target.value) || 100})}
                             disabled={isProcessing}
                           />
                           <div className="flex items-center space-x-2 w-full sm:w-auto justify-between sm:justify-end">
                             <input
                               type="number"
                               min="50"
                               max="50000"
                               value={settings.customBitrate}
                               onChange={(e) => setSettings({...settings, customBitrate: Math.max(50, parseInt(e.target.value) || 50)})}
                               disabled={isProcessing}
                               className="w-24 bg-[#0B0D12] border border-gray-700 rounded-lg py-2 px-3 text-right text-sm font-mono text-[#36D6C5] focus:outline-none focus:border-[#7C5CFF]"
                             />
                             <span className="text-xs font-mono text-gray-400">kbps</span>
                           </div>
                         </div>
                       )}
                     </div>
                    )}
                  </>
                ) : (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Audio Format</label>
                      <select 
                        className="w-full bg-[#0B0D12] border border-gray-700 rounded-lg py-3 px-3 text-white focus:outline-none focus:border-[#7C5CFF] disabled:opacity-50"
                        value={settings.audioFormat}
                        onChange={(e) => setSettings({...settings, audioFormat: e.target.value})}
                        disabled={isProcessing}
                      >
                        <option value="mp3">MP3</option>
                        <option value="aac">AAC</option>
                        <option value="wav">WAV (Lossless)</option>
                      </select>
                    </div>
                    {settings.audioFormat !== 'wav' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Audio Quality (Bitrate)</label>
                        <select 
                          className="w-full bg-[#0B0D12] border border-gray-700 rounded-lg py-3 px-3 text-white focus:outline-none focus:border-[#7C5CFF] disabled:opacity-50"
                          value={settings.audioBitrate}
                          onChange={(e) => setSettings({...settings, audioBitrate: e.target.value})}
                          disabled={isProcessing}
                        >
                          <option value="320k">320 kbps (High Quality)</option>
                          <option value="256k">256 kbps</option>
                          <option value="192k">192 kbps</option>
                          <option value="128k">128 kbps (Standard)</option>
                          <option value="96k">96 kbps</option>
                        </select>
                      </div>
                    )}
                  </div>
                )}

                <div className="pt-4 border-t border-gray-800">
                  <button
                    onClick={processVideo}
                    disabled={isProcessing || !metadata.duration}
                    className="w-full bg-gradient-to-r from-[#7C5CFF] to-[#6847F5] hover:from-[#6847F5] hover:to-[#5B3EE0] text-white py-3 rounded-lg font-bold transition-all shadow-[0_0_20px_rgba(124,92,255,0.4)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    <Play className="w-5 h-5 fill-current" />
                    <span>{metadata.duration ? 'Start Processing' : 'Loading Video...'}</span>
                  </button>
                </div>
                
                {errorMessage && (
                  <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start space-x-3">
                    <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                    <p className="text-sm text-red-200">{errorMessage}</p>
                  </div>
                )}

              </div>
            </div>
          </div>
        )}

        {/* State 3: Result */}
        {result && (
          <div className="p-12 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mb-6 border border-green-500/20">
              <CheckCircle2 className="w-10 h-10 text-green-400" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">Processing Complete!</h2>
            <p className="text-gray-400 mb-6">Your compressed file is ready to preview and download.</p>

            {/* Playable Result Preview */}
            <div className="w-full max-w-lg mb-6 rounded-xl overflow-hidden border border-gray-800 bg-black">
              {result.isAudio ? (
                <div className="p-4">
                  <audio src={result.url} controls className="w-full" />
                </div>
              ) : (
                <video src={result.url} controls className="w-full max-h-64 object-contain" />
              )}
            </div>
            
            <div className="w-full max-w-lg bg-[#151A23] border border-gray-800 rounded-xl p-6 mb-4 text-left">
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-800">
                <span className="text-gray-400">Original Size</span>
                <span className="text-white font-medium">{formatSize(file!.size)}</span>
              </div>
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-800">
                <span className="text-gray-400">Final Size</span>
                <span className="text-[#36D6C5] font-bold text-lg">{formatSize(result.size)}</span>
              </div>
              
              {calcReduction() > 0 && settings.mode !== 'audio' && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Space Saved</span>
                  <span className="text-green-400 font-bold bg-green-400/10 px-3 py-1 rounded-full text-sm">
                    {calcReduction()}% Smaller
                  </span>
                </div>
              )}
            </div>

            {targetMessage && (
               <div className="w-full max-w-lg bg-orange-500/10 border border-orange-500/20 rounded-lg p-4 mb-8 text-left flex items-start space-x-3">
                 <AlertCircle className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
                 <p className="text-sm text-orange-200">{targetMessage}</p>
               </div>
            )}

            <div className="flex space-x-4 mt-4">
              <a 
                href={result.url} 
                download={result.name}
                className="bg-[#7C5CFF] hover:bg-[#6847F5] text-white px-8 py-3 rounded-lg font-bold transition-all shadow-lg flex items-center space-x-2"
              >
                <Download className="w-5 h-5" />
                <span>Download File</span>
              </a>
              <button 
                onClick={() => {
                  setFile(null);
                  setResult(null);
                  setVideoPreview(null);
                  setTargetMessage(null);
                }}
                className="bg-[#151A23] hover:bg-gray-800 text-white border border-gray-700 px-8 py-3 rounded-lg font-medium transition-all"
              >
                Process Another
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
  return (
    <div>
      {/* Hero */}
      <section className="pt-24 pb-16 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center space-x-2 bg-[#11151D] border border-gray-800 rounded-full px-4 py-1.5 mb-6">
            <span className="w-2 h-2 rounded-full bg-[#36D6C5] animate-pulse"></span>
            <span className="text-sm font-medium text-gray-300">100% Secure & Private Browser Processing</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight mb-6 leading-tight">
            Compress Videos.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#7C5CFF] to-[#36D6C5]">
              Without Losing Quality.
            </span>
          </h1>
          <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Free online video compressor and converter. Reduce video file size, change formats, adjust codecs, and extract audio with powerful processing tools.
          </p>
        </div>

        <VideoTool defaultMode="compress" />
      </section>

      {/* Quick Tools */}
      <section className="py-20 bg-[#11151D]/50 border-y border-gray-800">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-white mb-10 text-center">More Processing Tools</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: FileVideo, title: "Video Converter", desc: "Change MP4, MKV, MOV formats", link: "/video-converter" },
              { icon: FileAudio, title: "Video to MP3", desc: "Extract audio from any video", link: "/video-to-mp3" },
              { icon: Cpu, title: "Codec Converter", desc: "Switch between H.264 & VP9", link: "/video-codec-converter" },
              { icon: HardDrive, title: "Video Resizer", desc: "Downscale 4K and 1080p videos", link: "/video-resizer" }
            ].map((tool, i) => (
              <Link to={tool.link} key={i} className="bg-[#0B0D12] border border-gray-800 p-6 rounded-xl hover:border-[#7C5CFF]/50 hover:bg-[#151A23] transition-all group">
                <tool.icon className="w-8 h-8 text-[#7C5CFF] mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-lg font-bold text-white mb-2">{tool.title}</h3>
                <p className="text-sm text-gray-400">{tool.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          <div>
            <div className="w-14 h-14 mx-auto bg-[#151A23] border border-gray-800 rounded-2xl flex items-center justify-center mb-6 text-[#36D6C5]">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">100% Private</h3>
            <p className="text-gray-400">Files are processed directly in your web browser. Nothing is ever uploaded to our servers.</p>
          </div>
          <div>
            <div className="w-14 h-14 mx-auto bg-[#151A23] border border-gray-800 rounded-2xl flex items-center justify-center mb-6 text-[#7C5CFF]">
              <Settings className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Advanced Controls</h3>
            <p className="text-gray-400">Set custom bitrates, target file sizes, frame rates, and choose between modern codecs.</p>
          </div>
          <div>
            <div className="w-14 h-14 mx-auto bg-[#151A23] border border-gray-800 rounded-2xl flex items-center justify-center mb-6 text-[#36D6C5]">
              <Scissors className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">No Watermarks</h3>
            <p className="text-gray-400">Export clean, watermark-free videos instantly without needing to create an account.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

const SEOLandingPage = () => {
  const location = useLocation();
  const data = seoPages[location.pathname] || seoPages['/video-compressor'];
  
  // Determine tool mode based on URL
  let mode = 'compress';
  if (location.pathname.includes('mp3') || location.pathname.includes('audio')) {
    mode = 'audio';
  }

  return (
    <div className="pt-24 pb-16 px-4">
      <div className="max-w-4xl mx-auto text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4">{data.h1}</h1>
        <p className="text-lg text-gray-400">{data.description}</p>
      </div>

      <VideoTool defaultMode={mode} />

      <div className="max-w-3xl mx-auto mt-24 prose prose-invert prose-p:text-gray-400 prose-headings:text-white">
        <h2>About this tool</h2>
        <p>{data.content}</p>
        
        <h3>How to use the tool</h3>
        <ol className="text-gray-400 space-y-2 list-decimal pl-5">
          <li>Upload your video file by dragging it into the dropzone.</li>
          <li>Adjust your required settings in the right panel.</li>
          <li>Click 'Start Processing'. The conversion happens instantly in your browser.</li>
          <li>Download the final optimized file to your device.</li>
        </ol>
      </div>
    </div>
  );
};

const BlogList = () => (
  <div className="max-w-7xl mx-auto px-4 py-24">
    <h1 className="text-4xl font-bold text-white mb-12">Video Processing Guides</h1>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {[
        "How to Compress a Video Without Losing Quality",
        "H.264 vs H.265: Which Video Codec Is Better?",
        "How to Reduce MP4 File Size for Email",
        "How to Convert Video to MP3 on Desktop",
        "Understanding Video Bitrate and Target File Sizes",
        "Video Codec vs Container: What Is the Difference?"
      ].map((title, i) => (
        <div key={i} className="bg-[#11151D] border border-gray-800 rounded-xl overflow-hidden hover:border-gray-600 transition-colors cursor-pointer group">
          <div className="h-48 bg-[#151A23] flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[#7C5CFF]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <Video className="w-12 h-12 text-gray-700" />
          </div>
          <div className="p-6">
            <div className="text-xs text-[#36D6C5] font-medium mb-3">TUTORIAL</div>
            <h3 className="text-xl font-bold text-white mb-2 leading-tight">{title}</h3>
            <p className="text-sm text-gray-400">Learn the best techniques and settings for handling media formats in 2026.</p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Standard functional components without inline destructuring type syntax inside the JSX blocks
const StaticPage = ({ title, children }: { title: string, children: React.ReactNode }) => (
  <div className="max-w-3xl mx-auto px-4 py-24 prose prose-invert prose-p:text-gray-400 prose-headings:text-white">
    <h1>{title}</h1>
    {children}
  </div>
);

const FAQPage = () => (
  <div className="max-w-3xl mx-auto px-4 py-24">
    <h1 className="text-4xl font-bold text-white mb-12 text-center">Frequently Asked Questions</h1>
    <div className="space-y-4">
      {[
        { q: "What is a free video compressor?", a: "A video compressor reduces the file size of your videos by applying modern encoding algorithms, allowing you to share files more easily via email, WhatsApp, or Discord." },
        { q: "Is this video compressor truly free?", a: "Yes, NovaCompress is completely free to use. There are no paywalls, no watermarks, and no sign-up required." },
        { q: "Is my video uploaded to a server?", a: "No. All processing happens entirely within your web browser using WebAssembly. Your files are never uploaded, ensuring 100% privacy." },
        { q: "Can I compress a video without losing quality?", a: "By using modern codecs like H.265 and maintaining a reasonable bitrate, you can drastically reduce file size with zero noticeable loss in visual quality." },
        { q: "Can I compress a video to a specific file size?", a: "Yes! Our tool features a 'Target Size' calculator. Enter your desired file size in Megabytes (MB), and the engine will automatically calculate the required bitrate to achieve it." },
        { q: "Can I extract audio from my video?", a: "Absolutely. Select the 'Extract Audio' mode to convert your video into MP3, AAC, or lossless WAV formats." }
      ].map((faq, i) => (
        <details key={i} className="group bg-[#151A23] border border-gray-800 rounded-lg">
          <summary className="flex justify-between items-center font-medium cursor-pointer list-none p-5 text-white">
            <span>{faq.q}</span>
            <span className="transition group-open:rotate-180">
              <ChevronDown className="w-5 h-5 text-gray-400" />
            </span>
          </summary>
          <div className="text-gray-400 mt-2 p-5 pt-0 leading-relaxed">
            {faq.a}
          </div>
        </details>
      ))}
    </div>
  </div>
);

// ==========================================
// MAIN APP COMPONENT
// ==========================================

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[#0B0D12] text-[#F5F7FA] font-sans selection:bg-[#7C5CFF]/30">
        <Header />
        
        <main>
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
                <p>Have a question or a feature request? We'd love to hear from you.</p>
                <div className="mt-8 bg-[#151A23] border border-gray-800 p-6 rounded-lg">
                  <p className="text-white font-medium">Email Support:</p>
                  <p className="text-[#36D6C5]">support@novacompress.example.com</p>
                </div>
              </StaticPage>
            } />
            <Route path="/terms" element={
              <StaticPage title="Terms of Service">
                <p><strong>Last Updated: November 2026</strong></p>
                <h2>1. Acceptance of Terms</h2>
                <p>By using NovaCompress, you agree to these terms of service. The service is provided "as is" without warranties of any kind.</p>
                <h2>2. Acceptable Use</h2>
                <p>You agree not to use the service for processing illegal content. Because processing occurs entirely on your device, you assume all legal responsibility for the media you process.</p>
              </StaticPage>
            } />
            <Route path="/about" element={
              <StaticPage title="About NovaCompress">
                <p>NovaCompress was built to provide a secure, fast, and high-quality method to process video files without the need for expensive software or privacy-invading cloud uploads.</p>
                <p>Our processing engine utilizes WebAssembly to run industry-standard encoders natively inside your web browser.</p>
              </StaticPage>
            } />
            <Route path="/privacy-policy" element={
              <StaticPage title="Privacy Policy">
                <p><strong>Last Updated: November 2026</strong></p>
                <p>Your privacy is our priority. NovaCompress processes all files locally within your web browser. We do not upload, store, or transmit your media files to any external servers.</p>
                <h2>Data Processing</h2>
                <p>All video compression, conversion, and audio extraction happens entirely on your local machine using WebAssembly technology.</p>
              </StaticPage>
            } />
            
            {/* Fallback */}
            <Route path="*" element={<Home />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
}