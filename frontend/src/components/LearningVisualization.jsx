import React from 'react';
import QTableVisualization from './visualizations/QTableVisualization';
import './LearningVisualization.css';

/**
 * Dispatcher: picks the visualization matching the selected algorithm.
 * New algorithms (PPO, ...) add a case here.
 */
const LearningVisualization = ({ learningData, algorithm }) => {
  // Any algorithm reporting a q_table gets the table view: tabular
  // Q-Learning always, and DQN on enumerable-state environments
  // (FrozenLake), where the network's Q-values for all states are the
  // same picture - produced by a network instead of a table
  if (learningData?.q_table) {
    return <QTableVisualization learningData={learningData} />;
  }

  if (algorithm === 'Q-Learning') {
    // The initial table is being fetched (brief)
    return (
      <div className="learning-visualization">
        <h2>Policy: Q-Table</h2>
        <div className="placeholder">
          <p>Loading initial Q-table…</p>
        </div>
      </div>
    );
  }

  // Deep RL on continuous-state envs: numbers live in Training Progress
  return null;
};

export default LearningVisualization;
