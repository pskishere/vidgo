import React, { useState } from 'react';
import { Plus, Trash2, Play, Globe, Youtube, Video, Twitch } from 'lucide-react';

interface VideoSource {
  id: string;
  title: string;
  url: string;
  thumbnail?: string;
  defaultVolume?: number;
  type: 'youtube' | 'local' | 'url' | 'vimeo' | 'twitch';
}

interface VideoListProps {
  videos: VideoSource[];
  currentVideo: VideoSource | null;
  onVideoSelect: (video: VideoSource) => void;
  onVideoAdd: (video: VideoSource) => void;
  onVideoRemove: (videoId: string) => void;
}

const VideoList: React.FC<VideoListProps> = ({
  videos,
  currentVideo,
  onVideoSelect,
  onVideoAdd,
  onVideoRemove,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newVideo, setNewVideo] = useState({
    title: '',
    url: '',
    type: 'url' as VideoSource['type'],
    defaultVolume: 0.8,
  });

  const getSourceIcon = (type: VideoSource['type']) => {
    switch (type) {
      case 'youtube':
        return <Youtube size={16} className="text-red-500" />;
      case 'vimeo':
        return <Video size={16} className="text-blue-500" />;
      case 'twitch':
        return <Twitch size={16} className="text-purple-500" />;
      case 'local':
        return <Video size={16} className="text-gray-500" />;
      default:
        return <Globe size={16} className="text-green-500" />;
    }
  };

  const detectVideoType = (url: string): VideoSource['type'] => {
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      return 'youtube';
    } else if (url.includes('vimeo.com')) {
      return 'vimeo';
    } else if (url.includes('twitch.tv')) {
      return 'twitch';
    } else if (url.startsWith('file://') || url.includes('localhost')) {
      return 'local';
    }
    return 'url';
  };

  const handleAddVideo = () => {
    if (newVideo.title && newVideo.url) {
      const videoType = detectVideoType(newVideo.url);
      const video: VideoSource = {
        id: Date.now().toString(),
        title: newVideo.title,
        url: newVideo.url,
        type: videoType,
        defaultVolume: newVideo.defaultVolume,
      };
      
      onVideoAdd(video);
      setNewVideo({
        title: '',
        url: '',
        type: 'url',
        defaultVolume: 0.8,
      });
      setShowAddForm(false);
    }
  };

  const handleUrlChange = (url: string) => {
    const detectedType = detectVideoType(url);
    setNewVideo(prev => ({
      ...prev,
      url,
      type: detectedType,
    }));
  };

  return (
    <div className="video-list">
      <div className="video-list-header">
        <h2>视频列表</h2>
        <button
          onClick={() => setShowAddForm(true)}
          className="add-video-btn"
          title="添加视频"
        >
          <Plus size={20} />
        </button>
      </div>

      {/* 添加视频表单 */}
      {showAddForm && (
        <div className="add-video-form">
          <h3>添加视频</h3>
          <div className="form-group">
            <label>标题</label>
            <input
              type="text"
              value={newVideo.title}
              onChange={(e) => setNewVideo(prev => ({ ...prev, title: e.target.value }))}
              placeholder="输入视频标题"
            />
          </div>
          
          <div className="form-group">
            <label>视频链接</label>
            <input
              type="url"
              value={newVideo.url}
              onChange={(e) => handleUrlChange(e.target.value)}
              placeholder="输入视频URL (支持YouTube, Vimeo, Twitch等)"
            />
            <div className="source-type-indicator">
              {getSourceIcon(newVideo.type)}
              <span>{newVideo.type.toUpperCase()}</span>
            </div>
          </div>
          
          <div className="form-group">
            <label>默认音量</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={newVideo.defaultVolume}
              onChange={(e) => setNewVideo(prev => ({ ...prev, defaultVolume: parseFloat(e.target.value) }))}
            />
            <span>{Math.round(newVideo.defaultVolume * 100)}%</span>
          </div>
          
          <div className="form-actions">
            <button onClick={() => setShowAddForm(false)} className="cancel-btn">
              取消
            </button>
            <button onClick={handleAddVideo} className="confirm-btn">
              添加
            </button>
          </div>
        </div>
      )}

      {/* 视频列表 */}
      <div className="video-items">
        {videos.length === 0 ? (
          <div className="empty-state">
            <p>暂无视频，点击上方 + 按钮添加视频</p>
          </div>
        ) : (
          videos.map((video) => (
            <div
              key={video.id}
              className={`video-item ${currentVideo?.id === video.id ? 'active' : ''}`}
            >
              <div className="video-info" onClick={() => onVideoSelect(video)}>
                <div className="video-thumbnail">
                  {video.thumbnail ? (
                    <img src={video.thumbnail} alt={video.title} />
                  ) : (
                    <div className="placeholder-thumbnail">
                      {getSourceIcon(video.type)}
                    </div>
                  )}
                  {currentVideo?.id === video.id && (
                    <div className="playing-indicator">
                      <Play size={16} />
                    </div>
                  )}
                </div>
                
                <div className="video-details">
                  <h4>{video.title}</h4>
                  <div className="video-meta">
                    {getSourceIcon(video.type)}
                    <span>{video.type.toUpperCase()}</span>
                    <span className="volume-info">
                      音量: {Math.round((video.defaultVolume || 0.8) * 100)}%
                    </span>
                  </div>
                  <div className="video-url">{video.url}</div>
                </div>
              </div>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onVideoRemove(video.id);
                }}
                className="remove-video-btn"
                title="删除视频"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default VideoList; 