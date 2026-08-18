/**
 * Tests for EnvironmentViewer component.
 *
 * These are example tests to learn from. Each test follows the pattern:
 * 1. Arrange - Set up test data
 * 2. Act - Render the component
 * 3. Assert - Check the results
 */

import { render, screen } from '@testing-library/react';
import EnvironmentViewer from '../EnvironmentViewer';

describe('EnvironmentViewer', () => {
  test('shows "Ready to train a policy" when idle', () => {
    /**
     * WHY: Initial state should clearly indicate what user needs to do
     * HOW: Render with no training, no frame, check status text
     */
    // Arrange
    const props = {
      frame: null,
      episode: 0,
      isTraining: false,
      isPlayback: false,
      trainingComplete: false
    };

    // Act
    render(<EnvironmentViewer {...props} />);

    // Assert
    expect(screen.getByText(/ready to train a policy/i)).toBeInTheDocument();
  });

  test('shows "Training - Episode X" during training', () => {
    /**
     * WHY: Users should see training progress
     * HOW: Render with isTraining=true and episode number
     */
    // Arrange
    const props = {
      frame: 'base64string',
      episode: 42,
      isTraining: true,
      isPlayback: false,
      trainingComplete: false
    };

    // Act
    render(<EnvironmentViewer {...props} />);

    // Assert
    expect(screen.getByText(/training - episode 42/i)).toBeInTheDocument();
  });

  test('shows "Playing Policy" during playback', () => {
    /**
     * WHY: Users should know when policy is being played
     * HOW: Render with isPlayback=true
     */
    // Arrange
    const props = {
      frame: 'base64string',
      episode: 0,
      isTraining: false,
      isPlayback: true,
      trainingComplete: true
    };

    // Act
    render(<EnvironmentViewer {...props} />);

    // Assert
    expect(screen.getByText(/playing policy/i)).toBeInTheDocument();
  });

  test('shows "Ready" when training is complete', () => {
    /**
     * WHY: After training, users should know they can play policy
     * HOW: Render with trainingComplete=true but not training or playing
     */
    // Arrange
    const props = {
      frame: 'base64string',
      episode: 100,
      isTraining: false,
      isPlayback: false,
      trainingComplete: true
    };

    // Act
    render(<EnvironmentViewer {...props} />);

    // Assert
    expect(screen.getByText(/^ready$/i)).toBeInTheDocument();
  });

  test('shows placeholder when no frame is available', () => {
    /**
     * WHY: Component should gracefully handle missing frame data
     * HOW: Render with frame=null, check for placeholder message
     */
    // Arrange
    const props = {
      frame: null,
      episode: 0,
      isTraining: false,
      isPlayback: false,
      trainingComplete: false
    };

    // Act
    render(<EnvironmentViewer {...props} />);

    // Assert
    expect(screen.getByText(/no frame to display/i)).toBeInTheDocument();
    expect(screen.getByText(/start training to see the environment/i)).toBeInTheDocument();
  });

  test('renders frame image when frame data is provided', () => {
    /**
     * WHY: Component should display environment frames as images
     * HOW: Render with frame data, check that img element exists with correct src
     */
    // Arrange
    const mockFrameData = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    const props = {
      frame: mockFrameData,
      episode: 5,
      isTraining: true,
      isPlayback: false,
      trainingComplete: false
    };

    // Act
    render(<EnvironmentViewer {...props} />);

    // Assert
    const image = screen.getByAltText(/environment state/i);
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', `data:image/png;base64,${mockFrameData}`);
  });
});

describe('EnvironmentViewer action arrow', () => {
  const playbackProps = {
    frame: 'base64string',
    episode: 0,
    isTraining: false,
    isPlayback: true,
    trainingComplete: true,
    playbackStep: 10
  };

  test('shows the action arrow for CartPole during playback', () => {
    const { container } = render(
      <EnvironmentViewer {...playbackProps} environment="CartPole-v1" playbackAction={1} />
    );
    const arrow = container.querySelector('.action-arrow');
    expect(arrow).toBeInTheDocument();
    expect(arrow).toHaveTextContent('➡');
  });

  test('shows the chosen direction for FrozenLake during playback', () => {
    const { container } = render(
      <EnvironmentViewer {...playbackProps} environment="FrozenLake-v1" playbackAction={1} />
    );
    const arrow = container.querySelector('.action-arrow');
    expect(arrow).toBeInTheDocument();
    expect(arrow).toHaveTextContent('⬇'); // action 1 = DOWN
  });

  test('shows the coast symbol for MountainCar action 1 during playback', () => {
    const { container } = render(
      <EnvironmentViewer {...playbackProps} environment="MountainCar-v0" playbackAction={1} />
    );
    const arrow = container.querySelector('.action-arrow');
    expect(arrow).toBeInTheDocument();
    expect(arrow).toHaveTextContent('•'); // action 1 = no push
  });

  test('shows no arrow for environments without a mapping', () => {
    const { container } = render(
      <EnvironmentViewer {...playbackProps} environment="Acrobot-v1" playbackAction={1} />
    );
    expect(container.querySelector('.action-arrow')).not.toBeInTheDocument();
  });

  test('shows no arrow outside playback (no action)', () => {
    const { container } = render(
      <EnvironmentViewer {...playbackProps} environment="CartPole-v1" playbackAction={null} />
    );
    expect(container.querySelector('.action-arrow')).not.toBeInTheDocument();
  });
});
