// ============================================================
// 制茶模拟器组件
// 使用 TeaDataLayer 安全访问数据，字段缺失时不崩溃
// ============================================================

// ---- 环境前提背景（教学参考值） ----
// 每个环境含天气特征与对各工序的合理性影响；工序影响系数 >1 表示需延长/提高，
// <1 表示需缩短/降低；envNote 用于每工序显示的环境合理性说明。
const ENVIRONMENTS = [
  {
    id: 'sunny', name: '晴天', icon: '☀️',
    temp: '25℃', humidity: '55%',
    desc: '阳光充足，空气干燥，最适自然萎凋与晒青。',
    stepAdjust: {
      weidiao: { timeScale: 1, note: '自然萎凋条件极佳，可薄摊日晒，日光萎凋 20~40 分钟。' },
      shaiqing: { timeScale: 1, note: '晒青理想天气，日光萎凋 30~60 分钟恰到好处。' },
      fajiao: { timeScale: 1, note: '温度湿度适中，发酵进程平稳。' },
      wodui: { timeScale: 1, note: '渥堆温湿度适中，可按标准时长堆闷。' },
      ganzao: { timeScale: 1, note: '可自然晒干或正常烘干，注意翻动均匀。' },
      shaqing: { timeScale: 1, note: '鲜叶含水正常，杀青按标准参数执行。' }
    }
  },
  {
    id: 'cloudy', name: '多云', icon: '⛅',
    temp: '22℃', humidity: '65%',
    desc: '天气温和，多数工序可按标准执行，萎凋略慢。',
    stepAdjust: {
      weidiao: { timeScale: 1.15, note: '光照不足，萎凋时间需延长约 15%，或改用室内自然萎凋。' },
      shaiqing: { timeScale: 1.2, note: '晒青效果一般，需延长晒青时间或转室内萎凋。' },
      fajiao: { timeScale: 1, note: '环境温和，发酵正常。' },
      wodui: { timeScale: 1, note: '渥堆正常进行。' },
      ganzao: { timeScale: 1.1, note: '空气湿度偏高，干燥时间略延长，注意排湿。' },
      shaqing: { timeScale: 1, note: '杀青不受影响，按标准执行。' }
    }
  },
  {
    id: 'overcast', name: '阴天', icon: '☁️',
    temp: '20℃', humidity: '72%',
    desc: '无日照，湿度偏高，萎凋与干燥明显变慢。',
    stepAdjust: {
      weidiao: { timeScale: 1.3, note: '无日照且湿度大，萎凋需大幅延长，建议加温萎凋（28~32℃）。' },
      shaiqing: { timeScale: 1.4, note: '不宜晒青，须改用室内萎凋或加温萎凋。' },
      fajiao: { timeScale: 1.1, note: '湿度偏高，发酵略快，注意观察叶色。' },
      wodui: { timeScale: 1, note: '渥堆保温保湿有利，正常进行。' },
      ganzao: { timeScale: 1.2, note: '必须烘干，不可晒干，干燥时间延长。' },
      shaqing: { timeScale: 1, note: '鲜叶含水略高，杀青时间可稍延长 5%~10%。' }
    }
  },
  {
    id: 'rainy', name: '雨天', icon: '🌧️',
    temp: '18℃', humidity: '88%',
    desc: '空气潮湿，鲜叶表面带水，各工序均需调整。',
    stepAdjust: {
      weidiao: { timeScale: 1.5, note: '鲜叶含水高，必须加温萎凋（30~35℃）并延长 50% 时间，注意通风。' },
      shaiqing: { timeScale: 1.6, note: '严禁晒青！鲜叶带水易闷红，须改室内加温萎凋。' },
      fajiao: { timeScale: 1.15, note: '湿度大发酵加快，勤观察，防止发酵过度。' },
      wodui: { timeScale: 1.1, note: '雨天闷热，渥堆升温快，注意翻堆散热。' },
      ganzao: { timeScale: 1.3, note: '必须烘干，先低温慢烘去水，防闷黄褐变。' },
      shaqing: { timeScale: 1.1, note: '鲜叶含水高，杀青时间延长 10%，温度略高以利排水汽。' }
    }
  },
  {
    id: 'cold', name: '低温', icon: '❄️',
    temp: '8℃', humidity: '70%',
    desc: '气温低，酶活性弱，发酵与渥堆需保温加时。',
    stepAdjust: {
      weidiao: { timeScale: 1.2, note: '低温失水慢，萎凋延长，建议加温萎凋或加大摊叶厚度。' },
      shaiqing: { timeScale: 1.2, note: '低温晒青效果差，需延长时间或改加温萎凋。' },
      fajiao: { timeScale: 1.35, note: '低温抑制酶活，发酵需保温（28~30℃）并延长约 35% 时间。' },
      wodui: { timeScale: 1.3, note: '低温渥堆升温难，需加厚堆高、覆盖保温，延长渥堆时间。' },
      ganzao: { timeScale: 1.1, note: '低温干燥略慢，按标准执行即可。' },
      shaqing: { timeScale: 1, note: '鲜叶低温采后含水正常，杀青不受明显影响。' }
    }
  },
  {
    id: 'hot_dry', name: '高温干燥', icon: '🔥',
    temp: '33℃', humidity: '40%',
    desc: '气温高、空气干，鲜叶失水过快，需遮阴保湿。',
    stepAdjust: {
      weidiao: { timeScale: 0.8, note: '高温干燥失水过快，需遮阴薄摊、缩短萎凋时间，防失水不匀。' },
      shaiqing: { timeScale: 0.8, note: '日晒强度大，缩短晒青时间并勤翻，防灼伤叶缘。' },
      fajiao: { timeScale: 0.85, note: '高温发酵快，缩短时间，防发酵过度酸变。' },
      wodui: { timeScale: 0.9, note: '高温渥堆升温快，降低堆高、及时翻堆。' },
      ganzao: { timeScale: 0.9, note: '空气干燥利于干燥，注意控制温度防焦。' },
      shaqing: { timeScale: 1, note: '高温天鲜叶易失水，采摘后尽快摊放、及时杀青。' }
    }
  }
];

