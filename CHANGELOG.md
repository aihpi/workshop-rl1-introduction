# Changelog

All notable changes to RL Playground will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

**Note**: Phase 1 is currently in development. Core features are implemented but production readiness (testing, UI polish, documentation) is ongoing.

## [0.7.0] - 2025-11-20 (In Progress)

### Completed Today

#### Added
- **Docker Hub pre-built images** for faster workshop setup
  - Created Docker Hub account (username: davidgoll)
  - Built and pushed backend/frontend images to Docker Hub
  - GitHub Actions workflow (.github/workflows/docker-build.yml) for automated builds
  - Triggers on manual dispatch or when Dockerfile/dependency files change
  - Reduces first-time setup from ~10 minutes to ~1-2 minutes
- **GitHub Actions secrets** configured for CI/CD
  - DOCKERHUB_USERNAME and DOCKERHUB_TOKEN added to repository secrets

#### Changed
- **Configuration panel improvements**
  - Reordered: Environment selector now appears before Algorithm selector
  - Algorithm changed from read-only text to dropdown (like Environment)
  - Matches the visual order of info panels below (EnvironmentInfo, then AlgorithmInfo)
- **docker-compose.yml** updated to use pre-built images
  - Before: `build: context: ./backend`
  - After: `image: davidgoll/workshop-rl1-backend:latest`
- **README.md** improved for workshop participants
  - Updated title to "RL Lab"
  - Better installation instructions with time estimates
  - Simplified git clone instructions with aihpi organization URL
  - Clearer Docker setup steps

#### Documentation
- Updated branding in frontend/public/manifest.json to "RL Lab"

### Issue Discovered: Docker Multi-Architecture Compatibility

**Problem**: Workshop participants with Apple Silicon Macs (M1/M2/M3/M4) cannot run `docker-compose up` on fresh clones.

**Error Message**:
```
no matching manifest for linux/arm64/v8 in the manifest list entries:
no match for platform in manifest: not found
```

**Root Cause**:
- Docker Hub images only support `linux/amd64` (Intel/AMD) architecture
- Missing `linux/arm64` (Apple Silicon) architecture support
- GitHub Actions workflow builds images on Ubuntu runners (AMD64) without specifying multi-platform builds
- Without `platforms` parameter, Docker only builds for the runner's native architecture

**Why Some Systems Work**:
- Systems with locally-built ARM64 images (cached before Docker Hub migration) work fine
- Docker uses local images first, never tries to pull from Docker Hub
- Fresh clones have no local images, must pull from Docker Hub → fails on ARM64

**Fix Implemented**:
- Added `platforms: linux/amd64,linux/arm64` to `.github/workflows/docker-build.yml`
- GitHub Actions will now build for both architectures using Docker Buildx
- Pushes multi-platform manifest to Docker Hub
- Both Intel/AMD and Apple Silicon Macs can pull appropriate images

**Next Steps**:
1. Trigger GitHub Actions workflow (manual dispatch or push to main)
2. Verify multi-arch images: `docker manifest inspect davidgoll/workshop-rl1-backend:latest`
3. Test on fresh clone with M4 MacBook Air (ARM64)
4. Test on Linux/Windows laptops (AMD64)

---

### Next Session: Q-Value Initialization Feature

**Feature Goal**: Allow users to control how Q-table values are initialized (currently all zeros)

**Implementation Plan** (Incremental 5-step approach for easier debugging):

**Step 1: Backend Schema** (Add parameters to q_learning.py)
- Add 4 new parameters to `get_parameter_schema()`:
  - `q_init_strategy`: dropdown, options=['fixed', 'random'], default='fixed'
  - `q_init_value`: float, default=0.0 (for 'fixed' strategy)
  - `q_init_min`: float, default=0.0 (for 'random' strategy)
  - `q_init_max`: float, default=1.0 (for 'random' strategy)
- **Test**: Verify parameters appear in frontend (even if not functional yet)

**Step 2: Backend Logic** (Implement initialization method)
- Create `_initialize_q_table()` method with strategy selection
  - 'fixed': `np.full((num_states, num_actions), value)`
  - 'random': `np.random.uniform(min_val, max_val, (num_states, num_actions))`
  - Validation: raise error if `min_val >= max_val`
