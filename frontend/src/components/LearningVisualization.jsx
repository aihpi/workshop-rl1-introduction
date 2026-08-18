import React from 'react';
import QTableVisualization from './visualizations/QTableVisualization';
import './LearningVisualization.css';

/**
 * Dispatcher: picks the visualization matching the selected algorithm.
 * New algorithms (PPO, ...) add a case here.
 */
const LearningVisualization = ({ learningData, algorithm }) => {
  if (algorithm === 'Q-Learning') {
    if (learningData?.q_table) {
      return <QTableVisualization learningData={learningData} />;
    }
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

  if (algorithm === 'DQN' || algorithm === 'PPO') {
    // Deep-RL training numbers and curves live in the Training Progress panel
    return null;
  }

  return (
    <div className="learning-visualization">
      <h2>Learning Data</h2>
      <div className="placeholder">
        <p>No learning data available</p>
      </div>
    </div>
  );
};

export default LearningVisualization;
