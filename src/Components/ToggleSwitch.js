import React from 'react';
import './ToggleSwitch.css';

const ToggleSwitch = ({ isChecked, onToggle, label }) => {
    return (
      <div className="toggle-switch">
        <label className="switch">
          <input type="checkbox" checked={isChecked} onChange={onToggle} />
          <span className="slider"></span>
        </label>
        <span className="toggle-label">
          {isChecked ? `Hide ${label}` : `Show ${label}`}
        </span>
      </div>
    );
  };
  
  export default ToggleSwitch;