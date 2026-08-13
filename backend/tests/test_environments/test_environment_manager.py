"""
Tests for the EnvironmentManager.
"""

import base64

import numpy as np
import pytest

from environments.environment_manager import EnvironmentManager


class TestEnvironmentCreation:
    def test_supported_environments_list(self):
        envs = EnvironmentManager.get_available_environments()
        assert 'FrozenLake-v1' in envs
        assert 'FrozenLake-v1-NoSlip' in envs
        assert 'CartPole-v1' in envs

    def test_create_cartpole(self):
        env = EnvironmentManager.create_environment('CartPole-v1', seed=42)
        try:
            frame = env.render()
            assert isinstance(frame, np.ndarray)
            assert frame.ndim == 3
        finally:
            env.close()

    def test_unknown_environment_rejected(self):
        with pytest.raises(ValueError, match="not supported"):
            EnvironmentManager.create_environment('MountainCar-v0')


class TestFrameConversion:
    def test_frame_to_base64_round_trip(self):
        frame = np.zeros((40, 60, 3), dtype=np.uint8)
        encoded = EnvironmentManager.frame_to_base64(frame)

        assert isinstance(encoded, str)
        decoded = base64.b64decode(encoded)
        # PNG magic bytes
        assert decoded[:8] == b'\x89PNG\r\n\x1a\n'
