import React, { useState } from 'react';
import { getEnvironmentInfo } from '../utils/contentLoader';
import './EnvironmentInfo.css';

const EnvironmentInfo = ({ environment }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const content = getEnvironmentInfo(environment);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  if (!content) {
    return (
      <div className="environment-info">
        <div className="info-panel-header" onClick={toggleExpand}>
          <span className="info-icon">🏔️</span>
          <h3>About Environment</h3>
          <span className="expand-icon">{isExpanded ? '▲' : '▼'}</span>
        </div>
        {isExpanded && (
          <div className="info-panel-content">
            <p className="generic-message">No information available for this environment.</p>
          </div>
        )}
      </div>
    );
  }

  const { name, icon, description, sections, links } = content;

  return (
    <div className="environment-info">
      <div className="info-panel-header" onClick={toggleExpand}>
        <span className="info-icon">{icon}</span>
        <h3>About {name}</h3>
        <span className="expand-icon">{isExpanded ? '▲' : '▼'}</span>
      </div>

      {isExpanded && (
        <div className="info-panel-content">
          <p className="description">{description}</p>

          <section>
            <h4>Goal</h4>
            <p>{sections.goal}</p>
          </section>

          <section>
            <h4>State Space</h4>
            <p><strong>Type:</strong> {sections.stateSpace.type}</p>
            <p><strong>Size:</strong> {sections.stateSpace.size}</p>
            <p>{sections.stateSpace.description}</p>
          </section>

          <section>
            <h4>Action Space</h4>
            <p><strong>Type:</strong> {sections.actionSpace.type}</p>
            <p><strong>Size:</strong> {sections.actionSpace.size}</p>
            <ul>
              {sections.actionSpace.actions.map((action, idx) => (
                <li key={idx}>{action}</li>
              ))}
            </ul>
          </section>

          <section>
            <h4>Reward Structure</h4>
            <ul>
              <li>Goal: +{sections.rewards.goal}</li>
              <li>Hole: {sections.rewards.hole}</li>
              <li>Step: {sections.rewards.step}</li>
            </ul>
            <p>{sections.rewards.description}</p>
          </section>

          <section>
            <h4>Stochasticity</h4>
            <p>{sections.stochasticity}</p>
          </section>

          {sections.difficulty && (
            <section>
              <h4>Difficulty</h4>
              <p>{sections.difficulty}</p>
            </section>
          )}

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

export default EnvironmentInfo;
