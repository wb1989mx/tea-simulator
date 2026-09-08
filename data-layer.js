// ============================================================
// 数据防御层 & 共享工具
// 所有模块统一从此处读取数据，字段缺失时返回安全默认值
// ============================================================

// ---- 安全读取工具 ----
function safeGet(obj, path, defaultValue) {
  if (obj == null) return defaultValue;
  const keys = path.split('.');
  let cur = obj;
  for (let i = 0; i < keys.length; i++) {
    if (cur == null) return defaultValue;
    cur = cur[keys[i]];
  }
  return cur === undefined ? defaultValue : cur;
}

function safeArr(val, fallback) {
  return Array.isArray(val) ? val : (fallback || []);
}

function safeObj(val, fallback) {
  return (val && typeof val === 'object' && !Array.isArray(val)) ? val : (fallback || {});
}

// ---- 七大茶类 ID 常量（GB/T 30766-2014 口径，含再加工茶）----
const TEA_IDS = ['green', 'white', 'yellow', 'oolong', 'red', 'dark', 'reprocessed'];

// ---- 茶叶数据安全访问 ----
function getTea(id) {
  return safeObj(window.TEA_DATA ? window.TEA_DATA[id] : null, {
    id: id || 'unknown',
    name: '未知茶类',
    nameShort: '?',
    ferment: '未知',
    fermentLevel: 0,
    color: '#888',
    colorLight: '#aaa',
    tagline: '',
    description: '',
    coreProcess: '',
    idealPicking: '',
    pickingTenderRange: [0, 5],
    suitableShaiqingMethods: [],
    bestShaiqingMethod: null,
    suitableGanzaoMethods: [],
    bestGanzaoMethod: null,
    steps: [],
    appearance: '',
    soupColor: '',
    taste: '',
    aroma: '',
    leafBase: '',
    representative: [],
    famousTeas: [],
    tips: ''
  });
}

// ---- 名优茶数据安全访问（升级数据层 v2）----
function getFamousTeas() {
  return safeArr(window.FAMOUS_TEAS, []);
}

function getFamousTeaById(id) {
  return getFamousTeas().find(t => t.id === id) || null;
}

function getFamousTeasByCategory(catId) {
  return getFamousTeas().filter(t => t.category === catId);
}

function getAllTeas() {
  const result = {};
  TEA_IDS.forEach(id => { result[id] = getTea(id); });
  return result;
}

// ---- 采摘标准安全访问 ----
function getPickingStandards() {
  return safeArr(window.PICKING_STANDARDS, [
    { id: 'one_bud_two_leaves', name: '一芽二三叶', tenderLevel: 2, desc: '' }
  ]);
}

function getPickingById(id) {
  return getPickingStandards().find(p => p.id === id) || null;
}

function getPickingName(id) {
  const p = getPickingById(id);
  return p ? p.name : (id || '');
}

// ---- 杀青/干燥方式安全访问 ----
function getShaqingMethods() {
  return safeObj(window.SHAQING_METHODS, {});
}

function getGanzaoMethods() {
  return safeObj(window.GANZAO_METHODS, {});
}

function getShaqingMethod(id) {
  return safeObj(getShaqingMethods()[id], null);
}

function getGanzaoMethod(id) {
  return safeObj(getGanzaoMethods()[id], null);
}

// ---- 工序参数调整 ----
function safeCalcStepAdjustments(tenderDelta) {
  if (typeof window.calcStepAdjustments === 'function') {
    try {
      return window.calcStepAdjustments(tenderDelta);
    } catch (e) {
      console.warn('calcStepAdjustments 报错，使用默认值', e);
    }
  }
  return {
    weidiao: { timeScale: 1, tempScale: 1 },
    shaqing: { tempScale: 1, timeScale: 1 },
    rounian: { timeScale: 1 },
    menhuang: { timeScale: 1 },
    zuoqing: { countScale: 1 },
    fajiao: { timeScale: 1 },
    wodui: { timeScale: 1, tempScale: 1 },
    ganzao: { tempScale: 1, timeScale: 1 }
  };
}

// ---- 题目库 ----
function getQuizQuestions() {
  return safeArr(window.QUIZ_QUESTIONS, []);
}

// ---- 成就库 ----
function getAchievements() {
  return safeArr(window.ACHIEVEMENTS, []);
}

// ---- 茶叶初始状态（基于茶类） ----
function getInitialTeaState(teaId) {
  const tea = getTea(teaId);
  const base = {
    leafColor: tea.colorLight || '#7BA05B',
    leafColorLight: tea.color || '#9DBD7A',
    soupColor: '#E8E0D0',
    oxidation: 0,
    dryness: 0,
    shape: 0,
    aroma: 50,
    tenderness: 50
  };
  if (teaId === 'white') {
    base.leafColor = '#E8E0D0';
    base.leafColorLight = '#F5EFE0';
  }
  if (teaId === 'red') {
    base.oxidation = 0;
  }
  return base;
}

// ---- 等级判定 ----
function getGradeInfo(score) {
  if (score >= 95) return { key: 'super', name: '特级', color: 'var(--accent-gold)' };
  if (score >= 80) return { key: 'first', name: '一级', color: 'var(--accent-jade)' };
  if (score >= 60) return { key: 'second', name: '二级', color: 'var(--bamboo)' };
  return { key: 'fail', name: '未达标', color: 'var(--accent-cinnabar)' };
}

// ---- 进度存储 ----
const PROGRESS_KEY = 'tea_sim_progress';

function loadProgress() {
  try {
    const saved = localStorage.getItem(PROGRESS_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.warn('读取进度失败', e);
  }
  return {
    totalBrews: 0,
    quizCorrect: 0,
    teaProgress: {},
    teaBrewCount: {},
    unlockedBadges: []
  };
}

function saveProgress(progress) {
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
    return true;
  } catch (e) {
    console.warn('保存进度失败', e);
    return false;
  }
}

// ---- 成就检查 ----
function checkAchievements(progress) {
  const achievements = getAchievements();
  const unlocked = safeArr(progress.unlockedBadges, []);
  const newly = [];
  achievements.forEach(ach => {
    if (!unlocked.includes(ach.id)) {
      try {
        if (typeof ach.condition === 'function' && ach.condition(progress)) {
          newly.push(ach.id);
        }
      } catch (e) {
        console.warn('成就条件判定失败', ach.id, e);
      }
    }
  });
  if (newly.length > 0) {
    progress.unlockedBadges = [...unlocked, ...newly];
  }
  return progress;
}

// ---- 全局导出 ----
window.TeaDataLayer = {
  TEA_IDS,
  getTea,
  getAllTeas,
  getPickingStandards,
  getPickingById,
  getPickingName,
  getShaqingMethods,
  getGanzaoMethods,
  getShaqingMethod,
  getGanzaoMethod,
  safeCalcStepAdjustments,
  getQuizQuestions,
  getAchievements,
  getFamousTeas,
  getFamousTeaById,
  getFamousTeasByCategory,
  getInitialTeaState,
  getGradeInfo,
  loadProgress,
  saveProgress,
  checkAchievements,
  safeGet,
  safeArr,
  safeObj
};
