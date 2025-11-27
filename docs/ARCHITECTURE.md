# Architecture Guide

> This document serves as project documentation for all contributors and is also read by Claude Code.

## Project Overview

RL Playground is an educational web interface for exploring reinforcement learning algorithms interactively. Users control learning parameters and watch agents train in real-time.

**Phase 1 Scope**: Q-Learning (tabular) on FrozenLake-v1 only. Future phases will add stable-baselines3 algorithms (DQN, PPO, SAC) and more Gym environments.

## Development Commands

### Backend (Python/Flask)
```bash
cd backend
uv sync                    # Install dependencies and create virtual environment
uv run python app.py       # Run Flask server (uv automatically uses venv)
```

**Important**: Use `uv sync` to install dependencies from `pyproject.toml`. Use `uv run` to execute commands in the virtual environment.

### Frontend (React)
```bash
cd frontend
npm install
npm start                  # Run development server on localhost:3030
```

## Critical Architecture Decisions

### 1. Rendering Strategy (MOST IMPORTANT!)

**During Training**:
- Render ONLY the final frame of each episode
- Call `env.render()` AFTER the episode loop completes
- Send immediately via SSE (no batching)
- Result: ~10 updates/second for 1000 episodes

**During Policy Playback**:
- Render EVERY step of execution
- Call `env.render()` AFTER every step
- Collect all frames (typically 10-20)
- Send complete array in one SSE event
- Frontend animates with 200ms delay per frame

**Why**: Training generates thousands of frames (1000 episodes × 20 steps = 20K frames). Only showing final frames keeps bandwidth manageable while policy playback needs every step visible.

### 2. Modular, Extensible Design

The architecture is designed for future compatibility with stable-baselines3:

- **Base Algorithm Interface**: Abstract class with `train()`, `play_policy()`, `get_learning_data()`, `get_parameter_schema()`
- **Algorithm Factory**: Creates algorithm instances by name
- **Environment Manager**: Handles ANY Gym/Gymnasium environment
- **Training Coordinator**: Algorithm-agnostic session management with UUIDs
- **API Endpoints**: Generic, work with any algorithm

**Do NOT hardcode "Q-Learning" everywhere!** Use the factory pattern. Think: "How would DQN from stable-baselines3 fit here?"

### 3. Communication Pattern

- **REST API**: Control operations (start training, reset)
- **Server-Sent Events (SSE)**: Real-time streaming updates
  - Training endpoint: `/api/train/stream/<session_id>`
  - Playback endpoint: `/api/play-policy/stream/<session_id>`
- **CORS**: Enabled for localhost:3030

## Project Structure

```
backend/
├── app.py                      # Flask API (7 endpoints)
├── algorithms/
│   ├── __init__.py             # AlgorithmFactory
│   ├── base_algorithm.py       # Abstract base class
│   └── q_learning.py           # Q-Learning implementation
├── environments/
│   └── environment_manager.py  # Gym env creation, frame→base64 conversion
├── training/
│   └── trainer.py              # Session management, UUID-based
└── pyproject.toml              # uv project config

frontend/
├── src/
│   ├── components/
│   │   ├── ParameterPanel.jsx          # Dynamic controls from schema
│   │   ├── EnvironmentViewer.jsx       # Display base64 frames
│   │   ├── RewardChart.jsx             # Recharts line chart
│   │   ├── LearningVisualization.jsx   # Q-table heatmap (4×4 grid)
│   │   └── ControlButtons.jsx          # Start/Reset/Play Policy
│   ├── App.jsx                          # State orchestration
│   └── api.js                           # Backend communication + SSE
└── package.json
```

## Backend Implementation Details

### Q-Learning Specifics
- Initialize Q-table as zeros: `np.zeros((num_states, num_actions))`
- Epsilon-greedy exploration
- Standard Q-learning update rule: `Q[s,a] = Q[s,a] + α * (r + γ * max(Q[s']) - Q[s,a])`
- Parameters: learning_rate (α), discount_factor (γ), exploration_rate (ε), num_episodes

### Environment Manager
- Create envs with `render_mode="rgb_array"`
- Convert frames to base64 PNG strings for transmission
- Phase 1: Only FrozenLake-v1 supported
- Validate environment names

### Flask API Endpoints (7 total)
1. `GET /api/algorithms` - List available algorithms
2. `GET /api/environments` - List available environments
3. `GET /api/parameters/<algorithm>` - Get parameter schema
4. `POST /api/train` - Start training, return session_id
5. `GET /api/train/stream/<session_id>` - SSE training updates
6. `GET /api/play-policy/stream/<session_id>` - SSE policy playback
7. `POST /api/reset` - Clear all sessions

