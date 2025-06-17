import { useState } from "react";
import styles from "./FlowshopSPTForm.module.css";
import ExcelImportSection from "./ExcelImportSection";
import ExcelExportSectionJobshop from "./ExcelExportSectionJobshop";

function JobshopCompareForm() {
  // État initial avec format Jobshop identique aux autres algorithmes
  const [jobs, setJobs] = useState([
    { 
      name: 'Job 1', 
      tasks: [
        { machine: 0, duration: 4 },
        { machine: 1, duration: 2 },
        { machine: 2, duration: 1 }
      ], 
      dueDate: 12 
    },
    { 
      name: 'Job 2', 
      tasks: [
        { machine: 1, duration: 3 },
        { machine: 0, duration: 2 },
        { machine: 2, duration: 3 }
      ], 
      dueDate: 15 
    }
  ]);
  const [machineNames, setMachineNames] = useState(['Machine 0', 'Machine 1', 'Machine 2']);
  const [timeUnit, setTimeUnit] = useState('heures');

  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [ganttUrls, setGanttUrls] = useState({});
  const [isImporting, setIsImporting] = useState(false);
  const [importSuccess, setImportSuccess] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const API_URL = "/api";

  // Fonction utilitaire pour générer des valeurs aléatoirement
  const getRandomDuration = () => Math.floor(Math.random() * 9) + 1;
  const getRandomDueDate = () => Math.floor(Math.random() * 9) + 15; // Entre 15 et 23

  // Tous les algorithmes Jobshop sont compatibles avec n'importe quelle configuration
  const algorithmsToCompare = ["SPT", "EDD", "Contraintes"];

  // Gestion des jobs (identique aux autres algorithmes Jobshop)
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

  const addTaskToJob = (jobIndex) => {
    const newJobs = [...jobs];
    newJobs[jobIndex].tasks.push({ machine: 0, duration: getRandomDuration() });
    setJobs(newJobs);
  };

  const removeTaskFromJob = (jobIndex, taskIndex) => {
    const newJobs = [...jobs];
    if (newJobs[jobIndex].tasks.length > 1) {
      newJobs[jobIndex].tasks.splice(taskIndex, 1);
      setJobs(newJobs);
    }
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

  const addMachine = () => {
    const newMachineIndex = machineNames.length;
    setMachineNames([...machineNames, `Machine ${newMachineIndex}`]);
  };

  const removeMachine = () => {
    if (machineNames.length > 1) {
      const machineToRemove = machineNames.length - 1;
      setMachineNames(machineNames.slice(0, -1));
      
      // Supprimer toutes les tâches sur cette machine de tous les jobs
      const newJobs = jobs.map(job => ({
        ...job,
        tasks: job.tasks.filter(task => task.machine !== machineToRemove)
      }));
      setJobs(newJobs);
    }
  };

  const updateMachineName = (index, name) => {
    const newNames = [...machineNames];
    newNames[index] = name;
    setMachineNames(newNames);
  };

  const compareAlgorithms = async () => {
    setIsCalculating(true);
    setError(null);
    setResults(null);
    setGanttUrls({});

    try {
      const compareResults = {};
      const compareGanttUrls = {};

      // Préparer les données au format API Jobshop
      const jobshopData = jobs.map(job => 
        job.tasks.map(task => [task.machine, parseFloat(task.duration)])
      );
      const formattedDueDates = jobs.map(job => parseFloat(job.dueDate));
      const jobNames = jobs.map(job => job.name);

      // Lancer la comparaison pour tous les algorithmes Jobshop
      for (const algorithm of algorithmsToCompare) {
        try {
          let endpoint;
          let ganttEndpoint;

          if (algorithm === "SPT") {
            endpoint = "/jobshop/spt";
            ganttEndpoint = "/jobshop/spt/gantt";
          } else if (algorithm === "EDD") {
            endpoint = "/jobshop/edd";
            ganttEndpoint = "/jobshop/edd/gantt";
          } else if (algorithm === "Contraintes") {
            endpoint = "/jobshop/contraintes";
            ganttEndpoint = "/jobshop/contraintes/gantt";
          }

          const payload = {
            job_names: jobNames,
            machine_names: machineNames,
            jobs_data: jobshopData,
            due_dates: formattedDueDates,
            unite: timeUnit
          };

          // Calcul principal
          const resAlgo = await fetch(`${API_URL}${endpoint}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
          });

          if (!resAlgo.ok) {
            const errorData = await resAlgo.json();
            throw new Error(errorData.detail || 'Erreur API');
          }

          const algoData = await resAlgo.json();
          // Adapter la structure des résultats Jobshop pour la comparaison
          if (algoData.metrics) {
            compareResults[algorithm] = {
              makespan: algoData.metrics.makespan,
              flowtime: algoData.metrics.flowtime,
              retard_cumule: algoData.metrics.retard_cumule,
              schedule: algoData.schedule
            };
          } else {
            compareResults[algorithm] = algoData;
          }

          // Génération du Gantt
          try {
            const resGantt = await fetch(`${API_URL}${ganttEndpoint}`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload)
            });

            if (resGantt.ok) {
              const ganttBlob = await resGantt.blob();
              const ganttUrl = URL.createObjectURL(ganttBlob);
              compareGanttUrls[algorithm] = ganttUrl;
            }
          } catch (ganttError) {
            console.log(`Diagramme de Gantt non disponible pour ${algorithm}`);
          }

        } catch (error) {
          console.error(`Erreur ${algorithm}:`, error);
          compareResults[algorithm] = { error: error.message };
        }
      }

      setResults(compareResults);
      setGanttUrls(compareGanttUrls);

    } catch (error) {
      console.error('Erreur comparaison:', error);
      setError(error.message);
    } finally {
      setIsCalculating(false);
    }
  };

  const handleDownloadGantt = (algorithm) => {
    const url = ganttUrls[algorithm];
    if (url) {
      const link = document.createElement('a');
      link.href = url;
      link.download = `gantt_jobshop_${algorithm.toLowerCase()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleExcelImport = async (formData, fileName) => {
    setIsImporting(true);
    setError(null);
    setImportSuccess(null);
    setResults(null);
    setGanttUrls({});

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
      
      // Mettre à jour les données du formulaire avec les données importées
      if (data.imported_data) {
        const importedData = data.imported_data;
        
        setMachineNames(importedData.machine_names || []);
        setTimeUnit(importedData.unite || 'heures');
        
        // Reconstruire les jobs au format identique aux autres algorithmes Jobshop
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
      }
      
      setImportSuccess(`Fichier "${fileName}" importé avec succès ! Comparaison automatique en cours...`);
      
      // Lancer automatiquement la comparaison après l'import
      setTimeout(() => {
        compareAlgorithms();
      }, 500);

    } catch (error) {
      console.error('Erreur import Excel:', error);
      setError(error.message);
    } finally {
      setIsImporting(false);
    }
  };

  const getBestAlgorithm = (results, criteria) => {
    const validResults = Object.entries(results).filter(([_, result]) => !result.error);
    if (validResults.length === 0) return null;

    let best = validResults[0];
    
    for (const [algorithm, result] of validResults) {
      if (criteria === "makespan" && result.makespan < best[1].makespan) {
        best = [algorithm, result];
      } else if (criteria === "flowtime" && result.flowtime < best[1].flowtime) {
        best = [algorithm, result];
      } else if (criteria === "retard_cumule" && result.retard_cumule < best[1].retard_cumule) {
        best = [algorithm, result];
      }
    }
    
    return best;
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Comparaison des algorithmes Jobshop</h1>
        <p className={styles.subtitle}>Comparez automatiquement tous les algorithmes Jobshop disponibles</p>
      </div>

      <div className={styles.content}>
        {/* Section Export Excel */}
        <ExcelExportSectionJobshop
          jobs={jobs}
          dueDates={jobs.map(job => job.dueDate)}
          jobNames={jobs.map(job => job.name)}
          machineNames={machineNames}
          unite={timeUnit}
          algorithmName="Comparaison_Jobshop"
          algorithmEndpoint="jobshop/spt"
          API_URL={API_URL}
        />

        {/* Section Import Excel */}
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

        {/* Jobs - Vue compacte tabulaire identique aux autres algorithmes Jobshop */}
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

        {/* Algorithmes à comparer */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>🔄 Algorithmes Jobshop disponibles</h3>
          <div className={styles.algorithmsInfo}>
            <p>Tous les algorithmes Jobshop seront comparés automatiquement :</p>
            <div className={styles.algorithmsList}>
              {algorithmsToCompare.map(algo => (
                <span key={algo} className={styles.algorithmBadge}>
                  ✅ {algo}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Gestion des erreurs */}
        {error && (
          <div className={styles.errorSection}>
            <div className={styles.errorBox}>
              <span className={styles.errorIcon}>⚠️</span>
              <span className={styles.errorText}>{error}</span>
            </div>
          </div>
        )}

        {/* Bouton de comparaison */}
        <button 
          className={styles.calculateButton} 
          onClick={compareAlgorithms}
          disabled={isCalculating}
        >
          {isCalculating ? 'Comparaison en cours...' : 'Comparer tous les algorithmes Jobshop'}
        </button>

        {/* Résultats de comparaison */}
        {results && (
          <div className={styles.resultsSection}>
            <h3 className={styles.resultsTitle}>Résultats de la comparaison</h3>
            
            {/* Tableau comparatif */}
            <div className={styles.comparisonTableSection}>
              <h4>📊 Tableau comparatif</h4>
              <div className={styles.tableContainer}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Algorithme</th>
                      <th>Makespan ({timeUnit})</th>
                      <th>Flowtime moyen ({timeUnit})</th>
                      <th>Retard cumulé ({timeUnit})</th>
                      <th>Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(results).map(([algorithm, result]) => (
                      <tr key={algorithm} className={result.error ? styles.errorRow : styles.successRow}>
                        <td><strong>{algorithm}</strong></td>
                        <td>{result.error ? "❌" : result.makespan?.toFixed(2) || "N/A"}</td>
                        <td>{result.error ? "❌" : result.flowtime?.toFixed(2) || "N/A"}</td>
                        <td>{result.error ? "❌" : result.retard_cumule?.toFixed(2) || "N/A"}</td>
                        <td>{result.error ? `Erreur: ${result.error}` : "✅ Succès"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Meilleurs algorithmes par critère */}
            <div className={styles.bestAlgorithmsSection}>
              <h4>🏆 Meilleurs algorithmes par critère</h4>
              <div className={styles.metricsGrid}>
                {["makespan", "flowtime", "retard_cumule"].map(criteria => {
                  const best = getBestAlgorithm(results, criteria);
                  const criteriaNames = {
                    makespan: "Makespan",
                    flowtime: "Flowtime moyen", 
                    retard_cumule: "Retard cumulé"
                  };
                  return best ? (
                    <div key={criteria} className={styles.metric}>
                      <div className={styles.metricValue}>{best[1][criteria]?.toFixed(2)}</div>
                      <div className={styles.metricLabel}>{criteriaNames[criteria]} - {best[0]} ({timeUnit})</div>
                    </div>
                  ) : null;
                })}
              </div>
            </div>
          </div>
        )}

        {/* Diagrammes de Gantt */}
        {Object.keys(ganttUrls).length > 0 && (
          <div className={styles.chartSection}>
            <div className={styles.chartHeader}>
              <h3>Diagrammes de Gantt</h3>
            </div>
            {Object.entries(ganttUrls).map(([algorithm, url]) => (
              <div key={algorithm} className={styles.chartContainer}>
                <h4>{algorithm}</h4>
                <img src={url} alt={`Diagramme de Gantt - ${algorithm}`} className={styles.chart} />
                <button onClick={() => handleDownloadGantt(algorithm)} className={styles.downloadButton}>
                  Télécharger le diagramme - {algorithm}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default JobshopCompareForm; 