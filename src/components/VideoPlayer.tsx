import React, { useState, useRef, useEffect } from 'react';
import ReactPlayer from 'react-player';
import { invoke } from '@tauri-apps/api/core';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  SkipBack, 
  SkipForward,
  Maximize,
  Settings,
  Speaker
} from 'lucide-react';

interface VideoSource {
  id: string;
  title: string;
  url: string;
  thumbnail?: string;
  defaultVolume?: number;
  type: 'youtube' | 'local' | 'url' | 'vimeo' | 'twitch';
}

interface VideoPlayerProps {
  source: VideoSource;
  onSourceChange?: (source: VideoSource) => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ source, onSourceChange }) => {
  const [playing, setPlaying] = useState(false);
  const [systemVolume, setSystemVolume] = useState(0.8); // 系统音量
  const [playerVolume, setPlayerVolume] = useState(1.0); // 播放器音量 (始终为100%)
  const [systemMuted, setSystemMuted] = useState(false);
  const [played, setPlayed] = useState(0);
  const [loaded, setLoaded] = useState(0);
  const [duration, setDuration] = useState(0);
  const [seeking, setSeeking] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);
  
  const playerRef = useRef<ReactPlayer>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<any>();

  // 获取当前系统音量
  useEffect(() => {
    const getSystemVolume = async () => {
      try {
        const currentVolume = await invoke<number>('get_system_volume');
        setSystemVolume(currentVolume);
      } catch (error) {
        console.error('Failed to get system volume:', error);
      }
    };

    getSystemVolume();
  }, []);

  // 根据视频源类型动态调节系统音量
  useEffect(() => {
    const getVolumeBySourceType = (sourceType: string) => {
      const volumeMap = {
        'youtube': 0.7,   // YouTube 视频通常音量较大
        'local': 0.8,     // 本地视频正常音量
        'url': 0.8,       // 网络视频正常音量
        'vimeo': 0.75,    // Vimeo 音量适中
        'twitch': 0.6,    // Twitch 直播音量较大
      };
      return volumeMap[sourceType as keyof typeof volumeMap] || 0.8;
    };

    const setOptimalVolume = async () => {
      const newVolume = source.defaultVolume || getVolumeBySourceType(source.type);
      try {
        await invoke('set_system_volume', { volume: newVolume });
        setSystemVolume(newVolume);
      } catch (error) {
        console.error('Failed to set system volume:', error);
      }
    };

    setOptimalVolume();
  }, [source]);

  // 自动隐藏控制栏
  useEffect(() => {
    const resetControlsTimeout = () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      setShowControls(true);
      controlsTimeoutRef.current = setTimeout(() => {
        if (playing && !seeking) {
          setShowControls(false);
        }
      }, 3000);
    };

    resetControlsTimeout();
    
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [playing, seeking]);

  const handlePlayPause = () => {
    setPlaying(!playing);
  };

  const handleVolumeChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    try {
      await invoke('set_system_volume', { volume: newVolume });
      setSystemVolume(newVolume);
      setSystemMuted(newVolume === 0);
    } catch (error) {
      console.error('Failed to set system volume:', error);
    }
  };

  const handleMute = async () => {
    try {
      const newMuteState = await invoke<boolean>('toggle_system_mute');
      setSystemMuted(newMuteState);
    } catch (error) {
      console.error('Failed to toggle system mute:', error);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPlayed = parseFloat(e.target.value);
    setPlayed(newPlayed);
    if (playerRef.current) {
      playerRef.current.seekTo(newPlayed);
    }
  };

  const handleSeekMouseDown = () => {
    setSeeking(true);
  };

  const handleSeekMouseUp = () => {
    setSeeking(false);
  };

  const handleProgress = (state: { played: number; loaded: number }) => {
    if (!seeking) {
      setPlayed(state.played);
      setLoaded(state.loaded);
    }
  };

  const handleDuration = (duration: number) => {
    setDuration(duration);
  };

  const handleSkipBackward = () => {
    if (playerRef.current) {
      const currentTime = playerRef.current.getCurrentTime();
      playerRef.current.seekTo(Math.max(0, currentTime - 10));
    }
  };

  const handleSkipForward = () => {
    if (playerRef.current) {
      const currentTime = playerRef.current.getCurrentTime();
      playerRef.current.seekTo(Math.min(duration, currentTime + 10));
    }
  };

  const handleFullscreen = () => {
    if (!fullscreen && containerRef.current) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    setFullscreen(!fullscreen);
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const handleMouseMove = () => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    setShowControls(true);
    if (playing) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  };

  return (
    <div 
      ref={containerRef}
      className={`video-player-container ${fullscreen ? 'fullscreen' : ''}`}
      onMouseMove={handleMouseMove}
    >
      <div className="video-player-wrapper">
        <ReactPlayer
          ref={playerRef}
          url={source.url}
          playing={playing}
          volume={playerVolume} // 播放器音量始终为100%，系统音量由操作系统控制
          width="100%"
          height="100%"
          onProgress={handleProgress}
          onDuration={handleDuration}
          onEnded={() => setPlaying(false)}
          config={{
            youtube: {
              playerVars: { showinfo: 1 }
            }
          }}
        />
        
        {/* 控制栏 */}
        <div className={`video-controls ${showControls ? 'show' : 'hide'}`}>
          {/* 进度条 */}
          <div className="progress-container">
            <div className="progress-played" style={{ width: `${played * 100}%` }} />
            <div className="progress-buffer" style={{ width: `${loaded * 100}%` }} />
            <input
              type="range"
              min="0"
              max="1"
              step="0.001"
              value={played}
              onChange={handleSeek}
              onMouseDown={handleSeekMouseDown}
              onMouseUp={handleSeekMouseUp}
              className="progress-bar"
            />
          </div>
          
          {/* 控制按钮 */}
          <div className="controls-row">
            <div className="controls-left">
              <button onClick={handlePlayPause} className="control-btn">
                {playing ? <Pause size={24} /> : <Play size={24} />}
              </button>
              
              <button onClick={handleSkipBackward} className="control-btn">
                <SkipBack size={20} />
              </button>
              
              <button onClick={handleSkipForward} className="control-btn">
                <SkipForward size={20} />
              </button>
              
              <div className="volume-controls">
                <button onClick={handleMute} className="control-btn">
                  {systemMuted || systemVolume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={systemMuted ? 0 : systemVolume}
                  onChange={handleVolumeChange}
                  className="volume-slider"
                />
                <Speaker size={16} className="system-volume-indicator" />
              </div>
            </div>
            
            <div className="controls-right">
              <div className="time-display">
                <span>{formatTime(played * duration)}</span>
                <span>/</span>
                <span>{formatTime(duration)}</span>
              </div>

              <div className="source-info">
                <span className={`source-type ${source.type}`}>
                  {source.type.toUpperCase()}
                </span>
              </div>
              
              <button className="control-btn">
                <Settings size={20} />
              </button>
              
              <button onClick={handleFullscreen} className="control-btn">
                <Maximize size={20} />
              </button>
            </div>
          </div>
        </div>
        
        {/* 视频标题 */}
        <div className="video-title">
          <h3>{source.title}</h3>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer; 