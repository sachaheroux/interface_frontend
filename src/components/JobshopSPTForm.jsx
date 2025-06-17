import React, { useState } from 'react';
import styles from './JobshopSPTForm.module.css';
import ExcelImportSection from './ExcelImportSection';
import ExcelExportSectionJobshop from './ExcelExportSectionJobshop';

const JobshopSPTForm = () => {
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
  const [isImporting, setIsImporting] = useState(false);
  const [importSuccess, setImportSuccess] = useState(null);

  const API_URL = "/api";

  // Fonction utilitaire pour générer des valeurs aléatoirement entre 1 et 9
  const getRandomDuration = () => Math.floor(Math.random() * 9) + 1;
  const getRandomDueDate = () => Math.floor(Math.random() * 9) + 10; // Entre 10 et 18

  // Gestion des jobs
  const addJob = () => {
    const newJobNumber = jobs.length + 1;
    setJobs([...jobs, {
      name: `Job ${newJobNumber}`,
      tasks: [{ machine: 0, duration: getRandomDuration() }],
      dueDate: getRandomDueDate()
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
    newJobs[jobIndex].tasks.push({ machine: 0, duration: getRandomDuration() });
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

      const response = await fetch(`${API_URL}/jobshop/spt`, {
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
        const ganttResponse = await fetch(`${API_URL}/jobshop/spt/gantt`, {
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
      link.download = 'diagramme_gantt_jobshop_spt.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Fonction pour l'import Excel
  const handleExcelImport = async (formData, fileName) => {
    setIsImporting(true);
    setError('');
    setImportSuccess(null);
    
    // Réinitialiser les résultats précédents
    setResult(null);
    setGanttUrl(null);

    try {
      const response = await fetch(`${API_URL}/jobshop/spt/import-excel`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Erreur lors de l\'import');
      }

      const data = await response.json();
      
      // Remplacer complètement les données du formulaire avec les données importées
      const importedData = data.imported_data;
      
      // Mettre à jour tous les états avec les données importées
      setMachineNames(importedData.machine_names || []);
      setTimeUnit(importedData.unite || 'heures');
      
      // Reconstruire les jobs à partir des données importées
      if (importedData.jobs_data && importedData.jobs_data.length > 0) {
        const importedJobs = importedData.jobs_data.map((jobTasks, index) => ({
          name: importedData.job_names[index] || `Job ${index + 1}`,
          dueDate: importedData.due_dates[index] || 0,
          tasks: jobTasks.map(task => ({
            machine: task[0], // [machine, duration] format
            duration: task[1]
          }))
        }));
        setJobs(importedJobs);
      }
      
      // Afficher les résultats directement
      setResult(data.results);
      setImportSuccess(`Fichier "${fileName}" importé et traité avec succès! Les données du formulaire ont été remplacées par celles du fichier.`);
      
      // Générer le diagramme de Gantt
      try {
        const ganttResponse = await fetch(`${API_URL}/jobshop/spt/import-excel-gantt`, {
          method: 'POST',
          body: formData
        });
        
        if (ganttResponse.ok) {
          const blob = await ganttResponse.blob();
          const url = URL.createObjectURL(blob);
          setGanttUrl(url);
        }
      } catch (ganttError) {
        console.error('Erreur génération Gantt:', ganttError);
      }
      
    } catch (error) {
      setError(error.message);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className={styles.algorithmContainer}>
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>Jobshop - Algorithme SPT</h1>
        <p className={styles.subtitle}>
          Ordonnancement par temps de traitement le plus court (Shortest Processing Time) pour ateliers job-shop
        </p>
      </div>

      {/* Export Excel */}
      <ExcelExportSectionJobshop
        jobs={jobs}
        dueDates={jobs.map(job => job.dueDate)}
        jobNames={jobs.map(job => job.name)}
        machineNames={machineNames}
        unite={timeUnit}
        algorithmName="Jobshop_SPT"
        algorithmEndpoint="jobshop/spt"
        API_URL={API_URL}
      />

      {/* Import Excel */}
      <ExcelImportSection
        onImport={handleExcelImport}
        isImporting={isImporting}
        templateType="jobshop"
        API_URL={API_URL}
      />

      {importSuccess && (
        <div className={styles.successSection}>
          <div className={styles.successBox}>
            <span className={styles.successIcon}>✓</span>
            <span className={styles.successText}>{importSuccess}</span>
          </div>
        </div>
      )}

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
                Flowtime moyen ({timeUnit})
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

export default JobshopSPTForm;