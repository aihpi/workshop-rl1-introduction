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
        assert DQNAlgorithm.SUPPORTED_ENVIRONMENTS == [
            'CartPole-v1', 'FrozenLake-v1-NoSlip', 'FrozenLake-v1', 'MountainCar-v0'
        ]


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
            # Frame rendering is time-throttled: most episodes carry None
            assert frame is None or (isinstance(frame, np.ndarray) and frame.ndim == 3)
            # Diagnostics carry the true episode index for chart alignment
            assert learning_data['diagnostics']['episode'] == episode

        # At least the first episode renders a frame
        assert any(frame is not None for _, _, _, frame in events)

    def test_learning_data_diagnostics(self, cartpole_env):
        algo = DQNAlgorithm(cartpole_env, FAST_PARAMS)
        events = []
        algo.train(callback=lambda e, r, ld, f: events.append(ld))

        diagnostics = events[-1]['diagnostics']
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

    def test_evaluate(self, cartpole_env):
        """Greedy evaluation returns a JSON-safe statistics summary."""
        algo = DQNAlgorithm(cartpole_env, FAST_PARAMS)
        algo.train()

        episodes_seen = []
        summary = algo.evaluate(num_episodes=5, callback=lambda i, r: episodes_seen.append(i))

        assert episodes_seen == [0, 1, 2, 3, 4]
        assert summary['num_episodes'] == 5
        assert len(summary['returns']) == 5
        assert summary['min_return'] <= summary['mean_return'] <= summary['max_return']
        assert summary['mean_length'] >= 1
        json.dumps(summary)  # numpy leak check

    def test_frozenlake_learning_data_contains_network_q_table(self):
        """On enumerable-state envs the network's Q-values for all states
        are exposed as a q_table - same shape as tabular Q-Learning's."""
        env = gym.make('FrozenLake-v1', render_mode='rgb_array', is_slippery=False)
        try:
            algo = DQNAlgorithm(env, {**FAST_PARAMS, 'net_arch': [32, 32]})
            data = algo.get_learning_data()

            q_table = data['q_table']
            assert len(q_table) == 16 and len(q_table[0]) == 4
            assert all(isinstance(v, float) for row in q_table for v in row)
            json.dumps(data)
        finally:
            env.close()

    def test_initial_value_estimate_shifts_network_output(self):
        """Optimistic init: the untrained network's Q-values sit near the
        requested estimate c (bias shift on the final layer), for both the
        online and the target net. c=0 must remain stock behavior."""
        env = gym.make('FrozenLake-v1', render_mode='rgb_array', is_slippery=False)
        try:
            algo = DQNAlgorithm(env, {**FAST_PARAMS, 'initial_value_estimate': 5.0})
            q_table = np.array(algo.get_learning_data()['q_table'])
            assert np.all(np.abs(q_table - 5.0) < 1.0), \
                "untrained Q-values should sit near the initial estimate"

            import torch
            obs_tensor, _ = algo.model.policy.obs_to_tensor(np.arange(16))
            with torch.no_grad():
                target_q = algo.model.q_net_target(obs_tensor).cpu().numpy()
            assert np.all(np.abs(target_q - 5.0) < 1.0), \
                "target network must be shifted too"
        finally:
            env.close()

    def test_cartpole_learning_data_has_no_q_table(self, cartpole_env):
        """Continuous-state envs cannot be enumerated - no q_table."""
        algo = DQNAlgorithm(cartpole_env, FAST_PARAMS)
        assert 'q_table' not in algo.get_learning_data()

    def test_play_policy_returns_frames(self, cartpole_env):
        algo = DQNAlgorithm(cartpole_env, FAST_PARAMS)
        algo.train()

        actions = []
        frames = algo.play_policy(callback=lambda f, s, a: actions.append(a))

        assert 1 <= len(frames) <= DQNAlgorithm.MAX_PLAYBACK_STEPS
        # Every step is rendered: (frame, 1-based consecutive env timestep)
        assert all(isinstance(f, np.ndarray) and isinstance(s, int) for f, s in frames)
        assert [s for _, s in frames] == list(range(1, len(frames) + 1))
        # The callback reports the action taken at each step
        assert len(actions) == len(frames)
        assert all(isinstance(a, int) and a in (0, 1) for a in actions)
