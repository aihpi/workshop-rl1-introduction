<div style="background-color: #ffffff; color: #000000; padding: 10px;">
<img src="00_aisc\img\logo_aisc_bmftr.jpg">
<h1> Workshop: Reinforcement Learning I - Introduction
</div>

This repository contains the material used in the "Reinforcement Learning I - Introduction" workshop by the AI Service Center Berlin Brandenburg. It provides an educational interface, called **RL Lab**, for building intuition about reinforcement learning fundamentals. The backend is built on the environments of the [gymnasium library](https://gymnasium.farama.org).

![Application Screenshot](docs/screenshots/app/main-interface.png)

## Features

- **Environments**:
   - [Gymnasium FrozenLake-v1](https://gymnasium.farama.org/environments/toy_text/frozen_lake/) (4x4) with `is_slippery=True`
   - [Gymnasium FrozenLake-v1](https://gymnasium.farama.org/environments/toy_text/frozen_lake/) (4x4) with `is_slippery=False`
   - [Gymnasium CartPole-v1](https://gymnasium.farama.org/environments/classic_control/cart_pole/)
- **Algorithms**:
   - Q-learning (custom build) — for FrozenLake
   - DQN ([stable-baselines3](https://stable-baselines3.readthedocs.io/)) — for CartPole

## Setup and Installation

### Prerequisites

- Git
- Docker Desktop running or Docker Engine

### Quick Start (Experienced Users)

Already have git and Docker installed? Get started in 3 commands:

1. Clone the repository
```bash
git clone https://github.com/aihpi/workshop-rl1-introduction.git
```

2. Navigate inside
```bash
cd workshop-rl1-introduction
```

3. Is Docker running? Then you can start the app (detached mode)
```bash
docker compose up -d
```

4. Open browser to http://localhost:3030

**First-time setup takes ~1-2 minutes** (downloads pre-built images).

**Note**: Running in detached mode (`-d`) keeps your terminal free. To view logs if needed for debugging, open a separate terminal and run `docker compose logs -f`

### Installation Guides (Beginners)

**New to programming or Docker?** Follow the installation guides:

<table>
<tr>
<td align="center" width="33%">
<h3>📱 Windows</h3>
<p><strong><a href="docs/INSTALLATION_WINDOWS.md">Windows Installation Guide</a></strong></p>
</td>
<td align="center" width="33%">
<h3>🍎 macOS</h3>
<p><strong><a href="docs/INSTALLATION_MACOS.md">macOS Installation Guide</a></strong></p>
</td>
<td align="center" width="33%">
<h3>🐧 Linux</h3>
<p><strong><a href="docs/INSTALLATION_LINUX.md">Linux Installation Guide</a></strong></p>
</td>
</tr>
</table>

**Useful Docker Commands**

Once installed, here are some helpful commands:

```bash
docker compose up -d           # Start the application (detached mode)
docker compose down            # Stop the application
docker compose logs -f         # View live logs (for debugging, in separate terminal)
docker compose logs backend    # View only backend logs
docker compose logs frontend   # View only frontend logs
docker compose ps              # Check container status
docker compose restart         # Restart services
```

## User Guide

### Using the Tool

1. **Open the application** in your browser at http://localhost:3030

2. **Adjust parameters** using the sliders:
   - **Number of Episodes**: Training duration
   - **Exploration Rate (ε)**: Probability of random exploration
   - **Learning Rate (α)**: How fast the agent learns
   - **Discount Factor (γ)**: Importance of future rewards

3. **Start training**: Click "Start Training" and watch real-time visualizations:
   - **Environment viewer**: Renders agent's last position of a training episode
   - **Reward chart**: Tracks training progress with statistics
   - **Q-table heatmap**: Visualizes learned action values (4×4 grid)

4. **Play policy**: After training completes, click "Play Policy" to watch the trained agent execute its learned behavior step-by-step.

### Hands-On Coding (Optional)

Want to implement Q-Learning yourself? After using RL Lab to build intuition, try the Jupyter notebook in the examples directory to implement Q-Learning yourself and see how the code works.

Instructions for how to get the notebooks running are in [`examples/README.md`](examples/README.md).

![Notebook Screenshot](docs/screenshots/app/notebook-QL-FrozenLake.png)

## Repository Structure

```
workshop-rl1-introduction/
├── backend/               # Python Flask backend
│   ├── algorithms/        # RL algorithm implementations
│   │   ├── base_algorithm.py      # Abstract base class
│   │   └── q_learning.py          # Q-Learning implementation
│   ├── environments/      # Gymnasium environment handling
│   ├── training/          # Session management
│   ├── tests/             # Backend test suite
│   └── app.py             # Flask API server
├── frontend/              # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   │   ├── ParameterPanel.jsx
│   │   │   ├── EnvironmentViewer.jsx
│   │   │   ├── RewardChart.jsx
│   │   │   ├── LearningVisualization.jsx
│   │   │   └── ControlButtons.jsx
│   │   ├── App.js         # Main application
│   │   └── api.js         # Backend communication
│   └── src/components/__tests__/  # Frontend test suite
├── docs/
│   ├── DEVELOPMENT.md          # Local development setup (without Docker)
│   ├── INSTALLATION_LINUX.md   # Linux installation guide
│   ├── INSTALLATION_MACOS.md   # macOS installation guide
│   ├── INSTALLATION_WINDOWS.md # Windows installation guide
│   └── screenshots/            # Documentation screenshots
└── docker-compose.yml     # Multi-container orchestration
```

## Limitations

- Two environments (FrozenLake 4x4, CartPole) and two algorithms (Q-Learning, DQN)
- Each algorithm supports specific environments (Q-Learning: FrozenLake; DQN: CartPole)
- Requires Docker for running the application

## References

- [Gymnasium Library Documentation](https://gymnasium.farama.org)
- [FrozenLake Environment](https://gymnasium.farama.org/environments/toy_text/frozen_lake/)

## Author

- [David Goll](https://github.com/golldavid)
- [Jill Barvencik](https://github.com/Jill-Barvencik)

## License

MIT License - Free to use for educational purposes

---

## Acknowledgements
<img src="00_aisc/img/logo_bmftr_de.png" alt="drawing" style="width:170px;"/>

The [AI Service Centre Berlin Brandenburg](http://hpi.de/kisz) is funded by the [Federal Ministry of Research, Technology and Space](https://www.bmbf.de/) under the funding code 01IS22092.
