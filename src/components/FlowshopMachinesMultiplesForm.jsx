import React, { useState } from 'react';
import styles from './FlowshopMachinesMultiplesForm.module.css';
import AgendaGrid from './AgendaGrid';

const FlowshopMachinesMultiplesForm = () => {
  const [jobs, setJobs] = useState([
    { name: 'Job 1', durations: [[8], [6]], dueDate: 10 },
    { name: 'Job 2', durations: [[4], [5]], dueDate: 15 },
    { name: 'Job 3', durations: [[7], [9]], dueDate: 20 }
  ]);
  const [numMachines, setNumMachines] = useState(2);
  const [machinesPerStage, setMachinesPerStage] = useState([1, 1]); // Nombre de machines par étape (pour hybride)
  const [timeUnit, setTimeUnit] = useState('heures');
  const [machineNames, setMachineNames] = useState(['Machine 1', 'Machine 2']);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [isCalculating, setIsCalculating] = useState(false);
  const [agendaData, setAgendaData] = useState(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [startDateTime, setStartDateTime] = useState('2025-06-01T08:00:00');
  const [openingHours, setOpeningHours] = useState({ start: '08:00', end: '17:00' });
  const [weekendDays, setWeekendDays] = useState({ samedi: true, dimanche: true });
  const [feries, setFeries] = useState(['']);
  const [dueDateTimes, setDueDateTimes] = useState(jobs.map(() => ''));
  const [pauses, setPauses] = useState([{ start: '12:00', end: '13:00', name: 'Pause déjeuner' }]);

  const API_URL = "https://interface-backend-1jgi.onrender.com";

  // Fonction pour générer une valeur aléatoire entre 1 et 10
  const generateRandomDuration = () => {
    return Math.floor(Math.random() * 10) + 1;
  };

  const adjustMachineCount = (newCount) => {
    if (newCount >= 1 && newCount <= 10) {
      setNumMachines(newCount);
      
      // Ajuster les noms des machines
      const newNames = Array.from({ length: newCount }, (_, i) => 
        machineNames[i] || `Machine ${i + 1}`
      );
      setMachineNames(newNames);
      
      // Ajuster le nombre de machines par étape (pour hybride)
      const newMachinesPerStage = Array.from({ length: newCount }, (_, i) => 
        machinesPerStage[i] || 1
      );
      setMachinesPerStage(newMachinesPerStage);
      
      // Ajuster les durées des jobs (tableau 2D)
      setJobs(jobs.map(job => ({
        ...job,
        durations: job.durations.slice(0, newCount).concat(
          Array(Math.max(0, newCount - job.durations.length)).fill(null).map(() => [generateRandomDuration()])
        )
      })));
    }
  };

  const updateMachinesPerStage = (machineIndex, machineCount) => {
    if (machineCount >= 1 && machineCount <= 5) {
      const newMachinesPerStage = [...machinesPerStage];
      newMachinesPerStage[machineIndex] = machineCount;
      setMachinesPerStage(newMachinesPerStage);
      
      // Ajuster les durées pour tous les jobs selon le nouveau nombre de machines
      setJobs(jobs.map(job => {
        const newDurations = [...job.durations];
        if (newDurations[machineIndex]) {
          // Ajuster la taille du tableau de durées pour cette machine
          const currentDurations = newDurations[machineIndex];
          if (currentDurations.length < machineCount) {
            // Ajouter des durées manquantes
            newDurations[machineIndex] = [
              ...currentDurations,
              ...Array(machineCount - currentDurations.length).fill(0).map(() => generateRandomDuration())
            ];
          } else if (currentDurations.length > machineCount) {
            // Supprimer les durées en trop
            newDurations[machineIndex] = currentDurations.slice(0, machineCount);
          }
        }
        return { ...job, durations: newDurations };
      }));
    }
  };

  const addJob = () => {
    const newJobNumber = jobs.length + 1;
    setJobs([...jobs, {
      name: `Job ${newJobNumber}`,
      durations: Array(numMachines).fill(null).map((_, i) => 
        Array(machinesPerStage[i]).fill(0).map(() => generateRandomDuration())
      ),
      dueDate: generateRandomDuration() * 5 // Due date entre 5 et 50
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
      const parsedValue = parseFloat(value.duration);
      newJobs[jobIndex].durations[machineIndex] = isNaN(parsedValue) ? 0 : parsedValue;
    }
    setJobs(newJobs);
  };

  const updateJobDuration = (jobIndex, machineIndex, subMachineIndex, value) => {
    const newJobs = [...jobs];
    const parsedValue = parseFloat(value);
    newJobs[jobIndex].durations[machineIndex][subMachineIndex] = isNaN(parsedValue) ? 0 : parsedValue;
    setJobs(newJobs);
  };

  const updateMachineName = (index, name) => {
    const newNames = [...machineNames];
    newNames[index] = name;
    setMachineNames(newNames);
  };

  const extractSequenceFromSchedule = (planification, rawMachines = null) => {
    // Utiliser raw_machines si disponible, sinon planification
    const dataToUse = rawMachines || planification;
    if (!dataToUse || typeof dataToUse !== 'object') return [];

    // Collecter toutes les tâches avec leurs informations
    const allTasks = [];
    Object.entries(dataToUse).forEach(([machineKey, tasks]) => {
      if (Array.isArray(tasks)) {
        tasks.forEach(task => {
          if (task && typeof task === 'object' && (task.job !== undefined && task.job !== null)) {
            allTasks.push({
              job: task.job,
              start: task.start || 0,
              machine: machineKey,
              task_id: task.task || 0
            });
          }
        });
      }
    });

    // Trouver la première tâche (task_id = 0) de chaque job pour déterminer l'ordre
    const firstTasks = allTasks.filter(task => task.task_id === 0);
    
    // Trier par temps de début de la première tâche
    firstTasks.sort((a, b) => a.start - b.start);
    
    // Extraire la séquence des jobs basée sur leurs premières tâches (commencer à 1)
    const sequence = firstTasks.map(task => task.job + 1);
    
    // Vérifier si on a tous les jobs (fallback au cas où certains n'ont pas de task_id=0)
    const uniqueJobs = [...new Set(allTasks.map(task => task.job))];
    const missingJobs = uniqueJobs.filter(job => !sequence.includes(job + 1));
    
    if (missingJobs.length > 0) {
      console.log("Jobs manquants dans la séquence:", missingJobs);
      // Ajouter les jobs manquants triés par leur première apparition
      const additionalTasks = allTasks
        .filter(task => missingJobs.includes(task.job))
        .sort((a, b) => a.start - b.start);
      
      const addedJobs = new Set(sequence);
      additionalTasks.forEach(task => {
        if (!addedJobs.has(task.job + 1)) {
          sequence.push(task.job + 1);
          addedJobs.add(task.job + 1);
        }
      });
    }

    return sequence;
  };

  const calculateOptimization = async () => {
    setIsCalculating(true);
    setError('');
    
    try {
      // Format des données pour flowshop hybride ou classique
      const hasParallelMachines = machinesPerStage.some(count => count > 1);
      const isHybride = hasParallelMachines;
      
      const formattedJobs = jobs.map((job, jobIndex) => {
        console.log(`DEBUG: Job ${jobIndex} raw data:`, job);
        console.log(`DEBUG: Job ${jobIndex} durations:`, job.durations);
        
        if (hasParallelMachines) {
          // Mode hybride : format pour machines multiples
          const jobData = [];
          job.durations.forEach((machineDurations, stageIndex) => {
            const alternatives = [];
            machineDurations.forEach((duration, subMachineIndex) => {
              // Calculer l'ID de machine physique basé sur les étapes précédentes
              const physicalMachineId = machinesPerStage.slice(0, stageIndex).reduce((sum, count) => sum + count, 0) + subMachineIndex;
              alternatives.push([physicalMachineId, duration]);
            });
            jobData.push(alternatives);
          });
          console.log(`DEBUG: Job ${jobIndex} final data:`, jobData);
          return jobData;
        } else {
          // Mode classique : format original
          return job.durations.map((machineDurations, machineIndex) => {
            const avgDuration = machineDurations.reduce((sum, d) => sum + parseFloat(d || 0), 0) / machineDurations.length;
            return [machineIndex, isNaN(avgDuration) ? 0 : avgDuration];
          });
        }
      });
      const formattedDueDates = jobs.map(job => {
        const parsedDueDate = parseFloat(job.dueDate);
        return isNaN(parsedDueDate) ? 0 : parsedDueDate;
      });

      const requestData = {
        jobs_data: formattedJobs,
        due_dates: formattedDueDates,
        unite: timeUnit,
        job_names: jobs.map(job => job.name),
        machine_names: machineNames,
        ...(isHybride && {
          stage_names: machineNames,
          machines_per_stage: machinesPerStage
        })
      };

      // Ajouter les paramètres d'agenda si activés
      if (showAdvanced) {
        requestData.agenda_start_datetime = startDateTime;
        requestData.opening_hours = openingHours;
        requestData.weekend_days = Object.entries(weekendDays).filter(([_, v]) => v).map(([k]) => k);
        requestData.jours_feries = feries.filter(f => f);
        requestData.due_date_times = dueDateTimes;
        requestData.pauses = pauses;
      }

      console.log("Données envoyées:", requestData);

      const response = await fetch(`${API_URL}/flowshop/machines_multiples`, {
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

      // Récupération du diagramme de Gantt séparément
      try {
        const ganttResponse = await fetch(`${API_URL}/flowshop/machines_multiples/gantt`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestData)
        });

        if (ganttResponse.ok) {
          const blob = await ganttResponse.blob();
          const url = URL.createObjectURL(blob);
          setResult(prevResult => ({ ...prevResult, gantt_url: url }));
        }
      } catch (ganttError) {
        console.log("Pas de diagramme de Gantt disponible");
      }

      // Récupération de l'agenda si les paramètres avancés sont activés
      if (showAdvanced) {
        try {
          const agendaResponse = await fetch(`${API_URL}/flowshop/machines_multiples/agenda`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestData)
          });

          if (agendaResponse.ok) {
            const agendaResult = await agendaResponse.json();
            setAgendaData(agendaResult);
          }
        } catch (agendaError) {
          console.log("Pas d'agenda disponible");
        }
      }

    } catch (err) {
      console.error('Erreur:', err);
      setError(`Erreur lors du calcul: ${err.message}`);
    } finally {
      setIsCalculating(false);
    }
  };

  const downloadGanttChart = () => {
    if (result && result.gantt_url) {
      const link = document.createElement('a');
      link.href = result.gantt_url;
      link.download = 'diagramme_gantt_machines_multiples.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const addFerie = () => {
    setFeries([...feries, '']);
  };

  const removeFerie = (index) => {
    if (feries.length > 1) {
      setFeries(feries.filter((_, i) => i !== index));
    }
  };

  const updateFerie = (index, value) => {
    const newFeries = [...feries];
    newFeries[index] = value;
    setFeries(newFeries);
  };

  const addPause = () => {
    setPauses([...pauses, { start: '10:00', end: '10:15', name: 'Pause' }]);
  };

  const removePause = (index) => {
    if (pauses.length > 0) {
      setPauses(pauses.filter((_, i) => i !== index));
    }
  };

  const updatePause = (index, field, value) => {
    const newPauses = [...pauses];
    newPauses[index][field] = value;
    setPauses(newPauses);
  };

  return (
    <div className={styles.algorithmContainer}>
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>Machines Multiples</h1>
        <p className={styles.subtitle}>
          Flowshop flexible avec machines multiples par étape utilisant OR-Tools CP-SAT pour l'optimisation
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
              + Ajouter machine
            </button>
            
            <button
              onClick={() => adjustMachineCount(numMachines - 1)}
              disabled={numMachines <= 1}
              className={styles.removeButton}
              type="button"
            >
              - Supprimer machine
            </button>
          </div>
        </div>
      </div>

      {/* Section Machines */}
      <div className={`${styles.section} ${styles.machinesSection}`}>
        <h2 className={styles.sectionTitle}>🏭 Configuration des Machines</h2>
        <div className={styles.helpText}>
          Définissez les noms et le nombre de machines parallèles par étape. 
          Chaque étape peut avoir plusieurs machines alternatives.
        </div>
        
        <div className={styles.machinesGrid}>
          {Array.from({ length: numMachines }, (_, i) => (
            <div key={i} className={styles.machineConfig}>
              <div className={styles.machineHeader}>
                <input
                  type="text"
                  value={machineNames[i]}
                  onChange={(e) => updateMachineName(i, e.target.value)}
                  className={styles.machineNameInput}
                  placeholder={`Machine ${i + 1}`}
                />
              </div>
              
              <div className={styles.machineCountControl}>
                <label>Machines parallèles :</label>
                <div className={styles.countControls}>
                  <button
                    onClick={() => updateMachinesPerStage(i, machinesPerStage[i] - 1)}
                    disabled={machinesPerStage[i] <= 1}
                    className={styles.countButton}
                    type="button"
                  >
                    -
                  </button>
                  <span className={styles.countValue}>{machinesPerStage[i]}</span>
                  <button
                    onClick={() => updateMachinesPerStage(i, machinesPerStage[i] + 1)}
                    disabled={machinesPerStage[i] >= 5}
                    className={styles.countButton}
                    type="button"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section Données */}
      <div className={`${styles.section} ${styles.dataSection}`}>
        <h2 className={styles.sectionTitle}>📊 Données des Jobs</h2>
        <div className={styles.tableContainer}>
          <table className={styles.dataTable}>
            <thead>
              <tr>
                <th className={styles.jobHeader}>Job</th>
                {machineNames.map((machineName, index) => (
                  <th key={index} className={styles.machineHeader}>
                    {machineName}
                    <div className={styles.machineSubInfo}>
                      {machinesPerStage[index]} machine{machinesPerStage[index] > 1 ? 's' : ''}
                    </div>
                  </th>
                ))}
                <th className={styles.dueDateHeader}>Échéance</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job, jobIndex) => (
                <tr key={jobIndex} className={styles.dataRow}>
                  <td className={styles.jobCell}>
                    <input
                      type="text"
                      value={job.name}
                      onChange={(e) => updateJob(jobIndex, 'name', e.target.value)}
                      className={`${styles.input} ${styles.jobNameInput}`}
                    />
                  </td>
                  {job.durations.map((machineDurations, machineIndex) => (
                    <td key={machineIndex} className={styles.durationCell}>
                      <div className={styles.machineAlternatives}>
                        {machineDurations.map((duration, subMachineIndex) => {
                          const getSubMachineName = (machineIndex, subIndex) => {
                            if (machinesPerStage[machineIndex] === 1) {
                              return machineNames[machineIndex];
                            }
                            return `${machineNames[machineIndex]} ${subIndex + 1}`;
                          };

                          return (
                            <div key={subMachineIndex} className={styles.subMachineInput}>
                              <span className={styles.subMachineLabel}>
                                {machinesPerStage[machineIndex] > 1 ? `${String.fromCharCode(65 + subMachineIndex)}` : ''}
                              </span>
                              <input
                                type="number"
                                min="0"
                                step="0.1"
                                value={duration}
                                onChange={(e) => updateJobDuration(jobIndex, machineIndex, subMachineIndex, e.target.value)}
                                className={styles.durationInput}
                                title={getSubMachineName(machineIndex, subMachineIndex)}
                              />
                            </div>
                          );
                        })}
                      </div>
                    </td>
                  ))}
                  <td className={styles.dueDateCell}>
                    <input
                      type="number"
                      min="0"
                      value={job.dueDate}
                      onChange={(e) => updateJob(jobIndex, 'dueDate', parseFloat(e.target.value) || 0)}
                      className={styles.input}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section Agenda */}
      <div className={`${styles.section} ${styles.agendaSection}`}>
        <h2 className={styles.sectionTitle}>
          📅 Paramètres d'Agenda
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={styles.toggleButton}
          >
            {showAdvanced ? 'Masquer' : 'Afficher'}
          </button>
        </h2>
        
        {showAdvanced && (
          <div className={styles.advancedParams}>
            <div className={styles.paramRow}>
              <div className={styles.inputGroup}>
                <label htmlFor="startDateTime">Date et heure de début</label>
                <input
                  type="datetime-local"
                  id="startDateTime"
                  value={startDateTime}
                  onChange={(e) => setStartDateTime(e.target.value)}
                  className={styles.input}
                />
              </div>
              
              <div className={styles.inputGroup}>
                <label htmlFor="openingStart">Heures d'ouverture</label>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <input
                    type="time"
                    value={openingHours.start}
                    onChange={(e) => setOpeningHours({...openingHours, start: e.target.value})}
                    className={styles.input}
                  />
                  <span>à</span>
                  <input
                    type="time"
                    value={openingHours.end}
                    onChange={(e) => setOpeningHours({...openingHours, end: e.target.value})}
                    className={styles.input}
                  />
                </div>
              </div>
            </div>
            
            <div className={styles.paramRow}>
              <div className={styles.checkboxGroup}>
                <label>Jours de week-end</label>
                <div className={styles.checkboxes}>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={weekendDays.samedi}
                      onChange={(e) => setWeekendDays({...weekendDays, samedi: e.target.checked})}
                    />
                    Samedi
                  </label>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={weekendDays.dimanche}
                      onChange={(e) => setWeekendDays({...weekendDays, dimanche: e.target.checked})}
                    />
                    Dimanche
                  </label>
                </div>
              </div>
              
              <div className={styles.listContainer}>
                <label>Jours fériés (YYYY-MM-DD)</label>
                {feries.map((ferie, index) => (
                  <div key={index} className={styles.listItem}>
                    <input
                      type="date"
                      value={ferie}
                      onChange={(e) => updateFerie(index, e.target.value)}
                      className={styles.input}
                    />
                    <button
                      onClick={() => removeFerie(index)}
                      className={styles.removeItemButton}
                      disabled={feries.length <= 1}
                    >
                      ×
                    </button>
                  </div>
                ))}
                <button onClick={addFerie} className={styles.addItemButton}>
                  + Ajouter un jour férié
                </button>
              </div>
              
              <div className={styles.listContainer}>
                <label>Pauses</label>
                {pauses.map((pause, index) => (
                  <div key={index} className={styles.pauseItem}>
                    <input
                      type="text"
                      value={pause.name}
                      onChange={(e) => updatePause(index, 'name', e.target.value)}
                      className={styles.input}
                      placeholder="Nom de la pause"
                    />
                    <input
                      type="time"
                      value={pause.start}
                      onChange={(e) => updatePause(index, 'start', e.target.value)}
                      className={styles.input}
                    />
                    <input
                      type="time"
                      value={pause.end}
                      onChange={(e) => updatePause(index, 'end', e.target.value)}
                      className={styles.input}
                    />
                    <button
                      onClick={() => removePause(index)}
                      className={styles.removeItemButton}
                    >
                      ×
                    </button>
                  </div>
                ))}
                <button onClick={addPause} className={styles.addItemButton}>
                  + Ajouter une pause
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Erreur */}
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
      >
        {isCalculating ? 'Calcul en cours...' : 'Calculer l\'optimisation'}
      </button>

      {/* Résultats */}
      {result && (
        <div className={`${styles.section} ${styles.resultsSection}`}>
          <h2 className={styles.resultsTitle}>📈 Résultats de l'Optimisation</h2>
          
          {/* Séquence optimale */}
          <div className={styles.sequenceSection}>
            <h3 className={styles.sequenceTitle}>Séquence optimale des jobs :</h3>
            <div className={styles.sequenceValue}>
              {extractSequenceFromSchedule(result.planification, result.raw_machines).join(' → ')}
            </div>
          </div>

          {/* Métriques */}
          <div className={styles.metricsGrid}>
            <div className={styles.metric}>
              <div className={styles.metricValue}>{result.makespan}</div>
              <div className={styles.metricLabel}>Makespan (Cmax)</div>
            </div>
            <div className={styles.metric}>
              <div className={styles.metricValue}>{result.flowtime}</div>
              <div className={styles.metricLabel}>Flowtime (F)</div>
            </div>
            <div className={styles.metric}>
              <div className={styles.metricValue}>{result.retard_cumule}</div>
              <div className={styles.metricLabel}>Retard cumulé (Rc)</div>
            </div>
          </div>

          {/* Détails de planification */}
          <div className={styles.planificationDetails}>
            <h4>📋 Détails de la planification :</h4>
            
            {/* Temps de complétion */}
            <div className={styles.tasksList}>
              {Object.entries(result.completion_times).map(([job, time]) => (
                <div key={job} className={styles.taskBadge}>
                  {job}: {time} {timeUnit}
                </div>
              ))}
            </div>

            {/* Planification par machine */}
            {Object.entries(result.planification).map(([machine, tasks]) => (
              <div key={machine} className={styles.machineDetail}>
                <strong>Machine {machine}:</strong>
                <div className={styles.tasksList}>
                  {tasks.map((task, taskIndex) => (
                    <div key={taskIndex} className={styles.taskBadge}>
                      Job {task.job + 1} (Op. {task.task}): {task.start}-{task.start + task.duration} ({task.duration}h)
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Diagramme de Gantt */}
          <div className={`${styles.section} ${styles.chartSection}`}>
            <div className={styles.chartHeader}>
              <h3>📊 Diagramme de Gantt</h3>
              {result.gantt_url && (
                <button onClick={downloadGanttChart} className={styles.downloadButton}>
                  📥 Télécharger
                </button>
              )}
            </div>
            <div className={styles.chartContainer}>
              {result.gantt_url ? (
                <img
                  src={result.gantt_url}
                  alt="Diagramme de Gantt"
                  className={styles.chart}
                />
              ) : (
                <p>Diagramme de Gantt non disponible</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Agenda */}
      {agendaData && (
        <div className={`${styles.section} ${styles.agendaResults}`}>
          <h2 className={styles.agendaTitle}>📅 Agenda de Production</h2>
          <div className={styles.agendaInfo}>
            <p>Agenda généré avec les contraintes horaires et les jours fériés</p>
            <div className={styles.agendaStats}>
              <span>📊 Jobs: {agendaData.total_jobs || jobs.length}</span>
              <span>🏭 Machines: {agendaData.total_machines || numMachines}</span>
              <span>⏱️ Durée totale: {agendaData.total_duration || result?.makespan} {timeUnit}</span>
            </div>
          </div>
          
          <AgendaGrid agendaData={agendaData} />
        </div>
      )}
    </div>
  );
};

export default FlowshopMachinesMultiplesForm; 