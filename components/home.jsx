// 首页组件
function HomePage({ onNavigate, progress }) {
  const teaData = window.TEA_DATA;
  const teaIds = (window.TeaDataLayer && window.TeaDataLayer.TEA_IDS) || Object.keys(teaData);
  
  const features = [
    {
      key: 'craft',
      icon: '🫖',
      title: '工艺模拟',
      desc: '亲自动手模拟制茶全过程，调节温度、时间，观察茶叶变化',
      color: 'var(--accent-cinnabar)'
    },
    {
      key: 'quiz',
      icon: '📝',
      title: '知识问答',
      desc: '随机出题检验学习成果，即时反馈与详细解析帮你巩固记忆',
      color: 'var(--accent-jade)'
    },
    {
      key: 'library',
      icon: '📖',
      title: '茶叶图鉴',
      desc: '七大茶类完整资料卡：工艺、名优茶参数、品质特征、品饮建议',
      color: 'var(--accent-gold)'
    },
    {
      key: 'achievements',
      icon: '🏅',
      title: '成就系统',
      desc: '追踪制茶进度，收集成就徽章，成为真正的制茶宗师',
      color: 'var(--bamboo)'
    }
  ];
  
  return (
    <div className="home-page">
      <div className="home-hero">
        <h1 className="home-title">六大茶类</h1>
        <p className="home-subtitle">初加工工艺模拟互动系统</p>
        <p className="home-tagline">在动手操作中，记住每一类茶的工艺与精髓</p>
        
        <div className="tea-grid">
          {teaIds.map(id => {
            const tea = teaData[id];
            const bestScore = progress.teaProgress[id] || 0;
            return (
              <div
                key={id}
                className="tea-card"
                style={{ '--tea-color': tea.color }}
                onClick={() => onNavigate('craft', { teaId: id })}
              >
                <div className="tea-icon-wrap">{tea.nameShort}</div>
                <div className="tea-name">{tea.name}</div>
                <div className="tea-ferment">{tea.ferment}</div>
                <div className="tea-steps-count">{tea.steps.length}道工序</div>
                {bestScore > 0 && (
                  <div style={{ marginTop: 8, fontSize: 'var(--fs-xs)', color: 'var(--accent-gold)' }}>
                    最佳：{bestScore >= 95 ? '特级' : bestScore >= 80 ? '一级' : bestScore >= 60 ? '二级' : '待提高'}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="feature-grid">
        {features.map(f => (
          <div
            key={f.key}
            className="feature-card"
            onClick={() => onNavigate(f.key)}
          >
            <div className="feature-icon" style={{ background: f.color + '20', color: f.color }}>
              {f.icon}
            </div>
            <div className="feature-title">{f.title}</div>
            <div className="feature-desc">{f.desc}</div>
          </div>
        ))}
      </div>
      
      <div style={{ textAlign: 'center', marginTop: 48, padding: '24px', background: 'var(--bg-paper)', borderRadius: 'var(--radius-lg)' }}>
        <h3 style={{ marginBottom: 12 }}>制茶进度总览</h3>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 32, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: 'var(--fs-2xl)', fontWeight: 700, color: 'var(--accent-cinnabar)', fontFamily: 'Noto Serif SC' }}>
              {progress.totalBrews || 0}
            </div>
            <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-ink-muted)' }}>累计制茶次数</div>
          </div>
          <div>
            <div style={{ fontSize: 'var(--fs-2xl)', fontWeight: 700, color: 'var(--accent-jade)', fontFamily: 'Noto Serif SC' }}>
              {progress.quizCorrect || 0}
            </div>
            <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-ink-muted)' }}>答对题目数</div>
          </div>
          <div>
            <div style={{ fontSize: 'var(--fs-2xl)', fontWeight: 700, color: 'var(--accent-gold)', fontFamily: 'Noto Serif SC' }}>
              {progress.unlockedBadges ? progress.unlockedBadges.length : 0}
            </div>
            <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-ink-muted)' }}>已获成就</div>
          </div>
        </div>
      </div>
    </div>
  );
}

window.HomePage = HomePage;
