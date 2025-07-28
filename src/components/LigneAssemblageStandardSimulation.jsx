import React, { useState, useEffect } from 'react';
import './LigneAssemblageStandardSimulation.css';

const LigneAssemblageStandardSimulation = () => {
  // Couleurs pour les produits
  const PRODUCT_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];
  
  // Configuration initiale
  const CYCLE_TIME = 70; // Temps de cycle maximum en secondes (adapté aux nouvelles tâches)
  const INITIAL_STATIONS = 4; // Nombre initial de postes
  
  // Tâches d'assemblage basées sur un cas réel - Prédécesseurs variés pour créer un défi
  const initialTasks = [
    { id: 1, name: 'Insérer l\'essieu et les roues', time: 20, predecessors: [] },
    { id: 2, name: 'Insérer la tige de ventilateur', time: 6, predecessors: [1] },
    { id: 3, name: 'Insérer capot tige de vent.', time: 5, predecessors: [2] },
    { id: 4, name: 'Insérer essieu arrière et roues', time: 21, predecessors: [] },
    { id: 5, name: 'Insérer capot sur châssis', time: 8, predecessors: [] },
    { id: 6, name: 'Coller fenêtres au-dessus', time: 35, predecessors: [] },
    { id: 7, name: 'Insérer transmission', time: 15, predecessors: [3, 4] },
    { id: 8, name: 'Insérer entretoises de transmission', time: 10, predecessors: [7] },
    { id: 9, name: 'Sécuriser les roues avant', time: 15, predecessors: [5, 8] },
    { id: 10, name: 'Insérer moteur', time: 5, predecessors: [3] },
    { id: 11, name: 'Attacher dessus sur châssis', time: 46, predecessors: [6, 9, 10] },
    { id: 12, name: 'Ajouter les collants', time: 16, predecessors: [11] }
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
      stationTimes[i] = 0;
      stationTasks[i] = [];
    }
    
    // Calculer les temps par poste
    Object.entries(stationAssignments).forEach(([taskId, stationId]) => {
      const task = tasks.find(t => t.id === parseInt(taskId));
      if (task && stationId) {
        stationTimes[stationId] += task.time;
        stationTasks[stationId].push(task);
      }
    });
    
    // Calculer les métriques
    const times = Object.values(stationTimes);
    const maxTime = Math.max(...times);
    const minTime = Math.min(...times);
    const avgTime = times.reduce((sum, time) => sum + time, 0) / times.length;
    
    // Calcul de l'efficacité d'équilibrage : (temps total des tâches / temps total de la ligne) × 100
    const totalTaskTime = times.reduce((sum, time) => sum + time, 0);
    const totalLineTime = stations * CYCLE_TIME;
    const balanceEfficiency = ((totalTaskTime / totalLineTime) * 100).toFixed(1);
    const cycleTimeViolation = times.filter(time => time > CYCLE_TIME).length;
    
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
      return total + task.time;
    }, 0);

    const newTaskTime = draggedTask.time;
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
        <h2>Contexte de la simulation</h2>
        <div className="lam-context-block">
          <p>
            Vous êtes responsable de l'optimisation d'une ligne d'assemblage automobile dans une usine de production moderne. La ligne assemble un modèle unique de véhicule avec des étapes d'assemblage spécifiques qui doivent respecter des contraintes de précédence.<br/><br/>
            L'objectif est d'équilibrer la charge de travail entre les différentes stations pour maximiser l'efficacité de la ligne et minimiser les temps d'attente entre les postes de travail.
          </p>

          <div className="lam-context-jobs">
            <strong>Étapes d'assemblage automobile</strong>
            <div className="lam-context-table-wrapper">
              <table className="lam-context-table">
                <thead>
                  <tr>
                    <th>Étape</th>
                    <th>Opération</th>
                    <th>Durée (sec)</th>
                    <th>Prédécesseurs</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td>1</td><td>Insérer l'essieu et les roues</td><td>20</td><td>-</td></tr>
                  <tr><td>2</td><td>Insérer la tige de ventilateur</td><td>6</td><td>1</td></tr>
                  <tr><td>3</td><td>Insérer capot tige de vent.</td><td>5</td><td>2</td></tr>
                  <tr><td>4</td><td>Insérer essieu arrière et roues</td><td>21</td><td>-</td></tr>
                  <tr><td>5</td><td>Insérer capot sur châssis</td><td>8</td><td>-</td></tr>
                  <tr><td>6</td><td>Coller fenêtres au-dessus</td><td>35</td><td>-</td></tr>
                  <tr><td>7</td><td>Insérer transmission</td><td>15</td><td>3,4</td></tr>
                  <tr><td>8</td><td>Insérer entretoises de transmission</td><td>10</td><td>7</td></tr>
                  <tr><td>9</td><td>Sécuriser les roues avant</td><td>15</td><td>5,8</td></tr>
                  <tr><td>10</td><td>Insérer moteur</td><td>5</td><td>3</td></tr>
                  <tr><td>11</td><td>Attacher dessus sur châssis</td><td>46</td><td>6,9,10</td></tr>
                  <tr><td>12</td><td>Ajouter les collants</td><td>16</td><td>11</td></tr>
                </tbody>
              </table>
            </div>
          </div>
          <div className="lam-context-defi">
            <strong>Défi</strong><br/>
            Glissez-déposez les tâches vers les stations pour créer un équilibrage optimal de la ligne d'assemblage.<br/>
            Temps de cycle maximum : <strong>{CYCLE_TIME} secondes</strong><br/>
            Essayez de minimiser le nombre de stations tout en respectant le temps de cycle maximum !
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
                  <span className="lam-time">{task.time}sec</span>
                </div>
                <div className="lam-task-predecessors">
                  {task.predecessors.length > 0 ? `Précédents: ${task.predecessors.join(', ')}` : ''}
                </div>
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
                total + task.time, 0
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
                      {stationTime}/{CYCLE_TIME} sec
                    </div>
                  </div>
                  <div className="lam-station-tasks">
                    {stationTasks.map(task => (
                      <div key={task.id} className="lam-station-task">
                        <div className="lam-station-task-name">{task.name}</div>
                        <div className="lam-station-task-times">
                          <span>{task.time}sec</span>
                        </div>
                        <div className="lam-task-predecessors">
                          {task.predecessors.length > 0 ? `Précédents: ${task.predecessors.join(', ')}` : ''}
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
                  {Object.entries(results.stationTimes).map(([stationId, time]) => (
                    <div key={stationId} className="lam-station-detail">
                      <strong>Poste {stationId}:</strong>
                      <span>{time}min</span>
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

export default LigneAssemblageStandardSimulation; 