import React, { useState } from 'react';
import { getAlgorithmInfo } from '../utils/contentLoader';
import './AlgorithmInfo.css';

const AlgorithmInfo = ({ algorithm }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const content = getAlgorithmInfo(algorithm);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  if (!content) {
    return (
      <div className="algorithm-info">
        <div className="info-panel-header" onClick={toggleExpand}>
          <span className="info-icon">🧠</span>
          <h3>About Algorithm</h3>
          <span className="expand-icon">{isExpanded ? '▲' : '▼'}</span>
        </div>
        {isExpanded && (
          <div className="info-panel-content">
            <p className="generic-message">No information available for this algorithm.</p>
          </div>
        )}
      </div>
    );
  }

  const { name, icon, description, sections, links } = content;

  return (
    <div className="algorithm-info">
      <div className="info-panel-header" onClick={toggleExpand}>
        <span className="info-icon">{icon}</span>
        <h3>About {name}</h3>
        <span className="expand-icon">{isExpanded ? '▲' : '▼'}</span>
      </div>

      {isExpanded && (
        <div className="info-panel-content">
          <p className="description">{description}</p>

          <section>
            <h4>What is {name}?</h4>
            <p>{sections.whatIsIt}</p>
          </section>

          <section>
            <h4>How It Works</h4>
            <ol>
              {sections.howItWorks.map((step, idx) => (
                <li key={idx}>{step}</li>
              ))}
            </ol>
          </section>

          <section>
            <h4>Key Concepts</h4>
            <dl>
              <dt>Q-Value</dt>
              <dd>{sections.keyConcepts.qValue}</dd>
              <dt>Exploration vs Exploitation</dt>
              <dd>{sections.keyConcepts.exploration}</dd>
              <dd>{sections.keyConcepts.exploitation}</dd>
              <dt>Off-Policy Learning</dt>
              <dd>{sections.keyConcepts.offPolicy}</dd>
            </dl>
          </section>

          <section>
            <h4>Parameters Explained</h4>
            {Object.entries(sections.parameters).map(([key, param]) => (
              <div className="parameter-explanation" key={key}>
                <strong>{param.symbol}</strong> - {param.description}
                <br />
                <em>Range: {param.range}</em>
              </div>
            ))}
          </section>

          <section>
            <h4>Learn More</h4>
            <ul className="link-list">
              {links.map((link, idx) => (
                <li key={idx}>
                  <a href={link.url} target="_blank" rel="noopener noreferrer">
                    {link.text} ↗
                  </a>
                </li>
              ))}
            </ul>
          </section>
        </div>
      )}
    </div>
  );
};

export default AlgorithmInfo;
