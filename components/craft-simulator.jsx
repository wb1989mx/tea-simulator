// ============================================================
// 制茶模拟器组件
// 使用 TeaDataLayer 安全访问数据，字段缺失时不崩溃
// ============================================================

function CraftSimulator({ initialTeaId, onBack, onComplete, progress }) {
  const dl = window.TeaDataLayer;

  // ---- 状态 ----
  const [teaId, setTeaId] = React.useState(initialTeaId || null);
  const [currentStepIndex, setCurrentStepIndex] = React.useState(0);
  const [paramValue, setParamValue] = React.useState(0);
  const [stepResults, setStepResults] = React.useState([]);
  const [feedback, setFeedback] = React.useState(null);
  const [showResult, setShowResult] = React.useState(false);
  const [showReport, setShowReport] = React.useState(false);
  const [finalScore, setFinalScore] = React.useState(0);
  const [finalGrade, setFinalGrade] = React.useState('');
  const [pickingSelection, setPickingSelection] = React.useState(null);
  const [selectedMethods, setSelectedMethods] = React.useState({});
  const [teaState, setTeaState] = React.useState(dl.getInitialTeaState(initialTeaId || 'green'));

  // ---- 派生数据（防御性读取） ----
  const currentTea = teaId ? dl.getTea(teaId) : null;
  const steps = currentTea ? dl.safeArr(currentTea.steps, []) : [];
  const currentStep = steps[currentStepIndex] || null;
  const SHAQING_METHODS = dl.getShaqingMethods();
  const GANZAO_METHODS = dl.getGanzaoMethods();
  const teaIds = dl.TEA_IDS;

  // ---- 嫩度偏差 ----
  const getTenderDelta = () => {
    if (!pickingSelection || !currentTea) return 0;
    const pick = dl.getPickingById(pickingSelection);
    const ideal = dl.getPickingById(currentTea.idealPicking);
    if (!pick || !ideal) return 0;
    return pick.tenderLevel - ideal.tenderLevel;
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
    setFeedback(null);
  }, [currentStepIndex, teaId]);

  // ---- 选择茶类 ----
  const selectTea = (id) => {
    const tea = dl.getTea(id);
    setTeaId(id);
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

  // ---- 采摘得分 ----
  const calculatePickingScore = () => {
    if (!pickingSelection || !currentTea) return { score: 0, feedback: null };

    const pick = dl.getPickingById(pickingSelection);
    const idealPick = dl.getPickingById(currentTea.idealPicking);
    const tenderRange = currentTea.pickingTenderRange || [0, 5];
    const tenderMin = tenderRange[0];
    const tenderMax = tenderRange[1];

    if (!pick || !idealPick) return { score: 60, feedback: { type: 'warning', text: '采摘标准无法判定，取默认分。', quality: -20 } };

    const level = pick.tenderLevel;
    const idealLevel = idealPick.tenderLevel;
    const dist = Math.abs(level - idealLevel);
    const range = Math.max(tenderMax - tenderMin, 2);
    const score = Math.max(0, Math.round(95 - dist * dist * 15));

    let type, text;
    if (dist === 0) {
      type = 'success';
      text = `采摘标准完美！${pick.name}正是${currentTea.name}的理想采摘标准，芽叶嫩度恰到好处。`;
    } else if (level < idealLevel) {
      type = 'warning';
      text = `采摘偏嫩。${pick.name}比标准更细嫩，虽外形更秀丽但内含物稍欠，后续工艺需相应调整。`;
    } else if (dist <= 1) {
      type = 'warning';
      text = `采摘稍偏成熟。${pick.name}比标准略老，滋味更醇厚但外形稍逊，需在后续工序中做相应调整。`;
    } else {
      type = 'error';
      text = `采摘偏差较大！${pick.name}与${currentTea.name}的标准采摘嫩度相差${dist}级，会严重影响最终品质。`;
    }

    return { score, feedback: { type, text, quality: -(100 - score) } };
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
    const score = calculateParamScore(effectiveStep, paramValue, suitability);
    const method = SHAQING_METHODS[selectedMethods.shaqing];
    const methodText = method ? `（${method.name}杀青，${method.aromaType || ''}）` : '';

    const fb = getFeedback(effectiveStep, paramValue, score, { methodBonus: method });
    if (suitability < 0.9 && currentTea.bestShaiqingMethod && selectedMethods.shaqing !== currentTea.bestShaiqingMethod) {
      fb.text = fb.text + ' 注：此杀青方式对该茶类并非最佳，香气与色泽会受影响。';
    }

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
    const score = calculateParamScore(effectiveStep, paramValue, suitability);
    const method = GANZAO_METHODS[selectedMethods.ganzao];

    const fb = getFeedback(effectiveStep, paramValue, score, { methodBonus: method });
    if (suitability < 0.9 && currentTea.bestGanzaoMethod && selectedMethods.ganzao !== currentTea.bestGanzaoMethod) {
      fb.text = fb.text + ' 注：此干燥方式对该茶类并非最佳。';
    }

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
    // 普通参数步骤
    const score = calculateParamScore(effectiveStep, paramValue);
    const fb = getFeedback(effectiveStep, paramValue, score);
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
          <div className="param-hint">💡 {currentStep.hint || '请选择合适的采摘标准'}</div>
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

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
        <button className="btn btn-ghost btn-sm" onClick={onBack || restart}>
          ← 返回
        </button>
        <h2 style={{ fontFamily: 'Noto Serif SC', fontSize: 'var(--fs-xl)' }}>
          {currentTea.name}
          <span style={{ fontSize: 'var(--fs-base)', color: 'var(--text-ink-muted)', fontWeight: 400, marginLeft: 8 }}>
            · {currentTea.ferment}
          </span>
        </h2>
      </div>

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
            <div className="result-tea-name">{currentTea.name}</div>
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

window.CraftSimulator = CraftSimulator;
