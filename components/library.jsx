// 茶叶图鉴组件
function TeaLibrary({ onBack }) {
  const teaData = window.TEA_DATA;
  const teaIds = ['green', 'white', 'yellow', 'oolong', 'red', 'dark'];
  const [selectedTea, setSelectedTea] = React.useState('green');
  
  const tea = teaData[selectedTea];
  
  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
        <button className="btn btn-ghost btn-sm" onClick={onBack}>
          ← 返回
        </button>
        <h2 style={{ fontFamily: 'Noto Serif SC', fontSize: 'var(--fs-xl)' }}>茶叶图鉴</h2>
      </div>
      
      <div className="library-header">
        <h2 className="library-title">六大茶类百科</h2>
        <p className="library-desc">点击下方茶类，查看完整工艺知识与品饮指南</p>
      </div>
      
      <div className="library-tabs">
        {teaIds.map(id => (
          <button
            key={id}
            className={`library-tab ${selectedTea === id ? 'active' : ''}`}
            onClick={() => setSelectedTea(id)}
            style={selectedTea === id ? { '--tea-color': teaData[id].color } : {}}
          >
            {teaData[id].name}
          </button>
        ))}
      </div>
      
      <div className="library-detail" style={{ '--tea-color': tea.color, '--tea-color-light': tea.colorLight }}>
        <div className="library-hero">
          <div className="library-hero-content">
            <div className="library-hero-name">{tea.name}</div>
            <div className="library-hero-ferment">{tea.ferment} · 发酵度约 {tea.fermentLevel}%</div>
            <div className="library-hero-tagline">「{tea.tagline}」</div>
          </div>
        </div>
        
        <div className="library-body">
          <div className="library-section">
            <div className="library-section-title">茶类简介</div>
            <p style={{ color: 'var(--text-ink-light)', lineHeight: 1.8 }}>{tea.description}</p>
          </div>
          
          <div className="library-section">
            <div className="library-section-title">初加工工艺流程</div>
            <div className="library-process-flow">
              {tea.steps.map((step, idx) => (
                <React.Fragment key={step.id}>
                  <div className={`library-process-step ${step.isCore ? 'core' : ''}`}>
                    {step.isCore && '★ '}{step.name}
                  </div>
                  {idx < tea.steps.length - 1 && (
                    <span className="library-process-arrow">→</span>
                  )}
                </React.Fragment>
              ))}
            </div>
            <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-ink-muted)', marginTop: 8 }}>
              ★ 标记为该茶类的核心工序
            </p>
          </div>
          
          <div className="library-section">
            <div className="library-section-title">采摘标准</div>
            <div style={{ 
              background: 'rgba(46, 125, 91, 0.08)',
              padding: '16px 20px',
              borderRadius: 'var(--radius-md)',
              borderLeft: '3px solid var(--accent-jade)',
              color: 'var(--text-ink-light)',
              lineHeight: 1.8
            }}>
              <strong style={{ color: 'var(--accent-jade)' }}>
                {getPickingName(tea.idealPicking)}
              </strong>：{tea.id === 'oolong' ? '乌龙茶讲究「开面采」，须待新梢成熟、顶叶展开，内含物丰富，利于做青形成花果香。' : tea.id === 'dark' ? '黑茶用较成熟的原料，粗老叶片内含物丰富，为渥堆后发酵提供充足物质基础。' : tea.id === 'white' ? '白茶按等级采摘不同嫩度：银针采单芽、牡丹采一芽一二叶、寿眉采较成熟梢。以白牡丹级一芽一二叶为基准最经典。' : tea.id === 'yellow' ? '黄茶采摘细嫩，多采一芽一叶至一芽二叶，君山银针等黄芽茶则全采单芽。' : tea.id === 'green' ? '绿茶贵在鲜嫩，名优绿茶多在清明前后采摘，明前茶最为珍贵细嫩。' : tea.id === 'red' ? '红茶采一芽二三叶为宜，过嫩滋味淡薄，过老茶汤粗涩。' : ''}
            </div>
          </div>
          
          <div className="library-section">
            <div className="library-section-title">核心工序：{tea.coreProcess}</div>
            {(() => {
              const coreStep = tea.steps.find(s => s.isCore);
              if (!coreStep) return null;
              return (
                <div style={{ 
                  background: 'rgba(194, 59, 34, 0.05)', 
                  padding: '16px 20px', 
                  borderRadius: 'var(--radius-md)',
                  borderLeft: '3px solid var(--accent-cinnabar)',
                  color: 'var(--text-ink-light)',
                  lineHeight: 1.8
                }}>
                  {coreStep.description}
                </div>
              );
            })()}
          </div>
          
          <div className="library-section">
            <div className="library-section-title">品质特征</div>
            <div className="library-info-grid">
              <div className="library-info-item">
                <div className="library-info-label">外形</div>
                <div className="library-info-value">{tea.appearance}</div>
              </div>
              <div className="library-info-item">
                <div className="library-info-label">汤色</div>
                <div className="library-info-value">{tea.soupColor}</div>
              </div>
              <div className="library-info-item">
                <div className="library-info-label">滋味</div>
                <div className="library-info-value">{tea.taste}</div>
              </div>
              <div className="library-info-item">
                <div className="library-info-label">香气</div>
                <div className="library-info-value">{tea.aroma || '清香纯正'}</div>
              </div>
              <div className="library-info-item">
                <div className="library-info-label">叶底</div>
                <div className="library-info-value">{tea.leafBase || '嫩匀明亮'}</div>
              </div>
              <div className="library-info-item">
                <div className="library-info-label">发酵程度</div>
                <div className="library-info-value">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ flex: 1, height: 6, background: 'var(--bg-rice-deep)', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ width: `${tea.fermentLevel}%`, height: '100%', background: tea.color, borderRadius: 3 }}></div>
                    </div>
                    <span>{tea.fermentLevel}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="library-section">
            <div className="library-section-title">代表名茶</div>
            <div className="library-tea-list">
              {tea.representative.map((t, i) => (
                <div key={i} className="tea-rep-card">
                  <div className="tea-rep-name">{t.name}</div>
                  <div className="tea-rep-origin">{t.origin}</div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="library-section">
            <div className="library-section-title">品饮小贴士</div>
            <div className="library-tips">
              <strong>💡 小贴士：</strong>{tea.tips}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

window.TeaLibrary = TeaLibrary;

function getPickingName(pickingId) {
  const map = {
    single_bud: '单芽',
    one_bud_one_leaf: '一芽一叶初展',
    one_bud_two_leaves: '一芽二三叶',
    kai_mian: '开面采（一芽三四叶）',
    one_bud_four_leaves: '一芽四五叶',
    coarse: '粗老原料'
  };
  return map[pickingId] || pickingId;
}
