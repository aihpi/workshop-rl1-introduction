import React from 'react';
import '../LearningVisualization.css';

/**
 * Training diagnostics for DQN: current exploration rate, episode length
 * and total timesteps.
 *
 * Receives learningData with a diagnostics key:
 * { exploration_rate: float, episode_length: int,
 *   total_timesteps: int, episode: int }
 */
const DQNDiagnostics = ({ learningData }) => {
  const diagnostics = learningData?.diagnostics;

  if (!diagnostics) {
    return null;
  }

  const formatValue = (value, digits = 3) =>
    value === null || value === undefined ? '–' : Number(value).toFixed(digits);

  return (
    <div className="learning-visualization">
      <h2>DQN Training Diagnostics</h2>

      <div className="stats">
        <div className="stat">
          <span className="label">Exploration (ε):</span>
          <span className="value">{formatValue(diagnostics.exploration_rate)}</span>
        </div>
        <div className="stat">
          <span className="label">Episode Length:</span>
          <span className="value">{diagnostics.episode_length ?? '–'}</span>
        </div>
        <div className="stat">
          <span className="label">Timesteps:</span>
          <span className="value">{diagnostics.total_timesteps ?? '–'}</span>
        </div>
      </div>

      <p className="hint">
        ε decays from 1.0 (all random actions) toward its final value — watch it
        fall as the agent shifts from exploring to exploiting. Episode length is
        how long the pole stayed up in the last training episode.
      </p>
    </div>
  );
};

export default DQNDiagnostics;
