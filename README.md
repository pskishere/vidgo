# VidGo - 专业视频播放器

基于 Tauri + React + TypeScript 构建的现代化桌面视频播放应用，支持多种视频源和智能音量调节。

## ✨ 主要功能

### 🎬 多种视频源支持
- **YouTube** - 支持 YouTube 视频链接播放
- **Vimeo** - 支持 Vimeo 平台视频
- **Twitch** - 支持 Twitch 直播和录播
- **网络视频** - 支持任意网络视频链接 (MP4, WebM 等)
- **本地视频** - 支持本地视频文件播放

### 🔊 系统音量智能调节 ⭐ **核心功能**
- **🎛️ 系统音量控制** - 直接控制操作系统音量，不仅仅是播放器音量
  - macOS：使用 AppleScript 控制系统音量
  - Linux：使用 PulseAudio (pactl) 控制音量  
  - Windows：使用 PowerShell 控制音量
- **🎯 智能音量预设** - 根据视频源类型自动调节最佳系统音量
  - YouTube 视频：自动设置系统音量为 70%（通常音量较大）
  - 本地/网络视频：自动设置系统音量为 80%（标准音量）
  - Vimeo 视频：自动设置系统音量为 75%（音量适中）
  - Twitch 直播：自动设置系统音量为 60%（直播音量通常较大）
- **⚡ 实时系统音量控制** - 播放过程中可随时调节系统音量和静音
- **🎵 音量状态同步** - 与系统音量实时同步，显示当前状态

### 🎮 完整播放控制
- ▶️ **播放/暂停** - 点击播放按钮或空格键控制
- ⏪ **快退/快进** - 支持 10 秒快退和快进
- 🎚️ **进度控制** - 可拖拽的进度条，支持精确定位
- 🔄 **播放状态** - 实时显示播放进度和总时长
- 🔍 **全屏播放** - 支持全屏模式观看

### 🎨 现代化界面
- **响应式设计** - 适配不同屏幕尺寸
- **黑暗主题** - 专为视频观看优化的界面
- **自动隐藏控制栏** - 3秒后自动隐藏，提供沉浸式体验
- **视频源标识** - 清晰标识视频来源类型
- **缩略图支持** - 显示视频缩略图（如可用）

### 📝 视频管理
- **视频列表** - 管理多个视频源
- **添加视频** - 支持手动添加视频链接
- **删除视频** - 可删除不需要的视频
- **智能识别** - 自动识别视频源类型
- **状态显示** - 显示当前播放状态和视频信息

## 🚀 快速开始

### 环境要求
- Node.js 16+ 
- Rust 1.70+
- Tauri 2.0+

### 安装依赖
```bash
# 安装 Node.js 依赖
npm install

# 或使用 yarn
yarn install
```

### 开发模式
```bash
# 启动开发服务器
npm run tauri dev

# 或使用 yarn
yarn tauri dev
```

### 构建应用
```bash
# 构建生产版本
npm run tauri build

# 或使用 yarn
yarn tauri build
```

## 🏗️ 技术架构

### 前端技术栈
- **React 18** - 现代化 React 框架
- **TypeScript** - 类型安全的 JavaScript
- **Vite** - 快速的构建工具
- **React Player** - 强大的视频播放组件
- **Lucide React** - 美观的图标库

### 后端技术栈
- **Tauri 2.0** - 轻量级桌面应用框架
- **Rust** - 高性能系统编程语言
- **Web APIs** - 现代 Web 技术支持

### 核心组件
```
src/
├── components/
│   ├── VideoPlayer.tsx    # 核心视频播放器组件
│   └── VideoList.tsx      # 视频列表管理组件
├── App.tsx               # 主应用组件
├── App.css              # 应用样式
├── VideoPlayer.css      # 播放器专用样式
└── main.tsx            # 应用入口
```

## 🎯 使用指南

### 添加视频
1. 点击右侧视频列表的 **+** 按钮
2. 输入视频标题和 URL 链接
3. 调节默认音量（可选）
4. 点击 **添加** 按钮

### 播放控制
- **播放/暂停**：点击播放按钮
- **音量调节**：拖拽音量滑块
- **进度控制**：拖拽进度条
- **全屏切换**：点击全屏按钮
- **快进/快退**：使用控制按钮

### 音量管理
系统会根据视频源类型自动设置最佳音量：
- 不同平台有不同的默认音量设置
- 可为每个视频单独设置默认音量
- 支持实时音量调节和静音功能

## 🛠️ 开发说明

### 项目结构
```
vidgo/
├── src/                    # React 前端源码
│   ├── components/         # React 组件
│   ├── App.tsx            # 主应用组件
│   └── ...
├── src-tauri/             # Tauri 后端源码
│   ├── src/               # Rust 源码
│   ├── tauri.conf.json    # Tauri 配置
│   └── Cargo.toml         # Rust 依赖配置
├── public/                # 静态资源
└── package.json           # Node.js 依赖配置
```

### 核心特性实现

#### 动态音量调节
```typescript
// 根据视频源类型设置音量
const getVolumeBySourceType = (sourceType: string) => {
  const volumeMap = {
    'youtube': 0.7,   // YouTube 音量通常较大
    'local': 0.8,     // 本地视频正常音量
    'url': 0.8,       // 网络视频正常音量
    'vimeo': 0.75,    // Vimeo 音量适中
    'twitch': 0.6,    // Twitch 直播音量较大
  };
  return volumeMap[sourceType] || 0.8;
};
```

#### 视频源自动识别
```typescript
const detectVideoType = (url: string) => {
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    return 'youtube';
  } else if (url.includes('vimeo.com')) {
    return 'vimeo';
  } else if (url.includes('twitch.tv')) {
    return 'twitch';
  }
  return 'url';
};
```

## 🔧 配置说明

### Tauri 配置
- 支持网络请求和媒体播放
- 设置合适的窗口尺寸和限制
- 启用必要的安全策略

### 构建配置
- TypeScript 严格模式
- Vite 构建优化
- 响应式设计支持

## 📱 支持平台

- ✅ **Windows** - Windows 10/11
- ✅ **macOS** - macOS 10.15+  
- ✅ **Linux** - Ubuntu 18.04+

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

### 开发流程
1. Fork 项目
2. 创建功能分支
3. 提交代码变更
4. 创建 Pull Request

### 代码规范
- 使用 TypeScript 严格模式
- 遵循 React 最佳实践
- 保持代码整洁和注释完整

## 📄 许可证

MIT License - 查看 [LICENSE](LICENSE) 文件了解详情

## 🙏 致谢

- [Tauri](https://tauri.app/) - 跨平台桌面应用框架
- [React Player](https://github.com/CookPete/react-player) - 视频播放组件
- [Lucide](https://lucide.dev/) - 图标库
- [Vite](https://vitejs.dev/) - 构建工具

---

**VidGo** - 让视频播放更智能、更专业！ 🎬✨
