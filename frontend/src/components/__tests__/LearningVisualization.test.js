/**
 * Tests for the LearningVisualization dispatcher: picks the right
 * visualization per algorithm and falls back to a placeholder.
 */

import { render, screen } from '@testing-library/react';
import LearningVisualization from '../LearningVisualization';

describe('LearningVisualization dispatcher', () => {
  const qTableData = {
    q_table: Array.from({ length: 16 }, () => [0.1, 0.2, 0.3, 0.4])
  };

  const dqnData = {
    diagnostics: {
      exploration_rate: 0.5,
      episode_length: 137,
      total_timesteps: 8450
    }
  };

  test('renders Q-table heatmap for Q-Learning data', () => {
    render(
      <LearningVisualization
        algorithm="Q-Learning"
        environment="FrozenLake-v1-NoSlip"
        learningData={qTableData}
      />
    );

    expect(screen.getByText(/q-table heatmap/i)).toBeInTheDocument();
  });

  test('renders diagnostics for DQN data', () => {
    render(
      <LearningVisualization
        algorithm="DQN"
        environment="CartPole-v1"
        learningData={dqnData}
      />
    );

    expect(screen.getByText(/dqn training diagnostics/i)).toBeInTheDocument();
    expect(screen.getByText(/exploration/i)).toBeInTheDocument();
    expect(screen.getByText('8450')).toBeInTheDocument();
  });

  test('renders placeholder when no learning data', () => {
    render(
      <LearningVisualization
        algorithm="Q-Learning"
        environment="FrozenLake-v1-NoSlip"
        learningData={null}
      />
    );

    expect(screen.getByText(/no learning data available/i)).toBeInTheDocument();
  });

  test('renders placeholder for mismatched data shape', () => {
    // DQN selected but stale Q-table data present
    render(
      <LearningVisualization
        algorithm="DQN"
        environment="CartPole-v1"
        learningData={qTableData}
      />
    );

    expect(screen.getByText(/no learning data available/i)).toBeInTheDocument();
  });
});
