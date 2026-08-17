import React from 'react';
import './ControlButtons.css';

const ControlButtons = ({
  onStartTraining,
  onStopTraining,
  onPlayPolicy,
  onStopPlayback,
  onEvaluatePolicy,
  isTraining,
  isPlayback,
  isEvaluating = false,
  canPlayPolicy,
  disabled = false
}) => {
  return (
    <div className="control-buttons">
      <button
        className="btn btn-primary"
        onClick={isTraining ? onStopTraining : onStartTraining}
        disabled={isPlayback || isEvaluating || disabled}
      >
        {isTraining ? 'Stop Training' : 'Start Training'}
      </button>

      {/* Validation Error Message */}
      {disabled && !isTraining && (
        <p className="validation-error">
          ⚠️ Fix parameter errors before training
        </p>
      )}

      <button
        className="btn btn-secondary"
        onClick={isPlayback ? onStopPlayback : onPlayPolicy}
        disabled={isTraining || isEvaluating || !canPlayPolicy}
      >
        {isPlayback ? 'Stop Playback' : 'Play Policy'}
      </button>

      <button
        className="btn btn-secondary"
        onClick={onEvaluatePolicy}
        disabled={isTraining || isPlayback || isEvaluating || !canPlayPolicy}
      >
        {isEvaluating ? 'Evaluating…' : 'Evaluate Policy'}
      </button>
    </div>
  );
};

export default ControlButtons;
