"""
DQN (Deep Q-Network) via stable-baselines3.

Default hyperparameters are the rl-baselines3-zoo tuned values for
CartPole-v1, so the workshop defaults train reliably on CPU.
"""
from typing import Dict, Any, Optional

import gymnasium as gym
import numpy as np
import torch
from stable_baselines3 import DQN

from .sb3_base import SB3Algorithm


class DQNAlgorithm(SB3Algorithm):
    """Deep Q-Network wrapper implementing the BaseAlgorithm interface."""

    SUPPORTED_ENVIRONMENTS = ['CartPole-v1', 'FrozenLake-v1-NoSlip', 'FrozenLake-v1', 'MountainCar-v0']

    # Hidden hyperparameters per environment (rl-zoo tuned); overridable
    # via parameters (used by tests for fast runs)
    HIDDEN_DEFAULTS = {
        'MountainCar-v0': {
            'buffer_size': 10_000,
            'learning_starts': 1000,
            'target_update_interval': 600,
            'train_freq': 16,
            'gradient_steps': 8,
        },
    }
    HIDDEN_DEFAULTS_BASE = {
        'buffer_size': 100_000,
        'learning_starts': 1000,
        'target_update_interval': 10,
        'train_freq': 256,
        'gradient_steps': 128,
    }

    def get_learning_data(self, **kwargs) -> Dict[str, Any]:
        data = super().get_learning_data(**kwargs)
        # Discrete-observation environments (FrozenLake) are enumerable:
        # read the network's Q-values for EVERY state - the exact same
        # picture as tabular Q-Learning's table, produced by a network
        if isinstance(self.env.observation_space, gym.spaces.Discrete):
            states = np.arange(self.env.observation_space.n)
            obs_tensor, _ = self.model.policy.obs_to_tensor(states)
            with torch.no_grad():
                q_values = self.model.q_net(obs_tensor).cpu().numpy()
            data['q_table'] = [[float(v) for v in row] for row in q_values]
        return data

    def _create_model(self, env, parameters: Dict[str, Any]):
        hidden = {
            **self.HIDDEN_DEFAULTS_BASE,
            **self.HIDDEN_DEFAULTS.get(env.spec.id, {}),
        }
        return DQN(
            'MlpPolicy',
            env,
            learning_rate=float(parameters.get('learning_rate', 0.0023)),
            gamma=float(parameters.get('discount_factor', 0.99)),
            batch_size=int(parameters.get('batch_size', 64)),
            exploration_fraction=float(parameters.get('exploration_fraction', 0.16)),
            exploration_final_eps=float(parameters.get('exploration_final_eps', 0.04)),
            buffer_size=int(parameters.get('buffer_size', hidden['buffer_size'])),
            learning_starts=int(parameters.get('learning_starts', hidden['learning_starts'])),
            target_update_interval=int(parameters.get('target_update_interval', hidden['target_update_interval'])),
            train_freq=int(parameters.get('train_freq', hidden['train_freq'])),
            gradient_steps=int(parameters.get('gradient_steps', hidden['gradient_steps'])),
            policy_kwargs={'net_arch': parameters.get('net_arch', [256, 256])},
            seed=parameters.get('seed', 42),
            device='cpu',
            verbose=0,
        )

    @staticmethod
    def get_parameter_schema(environment: Optional[str] = None) -> Dict[str, Dict[str, Any]]:
        # Environment-specific defaults (rl-zoo tuned where available):
        # FrozenLake's sparse 0/1 reward needs a long exploration phase;
        # MountainCar's sparse goal needs its own tuned recipe entirely
        base = {
            'total_timesteps': 50000,
            'learning_rate': 0.0023,
            'discount_factor': 0.99,
            'batch_size': 64,
            'exploration_fraction': 0.16,
            'exploration_final_eps': 0.04,
        }
        overrides = {
            'FrozenLake-v1': {'total_timesteps': 100000, 'exploration_fraction': 0.5},
            'FrozenLake-v1-NoSlip': {'total_timesteps': 30000, 'exploration_fraction': 0.5},
            'MountainCar-v0': {
                'total_timesteps': 120000,
                'learning_rate': 0.004,
                'discount_factor': 0.98,
                'batch_size': 128,
                'exploration_fraction': 0.2,
                'exploration_final_eps': 0.07,
            },
        }
        d = {**base, **overrides.get(environment, {})}
        return {
            'total_timesteps': {
                'type': 'int',
                'default': d['total_timesteps'],
                'description': 'Training budget in environment steps. Must be an integer.'
            },
            'learning_rate': {
                'type': 'float',
                'min': 0.0001,
                'max': 0.01,
                'step': 0.0001,
                'default': d['learning_rate'],
                'description': 'Adam optimizer step size for the Q-network'
            },
            'discount_factor': {
                'type': 'float',
                'min': 0.9,
                'max': 0.999,
                'step': 0.001,
                'default': d['discount_factor'],
                'description': '0 ≤ γ < 1 - importance of future rewards'
            },
            'exploration_fraction': {
                'type': 'float',
                'min': 0.05,
                'max': 1.0,
                'step': 0.01,
                'default': d['exploration_fraction'],
                'description': 'Fraction of training over which ε decays from 1.0'
            },
            'exploration_final_eps': {
                'type': 'float',
                'min': 0.0,
                'max': 0.5,
                'step': 0.01,
                'default': d['exploration_final_eps'],
                'description': 'Final ε after decay'
            },
            'batch_size': {
                'type': 'int',
                'min': 16,
                'max': 256,
                'step': 16,
                'default': d['batch_size'],
                'description': 'Minibatch size per gradient step'
            },
            'seed': {
                'type': 'int',
                'default': '',
                'description': 'Same seed = same run. Click the dice to draw a new random seed.'
            },
        }
