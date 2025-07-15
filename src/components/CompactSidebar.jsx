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

  return (
    <div className="compact-sidebar">
      <div className="sidebar-header">
        <div className="sidebar-title">
          <span className="system-icon">🏭</span>
          <div className="title-text">
            <h3>{system}</h3>
            <span className="algorithm-count">{algorithms.length} algorithmes</span>
          </div>
        </div>
        <button className="sidebar-close" onClick={onClose} title="Fermer">
          ✕
        </button>
      </div>

      <div className="algorithms-list">
        <div className="list-header">
          <span>Algorithmes disponibles</span>
        </div>
        
        {algorithms.map((algorithm, index) => (
          <button
            key={algorithm}
            className={`algorithm-item ${selectedAlgorithm === algorithm ? 'active' : ''}`}
            onClick={() => onAlgorithmChange(algorithm)}
          >
            <span className="algorithm-number">{index + 1}</span>
            <span className="algorithm-name">{algorithm}</span>
            {selectedAlgorithm === algorithm && (
              <span className="algorithm-indicator">→</span>
            )}
          </button>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="sidebar-actions">
        <button className="action-btn compare" title="Comparer les algorithmes">
          📊 Comparer
        </button>
        <button className="action-btn info" title="Information sur le système">
          ℹ️ Info
        </button>
      </div>
    </div>
  );
} 