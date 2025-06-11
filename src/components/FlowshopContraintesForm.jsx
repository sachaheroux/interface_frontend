import React, { useState } from 'react';
import styles from './FlowshopContraintesForm.module.css';
import AgendaGrid from './AgendaGrid';

const FlowshopContraintesForm = () => {
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
      
      const formattedJobs = jobs.map((job, jobIndex) => {
        console.log(`DEBUG: Job ${jobIndex} raw data:`, job);
        console.log(`DEBUG: Job ${jobIndex} durations:`, job.durations);
        
        if (hasParallelMachines) {
          // Mode hybride : envoyer les durées par machine physique
          const jobData = [];
          job.durations.forEach((machineDurations, stageIndex) => {
            console.log(`DEBUG: Stage ${stageIndex} durations:`, machineDurations);
            machineDurations.forEach((duration, subMachineIndex) => {
              console.log(`DEBUG: Raw duration:`, duration, typeof duration);
              const parsedDuration = parseFloat(duration || 0);
              console.log(`DEBUG: Parsed duration:`, parsedDuration);
              jobData.push(isNaN(parsedDuration) ? 0 : parsedDuration);
            });
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

      // Vérifier si c'est un flowshop hybride (au moins une machine a plus de 1 exemplaire)
      // (utilise la variable hasParallelMachines déjà définie plus haut)

      const requestData = {
        jobs_data: formattedJobs,
        due_dates: formattedDueDates,
        unite: timeUnit,
        job_names: jobs.map(job => job.name),
        machine_names: machineNames,
        ...(hasParallelMachines && {
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

      const response = await fetch(`${API_URL}/contraintes`, {
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
        const ganttResponse = await fetch(`${API_URL}/contraintes/gantt`, {
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
          const agendaResponse = await fetch(`${API_URL}/contraintes/agenda`, {
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
      link.download = 'diagramme_gantt_contraintes.png';
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
      <div className={`${styles.section} ${styles.machineConfigSection}`}>
        <h2 className={styles.sectionTitle}>Configuration des machines</h2>
        <div className={styles.machineGrid}>
          {machineNames.map((name, index) => {
            const machineCount = machinesPerStage[index];
            const isHybrid = machineCount > 1;
            
            return (
              <div key={index} className={styles.machineConfigCard}>
                <div className={styles.machineHeader}>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => updateMachineName(index, e.target.value)}
                    className={styles.machineNameInput}
                    placeholder={`Machine ${index + 1}`}
                  />
                  {isHybrid && (
                    <span className={styles.hybridBadge}>Hybride</span>
                  )}
                </div>
                
                <div className={styles.machineCountControl}>
                  <label>Nombre d'exemplaires:</label>
                  <div className={styles.countButtons}>
                    <button
                      onClick={() => updateMachinesPerStage(index, Math.max(1, machineCount - 1))}
                      disabled={machineCount <= 1}
                      className={styles.countButton}
                      type="button"
                    >
                      -
                    </button>
                    <span className={styles.countValue}>{machineCount}</span>
                    <button
                      onClick={() => updateMachinesPerStage(index, Math.min(5, machineCount + 1))}
                      disabled={machineCount >= 5}
                      className={styles.countButton}
                      type="button"
                    >
                      +
                    </button>
                  </div>
                </div>
                
                {isHybrid && (
                  <div className={styles.hybridInfo}>
                    <small>
                      Cette étape a {machineCount} machines en parallèle.
                      Les jobs peuvent être traités simultanément.
                    </small>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Jobs et durées */}
      <div className={`${styles.section} ${styles.jobsSection}`}>
        <h2 className={styles.sectionTitle}>Jobs et durées d'exécution</h2>
        <div className={styles.tableContainer}>
          <table className={styles.jobsTable}>
            <thead>
              <tr>
                <th className={styles.jobHeader}>Job</th>
                {machineNames.map((machineName, index) => {
                  const machineCount = machinesPerStage[index];
                  return (
                    <th key={index} className={styles.machineHeader}>
                      {machineName}
                      {machineCount > 1 && (
                        <span className={styles.machineCount}>({machineCount} machines)</span>
                      )}
                    </th>
                  );
                })}
                <th className={styles.dueDateHeader}>Date limite ({timeUnit})</th>
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
                  {job.durations.map((machineDurations, machineIndex) => (
                    <td key={machineIndex} className={styles.durationCell}>
                      <div className={styles.subMachinesContainer}>
                        {machineDurations.map((duration, subMachineIndex) => {
                          const machineCount = machinesPerStage[machineIndex];
                          const getSubMachineName = (machineIndex, subIndex) => {
                            const baseName = machineNames[machineIndex] || `M${machineIndex + 1}`;
                            if (machineCount === 1) return baseName;
                            if (subIndex === 0) return baseName;
                            return baseName + String.fromCharCode(97 + subIndex - 1); // a, b, c, d...
                          };
                          
                          return (
                            <div key={subMachineIndex} className={styles.subMachineInput}>
                              <label className={styles.subMachineLabel}>
                                {getSubMachineName(machineIndex, subMachineIndex)}:
                              </label>
                              <input
                                type="number"
                                value={duration}
                                onChange={(e) => updateJobDuration(jobIndex, machineIndex, subMachineIndex, e.target.value)}
                                className={styles.durationInput}
                                min="0"
                                step="0.1"
                                placeholder="0"
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
                      value={job.dueDate}
                      onChange={(e) => {
                        const parsedValue = parseFloat(e.target.value);
                        updateJob(jobIndex, 'dueDate', isNaN(parsedValue) ? 0 : parsedValue);
                      }}
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

      {/* Paramètres avancés */}
      <div className={`${styles.section} ${styles.advancedSection}`}>
        <div className={styles.advancedHeader}>
          <h2 className={styles.sectionTitle}>Paramètres avancés</h2>
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={styles.toggleButton}
            type="button"
          >
            {showAdvanced ? '- Masquer' : '+ Afficher'}
          </button>
        </div>

        {showAdvanced && (
          <div className={styles.advancedContent}>
            {/* Date et heure de début */}
            <div className={styles.inputGroup}>
              <label htmlFor="startDateTime">Date et heure de début de production</label>
              <input
                id="startDateTime"
                type="datetime-local"
                value={startDateTime}
                onChange={(e) => setStartDateTime(e.target.value)}
                className={styles.input}
              />
            </div>

            {/* Horaires d'ouverture */}
            <div className={styles.inputGroup}>
              <label>Horaires d'ouverture</label>
              <div className={styles.timeRange}>
                <input
                  type="time"
                  value={openingHours.start}
                  onChange={(e) => setOpeningHours({...openingHours, start: e.target.value})}
                  className={styles.timeInput}
                />
                <span>à</span>
                <input
                  type="time"
                  value={openingHours.end}
                  onChange={(e) => setOpeningHours({...openingHours, end: e.target.value})}
                  className={styles.timeInput}
                />
              </div>
            </div>

            {/* Jours de weekend */}
            <div className={styles.inputGroup}>
              <label>Jours de weekend (non travaillés)</label>
              <div className={styles.checkboxGroup}>
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

            {/* Jours fériés */}
            <div className={styles.inputGroup}>
              <label>Jours fériés</label>
              <div className={styles.feriesContainer}>
                {feries.map((ferie, index) => (
                  <div key={index} className={styles.ferieRow}>
                    <input
                      type="date"
                      value={ferie}
                      onChange={(e) => updateFerie(index, e.target.value)}
                      className={styles.input}
                      placeholder="YYYY-MM-DD"
                    />
                    <button
                      onClick={() => removeFerie(index)}
                      disabled={feries.length <= 1}
                      className={styles.removeButton}
                      type="button"
                    >
                      -
                    </button>
                  </div>
                ))}
                <button
                  onClick={addFerie}
                  className={styles.addButton}
                  type="button"
                >
                  + Ajouter un jour férié
                </button>
              </div>
            </div>

            {/* Heures limites des jobs */}
            <div className={styles.inputGroup}>
              <label>Heures limites des jobs (optionnel)</label>
              <div className={styles.dueDateTimesContainer}>
                {jobs.map((job, index) => (
                  <div key={index} className={styles.dueDateTimeRow}>
                    <span className={styles.jobLabel}>{job.name}:</span>
                    <input
                      type="time"
                      value={dueDateTimes[index] || ''}
                      onChange={(e) => {
                        const newTimes = [...dueDateTimes];
                        newTimes[index] = e.target.value;
                        setDueDateTimes(newTimes);
                      }}
                      className={styles.timeInput}
                      placeholder="HH:MM"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Pauses */}
            <div className={styles.inputGroup}>
              <label>Pauses</label>
              <div className={styles.pausesContainer}>
                {pauses.map((pause, index) => (
                  <div key={index} className={styles.pauseRow}>
                    <input
                      type="text"
                      value={pause.name}
                      onChange={(e) => updatePause(index, 'name', e.target.value)}
                      className={styles.pauseNameInput}
                      placeholder="Nom de la pause"
                    />
                    <input
                      type="time"
                      value={pause.start}
                      onChange={(e) => updatePause(index, 'start', e.target.value)}
                      className={styles.timeInput}
                    />
                    <span>à</span>
                    <input
                      type="time"
                      value={pause.end}
                      onChange={(e) => updatePause(index, 'end', e.target.value)}
                      className={styles.timeInput}
                    />
                    <button
                      onClick={() => removePause(index)}
                      className={styles.removeButton}
                      type="button"
                    >
                      -
                    </button>
                  </div>
                ))}
                <button
                  onClick={addPause}
                  className={styles.addButton}
                  type="button"
                >
                  + Ajouter une pause
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

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
              {extractSequenceFromSchedule(result.planification, result.raw_machines).join(' → ') || 'Non disponible'}
            </div>
          </div>

          {/* Métriques */}
          <div className={styles.metricsGrid}>
            <div className={styles.metric}>
              <div className={styles.metricValue}>
                {result.makespan || 0}
              </div>
              <div className={styles.metricLabel}>
                Makespan (temps total) ({timeUnit})
              </div>
            </div>
            
            <div className={styles.metric}>
              <div className={styles.metricValue}>
                {result.flowtime ? result.flowtime.toFixed(2) : '0.00'}
              </div>
              <div className={styles.metricLabel}>
                Flowtime (temps moyen) ({timeUnit})
              </div>
            </div>
            
            <div className={styles.metric}>
              <div className={styles.metricValue}>
                {result.retard_cumule || 0}
              </div>
              <div className={styles.metricLabel}>
                Retard cumulé ({timeUnit})
              </div>
            </div>
          </div>

          {/* Temps de complétion */}
          <div className={styles.planificationDetails}>
            <h4>Temps de complétion</h4>
            <div className={styles.tasksList}>
              {result.completion_times && Object.entries(result.completion_times).map(([job, time]) => {
                // Remplacer "Job 0" par "Job 1", "Job 1" par "Job 2", etc.
                const jobDisplay = job.replace(/Job (\d+)/, (match, num) => `Job ${parseInt(num) + 1}`);
                return (
                  <div key={job} className={styles.taskBadge}>
                    {jobDisplay}: {time} {timeUnit}
                  </div>
                );
              })}
            </div>

            <h4 style={{ marginTop: '1.5rem' }}>Planification détaillée</h4>
            {result.raw_machines && Object.entries(result.raw_machines).map(([machineIndex, tasks]) => {
              // Afficher le nom de la machine
              const machineName = machineNames[parseInt(machineIndex)] || `Machine ${parseInt(machineIndex) + 1}`;
              
              return (
                <div key={machineIndex} className={styles.machineDetail}>
                  <strong>{machineName}</strong>
                  <div className={styles.tasksList}>
                    {tasks.map((t, i) => (
                      <div key={i} className={styles.taskBadge}>
                        {jobs[t.job]?.name || `Job ${t.job + 1}`}: {t.start} → {t.start + t.duration}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Agenda réel */}
      {agendaData && (
        <div className={`${styles.section} ${styles.agendaResults}`}>
          <h3 className={styles.agendaTitle}>📅 Agenda de production réel</h3>
          <div className={styles.agendaInfo}>
            <p>
              Cet agenda montre le planning optimisé avec les contraintes temporelles réelles :
              heures d'ouverture, pauses déjeuner, weekends et jours fériés.
            </p>
            <div className={styles.agendaStats}>
              <span>�� {agendaData.total_machines} machines</span>
              <span>📊 {agendaData.items?.length || 0} tâches planifiées</span>
              <span>⏰ Ouverture : {agendaData.opening_hours?.start} - {agendaData.opening_hours?.end}</span>
            </div>
          </div>
          <AgendaGrid 
            agendaData={agendaData} 
            dueDates={jobs.reduce((acc, job) => {
              acc[job.name] = job.dueDate;
              return acc;
            }, {})}
          />
        </div>
      )}

      {/* Diagramme de Gantt */}
      {result && result.gantt_url && (
        <div className={`${styles.section} ${styles.chartSection}`}>
          <div className={styles.chartHeader}>
            <h3>Diagramme de Gantt</h3>
          </div>
          <div className={styles.chartContainer}>
            <img
              src={result.gantt_url}
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