function CraftSimulator({ initialTeaId, onBack, onComplete, progress }) {
  const dl = window.TeaDataLayer;

  // ---- 状态 ----
  const [teaId, setTeaId] = React.useState(initialTeaId || null);
  const [currentStepIndex, setCurrentStepIndex] = React.useState(0);
  const [paramValue, setParamValue] = React.useState(0);
  const [timeParamValue, setTimeParamValue] = React.useState(0);
  const [environment, setEnvironment] = React.useState(null);
  const [showEnvPicker, setShowEnvPicker] = React.useState(false);
  const [stepResults, setStepResults] = React.useState([]);
  const [feedback, setFeedback] = React.useState(null);
  const [showResult, setShowResult] = React.useState(false);
  const [showReport, setShowReport] = React.useState(false);
  const [finalScore, setFinalScore] = React.useState(0);
  const [finalGrade, setFinalGrade] = React.useState('');
  const [pickingSelection, setPickingSelection] = React.useState(null);
  const [selectedMethods, setSelectedMethods] = React.useState({});
  const [teaState, setTeaState] = React.useState(dl.getInitialTeaState(initialTeaId || 'green'));
  const [famousTeaId, setFamousTeaId] = React.useState(null);

  // ---- 派生数据（防御性读取） ----
  const baseTea = teaId ? dl.getTea(teaId) : null;
  const selectedFamousTea = famousTeaId ? dl.getFamousTeaById(famousTeaId) : null;
  // 名优茶参数档套用：用名优茶参数覆盖类级工序理想参数
  const currentTea = baseTea ? applyFamousParams(baseTea, selectedFamousTea) : null;
  const steps = currentTea ? dl.safeArr(currentTea.steps, []) : [];
  const currentStep = steps[currentStepIndex] || null;
  const SHAQING_METHODS = dl.getShaqingMethods();
  const GANZAO_METHODS = dl.getGanzaoMethods();
  const teaIds = dl.TEA_IDS;

  // ---- 嫩度偏差（名优茶档时以名优茶采摘标准为基准） ----
  const getTenderDelta = () => {
    if (!pickingSelection || !currentTea) return 0;
    const pick = dl.getPickingById(pickingSelection);
    const idealPick = dl.getPickingById(currentTea.idealPicking);
    if (!pick || !idealPick) return 0;
    const ftLv = typeof inferFamousPickingLevel === 'function' ? inferFamousPickingLevel() : null;
    const idealLevel = ftLv != null ? ftLv : idealPick.tenderLevel;
    return pick.tenderLevel - idealLevel;
  };

  // ---- 计算有效步骤参数（考虑嫩度偏差、杀青/干燥方式） ----
  const getEffectiveStep = () => {
    if (!currentStep || !currentTea) return currentStep;

    const step = {
      ...currentStep,
      idealRange: Array.isArray(currentStep.idealRange) ? [...currentStep.idealRange] : [0, 100],
      effects: dl.safeObj(currentStep.effects, {})
    };

    if (!step.idealRange || step.idealRange.length < 2) {
      step.idealRange = [step.paramMin || 0, step.paramMax || 100];
    }
    if (step.idealValue === undefined || step.idealValue === null) {
      step.idealValue = (step.idealRange[0] + step.idealRange[1]) / 2;
    }

    // 采摘嫩度影响
    const tenderDelta = getTenderDelta();
    if (tenderDelta !== 0) {
      const adj = dl.safeCalcStepAdjustments(tenderDelta);
      let scale = 1;
      const stepId = step.id || '';

      if (stepId === 'weidiao' || stepId === 'shaiqing') {
        scale = dl.safeGet(adj, 'weidiao.timeScale', 1);
      } else if (stepId === 'shaqing') {
        scale = dl.safeGet(adj, 'shaqing.tempScale', 1);
      } else if (stepId === 'rounian') {
        scale = dl.safeGet(adj, 'rounian.timeScale', 1);
      } else if (stepId === 'menhuang') {
        scale = dl.safeGet(adj, 'menhuang.timeScale', 1);
      } else if (stepId === 'zuoqing') {
        scale = dl.safeGet(adj, 'zuoqing.countScale', 1);
      } else if (stepId === 'fajiao') {
        scale = dl.safeGet(adj, 'fajiao.timeScale', 1);
      } else if (stepId === 'wodui') {
        scale = dl.safeGet(adj, 'wodui.tempScale', 1);
      } else if (stepId === 'ganzao') {
        scale = dl.safeGet(adj, 'ganzao.tempScale', 1);
      }

      if (scale && scale !== 1) {
        const mid = (step.idealRange[0] + step.idealRange[1]) / 2;
        const halfRange = (step.idealRange[1] - step.idealRange[0]) / 2;
        const newMid = mid * scale;
        const newHalf = halfRange * scale;
        step.idealRange = [Math.round(newMid - newHalf), Math.round(newMid + newHalf)];
        step.idealValue = Math.round(step.idealValue * scale);
      }
    }

    // 杀青方式影响
    if (step.methodType === 'shaqing' && selectedMethods.shaqing) {
      const method = SHAQING_METHODS[selectedMethods.shaqing];
      if (method && method.tempOffset && method.tempOffset !== 1) {
        const mid = (step.idealRange[0] + step.idealRange[1]) / 2;
        const halfRange = (step.idealRange[1] - step.idealRange[0]) / 2;
        const newMid = mid * method.tempOffset;
        const newHalf = halfRange * method.tempOffset;
        step.idealRange = [Math.round(newMid - newHalf), Math.round(newMid + newHalf)];
        step.idealValue = Math.round(step.idealValue * method.tempOffset);
      }
    }

    // 干燥方式影响
    if (step.methodType === 'ganzao' && selectedMethods.ganzao) {
      const method = GANZAO_METHODS[selectedMethods.ganzao];
      if (method && method.tempOffset && method.tempOffset !== 1) {
        const mid = (step.idealRange[0] + step.idealRange[1]) / 2;
        const halfRange = (step.idealRange[1] - step.idealRange[0]) / 2;
        const newMid = mid * method.tempOffset;
        const newHalf = halfRange * method.tempOffset;
        step.idealRange = [Math.round(newMid - newHalf), Math.round(newMid + newHalf)];
        step.idealValue = Math.round(step.idealValue * method.tempOffset);
      }
    }

    // 环境前提影响（时间维度：天气决定萎凋/发酵/渥堆/干燥的合理时长）
    const envAdj = getEnvAdjust(step.id || '');
    if (envAdj && envAdj.timeScale && envAdj.timeScale !== 1) {
      if (Array.isArray(step.idealTimeRange) && step.idealTimeRange.length === 2) {
        const tMid = (step.idealTimeRange[0] + step.idealTimeRange[1]) / 2;
        const tHalf = (step.idealTimeRange[1] - step.idealTimeRange[0]) / 2;
        const tNm = tMid * envAdj.timeScale;
        const tNh = tHalf * envAdj.timeScale;
        step.idealTimeRange = [Math.round(tNm - tNh), Math.round(tNm + tNh)];
        if (step.idealTimeValue != null) step.idealTimeValue = Math.round(step.idealTimeValue * envAdj.timeScale * 10) / 10;
      } else if (step.paramType === 'time' && Array.isArray(step.idealRange) && step.idealRange.length === 2) {
        const tMid = (step.idealRange[0] + step.idealRange[1]) / 2;
        const tHalf = (step.idealRange[1] - step.idealRange[0]) / 2;
        const tNm = tMid * envAdj.timeScale;
        const tNh = tHalf * envAdj.timeScale;
        step.idealRange = [Math.round(tNm - tNh), Math.round(tNm + tNh)];
        if (step.idealValue != null) step.idealValue = Math.round(step.idealValue * envAdj.timeScale * 10) / 10;
      }
    }

    // 滑块尺度必须包含理想区间（含偏移后），确保最适区间始终可选
    if (Array.isArray(step.idealRange) && step.idealRange.length === 2) {
      const half = Math.max((step.idealRange[1] - step.idealRange[0]) * 1.2, 10);
      const needMin = Math.floor(step.idealRange[0] - half * 0.5);
      const needMax = Math.ceil(step.idealRange[1] + half * 0.5);
      if (step.paramMin == null || step.paramMin > needMin) step.paramMin = needMin;
      if (step.paramMax == null || step.paramMax < needMax) step.paramMax = needMax;
    }
    if (Array.isArray(step.idealTimeRange) && step.idealTimeRange.length === 2) {
      const half = Math.max((step.idealTimeRange[1] - step.idealTimeRange[0]) * 1.2, 2);
      const needMin = Math.floor(step.idealTimeRange[0] - half * 0.5);
      const needMax = Math.ceil(step.idealTimeRange[1] + half * 0.5);
      if (step.timeMin == null || step.timeMin > needMin) step.timeMin = needMin;
      if (step.timeMax == null || step.timeMax < needMax) step.timeMax = needMax;
    }

    return step;
  };

  const effectiveStep = getEffectiveStep();

  // ---- 初始化参数值（切换步骤/茶类时） ----
  React.useEffect(() => {
    if (!currentStep || !currentTea) return;

    if (currentStep.paramType === 'picking') {
      setPickingSelection(null);
    } else if (currentStep.methodType === 'shaqing') {
      const best = currentTea.bestShaiqingMethod || Object.keys(SHAQING_METHODS)[0];
      setSelectedMethods(prev => ({ ...prev, shaqing: best }));
      const pMin = currentStep.paramMin || 0;
      const pMax = currentStep.paramMax || 100;
      setParamValue(pMin + Math.floor((pMax - pMin) / 2));
    } else if (currentStep.methodType === 'ganzao') {
      const best = currentTea.bestGanzaoMethod || Object.keys(GANZAO_METHODS)[0];
      setSelectedMethods(prev => ({ ...prev, ganzao: best }));
      const pMin = currentStep.paramMin || 0;
      const pMax = currentStep.paramMax || 100;
      setParamValue(pMin + Math.floor((pMax - pMin) / 2));
    } else {
      const pMin = currentStep.paramMin || 0;
      const pMax = currentStep.paramMax || 100;
      setParamValue(pMin + Math.floor((pMax - pMin) / 2));
    }
    // 时间参数初始化
    if (currentStep.idealTimeRange && currentStep.idealTimeRange.length === 2) {
      const tMin = currentStep.timeMin != null ? currentStep.timeMin : currentStep.idealTimeRange[0];
      const tMax = currentStep.timeMax != null ? currentStep.timeMax : currentStep.idealTimeRange[1];
      setTimeParamValue(Math.round((tMin + tMax) / 2));
    } else {
      setTimeParamValue(0);
    }
    setFeedback(null);
  }, [currentStepIndex, teaId, environment]);

  // ---- 选择茶类（选定后先设定环境前提背景） ----
  const selectTea = (id) => {
    const tea = dl.getTea(id);
    setTeaId(id);
    setFamousTeaId(null);
    setEnvironment(null);
    setShowEnvPicker(true);
    setCurrentStepIndex(0);
    setStepResults([]);
    setFeedback(null);
    setShowResult(false);
    setShowReport(false);
    setPickingSelection(null);
    setSelectedMethods({});
    setFinalScore(0);
    setFinalGrade('');
    setTeaState(dl.getInitialTeaState(id));
  };

  // ---- 切换名优茶参数档（保持茶类，重置流程；同档点击=重新开始） ----
  const switchFamous = (fid) => {
    setFamousTeaId(fid);
    setCurrentStepIndex(0);
    setStepResults([]);
    setFeedback(null);
    setShowResult(false);
    setShowReport(false);
    setPickingSelection(null);
    setSelectedMethods({});
    setFinalScore(0);
    setFinalGrade('');
    if (teaId) setTeaState(dl.getInitialTeaState(teaId));
  };

  // ---- 当前环境对象与工序影响 ----
  const getEnv = () => ENVIRONMENTS.find(e => e.id === environment) || null;
  const getEnvAdjust = (stepId) => {
    const env = getEnv();
    if (!env || !stepId) return null;
    return env.stepAdjust[stepId] || null;
  };

  // ---- 计算参数得分 ----
  const calculateParamScore = (step, value, methodSuitability = 1) => {
    const rangeArr = step.idealRange || [0, 100];
    const min = rangeArr[0];
    const max = rangeArr[1];
    const idealValue = step.idealValue !== undefined ? step.idealValue : (min + max) / 2;
    let baseScore;

    if (value >= min && value <= max) {
      const range = max - min;
      const dist = Math.abs(value - idealValue);
      const ratio = range > 0 ? 1 - (dist / (range / 2)) * 0.3 : 1;
      baseScore = Math.round(100 * Math.max(0, ratio));
    } else {
      const range = Math.max(max - min, 1);
      const dist = value < min ? min - value : value - max;
      const penalty = Math.min(dist / range, 3);
      baseScore = Math.max(0, Math.round(60 - penalty * 40));
    }

    return Math.round(baseScore * methodSuitability);
  };

  // ---- 环境对工序的适配系数（1=适配；受环境牵制越大系数越低） ----
  const getEnvSuitability = (stepId) => {
    const env = getEnv();
    if (!env || !stepId) return 1;
    const adj = env.stepAdjust[stepId];
    if (!adj) return 1;
    const scale = adj.timeScale || 1;
    const penalty = Math.min(Math.abs(scale - 1) * 0.18, 0.15);
    return Math.max(0.85, 1 - penalty);
  };

  // ---- 双参数评分（温度 + 时间；无时间参数时退化为单参数） ----
  const calcStepScore = (step, tempVal, timeVal, methodSuitability = 1) => {
    const tScore = calculateParamScore(step, tempVal, methodSuitability);
    if (step.idealTimeRange && step.idealTimeRange.length === 2) {
      const tStep = {
        ...step,
        idealRange: step.idealTimeRange,
        idealValue: step.idealTimeValue,
        paramMin: step.timeMin,
        paramMax: step.timeMax,
        paramUnit: step.timeUnit || '分钟'
      };
      const timeScore = calculateParamScore(tStep, timeVal, 1);
      return { score: Math.round(tScore * 0.6 + timeScore * 0.4), tScore, timeScore };
    }
    return { score: tScore, tScore, timeScore: null };
  };

  // ---- 双参数反馈（温度 + 时间说明） ----
  const getStepFeedback = (step, tempVal, timeVal, score, extraInfo = {}) => {
    const tFb = getFeedback(step, tempVal, score, extraInfo);
    if (step.idealTimeRange && step.idealTimeRange.length === 2) {
      const tMin = step.idealTimeRange[0];
      const tMax = step.idealTimeRange[1];
      let timeText;
      if (timeVal < tMin) {
        timeText = `时间${timeVal}${step.timeUnit || '分钟'}偏短（理想 ${tMin}-${tMax}${step.timeUnit || '分钟'}）`;
      } else if (timeVal > tMax) {
        timeText = `时间${timeVal}${step.timeUnit || '分钟'}偏长（理想 ${tMin}-${tMax}${step.timeUnit || '分钟'}）`;
      } else {
        timeText = `时间${timeVal}${step.timeUnit || '分钟'}合适`;
      }
      return { ...tFb, text: tFb.text + ' ｜ ' + timeText };
    }
    return tFb;
  };

  // ---- 获取反馈信息 ----
  const getFeedback = (step, value, score, extraInfo = {}) => {
    const rangeArr = step.idealRange || [0, 100];
    const min = rangeArr[0];
    const max = rangeArr[1];
    const idealValue = step.idealValue || (min + max) / 2;
    const effects = step.effects || {};

    if (value < min) {
      return { type: 'error', text: (effects.tooLow && effects.tooLow.text) || '参数偏低', quality: -20, ...extraInfo };
    } else if (value > max) {
      return { type: 'error', text: (effects.tooHigh && effects.tooHigh.text) || '参数偏高', quality: -20, ...extraInfo };
    } else {
      const perfectText = (effects.perfect && effects.perfect.text) || '参数恰到好处';
      if (Math.abs(value - idealValue) < (max - min) * 0.15) {
        return { type: 'success', text: perfectText, quality: 0, ...extraInfo };
      } else {
        return { type: 'warning', text: perfectText + ' 尚可更精准。', quality: -10, ...extraInfo };
      }
    }
  };

  // ---- 从名优茶数据推断理想采摘嫩度（0-5），无法推断返回 null ----
  // 优先读取 picking 字段，为空则扫 params 中的采摘相关行
  const inferFamousPickingLevel = () => {
    if (!selectedFamousTea) return null;
    let text = String(selectedFamousTea.picking || '');
    if (!text) {
      const pl = dl.safeArr(selectedFamousTea.params, []);
      for (const line of pl) {
        if (/采摘|开面|嫩度|鲜叶|单芽|一芽/.test(String(line || ''))) text += ' ' + line;
      }
    }
    if (!text) return null;
    const rules = [
      [0, /单芽|纯芽|肥壮芽头/],
      [1, /一芽一叶/],
      [2, /一芽二/],
      [3, /开面|一芽三/],
      [4, /一芽四|一芽五/],
      [5, /粗老|碎茶|片茶/]
    ];
    for (const rule of rules) {
      if (rule[1].test(text)) return rule[0];
    }
    return null;
  };

  // ---- 采摘得分（按茶类区分评分曲线） ----
  const calculatePickingScore = () => {
    if (!pickingSelection || !currentTea) return { score: 0, feedback: null };

    const pick = dl.getPickingById(pickingSelection);
    if (!pick) return { score: 60, feedback: { type: 'warning', text: '采摘标准无法判定，取默认分。', quality: -20 } };

    const level = pick.tenderLevel;
    const teaId = currentTea.id;
    const idealPick = dl.getPickingById(currentTea.idealPicking);
    const idealLevel = idealPick ? idealPick.tenderLevel : 2;
    const ftLevel = inferFamousPickingLevel();

    let score, type, text, quality;

    if (teaId === 'oolong') {
      // 乌龙茶：成熟度适当最优（倒U型），峰=理想采摘（名优茶档可覆盖，如东方美人需嫩采）
      const peak = ftLevel != null ? ftLevel : idealLevel;
      const dist = Math.abs(level - peak);
      score = Math.max(0, Math.round(95 - dist * dist * 15));
      if (dist === 0) {
        type = 'success';
        text = `采摘标准完美！${pick.name}正合${ftLevel != null ? '该名优茶' : '乌龙茶'}成熟度要求，内含物充分，最适合做青形成花果香。`;
      } else if (level < peak) {
        type = 'warning';
        text = `采摘偏嫩。带嫩芽过多，叶质柔嫩，做青时易损伤红变、香气欠熟——乌龙茶需采成熟新梢（开面采）。`;
      } else {
        type = 'warning';
        text = `采摘偏成熟。叶质过老、内含物减少，做青反应迟钝，成茶滋味粗涩。`;
      }
      quality = -(100 - score);
    } else if (teaId === 'dark') {
      // 黑茶：按黑毛茶嫩度等级判定，单芽/过嫩制作效果差，一芽二三叶最佳（倒U型）
      const peak = 2; // 一芽二三叶 = 高档黑毛茶（天尖/特级）基准
      const dist = Math.abs(level - peak);
      score = Math.max(0, Math.round(95 - dist * dist * 15));
      if (dist === 0) {
        type = 'success';
        text = `采摘标准最佳！${pick.name}正是高档黑毛茶（如天尖）的嫩度基准，芽叶内含物与纤维比例最适合渥堆发酵。`;
      } else if (level < peak) {
        type = 'warning';
        text = `采摘偏嫩。${pick.name}过于细嫩，单芽类原料在渥堆中易粘结成团、发酵不匀，制作效果并不理想——黑茶宜采一芽二三叶。`;
      } else if (level === 4) {
        type = 'warning';
        text = `采摘偏成熟。${pick.name}为低档黑毛茶（如生尖）原料，内含物减少，需更长渥堆时间、成茶品质档次下降。`;
      } else {
        type = 'error';
        text = `原料过于粗老！${pick.name}纤维化明显，渥堆转化物质不足，成茶粗涩、水薄，不建议制作高档黑茶。`;
      }
      quality = -(100 - score);
    } else if (teaId === 'reprocessed') {
      // 再加工茶：茶坯嫩度依品类而异（花茶中档茶坯/紧压茶成熟料/袋泡茶粗老碎茶），按理想标准距离评分
      const peak = ftLevel != null ? ftLevel : idealLevel;
      const dist = Math.abs(level - peak);
      score = Math.max(0, Math.round(95 - dist * dist * 15));
      if (dist === 0) {
        type = 'success';
        text = `茶坯嫩度匹配！${pick.name}正合${currentTea.name}的原料（茶坯）要求。`;
      } else if (dist <= 1) {
        type = 'warning';
        text = `茶坯嫩度基本匹配。${pick.name}与${currentTea.name}理想茶坯${idealPick ? '（' + idealPick.name + '）' : ''}接近，可正常再加工。`;
      } else {
        type = 'error';
        text = `茶坯嫩度偏差较大！${pick.name}与${currentTea.name}的茶坯要求相差${dist}级，成茶品质明显受影响。`;
      }
      quality = -(100 - score);
    } else {
      // 绿茶/红茶/黄茶/白茶/黑茶：嫩度越高、品质潜质越高（单调递减，越嫩分越高）
      score = Math.max(0, Math.round(100 - level * 15));
      if (level <= 1) {
        type = 'success';
        text = `嫩度极佳！${pick.name}内含物丰富（氨基酸、可溶性糖含量高），是${currentTea.name}的高档原料，成茶鲜爽度与外形俱佳。`;
      } else if (level === 2) {
        type = 'success';
        text = `嫩度良好。${pick.name}细嫩匀净，可制${currentTea.name}中高档茶，品质有保障。`;
      } else if (level === 3) {
        type = 'warning';
        text = `嫩度一般。${pick.name}成熟度偏高、内含物下降，成茶档次相应降低，后续工艺建议按粗老原料调整。`;
      } else {
        type = 'error';
        text = `原料偏老！${pick.name}纤维多、内含物少，制${currentTea.name}品质明显下降，需大幅调整后续工艺参数。`;
      }
      quality = -(100 - score);
    }

    return { score, feedback: { type, text, quality } };
  };

  // ---- 杀青/干燥方式适合度 ----
  const getShaiqingSuitability = (methodId) => {
    if (!currentTea) return 1;
    const suitable = currentTea.suitableShaiqingMethods || [];
    if (suitable.length === 0) return 1;
    if (suitable.includes(methodId)) {
      if (methodId === currentTea.bestShaiqingMethod) return 1;
      return 0.92;
    }
    return 0.75;
  };

  const getGanzaoSuitability = (methodId) => {
    if (!currentTea) return 1;
    const suitable = currentTea.suitableGanzaoMethods || [];
    if (suitable.length === 0) return 1;
    if (suitable.includes(methodId)) {
      if (methodId === currentTea.bestGanzaoMethod) return 1;
      return 0.92;
    }
    return 0.75;
  };

  // ---- 颜色工具 ----
  const shadeColor = (color, percent) => {
    if (!color) return '#888';
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return '#' + (
      0x1000000 +
      (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
      (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
      (B < 255 ? B < 1 ? 0 : B : 255)
    ).toString(16).slice(1);
  };

  // ---- 更新茶叶状态 ----
  const updateTeaState = (tea, stepIndex, value, score) => {
    setTeaState(prev => {
      const newState = { ...prev };
      const step = steps[stepIndex];
      if (!step) return newState;

      const pMin = step.paramMin || 0;
      const pMax = step.paramMax || 100;
      const idealRange = step.idealRange || [pMin, pMax];
      const min = idealRange[0];
      const max = idealRange[1];
      const idealRatio = Math.max(0, Math.min(1, (value - pMin) / (pMax - pMin || 1)));

      if (step.id === 'shaqing') {
        if (value < min) {
          newState.leafColor = '#8B6914';
          newState.leafColorLight = '#A67C00';
        } else if (value > max) {
          newState.leafColor = '#4A3728';
          newState.leafColorLight = '#6B5344';
        } else {
          newState.leafColor = tea.color;
          newState.leafColorLight = tea.colorLight;
        }
        newState.aroma = Math.min(100, newState.aroma + 15 + score / 10);
      } else if (step.id === 'weidiao' || step.id === 'shaiqing') {
        if (tea.id === 'white') {
          if (value > max) {
            newState.leafColor = '#8B7355';
            newState.leafColorLight = '#A89070';
          } else {
            newState.leafColor = tea.color;
            newState.leafColorLight = tea.colorLight;
          }
        } else {
          newState.leafColor = '#A89060';
          newState.leafColorLight = '#C4AC78';
        }
        newState.oxidation = idealRatio * (tea.id === 'red' ? 30 : tea.id === 'oolong' ? 20 : 10);
      } else if (step.id === 'rounian') {
        newState.shape = idealRatio * 100;
        newState.leafColor = shadeColor(newState.leafColor, -5);
        newState.leafColorLight = shadeColor(newState.leafColorLight, -5);
      } else if (step.id === 'menhuang') {
        if (value > max) {
          newState.leafColor = '#8B6914';
          newState.leafColorLight = '#A67C00';
        } else {
          newState.leafColor = tea.color;
          newState.leafColorLight = tea.colorLight;
        }
        newState.oxidation = 20 + idealRatio * 10;
      } else if (step.id === 'zuoqing') {
        const oolongOxidation = idealRatio * 50;
        if (value > max) {
          newState.leafColor = '#9B4B35';
          newState.leafColorLight = '#B5694A';
        } else {
          newState.leafColor = tea.color;
          newState.leafColorLight = tea.colorLight;
        }
        newState.oxidation = oolongOxidation;
        newState.aroma = Math.min(100, newState.aroma + 20 + score / 8);
      } else if (step.id === 'fajiao') {
        const redOxidation = 50 + idealRatio * 50;
        if (value > max) {
          newState.leafColor = '#5C2020';
          newState.leafColorLight = '#7A3535';
        } else {
          newState.leafColor = '#8B4513';
          newState.leafColorLight = '#A65C2E';
        }
        newState.oxidation = redOxidation;
        newState.aroma = Math.max(30, newState.aroma - 10 + score / 8);
      } else if (step.id === 'wodui') {
        newState.oxidation = 50 + idealRatio * 30;
        newState.leafColor = '#4A3020';
        newState.leafColorLight = '#6B4A35';
      } else if (step.id === 'ganzao') {
        newState.dryness = Math.min(100, idealRatio * 100 + 20);
        if (value > max) {
          newState.leafColor = shadeColor(newState.leafColor, -15);
          newState.leafColorLight = shadeColor(newState.leafColorLight, -15);
        }
      } else if (step.id === 'yaobian') {
        newState.leafColor = '#7A9E5A';
        newState.leafColorLight = '#9DBD7A';
        newState.aroma = Math.min(100, newState.aroma + 5);
      }

      return newState;
    });
  };

  // ---- 执行采摘步骤 ----
  const executePickingStep = () => {
    if (!pickingSelection) return;
    const { score, feedback: fb } = calculatePickingScore();

    const pick = dl.getPickingById(pickingSelection);
    if (pick) {
      setTeaState(prev => ({
        ...prev,
        tenderness: (1 - pick.tenderLevel / 5) * 100,
        leafColor: pick.tenderLevel <= 1 ? '#8DBF6B' : pick.tenderLevel <= 3 ? '#6B9B48' : '#4A6B30',
        leafColorLight: pick.tenderLevel <= 1 ? '#A8D08A' : pick.tenderLevel <= 3 ? '#8DB868' : '#5E8540'
      }));
    }

    setFeedback(fb);
    setStepResults(prev => [...prev, { stepId: 'caizhai', score, feedback: fb, selection: pickingSelection }]);

    setTimeout(() => {
      if (currentStepIndex < steps.length - 1) {
        setCurrentStepIndex(currentStepIndex + 1);
      } else {
        finishTea(score, fb);
      }
    }, 3000);
  };

  // ---- 执行杀青步骤 ----
  const executeShaiqingStep = () => {
    if (!selectedMethods.shaqing) return;
    const suitability = getShaiqingSuitability(selectedMethods.shaqing);
    const envSuit = getEnvSuitability(currentStep.id);
    const { score: rawScore } = calcStepScore(effectiveStep, paramValue, timeParamValue, suitability);
    const score = Math.round(rawScore * envSuit);
    const method = SHAQING_METHODS[selectedMethods.shaqing];
    const methodText = method ? `（${method.name}杀青，${method.aromaType || ''}）` : '';

    const fb = getStepFeedback(effectiveStep, paramValue, timeParamValue, score, { methodBonus: method });
    if (suitability < 0.9 && currentTea.bestShaiqingMethod && selectedMethods.shaqing !== currentTea.bestShaiqingMethod) {
      fb.text = fb.text + ' 注：此杀青方式对该茶类并非最佳，香气与色泽会受影响。';
    }
    const envAdj = getEnvAdjust(currentStep.id);
    if (envAdj && envAdj.note) fb.text = fb.text + ' ｜ 环境：' + envAdj.note;

    setFeedback(fb);
    setStepResults(prev => [...prev, { stepId: currentStep.id, score, feedback: fb, method: selectedMethods.shaqing }]);
    updateTeaState(currentTea, currentStepIndex, paramValue, score);

    setTeaState(prev => {
      const newState = { ...prev };
      if (method) {
        newState.aroma = Math.max(0, Math.min(100, newState.aroma + (method.baseSuitability || 0.5) * 10 - 5));
      }
      return newState;
    });

    setTimeout(() => {
      if (currentStepIndex < steps.length - 1) {
        setCurrentStepIndex(currentStepIndex + 1);
      } else {
        finishTea(score, fb);
      }
    }, 3000);
  };

  // ---- 执行干燥步骤 ----
  const executeGanzaoStep = () => {
    if (!selectedMethods.ganzao) return;
    const suitability = getGanzaoSuitability(selectedMethods.ganzao);
    const envSuit = getEnvSuitability(currentStep.id);
    const { score: rawScore } = calcStepScore(effectiveStep, paramValue, timeParamValue, suitability);
    const score = Math.round(rawScore * envSuit);
    const method = GANZAO_METHODS[selectedMethods.ganzao];

    const fb = getStepFeedback(effectiveStep, paramValue, timeParamValue, score, { methodBonus: method });
    if (suitability < 0.9 && currentTea.bestGanzaoMethod && selectedMethods.ganzao !== currentTea.bestGanzaoMethod) {
      fb.text = fb.text + ' 注：此干燥方式对该茶类并非最佳。';
    }
    const envAdj = getEnvAdjust(currentStep.id);
    if (envAdj && envAdj.note) fb.text = fb.text + ' ｜ 环境：' + envAdj.note;

    setFeedback(fb);
    setStepResults(prev => [...prev, { stepId: currentStep.id, score, feedback: fb, method: selectedMethods.ganzao }]);
    updateTeaState(currentTea, currentStepIndex, paramValue, score);

    setTimeout(() => {
      if (currentStepIndex < steps.length - 1) {
        setCurrentStepIndex(currentStepIndex + 1);
      } else {
        finishTea(score, fb);
      }
    }, 3000);
  };

  // ---- 完成制茶 ----
  const finishTea = (lastScore, lastFb) => {
    const allScores = [...stepResults, { stepId: currentStep.id, score: lastScore, feedback: lastFb }];
    const avgScore = Math.round(allScores.reduce((sum, s) => sum + s.score, 0) / allScores.length);
    setFinalScore(avgScore);

    const gradeInfo = dl.getGradeInfo(avgScore);
    setFinalGrade(gradeInfo.key);
    setShowResult(true);

    if (onComplete) {
      try {
        onComplete(teaId, avgScore, gradeInfo.key);
      } catch (e) {
        console.warn('onComplete 回调报错', e);
      }
    }
  };

  // ---- 执行当前步骤 ----
  const executeStep = () => {
    if (!currentStep) return;
    if (currentStep.paramType === 'picking') {
      executePickingStep();
      return;
    }
    if (currentStep.methodType === 'shaqing') {
      executeShaiqingStep();
      return;
    }
    if (currentStep.methodType === 'ganzao') {
      executeGanzaoStep();
      return;
    }
    // 普通参数步骤（温度 / 时间 / 次数；含时间参数时双条评分）
    const envSuit = getEnvSuitability(currentStep.id);
    const { score: rawScore } = calcStepScore(effectiveStep, paramValue, timeParamValue);
    const score = Math.round(rawScore * envSuit);
    const fb = getStepFeedback(effectiveStep, paramValue, timeParamValue, score);
    const envAdj = getEnvAdjust(currentStep.id);
    if (envAdj && envAdj.note) fb.text = fb.text + ' ｜ 环境：' + envAdj.note;
    setFeedback(fb);
    setStepResults(prev => [...prev, { stepId: currentStep.id, score, feedback: fb }]);
    updateTeaState(currentTea, currentStepIndex, paramValue, score);

    setTimeout(() => {
      if (currentStepIndex < steps.length - 1) {
        setCurrentStepIndex(currentStepIndex + 1);
      } else {
        finishTea(score, fb);
      }
    }, 3000);
  };

  // ---- 是否可以执行 ----
  const canExecute = () => {
    if (feedback) return false;
    if (!currentStep) return false;
    if (currentStep.paramType === 'picking') return !!pickingSelection;
    if (currentStep.methodType === 'shaqing') return !!selectedMethods.shaqing;
    if (currentStep.methodType === 'ganzao') return !!selectedMethods.ganzao;
    return true;
  };

  // ---- 重新开始 ----
  const restart = () => {
    setTeaId(null);
    setFamousTeaId(null);
    setCurrentStepIndex(0);
    setStepResults([]);
    setFeedback(null);
    setShowResult(false);
    setShowReport(false);
    setFinalScore(0);
    setFinalGrade('');
    setPickingSelection(null);
    setSelectedMethods({});
    setTeaState(dl.getInitialTeaState('green'));
  };

  // ---- 等级文本 ----
  const gradeText = {
    super: { name: '特级', color: 'var(--accent-gold)' },
    first: { name: '一级', color: 'var(--accent-jade)' },
    second: { name: '二级', color: 'var(--bamboo)' },
    fail: { name: '未达标', color: 'var(--accent-cinnabar)' }
  };

  const gradeComments = {
    super: '工艺精湛！各工序拿捏精准到位，完美呈现了' + (currentTea?.name || '这款茶') + '的精髓。',
    first: '工艺优良！整体把控得当，品质上乘，个别细节可进一步精进。',
    second: '工艺合格！基本掌握了制作要领，但部分工序参数还有调整空间。',
    fail: '有待提高！工艺参数偏离较大，未能形成合格品质。多练习几次，你一定能进步！'
  };

  // ---- 生成优化建议 ----
  const generateSuggestions = () => {
    const suggestions = [];
    stepResults.forEach((result, idx) => {
      const step = steps[idx];
      if (!step) return;
      if (result.score < 80) {
        suggestions.push({
          step: step.name,
          severity: result.score < 60 ? 'high' : 'mid',
          text: result.feedback?.text || '此工序需要注意参数控制'
        });
      }
    });
    return suggestions;
  };

  // ---- 品质维度计算 ----
  const calculateQualityDims = () => {
    const dims = {
      color: 80,
      aroma: 75,
      taste: 80,
      shape: 70,
      leafBase: 75
    };
    const avgScore = stepResults.length > 0
      ? stepResults.reduce((s, r) => s + r.score, 0) / stepResults.length
      : 60;
    dims.color = Math.round(50 + avgScore * 0.45);
    dims.aroma = Math.round(teaState.aroma * 0.4 + avgScore * 0.5);
    dims.taste = Math.round(40 + avgScore * 0.55);
    dims.shape = Math.round(teaState.shape * 0.4 + avgScore * 0.4);
    dims.leafBase = Math.round(50 + avgScore * 0.4);
    return dims;
  };

  const qualityLabels = {
    color: '色泽',
    aroma: '香气',
    taste: '滋味',
    shape: '外形',
    leafBase: '叶底'
  };

  // ---- 渲染可视化报告 ----
  const renderReport = () => {
    if (!showReport || !currentTea) return null;
    const quality = calculateQualityDims();
    const suggestions = generateSuggestions();

    return (
      <div className="report-overlay" onClick={() => setShowReport(false)}>
        <div className="report-modal" onClick={e => e.stopPropagation()}>
          <div className="report-header">
            <div className="report-title">制茶详细报告</div>
            <div className="report-subtitle">{currentTea.name} · 综合得分 {finalScore} 分</div>
          </div>

          <div className="report-section">
            <div className="report-section-title">各工序得分</div>
            <div className="report-steps-scores">
              {steps.map((step, idx) => {
                const result = stepResults[idx];
                const score = result?.score || 0;
                return (
                  <div key={step.id} className="report-step-score">
                    <div className="report-step-name">
                      {step.isCore && <span style={{ color: 'var(--accent-cinnabar)', marginRight: 4 }}>★</span>}
                      {step.name}
                    </div>
                    <div className="report-score-bar">
                      <div
                        className="report-score-fill"
                        style={{
                          width: `${score}%`,
                          background: score >= 90 ? 'var(--accent-jade)' : score >= 70 ? 'var(--accent-gold)' : 'var(--accent-cinnabar)'
                        }}
                      ></div>
                    </div>
                    <span className="report-score-num" style={{
                      color: score >= 90 ? 'var(--accent-jade)' : score >= 70 ? 'var(--accent-gold)' : 'var(--accent-cinnabar)'
                    }}>
                      {score}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="report-section">
            <div className="report-section-title">成品茶品质维度</div>
            <div className="report-quality-grid">
              {Object.entries(qualityLabels).map(([key, label]) => {
                const val = quality[key];
                return (
                  <div key={key} className="report-quality-item">
                    <div className="report-quality-label">{label}</div>
                    <div className="report-quality-bar">
                      <div
                        className="report-quality-fill"
                        style={{
                          width: `${val}%`,
                          background: val >= 90 ? 'var(--accent-jade)' : val >= 70 ? 'var(--accent-gold)' : 'var(--accent-cinnabar)'
                        }}
                      ></div>
                    </div>
                    <div className="report-quality-score">{val}</div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="report-section">
            <div className="report-section-title">工艺优化建议</div>
            <div className="report-suggestions">
              {suggestions.length > 0 ? suggestions.map((s, idx) => (
                <div key={idx} className={`report-suggestion severity-${s.severity}`}>
                  <div className="report-suggestion-step">
                    <span className={`suggestion-dot dot-${s.severity}`}></span>
                    {s.step}
                  </div>
                  <div className="report-suggestion-text">{s.text}</div>
                </div>
              )) : (
                <div style={{ color: 'var(--accent-jade)', fontSize: 'var(--fs-sm)' }}>
                  ✓ 工艺精湛！各工序均达优良水平，继续保持！
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
            <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowReport(false)}>
              返回
            </button>
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => { setShowReport(false); restart(); }}>
              再来一次
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ---- 渲染名优茶参数档选择器 ----
  const renderFamousPicker = () => {
    if (!teaId) return null;
    const famousList = dl.getFamousTeasByCategory(teaId);
    if (!famousList.length) return null;
    return (
      <div style={{
        marginBottom: 18, padding: '12px 16px', background: 'var(--bg-rice)',
        border: '1px solid rgba(46,125,91,0.2)', borderRadius: 'var(--radius-md)'
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: 10, flexWrap: 'wrap', gap: 6
        }}>
          <span style={{ fontSize: 'var(--fs-sm)', fontWeight: 700, color: 'var(--text-ink)' }}>
            🍃 名优茶参数档
          </span>
          <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-ink-muted)' }}>
            {famousTeaId ? `已套用「${selectedFamousTea ? selectedFamousTea.name : ''}」工艺参数` : '使用通用工艺参数'}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
          <div
            onClick={() => switchFamous(null)}
            style={{
              flex: '0 0 auto', padding: '8px 14px', borderRadius: 'var(--radius-sm)', cursor: 'pointer',
              fontSize: 'var(--fs-sm)', fontWeight: 600, whiteSpace: 'nowrap',
              background: !famousTeaId ? 'var(--accent-jade)' : 'rgba(46,125,91,0.08)',
              color: !famousTeaId ? '#fff' : 'var(--text-ink)',
              border: !famousTeaId ? '1px solid var(--accent-jade)' : '1px solid rgba(46,125,91,0.2)'
            }}
          >
            通用工艺
          </div>
          {famousList.map(f => (
            <div
              key={f.id}
              onClick={() => switchFamous(f.id)}
              title={(f.craftChain || '').slice(0, 80)}
              style={{
                flex: '0 0 auto', padding: '8px 14px', borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                fontSize: 'var(--fs-sm)', fontWeight: 600, whiteSpace: 'nowrap',
                background: famousTeaId === f.id ? 'var(--accent-jade)' : 'rgba(46,125,91,0.08)',
                color: famousTeaId === f.id ? '#fff' : 'var(--text-ink)',
                border: famousTeaId === f.id ? '1px solid var(--accent-jade)' : '1px solid rgba(46,125,91,0.2)'
              }}
            >
              {f.name}
              <span style={{ fontSize: 'var(--fs-xs)', opacity: 0.75, marginLeft: 4 }}>{f.origin}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // ---- 渲染时间控制条（步骤含时间参数时显示，与温度条并行） ----
  const renderTimeControl = (step) => {
    if (!step || !step.idealTimeRange || step.idealTimeRange.length !== 2) return null;
    const tMin = step.timeMin != null ? step.timeMin : step.idealTimeRange[0];
    const tMax = step.timeMax != null ? step.timeMax : step.idealTimeRange[1];
    const timeLabel = String(step.paramName || '时间')
      .replace('温度', '时间').replace('锅温', '时间').replace('叶温', '时间').replace('温', '时间');
    return (
      <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px dashed rgba(46,125,91,0.25)' }}>
        <div className="param-label">
          <span className="param-label-text">⏱ {timeLabel}</span>
          <span className="param-value">
            {timeParamValue}{step.timeUnit || '分钟'}
          </span>
        </div>
        <input
          type="range"
          className="param-slider"
          min={tMin}
          max={tMax}
          value={timeParamValue}
          onChange={(e) => setTimeParamValue(parseInt(e.target.value))}
          disabled={!!feedback}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: 'var(--fs-xs)', color: 'var(--text-ink-muted)' }}>
          <span>{tMin}{step.timeUnit || '分钟'}</span>
          <span style={{ color: 'var(--accent-jade)' }}>
            理想时间：{step.idealTimeRange[0]}-{step.idealTimeRange[1]}{step.timeUnit || '分钟'}
            {getTenderDelta() !== 0 && (
              <span style={{ color: 'var(--accent-gold)', marginLeft: 6 }}>（已随嫩度调整）</span>
            )}
            {getEnvAdjust(step.id) && getEnvAdjust(step.id).timeScale !== 1 && (
              <span style={{ color: 'var(--accent-cinnabar)', marginLeft: 6 }}>（已随环境调整）</span>
            )}
          </span>
          <span>{tMax}{step.timeUnit || '分钟'}</span>
        </div>
      </div>
    );
  };

  // ---- 渲染参数控制区 ----
  const renderParamControl = () => {
    if (!currentStep) return null;

    // 采摘工序 - 选项式
    if (currentStep.paramType === 'picking') {
      const options = dl.safeArr(currentStep.options, dl.getPickingStandards());
      return (
        <div className="param-control">
          <div className="param-label">
            <span className="param-label-text">采摘标准</span>
          </div>
          <div className="param-options picking-options">
            {options.map(opt => (
              <div
                key={opt.id}
                className={`param-option picking-option ${pickingSelection === opt.id ? 'selected' : ''}`}
                onClick={() => !feedback && setPickingSelection(opt.id)}
                style={{ flex: '1 1 calc(50% - 6px)', minWidth: '140px' }}
              >
                <div style={{ fontWeight: 600, marginBottom: 4 }}>{opt.name}</div>
                <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-ink-muted)' }}>{opt.desc}</div>
              </div>
            ))}
          </div>
          <div className="param-hint">💡 {(currentStep.hint || '请选择合适的采摘标准') + (selectedFamousTea && selectedFamousTea.picking ? ' 【' + selectedFamousTea.name + '采摘标准】' + String(selectedFamousTea.picking).slice(0, 140) : '')}</div>
        </div>
      );
    }

    // 杀青方式 + 数值
    if (currentStep.methodType === 'shaqing') {
      const methods = Object.values(SHAQING_METHODS);
      return (
        <div className="param-control">
          <div className="param-label">
            <span className="param-label-text">杀青方式</span>
          </div>
          <div className="param-options">
            {methods.map(method => {
              const isSuitable = !currentTea.suitableShaiqingMethods || currentTea.suitableShaiqingMethods.length === 0
                || currentTea.suitableShaiqingMethods.includes(method.id);
              const isBest = method.id === currentTea.bestShaiqingMethod;
              return (
                <div
                  key={method.id}
                  className={`param-option ${selectedMethods.shaqing === method.id ? 'selected' : ''}`}
                  onClick={() => !feedback && setSelectedMethods(prev => ({ ...prev, shaqing: method.id }))}
                  style={{
                    flex: '1 1 calc(50% - 8px)',
                    minWidth: '150px',
                    opacity: isSuitable ? 1 : 0.6
                  }}
                  title={method.desc}
                >
                  <div style={{ fontWeight: 600 }}>
                    {method.name}
                    {isBest && <span style={{ color: 'var(--accent-gold)', fontSize: 'var(--fs-xs)', marginLeft: 4 }}>★最佳</span>}
                  </div>
                  <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-ink-muted)', marginTop: 2 }}>
                    {method.aromaType || ''}
                  </div>
                </div>
              );
            })}
          </div>
          {selectedMethods.shaqing && (
            <div style={{
              fontSize: 'var(--fs-xs)', color: 'var(--text-ink-light)', marginTop: 8,
              padding: '8px 12px', background: 'var(--bg-rice)', borderRadius: 'var(--radius-sm)'
            }}>
              <strong>{SHAQING_METHODS[selectedMethods.shaqing].name}：</strong>
              {SHAQING_METHODS[selectedMethods.shaqing].desc}
            </div>
          )}
          <div style={{ marginTop: 16 }}>
            <div className="param-label">
              <span className="param-label-text">{effectiveStep.paramName || '温度'}</span>
              <span className="param-value">
                {paramValue}{effectiveStep.paramUnit || ''}
              </span>
            </div>
            <input
              type="range"
              className="param-slider"
              min={effectiveStep.paramMin || 0}
              max={effectiveStep.paramMax || 100}
              value={paramValue}
              onChange={(e) => setParamValue(parseInt(e.target.value))}
              disabled={!!feedback}
            />
            <div className="param-hint">💡 {effectiveStep.hint || ''}</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: 'var(--fs-xs)', color: 'var(--text-ink-muted)' }}>
              <span>{effectiveStep.paramMin || 0}{effectiveStep.paramUnit || ''}</span>
              <span style={{ color: 'var(--accent-jade)' }}>
                理想范围：{effectiveStep.idealRange?.[0] || 0}-{effectiveStep.idealRange?.[1] || 100}{effectiveStep.paramUnit || ''}
                {getTenderDelta() !== 0 && (
                  <span style={{ color: 'var(--accent-gold)', marginLeft: 6 }}>（已根据采摘嫩度调整）</span>
                )}
              </span>
              <span>{effectiveStep.paramMax || 100}{effectiveStep.paramUnit || ''}</span>
            </div>
            {renderTimeControl(effectiveStep)}
          </div>
        </div>
      );
    }

    // 干燥方式 + 数值
    if (currentStep.methodType === 'ganzao') {
      const methods = Object.values(GANZAO_METHODS);
      return (
        <div className="param-control">
          <div className="param-label">
            <span className="param-label-text">干燥方式</span>
          </div>
          <div className="param-options">
            {methods.map(method => {
              const isSuitable = !currentTea.suitableGanzaoMethods || currentTea.suitableGanzaoMethods.length === 0
                || currentTea.suitableGanzaoMethods.includes(method.id);
              const isBest = method.id === currentTea.bestGanzaoMethod;
              return (
                <div
                  key={method.id}
                  className={`param-option ${selectedMethods.ganzao === method.id ? 'selected' : ''}`}
                  onClick={() => !feedback && setSelectedMethods(prev => ({ ...prev, ganzao: method.id }))}
                  style={{
                    flex: '1 1 calc(33% - 8px)',
                    minWidth: '100px',
                    opacity: isSuitable ? 1 : 0.6
                  }}
                  title={method.desc}
                >
                  <div style={{ fontWeight: 600 }}>
                    {method.name}
                    {isBest && <span style={{ color: 'var(--accent-gold)', fontSize: 'var(--fs-xs)', marginLeft: 4 }}>★最佳</span>}
                  </div>
                </div>
              );
            })}
          </div>
          {selectedMethods.ganzao && (
            <div style={{
              fontSize: 'var(--fs-xs)', color: 'var(--text-ink-light)', marginTop: 8,
              padding: '8px 12px', background: 'var(--bg-rice)', borderRadius: 'var(--radius-sm)'
            }}>
              <strong>{GANZAO_METHODS[selectedMethods.ganzao].name}：</strong>
              {GANZAO_METHODS[selectedMethods.ganzao].desc}
            </div>
          )}
          <div style={{ marginTop: 16 }}>
            <div className="param-label">
              <span className="param-label-text">{effectiveStep.paramName || '温度'}</span>
              <span className="param-value">
                {paramValue}{effectiveStep.paramUnit || ''}
              </span>
            </div>
            <input
              type="range"
              className="param-slider"
              min={effectiveStep.paramMin || 0}
              max={effectiveStep.paramMax || 100}
              value={paramValue}
              onChange={(e) => setParamValue(parseInt(e.target.value))}
              disabled={!!feedback}
            />
            <div className="param-hint">💡 {effectiveStep.hint || ''}</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: 'var(--fs-xs)', color: 'var(--text-ink-muted)' }}>
              <span>{effectiveStep.paramMin || 0}{effectiveStep.paramUnit || ''}</span>
              <span style={{ color: 'var(--accent-jade)' }}>
                理想范围：{effectiveStep.idealRange?.[0] || 0}-{effectiveStep.idealRange?.[1] || 100}{effectiveStep.paramUnit || ''}
                {getTenderDelta() !== 0 && (
                  <span style={{ color: 'var(--accent-gold)', marginLeft: 6 }}>（已根据采摘嫩度调整）</span>
                )}
              </span>
              <span>{effectiveStep.paramMax || 100}{effectiveStep.paramUnit || ''}</span>
            </div>
            {renderTimeControl(effectiveStep)}
          </div>
        </div>
      );
    }

    // 普通数值滑块
    return (
      <div className="param-control">
        <div className="param-label">
          <span className="param-label-text">{effectiveStep.paramName || '参数'}</span>
          <span className="param-value">
            {paramValue}{effectiveStep.paramUnit || ''}
          </span>
        </div>
        <input
          type="range"
          className="param-slider"
          min={effectiveStep.paramMin || 0}
          max={effectiveStep.paramMax || 100}
          value={paramValue}
          onChange={(e) => setParamValue(parseInt(e.target.value))}
          disabled={!!feedback}
        />
        <div className="param-hint">💡 {effectiveStep.hint || ''}</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: 'var(--fs-xs)', color: 'var(--text-ink-muted)' }}>
          <span>{effectiveStep.paramMin || 0}{effectiveStep.paramUnit || ''}</span>
          <span style={{ color: 'var(--accent-jade)' }}>
            理想范围：{effectiveStep.idealRange?.[0] || 0}-{effectiveStep.idealRange?.[1] || 100}{effectiveStep.paramUnit || ''}
            {getTenderDelta() !== 0 && (
              <span style={{ color: 'var(--accent-gold)', marginLeft: 6 }}>（已根据采摘嫩度调整）</span>
            )}
          </span>
          <span>{effectiveStep.paramMax || 100}{effectiveStep.paramUnit || ''}</span>
        </div>
        {renderTimeControl(effectiveStep)}
      </div>
    );
  };

  // ====== 渲染 ======

  // 茶类选择界面
  if (!teaId || !currentTea) {
    return (
      <div className="craft-select-page">
        <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
          <button className="btn btn-ghost btn-sm" onClick={onBack || restart}>
            ← 返回
          </button>
          <h2 style={{ fontFamily: 'Noto Serif SC', fontSize: 'var(--fs-xl)' }}>工艺模拟</h2>
        </div>

        <div className="tea-select-header">
          <h2 className="tea-select-title">选择茶类</h2>
          <p className="tea-select-desc">选择一种茶，开始模拟它的初加工工艺流程</p>
        </div>

        <div className="tea-select-grid">
          {teaIds.map(id => {
            const tea = dl.getTea(id);
            return (
              <div
                key={id}
                className="tea-select-card"
                style={{ '--tea-color': tea.color }}
                onClick={() => selectTea(id)}
              >
                <div className="tea-select-icon" style={{ background: tea.color }}>
                  {tea.nameShort}
                </div>
                <div className="tea-select-name">{tea.name}</div>
                <div className="tea-select-ferment">{tea.ferment} · {(tea.steps?.length) || 0}道工序</div>
                <div className="tea-select-steps">
                  {(tea.steps || []).slice(0, 4).map((s) => (
                    <span key={s.id} className="step-tag" style={s.isCore ? { background: 'rgba(194,59,34,0.1)', color: 'var(--accent-cinnabar)' } : {}}>
                      {s.name}
                    </span>
                  ))}
                  {(tea.steps?.length || 0) > 4 && <span className="step-tag">…</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // 环境前提背景选择界面（制茶开始前）
  if (showEnvPicker && teaId && currentTea) {
    return (
      <div className="craft-select-page">
        <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
          <button className="btn btn-ghost btn-sm" onClick={() => { setTeaId(null); setShowEnvPicker(false); }}>
            ← 返回
          </button>
          <h2 style={{ fontFamily: 'Noto Serif SC', fontSize: 'var(--fs-xl)' }}>设定制茶环境</h2>
          <span style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-ink-muted)' }}>
            {currentTea.name} · 制茶开始前先确定今日天气
          </span>
        </div>

        <div className="tea-select-header">
          <h2 className="tea-select-title">选择环境前提背景</h2>
          <p className="tea-select-desc">天气与温湿度直接决定萎凋、晒青、发酵、渥堆、干燥等工序的合理参数——环境设定后，每道工序都会给出相应的调整提示。</p>
        </div>

        <div className="tea-select-grid">
          {ENVIRONMENTS.map(env => (
            <div
              key={env.id}
              className="tea-select-card"
              style={{ cursor: 'pointer' }}
              onClick={() => {
                setEnvironment(env.id);
                setShowEnvPicker(false);
                setCurrentStepIndex(0);
                setStepResults([]);
                setFeedback(null);
                setPickingSelection(null);
                setSelectedMethods({});
                setFinalScore(0);
                setFinalGrade('');
              }}
            >
              <div className="tea-select-icon" style={{ background: 'linear-gradient(135deg,#7A9E7E,#4A6B50)', fontSize: 22 }}>
                {env.icon}
              </div>
              <div className="tea-select-name">{env.name} · {env.temp} / {env.humidity}</div>
              <div className="tea-select-ferment" style={{ marginTop: 8, lineHeight: 1.7 }}>{env.desc}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 16 }}>
        <button className="btn btn-ghost btn-sm" onClick={onBack || restart}>
          ← 返回
        </button>
        <h2 style={{ fontFamily: 'Noto Serif SC', fontSize: 'var(--fs-xl)' }}>
          {currentTea.name}
          {selectedFamousTea && (
            <span style={{ fontSize: 'var(--fs-base)', color: 'var(--accent-jade)', fontWeight: 600, marginLeft: 8 }}>
              · {selectedFamousTea.name}档
            </span>
          )}
          <span style={{ fontSize: 'var(--fs-base)', color: 'var(--text-ink-muted)', fontWeight: 400, marginLeft: 8 }}>
            · {currentTea.ferment}
          </span>
        </h2>
      </div>

      {/* 环境前提状态条：天气 + 温湿度 + 当前工序环境影响 */}
      {getEnv() && (
        <div style={{
          marginBottom: 14, padding: '10px 14px', background: 'rgba(46,125,91,0.06)',
          border: '1px solid rgba(46,125,91,0.18)', borderRadius: 'var(--radius-sm)',
          display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap'
        }}>
          <span style={{ fontSize: 'var(--fs-base)' }}>{getEnv().icon}</span>
          <span style={{ fontWeight: 700, fontSize: 'var(--fs-sm)' }}>
            {getEnv().name} {getEnv().temp} · 湿度 {getEnv().humidity}
          </span>
          <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-ink-muted)', flex: '1 1 220px', lineHeight: 1.6 }}>
            {currentStep ? (getEnvAdjust(currentStep.id) ? getEnvAdjust(currentStep.id).note : getEnv().desc) : getEnv().desc}
          </span>
        </div>
      )}

      {renderFamousPicker()}

      {selectedFamousTea && (
        <div style={{
          marginBottom: 18, padding: '12px 16px', background: 'rgba(46,125,91,0.07)',
          borderLeft: '3px solid var(--accent-jade)', borderRadius: 'var(--radius-sm)',
          fontSize: 'var(--fs-xs)', lineHeight: 1.8, color: 'var(--text-ink-light)'
        }}>
          <div style={{ marginBottom: 4 }}>
            <strong style={{ color: 'var(--accent-jade)' }}>「{selectedFamousTea.name}」完整工艺链：</strong>
            {selectedFamousTea.craftChain}
          </div>
          {selectedFamousTea.quality && (
            <div>
              <strong style={{ color: 'var(--accent-gold)' }}>品质风格：</strong>
              {selectedFamousTea.quality}
            </div>
          )}
          {selectedFamousTea.standards && selectedFamousTea.standards.length > 0 && (
            <div style={{ marginTop: 2, color: 'var(--text-ink-muted)' }}>
              <strong>标准依据：</strong>{selectedFamousTea.standards.slice(0, 3).join('；')}
              {selectedFamousTea.standards.length > 3 ? ' 等' : ''}
            </div>
          )}
        </div>
      )}

      <div className="craft-layout">
        <div className="craft-main">
          {/* 工艺流程 */}
          <div className="process-flow">
            <div className="process-flow-title">
              工艺流程
              <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-ink-muted)', fontWeight: 400 }}>
                第 {currentStepIndex + 1} / {steps.length} 步
              </span>
            </div>
            <div className="process-steps">
              {steps.map((step, idx) => {
                let status = 'pending';
                if (idx < currentStepIndex) status = 'done';
                else if (idx === currentStepIndex) status = 'active';

                let circleClass = 'step-circle';
                if (status === 'done') circleClass += ' done';
                else if (status === 'active') circleClass += ' active';

                const stepResult = stepResults[idx];
                if (stepResult && stepResult.score < 60) {
                  circleClass += ' wrong';
                }

                return (
                  <React.Fragment key={step.id}>
                    <div className="process-step-node">
                      <div className={circleClass}>
                        {status === 'done' ? '✓' : idx + 1}
                      </div>
                      <div className="step-name">{step.name}</div>
                      {step.isCore && (
                        <div style={{ fontSize: '10px', color: 'var(--accent-cinnabar)', fontWeight: 600 }}>核心</div>
                      )}
                    </div>
                    {idx < steps.length - 1 && (
                      <div className="step-arrow">→</div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* 当前工序操作区 */}
          <div className="current-step-panel">
            <div className="current-step-header">
              <div className="current-step-name">{currentStep.name}</div>
              {currentStep.isCore && <span className="current-step-badge">核心工序</span>}
            </div>

            <div className="step-description">
              {currentStep.description}
            </div>

            {renderParamControl()}

            {feedback && (
              <div className={`step-feedback feedback-${feedback.type}`}>
                <div className="feedback-title">
                  {feedback.type === 'success' ? '✓ 恰到好处' : feedback.type === 'warning' ? '⚠ 尚可改进' : '✗ 操作失误'}
                </div>
                <div>{feedback.text}</div>
              </div>
            )}

            <div className="step-actions">
              <button
                className="btn btn-primary"
                onClick={executeStep}
                disabled={!canExecute()}
              >
                {currentStepIndex < steps.length - 1 ? '完成此工序 →' : '完成制茶，查看成品'}
              </button>
            </div>
          </div>
        </div>

        {/* 茶叶状态面板 */}
        <div className="tea-status-panel">
          <div className="status-title">茶叶状态</div>

          <div className="tea-visual">
            <div
              className="tea-leaves-ring"
              style={{
                '--tea-leaf-color': teaState.leafColor,
                '--tea-leaf-color-light': teaState.leafColorLight
              }}
            ></div>
            <div
              className="tea-cup"
              style={{ '--tea-soup-color': teaState.soupColor }}
            ></div>
          </div>

          <div className="status-section">
            <div className="status-label">干茶色泽</div>
            <div className="status-value" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 16, height: 16, borderRadius: '50%', background: teaState.leafColor, display: 'inline-block' }}></span>
              {getLeafColorDescription(currentTea, teaState)}
            </div>
          </div>

          <div className="status-section">
            <div className="status-label">茶汤色泽</div>
            <div className="status-value" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 16, height: 16, borderRadius: '50%', background: teaState.soupColor, display: 'inline-block', border: '1px solid rgba(0,0,0,0.1)' }}></span>
              {getSoupColorDescription(currentTea, teaState)}
            </div>
          </div>

          <div className="status-section">
            <div className="status-label">工艺进度</div>
            <div className="status-indicators">
              <div className="status-indicator">
                <div style={{ fontSize: 'var(--fs-sm)', fontWeight: 600 }}>{Math.round(teaState.oxidation)}%</div>
                <div className="indicator-bar">
                  <div className="indicator-fill" style={{ width: `${teaState.oxidation}%`, background: currentTea.color }}></div>
                </div>
                <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-ink-muted)', marginTop: 4 }}>发酵度</div>
              </div>
              <div className="status-indicator">
                <div style={{ fontSize: 'var(--fs-sm)', fontWeight: 600 }}>{Math.round(teaState.dryness)}%</div>
                <div className="indicator-bar">
                  <div className="indicator-fill" style={{ width: `${teaState.dryness}%`, background: 'var(--accent-gold)' }}></div>
                </div>
                <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-ink-muted)', marginTop: 4 }}>干燥度</div>
              </div>
            </div>
          </div>

          <div className="status-section">
            <div className="status-label">当前得分</div>
            <div className="status-value" style={{ fontSize: 'var(--fs-xl)', color: 'var(--accent-cinnabar)' }}>
              {stepResults.length > 0
                ? Math.round(stepResults.reduce((sum, s) => sum + s.score, 0) / stepResults.length)
                : '--'}
              <span style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-ink-muted)', fontWeight: 400 }}> / 100</span>
            </div>
          </div>

          {pickingSelection && getTenderDelta() !== 0 && (
            <div className="status-section" style={{
              background: 'rgba(184, 134, 11, 0.08)',
              padding: 12,
              borderRadius: 'var(--radius-sm)',
              fontSize: 'var(--fs-xs)',
              lineHeight: 1.6,
              color: 'var(--accent-gold)'
            }}>
              <strong>原料提示：</strong>
              {getTenderDelta() > 0 ? '原料偏成熟，后续工艺参数已相应上调。' : '原料偏嫩，后续工艺参数已相应下调。'}
            </div>
          )}
        </div>
      </div>

      {/* 结果弹窗 */}
      {showResult && (
        <div className="result-overlay" onClick={restart}>
          <div className="result-modal" onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-ink-muted)' }}>制茶完成</div>
            <div className={`result-grade ${finalGrade}`} style={{ color: gradeText[finalGrade].color }}>
              {gradeText[finalGrade].name}
            </div>
            <div className="result-tea-name">
              {selectedFamousTea ? `${currentTea.name} · ${selectedFamousTea.name}` : currentTea.name}
            </div>
            <div className="result-subtitle">综合得分 {finalScore} 分</div>

            <div className="result-comment">
              {gradeComments[finalGrade]}
            </div>

            <div className="result-scores">
              {steps.map((step, idx) => {
                const result = stepResults[idx];
                const score = result?.score || 0;
                return (
                  <div key={step.id} className="result-score-row">
                    <span style={step.isCore ? { fontWeight: 600, color: 'var(--accent-cinnabar)' } : {}}>
                      {step.isCore && '★ '}{step.name}
                    </span>
                    <span style={{
                      color: score >= 90 ? 'var(--accent-jade)' : score >= 70 ? 'var(--accent-gold)' : 'var(--accent-cinnabar)',
                      fontWeight: 600
                    }}>
                      {score}分
                    </span>
                  </div>
                );
              })}
            </div>

            <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={(e) => { e.stopPropagation(); setShowReport(true); }}>
                查看详细报告
              </button>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={restart}>
                换一种茶
              </button>
              <button
                className="btn btn-primary"
                style={{ flex: 1 }}
                onClick={() => selectTea(teaId)}
              >
                再来一次
              </button>
            </div>
          </div>
        </div>
      )}

      {renderReport()}
    </div>
  );
}

// 辅助函数：叶色描述
function getLeafColorDescription(tea, state) {
  if (!tea || !state) return '';
  const ox = state.oxidation || 0;
  if (tea.id === 'green') {
    if (ox > 20) return '色泽偏黄，发酵过度';
    return '翠绿鲜活';
  }
  if (tea.id === 'white') return '毫白芽嫩，色泽银灰绿';
  if (tea.id === 'yellow') return '黄润光亮';
  if (tea.id === 'oolong') {
    if (ox > 60) return '色泽偏红，发酵稍重';
    return '青绿砂绿';
  }
  if (tea.id === 'red') return '乌润有光';
  if (tea.id === 'dark') return '黑褐油润';
  return '色泽正常';
}

// 辅助函数：汤色描述
function getSoupColorDescription(tea, state) {
  if (!tea || !state) return '';
  const ox = state.oxidation || 0;
  if (tea.id === 'green') return '嫩绿清澈';
  if (tea.id === 'white') return '浅杏黄明亮';
  if (tea.id === 'yellow') return '黄亮明净';
  if (tea.id === 'oolong') {
    return ox > 50 ? '橙黄明亮' : '金黄透亮';
  }
  if (tea.id === 'red') return '红艳明亮';
  if (tea.id === 'dark') return '红浓明亮';
  return '汤色正常';
}

// ============================================================
// 名优茶参数档套用：将名优茶参数行（"项目 | 参数 | 来源"）解析，
// 按工序关键词映射到类级 steps，覆盖 idealRange/idealValue/paramUnit/hint
// 参数行示例："杀青 | 锅温 200~240℃，投叶量 120~150g/锅 | DB33/T 239-2023"
// ============================================================
function applyFamousParams(tea, famousTea) {
  if (!tea || !famousTea) return tea;
  const dl = window.TeaDataLayer;
  const params = dl.safeArr(famousTea.params, []);
  if (!params.length) return tea;

  const steps = dl.safeArr(tea.steps, []).map(s => ({
    ...s,
    effects: dl.safeObj(s.effects, {})
  }));

  const STEP_KEYWORDS = {
    caizhai: ['采摘', '鲜叶'],
    weidiao: ['萎凋', '摊放', '摊青'],
    shaqing: ['杀青', '炒青', '蒸青', '青锅', '锅炒'],
    rounian: ['揉捻', '揉切'],
    menhuang: ['闷黄', '初包', '堆闷', '包黄'],
    zuoqing: ['做青', '摇青', '晾青', '碰青'],
    fajiao: ['发酵'],
    wodui: ['渥堆', '堆闷'],
    ganzao: ['干燥', '烘干', '烘焙', '晒干', '炒干', '辉锅'],
    chabei: ['茶坯', '复火'],
    yinhua: ['窨花', '窨制', '拌和'],
    tonghua: ['通花'],
    hongbei: ['烘焙', '烘青']
  };

  params.forEach(p => {
    const rawParts = String(p || '').split('|').map(x => x.trim()).filter(Boolean);
    const item = rawParts[0] || '';
    if (!item || rawParts.length < 2) return;

    // 参数列定位：项目名之后的 1~3 列中，取第一个含单位（℃/小时/分钟）且有数字的列
    // （兼容 "项目|参数|来源" 与 "项目|设备|参数|说明" 两种表格式）
    let val = '';
    for (let i = 1; i < Math.min(rawParts.length, 4); i++) {
      const cand = rawParts[i];
      if (/(℃|°|温度|小时|分钟|min)/i.test(cand) && /\d/.test(cand)) { val = cand; break; }
    }
    if (!val) return;

    // 按关键词找到目标工序
    let target = null;
    Object.keys(STEP_KEYWORDS).some(sid => {
      if (STEP_KEYWORDS[sid].some(kw => item.includes(kw))) {
        target = steps.find(s => s.id === sid) || null;
        return !!target;
      }
      return false;
    });
    if (!target) return;

    const rangeMatch = val.match(/(\d+(?:\.\d+)?)\s*[~～—–-]\s*(\d+(?:\.\d+)?)/);
    if (rangeMatch) {
      // 单位以数值范围后的字符为准（避免整行其他数值的单位干扰）
      const afterUnit = val.slice(rangeMatch.index + rangeMatch[0].length, rangeMatch.index + rangeMatch[0].length + 6);
      const isTemp = /[℃°]/.test(afterUnit);
      const isHour = /小时|h\b/i.test(afterUnit);
      const isMin = /分钟|min/i.test(afterUnit);

      const lo0 = parseFloat(rangeMatch[1]);
      const hi0 = parseFloat(rangeMatch[2]);
      // 降序写法（如"240～200℃"表示 240 渐降至 200）时交换为升序区间
      const lo = Math.min(lo0, hi0);
      const hi = Math.max(lo0, hi0);
      if (isTemp) {
        target.paramUnit = '℃';
        target.idealRange = [Math.round(lo), Math.round(hi)];
        const curLo = target.paramMin == null ? lo : target.paramMin;
        const curHi = target.paramMax == null ? hi : target.paramMax;
        target.paramMin = Math.min(curLo, Math.round(lo) - 30);
        target.paramMax = Math.max(curHi, Math.round(hi) + 30);
        target.idealValue = Math.round((lo + hi) / 2);
      } else if (isHour) {
        target.paramUnit = '小时';
        target.idealRange = [lo, hi];
        const curLo = target.paramMin == null ? lo : target.paramMin;
        const curHi = target.paramMax == null ? hi : target.paramMax;
        target.paramMin = Math.max(1, Math.round(Math.min(curLo, lo * 0.5)));
        target.paramMax = Math.round(Math.max(curHi, hi * 1.5));
        target.idealValue = Math.round((lo + hi) / 2 * 10) / 10;
      } else if (isMin) {
        target.paramUnit = '分钟';
        target.idealRange = [Math.round(lo), Math.round(hi)];
        const curLo = target.paramMin == null ? lo : target.paramMin;
        const curHi = target.paramMax == null ? hi : target.paramMax;
        target.paramMin = Math.min(curLo, Math.round(lo) - 10);
        target.paramMax = Math.max(curHi, Math.round(hi) + 20);
        target.idealValue = Math.round((lo + hi) / 2);
      }
      target._hintNote = val;
    } else if (!rangeMatch) {
      // 单数值（如"干燥温度≤65℃"）：作为理想值参考
      const single = val.match(/(\d+(?:\.\d+)?)/);
      if (single && /[℃°]|温度/.test(val)) {
        const v = parseFloat(single[1]);
        target.idealValue = v;
        target._hintNote = val;
      }
    }
  });

  // 将名优茶参数说明并入 hint，方便学习者对照
  steps.forEach(s => {
    if (s._hintNote) {
      s.hint = (s.hint ? s.hint + ' ' : '') + '【名优茶参数】' + s._hintNote;
      delete s._hintNote;
    }
  });

  return { ...tea, steps };
}

window.CraftSimulator = CraftSimulator;
