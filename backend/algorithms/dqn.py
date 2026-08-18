"""
DQN (Deep Q-Network) via stable-baselines3.

Default hyperparameters are the rl-baselines3-zoo tuned values for
CartPole-v1, so the workshop defaults train reliably on CPU.
"""
from typing import Dict, Any, Optional

from stable_baselines3 import DQN

from .sb3_base import SB3Algorithm


class DQNAlgorithm(SB3Algorithm):
    """Deep Q-Network wrapper implementing the BaseAlgorithm interface."""

    SUPPORTED_ENVIRONMENTS = ['CartPole-v1']

    def _create_model(self, env, parameters: Dict[str, Any]):
        return DQN(
            'MlpPolicy',
            env,
            learning_rate=float(parameters.get('learning_rate', 0.0023)),
            gamma=float(parameters.get('discount_factor', 0.99)),
            batch_size=int(parameters.get('batch_size', 64)),
            exploration_fraction=float(parameters.get('exploration_fraction', 0.16)),
            exploration_final_eps=float(parameters.get('exploration_final_eps', 0.04)),
            # rl-zoo tuned values; hidden from the UI but overridable
            # via parameters (used by tests for fast runs)
            buffer_size=int(parameters.get('buffer_size', 100_000)),
            learning_starts=int(parameters.get('learning_starts', 1000)),
            target_update_interval=int(parameters.get('target_update_interval', 10)),
            train_freq=int(parameters.get('train_freq', 256)),
            gradient_steps=int(parameters.get('gradient_steps', 128)),
            policy_kwargs={'net_arch': parameters.get('net_arch', [256, 256])},
            seed=parameters.get('seed', 42),
            device='cpu',
            verbose=0,
        )

    @staticmethod
    def get_parameter_schema(environment: Optional[str] = None) -> Dict[str, Dict[str, Any]]:
        return {
            'total_timesteps': {
                'type': 'int',
                'default': 50000,
                'description': 'Training budget in environment steps. Must be an integer.'
            },
            'learning_rate': {
                'type': 'float',
                'min': 0.0001,
                'max': 0.01,
                'step': 0.0001,
                'default': 0.0023,
                'description': 'Adam optimizer step size for the Q-network'
            },
            'discount_factor': {
                'type': 'float',
                'min': 0.9,
                'max': 0.999,
                'step': 0.001,
                'default': 0.99,
                'description': '0 ≤ γ < 1 - importance of future rewards'
            },
            'exploration_fraction': {
                'type': 'float',
                'min': 0.05,
                'max': 1.0,
                'step': 0.01,
                'default': 0.16,
                'description': 'Fraction of training over which ε decays from 1.0'
            },
            'exploration_final_eps': {
                'type': 'float',
                'min': 0.0,
                'max': 0.5,
                'step': 0.01,
                'default': 0.04,
                'description': 'Final ε after decay'
            },
            'batch_size': {
                'type': 'int',
                'min': 16,
                'max': 256,
                'step': 16,
                'default': 64,
                'description': 'Minibatch size per gradient step'
            },
            'seed': {
                'type': 'int',
                'default': '',
                'description': 'Same seed = same run. Click the dice to draw a new random seed.'
            },
        }
