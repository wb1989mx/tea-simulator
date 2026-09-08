// 知识问答组件
function Quiz({ onBack, onAnswered }) {
  const allQuestions = window.QUIZ_QUESTIONS;
  const TOTAL_QUESTIONS = 10;
  
  const [questions, setQuestions] = React.useState([]);
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [selectedAnswer, setSelectedAnswer] = React.useState(null);
  const [showFeedback, setShowFeedback] = React.useState(false);
  const [score, setScore] = React.useState(0);
  const [correctCount, setCorrectCount] = React.useState(0);
  const [gameOver, setGameOver] = React.useState(false);
  const [answerHistory, setAnswerHistory] = React.useState([]);
  
  React.useEffect(() => {
    startNewGame();
  }, []);
  
  const startNewGame = () => {
    const shuffled = [...allQuestions].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, TOTAL_QUESTIONS);
    setQuestions(selected);
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setShowFeedback(false);
    setScore(0);
    setCorrectCount(0);
    setGameOver(false);
    setAnswerHistory([]);
  };
  
  const currentQuestion = questions[currentIndex];
  const progress = questions.length > 0 ? ((currentIndex) / questions.length) * 100 : 0;
  
  const handleSelect = (index) => {
    if (showFeedback) return;
    
    setSelectedAnswer(index);
    setShowFeedback(true);
    
    const isCorrect = index === currentQuestion.answer;
    if (isCorrect) {
      setScore(prev => prev + 10);
      setCorrectCount(prev => prev + 1);
    }
    
    setAnswerHistory(prev => [...prev, {
      question: currentQuestion.question,
      selected: index,
      correct: currentQuestion.answer,
      isCorrect
    }]);
    
    if (onAnswered && isCorrect) {
      onAnswered();
    }
  };
  
  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
    } else {
      setGameOver(true);
    }
  };
  
  const getResultLevel = () => {
    const percentage = (correctCount / TOTAL_QUESTIONS) * 100;
    if (percentage >= 90) return { name: '茶学宗师', color: 'var(--accent-gold)', emoji: '🏆' };
    if (percentage >= 70) return { name: '品茶行家', color: 'var(--accent-jade)', emoji: '🎖️' };
    if (percentage >= 50) return { name: '茶学新秀', color: 'var(--bamboo)', emoji: '🌱' };
    return { name: '继续学习', color: 'var(--accent-cinnabar)', emoji: '📚' };
  };
  
  if (gameOver) {
    const level = getResultLevel();
    return (
      <div className="quiz-container">
        <div className="quiz-result">
          <div style={{ fontSize: 48 }}>{level.emoji}</div>
          <div style={{ fontFamily: 'Noto Serif SC', fontSize: 'var(--fs-lg)', color: level.color, fontWeight: 700, marginTop: 8 }}>
            {level.name}
          </div>
          <div className="quiz-result-score" style={{ color: level.color }}>
            {score}
          </div>
          <div className="quiz-result-label">本轮得分</div>
          
          <div className="quiz-result-stats">
            <div className="quiz-result-stat">
              <div className="quiz-result-stat-num" style={{ color: 'var(--accent-jade)' }}>{correctCount}</div>
              <div className="quiz-result-stat-label">答对</div>
            </div>
            <div className="quiz-result-stat">
              <div className="quiz-result-stat-num" style={{ color: 'var(--accent-cinnabar)' }}>{TOTAL_QUESTIONS - correctCount}</div>
              <div className="quiz-result-stat-label">答错</div>
            </div>
            <div className="quiz-result-stat">
              <div className="quiz-result-stat-num" style={{ color: level.color }}>
                {Math.round((correctCount / TOTAL_QUESTIONS) * 100)}%
              </div>
              <div className="quiz-result-stat-label">正确率</div>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button className="btn btn-secondary" onClick={onBack}>返回首页</button>
            <button className="btn btn-primary" onClick={startNewGame}>再来一轮</button>
          </div>
        </div>
      </div>
    );
  }
  
  if (questions.length === 0) return null;
  
  return (
    <div className="quiz-container">
      <div className="quiz-header">
        <h2 className="quiz-title">知识问答挑战</h2>
        <p style={{ color: 'var(--text-ink-light)' }}>考验你的茶叶知识，答对得分，还有详细解析</p>
      </div>
      
      <div className="quiz-score-bar">
        <div className="quiz-score-item">
          <div className="quiz-score-num">{score}</div>
          <div className="quiz-score-label">得分</div>
        </div>
        <div className="quiz-progress">
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--fs-xs)', color: 'var(--text-ink-muted)', marginBottom: 6 }}>
            <span>第 {currentIndex + 1} 题 / 共 {TOTAL_QUESTIONS} 题</span>
            <span>{correctCount} 对</span>
          </div>
          <div className="quiz-progress-bar">
            <div className="quiz-progress-fill" style={{ width: `${progress}%` }}></div>
          </div>
        </div>
        <div className="quiz-score-item">
          <div className="quiz-score-num" style={{ color: 'var(--accent-jade)' }}>{correctCount}</div>
          <div className="quiz-score-label">答对</div>
        </div>
      </div>
      
      <div className="quiz-question-card">
        <div className="quiz-question-num">QUESTION {currentIndex + 1}</div>
        <div className="quiz-question">{currentQuestion.question}</div>
        
        <div className="quiz-options">
          {currentQuestion.options.map((opt, idx) => {
            let optClass = 'quiz-option';
            if (showFeedback) {
              if (idx === currentQuestion.answer) optClass += ' correct';
              else if (idx === selectedAnswer && idx !== currentQuestion.answer) optClass += ' wrong';
            }
            
            const letter = ['A', 'B', 'C', 'D'][idx];
            
            return (
              <button
                key={idx}
                className={optClass}
                onClick={() => handleSelect(idx)}
                disabled={showFeedback}
              >
                <span className="quiz-option-letter">{letter}</span>
                <span>{opt}</span>
              </button>
            );
          })}
        </div>
        
        {showFeedback && (
          <div className={`quiz-feedback ${selectedAnswer === currentQuestion.answer ? 'correct' : 'wrong'}`}>
            <div className={`quiz-feedback-title ${selectedAnswer === currentQuestion.answer ? 'correct' : 'wrong'}`}>
              {selectedAnswer === currentQuestion.answer ? '✓ 回答正确！+10分' : '✗ 回答错误'}
            </div>
            <div style={{ color: 'var(--text-ink-light)' }}>
              <strong>解析：</strong>{currentQuestion.explanation}
            </div>
          </div>
        )}
      </div>
      
      <div className="quiz-actions">
        {showFeedback && (
          <button className="btn btn-primary" onClick={nextQuestion}>
            {currentIndex < questions.length - 1 ? '下一题 →' : '查看结果'}
          </button>
        )}
      </div>
    </div>
  );
}

window.Quiz = Quiz;
