# RL I - Introduction

# RL Lab
An educational web interface for building intuition about reinforcement learning fundamentals. The interface visualizes how RL algorithms learn. The backend is build on the well-known environments of the [gymnasium library](https://gymnasium.farama.org). Users can change environments, algorithms and parameters.

**Current Implementation**: 
- environments
   - Gymnasium FrozenLake-v1 (4x4) with `is_slippery=True`
   - Gymnasium FrozenLake-v1 (4x4) with `is_slippery=False`
- algorithms
   - Q-learning (custom build)

**Design**: Modular architecture designed for easy extension with new algorithms and environments

## Quick Start (Experienced Users)

Already have Docker installed? Get started in 3 commands:

**Prerequisites**: Docker Desktop running (or Docker Engine on Linux)

```bash
# 1. Clone the repository
git clone https://github.com/aihpi/workshop-rl1-introduction.git
cd workshop-rl1-introduction

# 2. Start with Docker
docker-compose up

# 3. Open browser to http://localhost:3000
```

**First-time setup takes ~1-2 minutes** (downloads pre-built images). Subsequent starts take seconds!

---

## Installation (Beginners)

**New to programming or Docker?** Follow our step-by-step installation guides with screenshots:

### Choose Your Operating System:

<table>
<tr>
<td align="center" width="33%">
<h3>📱 Windows</h3>
<p><strong><a href="docs/INSTALLATION_WINDOWS.md">Windows Installation Guide</a></strong></p>
<p>For Windows 10/11</p>
<p><em>~10-15 minutes</em></p>
</td>
<td align="center" width="33%">
<h3>🍎 macOS</h3>
<p><strong><a href="docs/INSTALLATION_MACOS.md">macOS Installation Guide</a></strong></p>
<p>For macOS 10.15+</p>
<p><em>~10-15 minutes</em></p>
</td>
<td align="center" width="33%">
<h3>🐧 Linux</h3>
<p><strong><a href="docs/INSTALLATION_LINUX.md">Linux Installation Guide</a></strong></p>
<p>For Ubuntu/Debian</p>
<p><em>~15-20 minutes</em></p>
</td>
</tr>
</table>

**Each guide includes**:
- ✅ How to open terminal/command prompt
- ✅ Installing Git step-by-step
- ✅ Installing Docker with screenshots
- ✅ Downloading and running RL Lab
- ✅ Troubleshooting common issues
- ✅ Screenshots for every step (coming soon)

**No prior experience required!** The guides assume you're starting from scratch.

---

### Useful Docker Commands

Once installed, here are some helpful commands:

```bash
docker-compose up              # Start the application
docker-compose up -d           # Run in background (detached mode)
docker-compose down            # Stop the application
docker-compose logs -f         # View live logs from both services
docker-compose logs backend    # View only backend logs
docker-compose ps              # Check container status
docker-compose restart         # Restart services
```

**Access the application**:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5001

---

### Advanced: Local Setup (Without Docker)

**Not recommended for workshops**, but possible for development:

**Prerequisites**: Python 3.9+, Node.js 14+, [uv](https://github.com/astral-sh/uv)

**Backend**:
```bash
cd backend
uv sync                    # Install dependencies
uv run python app.py       # Start server (http://localhost:5001)
```

**Frontend** (in new terminal):
```bash
cd frontend
npm install                # Install dependencies
npm start                  # Start server (http://localhost:3000)
```

## Usage

1. **Open the application** in your browser at http://localhost:3000

2. **Adjust parameters** using the sliders:
   - **Learning Rate (α)**: How fast the agent learns (0.01-1.0)
   - **Discount Factor (γ)**: Importance of future rewards (0.0-1.0)
   - **Exploration Rate (ε)**: Probability of random exploration (0.0-1.0)
   - **Number of Episodes**: Training duration (1-10000)

3. **Start training**: Click "Start Training" and watch real-time visualizations:
   - **Environment viewer**: Shows agent's position in FrozenLake
   - **Reward chart**: Tracks training progress with statistics
   - **Q-table heatmap**: Visualizes learned action values (4×4 grid)

4. **Play policy**: After training completes, click "Play Policy" to watch the trained agent execute its learned behavior step-by-step

5. **Reset**: Click "Reset" to clear all data and train again with different parameters

## Testing

**Backend** (8 tests, 41% coverage):
```bash
# Locally
cd backend && uv run pytest

# In Docker
docker-compose exec backend pytest
```

**Frontend** (12 tests):
```bash
cd frontend && npm test
```

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
│   └── ARCHITECTURE.md    # Architecture decisions & technical details
├── tutorials/
│   └── docker-workflow.md # Docker setup guide for beginners
├── docker-compose.yml     # Multi-container orchestration
└── CHANGELOG.md           # Version history
```

**Key architectural concepts**:
- **Backend**: Flask REST API + Server-Sent Events (SSE) for real-time streaming
- **Frontend**: React with Recharts for visualization
- **Modularity**: Factory pattern for algorithms, designed for easy extension

## Documentation

- **[ARCHITECTURE.md](docs/ARCHITECTURE.md)** - Technical architecture, design decisions, API endpoints
- **[Docker Workflow Guide](tutorials/docker-workflow.md)** - Beginner-friendly Docker tutorial
- **[CHANGELOG.md](CHANGELOG.md)** - Version history and release notes

## FrozenLake Environment

FrozenLake is a 4×4 grid world where the agent must navigate from Start (S) to Goal (G):
- **S**: Start position
- **F**: Frozen surface (safe)
- **H**: Hole (episode ends, 0 reward)
- **G**: Goal (episode ends, +1 reward)

The ice is slippery - actions are stochastic (agent may slip in perpendicular directions).

## License

MIT License - Free to use for educational purposes
