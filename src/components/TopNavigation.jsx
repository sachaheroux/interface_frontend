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
    { name: "Flowshop", icon: "▦", subtitle: "Production en flux" },
    { name: "Jobshop", icon: "⬡", subtitle: "Ateliers flexibles" },
    { name: "Ligne d'assemblage", icon: "◐", subtitle: "Assemblage séquentiel" },
    { name: "Ligne d'assemblage mixte", icon: "◯", subtitle: "Assemblage multi-produits" },
    { name: "Ligne de transfert", icon: "◈", subtitle: "Production continue" },
    { name: "FMS", icon: "◼", subtitle: "Systèmes flexibles" }
  ];

  const getSystemInfo = (systemName) => {
    return systems.find(s => s.name === systemName) || { icon: "▣", subtitle: "" };
  };

  return (
    <div className="top-navigation">
      <div className="nav-container">
        {/* Logo Section */}
        <a href="#" className="nav-logo" onClick={() => handleNavClick('welcome')}>
          <img src="/logo.png" alt="Logo" className="nav-logo-icon" />
          <span className="nav-logo-text">Systèmes Industriels</span>
        </a>

        {/* Navigation Tabs */}
        <div className="nav-tabs">
          <button 
            className={`nav-tab ${currentMode === 'welcome' ? 'active' : ''}`}
            onClick={() => handleNavClick('welcome')}
          >
            <span className="nav-icon">⌂</span>
            <span className="nav-label">Accueil</span>
          </button>

          <button 
            className={`nav-tab ${currentMode === 'decision' ? 'active' : ''}`}
            onClick={() => handleNavClick('decision')}
          >
            <span className="nav-icon">◎</span>
            <span className="nav-label">Aide à la Décision</span>
          </button>

          <div className="nav-system-selector" ref={dropdownRef}>
            <button 
              className="current-system-indicator"
              onClick={() => handleNavClick('systems')}
            >
              <span className="system-icon">
                {currentSystem ? getSystemInfo(currentSystem).icon : "▣"}
              </span>
              <span className="system-name">
                {currentSystem || "Systèmes de Production"}
              </span>
              <span className={`dropdown-arrow ${showSystemDropdown ? 'open' : ''}`}>
                ▼
              </span>
            </button>

            {/* Dropdown Menu */}
            {showSystemDropdown && (
              <div className="system-dropdown">
                {systems.map((system) => (
                  <button
                    key={system.name}
                    className={`dropdown-item ${currentSystem === system.name ? 'selected' : ''}`}
                    onClick={() => handleSystemSelection(system.name)}
                  >
                    <span className="dropdown-icon">{system.icon}</span>
                    <div className="dropdown-text">
                      <div>{system.name}</div>
                      <div className="dropdown-subtitle">{system.subtitle}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="nav-actions">
          <button className="nav-action-btn">
            <span className="nav-icon">◉</span>
            <span className="notification-badge">2</span>
          </button>
        </div>
      </div>
    </div>
  );
} 