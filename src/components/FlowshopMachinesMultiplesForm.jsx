import React, { useState } from 'react';
import styles from './FlowshopContraintesForm.module.css';
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



  const calculateOptimization = async () => {
    setIsCalculating(true);
    setError('');
    
    try {
      // Format des données pour machines multiples (TOUJOURS format à 4 niveaux pour cet algorithme)
      const hasParallelMachines = machinesPerStage.some(count => count > 1);
      
      const formattedJobs = jobs.map((job, jobIndex) => {
        console.log(`DEBUG: Job ${jobIndex} raw data:`, job);
        console.log(`DEBUG: Job ${jobIndex} durations:`, job.durations);
        
        // TOUJOURS utiliser le format machines multiples pour cet algorithme
        const jobData = [];
        job.durations.forEach((machineDurations, stageIndex) => {
          const alternatives = [];
          machineDurations.forEach((duration, subMachineIndex) => {
            // Système de numérotation : étape (base 1) * 10 + (subMachineIndex + 1)
            // Étape 1: 11, 12, 13... Étape 2: 21, 22, 23... etc.
            const machineId = (stageIndex + 1) * 10 + (subMachineIndex + 1);
            alternatives.push([machineId, parseFloat(duration) || 0]);
          });
          jobData.push(alternatives);
        });
        console.log(`DEBUG: Job ${jobIndex} final data:`, jobData);
        return jobData;
      });
      const formattedDueDates = jobs.map(job => {
        const parsedDueDate = parseFloat(job.dueDate);
        return isNaN(parsedDueDate) ? 0 : parsedDueDate;
      });

      // Générer automatiquement les priorités basées sur l'ordre dans la matrice
      const machinePriorities = {};
      jobs.forEach(job => {
        job.durations.forEach((machineDurations, stageIndex) => {
          machineDurations.forEach((duration, subMachineIndex) => {
            const machineId = (stageIndex + 1) * 10 + (subMachineIndex + 1);
            // Priorité basée sur l'ordre : 1ère position = priorité 1, 2ème = priorité 2, etc.
            machinePriorities[machineId] = subMachineIndex + 1;
          });
        });
      });

      const requestData = {
        jobs_data: formattedJobs,
        due_dates: formattedDueDates,
        unite: timeUnit,
        job_names: jobs.map(job => job.name),
        machine_names: machineNames,
        stage_names: machineNames,
        machines_per_stage: machinesPerStage,
        machine_priorities: machinePriorities
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

            {/* Configuration des machines */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Configuration des machines</h2>
        <div className={styles.machinesTable}>
          <div className={styles.tableRow}>
            {machineNames.map((name, index) => (
              <div key={index} className={styles.machineInput}>
                <label htmlFor={`machine-${index}`}>M{index + 1}</label>
                <input
                  id={`machine-${index}`}
                  type="text"
                  value={name}
                  onChange={(e) => updateMachineName(index, e.target.value)}
                  className={styles.input}
                  placeholder={`Machine ${index + 1}`}
                />
                <select
                  value={machinesPerStage[index]}
                  onChange={(e) => updateMachinesPerStage(index, parseInt(e.target.value))}
                  className={styles.qtySelectConfig}
                  title="Nombre de machines identiques"
                >
                  <option value={1}>Qté: 1</option>
                  <option value={2}>Qté: 2</option>
                  <option value={3}>Qté: 3</option>
                  <option value={4}>Qté: 4</option>
                  <option value={5}>Qté: 5</option>
                </select>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tableau des données */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Matrice des temps de traitement</h2>
        
        {/* Message d'information sur les priorités */}
        <div className={styles.priorityInfo}>
          <div className={styles.priorityInfoIcon}>🎯</div>
          <div className={styles.priorityInfoContent}>
            <h4 className={styles.priorityInfoTitle}>Priorités automatiques des machines</h4>
            <p className={styles.priorityInfoText}>
              Quand plusieurs machines alternatives sont disponibles pour une même tâche, 
              l'algorithme favorise automatiquement la <strong>première ligne</strong> (priorité la plus élevée), 
              puis la <strong>deuxième ligne</strong>, etc. Cela n'affecte jamais le makespan optimal, 
              mais permet de choisir les meilleures machines en cas de solutions équivalentes.
            </p>
            <div className={styles.priorityExample}>
              <span className={styles.priorityBadge}>M1 = Priorité 1</span>
              <span className={styles.priorityBadge}>M1a = Priorité 2</span>
              <span className={styles.priorityBadge}>M1b = Priorité 3</span>
            </div>
          </div>
        </div>
        <div className={styles.dataTable}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.jobNameHeader}>Job</th>
                {machineNames.map((name, index) => (
                  <th key={index} className={styles.machineHeader}>
                    Durée sur {name} ({timeUnit})
                    {machinesPerStage[index] > 1 && (
                      <><br /><small>({machinesPerStage[index]} machines)</small></>
                    )}
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
                  {job.durations.map((machineDurations, machineIndex) => (
                    <td key={machineIndex} className={styles.durationCell}>
                      <div className={styles.durationGroup}>
                        {machineDurations.map((duration, subMachineIndex) => {
                          // Générer le nom de la sous-machine : M1, M1a, M1b, etc.
                          const getSubMachineName = (machineIndex, subIndex) => {
                            const baseName = `M${machineIndex + 1}`;
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

      {/* Paramètres d'agenda avancés */}
      <div className={`${styles.section} ${styles.agendaSection}`}>
        <h2 className={styles.sectionTitle}>
          📅 Agenda réel de production
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={styles.toggleButton}
          >
            {showAdvanced ? 'Masquer' : 'Configurer'}
          </button>
        </h2>
        
        {showAdvanced && (
          <div className={styles.advancedParams}>
            <div className={styles.paramRow}>
              <div className={styles.inputGroup}>
                <label htmlFor="startDateTime">Date/heure de début</label>
                <input
                  id="startDateTime"
                  type="datetime-local"
                  value={startDateTime}
                  onChange={(e) => setStartDateTime(e.target.value)}
                  className={styles.input}
                />
              </div>
              
              <div className={styles.inputGroup}>
                <label htmlFor="openingStart">Heure d'ouverture</label>
                <input
                  id="openingStart"
                  type="time"
                  value={openingHours.start}
                  onChange={(e) => setOpeningHours({...openingHours, start: e.target.value})}
                  className={styles.input}
                />
              </div>
              
              <div className={styles.inputGroup}>
                <label htmlFor="openingEnd">Heure de fermeture</label>
                <input
                  id="openingEnd"
                  type="time"
                  value={openingHours.end}
                  onChange={(e) => setOpeningHours({...openingHours, end: e.target.value})}
                  className={styles.input}
                />
              </div>
            </div>
            
            <div className={styles.paramRow}>
              <div className={styles.checkboxGroup}>
                <label>Jours chômés :</label>
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
            </div>

            <div className={styles.paramRow}>
              <div className={styles.inputGroup}>
                <label>🎄 Jours fériés</label>
                <div className={styles.listContainer}>
                  {feries.map((ferie, index) => (
                    <div key={index} className={styles.listItem}>
                      <input
                        type="date"
                        value={ferie}
                        onChange={(e) => updateFerie(index, e.target.value)}
                        className={styles.input}
                      />
                      {feries.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeFerie(index)}
                          className={styles.removeItemButton}
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addFerie}
                    className={styles.addItemButton}
                  >
                    + Ajouter un jour férié
                  </button>
                </div>
              </div>
              
              <div className={styles.inputGroup}>
                <label>⏸️ Pauses</label>
                <div className={styles.listContainer}>
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
                        type="button"
                        onClick={() => removePause(index)}
                        className={styles.removeItemButton}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addPause}
                    className={styles.addItemButton}
                  >
                    + Ajouter une pause
                  </button>
                </div>
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
          <h2 className={styles.resultsTitle}>Résultats de l'optimisation</h2>

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
              <span>🏭 {agendaData.total_machines} machines</span>
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

export default FlowshopMachinesMultiplesForm; 