from typing import Dict, Any, List
from .base_algorithm import BaseAlgorithm
from .q_learning import QLearning
from .dqn import DQNAlgorithm


class AlgorithmFactory:
    """
    Factory for creating algorithm instances.

    Provides a centralized way to create algorithms by name and
    retrieve available algorithms and their parameter schemas.
    """

    # Registry of available algorithms
    # Future: Add more algorithms (SARSA, PPO, etc.)
    ALGORITHMS = {
        'Q-Learning': QLearning,
        'DQN': DQNAlgorithm,
    }

    @staticmethod
    def get_available_algorithms() -> List[str]:
        """
        Get list of available algorithm names.

        Returns:
            List of algorithm names
        """
        return list(AlgorithmFactory.ALGORITHMS.keys())

    @staticmethod
    def get_compatibility() -> Dict[str, List[str]]:
        """
        Get the algorithm -> supported environments mapping.

        Returns:
            Dict mapping algorithm names to lists of supported environment names
        """
        return {
            name: cls.SUPPORTED_ENVIRONMENTS
            for name, cls in AlgorithmFactory.ALGORITHMS.items()
        }

    @staticmethod
    def create_algorithm(
        name: str,
        env,
        parameters: Dict[str, Any],
        environment_name: str = None
    ) -> BaseAlgorithm:
        """
        Create an algorithm instance by name.

        Args:
            name: Algorithm name (must be in ALGORITHMS registry)
            env: Gymnasium environment instance
            parameters: Dictionary of algorithm parameters
            environment_name: Optional environment name; if given, the
                algorithm/environment pair is validated for compatibility

        Returns:
            Algorithm instance implementing BaseAlgorithm

        Raises:
            ValueError: If algorithm name is not recognized or the
                algorithm does not support the environment
        """
        if name not in AlgorithmFactory.ALGORITHMS:
            raise ValueError(
                f"Algorithm '{name}' not found. "
                f"Available algorithms: {list(AlgorithmFactory.ALGORITHMS.keys())}"
            )

        algorithm_class = AlgorithmFactory.ALGORITHMS[name]

        if environment_name is not None and environment_name not in algorithm_class.SUPPORTED_ENVIRONMENTS:
            raise ValueError(
                f"Algorithm '{name}' does not support environment '{environment_name}'. "
                f"Supported environments: {algorithm_class.SUPPORTED_ENVIRONMENTS}"
            )

        return algorithm_class(env, parameters)

    @staticmethod
    def get_parameter_schema(name: str, environment: str = None) -> Dict[str, Dict[str, Any]]:
        """
        Get parameter schema for a specific algorithm.

        Args:
            name: Algorithm name
            environment: Optional environment name for environment-specific parameters

        Returns:
            Parameter schema dictionary

        Raises:
            ValueError: If algorithm name is not recognized
        """
        if name not in AlgorithmFactory.ALGORITHMS:
            raise ValueError(
                f"Algorithm '{name}' not found. "
                f"Available algorithms: {list(AlgorithmFactory.ALGORITHMS.keys())}"
            )

        algorithm_class = AlgorithmFactory.ALGORITHMS[name]
        return algorithm_class.get_parameter_schema(environment)


# Export for easier imports
__all__ = ['AlgorithmFactory', 'BaseAlgorithm', 'QLearning', 'DQNAlgorithm']
