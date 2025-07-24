import React, { useState, useEffect } from 'react';
import './JobshopInteractiveSimulation.css';

const JOB_COLORS = [
  '#3b82f6', // bleu
  '#10b981', // vert
  '#f59e42', // orange
  '#a78bfa', // violet
  '#ef4444', // rouge
  '#fbbf24', // jaune
];

const JobshopInteractiveSimulation = () => {
  // Données du jeu fourni par l'utilisateur
  const initialJobs = [
    {
      id: 1,
      name: 'Job 1',
      color: JOB_COLORS[0],
      tasks: [
        { machine: 0, duration: 9, name: 'M1:9' },
        { machine: 1, duration: 1, name: 'M2:1' },
        { machine: 2, duration: 2, name: 'M3:2' }
      ],
      dueDate: 12
    },
    {
      id: 2,
      name: 'Job 2',
      color: JOB_COLORS[1],
      tasks: [
        { machine: 0, duration: 3, name: 'M1:3' },
        { machine: 2, duration: 5, name: 'M3:5' },
        { machine: 1, duration: 6, name: 'M2:6' }
      ],
      dueDate: 14
    },
    {
      id: 3,
      name: 'Job 3',
      color: JOB_COLORS[2],
      tasks: [
        { machine: 0, duration: 2, name: 'M1:2' },
        { machine: 1, duration: 7, name: 'M2:7' },
        { machine: 0, duration: 6, name: 'M1:6' }
      ],
      dueDate: 17
    },
    {
      id: 4,
      name: 'Job 4',
      color: JOB_COLORS[3],
      tasks: [
        { machine: 1, duration: 5, name: 'M2:5' },
        { machine: 0, duration: 3, name: 'M1:3' },
        { machine: 2, duration: 4, name: 'M3:4' }
      ],
      dueDate: 25
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
  const [currentStep, setCurrentStep] = useState(0);
  const [userResult, setUserResult] = useState(null);

  useEffect(() => {
    calculateAlgorithmResults();
  }, []);

  const calculateAlgorithmResults = () => {
    // Simulation des résultats des algorithmes
    const results = {
      spt: {
        makespan: 28,
        totalDelay: 15,
        flowtime: 18.5,
        schedule: "SPT: J1 → J2 → J3 → J4"
      },
      edd: {
        makespan: 26,
        totalDelay: 12,
        flowtime: 17.2,
        schedule: "EDD: J1 → J2 → J3 → J4"
      },
      cp: {
        makespan: 24,
        totalDelay: 18,
        flowtime: 19.8,
        schedule: "CP: J2 → J1 → J4 → J3"
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

    // Calculer le retard total
    let totalDelay = 0;
    jobs.forEach(job => {
      const jobTasks = userSchedule.filter(t => t.jobId === job.id);
      if (jobTasks.length > 0) {
        const jobEndTime = Math.max(...jobTasks.map(t => t.start + t.duration));
        const delay = Math.max(0, jobEndTime - job.dueDate);
        totalDelay += delay;
      }
    });

    // Calculer le flowtime moyen (somme des temps de fin de chaque job)
    let totalFlowtime = 0;
    let completedJobs = 0;
    jobs.forEach(job => {
      const jobTasks = userSchedule.filter(t => t.jobId === job.id);
      if (jobTasks.length === job.tasks.length) { // Job completé
        const jobEndTime = Math.max(...jobTasks.map(t => t.start + t.duration));
        totalFlowtime += jobEndTime;
        completedJobs++;
      }
    });
    const avgFlowtime = completedJobs > 0 ? totalFlowtime / completedJobs : 0;

    const result = {
      makespan: maxMakespan,
      totalDelay: totalDelay,
      flowtime: avgFlowtime,
      schedule: "Votre solution"
    };

    setUserResult(result);
    setShowResults(true);
    return result;
  };

  const resetSimulation = () => {
    setUserSchedule([]);
    setShowResults(false);
    setCurrentStep(0);
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

  // Fonction pour déterminer la couleur de la ligne sous chaque unité de temps
  const getTimeLineColor = (time) => {
    // Couleurs des jobs selon leurs dates dues
    const dueDateColors = {
      12: '#3b82f6', // bleu pour Job 1 (due date 12)
      14: '#10b981', // vert pour Job 2 (due date 14)
      17: '#f59e42', // orange pour Job 3 (due date 17)
      25: '#a78bfa'  // mauve pour Job 4 (due date 25)
    };
    
    return dueDateColors[time] || '#999'; // gris par défaut si pas de date due
  };

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
    <div className="jobshop-simulation">
      {/* Contexte d'usine */}
      <div className="jobshop-factory-context">
        <h2>Contexte de la simulation</h2>
        <div className="jobshop-context-block">
          <p>
            Vous êtes responsable de la production dans une usine d'assemblage de robots de service haut de gamme, destinés à des clients exigeants des secteurs de la santé, de l'hôtellerie et de la logistique.<br/><br/>
            Suite à des imprévus (pannes, changements de spécifications, réorganisations), le planning de production est menacé. Les robots en cours de fabrication doivent être livrés rapidement, et chaque heure de retard impacte la réputation de l'usine.
          </p>
          <div className="jobshop-context-mission">
            <strong>Votre mission</strong><br/>
            Réorganisez la planification de fin de production pour limiter les retards et préserver la confiance des clients.
          </div>
          <div className="jobshop-context-ressources">
            <strong>Ressources disponibles</strong>
            <ul>
              <li><b>M1</b> : Assemblage de base (châssis, moteurs)</li>
              <li><b>M2</b> : Calibration des capteurs et tests de précision</li>
              <li><b>M3</b> : Programmation finale et essais fonctionnels</li>
            </ul>
          </div>
          <div className="jobshop-context-jobs">
            <strong>Robots à planifier</strong>
            <div className="jobshop-context-table-wrapper">
              <table className="jobshop-context-table">
                <thead>
                  <tr>
                    <th>Robot</th>
                    <th>Séquence des opérations</th>
                    <th>Durées (h)</th>
                    <th>Date due</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td>J1</td><td>M1 → M2 → M3</td><td>9 → 2 → 1</td><td>12</td></tr>
                  <tr><td>J2</td><td>M1 → M3 → M2</td><td>3 → 5 → 6</td><td>14</td></tr>
                  <tr><td>J3</td><td>M1 → M2 → M1</td><td>2 → 7 → 6</td><td>17</td></tr>
                  <tr><td>J4</td><td>M2 → M1 → M3</td><td>5 → 3 → 4</td><td>25</td></tr>
                </tbody>
              </table>
            </div>
            <div className="jobshop-context-note">
              <em>Remarque : J3 retourne à M1 en fin de parcours pour un ajustement mécanique spécifique (bras articulés). Chaque robot est un prototype, d'où l'ordre varié des opérations.</em>
            </div>
          </div>
          <div className="jobshop-context-defi">
            <strong>Défi</strong><br/>
            Glissez-déposez les tâches dans le diagramme de Gantt pour créer un ordonnancement réaliste qui respecte au mieux les contraintes.<br/>
            Essayez de minimiser le retard total ou le nombre de robots en retard.<br/>
            Saurez-vous faire mieux que les algorithmes vus en classe ?
          </div>
        </div>
      </div>

      <div className="jobshop-simulation-content">
        {/* Zone des jobs en format compact */}
        <div className="jobshop-jobs-compact-zone">
          <h3>📋 Commandes reçues</h3>
          <div className="jobshop-jobs-compact-container">
            {jobs.map((job, jobIdx) => (
              <div key={job.id} className="jobshop-job-compact-row">
                <div className="jobshop-job-info">
                  <span className="jobshop-job-name">{job.name}</span>
                  <span className="jobshop-job-due">Date due: {job.dueDate}</span>
                </div>
                <div className="jobshop-job-tasks-compact">
                  {job.tasks.map((task, index) => {
                    // Vérifier si la tâche a déjà été placée
                    const alreadyPlaced = userSchedule.some(
                      t => t.jobId === job.id && t.taskIndex === index
                    );
                    if (alreadyPlaced) return null;
                    return (
                      <div
                        key={index}
                        className="jobshop-task-block-compact"
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
        <div className="jobshop-gantt-zone">
          <h3>📊 Planning de production</h3>
          <div className="jobshop-gantt-container" style={{ overflow: 'visible' }}>
            <div className="jobshop-gantt-header">
              <div className="jobshop-machine-label">Machine</div>
              <div className="jobshop-time-labels-container" style={{ display: 'flex', position: 'relative', height: '30px' }}>
                {Array.from({ length: GANTT_LENGTH }, (_, time) => (
                  <div 
                    key={time} 
                    className="jobshop-time-label" 
                    style={{ 
                      position: 'absolute',
                      left: `${time * TIME_SLOT_WIDTH}px`,
                      fontSize: '12px',
                      fontWeight: '500',
                      color: getTimeLineColor(time),
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
                      width: '2px',
                      height: '15px',
                      backgroundColor: getTimeLineColor(time),
                      transform: 'translateX(-50%)'
                    }}></div>
                  </div>
                ))}
              </div>
            </div>
            
            {machineNames.map((machine, machineIndex) => (
              <div key={machineIndex} className="jobshop-machine-row">
                <div className="jobshop-machine-name">{machine}</div>
                <div className="jobshop-machine-timeline" style={{ overflow: 'visible' }}>
                  {Array.from({ length: GANTT_LENGTH }, (_, time) => {
                    const placedTask = getTaskAt(machineIndex, time);
                    // Détermine si la case est survolée pendant un drag
                    const isDragOver = draggedTask && dragOverSlot && dragOverSlot.machine === machineIndex && dragOverSlot.time === time;
                    // Peut-on drop ici ?
                    const canDrop = isDroppable(machineIndex, time);
                    return (
                      <div
                        key={time}
                        className={`jobshop-time-slot${canDrop ? ' droppable' : ''}${isDragOver && !canDrop ? ' not-droppable' : ''}`}
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
                            className="jobshop-gantt-task-block"
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
        <div className="jobshop-validation-zone">
          <h3>✅ Évaluation</h3>
          <div className="jobshop-validation-buttons">
            <button 
              className="jobshop-evaluate-btn"
              onClick={evaluateUserSolution}
            >
              Évaluer ma solution
            </button>
            <button 
              className="jobshop-reset-btn"
              onClick={resetSimulation}
            >
              Recommencer
            </button>
          </div>
        </div>

        {/* Résultats */}
        {showResults && (
          <div className="jobshop-results-zone">
            <h3>🏆 Votre solution</h3>
            <div className="jobshop-results-grid">
              <div className="jobshop-result-card user">
                <h4>Votre solution</h4>
                <div className="jobshop-metrics">
                  <div className="jobshop-metric">
                    <span className="jobshop-metric-label">Makespan:</span>
                    <span className="jobshop-metric-value">{userResult ? userResult.makespan : 0}</span>
                  </div>
                  <div className="jobshop-metric">
                    <span className="jobshop-metric-label">Retard total:</span>
                    <span className="jobshop-metric-value">{userResult ? userResult.totalDelay : 0}</span>
                  </div>
                  <div className="jobshop-metric">
                    <span className="jobshop-metric-label">Flowtime moyen:</span>
                    <span className="jobshop-metric-value">{userResult ? userResult.flowtime.toFixed(1) : 0}</span>
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

export default JobshopInteractiveSimulation; 