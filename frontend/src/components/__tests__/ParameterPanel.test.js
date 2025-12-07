/**
 * Tests for ParameterPanel component.
 *
 * These are example tests to learn from. Each test follows the pattern:
 * 1. Arrange - Set up test data and mocks
 * 2. Act - Render the component
 * 3. Assert - Check the results
 */

import { render, screen, waitFor } from '@testing-library/react';
import ParameterPanel from '../ParameterPanel';
import * as api from '../../api';

// Mock the API module
jest.mock('../../api');

describe('ParameterPanel', () => {
  // Common test data
  const mockSchema = {
    learning_rate: {
      type: 'float',
      min: 0,
      max: 1,
      default: 0.1,
      description: 'How fast the agent learns'
    },
    num_episodes: {
      type: 'int',
      min: 100,
      max: 10000,
      default: 1000,
      description: 'Number of training episodes'
    }
  };

  const mockEnvironments = ['FrozenLake-v1', 'FrozenLake-v1-NoSlip'];

  const defaultProps = {
    algorithm: 'Q-Learning',
    environment: 'FrozenLake-v1-NoSlip',
    parameters: { learning_rate: 0.1, num_episodes: 1000 },
    onParametersChange: jest.fn(),
    onEnvironmentChange: jest.fn()
  };

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    // Set up default API responses
    api.getParameterSchema.mockResolvedValue(mockSchema);
    api.getEnvironments.mockResolvedValue(mockEnvironments);
    api.getAlgorithms.mockResolvedValue(['Q-Learning']);
  });

  test('renders loading state initially', () => {
    /**
     * WHY: Component should show loading message while fetching data
     * HOW: Render component and check for loading text
     */
    // Act
    render(<ParameterPanel {...defaultProps} />);

    // Assert
    expect(screen.getByText(/loading parameters/i)).toBeInTheDocument();
  });

  test('renders parameter controls after loading', async () => {
    /**
     * WHY: After loading, users should see all parameter controls
     * HOW: Render component, wait for loading to finish, check for controls
     */
    // Act
    render(<ParameterPanel {...defaultProps} />);

    // Assert - Wait for component to finish loading
    await waitFor(() => {
      expect(screen.getByText(/configuration/i)).toBeInTheDocument();
    });

    // Check that parameter sliders are rendered
    expect(screen.getByText(/learning rate/i)).toBeInTheDocument();
    expect(screen.getByText(/num episodes/i)).toBeInTheDocument();
  });

  test('displays algorithm select with current value', async () => {
    /**
     * WHY: Algorithm select should show the currently selected algorithm
     * HOW: Check that algorithm select exists and has the correct value
     */
    // Act
    render(<ParameterPanel {...defaultProps} />);

    // Assert
    await waitFor(() => {
      const algorithmSelect = screen.getByDisplayValue('Q-Learning');
      expect(algorithmSelect).toBeInTheDocument();
      expect(algorithmSelect).toHaveValue('Q-Learning');
    });
  });

  test('renders environment dropdown with options', async () => {
    /**
     * WHY: Users should be able to select different environments
     * HOW: Check that environment dropdown has all options
     */
    // Act
    render(<ParameterPanel {...defaultProps} />);

    // Assert
    await waitFor(() => {
      const environmentSelect = screen.getByDisplayValue('FrozenLake-v1-NoSlip');
      expect(environmentSelect).toBeInTheDocument();
    });

    // Check that both environment options exist
    expect(screen.getByText('FrozenLake-v1')).toBeInTheDocument();
    expect(screen.getByText('FrozenLake-v1-NoSlip')).toBeInTheDocument();
  });

  test('environment dropdown has correct value', async () => {
    /**
     * WHY: Environment dropdown should show the currently selected environment
     * HOW: Render and verify selected value matches props
     */
    // Act
    render(<ParameterPanel {...defaultProps} />);

    // Assert
    await waitFor(() => {
      const environmentSelect = screen.getByDisplayValue('FrozenLake-v1-NoSlip');
      expect(environmentSelect).toBeInTheDocument();
      expect(environmentSelect).toHaveValue('FrozenLake-v1-NoSlip');
    });
  });
});
