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

  test('mutes terminal tiles on FrozenLake and excludes them from stats', () => {
    // State 5 (a hole) holds the extreme value 9.9 - it must not win the
    // Max Q stat, get a greedy highlight, or receive gradient colors
    const table = Array.from({ length: 16 }, () => [0.1, 0.2, 0.3, 0.4]);
    table[5] = [9.9, 0, 0, 0];

    const { container } = render(
      <LearningVisualization
        algorithm="Q-Learning"
        environment="FrozenLake-v1-NoSlip"
        learningData={{ q_table: table }}
      />
    );

    const terminalCells = container.querySelectorAll('.q-cell.terminal');
    expect(terminalCells).toHaveLength(5); // holes 5, 7, 11, 12 + goal 15
    expect(terminalCells[0].querySelector('.best-action')).toBeNull();
    // Max Q comes from non-terminal states only (0.4, not 9.9)
    expect(screen.getByText('0.400')).toBeInTheDocument();
  });

  test('renders loading placeholder for Q-Learning while the initial table is fetched', () => {
    render(
      <LearningVisualization
        algorithm="Q-Learning"
        environment="FrozenLake-v1-NoSlip"
        learningData={null}
      />
    );

    expect(screen.getByText(/policy: q-table/i)).toBeInTheDocument();
    expect(screen.getByText(/loading initial q-table/i)).toBeInTheDocument();
  });
});
