import React from 'react';
import environmentContent from '../../content/environments.json';
import '../LearningVisualization.css';

// HPI brand gradient for the value heatmap
const HPI_VIOLET = '#7664a0';
const HPI_ORANGE = '#ff7500';

// Interpolate between HPI violet (0.0) and HPI orange (1.0)
const getColorFromGradient = (normalizedValue) => {
  const violet = { r: 118, g: 100, b: 160 };
  const orange = { r: 255, g: 117, b: 0 };

  const r = Math.round(violet.r + (orange.r - violet.r) * normalizedValue);
  const g = Math.round(violet.g + (orange.g - violet.g) * normalizedValue);
  const b = Math.round(violet.b + (orange.b - violet.b) * normalizedValue);

  return `rgb(${r}, ${g}, ${b})`;
};

/**
 * Q-table heatmap for tabular Q-Learning on square-grid environments
 * (FrozenLake 4x4). Receives learningData with a q_table key:
 * a [numStates][numActions] nested array.
 */
const QTableVisualization = ({ learningData, environment }) => {
  const qTable = learningData.q_table;

  // For FrozenLake 4x4: 16 states, 4 actions (LEFT=0, DOWN=1, RIGHT=2, UP=3)
  const numStates = qTable.length;
  const gridSize = Math.sqrt(numStates);

  // Terminal states (holes/goal) are never acted from: their entries are
  // never updated and hold meaningless init values (tabular) or network
  // extrapolation (DQN). Mute them and keep them out of the statistics.
  const terminalStates = new Set(
    environmentContent[environment]?.sections?.terminalStates ?? []
  );

  // Statistics over non-terminal states only
  const allValues = qTable
    .filter((_, state) => !terminalStates.has(state))
    .flat();
  const minQ = Math.min(...allValues);
  const maxQ = Math.max(...allValues);
  const avgQ = allValues.reduce((sum, val) => sum + val, 0) / allValues.length;

  // Normalize Q-values globally (across all 64 values)
  const normalizeGlobal = (value) => {
    // Handle edge case where all values are equal
    if (maxQ === minQ) {
      return 0.5; // Return middle color
    }

    return (value - minQ) / (maxQ - minQ);
  };

  // Find best action(s) for a state
  const getBestActions = (qValues) => {
    const maxValue = Math.max(...qValues);
    const bestActionIndices = qValues
      .map((val, idx) => (val === maxValue ? idx : -1))
      .filter(idx => idx !== -1);

    // Return indices only if there's exactly one best action (no ties)
    return bestActionIndices.length === 1 ? bestActionIndices : [];
  };

  // Render Q-table as 4x4 grid with action values in cross pattern
  const renderQTable = () => {
    const cells = [];

    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        const state = row * gridSize + col;
        const qValues = qTable[state];
        const isTerminal = terminalStates.has(state);

        // FrozenLake action order: [LEFT, DOWN, RIGHT, UP]
        const left = qValues[0];
        const down = qValues[1];
        const right = qValues[2];
        const up = qValues[3];

        // Normalize Q-values globally; terminal tiles get a flat grey
        const colors = qValues.map(val =>
          isTerminal ? '#c8c8c8' : getColorFromGradient(normalizeGlobal(val))
        );

        // Get best action(s) - empty array if tie; no greedy highlight
        // on terminal tiles (the agent never acts from them)
        const bestActions = isTerminal ? [] : getBestActions(qValues);
        const isBestAction = (actionIdx) => bestActions.includes(actionIdx);

        cells.push(
          <div key={state} className={`q-cell${isTerminal ? ' terminal' : ''}`}>
            <div className="state-number">{state}</div>
            <div className="q-values-cross">
              <div
                className={`q-arrow q-up ${isBestAction(3) ? 'best-action' : ''}`}
                style={{ backgroundColor: colors[3] }}
              >
                <span className="q-value-text">{up.toFixed(2)}</span>
              </div>
              <div
                className={`q-arrow q-left ${isBestAction(0) ? 'best-action' : ''}`}
                style={{ backgroundColor: colors[0] }}
              >
                <span className="q-value-text">{left.toFixed(2)}</span>
              </div>
              <div
                className={`q-arrow q-right ${isBestAction(2) ? 'best-action' : ''}`}
                style={{ backgroundColor: colors[2] }}
              >
                <span className="q-value-text">{right.toFixed(2)}</span>
              </div>
              <div
                className={`q-arrow q-down ${isBestAction(1) ? 'best-action' : ''}`}
                style={{ backgroundColor: colors[1] }}
              >
                <span className="q-value-text">{down.toFixed(2)}</span>
              </div>
            </div>
          </div>
        );
      }
    }

    return cells;
  };

  return (
    <div className="learning-visualization">
      <h2>Policy: Q-Table</h2>

      <div className="stats">
        <div className="stat">
          <span className="label">Min Q:</span>
          <span className="value">{minQ.toFixed(3)}</span>
        </div>
        <div className="stat">
          <span className="label">Max Q:</span>
          <span className="value">{maxQ.toFixed(3)}</span>
        </div>
        <div className="stat">
          <span className="label">Avg Q:</span>
          <span className="value">{avgQ.toFixed(3)}</span>
        </div>
      </div>

      <div className="q-table-grid">
        {renderQTable()}
      </div>

      <div className="legend">
        <div className="legend-item">
          <div className="legend-color" style={{ background: HPI_VIOLET }}></div>
          <span>Lowest (global)</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ background: HPI_ORANGE }}></div>
          <span>Highest (global)</span>
        </div>
      </div>

      <p className="hint">
        Arrow colors show Q-values across the entire table (violet = global min, orange = global max).
        Cyan borders highlight the greedy action (highest Q-value) for each state (not shown if there's a tie).
        Grey tiles are terminal states (holes/goal): their values are never used or updated, so they keep
        whatever the initialization gave them and are excluded from the statistics.
      </p>
    </div>
  );
};

export default QTableVisualization;
