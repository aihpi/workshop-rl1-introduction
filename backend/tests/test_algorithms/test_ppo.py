"""
Tests for the PPO algorithm wrapper (stable-baselines3).

Uses tiny hyperparameter overrides so training runs finish in seconds.
"""

import json
import threading

import gymnasium as gym
import numpy as np
import pytest

from algorithms.ppo import PPOAlgorithm


# Tiny overrides for fast test runs (batch_size must divide n_steps)
FAST_PARAMS = {
    'total_timesteps': 300,
    'n_steps': 64,
    'batch_size': 32,
    'n_epochs': 2,
}


@pytest.fixture
def cartpole_env():
    env = gym.make('CartPole-v1', render_mode='rgb_array')
    yield env
    env.close()


class TestPPOSchema:
    def test_schema_structure(self):
        schema = PPOAlgorithm.get_parameter_schema('CartPole-v1')

        assert 'total_timesteps' in schema
        assert 'seed' in schema
        for name in ['learning_rate', 'discount_factor', 'clip_range', 'ent_coef']:
            assert 'min' in schema[name] and 'max' in schema[name]

    def test_supported_environments(self):
        assert PPOAlgorithm.SUPPORTED_ENVIRONMENTS == ['CartPole-v1']


class TestPPOTraining:
    def test_training_callback_contract(self, cartpole_env):
        """Same per-episode callback contract as DQN: 0-based episodes,
        python floats, JSON-safe learning data, throttled frames."""
        algo = PPOAlgorithm(cartpole_env, FAST_PARAMS)
        events = []
        algo.train(callback=lambda e, r, ld, f: events.append((e, r, ld, f)))

        assert len(events) >= 1
        assert [e[0] for e in events] == list(range(len(events)))
        for episode, reward, learning_data, frame in events:
            assert isinstance(reward, float)
            json.dumps(learning_data)
            assert frame is None or (isinstance(frame, np.ndarray) and frame.ndim == 3)

        # PPO has no exploration_rate - the diagnostics must omit it
        diagnostics = events[-1][2]['diagnostics']
        assert 'exploration_rate' not in diagnostics
        assert 'total_timesteps' in diagnostics

    def test_stop_event_halts_training(self, cartpole_env):
        algo = PPOAlgorithm(cartpole_env, FAST_PARAMS)
        stop = threading.Event()
        stop.set()
        algo.train(callback=None, stop_event=stop)
        assert algo.model.num_timesteps < FAST_PARAMS['total_timesteps']

    def test_play_and_evaluate(self, cartpole_env):
        algo = PPOAlgorithm(cartpole_env, FAST_PARAMS)
        algo.train()

        actions = []
        frames = algo.play_policy(callback=lambda f, s, a: actions.append(a))
        assert 1 <= len(frames) <= PPOAlgorithm.MAX_PLAYBACK_STEPS
        assert all(a in (0, 1) for a in actions)

        summary = algo.evaluate(num_episodes=3)
        assert summary['num_episodes'] == 3
        json.dumps(summary)
