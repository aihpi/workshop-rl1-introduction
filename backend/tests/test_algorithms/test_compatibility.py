"""
Tests for the algorithm/environment compatibility mechanism.
"""

import gymnasium as gym
import pytest

from algorithms import AlgorithmFactory


class TestCompatibility:
    def test_get_compatibility_shape(self):
        compat = AlgorithmFactory.get_compatibility()

        assert compat['Q-Learning'] == ['FrozenLake-v1-NoSlip', 'FrozenLake-v1']
        assert compat['DQN'] == ['CartPole-v1']

    def test_incompatible_pair_raises(self):
        env = gym.make('CartPole-v1', render_mode='rgb_array')
        try:
            with pytest.raises(ValueError, match="does not support"):
                AlgorithmFactory.create_algorithm(
                    'Q-Learning', env, {}, environment_name='CartPole-v1'
                )
        finally:
            env.close()

    def test_compatible_pair_creates(self):
        env = gym.make('CartPole-v1', render_mode='rgb_array')
        try:
            algo = AlgorithmFactory.create_algorithm(
                'DQN', env, {'buffer_size': 1000, 'net_arch': [32, 32]},
                environment_name='CartPole-v1'
            )
            assert algo is not None
        finally:
            env.close()

    def test_no_environment_name_skips_check(self):
        """Backward compatible: callers without environment_name are not validated."""
        env = gym.make('FrozenLake-v1', render_mode='rgb_array')
        try:
            algo = AlgorithmFactory.create_algorithm('Q-Learning', env, {})
            assert algo is not None
        finally:
            env.close()
