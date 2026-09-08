// 茶叶图鉴组件 v3（七大茶类 + 名优茶工艺知识库 + 搜索 + 收藏）
const TEA_CAT_NAMES = {
  green: '绿茶', white: '白茶', yellow: '黄茶', oolong: '青茶（乌龙）',
  red: '红茶', dark: '黑茶', reprocessed: '再加工茶'
};

function TeaLibrary({ onBack }) {
  const teaData = window.TEA_DATA || {};
  const teaIds = (window.TeaDataLayer && window.TeaDataLayer.TEA_IDS) || Object.keys(teaData);
  const [selectedTea, setSelectedTea] = React.useState(teaIds[0] || 'green');
  const [expandedFamous, setExpandedFamous] = React.useState(null);
  const [query, setQuery] = React.useState('');
  const [favs, setFavs] = React.useState(() => {
    try { return JSON.parse(localStorage.getItem('tea_favs') || '[]'); }
    catch (e) { return []; }
  });
  const [showFavsOnly, setShowFavsOnly] = React.useState(false);

  const tea = teaData[selectedTea] || {};
  const famousTeas = (tea.famousTeas && tea.famousTeas.length) ? tea.famousTeas : [];
  const repList = famousTeas.length
    ? famousTeas.map(t => ({ name: t.name, origin: t.origin || '', id: t.id }))
    : ((tea.representative || []).map((t, i) => ({ name: t.name, origin: t.origin || '', id: 'rep' + i })));

  const allFamous = (window.TeaDataLayer && window.TeaDataLayer.getFamousTeas)
    ? window.TeaDataLayer.getFamousTeas()
    : (window.FAMOUS_TEAS || []);

  // ---- 收藏操作 ----
  const toggleFav = (fid, e) => {
    if (e) e.stopPropagation();
    let next;
    if (favs.includes(fid)) next = favs.filter(x => x !== fid);
    else next = [...favs, fid];
    setFavs(next);
    try { localStorage.setItem('tea_favs', JSON.stringify(next)); } catch (err) {}
  };

  const isFav = (fid) => favs.includes(fid);

  // ---- 搜索过滤 ----
  const q = query.trim().toLowerCase();
  const searchResults = q
    ? allFamous.filter(f => {
        const hay = [f.name, TEA_CAT_NAMES[f.category] || '', f.origin, f.picking, f.craftChain, (f.quality || ''), (f.standards || []).join(' ')]
          .join(' ').toLowerCase();
        return hay.includes(q);
      })
    : [];
  const searching = q.length > 0;

  // 当前类名优茶：收藏优先 + 只看收藏过滤
  let listTeas = famousTeas.slice();
  if (showFavsOnly) listTeas = listTeas.filter(t => isFav(t.id));
  const favInList = listTeas.filter(t => isFav(t.id));
  const otherInList = listTeas.filter(t => !isFav(t.id));

  // ---- 渲染名优茶详情卡 ----
  const renderFamousDetail = (ft) => {
    if (!ft) return null;
    return (
      <div style={{
        marginTop: 16, padding: '18px 20px', background: 'var(--bg-rice)',
        border: '1px solid rgba(46, 125, 91, 0.25)', borderRadius: 'var(--radius-md)'
      }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 10, flexWrap: 'wrap' }}>
          <span style={{ fontFamily: 'Noto Serif SC', fontWeight: 700, fontSize: 'var(--fs-md)', color: 'var(--text-ink)' }}>
            {isFav(ft.id) && <span style={{ color: 'var(--accent-gold)' }}>★ </span>}{ft.name}
          </span>
          <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-ink-muted)' }}>{ft.origin}</span>
        </div>

        {ft.picking && (
          <div style={{ marginBottom: 10, fontSize: 'var(--fs-sm)', lineHeight: 1.8, color: 'var(--text-ink-light)' }}>
            <strong style={{ color: 'var(--accent-jade)' }}>采摘/原料：</strong>{ft.picking}
          </div>
        )}

        {ft.craftChain && (
          <div style={{ marginBottom: 10, fontSize: 'var(--fs-sm)', lineHeight: 1.8, color: 'var(--text-ink-light)' }}>
            <strong style={{ color: 'var(--accent-cinnabar)' }}>完整工艺链：</strong>
            <span>{ft.craftChain}</span>
          </div>
        )}

        {ft.params && ft.params.length > 0 && (
          <div style={{ marginBottom: 10 }}>
            <strong style={{ fontSize: 'var(--fs-sm)', color: 'var(--accent-jade)' }}>关键参数（{ft.params.length} 项）：</strong>
            <div style={{ maxHeight: 260, overflowY: 'auto', marginTop: 6, border: '1px solid rgba(46,125,91,0.15)', borderRadius: 8 }}>
              {ft.params.map((p, pi) => {
                const parts = p.split(' | ');
                return (
                  <div key={pi} style={{ padding: '7px 12px', borderBottom: '1px solid rgba(46,125,91,0.1)', fontSize: 'var(--fs-xs)', lineHeight: 1.7 }}>
                    <span style={{ color: 'var(--text-ink)', fontWeight: 600 }}>{parts[0] || ''}</span>
                    {parts[1] ? <span style={{ color: 'var(--text-ink-light)' }}>：{parts[1]}</span> : null}
                    {parts[2] ? <div style={{ color: 'var(--text-ink-muted)', marginTop: 2 }}>〔{parts[2]}〕</div> : null}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {ft.quality && (
          <div style={{ marginBottom: 10, fontSize: 'var(--fs-sm)', lineHeight: 1.8, color: 'var(--text-ink-light)' }}>
            <strong style={{ color: 'var(--accent-gold)' }}>品质风格：</strong>{ft.quality}
          </div>
        )}

        {ft.standards && ft.standards.length > 0 && (
          <div style={{ fontSize: 'var(--fs-xs)', lineHeight: 1.7, color: 'var(--text-ink-muted)' }}>
            <strong>标准依据：</strong>
            {ft.standards.map((s, si) => (
              <div key={si} style={{ marginTop: 2 }}>· {s}</div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // ---- 渲染名优茶卡片行 ----
  const renderTeaCard = (t, withFav, keyPrefix) => (
    <div
      key={keyPrefix + t.id}
      className="tea-rep-card"
      style={{ cursor: 'pointer', position: 'relative', border: isFav(t.id) ? '1px solid rgba(184,134,11,0.6)' : undefined }}
      onClick={() => setExpandedFamous(expandedFamous === t.id ? null : t.id)}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="tea-rep-name">
            {isFav(t.id) && <span style={{ color: 'var(--accent-gold)' }}>★ </span>}{t.name}
          </div>
          <div className="tea-rep-origin">{t.origin || ''}</div>
        </div>
        {withFav && (
          <div
            onClick={(e) => toggleFav(t.id, e)}
            title={isFav(t.id) ? '取消收藏' : '收藏'}
            style={{
              flex: '0 0 auto', fontSize: 18, lineHeight: 1, cursor: 'pointer', padding: 4,
              color: isFav(t.id) ? 'var(--accent-gold)' : 'rgba(0,0,0,0.25)',
              background: 'rgba(184,134,11,0.08)', borderRadius: 8
            }}
          >
            {isFav(t.id) ? '★' : '☆'}
          </div>
        )}
      </div>
      <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--accent-jade)', marginTop: 4 }}>
        {expandedFamous === t.id ? '▲ 收起' : '▼ 查看工艺'}
      </div>
    </div>
  );

  const pickingNote = {
    green: '绿茶贵在鲜嫩，名优绿茶多在清明前后采摘，明前茶最为珍贵细嫩。',
    white: '白茶按等级采摘不同嫩度：银针采单芽、牡丹采一芽一二叶、寿眉采较成熟梢。以白牡丹级一芽一二叶为基准最经典。',
    yellow: '黄茶采摘细嫩，多采一芽一叶至一芽二叶，君山银针等黄芽茶则全采单芽。',
    oolong: '乌龙茶讲究「开面采」，须待新梢成熟、顶叶展开，内含物丰富，利于做青形成花果香。',
    red: '红茶采一芽二三叶为宜，过嫩滋味淡薄，过老茶汤粗涩。',
    dark: '黑茶用较成熟的原料，粗老叶片内含物丰富，为渥堆后发酵提供充足物质基础。',
    reprocessed: '再加工茶以合格茶坯为原料（多为烘青绿茶坯等），茶坯等级决定基础品质，窨制/压制次数决定再加工品质。'
  };

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
        <button className="btn btn-ghost btn-sm" onClick={onBack}>
          ← 返回
        </button>
        <h2 style={{ fontFamily: 'Noto Serif SC', fontSize: 'var(--fs-xl)' }}>茶叶图鉴</h2>
      </div>
      
      <div className="library-header">
        <h2 className="library-title">七大茶类百科</h2>
        <p className="library-desc">点击下方茶类，查看完整工艺知识与名优茶参数库（GB/T 30766-2014 分类口径）</p>
      </div>

      {/* 搜索框 + 收藏筛选 */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: '1 1 240px', position: 'relative', minWidth: 200 }}>
          <input
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setExpandedFamous(null); }}
            placeholder="🔍 搜索名优茶 / 茶类 / 产地 / 工序 / 标准号…"
            style={{
              width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)',
              border: '1px solid rgba(46,125,91,0.3)', background: 'var(--bg-rice)',
              fontSize: 'var(--fs-sm)', color: 'var(--text-ink)', outline: 'none'
            }}
          />
          {query && (
            <span
              onClick={() => setQuery('')}
              style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: 'var(--text-ink-muted)' }}
            >✕</span>
          )}
        </div>
        <button
          className={`btn btn-sm ${showFavsOnly ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => { setShowFavsOnly(!showFavsOnly); setExpandedFamous(null); }}
          style={{ flex: '0 0 auto' }}
        >
          {showFavsOnly ? '★ 已收藏' : '☆ 只看收藏'}（{favs.length}）
        </button>
      </div>

      {searching ? (
        /* ===== 搜索结果模式（跨茶类） ===== */
        <div className="library-detail" style={{ '--tea-color': tea.color, '--tea-color-light': tea.colorLight }}>
          <div className="library-body">
            <div className="library-section">
              <div className="library-section-title">
                搜索“{query}” · 找到 {searchResults.length} 款名优茶
              </div>
              {searchResults.length === 0 ? (
                <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--text-ink-muted)' }}>
                  未找到匹配的名优茶，换个关键词试试（如：龙井、单丛、蒙顶…）
                </div>
              ) : (
                <div className="library-tea-list">
                  {searchResults.map(t => (
                    <React.Fragment key={'sr-' + t.id}>
                      {renderTeaCard(t, true, 'sr-')}
                      {expandedFamous === t.id && renderFamousDetail(t)}
                    </React.Fragment>
                  ))}
                </div>
              )}
              {expandedFamous && searchResults.find(t => t.id === expandedFamous) && null}
            </div>
          </div>
        </div>
      ) : (
      /* ===== 正常茶类浏览模式 ===== */
      <div className="library-tabs">
        {teaIds.map(id => (
          <button
            key={id}
            className={`library-tab ${selectedTea === id ? 'active' : ''}`}
            onClick={() => { setSelectedTea(id); setExpandedFamous(null); }}
            style={selectedTea === id && teaData[id] ? { '--tea-color': teaData[id].color } : {}}
          >
            {(teaData[id] || {}).name || id}
          </button>
        ))}
      </div>
      )}

      {!searching && tea.id && (
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
              </strong>：{pickingNote[tea.id] || tea.idealPicking}
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
            <div className="library-section-title">
              {famousTeas.length ? `名优茶工艺知识库（${famousTeas.length} 款 · 权威检索）` : '代表名茶'}
            </div>
            <div className="library-tea-list">
              {/* 收藏项置顶 */}
              {favInList.map(t => renderTeaCard(t, true, 'fav-'))}
              {otherInList.map(t => renderTeaCard(t, true, 'oth-'))}
              {listTeas.length === 0 && (
                <div style={{ padding: '16px 0', color: 'var(--text-ink-muted)', fontSize: 'var(--fs-sm)' }}>
                  暂无收藏的名优茶，点击卡片右上角 ☆ 收藏。
                </div>
              )}
            </div>

            {expandedFamous && renderFamousDetail(famousTeas.find(x => x.id === expandedFamous) || null)}
          </div>
          
          <div className="library-section">
            <div className="library-section-title">品饮小贴士</div>
            <div className="library-tips">
              <strong>💡 小贴士：</strong>{tea.tips}
            </div>
          </div>
        </div>
      </div>
      )}
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
