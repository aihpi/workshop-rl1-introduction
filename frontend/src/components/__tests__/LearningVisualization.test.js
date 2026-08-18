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

  test('renders Q-table heatmap for Q-Learning data', () => {
    render(
      <LearningVisualization
        algorithm="Q-Learning"
        environment="FrozenLake-v1-NoSlip"
        learningData={qTableData}
      />
    );

    expect(screen.getByText(/policy: q-table/i)).toBeInTheDocument();
  });

  test('renders nothing for DQN (its numbers live in Training Progress)', () => {
    const { container } = render(
      <LearningVisualization
        algorithm="DQN"
        environment="CartPole-v1"
        learningData={{ diagnostics: { exploration_rate: 0.5 } }}
      />
    );

    expect(container).toBeEmptyDOMElement();
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
});
