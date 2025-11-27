# RL Playground - Frontend

React frontend for the RL Playground educational tool.

## Quick Start

### With Docker (Recommended)
```bash
# From project root
docker-compose up
```
Frontend runs on http://localhost:3030

### Without Docker
```bash
# Install dependencies
npm install

# Start development server
npm start
```

## Testing

```bash
# Run tests once
npm test -- --watchAll=false

# Run tests in watch mode
npm test

# Run tests with coverage
npm test -- --coverage --watchAll=false
```

## Tech Stack

- **React 19** - UI framework
- **Recharts** - Data visualization
- **Axios** - HTTP client
- **React Testing Library** - Component testing

## Key Components

- `App.js` - Main application with state management
- `ParameterPanel.jsx` - Dynamic parameter controls
- `EnvironmentViewer.jsx` - Environment frame display
- `RewardChart.jsx` - Episode reward tracking
- `LearningVisualization.jsx` - Q-table heatmap
- `ControlButtons.jsx` - Start/Stop/Play Policy buttons

## Development

The frontend communicates with the Flask backend via:
- **REST API** - Control operations (start training, reset)
- **Server-Sent Events (SSE)** - Real-time streaming updates

See the main [README.md](../README.md) for full setup instructions.
