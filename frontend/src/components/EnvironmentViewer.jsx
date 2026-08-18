import React from 'react';
import './EnvironmentViewer.css';

// Arrow overlay per environment: index = action. Shows the action the
// agent CHOSE - on slippery FrozenLake the resulting move may differ,
// which is exactly the teaching moment.
const ACTION_ARROWS = {
  'CartPole-v1': ['⬅', '➡'],
  'FrozenLake-v1': ['⬅', '⬇', '➡', '⬆'],       // LEFT, DOWN, RIGHT, UP
  'FrozenLake-v1-NoSlip': ['⬅', '⬇', '➡', '⬆'],
  'MountainCar-v0': ['⬅', '•', '➡'],           // push left, no push, push right
};

const EnvironmentViewer = ({ frame, episode, timesteps, playbackStep, playbackAction, environment, isTraining, isPlayback, trainingComplete }) => {
  const getStatusText = () => {
    if (isPlayback) {
      return playbackStep != null ? `Playing Policy - Timestep ${playbackStep}` : 'Playing Policy';
    }
    if (isTraining) {
      // Timestep count is only reported by timestep-budgeted algorithms (e.g. DQN)
      const timestepInfo = timesteps != null ? ` - Timestep ${timesteps}` : '';
      return `Training - Episode ${episode}${timestepInfo}`;
    }
    if (trainingComplete) return 'Ready';
    return 'Ready to train a policy';
  };

  const getStatusClass = () => {
    if (isPlayback) return 'playback';
    if (isTraining) return 'training';
    return 'ready';
  };

  return (
    <div className="environment-viewer">
      <h2>Environment</h2>
      <div className={`status-indicator ${getStatusClass()}`}>
        {getStatusText()}
      </div>

      <div className="frame-container">
        {frame ? (
          <img
            src={`data:image/png;base64,${frame}`}
            alt="Environment state"
            className="environment-frame"
          />
        ) : (
          <div className="placeholder">
            <p>No frame to display</p>
            <p className="hint">Start training to see the environment</p>
          </div>
        )}

        {/* The action the agent takes at the shown playback frame */}
        {frame && playbackAction != null && ACTION_ARROWS[environment]?.[playbackAction] && (
          <div
            className="action-arrow"
            role="img"
            aria-label="Action taken by the agent"
            title="Action taken by the agent"
          >
            {ACTION_ARROWS[environment][playbackAction]}
          </div>
        )}
      </div>
    </div>
  );
};

export default EnvironmentViewer;
