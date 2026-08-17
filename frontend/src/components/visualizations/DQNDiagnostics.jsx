import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import '../LearningVisualization.css';

const HPI_VIOLET = '#7664a0';

/**
 * Training diagnostics for DQN: current exploration rate, latest loss,
 * episode length and total timesteps, plus a loss-over-episodes chart.
 *
 * Receives learningData with a diagnostics key:
 * { loss: float|null, exploration_rate: float, episode_length: int,
 *   total_timesteps: int, episode: int }
 * and lossHistory: [{episode, loss}] accumulated (and downsampled for
 * display) by the App-level coalescer - the episode values are real
 * episode numbers, aligned with the reward chart's axis.
 */
const DQNDiagnostics = ({ learningData, lossHistory = [] }) => {
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
          <span className="label">Loss:</span>
          <span className="value">{formatValue(diagnostics.loss, 4)}</span>
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

      {lossHistory.length > 1 ? (
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={lossHistory}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="episode"
              type="number"
              domain={[0, 'dataMax']}
              label={{ value: 'Episode', position: 'insideBottom', offset: 0 }}
            />
            <YAxis
              label={{ value: 'Loss', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip formatter={(value) => Number(value).toFixed(4)} />
            <Line
              type="monotone"
              dataKey="loss"
              stroke={HPI_VIOLET}
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
              name="Q-network loss"
            />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <div className="placeholder">
          <p>Loss curve will appear once learning starts</p>
          <p className="hint">DQN collects experience before its first gradient step</p>
        </div>
      )}

      <p className="hint">
        ε decays from 1.0 (all random actions) toward its final value — watch it fall
        as the agent shifts from exploring to exploiting. The loss is the Q-network's
        temporal-difference error; unlike supervised learning it need not decrease
        monotonically.
      </p>
    </div>
  );
};

export default DQNDiagnostics;
