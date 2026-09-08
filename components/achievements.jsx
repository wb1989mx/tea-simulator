// 成就系统组件
function Achievements({ onBack, progress }) {
  const teaData = window.TEA_DATA;
  const achievements = window.ACHIEVEMENTS;
  const teaIds = (window.TeaDataLayer && window.TeaDataLayer.TEA_IDS) || Object.keys(teaData);
  
  const getGradeLabel = (score) => {
    if (score >= 95) return '特级';
    if (score >= 80) return '一级';
    if (score >= 60) return '二级';
    if (score > 0) return '待提高';
    return '未尝试';
  };
  
  const getGradeColor = (score) => {
    if (score >= 95) return 'var(--accent-gold)';
    if (score >= 80) return 'var(--accent-jade)';
    if (score >= 60) return 'var(--bamboo)';
    return 'var(--text-ink-muted)';
  };
  
  const totalBrews = progress.totalBrews || 0;
  const quizCorrect = progress.quizCorrect || 0;
  const unlockedBadges = progress.unlockedBadges || [];
  const teaBrewCount = progress.teaBrewCount || {};
  
  const masteredCount = teaIds.filter(id => (progress.teaProgress?.[id] || 0) >= 95).length;
  
  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
        <button className="btn btn-ghost btn-sm" onClick={onBack}>
          ← 返回
        </button>
        <h2 style={{ fontFamily: 'Noto Serif SC', fontSize: 'var(--fs-xl)' }}>成就中心</h2>
      </div>
      
      <div className="achievement-header">
        <h2 className="achievement-title">制茶之路</h2>
        <p className="achievement-desc">记录你的每一次进步，集齐徽章，成为制茶宗师</p>
      </div>
      
      <div className="achievement-stats">
        <div className="achievement-stat-card">
          <div className="achievement-stat-num">{totalBrews}</div>
          <div className="achievement-stat-label">累计制茶次数</div>
        </div>
        <div className="achievement-stat-card">
          <div className="achievement-stat-num" style={{ color: 'var(--accent-jade)' }}>{masteredCount}/6</div>
          <div className="achievement-stat-label">特级茶类</div>
        </div>
        <div className="achievement-stat-card">
          <div className="achievement-stat-num" style={{ color: 'var(--accent-gold)' }}>{quizCorrect}</div>
          <div className="achievement-stat-label">答对题数</div>
        </div>
        <div className="achievement-stat-card">
          <div className="achievement-stat-num" style={{ color: 'var(--bamboo)' }}>
            {unlockedBadges.length}/{achievements.length}
          </div>
          <div className="achievement-stat-label">成就徽章</div>
        </div>
      </div>
      
      <div className="achievement-section-title">六大茶类进度</div>
      <div className="tea-progress-grid">
        {teaIds.map(id => {
          const tea = teaData[id];
          const bestScore = progress.teaProgress?.[id] || 0;
          const brewCount = teaBrewCount[id] || 0;
          
          return (
            <div 
              key={id} 
              className="tea-progress-card"
              style={{ '--tea-color': tea.color }}
            >
              <div className="tea-progress-header">
                <div className="tea-progress-icon" style={{ background: tea.color }}>
                  {tea.nameShort}
                </div>
                <div style={{ flex: 1 }}>
                  <div className="tea-progress-name">{tea.name}</div>
                  <div className="tea-progress-best">
                    最佳：<span style={{ color: getGradeColor(bestScore), fontWeight: 600 }}>
                      {getGradeLabel(bestScore)} {bestScore > 0 ? `${bestScore}分` : ''}
                    </span>
                  </div>
                </div>
              </div>
              <div className="progress-bar-container">
                <div 
                  className="progress-bar-fill" 
                  style={{ width: `${Math.min(100, bestScore)}%`, background: tea.color }}
                ></div>
              </div>
              <div className="progress-bar-label">
                <span>{brewCount} 次制作</span>
                <span>{bestScore}/100</span>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="achievement-section-title">成就徽章</div>
      <div className="badge-grid">
        {achievements.map(ach => {
          const isUnlocked = unlockedBadges.includes(ach.id);
          return (
            <div key={ach.id} className={`badge-card ${isUnlocked ? 'unlocked' : 'locked'}`}>
              <div className="badge-icon">{isUnlocked ? ach.icon : '🔒'}</div>
              <div className="badge-name">{ach.name}</div>
              <div className="badge-desc">{ach.desc}</div>
            </div>
          );
        })}
      </div>
      
      <div style={{ marginTop: 40, textAlign: 'center', padding: 24, background: 'var(--bg-paper)', borderRadius: 'var(--radius-lg)' }}>
        <div style={{ fontSize: 48, marginBottom: 8 }}>
          {masteredCount >= 6 ? '👑' : '🎯'}
        </div>
        <div style={{ fontFamily: 'Noto Serif SC', fontSize: 'var(--fs-lg)', fontWeight: 700, marginBottom: 8 }}>
          {masteredCount >= 6 ? '恭喜！你已成为制茶宗师' : `还差 ${6 - masteredCount} 种茶即可解锁「制茶宗师」称号`}
        </div>
        <div style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-ink-muted)' }}>
          每种茶达到特级（95分以上）即视为精通
        </div>
      </div>
    </div>
  );
}

window.Achievements = Achievements;
