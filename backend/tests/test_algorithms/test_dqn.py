"""
Tests for the DQN algorithm wrapper (stable-baselines3).

Uses tiny hyperparameter overrides so training runs finish in seconds.
"""

import json
import threading

import gymnasium as gym
import numpy as np
import pytest

from algorithms.dqn import DQNAlgorithm


# Tiny overrides for fast test runs
FAST_PARAMS = {
    'total_timesteps': 300,
    'buffer_size': 1000,
    'learning_starts': 0,
    'train_freq': 32,
    'gradient_steps': 1,
    'net_arch': [32, 32],
}


@pytest.fixture
def cartpole_env():
    env = gym.make('CartPole-v1', render_mode='rgb_array')
    yield env
    env.close()


class TestDQNSchema:
    def test_schema_structure(self):
        schema = DQNAlgorithm.get_parameter_schema('CartPole-v1')

        # Budget is total_timesteps (not num_episodes)
        assert 'total_timesteps' in schema
        assert 'num_episodes' not in schema
        assert schema['total_timesteps']['type'] == 'int'

        # Bounded params carry min/max for slider rendering
        for name in ['learning_rate', 'discount_factor', 'exploration_fraction',
                     'exploration_final_eps', 'batch_size']:
            assert name in schema
            assert 'min' in schema[name]
            assert 'max' in schema[name]
            assert 'default' in schema[name]
            assert 'description' in schema[name]

        # New optional step field is present on fine-grained params
        assert schema['learning_rate']['step'] == 0.0001

    def test_supported_environments(self):
        assert DQNAlgorithm.SUPPORTED_ENVIRONMENTS == ['CartPole-v1']
        assert DQNAlgorithm.supports_environment('CartPole-v1')
        assert not DQNAlgorithm.supports_environment('FrozenLake-v1')


class TestDQNTraining:
    def test_training_callback_contract(self, cartpole_env):
        """Callback receives 0-based increasing episodes, python floats,
        JSON-serializable learning data, and numpy frames."""
        algo = DQNAlgorithm(cartpole_env, FAST_PARAMS)
        events = []

        def callback(episode, reward, learning_data, frame):
            events.append((episode, reward, learning_data, frame))

        algo.train(callback=callback)

        assert len(events) >= 1
        episodes = [e[0] for e in events]
        assert episodes == list(range(len(events)))

        for episode, reward, learning_data, frame in events:
            assert isinstance(reward, float)
            json.dumps(learning_data)  # raises on numpy scalar leaks
            assert isinstance(frame, np.ndarray)
            assert frame.ndim == 3

    def test_learning_data_diagnostics(self, cartpole_env):
        algo = DQNAlgorithm(cartpole_env, FAST_PARAMS)
        events = []
        algo.train(callback=lambda e, r, ld, f: events.append(ld))

        diagnostics = events[-1]['diagnostics']
        assert 'loss' in diagnostics
        assert 'exploration_rate' in diagnostics
        assert 'total_timesteps' in diagnostics
        assert 'episode_length' in diagnostics
        assert 0.0 <= diagnostics['exploration_rate'] <= 1.0

    def test_stop_event_halts_training(self, cartpole_env):
        algo = DQNAlgorithm(cartpole_env, FAST_PARAMS)
        stop = threading.Event()
        stop.set()

        algo.train(callback=None, stop_event=stop)

        # Stopped at the first callback check, far below the budget
        assert algo.model.num_timesteps < FAST_PARAMS['total_timesteps']

    def test_play_policy_returns_frames(self, cartpole_env):
        algo = DQNAlgorithm(cartpole_env, FAST_PARAMS)
        algo.train()

        frames = algo.play_policy()

        assert len(frames) >= 1
        # Stride-2 rendering caps frames at ~half the max playback steps (+ final frame)
        assert len(frames) <= DQNAlgorithm.MAX_PLAYBACK_STEPS // DQNAlgorithm.FRAME_STRIDE + 1
        assert all(isinstance(f, np.ndarray) for f in frames)