- Update `__init__` to extract parameters and call initialization
- **Test**: Start training, verify Q-table initializes correctly via backend logs

**Step 3: Frontend UI - Strategy Selector**
- Add new section "Q-Value Initialization" in ParameterPanel (before "Learning Parameters")
- Add strategy dropdown only (no conditional inputs yet)
- **Test**: Select strategies, verify parameter sent to backend

**Step 4: Conditional Inputs**
- Add conditional rendering based on selected strategy:
  - `q_init_strategy === 'fixed'`: Show single number input for q_init_value
  - `q_init_strategy === 'random'`: Show two number inputs (min, max)
- Use indentation styling (`.parameter-indent`) for visual hierarchy
- **Test**: Switch strategies, verify correct inputs appear and values update

**Step 5: Validation**
- Add `isValidParameters()` function in App.js
  - Check if `q_init_min >= q_init_max` for random strategy
  - Return false if invalid
- Pass `disabled={!isValidParameters()}` to ControlButtons
- Update ControlButtons to show validation error message when disabled
- **Test**: Try invalid inputs (min >= max), verify button disables and error shows

**Design Decisions**:
- Two-layered UI approach: Strategy dropdown determines which inputs appear
- No arbitrary limits on float values (user has full control)
- Validation prevents training with invalid parameters (min >= max)
- Visual hierarchy: Indentation for conditional inputs, separate sections for Q-init vs Learning

**Current Status**:
- All changes reverted to commit 8f5302a (Configuration panel improvements)
- Docker containers running with pre-built images
- Ready to start Step 1 next session

## [0.6.0] - 2025-11-12

