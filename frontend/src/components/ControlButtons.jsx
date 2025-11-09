import React from 'react';
import './ControlButtons.css';

const ControlButtons = ({
  onStartTraining,
  onStopTraining,
  onPlayPolicy,
  isTraining,
  isPlayback,
  canPlayPolicy
}) => {
  return (
    <div className="control-buttons">
      <button
        className="btn btn-primary"
        onClick={isTraining ? onStopTraining : onStartTraining}
        disabled={isPlayback}
      >
        {isTraining ? 'Stop Training' : 'Start Training'}
      </button>

      <button
        className="btn btn-secondary"
        onClick={onPlayPolicy}
        disabled={isTraining || isPlayback || !canPlayPolicy}
      >
        {isPlayback ? 'Playing...' : 'Play Policy'}
      </button>
    </div>
  );
};

export default ControlButtons;
