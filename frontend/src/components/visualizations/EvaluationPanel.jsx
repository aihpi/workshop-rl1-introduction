import React from 'react';
import environmentsData from '../../content/environments.json';
import '../LearningVisualization.css';

/**
 * Policy evaluation results: N greedy episodes (no exploration), the
 * standard way to measure what a policy has actually learned - unlike
 * the training curve, which includes exploration noise.
 *
 * progress: {episode, total} while running; results: the summary dict
 * from the backend ({mean_return, std_return, min_return, max_return,
 * mean_length, num_episodes}).
 */
const EvaluationPanel = ({ progress, results, environment }) => {
  if (!progress && !results) {
    return null;
  }

  const solvedThreshold = environmentsData[environment]?.sections?.solvedThreshold;

  return (
    <div className="learning-visualization">
      <h2>Policy Evaluation</h2>

      {progress && !results && (
        <div className="placeholder">
          <p>Evaluating… episode {progress.episode}/{progress.total}</p>
          <p className="hint">Running the greedy policy (no exploration), without rendering</p>
        </div>
      )}

      {results && (
        <>
          <div className="stats">
            <div className="stat">
              <span className="label">Mean Return:</span>
              <span className="value">
                {results.mean_return.toFixed(1)} ± {results.std_return.toFixed(1)}
              </span>
            </div>
            <div className="stat">
              <span className="label">Min / Max:</span>
              <span className="value">
                {results.min_return.toFixed(0)} / {results.max_return.toFixed(0)}
              </span>
            </div>
            <div className="stat">
              <span className="label">Mean Length:</span>
              <span className="value">{results.mean_length.toFixed(0)}</span>
            </div>
            <div className="stat">
              <span className="label">Episodes:</span>
              <span className="value">{results.num_episodes}</span>
            </div>
          </div>

          {solvedThreshold != null && (
            <p className={`eval-verdict ${results.mean_return >= solvedThreshold ? 'solved' : ''}`}>
              {results.mean_return >= solvedThreshold
                ? `✅ Solved (mean return ≥ ${solvedThreshold})`
                : `Not solved yet (needs mean return ≥ ${solvedThreshold})`}
            </p>
          )}

          <p className="hint">
            Evaluation runs the policy greedily (ε = 0) over fresh episodes —
            the true performance of what was learned, without the random
            exploration actions that hold the training curve down.
          </p>
        </>
      )}
    </div>
  );
};

export default EvaluationPanel;
