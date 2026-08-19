"""
Shared wrapper for stable-baselines3 algorithms.

Adapts SB3's timestep-based, VecEnv-based training loop to the
BaseAlgorithm interface (per-episode callback with a rendered frame).
"""
import time
from typing import Dict, Any, Callable, Optional

import torch
from stable_baselines3.common.callbacks import BaseCallback as SB3BaseCallback
from stable_baselines3.common.monitor import Monitor

from .base_algorithm import BaseAlgorithm

# Keep Flask responsive while SB3 trains in the SSE daemon thread
torch.set_num_threads(2)


class EpisodeTrackingCallback(SB3BaseCallback):
    """
    Fires the RL Lab per-episode callback whenever an episode finishes.

    SB3 wraps the env in a DummyVecEnv (n_envs=1) and the Monitor wrapper
    injects info['episode'] = {'r': reward, 'l': length, 't': time} on
    episode end.
    """

    # Render at most one terminal frame per this interval: fast training
    # finishes dozens of episodes per second, and the frontend applies at
    # most ~6 updates/s anyway - rendering + encoding the rest would only
    # slow down training (episodes without a frame send frame=None)
    RENDER_INTERVAL_SECONDS = 0.15

    def __init__(self, episode_callback, stop_event, learning_data_fn, render_terminal_fn):
        super().__init__(verbose=0)
        self.episode_callback = episode_callback
        self.stop_event = stop_event
        self.learning_data_fn = learning_data_fn
        self.render_terminal_fn = render_terminal_fn
        self.episode_count = 0
        self._last_render_time = 0.0

    def _on_step(self) -> bool:
        for i, done in enumerate(self.locals['dones']):
            if not done:
                continue
            info = self.locals['infos'][i]
            ep = info.get('episode')
            if ep is None:
                continue
            self.episode_count += 1
            if self.episode_callback:
                now = time.monotonic()
                if now - self._last_render_time >= self.RENDER_INTERVAL_SECONDS:
                    frame = self.render_terminal_fn(info.get('terminal_observation'))
                    self._last_render_time = now
                else:
                    frame = None
                self.episode_callback(
                    self.episode_count - 1,  # 0-based, like Q-Learning
                    float(ep['r']),
                    self.learning_data_fn(
                        episode_length=int(ep['l']),
                        episode=self.episode_count - 1,
                    ),
                    frame,
                )

        # SB3 stops by itself at total_timesteps; we only stop early on request
        if self.stop_event is not None and self.stop_event.is_set():
            return False
        return True


class SB3Algorithm(BaseAlgorithm):
    """
    Base class for stable-baselines3 algorithms (DQN now, PPO later).

    Subclasses implement _create_model() and get_parameter_schema().
    """

    MAX_PLAYBACK_STEPS = 500

    def __init__(self, env, parameters: Dict[str, Any]):
        super().__init__(env, parameters)
        # Monitor injects per-episode reward/length into info dicts;
        # wrap explicitly instead of relying on SB3's auto-wrapping
        self.monitored_env = Monitor(env)
        self.model = self._create_model(self.monitored_env, parameters)

    def _create_model(self, env, parameters: Dict[str, Any]):
        """Create and return the SB3 model. Implemented by subclasses."""
        raise NotImplementedError

    def train(self, callback: Optional[Callable] = None, stop_event=None) -> None:
        total_timesteps = int(self.parameters.get('total_timesteps', 50000))

        sb3_callback = EpisodeTrackingCallback(
            episode_callback=callback,
            stop_event=stop_event,
            learning_data_fn=self.get_learning_data,
            render_terminal_fn=self._render_terminal_frame,
        )

        self.model.learn(
            total_timesteps=total_timesteps,
            callback=sb3_callback,
            progress_bar=False,
        )

    def _render_terminal_frame(self, terminal_obs):
        """
        Render the true final frame of an episode.

        SB3's DummyVecEnv auto-resets before the callback runs, so a plain
        render() would show the fresh reset state. We temporarily restore
        the terminal observation, render, and put the reset state back.
        Classic-control envs keep it in unwrapped.state, toy-text envs
        (FrozenLake) in unwrapped.s.
        """
        unwrapped = self.env.unwrapped
        attr = next((a for a in ('state', 's') if hasattr(unwrapped, a)), None)
        if terminal_obs is not None and attr:
            saved_state = getattr(unwrapped, attr)
            try:
                setattr(unwrapped, attr, terminal_obs)
                return self.env.render()
            finally:
                setattr(unwrapped, attr, saved_state)
        return self.env.render()

    def _greedy_action(self, observation) -> int:
        """Deterministic (greedy) action from the SB3 model."""
        action, _ = self.model.predict(observation, deterministic=True)
        return int(action)

    def play_policy(self, callback: Optional[Callable] = None) -> list:
        """Execute the greedy policy; returns a list of (frame, timestep) tuples.

        Renders every step - playback frames are streamed one SSE event
        each, so there is no payload reason to subsample.
        """
        frames = []
        obs, _ = self.env.reset()
        done = False
        steps = 0

        while not done and steps < self.MAX_PLAYBACK_STEPS:
            action, _ = self.model.predict(obs, deterministic=True)
            action = int(action)
            obs, _, terminated, truncated, _ = self.env.step(action)
            done = terminated or truncated

            frame = self.env.render()
            frames.append((frame, steps + 1))
            if callback:
                callback(frame, steps + 1, action)

            steps += 1

        return frames

    def get_learning_data(self, episode_length: Optional[int] = None,
                          episode: Optional[int] = None) -> Dict[str, Any]:
        """
        Return diagnostics for visualization. All values are cast to
        python types - numpy scalars break json.dumps in the SSE stream.
        The episode index lets the frontend plot subsampled diagnostics
        at their true position on the episode axis.
        """
        diagnostics = self._get_diagnostics()
        if episode_length is not None:
            diagnostics['episode_length'] = int(episode_length)
        if episode is not None:
            diagnostics['episode'] = int(episode)
        return {'diagnostics': diagnostics}

    def _get_diagnostics(self) -> Dict[str, Any]:
        """SB3 diagnostics; exploration_rate only exists on some models (DQN)."""
        diagnostics = {
            'total_timesteps': int(self.model.num_timesteps),
        }
        exploration_rate = getattr(self.model, 'exploration_rate', None)
        if exploration_rate is not None:
            diagnostics['exploration_rate'] = float(exploration_rate)
        return diagnostics
