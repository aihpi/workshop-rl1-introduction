import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './RewardChart.css';

const RewardChart = ({ chartData, totalEpisodes, windowSize }) => {
  // Sort by episode to handle race condition where final point might arrive before last interval
  const sortedData = [...chartData].sort((a, b) => a.episode - b.episode);

  // Calculate statistics
  const hasData = sortedData.length > 0;
  const lastPoint = hasData ? sortedData[sortedData.length - 1] : null;
  const currentAvg = lastPoint ? lastPoint.avgReward.toFixed(3) : 0;
  const bestAvg = hasData ? Math.max(...sortedData.map(d => d.avgReward)).toFixed(3) : 0;
  const episodesTrained = lastPoint ? lastPoint.episode : 0;

  // Fixed x-axis when the episode count is known upfront (episode-budgeted
  // algorithms); auto-scaling axis when it isn't (timestep-budgeted, e.g. DQN)
  const knownTotal = totalEpisodes != null && totalEpisodes > 0;
  const xDomain = knownTotal ? [0, totalEpisodes] : [0, 'dataMax'];
  const ticks = knownTotal
    ? Array.from({length: 11}, (_, i) => Math.round(totalEpisodes * i / 10))
    : undefined;

  return (
    <div className="reward-chart">
      <h2>Moving Average Reward</h2>

      {hasData ? (
        <>
          <div className="stats">
            <div className="stat">
              <span className="label">Episodes Trained:</span>
              <span className="value">{episodesTrained}</span>
            </div>
            <div className="stat">
              <span className="label">Current Average:</span>
              <span className="value">{currentAvg}</span>
            </div>
            <div className="stat">
              <span className="label">Best Average:</span>
              <span className="value">{bestAvg}</span>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={sortedData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="episode"
                domain={xDomain}
                type="number"
                ticks={ticks}
                label={{ value: 'Episode', position: 'insideBottom', offset: 0 }}
              />
              <YAxis
                label={{ value: 'Average Reward', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="avgReward"
                stroke="#8884d8"
                strokeWidth={2}
                dot={true}
                isAnimationActive={false}
                name={`Moving Average (window: ${windowSize})`}
              />
            </LineChart>
          </ResponsiveContainer>
        </>
      ) : (
        <div className="placeholder">
          <p>No reward data yet</p>
          <p className="hint">Moving average will appear as training progresses</p>
        </div>
      )}
    </div>
  );
};

export default RewardChart;