### SSE Event Formats

**Training event** (sent after each episode):
```json
{
  "episode": 150,
  "reward": 0.5,
  "learning_data": {"q_table": [[...]]},
  "frame": "base64_string",
  "status": "training"
}
```

**Playback event** (sent once with all frames):
```json
{
  "frames": ["base64_1", "base64_2", ...],
  "num_frames": 15,
  "status": "complete"
}
```

## Frontend Implementation Details

### State Management (App.jsx)
- `selectedAlgorithm`, `selectedEnvironment`
- `parameters` (from schema)
- `trainingData` (frame, episode, rewards, learningData, status flags)
- `sessionId`, `eventSource`, `error`

### Training Flow
1. User adjusts parameters in ParameterPanel
2. User clicks Start Training
3. Call `startTraining()` API → get session_id
4. Subscribe to SSE stream via EventSource
5. Update state on each event
6. On complete, enable Play Policy button
7. On Play Policy click, subscribe to playback stream
8. Animate through frames with setInterval (200ms delay)

### Q-Table Visualization

**Visual Layout**:
- Display as 4×4 grid matching FrozenLake environment layout (16 states). IMPORTANT: This is only applicable to the 4x4 frozenlake environment. Different environments should be displayed differently. For now focus only on Frozenlake, but build the architecture in a modular way so that it can be extended later. 
- Each cell represents one state and contains 4 directional arrows: ↑ (up), → (right), ↓ (down), ← (left)
- Arrows should be positioned in a cross/plus pattern within each cell (up at top, right at right, down at bottom, left at left)

**Color Coding (Global Normalization)**:
- Each arrow is colored using a gradient from violet (minimum Q-value) to orange (maximum Q-value)
- **Important**: Min/max are calculated GLOBALLY across all 64 Q-values (16 states × 4 actions)
- This allows users to see the absolute distribution of Q-values across the entire table
- Example: If global Q-values range from -0.5 to 2.0:
  - An action with Q-value -0.5 gets violet (global minimum)
  - An action with Q-value 2.0 gets orange (global maximum)
  - An action with Q-value 0.75 gets a mid-range color interpolated between violet and orange
- Use a smooth gradient interpolation (e.g., HSL color space transitioning from violet to orange)

**Highlighting Best Action per State**:
- For each state, identify the action with the maximum Q-value
- Draw ONLY THE EDGES (border) of that arrow in orange to make it easily distinguishable
- Border should be thick enough to be visible (e.g., 3-4px)
- **Tie handling**: If multiple actions share the maximum Q-value for a state (e.g., two actions both have 0.8), do NOT draw orange borders for any action in that state
- This visual cue helps users quickly identify the optimal action for each state while the fill color shows absolute value

**Q-Value Labels**:
- Display the actual Q-value number inside each arrow
- Use black text for readability against the colored background
- Format numbers to 2-3 decimal places (e.g., "0.82" or "0.123")
- Font should be small but legible

**Additional Information**:
- Show global statistics above the grid: min Q-value, max Q-value, average Q-value across all 64 values
- This helps users understand the overall learning progress and provides context for the color gradient

**Implementation Notes**:
- Frontend receives Q-table as 16×4 array from backend
- Calculate global min and max across all 64 Q-values
- Display the actual Q-values numbers and not a normalised number. This helps users to better understand the actual algorithm.
- Map normalized value to violet-orange gradient
- For each state, find the maximum Q-value among its 4 actions
- Check for ties (count how many actions have the max value)
- If exactly one action has the max value, apply orange border; if multiple actions tie, no borders
- Render arrow shapes (SVG triangles recommended for border control) with gradient fill color, optional orange border, and black text overlay

### EventSource Cleanup
Always close EventSource connections to prevent memory leaks:
```javascript
if (eventSource) {
  eventSource.close();
}
```

## Common Pitfalls to Avoid

1. Rendering every step during training (ONLY render final frame per episode!)
2. Hardcoding "Q-Learning" instead of using factory pattern
3. Forgetting CORS configuration for localhost:3030
4. Not closing EventSource connections (memory leaks)
5. Blocking UI thread (use SSE for non-blocking updates)
6. Missing error handling in async operations

## Testing Strategy

### Testing Philosophy

- **Comprehensive Coverage**: Aim for >80% code coverage across backend and frontend
- **Test Behavior, Not Implementation**: Focus on public APIs and user-facing functionality
- **Fast Feedback**: Unit tests should run in <5 seconds, full suite in <30 seconds
- **Isolated Tests**: Each test should be independent and not rely on others
- **Maintainable**: Tests are documentation - they should be clear and easy to understand

