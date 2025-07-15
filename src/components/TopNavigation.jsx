import { useState, useEffect, useRef } from "react";
import "./TopNavigation.css";

export default function TopNavigation({ 
  currentMode, 
  onModeChange, 
  currentSystem,
  onSystemChange 
}) {
  
  const [showSystemDropdown, setShowSystemDropdown] = useState(false);
  const dropdownRef = useRef(null);
  
  // Fermer le dropdown quand on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowSystemDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const handleNavClick = (mode) => {
    if (mode === 'systems') {
      setShowSystemDropdown(!showSystemDropdown);
    } else {
      setShowSystemDropdown(false);
      onModeChange(mode);
    }
  };

  const handleSystemSelection = (system) => {
    onSystemChange(system);
    setShowSystemDropdown(false);
    onModeChange('systems');
  };

  const systems = [
    "Flowshop",
    "Jobshop", 
    "Ligne d'assemblage",
    "Ligne d'assemblage mixte",
    "Ligne de transfert",
    "FMS"
  ];

  return (
    <div className="top-navigation">
      <div className="nav-container">
        {/* Logo Section */}
        <div className="nav-logo" onClick={() => handleNavClick('welcome')}>
          <img src="/logo.png" alt="Logo" className="nav-logo-img" />
          <div className="nav-logo-text">
            <span className="nav-title">Systèmes Industriels</span>
            <span className="nav-subtitle">Optimisation & Modélisation</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="nav-tabs">
          <button 
            className={`nav-tab ${currentMode === 'welcome' ? 'active' : ''}`}
            onClick={() => handleNavClick('welcome')}
          >
            <span className="nav-icon">🏠</span>
            <span className="nav-label">Accueil</span>
          </button>

          <button 
            className={`nav-tab ${currentMode === 'decision' ? 'active' : ''}`}
            onClick={() => handleNavClick('decision')}
          >
            <span className="nav-icon">🧭</span>
            <span className="nav-label">Aide à la Décision</span>
          </button>

          <div className="nav-tab-dropdown" ref={dropdownRef}>
            <button 
              className={`nav-tab ${currentMode === 'systems' ? 'active' : ''}`}
              onClick={() => handleNavClick('systems')}
            >
              <span className="nav-icon">🏭</span>
              <span className="nav-label">Systèmes de Production</span>
              <span className="dropdown-arrow">▼</span>
            </button>

            {/* Dropdown Menu */}
            {showSystemDropdown && (
              <div className="system-dropdown">
                <div className="dropdown-header">Choisir un système :</div>
                {systems.map((system) => (
                  <button
                    key={system}
                    className={`dropdown-item ${currentSystem === system ? 'selected' : ''}`}
                    onClick={() => handleSystemSelection(system)}
                  >
                    {system}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Current System Indicator (when selected) */}
        {currentMode === 'systems' && currentSystem && (
          <div className="current-system-indicator">
            <span className="system-name">{currentSystem}</span>
          </div>
        )}
      </div>
    </div>
  );
} 