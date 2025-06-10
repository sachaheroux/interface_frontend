import React, { useState } from 'react';
import styles from './FlowshopContraintesForm.module.css';
import AgendaGrid from './AgendaGrid';

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
      
      const newNames = Array.from({ length: newCount }, (_, i) => 
        machineNames[i] || `Machine ${i}`
      );
      setMachineNames(newNames);
      
      setJobs(jobs.map(job => ({
        ...job,
        durations: job.durations.slice(0, newCount).concat(
          Array(Math.max(0, newCount - job.durations.length)).fill(0).map(() => generateRandomDuration())
        )
      })));
    }
  };

  const addJob = () => {
    const newJobNumber = jobs.length + 1;
    setJobs([...jobs, {
      name: `Job ${newJobNumber}`,
      durations: Array(numMachines).fill(0).map(() => generateRandomDuration()),
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

  const updateJobDuration = (jobIndex, machineIndex, value) => {
    const newJobs = [...jobs];
    const parsedValue = parseFloat(value);
    newJobs[jobIndex].durations[machineIndex] = isNaN(parsedValue) ? 0 : parsedValue;
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
        job.durations.map((duration, machineIndex) => {
          const parsedDuration = parseFloat(duration);
          return [machineIndex, isNaN(parsedDuration) ? 0 : parsedDuration];
        })
      );
      const formattedDueDates = jobs.map(job => {
        const parsedDueDate = parseFloat(job.dueDate);
        return isNaN(parsedDueDate) ? 0 : parsedDueDate;
      });

      const requestData = {
        jobs_data: formattedJobs,
        due_dates: formattedDueDates,
        unite: timeUnit,
        job_names: jobs.map(job => job.name),
        machine_names: machineNames
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
              {result.completion_times && Object.entries(result.completion_times).map(([job, time]) => (
                <div key={job} className={styles.taskBadge}>
                  {job}: {time} {timeUnit}
                </div>
              ))}
            </div>

            <h4 style={{ marginTop: '1.5rem' }}>Planification détaillée</h4>
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

export default FlowshopContraintesForm;


