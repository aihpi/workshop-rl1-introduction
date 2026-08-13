import React, { useState, useEffect } from 'react';
import './App.css';
import ParameterPanel from './components/ParameterPanel';
import EnvironmentViewer from './components/EnvironmentViewer';
import EnvironmentInfo from './components/EnvironmentInfo';
import AlgorithmInfo from './components/AlgorithmInfo';
import RewardChart from './components/RewardChart';
import LearningVisualization from './components/LearningVisualization';
import { startTraining, stopTraining, subscribeToTraining, subscribeToPlayback, resetTraining, getEnvironmentPreview } from './api';
import { BUDGET_KEYS, isIntAtLeast } from './components/ParameterPanel';

// Calculate adaptive window size: 10% of episodes, clamped between 10 and 100
const calculateWindowSize = (totalEpisodes) => {
  return Math.max(10, Math.min(100, Math.floor(totalEpisodes * 0.1)));
};

// Calculate moving average of last N rewards (sliding window)
const calculateMovingAverage = (rewards, windowSize) => {
  const window = rewards.slice(Math.max(0, rewards.length - windowSize));
  return window.reduce((sum, r) => sum + r, 0) / window.length;
};

function App() {
  // Configuration state
  const [selectedAlgorithm, setSelectedAlgorithm] = useState('Q-Learning');
  const [selectedEnvironment, setSelectedEnvironment] = useState('FrozenLake-v1-NoSlip');
  const [parameters, setParameters] = useState({});

  // Training state
  const [sessionId, setSessionId] = useState(null);
  const [isTraining, setIsTraining] = useState(false);
  const [isPlayback, setIsPlayback] = useState(false);
  const [trainingComplete, setTrainingComplete] = useState(false);
  const [playbackInterval, setPlaybackInterval] = useState(null);

  // Data state
  const [currentFrame, setCurrentFrame] = useState(null);
  const [currentEpisode, setCurrentEpisode] = useState(0);
  const [rewards, setRewards] = useState([]);
  const [chartData, setChartData] = useState([]); // Moving average data points for chart display
  const [windowSize, setWindowSize] = useState(10); // Adaptive window size for moving average
  const [totalEpisodes, setTotalEpisodes] = useState(0); // Total episodes for training (from config)
  const [learningData, setLearningData] = useState(null);

  // Error state
  const [error, setError] = useState(null);

  // EventSource reference
  const [eventSource, setEventSource] = useState(null);

  // Cleanup EventSource on unmount
  useEffect(() => {
    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [eventSource]);

  const loadPreview = async () => {
    try {
      const previewData = await getEnvironmentPreview(selectedEnvironment);
      setCurrentFrame(previewData.frame);
    } catch (err) {
      console.error('Failed to load environment preview:', err);
      // Don't set error state for preview failures - not critical
    }
  };

  // Reset training state (used when environment or algorithm changes)
  const resetState = async () => {
    // Close EventSource if open
    if (eventSource) {
      eventSource.close();
      setEventSource(null);
    }

    // Reset backend if there was an active session
    if (sessionId) {
      try {
        await resetTraining();
      } catch (err) {
        console.error('Failed to reset training:', err);
      }
    }

    // Reset frontend state
    setSessionId(null);
    setIsTraining(false);
    setIsPlayback(false);
    setTrainingComplete(false);
    setCurrentEpisode(0);
    setRewards([]);
    setChartData([]);
    setWindowSize(10);
    setTotalEpisodes(0);
    setLearningData(null);
    setError(null);
  };

  // Reset and reload the preview when the environment or algorithm changes
  // (stale learning data must not survive a switch)
  useEffect(() => {
    resetState();
    loadPreview();
  }, [selectedEnvironment, selectedAlgorithm]);

  // Validation function for training parameters
  const isValidParameters = () => {
    // The training budget (num_episodes or total_timesteps) must be
    // present and a positive integer
    const budgetKey = BUDGET_KEYS.find(key => parameters[key] !== undefined);
    if (!budgetKey || !isIntAtLeast(parameters[budgetKey], 1)) {
      return false;
    }

    // Seed may be empty (random run), but if given it must be a
    // non-negative integer
    const seed = parameters.seed;
    if (seed !== undefined && seed !== '' && !isIntAtLeast(seed, 0)) {
      return false;
    }

    // Validate Q-init parameters based on strategy
    if (parameters.q_init_strategy === 'fixed') {
      const value = parameters.q_init_value;

      // Check if value exists and is not NaN
      if (value === undefined || value === '' || isNaN(value)) {
        return false;
      }
    } else if (parameters.q_init_strategy === 'random') {
      const min = parameters.q_init_min;
      const max = parameters.q_init_max;

      // Check if values exist, are not NaN, and min < max
      if (min === undefined || min === '' || isNaN(min) ||
          max === undefined || max === '' || isNaN(max) ||
          min >= max) {
        return false;
      }
    }

    return true;
  };

  const handleStartTraining = async () => {
    try {
      setError(null);

      // Close any existing EventSource (stops current training)
      if (eventSource) {
        eventSource.close();
        setEventSource(null);
      }

      // Clear backend sessions (free memory and prevent leaks)
      await resetTraining();

      // Reset frontend state
      setSessionId(null);
      setIsTraining(false);
      setIsPlayback(false);
      setTrainingComplete(false);
      setCurrentEpisode(0);
      setRewards([]);
      setChartData([]);
      setLearningData(null);

      // Set training flag
      setIsTraining(true);

      // Start new training session (seed travels inside parameters;
      // an empty seed means the backend draws one randomly)
      const response = await startTraining({
        algorithm: selectedAlgorithm,
        environment: selectedEnvironment,
        parameters: parameters
      });

      const newSessionId = response.session_id;
      setSessionId(newSessionId);

      // Window size and total episodes are only known when the budget is
      // episode-based; timestep-budgeted algorithms (e.g. DQN) produce an
      // unknown number of episodes -> null lets the chart auto-scale
      const episodeCount = parameters.num_episodes ? parseInt(parameters.num_episodes) : null;
      const calculatedWindowSize = episodeCount ? calculateWindowSize(episodeCount) : 10;
      setWindowSize(calculatedWindowSize);
      setTotalEpisodes(episodeCount);

      // Coalesce episode events before rendering: fast training finishes
      // dozens of episodes per second, and re-rendering the charts and the
      // frame on every single one exhausts browser memory (Safari kills the
      // page). Events are buffered and applied at most ~6x per second - no
      // data is lost, chart points are identical.
      const pending = { latest: null, rewards: [], timer: null };

      const flushUpdates = () => {
        pending.timer = null;
        // Skip if this training's stream was closed meanwhile (e.g. the user
        // switched environments) - don't write stale data over the reset state
        if (!pending.latest || es.readyState === EventSource.CLOSED) return;
        const batch = pending.rewards;
        const latest = pending.latest;
        pending.rewards = [];
        pending.latest = null;

        setCurrentFrame(latest.frame);
        setCurrentEpisode(latest.episode);
        setLearningData(latest.learning_data);

        setRewards(prev => {
          const updatedRewards = [...prev, ...batch];

          // Add a chart point at every windowSize boundary the batch crossed
          const newPoints = [];
          const firstBoundary =
            (Math.floor(prev.length / calculatedWindowSize) + 1) * calculatedWindowSize;
          for (let m = firstBoundary; m <= updatedRewards.length; m += calculatedWindowSize) {
            newPoints.push({
              episode: m,
              avgReward: calculateMovingAverage(updatedRewards.slice(0, m), calculatedWindowSize)
            });
          }
          if (newPoints.length > 0) {
            setChartData(prevChart => [...prevChart, ...newPoints]);
          }

          return updatedRewards;
        });
      };

      // Subscribe to training updates
      const es = subscribeToTraining(
        newSessionId,
        // onUpdate - called for each episode during training
        (data) => {
          pending.latest = data;
          pending.rewards.push(data.reward);
          if (!pending.timer) {
            pending.timer = setTimeout(flushUpdates, 150);
          }
        },
        // onComplete - called when training finishes
        (data) => {
          if (pending.timer) {
            clearTimeout(pending.timer);
          }
          flushUpdates();

          setIsTraining(false);
          setTrainingComplete(true);

          // Add final chart point if needed (when episode count isn't a multiple of windowSize)
          setRewards(currentRewards => {
            const needsFinalPoint = currentRewards.length % calculatedWindowSize !== 0;
            if (needsFinalPoint) {
              const finalAvg = calculateMovingAverage(currentRewards, calculatedWindowSize);
              setChartData(prev => [...prev, {
                episode: currentRewards.length,
                avgReward: finalAvg
              }]);
            }
            return currentRewards;
          });
        },
        // onError
        (err) => {
          if (pending.timer) {
            clearTimeout(pending.timer);
          }
          setError(err.message || 'Training failed');
          setIsTraining(false);
        }
      );

      setEventSource(es);
    } catch (err) {
      setError(err.message || 'Failed to start training');
      setIsTraining(false);
    }
  };

  const handlePlayPolicy = async () => {
    if (!sessionId || !trainingComplete) return;

    try {
      setError(null);
      setIsPlayback(true);

      // Subscribe to playback stream
      const es = subscribeToPlayback(
        sessionId,
        // onFrames
        (frames) => {
          // Animate through frames; long playbacks (e.g. a full CartPole
          // episode) run faster so they stay watchable
          const delay = frames.length > 60 ? 50 : 200;
          let frameIndex = 0;
          const interval = setInterval(() => {
            if (frameIndex < frames.length) {
              setCurrentFrame(frames[frameIndex]);
              frameIndex++;
            } else {
              clearInterval(interval);
              setPlaybackInterval(null);
              setIsPlayback(false);
            }
          }, delay);

          // Store interval reference so we can stop it
          setPlaybackInterval(interval);
        },
        // onError
        (err) => {
          setError(err.message || 'Playback failed');
          setIsPlayback(false);
          setPlaybackInterval(null);
        }
      );

      setEventSource(es);
    } catch (err) {
      setError(err.message || 'Failed to play policy');
      setIsPlayback(false);
      setPlaybackInterval(null);
    }
  };

  const handleStopPlayback = () => {
    // Clear the animation interval
    if (playbackInterval) {
      clearInterval(playbackInterval);
      setPlaybackInterval(null);
    }

    // Stop playback
    setIsPlayback(false);

    // Close EventSource
    if (eventSource) {
      eventSource.close();
      setEventSource(null);
    }
  };

  const handleStopTraining = async () => {
    try {
      // Graceful server-side stop: training halts at the next episode
      // boundary and the 'stopped' event arrives through the open
      // EventSource, so the partial policy stays playable
      await stopTraining(sessionId);
    } catch (err) {
      // Fallback: hard reset if the stop request failed
      console.error('Graceful stop failed, resetting:', err);
      await resetState();
      await loadPreview();
    }
  };

  return (
    <div className="App">
      <header className="app-header">
        <h1>RL Lab</h1>
        <p className="subtitle">Interactive Reinforcement Learning Visualization</p>
      </header>

      {error && (
        <div className="error-banner">
          <strong>Error:</strong> {error}
        </div>
      )}

      <div className="main-content">
        <div className="column column-left">
          <ParameterPanel
            algorithm={selectedAlgorithm}
            environment={selectedEnvironment}
            parameters={parameters}
            onParametersChange={setParameters}
            onAlgorithmChange={setSelectedAlgorithm}
            onEnvironmentChange={setSelectedEnvironment}
            onStartTraining={handleStartTraining}
            onStopTraining={handleStopTraining}
            onPlayPolicy={handlePlayPolicy}
            onStopPlayback={handleStopPlayback}
            isTraining={isTraining}
            isPlayback={isPlayback}
            canPlayPolicy={trainingComplete}
            disabled={!isValidParameters()}
          />
        </div>

        <div className="column column-center">
          <EnvironmentViewer
            frame={currentFrame}
            episode={currentEpisode}
            timesteps={learningData?.diagnostics?.total_timesteps}
            isTraining={isTraining}
            isPlayback={isPlayback}
            trainingComplete={trainingComplete}
          />
          <EnvironmentInfo environment={selectedEnvironment} />
          <AlgorithmInfo algorithm={selectedAlgorithm} />
        </div>

        <div className="column column-right">
          <RewardChart
            chartData={chartData}
            totalEpisodes={totalEpisodes}
            windowSize={windowSize}
          />
          <LearningVisualization
            learningData={learningData}
            algorithm={selectedAlgorithm}
            environment={selectedEnvironment}
          />
        </div>
      </div>

      <footer className="app-footer">
        <p>Phase 2: Tabular Q-Learning & Deep Q-Networks</p>
      </footer>
    </div>
  );
}

export default App;
