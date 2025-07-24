import React, { useState, useEffect } from 'react';
import './LigneAssemblageMixteSimulation.css';

const LigneAssemblageMixteSimulation = () => {
  // Couleurs pour les produits
  const PRODUCT_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];
  
  // Configuration initiale
  const CYCLE_TIME = 45; // Temps de cycle maximum en minutes (augmenté)
  const INITIAL_STATIONS = 4; // Nombre initial de postes
  
  // Tâches avec temps pour chaque produit
  const initialTasks = [
    { id: 1, name: 'Préparation', productA: 8, productB: 6, predecessors: [] },
    { id: 2, name: 'Assemblage base', productA: 10, productB: 8, predecessors: [1] },
    { id: 3, name: 'Installation moteur', productA: 12, productB: 9, predecessors: [2] },
    { id: 4, name: 'Câblage', productA: 6, productB: 7, predecessors: [3] },
    { id: 5, name: 'Test électrique', productA: 8, productB: 10, predecessors: [4] },
    { id: 6, name: 'Installation écran', productA: 9, productB: 11, predecessors: [5] },
    { id: 7, name: 'Programmation', productA: 7, productB: 8, predecessors: [6] },
    { id: 8, name: 'Test final', productA: 11, productB: 9, predecessors: [7] },
    { id: 9, name: 'Emballage', productA: 5, productB: 6, predecessors: [8] },
    { id: 10, name: 'Contrôle qualité', productA: 9, productB: 7, predecessors: [9] },
    { id: 11, name: 'Étiquetage', productA: 4, productB: 5, predecessors: [10] },
    { id: 12, name: 'Palettisation', productA: 6, productB: 8, predecessors: [11] },
    { id: 13, name: 'Vérification finale', productA: 7, productB: 9, predecessors: [12] },
    { id: 14, name: 'Expédition', productA: 5, productB: 4, predecessors: [13] },
    { id: 15, name: 'Documentation', productA: 8, productB: 6, predecessors: [14] },
    { id: 16, name: 'Formation utilisateur', productA: 10, productB: 12, predecessors: [15] },
    { id: 17, name: 'Installation logiciel', productA: 9, productB: 7, predecessors: [16] },
    { id: 18, name: 'Test intégration', productA: 11, productB: 10, predecessors: [17] },
    { id: 19, name: 'Validation client', productA: 8, productB: 9, predecessors: [18] },
    { id: 20, name: 'Livraison', productA: 6, productB: 5, predecessors: [19] }
  ];

  const [tasks, setTasks] = useState(initialTasks);
  const [stations, setStations] = useState(INITIAL_STATIONS);
  const [stationAssignments, setStationAssignments] = useState({});
  const [draggedTask, setDraggedTask] = useState(null);
  const [results, setResults] = useState(null);

  // Fonction pour trier les tâches par ordre des prédécesseurs
  const sortTasksByPredecessors = (tasks) => {
    const sorted = [];
    const visited = new Set();
    
    const visit = (taskId) => {
      if (visited.has(taskId)) return;
      visited.add(taskId);
      
      const task = tasks.find(t => t.id === taskId);
      if (task) {
        // Visiter d'abord tous les prédécesseurs
        task.predecessors.forEach(pred => visit(pred));
        sorted.push(task);
      }
    };
    
    // Visiter toutes les tâches
    tasks.forEach(task => visit(task.id));
    
    return sorted;
  };

  // Calculer l'équilibrage
  const calculateBalancing = () => {
    const stationTimes = {};
    const stationTasks = {};
    
    // Initialiser les postes
    for (let i = 1; i <= stations; i++) {
      stationTimes[i] = { productA: 0, productB: 0 };
      stationTasks[i] = [];
    }
    
    // Calculer les temps par poste
    Object.entries(stationAssignments).forEach(([taskId, stationId]) => {
      const task = tasks.find(t => t.id === parseInt(taskId));
      if (task && stationId) {
        stationTimes[stationId].productA += task.productA;
        stationTimes[stationId].productB += task.productB;
        stationTasks[stationId].push(task);
      }
    });
    
    // Calculer les métriques
    const avgTimes = Object.values(stationTimes).map(station => 
      (station.productA + station.productB) / 2 // Moyenne des deux produits
    );
    const maxTime = Math.max(...avgTimes);
    const minTime = Math.min(...avgTimes);
    const avgTime = avgTimes.reduce((sum, time) => sum + time, 0) / avgTimes.length;
    
    const balanceEfficiency = ((minTime / maxTime) * 100).toFixed(1);
    const cycleTimeViolation = avgTimes.filter(time => time > CYCLE_TIME).length;
    
    return {
      stationTimes,
      stationTasks,
      maxTime,
      minTime,
      avgTime,
      balanceEfficiency,
      cycleTimeViolation,
      totalStations: stations
    };
  };

  // Évaluer la solution
  const evaluateSolution = () => {
    const balancing = calculateBalancing();
    setResults(balancing);
  };

  // Réinitialiser
  const resetSimulation = () => {
    setStationAssignments({});
    setResults(null);
  };

  // Ajouter un poste
  const addStation = () => {
    setStations(prev => prev + 1);
  };

  // Enlever un poste
  const removeStation = () => {
    if (stations > 1) {
      setStations(prev => prev - 1);
      // Retirer les tâches du poste supprimé
      const newAssignments = {};
      Object.entries(stationAssignments).forEach(([taskId, stationId]) => {
        if (stationId < stations) {
          newAssignments[taskId] = stationId;
        }
      });
      setStationAssignments(newAssignments);
    }
  };

  // Gestion du drag and drop
  const handleDragStart = (e, task) => {
    setDraggedTask(task);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, stationId) => {
    e.preventDefault();
    if (!draggedTask) return;

    // Vérifier les contraintes
    const currentStationTasks = Object.entries(stationAssignments)
      .filter(([_, sId]) => sId === stationId)
      .map(([taskId, _]) => parseInt(taskId));

    // Vérifier les prédécesseurs
    const completedTasks = Object.keys(stationAssignments).map(id => parseInt(id));
    const predecessorsCompleted = draggedTask.predecessors.every(pred => 
      completedTasks.includes(pred)
    );

    if (!predecessorsCompleted) {
      alert(`La tâche "${draggedTask.name}" ne peut pas être placée car ses prédécesseurs ne sont pas terminés.`);
      return;
    }

    // Vérifier le temps de cycle
    const currentStationTime = currentStationTasks.reduce((total, taskId) => {
      const task = tasks.find(t => t.id === taskId);
      return total + ((task.productA + task.productB) / 2); // Moyenne des deux produits
    }, 0);

    const newTaskTime = (draggedTask.productA + draggedTask.productB) / 2; // Moyenne des deux produits
    if (currentStationTime + newTaskTime > CYCLE_TIME) {
      alert(`La tâche "${draggedTask.name}" ne peut pas être placée car elle dépasserait le temps de cycle de ${CYCLE_TIME} minutes.`);
      return;
    }

    // Placer la tâche
    setStationAssignments(prev => ({
      ...prev,
      [draggedTask.id]: stationId
    }));
    setDraggedTask(null);
  };

  return (
    <div className="lam-simulation">
      {/* Contexte */}
      <div className="lam-factory-context">
        <div className="lam-context-block">
          <h2>🏭 Usine de Production Mixte</h2>
          <div className="lam-context-mission">
            <strong>Mission :</strong> Équilibrer la ligne d'assemblage pour minimiser les déséquilibres et le nombre de postes de travail.
          </div>
          <div className="lam-context-ressources">
            <strong>Contraintes :</strong>
            <ul>
              <li>Temps de cycle maximum : <strong>{CYCLE_TIME} minutes</strong></li>
              <li>2 produits différents avec temps d'exécution variables</li>
              <li>Respecter les relations de précédence entre tâches</li>
              <li>Minimiser le nombre de postes de travail</li>
            </ul>
          </div>
          <div className="lam-context-note">
            <strong>Note :</strong> Les temps affichés sont en minutes. Le temps de cycle est calculé en prenant la moyenne des temps des deux produits pour chaque tâche.
          </div>
        </div>
      </div>

      {/* Contenu de simulation */}
      <div className="lam-simulation-content">
        {/* Zone des tâches */}
        <div className="lam-tasks-zone">
          <h3>Tâches disponibles</h3>
          <div className="lam-tasks-container">
            {sortTasksByPredecessors(tasks).map(task => (
              <div
                key={task.id}
                className={`lam-task-block ${stationAssignments[task.id] ? 'assigned' : ''}`}
                draggable={!stationAssignments[task.id]}
                onDragStart={(e) => handleDragStart(e, task)}
                style={{
                  opacity: stationAssignments[task.id] ? 0.5 : 1,
                  cursor: stationAssignments[task.id] ? 'not-allowed' : 'grab'
                }}
              >
                <div className="lam-task-name">{task.name}</div>
                <div className="lam-task-times">
                  <span className="lam-time-a">{task.productA}min</span>
                  <span className="lam-time-b">{task.productB}min</span>
                </div>
                {task.predecessors.length > 0 && (
                  <div className="lam-task-predecessors">
                    Précédents: {task.predecessors.join(', ')}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Zone des postes de travail */}
        <div className="lam-stations-zone">
          <div className="lam-stations-header">
            <h3>Postes de travail</h3>
            <div className="lam-stations-controls">
              <button 
                className="lam-station-btn lam-remove-btn"
                onClick={removeStation}
                disabled={stations <= 1}
              >
                - Poste
              </button>
              <span className="lam-stations-count">{stations} postes</span>
              <button 
                className="lam-station-btn lam-add-btn"
                onClick={addStation}
              >
                + Poste
              </button>
            </div>
          </div>
          
          <div className="lam-stations-container">
            {Array.from({ length: stations }, (_, index) => {
              const stationId = index + 1;
              const stationTasks = Object.entries(stationAssignments)
                .filter(([_, sId]) => sId === stationId)
                .map(([taskId, _]) => tasks.find(t => t.id === parseInt(taskId)))
                .filter(Boolean);

              const stationTime = stationTasks.reduce((total, task) => 
                total + ((task.productA + task.productB) / 2), 0 // Moyenne des deux produits
              );

              return (
                <div
                  key={stationId}
                  className={`lam-station ${stationTime > CYCLE_TIME ? 'overloaded' : ''}`}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, stationId)}
                >
                  <div className="lam-station-header">
                    <h4>Poste {stationId}</h4>
                    <div className="lam-station-time">
                      {stationTime}/{CYCLE_TIME} min
                    </div>
                  </div>
                  <div className="lam-station-tasks">
                    {stationTasks.map(task => (
                      <div key={task.id} className="lam-station-task">
                        <div className="lam-station-task-name">{task.name}</div>
                        <div className="lam-station-task-times">
                          <span>A:{task.productA}</span>
                          <span>B:{task.productB}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Zone de validation */}
        <div className="lam-validation-zone">
          <h3>Évaluation</h3>
          <div className="lam-validation-buttons">
            <button className="lam-evaluate-btn" onClick={evaluateSolution}>
              Évaluer l'équilibrage
            </button>
            <button className="lam-reset-btn" onClick={resetSimulation}>
              Réinitialiser
            </button>
          </div>
        </div>

        {/* Zone des résultats */}
        {results && (
          <div className="lam-results-zone">
            <h3>Résultats de l'équilibrage</h3>
            <div className="lam-results-grid">
              <div className="lam-result-card">
                <h4>Métriques globales</h4>
                <div className="lam-metrics">
                  <div className="lam-metric">
                    <span className="lam-metric-label">Efficacité d'équilibrage:</span>
                    <span className="lam-metric-value">{results.balanceEfficiency}%</span>
                  </div>
                  <div className="lam-metric">
                    <span className="lam-metric-label">Temps max poste:</span>
                    <span className="lam-metric-value">{results.maxTime} min</span>
                  </div>
                  <div className="lam-metric">
                    <span className="lam-metric-label">Temps min poste:</span>
                    <span className="lam-metric-value">{results.minTime} min</span>
                  </div>
                  <div className="lam-metric">
                    <span className="lam-metric-label">Temps moyen:</span>
                    <span className="lam-metric-value">{results.avgTime.toFixed(1)} min</span>
                  </div>
                  <div className="lam-metric">
                    <span className="lam-metric-label">Violations cycle:</span>
                    <span className="lam-metric-value">{results.cycleTimeViolation}</span>
                  </div>
                  <div className="lam-metric">
                    <span className="lam-metric-label">Total postes:</span>
                    <span className="lam-metric-value">{results.totalStations}</span>
                  </div>
                </div>
              </div>
              
              <div className="lam-result-card">
                <h4>Détail par poste</h4>
                <div className="lam-stations-detail">
                  {Object.entries(results.stationTimes).map(([stationId, times]) => (
                    <div key={stationId} className="lam-station-detail">
                      <strong>Poste {stationId}:</strong>
                      <span>Produit A: {times.productA}min</span>
                      <span>Produit B: {times.productB}min</span>
                      <span>Moyenne: {((times.productA + times.productB) / 2).toFixed(1)}min</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LigneAssemblageMixteSimulation; 