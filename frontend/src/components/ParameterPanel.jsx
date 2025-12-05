import React, { useEffect, useState } from 'react';
import { getParameterSchema, getEnvironments, getAlgorithms } from '../api';
import ControlButtons from './ControlButtons';
import './ParameterPanel.css';

const ParameterPanel = ({
  algorithm,
  environment,
  parameters,
  onParametersChange,
  onAlgorithmChange,
  onEnvironmentChange,
  onStartTraining,
  onStopTraining,
  onPlayPolicy,
  onStopPlayback,
  isTraining,
  isPlayback,
  canPlayPolicy,
  disabled
}) => {
  const [schema, setSchema] = useState(null);
  const [environments, setEnvironments] = useState([]);
  const [algorithms, setAlgorithms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Format large numbers in scientific notation
  const formatNumber = (value, paramName) => {
    // Only format num_episodes with scientific notation for large values
    if (paramName === 'num_episodes' && value >= 1000) {
      const exponent = Math.floor(Math.log10(value));
      const mantissa = value / Math.pow(10, exponent);
      // If it's a clean power of 10, show as 1eX, otherwise show mantissa
      if (mantissa === 1) {
        return `1e${exponent}`;
      } else {
        return `${mantissa.toFixed(1)}e${exponent}`;
      }
    }
    return value;
  };

  // Load available environments and algorithms on mount
  useEffect(() => {
    const fetchEnvironments = async () => {
      try {
        const envList = await getEnvironments();
        setEnvironments(envList);
      } catch (err) {
        console.error('Failed to load environments:', err);
      }
    };

    const fetchAlgorithms = async () => {
      try {
        const algList = await getAlgorithms();
        setAlgorithms(algList);
      } catch (err) {
        console.error('Failed to load algorithms:', err);
      }
    };

    fetchEnvironments();
    fetchAlgorithms();
  }, []);

  // Load parameter schema when algorithm or environment changes
  useEffect(() => {
    const fetchSchema = async () => {
      try {
        setLoading(true);
        const paramSchema = await getParameterSchema(algorithm, environment);
        setSchema(paramSchema);

        // Initialize parameters with default values
        const defaultParams = {};
        Object.keys(paramSchema).forEach(key => {
          defaultParams[key] = paramSchema[key].default;
        });
        onParametersChange(defaultParams);

        setError(null);
      } catch (err) {
        setError('Failed to load parameter schema');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (algorithm && environment) {
      fetchSchema();
    }
  }, [algorithm, environment]);

  const handleParameterChange = (paramName, value) => {
    const paramSpec = schema[paramName];
    let parsedValue = value;

    if (paramSpec.type === 'int') {
      parsedValue = parseInt(value, 10);
    } else if (paramSpec.type === 'float') {
      // For Q-init parameters (text inputs), keep as string to allow typing intermediate states like "-"
      if (paramName.startsWith('q_init_')) {
        parsedValue = value; // Keep as string
      } else {
        parsedValue = parseFloat(value);
      }
    } else if (paramSpec.type === 'string') {
      parsedValue = value; // Keep as string
    }

    onParametersChange({
      ...parameters,
      [paramName]: parsedValue
    });
  };

  if (loading) {
    return <div className="parameter-panel"><p>Loading parameters...</p></div>;
  }

  if (error) {
    return <div className="parameter-panel error"><p>{error}</p></div>;
  }

  return (
    <div className="parameter-panel">
      <h2>Configuration</h2>

      <div className="parameter-group">
        <label>Environment</label>
        <select
          value={environment}
          onChange={(e) => onEnvironmentChange(e.target.value)}
        >
          {environments.map(env => (
            <option key={env} value={env}>{env}</option>
          ))}
        </select>
        <p className="hint">Select environment</p>
      </div>

      <div className="parameter-group">
        <label>Algorithm</label>
        <select
          value={algorithm}
          onChange={(e) => onAlgorithmChange(e.target.value)}
        >
          {algorithms.map(alg => (
            <option key={alg} value={alg}>{alg}</option>
          ))}
        </select>
        <p className="hint">Select algorithm</p>
      </div>

      {/* Control Buttons */}
      <ControlButtons
        onStartTraining={onStartTraining}
        onStopTraining={onStopTraining}
        onPlayPolicy={onPlayPolicy}
        onStopPlayback={onStopPlayback}
        isTraining={isTraining}
        isPlayback={isPlayback}
        canPlayPolicy={canPlayPolicy}
        disabled={disabled}
      />

      {/* Learning Parameters Section */}
      <h3>Learning Parameters</h3>

      {/* Core learning parameters in desired order: num_episodes, exploration_rate, learning_rate, discount_factor */}
      {schema && ['num_episodes', 'exploration_rate', 'learning_rate', 'discount_factor']
        .filter(paramName => schema[paramName]) // Only include if parameter exists in schema
        .map(paramName => {
          const param = schema[paramName];
          const value = parameters[paramName] || param.default;

          return (
            <div key={paramName} className="parameter-group">
              <label>
                {paramName.replace(/_/g, ' ')}
                <span className="param-value">{formatNumber(value, paramName)}</span>
              </label>
              <input
                type="range"
                min={param.min}
                max={param.max}
                step={param.type === 'int' ? 1 : 0.01}
                value={value}
                onChange={(e) => handleParameterChange(paramName, e.target.value)}
              />
              <p className="hint">{param.description}</p>
            </div>
          );
        })
      }

      {/* Q-Value Initialization Subsection */}
      <h4>Q-Value Initialization</h4>

      {/* Strategy Dropdown - Always visible */}
      {schema && schema.q_init_strategy && (
        <div className="parameter-group">
          <label>Strategy</label>
          <select
            value={parameters.q_init_strategy || schema.q_init_strategy.default}
            onChange={(e) => handleParameterChange('q_init_strategy', e.target.value)}
            className="strategy-selector"
          >
            {schema.q_init_strategy.options.map(option => (
              <option key={option} value={option}>
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </option>
            ))}
          </select>
          <p className="hint">{schema.q_init_strategy.description}</p>
        </div>
      )}

      {/* Fixed Strategy: Show q_init_value */}
      {parameters.q_init_strategy === 'fixed' && schema && schema.q_init_value && (
        <div className="parameter-group parameter-indent">
          <label>
            Q-Base Value
            <span className="param-value">
              {parameters.q_init_value ?? schema.q_init_value.default}
            </span>
          </label>
          <input
            type="text"
            value={parameters.q_init_value ?? schema.q_init_value.default}
            onChange={(e) => handleParameterChange('q_init_value', e.target.value)}
            className="q-value-input"
          />
          <p className="hint">{schema.q_init_value.description}</p>

          {/* Validation Warning for empty/NaN value */}
          {(parameters.q_init_value === undefined || parameters.q_init_value === '' || isNaN(parameters.q_init_value)) && (
            <p className="hint error">
              ⚠️ Q-Base Value cannot be empty
            </p>
          )}
        </div>
      )}

      {/* Random Strategy: Show q_init_min and q_init_max */}
      {parameters.q_init_strategy === 'random' && schema && (
        <div className="parameter-indent">
          {/* Min Value */}
          {schema.q_init_min && (
            <div className="parameter-group">
              <label>
                Min Value
                <span className="param-value">
                  {parameters.q_init_min ?? schema.q_init_min.default}
                </span>
              </label>
              <input
                type="text"
                value={parameters.q_init_min ?? schema.q_init_min.default}
                onChange={(e) => handleParameterChange('q_init_min', e.target.value)}
                className="q-value-input"
              />
              <p className="hint">{schema.q_init_min.description}</p>
            </div>
          )}

          {/* Max Value */}
          {schema.q_init_max && (
            <div className="parameter-group">
              <label>
                Max Value
                <span className="param-value">
                  {parameters.q_init_max ?? schema.q_init_max.default}
                </span>
              </label>
              <input
                type="text"
                value={parameters.q_init_max ?? schema.q_init_max.default}
                onChange={(e) => handleParameterChange('q_init_max', e.target.value)}
                className="q-value-input"
              />
              <p className="hint">{schema.q_init_max.description}</p>
            </div>
          )}

          {/* Validation Warnings */}
          {(parameters.q_init_min === undefined || parameters.q_init_min === '' || isNaN(parameters.q_init_min)) && (
            <p className="hint error">
              ⚠️ Min Value cannot be empty
            </p>
          )}
          {(parameters.q_init_max === undefined || parameters.q_init_max === '' || isNaN(parameters.q_init_max)) && (
            <p className="hint error">
              ⚠️ Max Value cannot be empty
            </p>
          )}
          {parameters.q_init_min >= parameters.q_init_max && (
            <p className="hint error">
              ⚠️ Min must be less than Max
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default ParameterPanel;