### Added
- **Educational information panels** for environments and algorithms
  - Collapsible panels below EnvironmentViewer in center column
  - EnvironmentInfo panel with HPI Orange accent (#ff7500)
  - AlgorithmInfo panel with HPI Violet accent (#7664a0)
  - Content loaded from JSON files (src/content/environments.json, algorithms.json)
  - Panels display: description, state/action spaces, rewards, parameters explained, links
  - Accordion-style UI: collapsed by default, expand independently
  - State persistence: panels remain open during training (only reset on page refresh)
  - Graceful fallback messages for missing content

### Changed
- **CSS refactored to use CSS variables** for maintainability
  - Defined `--hpi-orange` and `--hpi-violet` in App.css :root
  - All hardcoded color values replaced with CSS variables
  - Single source of truth for HPI brand colors
  - Easier color updates and better code readability
- **Branding updated** from "RL Playground" to "RL Lab"
  - Browser tab title changed to "RL Lab"
  - Main application heading changed to "RL Lab"

### Technical Details
- Content management via JSON files for easy future expansion
- contentLoader.js utility functions for data access
- Component-scoped CSS with semantic variable naming
- All 12 frontend tests passing after implementation

## [0.5.0] - 2025-11-12

### Changed
- **Episode rewards visualization refactored** to use moving average with sliding window
  - Replaced raw individual episode rewards with moving average trajectory
  - Adaptive window size: 10% of total episodes (clamped between 10-100)
  - Smooths out binary reward noise (0/1) into meaningful trend lines
  - Visual dots mark actual data points, lines show interpolation between intervals
- **Chart performance optimization**
  - Updates chart every N episodes instead of every episode (batch updates)
  - Reduces UI lag for high episode counts (e.g., 20,000 episodes)
  - Example: 10,000 episodes now triggers ~100 chart updates instead of 10,000
- **Updated episode rewards statistics**
  - Shows: Episodes Trained, Current Average, Best Average
  - Removed: Max reward (not meaningful for moving averages)
- **Episode limits adjusted** for better user experience
  - FrozenLake-v1 (slippery): 100,000 → 20,000 episodes max
  - FrozenLake-v1-NoSlip: 1,000 → 2,000 episodes max
- **Discount factor constraint** for algorithmic stability
  - Max value changed from 1.0 to 0.99
  - Prevents convergence issues in Q-Learning

### Technical Details
- Moving average calculated using sliding window: last N rewards where N = window size
- Chart data sorted to handle async race conditions (final episode vs. last interval)
- All 12 frontend tests passing after refactoring

## [0.4.0] - 2025-11-10

### Added
- **Backend testing infrastructure** with pytest
  - Created test directory structure (tests/, test_algorithms/, test_api/, etc.)
  - Added pytest.ini configuration for test discovery and output formatting
  - Added .coveragerc for code coverage measurement
  - Created conftest.py with shared fixtures (Flask app, test client, sample Q-table)
  - Implemented 8 backend tests covering Q-Learning and API endpoints
  - All tests passing with 41% code coverage
- **Frontend testing infrastructure** with Jest and React Testing Library
  - Created src/components/__tests__/ directory for component tests
  - Implemented 12 frontend tests covering key components
  - ParameterPanel tests (5 tests): loading states, parameter rendering, environment dropdown
  - EnvironmentViewer tests (6 tests): status display, frame rendering, placeholders
  - App test (1 test): basic app rendering
  - All tests passing with mocked API calls
- **Comprehensive testing strategy documentation** in ARCHITECTURE.md
  - Backend testing approach (pytest, pytest-flask, pytest-cov, pytest-mock)
  - Frontend testing approach (Jest, React Testing Library)
  - 87 detailed test cases documented
  - Best practices and implementation priorities

### Changed
- **Docker modernization** - Single source of truth for dependencies
  - Updated Dockerfile to use `uv sync --all-extras` (reads from pyproject.toml)
  - Test dependencies automatically included in Docker environment
  - Added PATH configuration for user-friendly commands in containers
  - Workshop participants can now use simple commands:
    - `docker-compose exec backend pytest` (instead of `.venv/bin/pytest`)
    - `docker-compose exec backend python script.py`
  - Follows modern Python tooling standards (2024+)
- **Dependency management improvements**
  - Added test dependencies to pyproject.toml as optional extras
  - pytest>=7.4.0, pytest-cov>=4.1.0, pytest-flask>=1.2.0, pytest-mock>=3.11.0
  - Updated .gitignore to exclude test artifacts (.coverage, htmlcov/)
- **Documentation cleanup** - Prepared repository for colleague sharing
  - README.md restructured and reduced by 43% (312 → 178 lines)
  - Focused on essentials: Quick Start → Installation → Usage → Testing → Structure
  - backend/README.md updated: Fixed port (5000→5001), added testing section
  - frontend/README.md replaced CRA boilerplate with project-specific content
  - Removed docs/WORKPLAN.md (contained outdated "critical bugs" information)
- **Repository migration**
  - Transferred from personal GitHub account to aihpi organization
  - Renamed to workshop-rl1-introduction (following lowercase-with-hyphens convention)
  - Removed .claude directory from Git tracking (kept locally for development)

### Technical Details
- **Testing Stack**:
  - Backend: pytest with Flask integration, code coverage tracking (8 tests, 41% coverage)
  - Frontend: Jest with React Testing Library, mocked API calls (12 tests)
  - Total: 20 automated tests across backend and frontend
- **Docker**: Virtual environment with PATH configuration for simplified commands
- **Dependency Management**: pyproject.toml as single source of truth

### Workshop Ready
- Backend tests can be run locally (`uv run pytest`) or in Docker (`docker-compose exec backend pytest`)
- Frontend tests can be run with `cd frontend && npm test`
- Consistent testing environment across all platforms
- Easy for participants to verify their implementation

## [0.3.0] - 2025-11-10

### Added
- **Stop Training button** to interrupt and reset training mid-run
  - Button dynamically shows "Start Training" or "Stop Training" based on state
  - Properly closes EventSource connections and resets backend sessions
  - Returns to preview frame after stopping
- **Improved status messaging** in Environment Viewer
  - Initial state: "Ready to train a policy"
  - After training completes: "Ready" (to play policy)
  - Provides clearer guidance for first-time users

### Changed
- **HPI Corporate Design color palette** applied across entire frontend
  - Primary color: HPI Orange (#ff7500)
  - Secondary color: HPI Violet (#7664a0)
  - Header gradient: Orange → Violet
  - Updated buttons: Orange (primary), Violet (secondary)
  - Updated all status indicators, parameter controls, and statistics
  - Footer: HPI dark gray (#212427)
  - Body background: Light gray (#f5f5f5) for better panel contrast
- **Q-table visualization completely redesigned** with global normalization approach
  - Arrow colors now show absolute Q-value distribution across all 64 values
  - Violet (#7664a0) = global minimum, Orange (#ff7500) = global maximum
  - Best action per state highlighted with cyan border (#00d9ff, 5px thick)
  - Tie handling: No border shown if multiple actions share maximum value
  - Black cell backgrounds for improved contrast
  - White state numbers (visible against black background)
  - Compact, centered grid layout (max-width: 500px)
- **Layout optimization** for better screen space utilization
  - Column widths adjusted: 300px (parameters) | 400px (environment) | flexible (Q-table/rewards)
  - Q-table visualization given significantly more horizontal space
  - Environment viewer made more compact

### Fixed
- **Action mapping bug** in Q-table visualization
  - LEFT and RIGHT actions were displaying in swapped positions
  - Corrected to match FrozenLake action order: [LEFT, DOWN, RIGHT, UP]
- **Start Training now resets properly** to prevent memory leaks
  - Closes existing EventSource connections before starting new session
  - Clears backend sessions to free memory

### Documentation
- **ARCHITECTURE.md updated** with detailed Q-table visualization specifications
  - Global normalization approach documented
  - Best action highlighting and tie-handling logic explained
  - Color gradient interpolation details
- **Project structure reorganized**
  - CLAUDE.md renamed to docs/ARCHITECTURE.md for clarity
  - WORKPLAN.md moved to docs/WORKPLAN.md
  - Created tutorials/ directory for user guides
  - Updated .gitignore to exclude .claude/ local settings

### Visual Improvements
- Consistent HPI branding throughout application
- Improved visual hierarchy with color-coded elements
- Better contrast and readability across all components
- Professional, polished appearance ready for presentations

## [0.2.0] - 2025-10-30

### Added
- **Docker support** for cross-platform development (macOS, Windows, Linux)
  - Backend Dockerfile with Python 3.10, Flask, Gymnasium, pygame
  - Frontend Dockerfile with Node.js 18 and React dev server
  - docker-compose.yml for multi-container orchestration
  - Volume mounting for live code editing during development
  - .dockerignore files for optimized builds
- **Comprehensive Docker development guide** (400+ lines) in tutorials/docker-workflow.md
  - Step-by-step first-time setup instructions
  - Daily development workflow guide
  - Troubleshooting flowcharts for common issues
  - Common beginner mistakes and fixes
  - Visual diagrams of Docker architecture
- **WORKPLAN.md** documenting future Q-table visualization features
  - Phase 2: Arrow-based policy visualization
  - Phase 3: Number-based heatmap with toggle
  - Detailed design specifications and implementation plans

### Changed
- Default environment changed from FrozenLake-v1 (slippery) to FrozenLake-v1-NoSlip (deterministic)
- Flask configured to use `host='0.0.0.0'` for Docker networking (allows external connections)

### Fixed
- **CRITICAL**: Fixed SSE streaming bug that prevented real-time training updates
  - Issue: Nested callback function's `yield` statements had no effect
  - Solution: Implemented queue-based threading pattern for proper data flow
  - Impact: Training updates now stream correctly to frontend (episode counter, reward chart, frames)
- Removed obsolete `version` attribute from docker-compose.yml

### Technical Details
- **Threading**: Training now runs in background thread with queue-based communication
- **SSE Keep-Alive**: Added periodic keep-alive comments to prevent connection timeouts
- **Docker Networking**: Backend accessible at localhost:5001, frontend at localhost:3000
- **Development Setup**: One command (`docker-compose up`) starts entire application

### Workshop Ready
- Participants can now run the application on any OS with just Docker Desktop installed
- No manual Python/Node.js/dependency installation required
- Live code reloading enabled for development
- Consistent environment across all platforms

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
