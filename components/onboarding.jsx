// 新手引导组件
function Onboarding({ onClose, onStart }) {
  const [step, setStep] = React.useState(0);
  
  const steps = [
    {
      title: '欢迎来到制茶模拟器',
      desc: '在这里，你将亲手体验六大茶类的初加工工艺流程，从采摘到干燥，在动手操作中学习茶叶知识。',
      features: [
        '从采摘开始，完整模拟六大茶类初加工',
        '原料嫩度决定后续工艺，体验「看茶做茶」',
        '参数失误会影响最终品质，玩中学更深刻',
      ]
    },
    {
      title: '工艺模拟：亲手制茶',
      desc: '每种茶有完整的工序流程，从采摘到干燥。每一步都有可以调节的参数和方式选择——',
      features: [
        '采摘嫩度：不同茶类标准不同，还影响后续工艺参数',
        '杀青方式：炒青、蒸青、烘青、晒青，各有特色',
        '温度时间：杀青温度、萎凋时间、发酵程度等',
        '每一步都影响茶叶颜色、香气和最终品质'
      ]
    },
    {
      title: '可视化报告 & 更多学习',
      desc: '每次制茶后会生成详细报告，帮你复盘提升。还有多种方式帮你巩固知识——',
      features: [
        '工艺报告：各工序得分 + 品质维度 + 优化建议',
        '知识问答：随机出题，即时解析',
        '茶叶图鉴：六大茶类完整资料卡',
        '成就系统：追踪进度，集齐徽章，成为制茶宗师！'
      ]
    }
  ];
  
  const currentStep = steps[step];
  const isLast = step === steps.length - 1;
  
  return (
    <div className="onboarding-overlay">
      <div className="onboarding-modal">
        <div className="onboarding-step-num">第 {step + 1} / {steps.length} 步</div>
        <h2 className="onboarding-title">{currentStep.title}</h2>
        <p className="onboarding-desc">{currentStep.desc}</p>
        
        <ul className="onboarding-features">
          {currentStep.features.map((f, i) => (
            <li key={i}>{f}</li>
          ))}
        </ul>
        
        <div className="onboarding-actions">
          <div className="onboarding-dots">
            {steps.map((_, i) => (
              <div key={i} className={`onboarding-dot ${i === step ? 'active' : ''}`}></div>
            ))}
          </div>
          
          <div style={{ display: 'flex', gap: 12 }}>
            {step > 0 && (
              <button className="btn btn-ghost btn-sm" onClick={() => setStep(step - 1)}>
                上一步
              </button>
            )}
            {isLast ? (
              <button className="btn btn-primary btn-sm" onClick={onClose}>
                开始探索
              </button>
            ) : (
              <button className="btn btn-primary btn-sm" onClick={() => setStep(step + 1)}>
                下一步
              </button>
            )}
          </div>
        </div>
        
        <div style={{ marginTop: 16, textAlign: 'center' }}>
          <button 
            className="btn btn-ghost btn-sm" 
            onClick={onClose}
            style={{ fontSize: 'var(--fs-xs)' }}
          >
            跳过引导
          </button>
        </div>
      </div>
    </div>
  );
}

window.Onboarding = Onboarding;
