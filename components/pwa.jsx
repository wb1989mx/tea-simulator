// ============================================================
// PWA 相关 UI 组件
// - 安装引导横幅
// - 离线/在线状态提示
// - 新版本更新提示
// ============================================================

// 安装引导横幅
function InstallPrompt({ onDismiss }) {
  const [visible, setVisible] = React.useState(false);
  const [isInstalled, setIsInstalled] = React.useState(false);
  const [isStandalone, setIsStandalone] = React.useState(false);
  const [isIOS, setIsIOS] = React.useState(false);
  const [showGuide, setShowGuide] = React.useState(false);

  React.useEffect(() => {
    // 检查是否已安装
    const standalone = window.PWAUtils?.isStandalone?.() || false;
    setIsStandalone(standalone);

    // iOS 检测
    const ua = navigator.userAgent.toLowerCase();
    const ios = /iphone|ipad|ipod/.test(ua) && !window.MSStream;
    setIsIOS(ios);

    if (standalone) {
      setIsInstalled(true);
      return;
    }

    // 检查是否已关闭过
    const dismissed = localStorage.getItem('pwa_install_dismissed');
    if (dismissed) return;

    // 监听安装事件
    const handleInstallable = () => {
      // 延迟显示，避免首屏干扰
      setTimeout(() => setVisible(true), 2000);
    };

    if (window.PWAUtils?.getDeferredPrompt?.()) {
      setTimeout(() => setVisible(true), 2000);
    }

    window.addEventListener('pwa-installable', handleInstallable);

    // 已安装事件
    const handleInstalled = () => {
      setIsInstalled(true);
      setVisible(false);
    };
    window.addEventListener('pwa-installed', handleInstalled);

    return () => {
      window.removeEventListener('pwa-installable', handleInstallable);
      window.removeEventListener('pwa-installed', handleInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (isIOS) {
      setShowGuide(true);
      return;
    }
    const success = await window.PWAUtils?.triggerInstall?.();
    if (success) {
      setVisible(false);
    }
  };

  const handleDismiss = () => {
    setVisible(false);
    localStorage.setItem('pwa_install_dismissed', '1');
    localStorage.setItem('pwa_install_dismissed_at', Date.now().toString());
    if (onDismiss) onDismiss();
  };

  if (!visible || isInstalled || isStandalone) return null;

  return (
    <div className="pwa-install-banner">
      <div className="pwa-install-icon">
        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="7 10 12 15 17 10"/>
          <line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
      </div>
      <div className="pwa-install-text">
        <div className="pwa-install-title">添加到主屏幕</div>
        <div className="pwa-install-desc">
          {isIOS
            ? '点击分享按钮 → "添加到主屏幕"，离线也能制茶'
            : '安装为应用，离线可用，体验更佳'
          }
        </div>
      </div>
      <button className="pwa-install-btn" onClick={handleInstall}>
        {isIOS ? '查看方法' : '立即安装'}
      </button>
      <button className="pwa-install-close" onClick={handleDismiss} aria-label="关闭">
        ×
      </button>

      {/* iOS 安装指南弹窗 */}
      {showGuide && (
        <div className="pwa-ios-guide-overlay" onClick={() => setShowGuide(false)}>
          <div className="pwa-ios-guide" onClick={(e) => e.stopPropagation()}>
            <div className="pwa-ios-guide-title">添加到主屏幕</div>
            <div className="pwa-ios-guide-steps">
              <div className="pwa-ios-step">
                <span className="pwa-ios-step-num">1</span>
                <span>点击浏览器底部的 <strong>分享</strong> 按钮</span>
              </div>
              <div className="pwa-ios-step">
                <span className="pwa-ios-step-num">2</span>
                <span>向下滑动，找到 <strong>"添加到主屏幕"</strong></span>
              </div>
              <div className="pwa-ios-step">
                <span className="pwa-ios-step-num">3</span>
                <span>点击右上角的 <strong>"添加"</strong> 即可</span>
              </div>
            </div>
            <div className="pwa-ios-guide-tip">
              添加后可从桌面直接打开，离线也能使用全部功能
            </div>
            <button className="btn btn-primary" onClick={() => setShowGuide(false)} style={{ width: '100%' }}>
              我知道了
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// 在线/离线状态提示
function OfflineIndicator() {
  const [isOnline, setIsOnline] = React.useState(true);
  const [showHint, setShowHint] = React.useState(false);

  React.useEffect(() => {
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      setShowHint(true);
      setTimeout(() => setShowHint(false), 3000);
    };
    const handleOffline = () => {
      setIsOnline(false);
      setShowHint(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!showHint) return null;

  return (
    <div className={`offline-indicator ${isOnline ? 'online' : 'offline'}`}>
      {isOnline ? (
        <>
          <span className="offline-dot online"></span>
          已恢复联网
        </>
      ) : (
        <>
          <span className="offline-dot offline"></span>
          已离线 · 核心功能仍可使用
        </>
      )}
    </div>
  );
}

// 新版本更新提示
function UpdatePrompt() {
  const [showUpdate, setShowUpdate] = React.useState(false);

  React.useEffect(() => {
    const handleUpdate = () => {
      setShowUpdate(true);
    };
    window.addEventListener('pwa-update-available', handleUpdate);
    return () => window.removeEventListener('pwa-update-available', handleUpdate);
  }, []);

  const handleUpdate = () => {
    if (window.__swRegistration?.waiting) {
      window.__swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
    window.location.reload();
  };

  if (!showUpdate) return null;

  return (
    <div className="pwa-update-prompt">
      <div className="pwa-update-text">
        <strong>发现新版本</strong>
        <span>点击刷新以更新到最新版本</span>
      </div>
      <button className="pwa-update-btn" onClick={handleUpdate}>
        立即刷新
      </button>
    </div>
  );
}

window.InstallPrompt = InstallPrompt;
window.OfflineIndicator = OfflineIndicator;
window.UpdatePrompt = UpdatePrompt;