### Backend Testing (Python/Flask)

#### Technology Stack

- **pytest** - Testing framework (industry standard for Python)
- **pytest-cov** - Code coverage reporting
- **pytest-flask** - Flask-specific testing utilities
- **pytest-mock** - Mocking and patching support

#### Directory Structure

```
backend/
├── tests/
│   ├── __init__.py
│   ├── conftest.py                    # Shared fixtures (Flask app, test client)
│   ├── test_algorithms/
│   │   ├── __init__.py
│   │   ├── test_q_learning.py         # Q-Learning algorithm tests
│   │   └── test_base_algorithm.py     # Abstract base class tests
│   ├── test_environments/
│   │   ├── __init__.py
│   │   └── test_environment_manager.py # Environment creation, rendering tests
│   ├── test_training/
│   │   ├── __init__.py
│   │   └── test_trainer.py            # Session management tests
│   └── test_api/
│       ├── __init__.py
│       ├── test_endpoints.py          # REST API endpoint tests
│       └── test_sse_streaming.py      # SSE streaming integration tests
├── pytest.ini                          # pytest configuration
├── .coveragerc                         # Coverage configuration
└── pyproject.toml                      # Add test dependencies
```

#### Key Test Cases

**Q-Learning Algorithm Tests** (`test_q_learning.py`):
- ✓ Q-table initialized as zeros with correct shape (num_states × num_actions)
- ✓ Epsilon-greedy selects random action with probability ε
- ✓ Epsilon-greedy selects greedy action with probability 1-ε
- ✓ Q-learning update rule correctly updates Q-values
- ✓ Tie-breaking: random selection among tied Q-values
- ✓ Max steps per episode prevents infinite loops
- ✓ Training callback invoked after each episode with correct data
- ✓ Play policy executes greedy policy and returns all frames
- ✓ Parameter schema returns correct structure for FrozenLake environments

**Environment Manager Tests** (`test_environment_manager.py`):
- ✓ Create environment with render_mode="rgb_array"
- ✓ Validate environment names (reject unknown environments)
- ✓ Frame conversion to base64 PNG string
- ✓ Get environment preview returns valid frame
- ✓ Handle environment creation errors gracefully

**Session Management Tests** (`test_trainer.py`):
- ✓ Create new session with unique UUID
- ✓ Retrieve active session by ID
- ✓ Clear all sessions
- ✓ Handle non-existent session IDs (return 404)
- ✓ Multiple concurrent sessions supported

**API Endpoint Tests** (`test_endpoints.py`):
- ✓ `GET /api/algorithms` returns list of algorithms
- ✓ `GET /api/environments` returns list of environments
- ✓ `GET /api/parameters/<algorithm>` returns schema for Q-Learning
- ✓ `GET /api/parameters/<algorithm>` returns 404 for unknown algorithm
- ✓ `POST /api/train` creates session and returns session_id
- ✓ `POST /api/train` validates required parameters
- ✓ `POST /api/train` rejects invalid parameter values
- ✓ `POST /api/reset` clears all sessions and returns 200
- ✓ `GET /api/preview/<environment>` returns preview frame

**SSE Streaming Tests** (`test_sse_streaming.py`):
- ✓ Training stream sends episode updates with correct format
- ✓ Training stream sends complete event when training finishes
- ✓ Training stream handles session not found (404)
- ✓ Playback stream sends all frames in single event
- ✓ Playback stream requires completed training session
- ✓ Keep-alive comments sent to prevent timeout
- ✓ Multiple clients can subscribe to same session

#### Running Backend Tests

```bash
# Install test dependencies
cd backend
uv add --dev pytest pytest-cov pytest-flask pytest-mock

# Run all tests
uv run pytest

# Run with coverage report
uv run pytest --cov=. --cov-report=term-missing

# Run specific test file
uv run pytest tests/test_algorithms/test_q_learning.py

# Run in verbose mode
uv run pytest -v

# Run with coverage and generate HTML report
uv run pytest --cov=. --cov-report=html
```

#### Backend Test Configuration

**pytest.ini**:
```ini
[pytest]
testpaths = tests
python_files = test_*.py
python_classes = Test*
python_functions = test_*
addopts =
    -v
    --strict-markers
    --tb=short
```

**.coveragerc**:
```ini
[run]
source = .
omit =
    tests/*
    */migrations/*
    */__pycache__/*
    */site-packages/*
    .venv/*

[report]
exclude_lines =
    pragma: no cover
    def __repr__
    raise AssertionError
    raise NotImplementedError
    if __name__ == .__main__.:
```

