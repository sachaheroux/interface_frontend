import React, { useState, useEffect, useRef } from 'react';
import './LigneTransfertSimulation.css';

const LigneTransfertSimulation = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [simulationTime, setSimulationTime] = useState(0);
  const [bufferSizes, setBufferSizes] = useState([5, 5, 5]); // Taille des 3 buffers
  const [pieces, setPieces] = useState([]);
  const [stations, setStations] = useState([
    { id: 1, name: 'Poste 1', speed: 2.5, failureRate: 0.02, isWorking: true, currentPiece: null, position: 0 },
    { id: 2, name: 'Poste 2', speed: 3.0, failureRate: 0.03, isWorking: true, currentPiece: null, position: 1 },
    { id: 3, name: 'Poste 3', speed: 2.8, failureRate: 0.025, isWorking: true, currentPiece: null, position: 2 },
    { id: 4, name: 'Poste 4', speed: 2.2, failureRate: 0.015, isWorking: true, currentPiece: null, position: 3 }
  ]);
  const [buffers, setBuffers] = useState([
    { id: 1, pieces: [], maxSize: 5, position: 0.5 },
    { id: 2, pieces: [], maxSize: 5, position: 1.5 },
    { id: 3, pieces: [], maxSize: 5, position: 2.5 }
  ]);
  const [metrics, setMetrics] = useState({
    totalPieces: 0,
    completedPieces: 0,
    throughput: 0,
    avgWaitTime: 0,
    stationUtilization: [0, 0, 0, 0]
  });
  const [targetPieces] = useState(100);
  const animationRef = useRef();
  const lastTimeRef = useRef(0);

  // Configuration des postes
  const stationConfig = [
    { name: 'Découpe', speed: 2.5, failureRate: 0.02, color: '#3b82f6' },
    { name: 'Perçage', speed: 3.0, failureRate: 0.03, color: '#10b981' },
    { name: 'Assemblage', speed: 2.8, failureRate: 0.025, color: '#f59e0b' },
    { name: 'Contrôle', speed: 2.2, failureRate: 0.015, color: '#ef4444' }
  ];

  // Simulation step
  const simulateStep = (deltaTime) => {
    if (!isRunning) return;

    setSimulationTime(prev => prev + deltaTime);

    // Générer de nouvelles pièces
    if (Math.random() < 0.1 && pieces.length < 50) {
      const newPiece = {
        id: Date.now() + Math.random(),
        position: -0.5,
        targetPosition: 0,
        inStation: false,
        completed: false,
        startTime: simulationTime
      };
      setPieces(prev => [...prev, newPiece]);
    }

    // Mettre à jour les pièces
    setPieces(prevPieces => {
      return prevPieces.map(piece => {
        if (piece.completed) return piece;

        // Déplacer la pièce
        if (!piece.inStation) {
          const newPosition = piece.position + 0.02;
          if (newPosition >= piece.targetPosition) {
            piece.position = piece.targetPosition;
            piece.inStation = true;
          } else {
            piece.position = newPosition;
          }
        }

        return piece;
      });
    });

    // Mettre à jour les postes
    setStations(prevStations => {
      return prevStations.map(station => {
        // Gestion des pannes
        if (Math.random() < station.failureRate * deltaTime) {
          station.isWorking = false;
          setTimeout(() => {
            setStations(current => 
              current.map(s => s.id === station.id ? { ...s, isWorking: true } : s)
            );
          }, 5000); // Panne de 5 secondes
        }

        // Traitement des pièces
        if (station.currentPiece && station.isWorking) {
          station.processingTime = (station.processingTime || 0) + deltaTime;
          if (station.processingTime >= station.speed) {
            // Pièce terminée
            station.currentPiece = null;
            station.processingTime = 0;
            setMetrics(prev => ({
              ...prev,
              completedPieces: prev.completedPieces + 1
            }));
          }
        }

        return station;
      });
    });

    // Mettre à jour les métriques
    setMetrics(prev => ({
      ...prev,
      totalPieces: pieces.length,
      throughput: prev.completedPieces / (simulationTime / 60), // pièces/minute
      avgWaitTime: simulationTime / Math.max(prev.completedPieces, 1)
    }));
  };

  // Animation loop
  useEffect(() => {
    const animate = (currentTime) => {
      if (lastTimeRef.current === 0) {
        lastTimeRef.current = currentTime;
      }
      const deltaTime = (currentTime - lastTimeRef.current) / 1000;
      lastTimeRef.current = currentTime;

      simulateStep(deltaTime);
      animationRef.current = requestAnimationFrame(animate);
    };

    if (isRunning) {
      animationRef.current = requestAnimationFrame(animate);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isRunning, pieces, stations]);

  const startSimulation = () => {
    setIsRunning(true);
    setSimulationTime(0);
    setPieces([]);
    setMetrics({
      totalPieces: 0,
      completedPieces: 0,
      throughput: 0,
      avgWaitTime: 0,
      stationUtilization: [0, 0, 0, 0]
    });
  };

  const stopSimulation = () => {
    setIsRunning(false);
  };

  const resetSimulation = () => {
    setIsRunning(false);
    setSimulationTime(0);
    setPieces([]);
    setStations(prev => prev.map(station => ({
      ...station,
      currentPiece: null,
      isWorking: true,
      processingTime: 0
    })));
    setBuffers(prev => prev.map(buffer => ({
      ...buffer,
      pieces: []
    })));
  };

  const updateBufferSize = (bufferIndex, newSize) => {
    setBufferSizes(prev => {
      const newSizes = [...prev];
      newSizes[bufferIndex] = Math.max(1, Math.min(20, newSize));
      return newSizes;
    });
    setBuffers(prev => {
      const newBuffers = [...prev];
      newBuffers[bufferIndex].maxSize = newSizes[bufferIndex];
      return newBuffers;
    });
  };

  return (
    <div className="ligne-transfert-simulation">
      {/* Contexte et instructions */}
      <div className="lt-context">
        <h2>Simulation de Ligne de Transfert</h2>
        <div className="lt-context-content">
          <p>
            <strong>Contexte :</strong> Vous gérez une ligne de production automobile avec 4 postes de travail 
            et 3 zones de stockage intermédiaires (buffers). Votre objectif est de produire 100 pièces 
            en optimisant la configuration des buffers pour maximiser le débit.
          </p>
          <div className="lt-objectives">
            <h4>Objectifs :</h4>
            <ul>
              <li>Produire 100 pièces le plus rapidement possible</li>
              <li>Optimiser les tailles des buffers pour équilibrer la ligne</li>
              <li>Minimiser les temps d'attente et les goulots d'étranglement</li>
              <li>Gérer les pannes aléatoires des machines</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Contrôles */}
      <div className="lt-controls">
        <div className="lt-control-buttons">
          <button 
            onClick={startSimulation} 
            disabled={isRunning}
            className="lt-btn lt-btn-start"
          >
            Démarrer
          </button>
          <button 
            onClick={stopSimulation} 
            disabled={!isRunning}
            className="lt-btn lt-btn-stop"
          >
            Pause
          </button>
          <button 
            onClick={resetSimulation}
            className="lt-btn lt-btn-reset"
          >
            Réinitialiser
          </button>
        </div>
        
        <div className="lt-buffer-controls">
          <h4>Configuration des Buffers :</h4>
          {bufferSizes.map((size, index) => (
            <div key={index} className="lt-buffer-control">
              <label>Buffer {index + 1} :</label>
              <input
                type="range"
                min="1"
                max="20"
                value={size}
                onChange={(e) => updateBufferSize(index, parseInt(e.target.value))}
                disabled={isRunning}
              />
              <span>{size} pièces</span>
            </div>
          ))}
        </div>
      </div>

      {/* Simulation visuelle */}
      <div className="lt-simulation-area">
        <div className="lt-production-line">
          {/* Postes de travail */}
          {stations.map((station, index) => (
            <div key={station.id} className="lt-station" style={{ left: `${index * 25}%` }}>
              <div className={`lt-station-icon ${!station.isWorking ? 'lt-station-failed' : ''}`}>
                {station.isWorking ? '⚙️' : '🔴'}
              </div>
              <div className="lt-station-info">
                <div className="lt-station-name">{stationConfig[index].name}</div>
                <div className="lt-station-speed">{station.speed}s/pièce</div>
                <div className="lt-station-failure">{station.failureRate * 100}% pannes</div>
              </div>
              {station.currentPiece && (
                <div className="lt-piece lt-piece-in-station">📦</div>
              )}
            </div>
          ))}

          {/* Buffers */}
          {buffers.map((buffer, index) => (
            <div key={buffer.id} className="lt-buffer" style={{ left: `${(index + 1) * 25 - 12.5}%` }}>
              <div className="lt-buffer-label">Buffer {index + 1}</div>
              <div className="lt-buffer-content">
                {buffer.pieces.map((piece, pieceIndex) => (
                  <div key={pieceIndex} className="lt-piece">📦</div>
                ))}
              </div>
              <div className="lt-buffer-info">
                {buffer.pieces.length}/{buffer.maxSize}
              </div>
            </div>
          ))}
        </div>

        {/* Pièces en mouvement */}
        <div className="lt-pieces-container">
          {pieces.map(piece => (
            <div
              key={piece.id}
              className="lt-piece lt-piece-moving"
              style={{
                left: `${piece.position * 100}%`,
                opacity: piece.completed ? 0.3 : 1
              }}
            >
              📦
            </div>
          ))}
        </div>
      </div>

      {/* Métriques */}
      <div className="lt-metrics">
        <div className="lt-metrics-grid">
          <div className="lt-metric">
            <h4>Progression</h4>
            <div className="lt-metric-value">
              {metrics.completedPieces}/{targetPieces} pièces
            </div>
            <div className="lt-progress-bar">
              <div 
                className="lt-progress-fill" 
                style={{ width: `${(metrics.completedPieces / targetPieces) * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="lt-metric">
            <h4>Temps écoulé</h4>
            <div className="lt-metric-value">
              {Math.floor(simulationTime)}s
            </div>
          </div>

          <div className="lt-metric">
            <h4>Débit</h4>
            <div className="lt-metric-value">
              {metrics.throughput.toFixed(2)} pièces/min
            </div>
          </div>

          <div className="lt-metric">
            <h4>Temps d'attente moyen</h4>
            <div className="lt-metric-value">
              {metrics.avgWaitTime.toFixed(1)}s
            </div>
          </div>
        </div>
      </div>

      {/* Configuration des postes */}
      <div className="lt-stations-config">
        <h4>Configuration des Postes :</h4>
        <div className="lt-stations-grid">
          {stationConfig.map((config, index) => (
            <div key={index} className="lt-station-config">
              <div className="lt-station-config-name">{config.name}</div>
              <div className="lt-station-config-details">
                <span>Vitesse : {config.speed}s/pièce</span>
                <span>Taux de panne : {config.failureRate * 100}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LigneTransfertSimulation; 