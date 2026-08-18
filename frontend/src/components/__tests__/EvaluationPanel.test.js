/**
 * Tests for the policy evaluation panel.
 */

import { render, screen } from '@testing-library/react';
import EvaluationPanel from '../visualizations/EvaluationPanel';

const results = {
  num_episodes: 100,
  mean_return: 491.3,
  std_return: 21.0,
  min_return: 388,
  max_return: 500,
  mean_length: 491.3
};

describe('EvaluationPanel', () => {
  test('renders nothing without progress or results', () => {
    const { container } = render(
      <EvaluationPanel progress={null} results={null} environment="CartPole-v1" />
    );
    expect(container).toBeEmptyDOMElement();
  });

  test('shows progress while evaluating', () => {
    render(
      <EvaluationPanel progress={{ episode: 37, total: 100 }} results={null} environment="CartPole-v1" />
    );
    expect(screen.getByText(/episode 37\/100/i)).toBeInTheDocument();
  });

  test('shows mean with 95% CI, spread, and solved badge above the threshold', () => {
    render(
      <EvaluationPanel progress={null} results={results} environment="CartPole-v1" />
    );
    // CI = 1.96 * 21 / sqrt(100) = 4.1 - the uncertainty of the mean,
    // not the per-episode spread
    expect(screen.getByText(/491.3 ± 4.1/)).toBeInTheDocument();
    expect(screen.getByText('21.0')).toBeInTheDocument(); // spread shown separately
    expect(screen.getByText(/✅ Solved/)).toBeInTheDocument();
  });

  test('shows not-solved verdict below the threshold', () => {
    render(
      <EvaluationPanel
        progress={null}
        results={{ ...results, mean_return: 343.0 }}
        environment="CartPole-v1"
      />
    );
    expect(screen.getByText(/not solved yet/i)).toBeInTheDocument();
  });

  test('shows no verdict for environments without a threshold', () => {
    render(
      <EvaluationPanel
        progress={null}
        results={{ ...results, mean_return: 0.8, min_return: 0, max_return: 1 }}
        environment="FrozenLake-v1"
      />
    );
    expect(screen.queryByText(/solved/i)).not.toBeInTheDocument();
  });
});
