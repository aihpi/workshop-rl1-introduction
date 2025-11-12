import numpy as np
from typing import Dict, Any, Callable, Optional
from .base_algorithm import BaseAlgorithm


class QLearning(BaseAlgorithm):
    """
    Tabular Q-Learning implementation for discrete state/action spaces.

    Uses epsilon-greedy exploration and standard Q-learning update rule.
    """

    def __init__(self, env, parameters: Dict[str, Any]):
        """
        Initialize Q-Learning algorithm.

        Args:
            env: Gymnasium environment with discrete observation and action spaces
            parameters: Dict with learning_rate, discount_factor, exploration_rate
        """
        super().__init__(env, parameters)

        # Extract parameters
        self.learning_rate = parameters.get('learning_rate', 0.1)
        self.discount_factor = parameters.get('discount_factor', 0.95)
        self.exploration_rate = parameters.get('exploration_rate', 0.1)

        # Initialize Q-table as zeros (num_states × num_actions)
        num_states = env.observation_space.n
        num_actions = env.action_space.n
        self.q_table = np.zeros((num_states, num_actions))

    def _argmax_random_tiebreak(self, q_values: np.ndarray) -> int:
        """
        Select action with highest Q-value, breaking ties randomly.

        This is critical for exploration when Q-values are tied (e.g., all zeros).

        Args:
            q_values: Array of Q-values for all actions

        Returns:
            Action index with highest Q-value (random if tied)
        """
        max_value = np.max(q_values)
        max_actions = np.where(q_values == max_value)[0]
        return np.random.choice(max_actions)

    def train(self, num_episodes: int, callback: Optional[Callable] = None) -> None:
        """
        Train Q-Learning agent.

        CRITICAL: Only renders the final frame of each episode!

        Args:
            num_episodes: Number of episodes to train
            callback: Called after each episode with (episode, reward, learning_data, frame)
        """
        max_steps_per_episode = 100  # Prevent infinite loops

        for episode in range(num_episodes):
            state, _ = self.env.reset()
            total_reward = 0
            done = False
            steps = 0

            # Run episode
            while not done and steps < max_steps_per_episode:
                # Epsilon-greedy action selection
                if np.random.random() < self.exploration_rate:
                    action = self.env.action_space.sample()
                else:
                    action = self._argmax_random_tiebreak(self.q_table[state])

                # Take action
                next_state, reward, terminated, truncated, _ = self.env.step(action)
                done = terminated or truncated
                total_reward += reward

                # Q-learning update rule (use regular argmax here for speed)
                best_next_action = self._argmax_random_tiebreak(self.q_table[next_state])
                td_target = reward + self.discount_factor * self.q_table[next_state, best_next_action]
                td_error = td_target - self.q_table[state, action]
                self.q_table[state, action] += self.learning_rate * td_error

                state = next_state
                steps += 1

            # CRITICAL: Render only AFTER episode completes
            frame = self.env.render()

            # Call callback with episode results
            if callback:
                learning_data = self.get_learning_data()
                callback(episode, total_reward, learning_data, frame)

    def play_policy(self, callback: Optional[Callable] = None) -> list:
        """
        Execute learned policy and collect all frames.

        CRITICAL: Renders EVERY step during playback!

        Args:
            callback: Called after each step with (frame)

        Returns:
            List of all frames from the episode
        """
        max_steps = 100  # Prevent infinite loops
        frames = []
        state, _ = self.env.reset()
        done = False
        steps = 0

        while not done and steps < max_steps:
            # Select best action (greedy, with random tie-breaking)
            action = self._argmax_random_tiebreak(self.q_table[state])

            # Take action
            state, _, terminated, truncated, _ = self.env.step(action)
            done = terminated or truncated

            # CRITICAL: Render AFTER every step
            frame = self.env.render()
            frames.append(frame)

            if callback:
                callback(frame)

            steps += 1

        return frames

    def get_learning_data(self) -> Dict[str, Any]:
        """
        Return Q-table for visualization.

        Returns:
            Dictionary with q_table as nested list
        """
        return {
            'q_table': self.q_table.tolist()
        }

    @staticmethod
    def get_parameter_schema(environment: Optional[str] = None) -> Dict[str, Dict[str, Any]]:
        """
        Return Q-Learning parameter specifications.

        Args:
            environment: Optional environment name for environment-specific parameters

        Returns:
            Dictionary of parameter specifications
        """
        # Environment-specific num_episodes configurations
        num_episodes_config = {
            'FrozenLake-v1': {
                'min': 1,
                'max': 20000,  # 2e4
                'default': 1000  # 1e3
            },
            'FrozenLake-v1-NoSlip': {
                'min': 1,
                'max': 2000,  # 2e3
                'default': 100  # 1e2
            }
        }

        # Get environment-specific config or use default
        if environment and environment in num_episodes_config:
            episodes_config = num_episodes_config[environment]
        else:
            # Default for unknown environments
            episodes_config = {
                'min': 1,
                'max': 200000,
                'default': 1000
            }

        return {
            'learning_rate': {
                'type': 'float',
                'min': 0.01,
                'max': 1.0,
                'default': 0.1,
                'description': 'Learning rate (alpha) - controls how much new information overrides old'
            },
            'discount_factor': {
                'type': 'float',
                'min': 0.0,
                'max': 0.99,
                'default': 0.95,
                'description': 'Discount factor (gamma) - importance of future rewards'
            },
            'exploration_rate': {
                'type': 'float',
                'min': 0.0,
                'max': 1.0,
                'default': 0.1,
                'description': 'Exploration rate (epsilon) - probability of random action'
            },
            'num_episodes': {
                'type': 'int',
                'min': episodes_config['min'],
                'max': episodes_config['max'],
                'default': episodes_config['default'],
                'description': 'Number of training episodes'
            }
        }
