import React from 'react';
import QTableVisualization from './visualizations/QTableVisualization';
import './LearningVisualization.css';

/**
 * Dispatcher: picks the visualization matching the selected algorithm.
 * New algorithms (PPO, ...) add a case here.
 */
const LearningVisualization = ({ learningData, algorithm, environment }) => {
  if (algorithm === 'Q-Learning' && learningData?.q_table) {
    return <QTableVisualization learningData={learningData} />;
  }

  if (algorithm === 'DQN') {
    // DQN's training numbers and curves live in the Training Progress panel
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
