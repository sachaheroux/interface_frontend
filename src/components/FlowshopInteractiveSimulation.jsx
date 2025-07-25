import React, { useState, useEffect } from 'react';
import './FlowshopInteractiveSimulation.css';

const JOB_COLORS = [
  '#3b82f6', // bleu
  '#10b981', // vert
  '#f59e42', // orange
  '#a78bfa', // violet
  '#ef4444', // rouge
  '#fbbf24', // jaune
];

const FlowshopInteractiveSimulation = () => {
  // Données du jeu fourni par l'utilisateur
  const initialJobs = [
    {
      id: 1,
      name: 'Smartphone Alpha',
      color: JOB_COLORS[0],
      tasks: [
        { machine: 0, duration: 8, name: 'M1:8' },
        { machine: 1, duration: 3, name: 'M2:3' },
        { machine: 2, duration: 2, name: 'M3:2' }
      ]
    },
    {
      id: 2,
      name: 'Smartphone Beta',
      color: JOB_COLORS[1],
      tasks: [
        { machine: 0, duration: 2, name: 'M1:2' },
        { machine: 1, duration: 7, name: 'M2:7' },
        { machine: 2, duration: 4, name: 'M3:4' }
      ]
    },
    {
      id: 3,
      name: 'Smartphone Gamma',
      color: JOB_COLORS[2],
      tasks: [
        { machine: 0, duration: 5, name: 'M1:5' },
        { machine: 1, duration: 4, name: 'M2:4' },
        { machine: 2, duration: 6, name: 'M3:6' }
      ]
    },
    {
      id: 4,
      name: 'Smartphone Delta',
      color: JOB_COLORS[3],
      tasks: [
        { machine: 0, duration: 3, name: 'M1:3' },
        { machine: 1, duration: 6, name: 'M2:6' },
        { machine: 2, duration: 3, name: 'M3:3' }
      ]
    }
  ];

  const [jobs, setJobs] = useState(initialJobs);
  const [machineNames] = useState(['M1', 'M2', 'M3']);
  // userSchedule = [{jobId, taskIndex, machine, start, duration, color, name}]
  const [userSchedule, setUserSchedule] = useState([]);
  const [draggedTask, setDraggedTask] = useState(null);
  const [dragOverSlot, setDragOverSlot] = useState(null);
  const [algorithmResults, setAlgorithmResults] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [userResult, setUserResult] = useState(null);

  useEffect(() => {
    calculateAlgorithmResults();
  }, []);

  const calculateAlgorithmResults = () => {
    // Simulation des résultats des algorithmes
    const results = {
      johnson: {
        makespan: 28,
        schedule: "Johnson: Beta → Delta → Gamma → Alpha"
      },
      spt: {
        makespan: 35,
        schedule: "SPT: Beta → Delta → Gamma → Alpha"
      },
      lpt: {
        makespan: 32,
        schedule: "LPT: Alpha → Gamma → Delta → Beta"
      }
    };
    setAlgorithmResults(results);
  };

  const evaluateUserSolution = () => {
    // Calculer le vrai makespan basé sur les tâches placées
    let maxMakespan = 0;
    
    // Pour chaque machine, trouver la fin de la dernière tâche
    machineNames.forEach((machine, machineIndex) => {
      const machineTasks = userSchedule.filter(t => t.machine === machineIndex);
      if (machineTasks.length > 0) {
        const machineMakespan = Math.max(...machineTasks.map(t => t.start + t.duration));
        maxMakespan = Math.max(maxMakespan, machineMakespan);
      }
    });

    const result = {
      makespan: maxMakespan,
      schedule: "Votre solution"
    };

    setUserResult(result);
    setShowResults(true);
    return result;
  };

  const resetSimulation = () => {
    setUserSchedule([]);
    setShowResults(false);
  };

  // Drag & Drop handlers
  const handleDragStart = (jobId, taskIndex) => {
    setDraggedTask({ jobId, taskIndex });
  };

  const handleDragStartFromGantt = (jobId, taskIndex) => {
    // Supprimer la tâche de l'emploi du temps avant de la redragger
    setUserSchedule(prev => prev.filter(t => !(t.jobId === jobId && t.taskIndex === taskIndex)));
    setDraggedTask({ jobId, taskIndex });
  };

  const handleDragOver = (machine, time) => {
    setDragOverSlot({ machine, time });
  };

  const handleDragLeave = () => {
    setDragOverSlot(null);
  };

  const handleDrop = (machine, time) => {
    if (!draggedTask) return;
    // Trouver le job et la tâche
    const job = jobs.find(j => j.id === draggedTask.jobId);
    const task = job.tasks[draggedTask.taskIndex];
    // Empêcher le drop sur une mauvaise machine
    if (machine !== task.machine) return;
    // Si ce n'est pas la première tâche du job, vérifier la fin de la tâche précédente
    if (draggedTask.taskIndex > 0) {
      const prevTaskIndex = draggedTask.taskIndex - 1;
      const prevTaskPlaced = userSchedule.find(
        t => t.jobId === job.id && t.taskIndex === prevTaskIndex
      );
      if (!prevTaskPlaced) return; // Tâche précédente non placée
      const prevTaskEnd = prevTaskPlaced.start + prevTaskPlaced.duration;
      if (time < prevTaskEnd) return; // Placement trop tôt
    }
    // Empêcher le drop si la plage est déjà occupée sur la machine
    const overlap = userSchedule.some(t =>
      t.machine === machine &&
      ((time >= t.start && time < t.start + t.duration) ||
       (time + task.duration - 1 >= t.start && time + task.duration - 1 < t.start + t.duration) ||
       (t.start >= time && t.start < time + task.duration))
    );
    if (overlap) return;
    // Ajouter la tâche à l'emploi du temps utilisateur
    setUserSchedule(prev => [
      ...prev,
      {
        jobId: job.id,
        taskIndex: draggedTask.taskIndex,
        machine,
        start: time,
        duration: task.duration,
        color: job.color,
        name: job.name + ' - ' + task.name
      }
    ]);
    setDraggedTask(null);
    setDragOverSlot(null);
  };

  // Vérifie si une tâche est déjà placée à cet endroit
  const getTaskAt = (machine, time) => {
    return userSchedule.find(
      t => t.machine === machine && time >= t.start && time < t.start + t.duration
    );
  };

  // Ajout d'une variable pour la longueur totale du Gantt (nombre de cases)
  const GANTT_LENGTH = 30;

  // Largeur fixe par case de temps
  const TIME_SLOT_WIDTH = 40; // pixels

  // Dans la zone Gantt, lors du drag, surligne toutes les cases cibles
  const isDroppable = (machineIdx, timeIdx) => {
    if (!draggedTask || !dragOverSlot) return false;
    const job = jobs.find(j => j.id === draggedTask.jobId);
    const task = job.tasks[draggedTask.taskIndex];
    // N'autorise le drop que sur la bonne machine
    if (machineIdx !== task.machine) return false;
    if (dragOverSlot.machine !== machineIdx) return false;
    // Si ce n'est pas la première tâche du job, vérifier la fin de la tâche précédente
    if (draggedTask.taskIndex > 0) {
      const prevTaskIndex = draggedTask.taskIndex - 1;
      const prevTaskPlaced = userSchedule.find(
        t => t.jobId === job.id && t.taskIndex === prevTaskIndex
      );
      if (!prevTaskPlaced) return false;
      const prevTaskEnd = prevTaskPlaced.start + prevTaskPlaced.duration;
      if (timeIdx < prevTaskEnd) return false;
    }
    // Empêcher le drop si la plage est déjà occupée sur la machine
    const overlap = userSchedule.some(t =>
      t.machine === machineIdx &&
      ((timeIdx >= t.start && timeIdx < t.start + t.duration) ||
       (timeIdx + task.duration - 1 >= t.start && timeIdx + task.duration - 1 < t.start + t.duration) ||
       (t.start >= timeIdx && t.start < timeIdx + task.duration))
    );
    if (overlap) return false;
    // Surligne la plage de temps correspondant à la durée de la tâche
    return (
      timeIdx >= dragOverSlot.time &&
      timeIdx < dragOverSlot.time + task.duration
    );
  };

  return (
    <div className="flowshop-simulation">
      {/* Contexte d'usine */}
      <div className="flowshop-factory-context">
        <h2>Contexte de la simulation</h2>
        <div className="flowshop-context-block">
          <p>
            Vous êtes responsable de la production dans une usine de fabrication de smartphones haut de gamme. L'usine produit différents modèles selon les commandes des opérateurs téléphoniques.<br/><br/>
            L'objectif est d'optimiser l'ordonnancement pour minimiser le makespan (temps total de production). Dans le Flowshop, tous les produits suivent la même séquence de machines.
          </p>
          <div className="flowshop-context-mission">
            <strong>Votre mission</strong><br/>
            Optimisez l'ordonnancement pour minimiser le makespan (temps total de production).
          </div>
          <div className="flowshop-context-ressources">
            <strong>Ressources disponibles</strong>
            <ul>
              <li><b>M1</b> : Assemblage de la carte mère et processeur</li>
              <li><b>M2</b> : Installation de l'écran et des composants tactiles</li>
              <li><b>M3</b> : Tests qualité et packaging final</li>
            </ul>
          </div>
          <div className="flowshop-context-jobs">
            <strong>Smartphones à planifier</strong>
            <div className="flowshop-context-table-wrapper">
              <table className="flowshop-context-table">
                <thead>
                  <tr>
                    <th>Smartphone</th>
                    <th>Séquence des opérations</th>
                    <th>Durées (h)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td>Alpha</td><td>M1 → M2 → M3</td><td>8 → 3 → 2</td></tr>
                  <tr><td>Beta</td><td>M1 → M2 → M3</td><td>2 → 7 → 4</td></tr>
                  <tr><td>Gamma</td><td>M1 → M2 → M3</td><td>5 → 4 → 6</td></tr>
                  <tr><td>Delta</td><td>M1 → M2 → M3</td><td>3 → 6 → 3</td></tr>
                </tbody>
              </table>
            </div>
            <div className="flowshop-context-note">
              <em>Remarque : Dans le Flowshop, tous les produits suivent la même séquence M1 → M2 → M3. L'ordre de passage des produits peut influencer le makespan total.</em>
            </div>
          </div>
          <div className="flowshop-context-defi">
            <strong>Défi</strong><br/>
            Glissez-déposez les tâches dans le diagramme de Gantt pour créer un ordonnancement qui minimise le makespan.<br/>
            Essayez de faire mieux que les algorithmes classiques (Johnson, SPT, LPT) !
          </div>
        </div>
      </div>

      <div className="flowshop-simulation-content">
        {/* Zone des jobs en format compact */}
        <div className="flowshop-jobs-compact-zone">
          <h3>📱 Smartphones à produire</h3>
          <div className="flowshop-jobs-compact-container">
            {jobs.map((job, jobIdx) => (
              <div key={job.id} className="flowshop-job-compact-row">
                <div className="flowshop-job-info">
                  <span className="flowshop-job-name">{job.name}</span>
                  <span className="flowshop-job-due">Séquence: M1 → M2 → M3</span>
                </div>
                <div className="flowshop-job-tasks-compact">
                  {job.tasks.map((task, index) => {
                    // Vérifier si la tâche a déjà été placée
                    const alreadyPlaced = userSchedule.some(
                      t => t.jobId === job.id && t.taskIndex === index
                    );
                    if (alreadyPlaced) return null;
                    return (
                      <div
                        key={index}
                        className="flowshop-task-block-compact"
                        style={{
                          background: job.color,
                          opacity: draggedTask && draggedTask.jobId === job.id && draggedTask.taskIndex === index ? 0.6 : 1,
                          width: `${task.duration * TIME_SLOT_WIDTH}px`,
                          height: '30px',
                          display: 'inline-block',
                          boxSizing: 'border-box',
                          margin: '0 2px',
                          borderRadius: '4px',
                          color: 'white',
                          fontSize: '11px',
                          padding: '0 4px',
                          textAlign: 'center',
                          lineHeight: '30px',
                          cursor: 'grab'
                        }}
                        draggable
                        onDragStart={() => handleDragStart(job.id, index)}
                      >
                        {task.name}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Zone de Gantt */}
        <div className="flowshop-gantt-zone">
          <h3>📊 Planning de production</h3>
          <div className="flowshop-gantt-container" style={{ overflow: 'visible' }}>
            <div className="flowshop-gantt-header">
              <div className="flowshop-machine-label">Machine</div>
              <div className="flowshop-time-labels-container" style={{ display: 'flex', position: 'relative', height: '30px' }}>
                {Array.from({ length: GANTT_LENGTH }, (_, time) => (
                  <div 
                    key={time} 
                    className="flowshop-time-label" 
                    style={{ 
                      position: 'absolute',
                      left: `${time * TIME_SLOT_WIDTH}px`,
                      fontSize: '12px',
                      fontWeight: '500',
                      color: '#333',
                      textAlign: 'center',
                      width: '20px',
                      marginLeft: '-10px'
                    }}
                  >
                    {time}
                    <div style={{
                      position: 'absolute',
                      bottom: '-15px',
                      left: '50%',
                      width: '1px',
                      height: '15px',
                      backgroundColor: '#999',
                      transform: 'translateX(-50%)'
                    }}></div>
                  </div>
                ))}
              </div>
            </div>
            
            {machineNames.map((machine, machineIndex) => (
              <div key={machineIndex} className="flowshop-machine-row">
                <div className="flowshop-machine-name">{machine}</div>
                <div className="flowshop-machine-timeline" style={{ overflow: 'visible' }}>
                  {Array.from({ length: GANTT_LENGTH }, (_, time) => {
                    const placedTask = getTaskAt(machineIndex, time);
                    // Détermine si la case est survolée pendant un drag
                    const isDragOver = draggedTask && dragOverSlot && dragOverSlot.machine === machineIndex && dragOverSlot.time === time;
                    // Peut-on drop ici ?
                    const canDrop = isDroppable(machineIndex, time);
                    return (
                      <div
                        key={time}
                        className={`flowshop-time-slot${canDrop ? ' droppable' : ''}${isDragOver && !canDrop ? ' not-droppable' : ''}`}
                        style={{ 
                          position: 'relative',
                          width: `${TIME_SLOT_WIDTH}px`,
                          height: '40px',
                          border: '1px solid #ddd',
                          display: 'inline-block',
                          boxSizing: 'border-box',
                          overflow: 'visible'
                        }}
                        onDragOver={e => { e.preventDefault(); handleDragOver(machineIndex, time); }}
                        onDragLeave={handleDragLeave}
                        onDrop={() => handleDrop(machineIndex, time)}
                      >
                        {/* Affichage du bloc si la tâche commence à ce temps */}
                        {placedTask && placedTask.start === time && (
                          <div
                            className="flowshop-gantt-task-block"
                            style={{
                              background: placedTask.color,
                              width: `${placedTask.duration * TIME_SLOT_WIDTH}px`,
                              height: '36px',
                              left: 0,
                              top: '2px',
                              color: 'white',
                              borderRadius: 4,
                              fontSize: 12,
                              padding: '0 4px',
                              position: 'absolute',
                              zIndex: 2,
                              display: 'inline-block',
                              boxSizing: 'border-box',
                              margin: '0px',
                              textAlign: 'center',
                              lineHeight: '36px',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              cursor: 'grab'
                            }}
                            draggable
                            onDragStart={() => handleDragStartFromGantt(placedTask.jobId, placedTask.taskIndex)}
                          >
                            {placedTask.name}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Zone de validation */}
        <div className="flowshop-validation-zone">
          <h3>✅ Évaluation</h3>
          <div className="flowshop-validation-buttons">
            <button 
              className="flowshop-evaluate-btn"
              onClick={evaluateUserSolution}
            >
              Évaluer ma solution
            </button>
            <button 
              className="flowshop-reset-btn"
              onClick={resetSimulation}
            >
              Recommencer
            </button>
          </div>
        </div>

        {/* Résultats */}
        {showResults && (
          <div className="flowshop-results-zone">
            <h3>🏆 Votre solution</h3>
            <div className="flowshop-results-grid">
              <div className="flowshop-result-card user">
                <h4>Votre solution</h4>
                <div className="flowshop-metrics">
                  <div className="flowshop-metric">
                    <span className="flowshop-metric-label">Makespan:</span>
                    <span className="flowshop-metric-value">{userResult ? userResult.makespan : 0}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FlowshopInteractiveSimulation; 