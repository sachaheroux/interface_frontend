import React, { useState, useEffect } from 'react';
import './JobshopInteractiveSimulation.css';

const JobshopInteractiveSimulation = () => {
  // Données du jeu fourni par l'utilisateur
  const initialJobs = [
    {
      id: 1,
      name: 'Job 1',
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
  const [userSchedule, setUserSchedule] = useState([]);
  const [algorithmResults, setAlgorithmResults] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  // Calcul des résultats des algorithmes
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
    // Simulation du calcul des performances de la solution utilisateur
    const userResult = {
      makespan: 22, // Exemple
      totalDelay: 8, // Exemple
      flowtime: 15.5, // Exemple
      schedule: "Votre solution"
    };

    setShowResults(true);
    return userResult;
  };

  const resetSimulation = () => {
    setUserSchedule([]);
    setShowResults(false);
    setCurrentStep(0);
  };

  return (
    <div className="jobshop-simulation">
      <div className="simulation-header">
        <h1>🎮 Simulation Interactive Jobshop</h1>
        <p className="simulation-description">
          Ordonnancez manuellement les tâches pour essayer de battre les performances des algorithmes classiques !
        </p>
      </div>

      <div className="simulation-content">
        {/* Zone des tâches disponibles */}
        <div className="tasks-zone">
          <h3>📦 Tâches disponibles</h3>
          <div className="tasks-container">
            {jobs.map(job => (
              <div key={job.id} className="job-tasks">
                <h4>{job.name} (Due: {job.dueDate})</h4>
                <div className="task-blocks">
                  {job.tasks.map((task, index) => (
                    <div 
                      key={index}
                      className="task-block"
                      draggable
                      data-job-id={job.id}
                      data-task-index={index}
                    >
                      {task.name}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Zone de Gantt */}
        <div className="gantt-zone">
          <h3>📊 Diagramme de Gantt</h3>
          <div className="gantt-container">
            <div className="gantt-header">
              <div className="machine-label">Machine</div>
              {Array.from({ length: 30 }, (_, i) => (
                <div key={i} className="time-label">{i}</div>
              ))}
            </div>
            {machineNames.map((machine, machineIndex) => (
              <div key={machineIndex} className="machine-row">
                <div className="machine-name">{machine}</div>
                <div className="machine-timeline">
                  {Array.from({ length: 30 }, (_, time) => (
                    <div key={time} className="time-slot" data-machine={machineIndex} data-time={time}>
                      {/* Les tâches placées par l'utilisateur apparaîtront ici */}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Zone de validation */}
        <div className="validation-zone">
          <h3>✅ Évaluation</h3>
          <div className="validation-buttons">
            <button 
              className="evaluate-btn"
              onClick={evaluateUserSolution}
            >
              Évaluer ma solution
            </button>
            <button 
              className="reset-btn"
              onClick={resetSimulation}
            >
              Recommencer
            </button>
          </div>
        </div>

        {/* Résultats */}
        {showResults && (
          <div className="results-zone">
            <h3>🏆 Comparaison des performances</h3>
            <div className="results-grid">
              <div className="result-card user">
                <h4>Votre solution</h4>
                <div className="metrics">
                  <div className="metric">
                    <span className="metric-label">Makespan:</span>
                    <span className="metric-value">22</span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">Retard total:</span>
                    <span className="metric-value">8</span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">Flowtime moyen:</span>
                    <span className="metric-value">15.5</span>
                  </div>
                </div>
              </div>

              {algorithmResults && (
                <>
                  <div className="result-card algorithm">
                    <h4>Algorithme SPT</h4>
                    <div className="metrics">
                      <div className="metric">
                        <span className="metric-label">Makespan:</span>
                        <span className="metric-value">{algorithmResults.spt.makespan}</span>
                      </div>
                      <div className="metric">
                        <span className="metric-label">Retard total:</span>
                        <span className="metric-value">{algorithmResults.spt.totalDelay}</span>
                      </div>
                      <div className="metric">
                        <span className="metric-label">Flowtime moyen:</span>
                        <span className="metric-value">{algorithmResults.spt.flowtime}</span>
                      </div>
                    </div>
                  </div>

                  <div className="result-card algorithm">
                    <h4>Algorithme EDD</h4>
                    <div className="metrics">
                      <div className="metric">
                        <span className="metric-label">Makespan:</span>
                        <span className="metric-value">{algorithmResults.edd.makespan}</span>
                      </div>
                      <div className="metric">
                        <span className="metric-label">Retard total:</span>
                        <span className="metric-value">{algorithmResults.edd.totalDelay}</span>
                      </div>
                      <div className="metric">
                        <span className="metric-label">Flowtime moyen:</span>
                        <span className="metric-value">{algorithmResults.edd.flowtime}</span>
                      </div>
                    </div>
                  </div>

                  <div className="result-card algorithm">
                    <h4>Programmation par Contraintes</h4>
                    <div className="metrics">
                      <div className="metric">
                        <span className="metric-label">Makespan:</span>
                        <span className="metric-value">{algorithmResults.cp.makespan}</span>
                      </div>
                      <div className="metric">
                        <span className="metric-label">Retard total:</span>
                        <span className="metric-value">{algorithmResults.cp.totalDelay}</span>
                      </div>
                      <div className="metric">
                        <span className="metric-label">Flowtime moyen:</span>
                        <span className="metric-value">{algorithmResults.cp.flowtime}</span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobshopInteractiveSimulation; 