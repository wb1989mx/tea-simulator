// ============================================================
// 主应用：模块化错误隔离架构
// 每个模块独立渲染，单模块报错不影响其它模块和导航
// ============================================================

// ---- React 错误边界（仅 class 组件可做） ----
class ModuleErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error: error };
  }

  componentDidCatch(error, errorInfo) {
    console.error(`[模块错误] ${this.props.moduleName || '未知模块'}:`, error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="module-error-fallback">
          <div className="error-icon">⚠</div>
          <div className="error-title">{this.props.moduleName || '模块'} 加载失败</div>
          <div className="error-desc">
            该模块出现了意外错误，但不影响其它功能使用。
          </div>
          {this.state.error && (
            <div className="error-detail">
              {this.state.error.message || String(this.state.error)}
            </div>
          )}
          <div style={{ display: 'flex', gap: 12, marginTop: 16, justifyContent: 'center' }}>
            <button className="btn btn-secondary btn-sm" onClick={this.props.onBack || this.handleRetry}>
              返回首页
            </button>
            <button className="btn btn-primary btn-sm" onClick={this.handleRetry}>
              重试
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// ---- 模块包装器：每个模块独立错误边界 ----
function ModuleShell({ name, children }) {
  return (
    <ModuleErrorBoundary moduleName={name}>
      {children}
    </ModuleErrorBoundary>
  );
}

// ---- 主应用 ----
function App() {
  const dl = window.TeaDataLayer;
  const [currentPage, setCurrentPage] = React.useState('home');
  const [pageParams, setPageParams] = React.useState({});
  const [showOnboarding, setShowOnboarding] = React.useState(false);
  const [progress, setProgress] = React.useState(dl.loadProgress());

  // 首次进入显示引导 + URL 参数初始页
  React.useEffect(() => {
    const saved = localStorage.getItem('tea_sim_progress');
    if (!saved) {
      setShowOnboarding(true);
    }
    
    // 支持 ?page=craft&teaId=green 这样的 URL 跳转（用于 manifest shortcuts）
    const params = new URLSearchParams(window.location.search);
    const page = params.get('page');
    if (page && ['home', 'craft', 'quiz', 'library', 'achievements'].includes(page)) {
      setCurrentPage(page);
      const teaId = params.get('teaId');
      if (teaId) {
        setPageParams({ teaId });
      }
    }
  }, []);

  // 保存进度
  const updateProgress = React.useCallback((updater) => {
    setProgress(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      dl.saveProgress(next);
      return next;
    });
  }, []);

  // 导航
  const navigate = React.useCallback((page, params) => {
    setCurrentPage(page);
    setPageParams(params || {});
    // 滚动到顶部
    try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch (e) {}
  }, []);

  const goHome = React.useCallback(() => {
    setCurrentPage('home');
    setPageParams({});
  }, []);

  // 制茶完成回调
  const handleBrewComplete = React.useCallback((teaId, score, grade) => {
    updateProgress(prev => {
      const next = { ...prev };
      next.totalBrews = (next.totalBrews || 0) + 1;
      next.teaBrewCount = { ...(next.teaBrewCount || {}) };
      next.teaBrewCount[teaId] = (next.teaBrewCount[teaId] || 0) + 1;
      next.teaProgress = { ...(next.teaProgress || {}) };
      next.teaProgress[teaId] = Math.max(next.teaProgress[teaId] || 0, score);
      return dl.checkAchievements(next);
    });
  }, [updateProgress]);

  // 答题正确回调
  const handleQuizCorrect = React.useCallback(() => {
    updateProgress(prev => {
      const next = { ...prev };
      next.quizCorrect = (next.quizCorrect || 0) + 1;
      return dl.checkAchievements(next);
    });
  }, [updateProgress]);

  // 关闭引导
  const handleOnboardingClose = React.useCallback(() => {
    setShowOnboarding(false);
    // 确保进度已保存（标记已访问）
    if (!localStorage.getItem('tea_sim_progress')) {
      dl.saveProgress(progress);
    }
  }, [progress]);

  // 导航项
  const navItems = [
    { key: 'home', label: '首页' },
    { key: 'craft', label: '工艺模拟' },
    { key: 'quiz', label: '知识问答' },
    { key: 'library', label: '茶叶图鉴' },
    { key: 'achievements', label: '成就中心' }
  ];

  // 渲染当前页面（每个页面独立错误边界）
  const renderPage = () => {
    switch (currentPage) {
      case 'craft':
        return (
          <ModuleShell name="工艺模拟">
            <CraftSimulator
              key={`craft-${pageParams.teaId || 'select'}`}
              initialTeaId={pageParams.teaId}
              onBack={goHome}
              onComplete={handleBrewComplete}
              progress={progress}
            />
          </ModuleShell>
        );
      case 'quiz':
        return (
          <ModuleShell name="知识问答">
            <Quiz onBack={goHome} onAnswered={handleQuizCorrect} />
          </ModuleShell>
        );
      case 'library':
        return (
          <ModuleShell name="茶叶图鉴">
            <TeaLibrary onBack={goHome} />
          </ModuleShell>
        );
      case 'achievements':
        return (
          <ModuleShell name="成就系统">
            <Achievements onBack={goHome} progress={progress} />
          </ModuleShell>
        );
      default:
        return (
          <ModuleShell name="首页">
            <HomePage onNavigate={navigate} progress={progress} />
          </ModuleShell>
        );
    }
  };

  const isStandalone = window.PWAUtils?.isStandalone?.();

  // 移动端底部导航数据（带图标）
  const mobileNavItems = [
    { key: 'home', label: '首页', icon: 'home' },
    { key: 'craft', label: '制茶', icon: 'craft' },
    { key: 'quiz', label: '答题', icon: 'quiz' },
    { key: 'library', label: '图鉴', icon: 'book' },
    { key: 'achievements', label: '成就', icon: 'medal' }
  ];

  const renderNavIcon = (iconKey) => {
    const icons = {
      home: (<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>),
      craft: (<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4z"/><line x1="6" y1="2" x2="6" y2="4"/><line x1="10" y1="2" x2="10" y2="4"/><line x1="14" y1="2" x2="14" y2="4"/></svg>),
      quiz: (<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>),
      book: (<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>),
      medal: (<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>)
    };
    return icons[iconKey] || icons.home;
  };

  return (
    <div className={`app-container ${isStandalone ? 'is-standalone' : ''}`}>
      {/* 离线/在线状态提示 */}
      <OfflineIndicator />
      
      {/* 新版本更新提示 */}
      <UpdatePrompt />
      
      {/* 安装引导 */}
      <InstallPrompt />

      {/* 顶部导航：始终可用，不受任何模块错误影响 */}
      <header className="app-header">
        <div className="header-inner">
          <div className="logo" onClick={goHome}>
            <div className="logo-icon">茶</div>
            <div className="logo-text">制茶模拟器</div>
          </div>
          
          <nav className="header-nav desktop-nav">
            {navItems.map(item => (
              <button
                key={item.key}
                className={`nav-item ${currentPage === item.key ? 'active' : ''}`}
                onClick={() => navigate(item.key)}
              >
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </header>
      
      <main className="main-content">
        {renderPage()}
      </main>
      
      <footer className="app-footer">
        六大茶类初加工工艺模拟系统 · 寓教于乐，品味茶香
      </footer>
      
      {/* 移动端底部导航 */}
      <nav className="mobile-tab-nav">
        {mobileNavItems.map(item => (
          <button
            key={item.key}
            className={`mobile-tab-item ${currentPage === item.key ? 'active' : ''}`}
            onClick={() => navigate(item.key)}
          >
            {renderNavIcon(item.icon)}
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
      
      {showOnboarding && (
        <ModuleShell name="新手引导">
          <Onboarding onClose={handleOnboardingClose} />
        </ModuleShell>
      )}
    </div>
  );
}

// ---- 根渲染（带全局错误兜底） ----
try {
  const rootEl = document.getElementById('root');
  if (rootEl) {
    const root = ReactDOM.createRoot(rootEl);
    root.render(
      <ModuleErrorBoundary moduleName="应用">
        <App />
      </ModuleErrorBoundary>
    );
  }
} catch (e) {
  console.error('应用启动失败:', e);
  const rootEl = document.getElementById('root');
  if (rootEl) {
    rootEl.innerHTML = '<div style="padding:40px;text-align:center;color:#c23b22;font-family:sans-serif;"><h2>应用启动失败</h2><p>' + (e.message || e) + '</p><p>请刷新页面重试</p></div>';
  }
}

// 导出供其它模块使用（如需要）
window.ModuleErrorBoundary = ModuleErrorBoundary;
