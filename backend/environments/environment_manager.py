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

    # Phase 1: FrozenLake-v1 with slippery and non-slippery variants
    # Future: Add more environments
    SUPPORTED_ENVIRONMENTS = [
        'FrozenLake-v1-NoSlip',
        'FrozenLake-v1'
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
    def render_frozenlake(env) -> np.ndarray:
        """
        Manually render FrozenLake environment without pygame.

        Args:
            env: FrozenLake environment instance

        Returns:
            RGB numpy array representing the current state
        """
        # Get current state
        state = env.unwrapped.s

        # FrozenLake is 4x4 grid
        grid_size = 4
        cell_size = 100  # pixels per cell
        img_size = grid_size * cell_size

        # Create RGB image
        img = np.ones((img_size, img_size, 3), dtype=np.uint8) * 255

        # Define colors
        colors = {
            'S': (135, 206, 250),  # Light blue for start
            'F': (255, 255, 255),  # White for frozen
            'H': (100, 100, 100),  # Dark gray for hole
            'G': (50, 205, 50),    # Green for goal
            'agent': (255, 0, 0)   # Red for agent
        }

        # Get the map from environment
        desc = env.unwrapped.desc.astype(str)

        # Draw grid
        for row in range(grid_size):
            for col in range(grid_size):
                cell_type = desc[row, col]
                color = colors.get(cell_type, (255, 255, 255))

                y1 = row * cell_size
                y2 = (row + 1) * cell_size
                x1 = col * cell_size
                x2 = (col + 1) * cell_size

                img[y1:y2, x1:x2] = color

                # Draw grid lines
                img[y1:y1+2, x1:x2] = (0, 0, 0)  # Top border
                img[y1:y2, x1:x1+2] = (0, 0, 0)  # Left border

        # Draw agent position
        agent_row = state // grid_size
        agent_col = state % grid_size
        agent_y = agent_row * cell_size + cell_size // 2
        agent_x = agent_col * cell_size + cell_size // 2
        agent_radius = cell_size // 3

        # Draw agent as circle (simple implementation)
        for y in range(max(0, agent_y - agent_radius), min(img_size, agent_y + agent_radius)):
            for x in range(max(0, agent_x - agent_radius), min(img_size, agent_x + agent_radius)):
                if (x - agent_x) ** 2 + (y - agent_y) ** 2 <= agent_radius ** 2:
                    img[y, x] = colors['agent']

        return img

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

    @staticmethod
    def validate_environment_name(env_name: str) -> bool:
        """
        Check if environment name is valid.

        Args:
            env_name: Environment name to validate

        Returns:
            True if valid, False otherwise
        """
        return env_name in EnvironmentManager.SUPPORTED_ENVIRONMENTS
