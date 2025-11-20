import React, { useEffect, useState } from 'react';
import { getParameterSchema, getEnvironments, getAlgorithms } from '../api';
import './ParameterPanel.css';

const ParameterPanel = ({ algorithm, environment, parameters, onParametersChange, onAlgorithmChange, onEnvironmentChange }) => {
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
      parsedValue = parseFloat(value);
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

      <h3>Parameters</h3>
      {schema && Object.keys(schema).map(paramName => {
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
      })}
    </div>
  );
};

export default ParameterPanel;
