import "./TopNavigation.css";

export default function TopNavigation({ 
  currentMode, 
  onModeChange, 
  currentSystem,
  onSystemChange 
}) {
  
  const handleNavClick = (mode) => {
    onModeChange(mode);
  };

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

          <button 
            className={`nav-tab ${currentMode === 'systems' ? 'active' : ''}`}
            onClick={() => handleNavClick('systems')}
          >
            <span className="nav-icon">🏭</span>
            <span className="nav-label">Systèmes de Production</span>
          </button>
        </div>

        {/* System Selector (visible when in systems mode) */}
        {currentMode === 'systems' && (
          <div className="nav-system-selector">
            <select
              value={currentSystem}
              onChange={(e) => onSystemChange(e.target.value)}
              className="system-select"
            >
              <option value="">-- Choisir un système --</option>
              <option value="Flowshop">Flowshop</option>
              <option value="Jobshop">Jobshop</option>
              <option value="Ligne d'assemblage">Ligne d'assemblage</option>
              <option value="Ligne d'assemblage mixte">Ligne d'assemblage mixte</option>
              <option value="Ligne de transfert">Ligne de transfert</option>
              <option value="FMS">FMS</option>
            </select>
          </div>
        )}
      </div>
    </div>
  );
} 