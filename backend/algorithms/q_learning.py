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

        # Extract Q-initialization parameters
        q_init_strategy = parameters.get('q_init_strategy', 'fixed')
        q_init_value = float(parameters.get('q_init_value', 0.0))
        q_init_min = float(parameters.get('q_init_min', 0.0))
        q_init_max = float(parameters.get('q_init_max', 1.0))

        # Initialize Q-table based on strategy
        num_states = env.observation_space.n
        num_actions = env.action_space.n
        self.q_table = self._initialize_q_table(
            num_states,
            num_actions,
            q_init_strategy,
            q_init_value,
            q_init_min,
            q_init_max
        )

        # Identify and handle terminal states
        self.terminal_states = self._get_terminal_states(env)

        # Force terminal state Q-values to 0 (by RL theory, terminal states have value 0)
        for state in self.terminal_states:
            self.q_table[state, :] = 0.0

    def _get_terminal_states(self, env) -> set:
        """
        Identify terminal states (holes and goals) from the environment.

        Args:
            env: Gymnasium environment

        Returns:
            Set of state indices that are terminal
        """
        desc = env.unwrapped.desc.astype(str)
        nrow = env.unwrapped.nrow
        ncol = env.unwrapped.ncol

        terminal_states = set()
        for row in range(nrow):
            for col in range(ncol):
                cell_type = desc[row, col]
                if cell_type in ['H', 'G']:  # Holes or Goal
                    state_idx = row * ncol + col
                    terminal_states.add(state_idx)

        return terminal_states

    def _initialize_q_table(
        self,
        num_states: int,
        num_actions: int,
        strategy: str,
        value: float,
        min_val: float,
        max_val: float
    ) -> np.ndarray:
        """
        Initialize Q-table based on the selected strategy.

        Args:
            num_states: Number of states in the environment
            num_actions: Number of actions in the environment
            strategy: Initialization strategy ('fixed' or 'random')
            value: Fixed value for 'fixed' strategy
            min_val: Minimum value for 'random' strategy
            max_val: Maximum value for 'random' strategy

        Returns:
            Initialized Q-table as numpy array

        Raises:
            ValueError: If strategy is unknown or if min_val >= max_val for random
        """
        if strategy == 'fixed':
            return np.full((num_states, num_actions), value)
        elif strategy == 'random':
            if min_val >= max_val:
                raise ValueError(
                    f"Invalid Q-value initialization: min ({min_val}) must be less than max ({max_val})"
                )
            return np.random.uniform(min_val, max_val, (num_states, num_actions))
        else:
            raise ValueError(f"Unknown Q-value initialization strategy: {strategy}")

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

                # Debug logging every 100 episodes
                if episode % 100 == 0:
                    print(f"DEBUG: Episode {episode}: Q-table min={np.min(self.q_table):.4f}, max={np.max(self.q_table):.4f}, mean={np.mean(self.q_table):.4f}")
                    print(f"DEBUG: Q-table sample (state 0): {self.q_table[0]}")

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
        # Environment-specific num_episodes defaults
        num_episodes_defaults = {
            'FrozenLake-v1': 5000,
            'FrozenLake-v1-NoSlip': 500
        }

        # Get environment-specific default or use fallback
        num_episodes_default = num_episodes_defaults.get(environment, 1000)

        return {
            'learning_rate': {
                'type': 'float',
                'min': 0.01,
                'max': 1.0,
                'default': 0.1,
                'description': 'Alpha - controls how much new information overrides old'
            },
            'discount_factor': {
                'type': 'float',
                'min': 0.0,
                'max': 0.99,
                'default': 0.95,
                'description': 'Gamma - importance of future rewards'
            },
            'exploration_rate': {
                'type': 'float',
                'min': 0.0,
                'max': 1.0,
                'default': 0.1,
                'description': 'Epsilon - probability of random action'
            },
            'num_episodes': {
                'type': 'int',
                'default': num_episodes_default,
                'description': 'Number of training episodes'
            },
            'q_init_strategy': {
                'type': 'string',
                'default': 'fixed',
                'options': ['fixed', 'random'],
                'description': ''
            },
            'q_init_value': {
                'type': 'float',
                'default': 0.0,
                'description': 'Fixed value for Q-value initialization'
            },
            'q_init_min': {
                'type': 'float',
                'default': 0.0,
                'description': 'Minimum bound for random Q-value initialization'
            },
            'q_init_max': {
                'type': 'float',
                'default': 1.0,
                'description': 'Maximum bound for random Q-value initialization'
            }
        }
