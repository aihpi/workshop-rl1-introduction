import environmentsData from '../content/environments.json';
import algorithmsData from '../content/algorithms.json';

/**
 * Get environment information by environment ID
 * @param {string} environmentId - The environment identifier (e.g., "FrozenLake-v1")
 * @returns {object|null} Environment data or null if not found
 */
export const getEnvironmentInfo = (environmentId) => {
  return environmentsData[environmentId] || null;
};

/**
 * Get algorithm information by algorithm ID
 * @param {string} algorithmId - The algorithm identifier (e.g., "Q-Learning")
 * @returns {object|null} Algorithm data or null if not found
 */
export const getAlgorithmInfo = (algorithmId) => {
  return algorithmsData[algorithmId] || null;
};
