# Hands-On Notebooks (Optional Homework)

These notebooks are an optional add-on to the RL Lab workshop — for digging deeper at home or if you finish early. They are deliberately minimal: each one shows the few lines of code behind what you saw in RL Lab and links to the official documentation where the real depth lives.

| Notebook | What it covers | Extra setup |
|---|---|---|
| `notebooks/frozenlake_q_learning.ipynb` | Implement the Q-Learning update yourself — the exact rule RL Lab's tabular agent uses — and train it on FrozenLake | none |
| `notebooks/sb3_quickstart.ipynb` | Run DQN/PPO with stable-baselines3 — the library RL Lab wraps — with the evaluate → train → evaluate workflow and two small exercises | its **first cell installs** the bigger deep-RL dependencies (~500 MB, CPU-only) |

Solutions for both are in `notebooks/solutions/`.

## Setup (once, ~2 minutes of terminal — everything after is click-through)

Prerequisites: **Python 3.9+** ([download](https://www.python.org/downloads/)) and the **`uv`** package manager ([install guide](https://docs.astral.sh/uv/getting-started/installation/)) — the same tool the RL Lab backend uses.

```bash
cd examples
uv sync
uv run jupyter lab
```

Your browser opens at http://localhost:8888 — open a notebook and run cells with Shift+Enter. That's it: the SB3 notebook installs its own extra dependencies from inside the notebook, so you won't need the terminal again.

## Alternative: VS Code

If you prefer VS Code with the [Jupyter extension](https://marketplace.visualstudio.com/items?itemName=ms-toolsai.jupyter), register the kernel once:

```bash
cd examples
uv sync
uv run python -m ipykernel install --user --name=workshop-rl1-examples --display-name "Python (RL Workshop)"
code .
```

Then open a notebook, click "Select Kernel" (top right) → "Jupyter Kernel" → **"Python (RL Workshop)"**.

## Note for the SB3 notebook

The deep-RL dependencies (PyTorch + stable-baselines3) are an optional extra so the basic setup stays small. The notebook's first cell installs them for you by running `uv sync --extra sb3` — the exact pinned versions from the lockfile, into the same environment the kernel runs in.
