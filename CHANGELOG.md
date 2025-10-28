# Changelog

All notable changes to RL Playground will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [0.1.0] - 2025-01-28

### Added
- Q-Learning algorithm with tabular approach for discrete state/action spaces
- FrozenLake-v1 environment (slippery/stochastic)
- FrozenLake-v1-NoSlip environment (deterministic)
- React frontend with real-time training visualization
- Server-Sent Events (SSE) for streaming training updates
- Environment preview on app load
- Q-table heatmap visualization (4×4 grid with action values)
- Episode reward chart with statistics
- Dynamic parameter panel with sliders
- Policy playback with frame-by-frame animation
- Environment-specific parameter ranges (num_episodes adapts per environment)
- Auto-reset when switching environments

### Fixed
- Critical tie-breaking bug in Q-Learning: `argmax` now randomly selects among tied Q-values
- Added max_steps_per_episode (100) to prevent infinite loops in deterministic environments

### Technical Details
- **Backend**: Flask, Gymnasium, NumPy, Python 3.9+
- **Frontend**: React 19, Recharts, Axios
- **Architecture**: Modular design with factory pattern, ready for stable-baselines3 integration
- **Rendering**: Only final frame per episode during training, all frames during playback

## Next Steps (Phase 2)
- Additional algorithms (SARSA, DQN with neural networks)
- Additional environments (CartPole, continuous control)
- Epsilon decay schedules
- Training progress persistence
