# Development Guide

**Key architectural concepts**:
- **Backend**: Flask REST API + Server-Sent Events (SSE) for real-time streaming
- **Frontend**: React with Recharts for visualization
- **Modularity**: Factory pattern for algorithms, designed for easy extension

## Docker Dev Mode (Recommended)

The plain `docker compose up` runs the participant setup: self-contained images, no bind mounts, no hot reload. For development, add the dev override:

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```

This bind-mounts `backend/` and `frontend/` into the containers, enables the Flask reloader (`FLASK_DEBUG=1`) and the React dev server with hot reload. `--build` builds the local frontend dev image (`workshop-rl1-frontend-dev`) when needed.

Two things to know:
- After a dependency bump (pyproject.toml/package.json) plus image rebuild, run `docker compose -f docker-compose.yml -f docker-compose.dev.yml down -v` once — the anonymous volumes holding `.venv`/`node_modules` persist across recreates and would keep the stale dependencies.
- Run the backend test suite inside the container: `docker compose exec backend python -m pytest`.

## Local Setup (Without Docker)

> ⚠️ **Not Recommended for General Use**
>
> Docker is the recommended way to run RL Lab. Local setup is provided for development/informational purposes only.
>
> **Known Issues on macOS**: Due to pygame rendering limitations (for the gym environments), you may encounter errors and bugs when running the backend locally. The Docker setup resolves these issues.
> **Windows**: Not tested!

### Prerequisites

- Python 3.9+
- Node.js 14+
- [uv](https://github.com/astral-sh/uv) (Python package manager)

### Backend Setup

```bash
cd backend
uv sync                    # Install dependencies
uv run python app.py       # Start server (http://localhost:5001)
```

### Frontend Setup

Open a new terminal:

```bash
cd frontend
npm install                # Install dependencies
npm start                  # Start server (http://localhost:3030)
```

### Accessing the Application

Once both servers are running:
- Frontend: http://localhost:3030

---

## Development Workflow

### Making Changes

1. **Frontend changes**: The React dev server will hot-reload automatically
2. **Backend changes**: Restart the Flask server (`Ctrl+C` then `uv run python app.py`)

### Running Tests

**Frontend**:
```bash
cd frontend
npm test
```

**Backend**:
```bash
cd backend
uv run pytest
```

---

## Troubleshooting Local Setup

### macOS Pygame Issues

If you encounter pygame rendering errors on macOS:
- **Solution**: Use the Docker setup instead
- **Root cause**: pygame's video driver conflicts with macOS threading

### Port Already in Use

If port 3030 or 5001 is already in use:
```bash
# Kill process on port 3030
lsof -ti:3030 | xargs kill -9

# Kill process on port 5001
lsof -ti:5001 | xargs kill -9
```

### Module Not Found Errors

**Backend**:
```bash
cd backend
uv sync --reinstall
```

**Frontend**:
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

---