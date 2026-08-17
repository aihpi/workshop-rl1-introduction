import React, { useEffect, useState } from 'react';
import { getParameterSchema, getEnvironments, getAlgorithms, getCompatibility } from '../api';
import ControlButtons from './ControlButtons';
import './ParameterPanel.css';

// Training-budget parameter: each algorithm exposes exactly one of these
// (Q-Learning: num_episodes, SB3 algorithms: total_timesteps)
export const BUDGET_KEYS = ['num_episodes', 'total_timesteps'];

// Parameters with bespoke rendering; everything else renders generically
const SPECIAL_KEYS = [...BUDGET_KEYS, 'seed', 'q_init_strategy', 'q_init_value', 'q_init_min', 'q_init_max'];

// True when value is an integer >= min (values arrive as strings from text inputs)
export const isIntAtLeast = (value, min) =>
  value !== undefined && value !== '' && !isNaN(value) &&
  parseFloat(value) >= min && parseFloat(value) === parseInt(value, 10);

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
  disabled,
  liveCharts = true,
  onLiveChartsChange = () => {}
}) => {
  const [schema, setSchema] = useState(null);
  const [environments, setEnvironments] = useState([]);
  const [algorithms, setAlgorithms] = useState([]);
  const [compatibility, setCompatibility] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Scientific notation for large training budgets
  const formatNumber = (value, paramName) => {
    if (BUDGET_KEYS.includes(paramName) && value >= 1000) {
      return Number(value).toExponential(1);
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

    const fetchCompatibility = async () => {
      try {
        const compat = await getCompatibility();
        setCompatibility(compat);
      } catch (err) {
        console.error('Failed to load compatibility:', err);
      }
    };

    fetchEnvironments();
    fetchAlgorithms();
    fetchCompatibility();
  }, []);

  // Algorithms compatible with the selected environment
  const compatibleAlgorithms = compatibility
    ? algorithms.filter(alg => (compatibility[alg] || []).includes(environment))
    : algorithms;

  // Auto-switch to a compatible algorithm when the environment changes
  useEffect(() => {
    if (!compatibility || !environment) return;
    if (!(compatibility[algorithm] || []).includes(environment)) {
      const firstCompatible = Object.keys(compatibility).find(
        alg => compatibility[alg].includes(environment)
      );
      if (firstCompatible) {
        onAlgorithmChange(firstCompatible);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [environment, compatibility]);

  // Load parameter schema when algorithm or environment changes
  useEffect(() => {
    // An environment switch plus the compatibility auto-switch fire two
    // overlapping fetches; the stale flag makes sure only the newest one
    // writes state (out-of-order responses would otherwise pair one
    // algorithm's selection with another algorithm's schema/parameters)
    let stale = false;

    const fetchSchema = async () => {
      try {
        setLoading(true);
        const paramSchema = await getParameterSchema(algorithm, environment);
        if (stale) return;
        setSchema(paramSchema);

        // Initialize parameters with default values
        const defaultParams = {};
        Object.keys(paramSchema).forEach(key => {
          defaultParams[key] = paramSchema[key].default;
        });
        onParametersChange(defaultParams);

        setError(null);
      } catch (err) {
        if (stale) return;
        setError('Failed to load parameter schema');
        console.error(err);
      } finally {
        if (!stale) {
          setLoading(false);
        }
      }
    };

    if (algorithm && environment) {
      fetchSchema();
    }
    return () => {
      stale = true;
    };
  }, [algorithm, environment]);

  const handleParameterChange = (paramName, value) => {
    const paramSpec = schema[paramName];
    let parsedValue = value;

    if (paramSpec.type === 'int') {
      // Budget and seed are text inputs: keep as string to allow typing
      // intermediate states (and an empty seed, which means "random run")
      if (BUDGET_KEYS.includes(paramName) || paramName === 'seed') {
        parsedValue = value; // Keep as string
      } else {
        parsedValue = parseInt(value, 10);
      }
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
          {compatibleAlgorithms.map(alg => (
            <option key={alg} value={alg}>{alg}</option>
          ))}
        </select>
        <p className="hint">Select algorithm</p>
      </div>

      {/* Random seed - directly below the environment/algorithm choice */}
      {schema && schema.seed && (
        <div className="parameter-group">
          <label>
            Random Seed
            <span className="param-value">
              {(parameters.seed ?? schema.seed.default) === '' ? 'random' : (parameters.seed ?? schema.seed.default)}
            </span>
          </label>
          <input
            type="text"
            value={parameters.seed ?? schema.seed.default}
            onChange={(e) => handleParameterChange('seed', e.target.value)}
            placeholder="random"
            className="q-value-input"
          />
          <p className="hint">{schema.seed.description}</p>

          {/* Validation Warning: empty is fine, otherwise a non-negative integer */}
          {parameters.seed !== undefined && parameters.seed !== '' && !isIntAtLeast(parameters.seed, 0) && (
            <p className="hint error">
              ⚠️ Must be a non-negative integer (or empty for a random run)
            </p>
          )}
        </div>
      )}

      {/* Live charts toggle - opt out to train at full speed on slow machines */}
      <div className="parameter-group">
        <label>
          <input
            type="checkbox"
            checked={liveCharts}
            onChange={(e) => onLiveChartsChange(e.target.checked)}
            disabled={isTraining}
          />
          {' '}Live charts
        </label>
        <p className="hint">
          {liveCharts
            ? 'Charts and frames update during training. Disabling may speed up training on slower machines.'
            : 'Training runs at full speed; charts appear when it finishes.'}
        </p>
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

      {/* Training budget (num_episodes or total_timesteps) as text input */}
      {schema && BUDGET_KEYS.filter(key => schema[key]).map(budgetKey => (
        <div key={budgetKey} className="parameter-group">
          <label>
            {budgetKey.replace(/_/g, ' ')}
            <span className="param-value">
              {formatNumber(parameters[budgetKey] ?? schema[budgetKey].default, budgetKey)}
            </span>
          </label>
          <input
            type="text"
            value={parameters[budgetKey] ?? schema[budgetKey].default}
            onChange={(e) => handleParameterChange(budgetKey, e.target.value)}
            className="q-value-input"
          />
          <p className="hint">{schema[budgetKey].description}</p>

          {/* Validation Warning */}
          {!isIntAtLeast(parameters[budgetKey], 1) && (
            <p className="hint error">
              ⚠️ Must be a positive integer
            </p>
          )}
        </div>
      ))}

      {/* All other parameters render as sliders (bounded numerics are the
          only remaining schema shape; add branches when a schema needs more) */}
      {schema && Object.entries(schema)
        .filter(([paramName, param]) =>
          !SPECIAL_KEYS.includes(paramName) && param.min !== undefined && param.max !== undefined)
        .map(([paramName, param]) => {
          const value = parameters[paramName] ?? param.default;

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
                step={param.step ?? (param.type === 'int' ? 1 : 0.01)}
                value={value}
                onChange={(e) => handleParameterChange(paramName, e.target.value)}
              />
              <p className="hint">{param.description}</p>
            </div>
          );
        })
      }

      {/* Q-Value Initialization Subsection (tabular algorithms only) */}
      {schema && schema.q_init_strategy && <h4>Q-Value Initialization</h4>}

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
