import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:5001/api';

/**
 * Get list of available algorithms
 */
export const getAlgorithms = async () => {
  const response = await axios.get(`${API_BASE_URL}/algorithms`);
  return response.data;
};

/**
 * Get list of available environments
 */
export const getEnvironments = async () => {
  const response = await axios.get(`${API_BASE_URL}/environments`);
  return response.data;
};

/**
 * Get the algorithm -> supported environments mapping
 */
export const getCompatibility = async () => {
  const response = await axios.get(`${API_BASE_URL}/compatibility`);
  return response.data;
};

/**
 * Get a preview frame of an environment's initial state
 */
export const getEnvironmentPreview = async (envName) => {
  const response = await axios.get(`${API_BASE_URL}/environments/${envName}/preview`);
  return response.data;
};

/**
 * Get parameter schema for a specific algorithm
 */
export const getParameterSchema = async (algorithm, environment) => {
  const url = environment
    ? `${API_BASE_URL}/parameters/${algorithm}?environment=${encodeURIComponent(environment)}`
    : `${API_BASE_URL}/parameters/${algorithm}`;
  const response = await axios.get(url);
  return response.data;
};

/**
 * Start a training session
 */
export const startTraining = async (config) => {
  const response = await axios.post(`${API_BASE_URL}/train`, config);
  return response.data;
};

/**
 * Subscribe to training updates via SSE
 */
export const subscribeToTraining = (sessionId, onUpdate, onComplete, onError) => {
  const eventSource = new EventSource(`${API_BASE_URL}/train/stream/${sessionId}`);

  eventSource.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);

      if (data.status === 'training') {
        // Training update
        onUpdate(data);
      } else if (data.status === 'complete' || data.status === 'stopped') {
        // Training finished (naturally or stopped by user);
        // either way the partial policy is playable
        onComplete(data);
        eventSource.close();
      } else if (data.status === 'error') {
        // Error occurred
        onError(new Error(data.message));
        eventSource.close();
      }
    } catch (error) {
      onError(error);
      eventSource.close();
    }
  };

  eventSource.onerror = (error) => {
    onError(error);
    eventSource.close();
  };

  return eventSource;
};

/**
 * Subscribe to policy playback via SSE
 */
export const subscribeToPlayback = (sessionId, onFrames, onError) => {
  const eventSource = new EventSource(`${API_BASE_URL}/play-policy/stream/${sessionId}`);

  eventSource.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);

      if (data.status === 'complete') {
        // Playback frames received
        onFrames(data.frames);
        eventSource.close();
      } else if (data.status === 'error') {
        // Error occurred
        onError(new Error(data.message));
        eventSource.close();
      }
    } catch (error) {
      onError(error);
      eventSource.close();
    }
  };

  eventSource.onerror = (error) => {
    onError(error);
    eventSource.close();
  };

  return eventSource;
};

/**
 * Request a graceful stop of a running training session
 */
export const stopTraining = async (sessionId) => {
  const response = await axios.post(`${API_BASE_URL}/train/stop/${sessionId}`);
  return response.data;
};

/**
 * Reset all training sessions
 */
export const resetTraining = async () => {
  const response = await axios.post(`${API_BASE_URL}/reset`);
  return response.data;
};
