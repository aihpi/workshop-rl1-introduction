"""
PPO (Proximal Policy Optimization) via stable-baselines3.

The second algorithm family in RL Lab: instead of learning action VALUES
(Q-Learning, DQN), PPO learns the policy directly (actor-critic /
policy-gradient). SB3's defaults are robust on CartPole.
"""
from typing import Dict, Any, Optional

from stable_baselines3 import PPO

from .sb3_base import SB3Algorithm


class PPOAlgorithm(SB3Algorithm):
    """PPO wrapper implementing the BaseAlgorithm interface."""

    SUPPORTED_ENVIRONMENTS = ['CartPole-v1']

    def _create_model(self, env, parameters: Dict[str, Any]):
        return PPO(
            'MlpPolicy',
            env,
            learning_rate=float(parameters.get('learning_rate', 0.0003)),
            gamma=float(parameters.get('discount_factor', 0.99)),
            clip_range=float(parameters.get('clip_range', 0.2)),
            ent_coef=float(parameters.get('ent_coef', 0.0)),
            # SB3 defaults; hidden from the UI but overridable via
            # parameters (used by tests for fast runs)
            n_steps=int(parameters.get('n_steps', 2048)),
            batch_size=int(parameters.get('batch_size', 64)),
            n_epochs=int(parameters.get('n_epochs', 10)),
            seed=parameters.get('seed', 42),
            device='cpu',
            verbose=0,
        )

    @staticmethod
    def get_parameter_schema(environment: Optional[str] = None) -> Dict[str, Dict[str, Any]]:
        return {
            'total_timesteps': {
                'type': 'int',
                'default': 100000,
                'description': 'Training budget in environment steps. Must be an integer.'
            },
            'learning_rate': {
                'type': 'float',
                'min': 0.00005,
                'max': 0.003,
                'step': 0.00005,
                'default': 0.0003,
                'description': 'Adam optimizer step size for policy and value networks'
            },
            'discount_factor': {
                'type': 'float',
                'min': 0.9,
                'max': 0.999,
                'step': 0.001,
                'default': 0.99,
                'description': '0 ≤ γ < 1 - importance of future rewards'
            },
            'clip_range': {
                'type': 'float',
                'min': 0.05,
                'max': 0.5,
                'step': 0.01,
                'default': 0.2,
                'description': 'How far each update may move the policy (PPO\'s trust region)'
            },
            'ent_coef': {
                'type': 'float',
                'min': 0.0,
                'max': 0.1,
                'step': 0.005,
                'default': 0.0,
                'description': 'Entropy bonus - higher keeps the policy more random (exploration)'
            },
            'seed': {
                'type': 'int',
                'default': '',
                'description': 'Same seed = same run. Click the dice to draw a new random seed.'
            },
        }
