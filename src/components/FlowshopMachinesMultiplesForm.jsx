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
  const [machinesPerStage, setMachinesPerStage] = useState([1, 1]);
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

  const generateRandomDuration = () => {
    return Math.floor(Math.random() * 10) + 1;
  };

  const adjustMachineCount = (newCount) => {
    if (newCount >= 1 && newCount <= 10) {
      setNumMachines(newCount);
      
      const newNames = Array.from({ length: newCount }, (_, i) => 
        machineNames[i] || `Machine ${i + 1}`
      );
      setMachineNames(newNames);
      
      const newMachinesPerStage = Array.from({ length: newCount }, (_, i) => 
        machinesPerStage[i] || 1
      );
      setMachinesPerStage(newMachinesPerStage);
      
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
      
      setJobs(jobs.map(job => {
        const newDurations = [...job.durations];
        if (newDurations[machineIndex]) {
          const currentDurations = newDurations[machineIndex];
          if (currentDurations.length < machineCount) {
            newDurations[machineIndex] = [
              ...currentDurations,
              ...Array(machineCount - currentDurations.length).fill(0).map(() => generateRandomDuration())
            ];
          } else if (currentDurations.length > machineCount) {
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
      dueDate: generateRandomDuration() * 5
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
    const dataToUse = rawMachines || planification;
    if (!dataToUse || typeof dataToUse !== 'object') return [];

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

    const firstTasks = allTasks.filter(task => task.task_id === 0);
    firstTasks.sort((a, b) => a.start - b.start);
    const sequence = firstTasks.map(task => task.job + 1);
    
    const uniqueJobs = [...new Set(allTasks.map(task => task.job))];
    const missingJobs = uniqueJobs.filter(job => !sequence.includes(job + 1));
    
    if (missingJobs.length > 0) {
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
      const hasParallelMachines = machinesPerStage.some(count => count > 1);
      
      const formattedJobs = jobs.map((job, jobIndex) => {
        if (hasParallelMachines) {
          const jobData = [];
          job.durations.forEach((machineDurations, stageIndex) => {
            const alternatives = [];
            machineDurations.forEach((duration, subMachineIndex) => {
              const physicalMachineId = machinesPerStage.slice(0, stageIndex).reduce((sum, count) => sum + count, 0) + subMachineIndex;
              alternatives.push([physicalMachineId, duration]);
            });
            
            jobData.push(alternatives);
          });
          return jobData;
        } else {
          return job.durations.map((machineDurations, machineIndex) => [machineIndex, machineDurations[0] || 0]);
        }
      });

      const requestData = {
        jobs_data: formattedJobs,
        due_dates: jobs.map(job => job.dueDate),
        unite: timeUnit,
        job_names: jobs.map(job => job.name),
        machine_names: machineNames,
        agenda_start_datetime: startDateTime,
        opening_hours: openingHours,
        weekend_days: Object.keys(weekendDays).filter(day => weekendDays[day]),
        jours_feries: feries.filter(f => f),
        due_date_times: dueDateTimes.filter(t => t),
        pauses: pauses
      };

      const response = await fetch(`${API_URL}/flowshop/machines_multiples`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();
      setResult(data);

      if (showAdvanced && startDateTime) {
        try {
          const agendaResponse = await fetch(`${API_URL}/flowshop/machines_multiples/agenda`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestData),
          });

          if (agendaResponse.ok) {
            const agendaResult = await agendaResponse.json();
            setAgendaData(agendaResult);
          }
        } catch (agendaError) {
          console.log('Agenda non disponible:', agendaError);
        }
      }

      try {
        const ganttResponse = await fetch(`${API_URL}/flowshop/machines_multiples/gantt`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestData),
        });

        if (ganttResponse.ok) {
          const ganttBlob = await ganttResponse.blob();
          const ganttUrl = URL.createObjectURL(ganttBlob);
          setResult(prev => ({ ...prev, gantt_url: ganttUrl }));
        }
      } catch (ganttError) {
        console.log('Diagramme de Gantt non disponible:', ganttError);
      }

    } catch (err) {
      setError(err.message || 'Une erreur est survenue lors du calcul');
      console.error('Erreur:', err);
    } finally {
      setIsCalculating(false);
    }
  };

  const downloadGanttChart = () => {
    if (result && result.gantt_url) {
      const link = document.createElement('a');
      link.href = result.gantt_url;
      link.download = 'gantt_flowshop_machines_multiples.png';
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
    setPauses([...pauses, { start: '15:00', end: '15:15', name: 'Pause' }]);
  };

  const removePause = (index) => {
    setPauses(pauses.filter((_, i) => i !== index));
  };

  const updatePause = (index, field, value) => {
    const newPauses = [...pauses];
    newPauses[index][field] = value;
    setPauses(newPauses);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Machines Multiples</h1>
        <p className={styles.subtitle}>
          Optimisation de flowshop avec machines multiples par étape utilisant OR-Tools pour gérer les alternatives de machines
        </p>
      </div>

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

      <div className={`${styles.section} ${styles.machinesSection}`}>
        <h2 className={styles.sectionTitle}>🏭 Configuration des machines par étape</h2>
        <p className={styles.helpText}>
          Définissez le nombre de machines parallèles disponibles pour chaque étape du processus.
        </p>
        <div className={styles.machinesGrid}>
          {Array.from({ length: numMachines }, (_, machineIndex) => (
            <div key={machineIndex} className={styles.machineConfig}>
              <div className={styles.machineHeader}>
                <input
                  type="text"
                  value={machineNames[machineIndex]}
                  onChange={(e) => updateMachineName(machineIndex, e.target.value)}
                  className={styles.machineNameInput}
                />
              </div>
              <div className={styles.machineCountControl}>
                <label>Nombre de machines parallèles:</label>
                <div className={styles.countControls}>
                  <button
                    type="button"
                    onClick={() => updateMachinesPerStage(machineIndex, machinesPerStage[machineIndex] - 1)}
                    disabled={machinesPerStage[machineIndex] <= 1}
                    className={styles.countButton}
                  >
                    -
                  </button>
                  <span className={styles.countValue}>{machinesPerStage[machineIndex]}</span>
                  <button
                    type="button"
                    onClick={() => updateMachinesPerStage(machineIndex, machinesPerStage[machineIndex] + 1)}
                    disabled={machinesPerStage[machineIndex] >= 5}
                    className={styles.countButton}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={`${styles.section} ${styles.dataSection}`}>
        <h2 className={styles.sectionTitle}>⚙️ Durées des tâches par job et machine</h2>
        <div className={styles.tableContainer}>
          <table className={styles.dataTable}>
            <thead>
              <tr>
                <th className={styles.jobHeader}>Job</th>
                {Array.from({ length: numMachines }, (_, machineIndex) => (
                  <th key={machineIndex} className={styles.machineHeader}>
                    {machineNames[machineIndex]}
                    <div className={styles.machineSubInfo}>
                      {machinesPerStage[machineIndex]} machine{machinesPerStage[machineIndex] > 1 ? 's' : ''}
                    </div>
                  </th>
                ))}
                <th className={styles.dueDateHeader}>Due Date ({timeUnit})</th>
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
                      className={styles.jobNameInput}
                      placeholder={`Job ${jobIndex + 1}`}
                    />
                  </td>
                  {Array.from({ length: numMachines }, (_, machineIndex) => (
                    <td key={machineIndex} className={styles.durationCell}>
                      <div className={styles.machineAlternatives}>
                        {job.durations[machineIndex]?.map((duration, subMachineIndex) => {
                          const getSubMachineName = (machineIndex, subIndex) => {
                            const baseName = `M${machineIndex + 1}`;
                            if (subIndex === 0) return baseName;
                            return baseName + String.fromCharCode(97 + subIndex - 1);
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

      {error && (
        <div className={styles.errorSection}>
          <div className={styles.errorBox}>
            <span className={styles.errorIcon}>⚠️</span>
            <span className={styles.errorText}>{error}</span>
          </div>
        </div>
      )}

      <button
        onClick={calculateOptimization}
        disabled={isCalculating}
        className={styles.calculateButton}
        type="button"
      >
        {isCalculating ? 'Calcul en cours...' : 'Calculer l\'optimisation'}
      </button>

      {result && (
        <div className={`${styles.section} ${styles.resultsSection}`}>
          <h2 className={styles.resultsTitle}>Résultats de l'optimisation</h2>

          <div className={styles.sequenceSection}>
            <h3 className={styles.sequenceTitle}>Séquence optimale calculée</h3>
            <div className={styles.sequenceValue}>
              {extractSequenceFromSchedule(result.planification, result.raw_machines).join(' → ') || 'Non disponible'}
            </div>
          </div>

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

          <div className={styles.planificationDetails}>
            <h4>Temps de complétion</h4>
            <div className={styles.tasksList}>
              {result.completion_times && Object.entries(result.completion_times).map(([job, time]) => {
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