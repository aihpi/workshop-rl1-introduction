from abc import ABC, abstractmethod
from typing import Dict, Any, Callable, Optional


class BaseAlgorithm(ABC):
    """
    Abstract base class for all RL algorithms.

    This class defines the interface that all algorithms (custom and stable-baselines3)
    must implement to work with the RL Playground system.
    """

    # Environment names (from EnvironmentManager) this algorithm can train on
    SUPPORTED_ENVIRONMENTS: list = []

    def __init__(self, env, parameters: Dict[str, Any]):
        """
        Initialize the algorithm.

        Args:
            env: Gymnasium environment instance
            parameters: Dictionary of algorithm-specific parameters
        """
        self.env = env
        self.parameters = parameters

    @abstractmethod
    def train(self, callback: Optional[Callable] = None, stop_event=None) -> None:
        """
        Train the agent. The training budget is read from self.parameters
        (e.g. 'num_episodes' for tabular algorithms, 'total_timesteps' for
        stable-baselines3 algorithms).

        Args:
            callback: Optional callback function called after each episode.
                     Signature: callback(episode, reward, learning_data, frame)
            stop_event: Optional threading.Event; training stops gracefully
                     at the next episode boundary once it is set.
        """
        pass

    @abstractmethod
    def play_policy(self, callback: Optional[Callable] = None) -> "list[tuple]":
        """
        Execute the learned policy and return all rendered frames.

        Args:
            callback: Optional callback function called after each step.
                     Signature: callback(frame, timestep, action) - action
                     is the int action taken at this step.

        Returns:
            List of (frame, timestep) tuples - frame is a numpy RGB array,
            timestep the 1-based environment step it was rendered at
        """
        pass

    @abstractmethod
    def get_learning_data(self) -> Dict[str, Any]:
        """
        Return algorithm-specific visualization data.

        For Q-Learning: returns Q-table
        For DQN: could return loss curves, network weights, etc.

        Returns:
            Dictionary containing learning data for visualization
        """
        pass

    @staticmethod
    @abstractmethod
    def get_parameter_schema(environment: Optional[str] = None) -> Dict[str, Dict[str, Any]]:
        """
        Return parameter specifications for this algorithm.

        Args:
            environment: Optional environment name to get environment-specific parameters

        Returns:
            Dictionary where keys are parameter names and values are dicts with:
            - 'type': 'float' or 'int'
            - 'min': minimum value
            - 'max': maximum value
            - 'default': default value
            - 'description': human-readable description

        Example:
            {
                'learning_rate': {
                    'type': 'float',
                    'min': 0.01,
                    'max': 1.0,
                    'default': 0.1,
                    'description': 'Learning rate (alpha)'
                }
            }
        """
        pass
