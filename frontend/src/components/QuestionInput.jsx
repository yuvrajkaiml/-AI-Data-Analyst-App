import { useState } from 'react';

function QuestionInput({ onAsk, disabled }) {
  const [question, setQuestion] = useState('');

  const handleSubmit = () => {
    if (question.trim()) {
      onAsk(question);
      setQuestion('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="question-input-container">
      <h3>Ask a Question</h3>
      <div className="input-group">
        <textarea
          className="input-field"
          placeholder="Enter your question about the data..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          rows={2}
        />
        <button
          className="submit-button"
          onClick={handleSubmit}
          disabled={disabled || !question.trim()}
        >
          {disabled ? 'Loading...' : 'Ask'}
        </button>
      </div>
    </div>
  );
}

export default QuestionInput;
