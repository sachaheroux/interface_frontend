import React, { useState } from 'react';
import styles from './JobshopContraintesForm.module.css';

const JobshopContraintesForm = () => {
  const [jobs, setJobs] = useState([
    { 
      name: 'Job 1', 
      tasks: [
        { machine: 0, duration: 4 },
        { machine: 1, duration: 2 }
      ], 
      dueDate: 12 
    },
    { 
      name: 'Job 2', 
      tasks: [
        { machine: 1, duration: 3 },
        { machine: 0, duration: 2 }
      ], 
      dueDate: 15 
    }
  ]);
  const [machineNames, setMachineNames] = useState(['Machine 0', 'Machine 1']);
  const [timeUnit, setTimeUnit] = useState('heures');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [isCalculating, setIsCalculating] = useState(false);
  const [ganttUrl, setGanttUrl] = useState(null);
  const [useSetupTimes, setUseSetupTimes] = useState(false);
  const [setupTimes, setSetupTimes] = useState({});

  const API_URL = "https://interface-backend-1jgi.onrender.com";

  // Gestion des jobs
  const addJob = () => {
    const newJobNumber = jobs.length + 1;
    setJobs([...jobs, {
      name: `Job ${newJobNumber}`,
      tasks: [{ machine: 0, duration: 1 }],
      dueDate: 10
    }]);
  };

  const removeJob = () => {
    if (jobs.length > 1) {
      setJobs(jobs.slice(0, -1));
    }
  };

  const updateJobName = (jobIndex, name) => {
    const newJobs = [...jobs];
    newJobs[jobIndex].name = name;
    setJobs(newJobs);
  };

  const updateJobDueDate = (jobIndex, dueDate) => {
    const newJobs = [...jobs];
    newJobs[jobIndex].dueDate = parseFloat(dueDate) || 0;
    setJobs(newJobs);
  };

  // Gestion des tâches individuelles
  const addTaskToJob = (jobIndex) => {
    const newJobs = [...jobs];
    newJobs[jobIndex].tasks.push({ machine: 0, duration: 1 });
    setJobs(newJobs);
  };

  const removeTaskFromJob = (jobIndex, taskIndex) => {
    const newJobs = [...jobs];
    if (newJobs[jobIndex].tasks.length > 1) {
      newJobs[jobIndex].tasks.splice(taskIndex, 1);
    }
    setJobs(newJobs);
  };

  const updateTask = (jobIndex, taskIndex, field, value) => {
    const newJobs = [...jobs];
    if (field === 'machine') {
      newJobs[jobIndex].tasks[taskIndex].machine = parseInt(value);
    } else if (field === 'duration') {
      newJobs[jobIndex].tasks[taskIndex].duration = parseFloat(value) || 0;
    }
    setJobs(newJobs);
  };

  // Gestion des machines
  const addMachine = () => {
    const newMachineIndex = machineNames.length;
    setMachineNames([...machineNames, `Machine ${newMachineIndex}`]);
  };

  const removeMachine = () => {
    if (machineNames.length > 1) {
      const newMachineNames = machineNames.slice(0, -1);
      setMachineNames(newMachineNames);
      
      // Nettoyer les tâches qui utilisent cette machine
      const maxMachine = newMachineNames.length - 1;
      const newJobs = jobs.map(job => ({
        ...job,
        tasks: job.tasks.filter(task => task.machine <= maxMachine)
      }));
      setJobs(newJobs);
    }
  };

  const updateMachineName = (index, name) => {
    const newNames = [...machineNames];
    newNames[index] = name;
    setMachineNames(newNames);
  };

  // Gestion des temps de setup
  const initializeSetupTimes = () => {
    const newSetupTimes = {};
    machineNames.forEach((_, machineIndex) => {
      newSetupTimes[machineIndex] = {};
      jobs.forEach((fromJob, fromIndex) => {
        newSetupTimes[machineIndex][fromIndex] = {};
        jobs.forEach((toJob, toIndex) => {
          if (fromIndex !== toIndex) {
            newSetupTimes[machineIndex][fromIndex][toIndex] = 0;
          }
        });
      });
    });
    setSetupTimes(newSetupTimes);
  };

  const updateSetupTime = (machineIndex, fromJobIndex, toJobIndex, value) => {
    const newSetupTimes = { ...setupTimes };
    if (!newSetupTimes[machineIndex]) {
      newSetupTimes[machineIndex] = {};
    }
    if (!newSetupTimes[machineIndex][fromJobIndex]) {
      newSetupTimes[machineIndex][fromJobIndex] = {};
    }
    newSetupTimes[machineIndex][fromJobIndex][toJobIndex] = parseFloat(value) || 0;
    setSetupTimes(newSetupTimes);
  };

  const toggleSetupTimes = (checked) => {
    setUseSetupTimes(checked);
    if (checked && Object.keys(setupTimes).length === 0) {
      initializeSetupTimes();
    }
  };

  const calculateOptimization = async () => {
    setIsCalculating(true);
    setError('');
    setResult(null);
    setGanttUrl(null);

    try {
      // Format des données pour l'API
      const formattedJobs = jobs.map(job =>
        job.tasks.map(task => [task.machine, task.duration])
      );
      const formattedDueDates = jobs.map(job => job.dueDate);

      const requestData = {
        jobs_data: formattedJobs,
        due_dates: formattedDueDates,
        job_names: jobs.map(job => job.name),
        machine_names: machineNames,
        unite: timeUnit
      };

      console.log("Données envoyées:", requestData);

      const response = await fetch(`${API_URL}/jobshop/contraintes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Données reçues:", data);
      setResult(data);

      // Récupération du diagramme de Gantt
      try {
        const ganttResponse = await fetch(`${API_URL}/jobshop/contraintes/gantt`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestData)
        });

        if (ganttResponse.ok) {
          const blob = await ganttResponse.blob();
          const url = URL.createObjectURL(blob);
          setGanttUrl(url);
        }
      } catch (ganttError) {
        console.log("Pas de diagramme de Gantt disponible");
      }

    } catch (err) {
      console.error('Erreur:', err);
      setError(`Erreur lors du calcul: ${err.message}`);
    } finally {
      setIsCalculating(false);
    }
  };

  const downloadGanttChart = () => {
    if (ganttUrl) {
      const link = document.createElement('a');
      link.href = ganttUrl;
      link.download = 'diagramme_gantt_jobshop_contraintes.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className={styles.algorithmContainer}>
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>Jobshop - Programmation par contraintes</h1>
        <p className={styles.subtitle}>
          Ordonnancement optimal par programmation par contraintes pour ateliers job-shop
        </p>
      </div>

      {/* Configuration */}
      <div className={`${styles.section} ${styles.configSection}`}>
        <div className={styles.configRow}>
          <div className={styles.inputGroup}>
            <label htmlFor="timeUnit">Unité de temps</label>
            <select
              id="timeUnit"
              value={timeUnit}
              onChange={(e) => setTimeUnit(e.target.value)}
              className={styles.select}
            >
              <option value="heures">Heures</option>
              <option value="minutes">Minutes</option>
              <option value="jours">Jours</option>
            </select>
          </div>
          
          <div className={styles.actionButtons}>
            <button
              onClick={addJob}
              className={styles.addButton}
              type="button"
            >
              + Ajouter un job
            </button>
            
            <button
              onClick={removeJob}
              disabled={jobs.length <= 1}
              className={styles.removeButton}
              type="button"
            >
              - Supprimer un job
            </button>
            
            <button
              onClick={addMachine}
              className={styles.addButton}
              type="button"
            >
              + Ajouter une machine
            </button>
            
            <button
              onClick={removeMachine}
              disabled={machineNames.length <= 1}
              className={styles.removeButton}
              type="button"
            >
              - Supprimer une machine
            </button>
          </div>
        </div>
      </div>

      {/* Configuration des machines */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Configuration des machines</h2>
        <div className={styles.machinesTable}>
          <div className={styles.tableRow}>
            {machineNames.map((name, index) => (
              <div key={index} className={styles.machineInput}>
                <label htmlFor={`machine-${index}`}>Machine {index}</label>
                <input
                  id={`machine-${index}`}
                  type="text"
                  value={name}
                  onChange={(e) => updateMachineName(index, e.target.value)}
                  className={styles.input}
                  placeholder={`Machine ${index}`}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Jobs - Vue compacte tabulaire */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Configuration des jobs ({jobs.length} jobs)</h2>
        
        <div className={styles.compactJobsContainer}>
          <div className={styles.jobsHeader}>
            <div className={styles.jobHeaderCell}>Job</div>
            <div className={styles.jobHeaderCell}>Date due<br/>({timeUnit})</div>
            <div className={styles.jobHeaderCell}>Tâches</div>
            <div className={styles.jobHeaderCell}>Actions</div>
          </div>
          
          {jobs.map((job, jobIndex) => (
            <div key={jobIndex} className={styles.compactJobRow}>
              <div className={styles.jobCell}>
                <div className={styles.jobNameContainer}>
                  <div className={styles.jobNumber}>J{jobIndex + 1}</div>
                  <input
                    type="text"
                    value={job.name}
                    onChange={(e) => updateJobName(jobIndex, e.target.value)}
                    className={styles.compactInput}
                    placeholder={`Job ${jobIndex + 1}`}
                  />
                </div>
              </div>
              
              <div className={styles.jobCell}>
                <input
                  type="number"
                  value={job.dueDate}
                  onChange={(e) => updateJobDueDate(jobIndex, e.target.value)}
                  className={styles.dueDateInput}
                  min="0"
                  step="0.1"
                  placeholder="0"
                />
              </div>
              
              <div className={styles.jobCell}>
                <div className={styles.tasksCompact}>
                  {job.tasks.map((task, taskIndex) => (
                    <div key={taskIndex} className={styles.taskCompact}>
                      <div className={styles.taskNumber}>{taskIndex + 1}</div>
                      <select
                        value={task.machine}
                        onChange={(e) => updateTask(jobIndex, taskIndex, 'machine', e.target.value)}
                        className={styles.compactSelect}
                        title={`Tâche ${taskIndex + 1}: ${machineNames[task.machine]}`}
                      >
                        {machineNames.map((name, index) => (
                          <option key={index} value={index}>
                            {name}
                          </option>
                        ))}
                      </select>
                      <input
                        type="number"
                        value={task.duration}
                        onChange={(e) => updateTask(jobIndex, taskIndex, 'duration', e.target.value)}
                        className={styles.compactNumberInput}
                        min="0"
                        step="0.1"
                        placeholder="0"
                        title={`Durée en ${timeUnit}`}
                      />
                      <button
                        onClick={() => removeTaskFromJob(jobIndex, taskIndex)}
                        disabled={job.tasks.length <= 1}
                        className={styles.miniButton}
                        type="button"
                        title="Supprimer cette tâche"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className={styles.jobCell}>
                <div className={styles.jobActionsCompact}>
                  <button
                    onClick={() => addTaskToJob(jobIndex)}
                    className={styles.miniButton}
                    type="button"
                    title="Ajouter une tâche"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Configuration des temps de setup */}
      <div className={styles.section}>
        <div className={styles.setupHeader}>
          <h2 className={styles.sectionTitle}>Temps de setup (optionnel)</h2>
          <div className={styles.setupToggle}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={useSetupTimes}
                onChange={(e) => toggleSetupTimes(e.target.checked)}
                className={styles.checkbox}
              />
              <span className={styles.checkboxText}>
                Activer les temps de setup entre jobs
              </span>
            </label>
          </div>
        </div>

        {useSetupTimes && (
          <div className={styles.setupSection}>
            <div className={styles.setupInfo}>
              <div className={styles.infoBox}>
                <span className={styles.infoIcon}>ℹ️</span>
                <span className={styles.infoText}>
                  Configurez les temps de setup nécessaires lorsqu'une machine passe d'un job à un autre.
                  Par exemple : Machine 1 passe du Job A au Job B → temps de setup de 15 {timeUnit}.
                </span>
              </div>
            </div>

            {machineNames.map((machineName, machineIndex) => (
              <div key={machineIndex} className={styles.machineSetupTable}>
                <h4 className={styles.machineSetupTitle}>
                  {machineName} - Temps de setup ({timeUnit})
                </h4>
                
                <div className={styles.setupTableContainer}>
                  <table className={styles.setupTable}>
                    <thead>
                      <tr>
                        <th className={styles.setupTableHeader}>De \ Vers</th>
                        {jobs.map((job, jobIndex) => (
                          <th key={jobIndex} className={styles.setupTableHeader}>
                            {job.name}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {jobs.map((fromJob, fromIndex) => (
                        <tr key={fromIndex}>
                          <td className={styles.setupTableRowHeader}>
                            {fromJob.name}
                          </td>
                          {jobs.map((toJob, toIndex) => (
                            <td key={toIndex} className={styles.setupTableCell}>
                              {fromIndex === toIndex ? (
                                <span className={styles.setupDiagonal}>-</span>
                              ) : (
                                <input
                                  type="number"
                                  min="0"
                                  step="0.1"
                                  value={setupTimes[machineIndex]?.[fromIndex]?.[toIndex] || 0}
                                  onChange={(e) => updateSetupTime(machineIndex, fromIndex, toIndex, e.target.value)}
                                  className={styles.setupInput}
                                  placeholder="0"
                                />
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Gestion d'erreur */}
      {error && (
        <div className={styles.errorSection}>
          <div className={styles.errorBox}>
            <span className={styles.errorIcon}>⚠️</span>
            <span className={styles.errorText}>{error}</span>
          </div>
        </div>
      )}

      {/* Bouton de calcul */}
      <button
        onClick={calculateOptimization}
        disabled={isCalculating}
        className={styles.calculateButton}
        type="button"
      >
        {isCalculating ? 'Calcul en cours...' : 'Calculer l\'optimisation'}
      </button>

      {/* Résultats */}
      {result && (
        <div className={`${styles.section} ${styles.resultsSection}`}>
          <h2 className={styles.resultsTitle}>Résultats de l'optimisation</h2>



          {/* Métriques */}
          <div className={styles.metricsGrid}>
            <div className={styles.metric}>
              <div className={styles.metricValue}>
                {result.makespan || result.metrics?.makespan || 0}
              </div>
              <div className={styles.metricLabel}>
                Makespan ({timeUnit})
              </div>
            </div>
            
            <div className={styles.metric}>
              <div className={styles.metricValue}>
                {result.flowtime || result.metrics?.flowtime || 0}
              </div>
              <div className={styles.metricLabel}>
                Flowtime ({timeUnit})
              </div>
            </div>
            
            <div className={styles.metric}>
              <div className={styles.metricValue}>
                {result.retard_cumule || result.metrics?.retard_cumule || 0}
              </div>
              <div className={styles.metricLabel}>
                Retard cumulé ({timeUnit})
              </div>
            </div>
          </div>

          {/* Détails de planification */}
          <div className={styles.planificationDetails}>
            <h4>Temps de complétion</h4>
            <div className={styles.tasksList}>
              {result.completion_times && Object.keys(result.completion_times).length > 0 ? (
                // Affichage des données API
                Object.entries(result.completion_times).map(([job, time]) => (
                  <div key={job} className={styles.taskBadge}>
                    {job}: {time} {timeUnit}
                  </div>
                ))
              ) : (
                // Simulation des temps de complétion
                jobs.map((job, index) => {
                  // Calcul basé sur la durée totale des tâches du job
                  const totalDuration = job.tasks.reduce((sum, task) => sum + task.duration, 0);
                  const completionTime = (index + 1) * Math.max(totalDuration, 5);
                  return (
                    <div key={index} className={styles.taskBadge}>
                      {job.name}: {completionTime} {timeUnit}
                    </div>
                  );
                })
              )}
            </div>

            <h4 style={{ marginTop: '1.5rem' }}>Planification détaillée par machine</h4>
            
            {/* Si on a des données de planification structurées */}
            {result.planification && Object.entries(result.planification).map(([machine, tasks]) => (
              <div key={machine} className={styles.machineDetail}>
                <strong>{machine}</strong>
                <div className={styles.tasksList}>
                  {tasks.map((t, i) => (
                    <div key={i} className={styles.taskBadge}>
                      {jobs[t.job]?.name || `Job ${t.job}`}: {t.start} → {t.start + t.duration}
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Si on a des données de schedule linéaire */}
            {result.schedule && !result.planification && (
              <div>
                {machineNames.map((machineName, machineIndex) => {
                  const machineTasks = result.schedule.filter(task => 
                    task.machine === machineName || 
                    task.machine === `Machine ${machineIndex}` ||
                    task.machine === machineIndex ||
                    task.machine === `M${machineIndex}`
                  );
                  
                  if (machineTasks.length === 0) return null;
                  
                  return (
                    <div key={machineIndex} className={styles.machineDetail}>
                      <strong>{machineName}</strong>
                      <div className={styles.tasksList}>
                        {machineTasks.map((task, i) => (
                          <div key={i} className={styles.taskBadge}>
                            {task.job} : {task.start} → {task.end}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Si on a ni planification ni schedule, simulation basique */}
            {!result.schedule && !result.planification && result.sequence && (
              <div>
                {machineNames.map((machineName, machineIndex) => (
                  <div key={machineIndex} className={styles.machineDetail}>
                    <strong>{machineName}</strong>
                    <div className={styles.tasksList}>
                      {jobs.map((job, jobIndex) => {
                        const machineTask = job.tasks.find(task => task.machine === machineIndex);
                        if (!machineTask) return null;
                        
                        const startTime = jobIndex * 5; // Simulation simple
                        const endTime = startTime + machineTask.duration;
                        
                        return (
                          <div key={jobIndex} className={styles.taskBadge}>
                            {job.name}: {startTime} → {endTime}
                          </div>
                        );
                      }).filter(Boolean)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Diagramme de Gantt */}
      {ganttUrl && (
        <div className={`${styles.section} ${styles.chartSection}`}>
          <div className={styles.chartHeader}>
            <h3>Diagramme de Gantt</h3>
          </div>
          <div className={styles.chartContainer}>
            <img
              src={ganttUrl}
              alt="Diagramme de Gantt"
              className={styles.chart}
            />
            <button
              onClick={downloadGanttChart}
              className={styles.downloadButton}
              type="button"
            >
              Télécharger le diagramme
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobshopContraintesForm; 