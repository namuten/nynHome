import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Disc, SkipForward, SkipBack, ListMusic } from 'lucide-react';

interface AudioTrack {
  title: string;
  url: string;
  artist?: string;
}

interface AudioPlayerProps {
  tracks: AudioTrack[];
}

export default function AudioPlayer({ tracks }: AudioPlayerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressBarRef = useRef<HTMLInputElement | null>(null);

  const currentTrack = tracks[currentIndex];

  // 오디오 소스 초기화 및 변경 제어
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.load();
      if (isPlaying) {
        audioRef.current.play().catch((err) => {
          console.warn('AutoPlay blocked or failed:', err);
          setIsPlaying(false);
        });
      }
    }
  }, [currentIndex]);

  // 볼륨 동기화
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // 시간 포맷 변환기 (seconds -> MM:SS)
  const formatTime = (time: number) => {
    if (isNaN(time)) return '00:00';
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch((err) => console.warn(err));
      setIsPlaying(true);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleAudioEnded = () => {
    if (tracks.length > 1) {
      // 순환 구조 다음 트랙 자동 재생
      setCurrentIndex((currentIndex + 1) % tracks.length);
    } else {
      setIsPlaying(false);
      setCurrentTime(0);
    }
  };

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const seekValue = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = seekValue;
      setCurrentTime(seekValue);
    }
  };

  const handlePrev = () => {
    setCurrentIndex((currentIndex - 1 + tracks.length) % tracks.length);
  };

  const handleNext = () => {
    setCurrentIndex((currentIndex + 1) % tracks.length);
  };

  return (
    <div className="bg-gradient-to-br from-surface-container/60 to-surface-container/95 border border-outline-variant/35 rounded-3xl p-6 shadow-md max-w-lg mx-auto font-body space-y-5 animate-fade-in">
      {/* HTML5 Audio hidden element */}
      <audio
        ref={audioRef}
        src={currentTrack?.url}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleAudioEnded}
      />

      {/* 1. 현재 상영 미디어 메타 */}
      <div className="flex items-center gap-4 select-none">
        {/* 회전하는 음반 (Disc) 장식 */}
        <div className="relative shrink-0">
          <div className={`w-14 h-14 bg-black border-2 border-primary/20 rounded-full flex items-center justify-center shadow-lg ${isPlaying ? 'animate-spin-slow' : ''}`}>
            <Disc className="w-7 h-7 text-white/90" />
            <div className="absolute w-3 h-3 bg-white border border-black rounded-full" />
          </div>
        </div>

        {/* 곡 타이틀 및 작곡가 정보 */}
        <div className="min-w-0 flex-1">
          <span className="inline-flex items-center gap-1.5 text-[9px] font-black text-primary uppercase tracking-widest bg-primary/10 px-2 py-0.5 rounded-md mb-1">
            🎧 Now Auditioning
          </span>
          <h4 className="text-xs sm:text-sm font-black text-on-surface truncate">
            {currentTrack?.title || '가상의 오디오 샘플 트랙'}
          </h4>
          <p className="text-[10px] text-on-surface-variant font-bold truncate">
            {currentTrack?.artist || 'Antigravity Studio'}
          </p>
        </div>

        {/* 이퀄라이저 애니메이션 기둥 */}
        {isPlaying && (
          <div className="flex items-end gap-0.5 h-6 shrink-0 select-none px-2">
            <div className="w-1 bg-primary rounded-full animate-eq-bar-1 h-3" />
            <div className="w-1 bg-primary rounded-full animate-eq-bar-2 h-5" />
            <div className="w-1 bg-primary rounded-full animate-eq-bar-3 h-2" />
            <div className="w-1 bg-primary rounded-full animate-eq-bar-4 h-4" />
          </div>
        )}
      </div>

      {/* 2. 트랙 진행도 컨트롤 바 */}
      <div className="space-y-1">
        <input
          ref={progressBarRef}
          type="range"
          min="0"
          max={duration || 100}
          value={currentTime}
          onChange={handleSeekChange}
          className="w-full h-1.5 rounded-lg bg-surface-container-high accent-primary cursor-pointer focus:outline-none"
        />

        <div className="flex justify-between text-[9px] font-bold text-on-surface-variant/80 font-mono tracking-wider">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* 3. 조작 제어 콘솔 패널 */}
      <div className="flex items-center justify-between pt-1">
        {/* 음소거 / 볼륨 슬라이더 */}
        <div className="flex items-center gap-2 w-28 shrink-0">
          <button
            type="button"
            onClick={() => setIsMuted(!isMuted)}
            className="p-1.5 text-on-surface-variant hover:text-primary rounded-lg hover:bg-surface-container transition-colors focus:outline-none"
            aria-label={isMuted ? '음소거 해제' : '음소거'}
          >
            {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={isMuted ? 0 : volume}
            onChange={(e) => {
              setVolume(parseFloat(e.target.value));
              if (isMuted) setIsMuted(false);
            }}
            className="w-14 h-1 bg-surface-container accent-primary cursor-pointer focus:outline-none"
          />
        </div>

        {/* 재생/정지, 이전/다음 기동 버턴들 */}
        <div className="flex items-center gap-3">
          {tracks.length > 1 && (
            <button
              type="button"
              onClick={handlePrev}
              className="p-2 text-on-surface-variant hover:text-primary rounded-full hover:bg-surface-container transition-colors focus:outline-none"
              aria-label="이전 곡"
            >
              <SkipBack className="w-4.5 h-4.5" />
            </button>
          )}

          <button
            type="button"
            onClick={togglePlay}
            className="p-3 bg-primary hover:bg-primary/95 text-on-primary rounded-full transition-all shadow-md active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary/40"
            aria-label={isPlaying ? '일시 정지' : '재생'}
          >
            {isPlaying ? <Pause className="w-5.5 h-5.5 fill-current" /> : <Play className="w-5.5 h-5.5 fill-current ml-0.5" />}
          </button>

          {tracks.length > 1 && (
            <button
              type="button"
              onClick={handleNext}
              className="p-2 text-on-surface-variant hover:text-primary rounded-full hover:bg-surface-container transition-colors focus:outline-none"
              aria-label="다음 곡"
            >
              <SkipForward className="w-4.5 h-4.5" />
            </button>
          )}
        </div>

        {/* 수동 리스트 아이콘 장식 */}
        <div className="w-28 text-right">
          {tracks.length > 1 && (
            <span className="inline-flex items-center gap-1 text-[9px] font-black text-on-surface-variant/80 tracking-wide select-none">
              <ListMusic className="w-3.5 h-3.5" />
              <span>Playlist ({tracks.length})</span>
            </span>
          )}
        </div>
      </div>

      {/* 4. 플레이리스트 멀티 트랙 선택용 리스트뷰 */}
      {tracks.length > 1 && (
        <div className="border-t border-outline-variant/35 pt-4 space-y-1.5 select-none max-h-32 overflow-y-auto">
          {tracks.map((track, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setCurrentIndex(i)}
              className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all ${
                currentIndex === i
                  ? 'bg-primary/10 border border-primary/25 text-primary'
                  : 'bg-white/40 border border-transparent text-on-surface-variant hover:bg-white/70 hover:text-on-surface'
              }`}
            >
              <span className="text-[10px] font-bold truncate pr-3 flex items-center gap-1.5">
                <span className="font-mono text-[9px] opacity-60">{(i + 1).toString().padStart(2, '0')}</span>
                <span>{track.title}</span>
              </span>
              <span className="text-[9px] font-semibold text-on-surface-variant/60 shrink-0 font-mono">
                {track.artist || 'Artist'}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
export { AudioPlayer };