### Frontend Testing (React)

#### Technology Stack

- **Jest** - Testing framework (included with Create React App)
- **React Testing Library** - Component testing (included with CRA)
- **MSW (Mock Service Worker)** - API mocking for integration tests
- **@testing-library/user-event** - User interaction simulation
- **@testing-library/jest-dom** - Custom Jest matchers

#### Directory Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── ParameterPanel.jsx
│   │   ├── ParameterPanel.test.jsx
│   │   ├── ControlButtons.jsx
│   │   ├── ControlButtons.test.jsx
│   │   ├── EnvironmentViewer.jsx
│   │   ├── EnvironmentViewer.test.jsx
│   │   ├── RewardChart.jsx
│   │   ├── RewardChart.test.jsx
│   │   ├── LearningVisualization.jsx
│   │   └── LearningVisualization.test.jsx
│   ├── __tests__/
│   │   ├── integration/
│   │   │   ├── TrainingFlow.test.jsx      # End-to-end training workflow
│   │   │   └── PolicyPlayback.test.jsx    # Policy playback workflow
│   │   └── mocks/
│   │       ├── handlers.js                # MSW API request handlers
│   │       └── server.js                  # MSW server setup
│   ├── api.test.js                        # API utility function tests
│   ├── App.test.jsx                       # Main app component tests
│   └── setupTests.js                      # Test environment setup
└── jest.config.js                         # Jest configuration (optional)
```

#### Key Test Cases

**ParameterPanel Tests** (`ParameterPanel.test.jsx`):
- ✓ Renders all parameter controls from schema
- ✓ Displays current parameter values
- ✓ Updates parameter value when slider moved
- ✓ Calls onParametersChange with new values
- ✓ Environment dropdown shows all environments
- ✓ Calls onEnvironmentChange when environment selected
- ✓ Respects parameter min/max constraints

**ControlButtons Tests** (`ControlButtons.test.jsx`):
- ✓ Renders "Start Training" button when idle
- ✓ Renders "Stop Training" button when training
- ✓ Calls onStartTraining when Start button clicked
- ✓ Calls onStopTraining when Stop button clicked
- ✓ Disables buttons during playback
- ✓ Play Policy button disabled when training incomplete
- ✓ Play Policy button enabled after training completes

**EnvironmentViewer Tests** (`EnvironmentViewer.test.jsx`):
- ✓ Shows "Ready to train a policy" status initially
- ✓ Shows "Training - Episode X" during training
- ✓ Shows "Ready" after training completes
- ✓ Shows "Playing Policy" during playback
- ✓ Renders environment frame as base64 image
- ✓ Shows placeholder when no frame available

**RewardChart Tests** (`RewardChart.test.jsx`):
- ✓ Renders chart with reward data
- ✓ Displays min/max/avg statistics
- ✓ Shows placeholder when no data available
- ✓ Updates chart as new rewards added

**LearningVisualization Tests** (`LearningVisualization.test.jsx`):
- ✓ Renders 4×4 Q-table grid for FrozenLake
- ✓ Displays Q-values with 2 decimal places
- ✓ Calculates global min/max/avg correctly
- ✓ Colors arrows based on global normalization
- ✓ Highlights best action with cyan border
- ✓ No border when actions tied for max
- ✓ Shows placeholder when no learning data
- ✓ State numbers displayed (0-15)

**App Component Tests** (`App.test.jsx`):
- ✓ Renders all main components
- ✓ Loads environment preview on mount
- ✓ Updates parameters when changed in panel
- ✓ Starts training and shows updates
- ✓ Stops training mid-run
- ✓ Plays policy after training completes
- ✓ Resets state when environment changed
- ✓ Displays error banner on API failure

**API Utility Tests** (`api.test.js`):
- ✓ startTraining sends correct POST request
- ✓ subscribeToTraining creates EventSource
- ✓ subscribeToPlayback creates EventSource
- ✓ resetTraining sends POST to /api/reset
- ✓ getEnvironmentPreview fetches preview frame

**Integration Tests** (`TrainingFlow.test.jsx`):
- ✓ Complete training workflow: start → update → complete → play
- ✓ SSE events update UI correctly
- ✓ Error handling for failed API calls
- ✓ EventSource cleanup on unmount
- ✓ Stop training interrupts and resets

#### Running Frontend Tests

```bash
# Install test dependencies (if needed)
cd frontend
npm install --save-dev msw @testing-library/user-event

# Run all tests (watch mode)
npm test

# Run all tests once (CI mode)
npm test -- --watchAll=false

