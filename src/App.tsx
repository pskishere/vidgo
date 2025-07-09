import React, { useState, useEffect } from 'react';
import VideoPlayer from './components/VideoPlayer';
import VideoList from './components/VideoList';
import { Monitor, List, Settings } from 'lucide-react';
import './App.css';
import './VideoPlayer.css';
import SettingsModal from "./components/SettingsModal";

interface VideoSource {
  id: string;
  title: string;
  url: string;
  thumbnail?: string;
  defaultVolume?: number;
  type: 'youtube' | 'local' | 'url' | 'vimeo' | 'twitch';
}

function App() {
  const [videos, setVideos] = useState<VideoSource[]>([]);
  const [currentVideo, setCurrentVideo] = useState<VideoSource | null>(null);
  const [showSidebar, setShowSidebar] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // 初始化示例视频
  useEffect(() => {
    const sampleVideos: VideoSource[] = [
      {
        id: '1',
        title: 'Big Buck Bunny - 测试视频',
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        type: 'url',
        defaultVolume: 0.2,
      },
      {
        id: '2', 
        title: 'Elephant Dream - 测试视频',
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        type: 'url',
        defaultVolume: 0.5,
      },
      {
        id: '3',
        title: 'Sintel - 测试视频',
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
        type: 'url',
        defaultVolume: 0.8,
      }
    ];
    
    setVideos(sampleVideos);
    setCurrentVideo(sampleVideos[0]);
  }, []);

  const handleVideoSelect = (video: VideoSource) => {
    setCurrentVideo(video);
  };

  const handleVideoAdd = (video: VideoSource) => {
    setVideos(prev => [...prev, video]);
  };

  const handleVideoRemove = (videoId: string) => {
    setVideos(prev => prev.filter(v => v.id !== videoId));
    if (currentVideo?.id === videoId) {
      const remainingVideos = videos.filter(v => v.id !== videoId);
      setCurrentVideo(remainingVideos.length > 0 ? remainingVideos[0] : null);
    }
  };

  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  return (
    <div className="app">
      {/* 顶部导航栏 */}
      <header className="app-header">
        <div className="header-left">
          <div className="app-logo">
            <Monitor size={24} />
            <h1>VidGo</h1>
          </div>
          <span className="app-subtitle">专业视频播放器</span>
        </div>
        
        <div className="header-right">
          <button 
            onClick={toggleSidebar}
            className={`sidebar-toggle ${showSidebar ? 'active' : ''}`}
            title="切换侧边栏"
          >
            <List size={20} />
          </button>
          <button 
            className="settings-btn" 
            onClick={() => setIsSettingsOpen(true)}
            title="设置"
          >
            <Settings size={20} />
          </button>
        </div>
      </header>

      {/* 主要内容区域 */}
      <main className="app-main">
        {/* 视频播放区域 */}
        <div className="video-section">
          {currentVideo ? (
            <VideoPlayer 
              source={currentVideo}
              onSourceChange={setCurrentVideo}
            />
          ) : (
            <div className="no-video-placeholder">
              <Monitor size={64} />
              <h3>暂无选中的视频</h3>
              <p>请在右侧视频列表中选择一个视频开始播放</p>
            </div>
          )}
        </div>

        {/* 侧边栏 */}
        <aside className={`app-sidebar ${showSidebar ? 'show' : 'hide'}`}>
          <VideoList
            videos={videos}
            currentVideo={currentVideo}
            onVideoSelect={handleVideoSelect}
            onVideoAdd={handleVideoAdd}
            onVideoRemove={handleVideoRemove}
          />
        </aside>
      </main>

      {/* 状态栏 */}
      <footer className="app-footer">
        <div className="status-info">
          <span>视频总数: {videos.length}</span>
          {currentVideo && (
            <>
              <span>•</span>
              <span>当前播放: {currentVideo.title}</span>
              <span>•</span>
              <span>类型: {currentVideo.type.toUpperCase()}</span>
              <span>•</span>
              <span>预设音量: {Math.round((currentVideo.defaultVolume || 0.8) * 100)}%</span>
              <span>•</span>
              <span>🎵 系统音量控制已启用</span>
            </>
          )}
        </div>
        
        <div className="app-version">
          v1.0.0 (系统音量)
        </div>
      </footer>
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />
    </div>
  );
}

export default App;
