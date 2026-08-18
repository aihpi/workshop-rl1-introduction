import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import environmentsData from '../content/environments.json';
import './RewardChart.css';

const HPI_VIOLET = '#7664a0';
const HPI_ORANGE = '#ff7500';

/**
 * Unified training-progress panel: current numbers on top (episodes,
 * timesteps, exploration rate, seed) and history graphs below, all over
 * one shared episode axis.
 *
 * Graphs are data-driven: the return chart always renders when there is
 * data; the exploration chart appears only for algorithms that report a
 * decaying epsilon (DQN). "Return" (sum of rewards per episode) is the
 * correct RL term - and these are TRAINING returns, which include
 * exploration actions.
 */
const TrainingProgress = ({
  episodesTrained,
  timesteps,
  epsilon,
  seed,
  chartData,
  lengthChartData = [],
  totalEpisodes,
  windowSize,
  epsilonHistory,
  environment
}) => {
  // Sort by episode to handle race condition where final point might arrive before last interval
  const sortedData = [...chartData].sort((a, b) => a.episode - b.episode);
  const hasData = sortedData.length > 0;

  // Fixed x-axis when the episode count is known upfront (episode-budgeted
  // algorithms); auto-scaling axis when it isn't (timestep-budgeted, e.g. DQN)
  const knownTotal = totalEpisodes != null && totalEpisodes > 0;
  const xDomain = knownTotal ? [0, totalEpisodes] : [0, 'dataMax'];
  const ticks = knownTotal
    ? Array.from({ length: 11 }, (_, i) => Math.round(totalEpisodes * i / 10))
    : undefined;

  const showEpsilonChart = epsilonHistory && epsilonHistory.length > 1;

  // The length chart is skipped where return == episode length by
  // construction (e.g. CartPole's +1/step) - it would duplicate the
  // return curve; declared per environment in the content file
  const lengthEqualsReturn =
    environmentsData[environment]?.sections?.lengthEqualsReturn === true;
  const showLengthChart = !lengthEqualsReturn && lengthChartData.length > 0;

  return (
    <div className="reward-chart">
      <h2>Training Progress</h2>

      <div className="stats">
        <div className="stat">
          <span className="label">Episodes Trained:</span>
          <span className="value">{episodesTrained}</span>
        </div>
        {timesteps != null && (
          <div className="stat">
            <span className="label">Timesteps:</span>
            <span className="value">{timesteps}</span>
          </div>
        )}
        {epsilon != null && (
          <div className="stat">
            <span className="label">Exploration (ε):</span>
            <span className="value">{Number(epsilon).toFixed(3)}</span>
          </div>
        )}
        {seed != null && (
          <div className="stat">
            <span className="label">Seed:</span>
            <span className="value">{seed}</span>
          </div>
        )}
      </div>

      {hasData ? (
        <>
          <h3>Average Training Return</h3>
          <ResponsiveContainer width="100%" height={260}>
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
                label={{ value: 'Avg Return', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="avgReward"
                stroke="#8884d8"
                strokeWidth={2}
                dot={true}
                isAnimationActive={false}
                name={`Moving average (window: ${windowSize})`}
              />
            </LineChart>
          </ResponsiveContainer>
          <p className="hint">
            The return is the sum of rewards over one episode. Training returns
            include ε-random exploration actions — use Evaluate Policy for the
            policy's true performance.
          </p>
        </>
      ) : (
        <div className="placeholder">
          <p>No training data yet</p>
          <p className="hint">Average return will appear as training progresses</p>
        </div>
      )}

      {showLengthChart && (
        <>
          <h3>Average Training Episode Length</h3>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={lengthChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="episode"
                domain={xDomain}
                type="number"
                ticks={ticks}
                label={{ value: 'Episode', position: 'insideBottom', offset: 0 }}
              />
              <YAxis label={{ value: 'Avg Steps', angle: -90, position: 'insideLeft' }} />
              <Tooltip formatter={(value) => Number(value).toFixed(1)} />
              <Line
                type="monotone"
                dataKey="avgLength"
                stroke={HPI_ORANGE}
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
                name={`Moving average (window: ${windowSize})`}
              />
            </LineChart>
          </ResponsiveContainer>
          <p className="hint">
            Steps per episode. On slippery ice, shorter episodes with rising
            returns mean the agent found a reliable route.
          </p>
        </>
      )}

      {showEpsilonChart && (
        <>
          <h3>Exploration Rate (ε)</h3>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={epsilonHistory}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="episode"
                domain={xDomain}
                type="number"
                ticks={ticks}
                label={{ value: 'Episode', position: 'insideBottom', offset: 0 }}
              />
              <YAxis domain={[0, 1]} label={{ value: 'ε', angle: -90, position: 'insideLeft' }} />
              <Tooltip formatter={(value) => Number(value).toFixed(3)} />
              <Line
                type="monotone"
                dataKey="epsilon"
                stroke={HPI_VIOLET}
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
                name="Exploration rate"
              />
            </LineChart>
          </ResponsiveContainer>
          <p className="hint">
            ε decays from 1.0 (all actions random) to its final value — the
            agent shifts from exploring to exploiting.
          </p>
        </>
      )}
    </div>
  );
};

export default TrainingProgress;
