import React, { useState } from 'react';
import styles from './FlowshopContraintesForm.module.css';

const FlowshopContraintesForm = () => {
  const [jobs, setJobs] = useState([
    { name: 'Job 1', durations: [8, 6], dueDate: 10 },
    { name: 'Job 2', durations: [4, 5], dueDate: 15 },
    { name: 'Job 3', durations: [7, 9], dueDate: 20 }
  ]);
  const [numMachines, setNumMachines] = useState(2);
  const [timeUnit, setTimeUnit] = useState('heures');
  const [machineNames, setMachineNames] = useState(['Machine 0', 'Machine 1']);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [isCalculating, setIsCalculating] = useState(false);

  const API_URL = "https://interface-backend-1jgi.onrender.com";

  const adjustMachineCount = (newCount) => {
    if (newCount >= 1 && newCount <= 10) {
      setNumMachines(newCount);
      
      const newNames = Array.from({ length: newCount }, (_, i) => 
        machineNames[i] || `Machine ${i}`
      );
      setMachineNames(newNames);
      
      setJobs(jobs.map(job => ({
        ...job,
        durations: job.durations.slice(0, newCount).concat(
          Array(Math.max(0, newCount - job.durations.length)).fill(0)  )
      })));
    }
  };

  const addJob = () => {
    const newJobNumber = jobs.length + 1;
    setJobs([...jobs, {
      name: `Job ${newJobNumber}`,
      durations: Array(numMachines).fill(0),
      dueDate: 0
    }]);
  };

  const removeJob = () => {
    if (jobs.length > 1) {
      setJobs(jobs.slice(0, -1));
    }
  };

  const updateJob = (index, field, value) => {
    const newJobs = [...jobs];
    if (field === 'name' || field === 'dueDate') {
      newJobs[index][field] = value;
    } else if (field === 'duration') {
      const [jobIndex, machineIndex] = value;
      newJobs[jobIndex].durations[machineIndex] = parseFloat(value.duration) || 0;
    }
    setJobs(newJobs);
  };

  const updateJobDuration = (jobIndex, machineIndex, value) => {
    const newJobs = [...jobs];
    newJobs[jobIndex].durations[machineIndex] = parseFloat(value) || 0;
    setJobs(newJobs);
  };

  const updateMachineName = (index, name) => {
    const newNames = [...machineNames];
    newNames[index] = name;
    setMachineNames(newNames);
  };

  const extractSequenceFromSchedule = (planification) => {
    if (!planification || typeof planification !== 'object') return [];

    const allTasks = [];
    Object.entries(planification).forEach(([machineName, tasks]) => {
      if (Array.isArray(tasks)) {
        tasks.forEach(task => {
          if (task && typeof task === 'object' && task.job) {
            allTasks.push({
              job: task.job,
              start: task.start || 0,
              machine: machineName
            });
          }
        });
      }
    });

    allTasks.sort((a, b) => a.start - b.start);
    
    const sequence = [];
    const addedJobs = new Set();
    
    allTasks.forEach(task => {
      if (!addedJobs.has(task.job)) {
        sequence.push(task.job);
        addedJobs.add(task.job);
      }
    });

    return sequence;
  };

  const calculateOptimization = async () => {
    setIsCalculating(true);
    setError('');
    
    try {
      // Format des données cohérent avec SPT/EDD
      const formattedJobs = jobs.map(job =>
        job.durations.map((duration, machineIndex) => [machineIndex, parseFloat(duration) || 0])
      );
      const formattedDueDates = jobs.map(job => parseFloat(job.dueDate) || 0);

      const requestData = {
        jobs_data: formattedJobs,
        due_dates: formattedDueDates,
        unite: timeUnit,
        job_names: jobs.map(job => job.name),
        machine_names: machineNames
      };

      console.log("Données envoyées:", requestData);

      const response = await fetch(`${API_URL}/flowshop/contraintes`, {
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

      if (data.gantt_chart) {
        setTimeout(() => {
          const img = document.getElementById('gantt-chart-img');
          if (img) {
            img.src = `data:image/png;base64,${data.gantt_chart}`;
          }
        }, 100);
      }

    } catch (err) {
      console.error('Erreur:', err);
      setError(`Erreur lors du calcul: ${err.message}`);
    } finally {
      setIsCalculating(false);
    }
  };

  const downloadGanttChart = () => {
    if (result && result.gantt_chart) {
      const link = document.createElement('a');
      link.href = `data:image/png;base64,${result.gantt_chart}`;
      link.download = 'diagramme_gantt_contraintes.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className={styles.algorithmContainer}>
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>Programmation par Contraintes</h1>
        <p className={styles.subtitle}>
          Optimisation avancée utilisant la programmation par contraintes pour résoudre le problème de flowshop
        </p>
      </div>

      {/* Configuration */}
      <div className={`${styles.section} ${styles.configSection}`}>
        <h2 className={styles.sectionTitle}>Configuration</h2>
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
              onClick={() => adjustMachineCount(numMachines + 1)}
              disabled={numMachines >= 10}
              className={styles.addButton}
              type="button"
            >
              + Ajouter une machine
            </button>
            
            <button
              onClick={() => adjustMachineCount(numMachines - 1)}
              disabled={numMachines <= 1}
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
        <h2 className={styles.sectionTitle}>Noms des machines</h2>
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

      {/* Tableau des données */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Matrice des temps de traitement</h2>
        <div className={styles.dataTable}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.jobNameHeader}>Job</th>
                {machineNames.map((name, index) => (
                  <th key={index} className={styles.machineHeader}>
                    Durée sur {name} ({timeUnit})
                  </th>
                ))}
                <th className={styles.dueDateHeader}>Date due ({timeUnit})</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job, jobIndex) => (
                <tr key={jobIndex} className={styles.jobRow}>
                  <td className={styles.jobNameCell}>
                    <input
                      type="text"
                      value={job.name}
                      onChange={(e) => updateJob(jobIndex, 'name', e.target.value)}
                      className={styles.jobNameInput}
                      placeholder={`Job ${jobIndex + 1}`}
                    />
                  </td>
                  {job.durations.map((duration, machineIndex) => (
                    <td key={machineIndex}>
                      <input
                        type="number"
                        value={duration}
                        onChange={(e) => updateJobDuration(jobIndex, machineIndex, e.target.value)}
                        className={styles.durationInput}
                        min="0"
                        step="0.1"
                        placeholder="0"
                      />
                    </td>
                  ))}
                  <td className={styles.dueDateCell}>
                    <input
                      type="number"
                      value={job.dueDate}
                      onChange={(e) => updateJob(jobIndex, 'dueDate', parseFloat(e.target.value) || 0)}
                      className={styles.dueDateInput}
                      min="0"
                      step="0.1"
                      placeholder="0"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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

          {/* Séquence calculée */}
          <div className={styles.sequenceSection}>
            <h3 className={styles.sequenceTitle}>Séquence optimale calculée</h3>
            <div className={styles.sequenceValue}>
              {extractSequenceFromSchedule(result.planification).join(' → ') || 'Non disponible'}
            </div>
          </div>

          {/* Métriques */}
          <div className={styles.metricsGrid}>
            <div className={styles.metric}>
              <div className={styles.metricValue}>
                {result.metrics?.makespan || 0}
              </div>
              <div className={styles.metricLabel}>
                Makespan ({timeUnit})
              </div>
            </div>
            
            <div className={styles.metric}>
              <div className={styles.metricValue}>
                {result.metrics?.total_flow_time || 0}
              </div>
              <div className={styles.metricLabel}>
                Temps de flux total ({timeUnit})
              </div>
            </div>
            
            <div className={styles.metric}>
              <div className={styles.metricValue}>
                {result.metrics?.average_flow_time 
                  ? result.metrics.average_flow_time.toFixed(2)
                  : '0.00'
                }
              </div>
              <div className={styles.metricLabel}>
                Temps de flux moyen ({timeUnit})
              </div>
            </div>
            
            <div className={styles.metric}>
              <div className={styles.metricValue}>
                {result.metrics?.total_tardiness || 0}
              </div>
              <div className={styles.metricLabel}>
                Retard total ({timeUnit})
              </div>
            </div>
            
            <div className={styles.metric}>
              <div className={styles.metricValue}>
                {result.metrics?.tardy_jobs || 0}
              </div>
              <div className={styles.metricLabel}>
                Jobs en retard
              </div>
            </div>
          </div>

          {/* Détails de la planification */}
          <div className={styles.planificationDetails}>
            <h4>Détails de la planification</h4>
            {result.planification && Object.entries(result.planification).map(([machine, tasks]) => (
              <div key={machine} className={styles.machineDetail}>
                <strong>{machine}:</strong>
                <div className={styles.tasksList}>
                  {Array.isArray(tasks) && tasks.map((task, index) => (
                    <span key={index} className={styles.taskBadge}>
                      {task.job} ({task.start}-{task.end} {timeUnit})
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Diagramme de Gantt */}
      {result && result.gantt_chart && (
        <div className={`${styles.section} ${styles.chartSection}`}>
          <div className={styles.chartHeader}>
            <h3>Diagramme de Gantt</h3>
          </div>
          <div className={styles.chartContainer}>
            <img
              id="gantt-chart-img"
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

export default FlowshopContraintesForm;


