/**
 * Tests for the unified Training Progress panel (numbers + graphs).
 */

import { render, screen } from '@testing-library/react';
import TrainingProgress from '../TrainingProgress';

describe('TrainingProgress', () => {
  const baseProps = {
    episodesTrained: 120,
    timesteps: 8450,
    epsilon: 0.31,
    seed: 1728394021,
    chartData: [{ episode: 10, avgReward: 22.4 }, { episode: 20, avgReward: 31.1 }],
    totalEpisodes: null,
    windowSize: 10,
    epsilonHistory: [{ episode: 1, epsilon: 0.99 }, { episode: 120, epsilon: 0.31 }]
  };

  test('shows the numbers including the resolved seed', () => {
    render(<TrainingProgress {...baseProps} />);

    expect(screen.getByText('120')).toBeInTheDocument();
    expect(screen.getByText('8450')).toBeInTheDocument();
    expect(screen.getByText('0.310')).toBeInTheDocument();
    expect(screen.getByText('1728394021')).toBeInTheDocument();
  });

  test('uses return terminology and shows the exploration chart', () => {
    render(<TrainingProgress {...baseProps} />);

    expect(screen.getByText(/average training return/i)).toBeInTheDocument();
    expect(screen.getByText(/exploration rate/i)).toBeInTheDocument();
  });

  test('hides DQN-specific pieces when their data is absent (Q-Learning)', () => {
    render(
      <TrainingProgress
        {...baseProps}
        timesteps={null}
        epsilon={null}
        epsilonHistory={[]}
      />
    );

    expect(screen.queryByText(/timesteps/i)).not.toBeInTheDocument();
    expect(screen.queryByText('Exploration (ε):')).not.toBeInTheDocument(); // stat tile
    expect(screen.queryByText(/exploration rate \(ε\)/i)).not.toBeInTheDocument(); // chart title
    expect(screen.getByText(/average training return/i)).toBeInTheDocument();
  });

  test('shows the episode-length chart for FrozenLake but not CartPole', () => {
    const lengthProps = {
      ...baseProps,
      lengthChartData: [{ episode: 10, avgLength: 24 }, { episode: 20, avgLength: 15 }]
    };

    const { rerender } = render(
      <TrainingProgress {...lengthProps} environment="FrozenLake-v1" />
    );
    expect(screen.getByText(/average training episode length/i)).toBeInTheDocument();

    // CartPole declares lengthEqualsReturn - the chart would duplicate the return curve
    rerender(<TrainingProgress {...lengthProps} environment="CartPole-v1" />);
    expect(screen.queryByText(/average training episode length/i)).not.toBeInTheDocument();
  });

  test('shows placeholder without training data', () => {
    render(
      <TrainingProgress
        episodesTrained={0}
        timesteps={null}
        epsilon={null}
        seed={null}
        chartData={[]}
        totalEpisodes={null}
        windowSize={10}
        epsilonHistory={[]}
      />
    );

    expect(screen.getByText(/no training data yet/i)).toBeInTheDocument();
  });
});
