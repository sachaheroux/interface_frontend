import { 
  Factory, 
  Grid3x3, 
  GitBranch, 
  Network, 
  CircleDot, 
  Settings,
  Hammer 
} from "lucide-react";
import "./CompactSidebar.css";

export default function CompactSidebar({ 
  system, 
  algorithms, 
  selectedAlgorithm, 
  onAlgorithmChange,
  onClose 
}) {
  
  if (!system || !algorithms || algorithms.length === 0) {
    return null;
  }

  const getSystemIcon = (systemName) => {
    const icons = {
      "Flowshop": <Factory size={20} />,
      "Jobshop": <Grid3x3 size={20} />, 
      "Ligne d'assemblage": <GitBranch size={20} />,
      "Ligne d'assemblage mixte": <Network size={20} />,
      "Ligne de transfert": <CircleDot size={20} />,
      "FMS": <Settings size={20} />
    };
    return icons[systemName] || <Hammer size={20} />;
  };

  return (
    <div className="compact-sidebar">
      <div className="sidebar-header">
        <div className="system-badge">
          {getSystemIcon(system)}
        </div>
        <div className="title-text">
          <h3>{system}</h3>
          <p className="algorithm-count">{algorithms.length} algorithmes disponibles</p>
        </div>
      </div>

      <div className="algorithms-list">
        {algorithms.map((algorithm, index) => (
          <button
            key={algorithm}
            className={`algorithm-item ${selectedAlgorithm === algorithm ? 'active' : ''}`}
            onClick={() => onAlgorithmChange(algorithm)}
          >
            <span className="algorithm-number">{index + 1}</span>
            <span className="algorithm-name">{algorithm}</span>
            <span className="status-indicator"></span>
          </button>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="sidebar-actions">
        <button className="action-btn" title="Comparer les algorithmes">
          <span className="action-icon">⫽</span>
          Comparer
        </button>
        <button className="action-btn primary" title="Information sur le système">
          <span className="action-icon">◌</span>
          Info Système
        </button>
      </div>
    </div>
  );
} 