# Run with coverage
npm test -- --coverage --watchAll=false

# Run specific test file
npm test ParameterPanel.test.jsx

# Update snapshots
npm test -- -u
```

#### Frontend Test Configuration

**setupTests.js** (already exists):
```javascript
import '@testing-library/jest-dom';
import { server } from './__tests__/mocks/server';

// Establish API mocking before all tests
beforeAll(() => server.listen());

// Reset handlers after each test
afterEach(() => server.resetHandlers());

// Clean up after all tests
afterAll(() => server.close());
```

**package.json** additions:
```json
{
  "scripts": {
    "test": "react-scripts test",
    "test:coverage": "react-scripts test --coverage --watchAll=false",
    "test:ci": "CI=true react-scripts test --coverage"
  },
  "jest": {
    "collectCoverageFrom": [
      "src/**/*.{js,jsx}",
      "!src/index.js",
      "!src/reportWebVitals.js",
      "!src/setupTests.js"
    ],
    "coverageThreshold": {
      "global": {
        "branches": 70,
        "functions": 70,
        "lines": 80,
        "statements": 80
      }
    }
  }
}
```

### Docker Integration for Testing

#### Add to docker-compose.yml

```yaml
services:
  # Existing services...

  # Backend tests
  backend-test:
    build: ./backend
    command: pytest tests/ -v --cov=. --cov-report=term-missing
    volumes:
      - ./backend:/app
    environment:
      - TESTING=true
      - PYTHONDONTWRITEBYTECODE=1

  # Frontend tests
  frontend-test:
    build: ./frontend
    command: npm test -- --coverage --watchAll=false
    volumes:
      - ./frontend:/app
      - /app/node_modules
    environment:
      - CI=true
```

#### Run tests in Docker

```bash
# Run backend tests
docker-compose run backend-test

# Run frontend tests
docker-compose run frontend-test

# Run both in parallel
docker-compose run backend-test & docker-compose run frontend-test
```

### Test Implementation Priority

Implement tests in this order for maximum value:

**Phase 1: Critical Backend Tests** 
1. Q-Learning algorithm tests (core correctness)
2. Environment manager tests (rendering, validation)
3. API endpoint tests (all 7 endpoints)

**Phase 2: Backend Integration** 
4. SSE streaming tests (training, playback)
5. Session management tests (UUID handling)
6. Integration tests (full training workflow)

**Phase 3: Critical Frontend Tests** 
7. ControlButtons tests (user interactions)
8. ParameterPanel tests (parameter handling)
9. App component tests (state orchestration)

**Phase 4: Frontend Components** 
10. EnvironmentViewer tests (frame display)
11. RewardChart tests (data visualization)
12. LearningVisualization tests (Q-table rendering)

**Phase 5: Integration & Polish**
13. Frontend integration tests (full workflows)
14. API utility tests (backend communication)
15. Achieve >80% coverage across both codebases

### Testing Best Practices

1. **Arrange-Act-Assert**: Structure tests clearly with setup, execution, verification
2. **One Assertion Per Test**: Keep tests focused and easy to debug
3. **Descriptive Test Names**: Test names should read like specifications
4. **Mock External Dependencies**: Use fixtures and mocks for databases, APIs, etc.
5. **Test Edge Cases**: Empty states, maximum values, error conditions
6. **Avoid Test Interdependence**: Each test should run independently
7. **Fast Tests**: Keep unit tests under 100ms, integration tests under 1s
8. **Maintain Tests**: Update tests when behavior changes (not just to make them pass)

## Implementation Order

1. **Backend first**: Create structure, implement base classes, Q-Learning, Flask API
2. **Test backend**: Use curl/Postman to verify all endpoints and SSE streams work
3. **Frontend**: Build React app with components and state management
4. **Integration**: Connect frontend to backend, test full flow

## Phase 1 Success Criteria

- User adjusts Q-Learning parameters
- Training starts and streams updates in real-time
- Environment frame, reward chart, and Q-table update during training
- Training completes without errors
- Play Policy shows smooth frame-by-frame animation
- Reset clears all state
- No console errors
- Clean, modular code ready for Phase 2 extensions

## Future Extensions (Post-Phase 1)

The modular design enables easy additions:
- Phase 2: Add SARSA algorithm
- Phase 3: Add CartPole environment
- Phase 4: Add DQN with neural networks (stable-baselines3)
- Phase 5: Add PPO, policy gradients

When adding new algorithms, create wrappers that implement the base algorithm interface. For stable-baselines3 models, the wrapper should translate between sb3's API and our base class methods.
