import gymnasium as gym
import numpy as np
from PIL import Image
import io
import base64
from typing import List, Optional


class EnvironmentManager:
    """
    Manages Gymnasium environment creation and frame conversion.

    Handles environment creation with proper render modes and
    converts numpy frames to base64-encoded PNG strings for transmission.
    """

    SUPPORTED_ENVIRONMENTS = [
        'FrozenLake-v1-NoSlip',
        'FrozenLake-v1',
        'CartPole-v1',
        'MountainCar-v0'
    ]

    @staticmethod
    def get_available_environments() -> List[str]:
        """
        Get list of supported environments.

        Returns:
            List of environment names
        """
        return EnvironmentManager.SUPPORTED_ENVIRONMENTS

    @staticmethod
    def create_environment(env_name: str, seed: Optional[int] = None):
        """
        Create a Gymnasium environment with rgb_array render mode.

        Args:
            env_name: Name of the environment (must be in SUPPORTED_ENVIRONMENTS)
            seed: Optional random seed for reproducibility

        Returns:
            Gymnasium environment instance

        Raises:
            ValueError: If environment name is not supported
        """
        if env_name not in EnvironmentManager.SUPPORTED_ENVIRONMENTS:
            raise ValueError(
                f"Environment '{env_name}' not supported. "
                f"Available environments: {EnvironmentManager.SUPPORTED_ENVIRONMENTS}"
            )

        # Handle FrozenLake variants
        if env_name == 'FrozenLake-v1-NoSlip':
            # Non-slippery version (deterministic)
            env = gym.make('FrozenLake-v1', render_mode='rgb_array', is_slippery=False)
        elif env_name == 'FrozenLake-v1':
            # Standard slippery version (stochastic)
            env = gym.make('FrozenLake-v1', render_mode='rgb_array', is_slippery=True)
        else:
            # Default: create environment with rgb_array rendering
            env = gym.make(env_name, render_mode='rgb_array')

        # Set seed if provided
        if seed is not None:
            env.reset(seed=seed)

        return env

    @staticmethod
    def frame_to_base64(frame: np.ndarray) -> str:
        """
        Convert numpy RGB array to base64-encoded PNG string.

        Args:
            frame: Numpy array of shape (height, width, 3) with RGB values

        Returns:
            Base64-encoded PNG string (without data URI prefix)
        """
        # Convert numpy array to PIL Image
        image = Image.fromarray(frame.astype(np.uint8))

        # Save to bytes buffer as PNG
        buffer = io.BytesIO()
        image.save(buffer, format='PNG')
        buffer.seek(0)

        # Encode to base64
        img_base64 = base64.b64encode(buffer.read()).decode('utf-8')

        return img_base64
