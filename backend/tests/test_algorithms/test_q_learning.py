"""
Tests for Q-Learning algorithm.

These are example tests to learn from. Each test follows the pattern:
1. Arrange - Set up test data
2. Act - Run the code being tested
3. Assert - Check the results
"""

import pytest
import numpy as np
import gymnasium as gym
from algorithms.q_learning import QLearning


class TestQLearningBasics:
    """Basic tests for Q-Learning initialization and structure."""

    def test_q_table_initialized_as_zeros(self):
        """
        Test that Q-table starts as all zeros.

        WHY: Q-Learning should start with no knowledge (all zeros).
        HOW: Create environment, create Q-Learning, check Q-table shape and values.
        """
        # Arrange - Set up test environment
        env = gym.make('FrozenLake-v1', render_mode='rgb_array')
        parameters = {
            'learning_rate': 0.1,
            'discount_factor': 0.95,
            'exploration_rate': 0.1
        }

        # Act - Create Q-Learning algorithm
        q_learning = QLearning(env, parameters)

        # Assert - Check results
        expected_shape = (env.observation_space.n, env.action_space.n)
        assert q_learning.q_table.shape == expected_shape, \
            f"Q-table shape should be {expected_shape}"

        assert np.all(q_learning.q_table == 0), \
            "Q-table should be initialized with all zeros"

        env.close()

    def test_parameters_stored_correctly(self):
        """
        Test that parameters are stored in the algorithm.

        WHY: We need to verify the algorithm uses the parameters we provide.
        HOW: Create with specific parameters, check they're stored.
        """
        # Arrange
        env = gym.make('FrozenLake-v1', render_mode='rgb_array')
        parameters = {
            'learning_rate': 0.5,
            'discount_factor': 0.99,
            'exploration_rate': 0.2
        }

        # Act
        q_learning = QLearning(env, parameters)

        # Assert
        assert q_learning.learning_rate == 0.5, "Learning rate not stored correctly"
        assert q_learning.discount_factor == 0.99, "Discount factor not stored correctly"
        assert q_learning.exploration_rate == 0.2, "Exploration rate not stored correctly"

        env.close()

    def test_get_parameter_schema(self):
        """
        Test that parameter schema is returned correctly.

        WHY: Frontend needs to know what parameters are available.
        HOW: Call get_parameter_schema() and check it has required keys.
        """
        # Act
        schema = QLearning.get_parameter_schema('FrozenLake-v1-NoSlip')

        # Assert
        assert 'learning_rate' in schema, "Schema should include learning_rate"
        assert 'discount_factor' in schema, "Schema should include discount_factor"
        assert 'exploration_rate' in schema, "Schema should include exploration_rate"
        assert 'num_episodes' in schema, "Schema should include num_episodes"

        # Check structure of one parameter
        lr_schema = schema['learning_rate']
        assert 'type' in lr_schema, "Parameter should have 'type'"
        assert 'min' in lr_schema, "Parameter should have 'min'"
        assert 'max' in lr_schema, "Parameter should have 'max'"
        assert 'default' in lr_schema, "Parameter should have 'default'"
