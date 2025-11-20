import React, { useState, useEffect } from 'react';
import './App.css';
import ParameterPanel from './components/ParameterPanel';
import EnvironmentViewer from './components/EnvironmentViewer';
import EnvironmentInfo from './components/EnvironmentInfo';
import AlgorithmInfo from './components/AlgorithmInfo';
import RewardChart from './components/RewardChart';
import LearningVisualization from './components/LearningVisualization';
import ControlButtons from './components/ControlButtons';
import { startTraining, subscribeToTraining, subscribeToPlayback, resetTraining, getEnvironmentPreview } from './api';

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

  // Load environment preview and reset when environment changes
  useEffect(() => {
    const loadPreview = async () => {
      try {
        const previewData = await getEnvironmentPreview(selectedEnvironment);
        setCurrentFrame(previewData.frame);
      } catch (err) {
        console.error('Failed to load environment preview:', err);
        // Don't set error state for preview failures - not critical
      }
    };

    // Reset training state when environment changes
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

    resetState();
    loadPreview();
  }, [selectedEnvironment]);

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

      // Start new training session
      const response = await startTraining({
        algorithm: selectedAlgorithm,
        environment: selectedEnvironment,
        parameters: parameters,
        seed: 42
      });

      const newSessionId = response.session_id;
      setSessionId(newSessionId);

      // Calculate and store window size and total episodes from config
      const episodeCount = parameters.num_episodes || 1000; // Default to 1000 if not specified
      const calculatedWindowSize = calculateWindowSize(episodeCount);
      setWindowSize(calculatedWindowSize);
      setTotalEpisodes(episodeCount);

      // Subscribe to training updates
      const es = subscribeToTraining(
        newSessionId,
        // onUpdate - called for each episode during training
        (data) => {
          setCurrentFrame(data.frame);
          setCurrentEpisode(data.episode);
          setLearningData(data.learning_data);

          setRewards(prev => {
            const updatedRewards = [...prev, data.reward];
            const movingAvg = calculateMovingAverage(updatedRewards, calculatedWindowSize);

            // Update chart every windowSize episodes for performance
            if (updatedRewards.length % calculatedWindowSize === 0) {
              setChartData(prevChart => [...prevChart, {
                episode: updatedRewards.length,
                avgReward: movingAvg
              }]);
            }

            return updatedRewards;
          });
        },
        // onComplete - called when training finishes
        (data) => {
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
          // Animate through frames with 200ms delay
          let frameIndex = 0;
          const interval = setInterval(() => {
            if (frameIndex < frames.length) {
              setCurrentFrame(frames[frameIndex]);
              frameIndex++;
            } else {
              clearInterval(interval);
              setIsPlayback(false);
            }
          }, 200);
        },
        // onError
        (err) => {
          setError(err.message || 'Playback failed');
          setIsPlayback(false);
        }
      );

      setEventSource(es);
    } catch (err) {
      setError(err.message || 'Failed to play policy');
      setIsPlayback(false);
    }
  };

  const handleStopTraining = async () => {
    try {
      // Close EventSource if open
      if (eventSource) {
        eventSource.close();
        setEventSource(null);
      }

      // Reset backend
      await resetTraining();

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

      // Reload preview frame
      const previewData = await getEnvironmentPreview(selectedEnvironment);
      setCurrentFrame(previewData.frame);
    } catch (err) {
      setError(err.message || 'Stop training failed');
      setIsTraining(false);
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
          />
          <ControlButtons
            onStartTraining={handleStartTraining}
            onStopTraining={handleStopTraining}
            onPlayPolicy={handlePlayPolicy}
            isTraining={isTraining}
            isPlayback={isPlayback}
            canPlayPolicy={trainingComplete}
          />
        </div>

        <div className="column column-center">
          <EnvironmentViewer
            frame={currentFrame}
            episode={currentEpisode}
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
          />
        </div>
      </div>

      <footer className="app-footer">
        <p>Phase 1: Q-Learning on FrozenLake-v1</p>
      </footer>
    </div>
  );
}

export default App;
