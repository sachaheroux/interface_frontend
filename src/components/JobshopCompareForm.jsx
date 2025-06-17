import { useState } from "react";
import styles from "./FlowshopSPTForm.module.css";
import ExcelImportSection from "./ExcelImportSection";
import ExcelExportSectionJobshop from "./ExcelExportSectionJobshop";

function JobshopCompareForm() {
  // État initial avec format Jobshop: [machine, duration] par tâche
  const [jobs, setJobs] = useState([
    [[0, 3], [1, 2], [2, 1]],  // Job 0: Machine 0 (3h), Machine 1 (2h), Machine 2 (1h)
    [[1, 2], [0, 4], [2, 3]]   // Job 1: Machine 1 (2h), Machine 0 (4h), Machine 2 (3h)
  ]);
  const [dueDates, setDueDates] = useState([10, 12]);
  const [jobNames, setJobNames] = useState(["Job 0", "Job 1"]);
  const [machineNames, setMachineNames] = useState(["Machine 0", "Machine 1", "Machine 2"]);
  const [unite, setUnite] = useState("heures");

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

  const addJob = () => {
    const numMachines = machineNames.length;
    // Créer une séquence aléatoire de toutes les machines pour le nouveau job
    const machineSequence = Array.from({ length: numMachines }, (_, i) => i);
    // Mélanger la séquence pour plus de variété
    for (let i = machineSequence.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [machineSequence[i], machineSequence[j]] = [machineSequence[j], machineSequence[i]];
    }
    
    const newJob = machineSequence.map(machine => [machine, getRandomDuration()]);
    setJobs([...jobs, newJob]);
    setDueDates([...dueDates, getRandomDueDate()]);
    setJobNames([...jobNames, `Job ${jobs.length}`]);
  };

  const removeJob = () => {
    if (jobs.length > 1) {
      setJobs(jobs.slice(0, -1));
      setDueDates(dueDates.slice(0, -1));
      setJobNames(jobNames.slice(0, -1));
    }
  };

  const addMachine = () => {
    const newMachineIndex = machineNames.length;
    setMachineNames([...machineNames, `Machine ${newMachineIndex}`]);
    
    // Ajouter une tâche sur la nouvelle machine à chaque job (à la fin)
    const newJobs = jobs.map(job => [...job, [newMachineIndex, getRandomDuration()]]);
    setJobs(newJobs);
  };

  const removeMachine = () => {
    if (machineNames.length > 1) {
      const machineToRemove = machineNames.length - 1;
      setMachineNames(machineNames.slice(0, -1));
      
      // Supprimer toutes les tâches sur cette machine de tous les jobs
      const newJobs = jobs.map(job => job.filter(([machine]) => machine !== machineToRemove));
      setJobs(newJobs);
    }
  };

  const compareAlgorithms = async () => {
    setIsCalculating(true);
    setError(null);
    setResults(null);
    setGanttUrls({});

    try {
      const compareResults = {};
      const compareGanttUrls = {};

      // Préparer les données au format Jobshop
      const jobshopData = jobs.map(job => 
        job.map(([machine, duration]) => [machine, parseFloat(duration)])
      );
      const formattedDueDates = dueDates.map(d => parseFloat(d));

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
            unite: unite
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
        
        setJobNames(importedData.job_names || []);
        setMachineNames(importedData.machine_names || []);
        setUnite(importedData.unite || 'heures');
        
        // Reconstruire les jobs au format Jobshop
        if (importedData.jobs_data && importedData.jobs_data.length > 0) {
          const newJobs = importedData.jobs_data.map(job => 
            job.map(([machine, duration]) => [machine, parseFloat(duration)])
          );
          setJobs(newJobs);
        }
        
        // Mettre à jour les dates d'échéance
        if (importedData.due_dates && importedData.due_dates.length > 0) {
          setDueDates(importedData.due_dates.map(date => parseFloat(date)));
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
          dueDates={dueDates}
          jobNames={jobNames}
          machineNames={machineNames}
          unite={unite}
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
        <div className={styles.configSection}>
          <div className={styles.configRow}>
            <div className={styles.inputGroup}>
              <label>Unité de temps</label>
              <select 
                value={unite} 
                onChange={e => setUnite(e.target.value)} 
                className={styles.select}
              >
                <option value="minutes">minutes</option>
                <option value="heures">heures</option>
                <option value="jours">jours</option>
              </select>
            </div>
            
            <div className={styles.actionButtons}>
              <button className={styles.addButton} onClick={addJob}>
                + Ajouter un job
              </button>
              <button className={styles.removeButton} onClick={removeJob} disabled={jobs.length <= 1}>
                - Supprimer un job
              </button>
              <button className={styles.addButton} onClick={addMachine}>
                + Ajouter une machine
              </button>
              <button className={styles.removeButton} onClick={removeMachine} disabled={machineNames.length <= 1}>
                - Supprimer une machine
              </button>
            </div>
          </div>
        </div>

        {/* Tableau des noms de machines */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Configuration des machines</h3>
          <div className={styles.machinesTable}>
            <div className={styles.tableRow}>
              {machineNames.map((name, i) => (
                <div key={i} className={styles.machineInput}>
                  <label>M{i}</label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => {
                      const newNames = [...machineNames];
                      newNames[i] = e.target.value;
                      setMachineNames(newNames);
                    }}
                    className={styles.input}
                    placeholder={`Machine ${i}`}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tableau principal des jobs */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Matrice des temps de traitement (Jobshop)</h3>
          <div className={styles.dataTable}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.jobNameHeader}>Job</th>
                  <th className={styles.sequenceHeader}>Séquence machines + Durées ({unite})</th>
                  <th className={styles.dueDateHeader}>Date due ({unite})</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job, jobIdx) => (
                  <tr key={jobIdx} className={styles.jobRow}>
                    <td className={styles.jobNameCell}>
                      <input
                        type="text"
                        value={jobNames[jobIdx]}
                        onChange={e => {
                          const newNames = [...jobNames];
                          newNames[jobIdx] = e.target.value;
                          setJobNames(newNames);
                        }}
                        className={styles.jobNameInput}
                        placeholder={`Job ${jobIdx}`}
                      />
                    </td>
                    <td className={styles.sequenceCell}>
                      <div className={styles.jobshopSequence}>
                        {job.map((task, taskIdx) => (
                          <div key={taskIdx} className={styles.taskGroup}>
                            <select
                              value={task[0]}
                              onChange={e => {
                                const newJobs = [...jobs];
                                newJobs[jobIdx][taskIdx][0] = parseInt(e.target.value);
                                setJobs(newJobs);
                              }}
                              className={styles.machineSelect}
                            >
                              {machineNames.map((_, machineIdx) => (
                                <option key={machineIdx} value={machineIdx}>
                                  M{machineIdx}
                                </option>
                              ))}
                            </select>
                            <input
                              type="number"
                              step="0.1"
                              min="0"
                              value={task[1]}
                              onChange={e => {
                                const newJobs = [...jobs];
                                newJobs[jobIdx][taskIdx][1] = parseFloat(e.target.value) || 0;
                                setJobs(newJobs);
                              }}
                              className={styles.durationInput}
                              placeholder="0"
                            />
                            {taskIdx < job.length - 1 && (
                              <span className={styles.sequenceArrow}>→</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className={styles.dueDateCell}>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        value={dueDates[jobIdx]}
                        onChange={e => {
                          const newDates = [...dueDates];
                          newDates[jobIdx] = parseFloat(e.target.value) || 0;
                          setDueDates(newDates);
                        }}
                        className={styles.dueDateInput}
                        placeholder="0"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
                      <th>Makespan ({unite})</th>
                      <th>Flowtime moyen ({unite})</th>
                      <th>Retard cumulé ({unite})</th>
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
                      <div className={styles.metricLabel}>{criteriaNames[criteria]} - {best[0]} ({unite})</div>
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