import { useState, useEffect } from "react";
import styles from "./FlowshopSPTForm.module.css"; // Réutiliser les styles existants
import ExcelImportSection from "./ExcelImportSection";
import ExcelExportSection from "./ExcelExportSection";

function FlowshopCompareForm() {
  const [jobs, setJobs] = useState([
    [{ machine: "0", duration: "3" }, { machine: "1", duration: "2" }],
    [{ machine: "0", duration: "2" }, { machine: "1", duration: "4" }]
  ]);
  const [dueDates, setDueDates] = useState(["10", "9"]);
  const [jobNames, setJobNames] = useState(["Job 0", "Job 1"]);
  const [machineNames, setMachineNames] = useState(["Machine 0", "Machine 1"]);
  const [unite, setUnite] = useState("heures");

  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [ganttUrls, setGanttUrls] = useState({});
  const [isImporting, setIsImporting] = useState(false);
  const [importSuccess, setImportSuccess] = useState(null);
  const [compatibleAlgorithms, setCompatibleAlgorithms] = useState([]);
  const [excludedAlgorithms, setExcludedAlgorithms] = useState([]);

  const API_URL = "/api";

  // Fonction utilitaire pour générer des valeurs aléatoirement entre 1 et 9
  const getRandomDuration = () => String(Math.floor(Math.random() * 9) + 1);
  const getRandomDueDate = () => String(Math.floor(Math.random() * 9) + 10);

  // Déterminer les algorithmes compatibles selon le nombre de machines
  useEffect(() => {
    const numMachines = jobs[0]?.length || 0;
    const compatible = [];
    const excluded = [];

    // SPT, EDD, Contraintes : n'importe quel nombre de machines
    if (numMachines >= 1) {
      compatible.push("SPT", "EDD", "Contraintes");
    }

    // Smith : exactement 1 machine
    if (numMachines === 1) {
      compatible.push("Smith");
    } else if (numMachines > 1) {
      excluded.push({ name: "Smith", reason: "Nécessite exactement 1 machine" });
    }

    // Johnson : exactement 2 machines
    if (numMachines === 2) {
      compatible.push("Johnson");
    } else if (numMachines === 1) {
      excluded.push({ name: "Johnson", reason: "Nécessite exactement 2 machines" });
    } else if (numMachines > 2) {
      excluded.push({ name: "Johnson", reason: "Nécessite exactement 2 machines" });
    }

    // Johnson modifié : minimum 3 machines
    if (numMachines >= 3) {
      compatible.push("Johnson modifié");
    } else {
      excluded.push({ name: "Johnson modifié", reason: "Nécessite au minimum 3 machines" });
    }

    setCompatibleAlgorithms(compatible);
    setExcludedAlgorithms(excluded);
  }, [jobs]);

  const addJob = () => {
    const machineCount = jobs[0].length;
    const newJob = Array.from({ length: machineCount }, (_, i) => ({ machine: String(i), duration: getRandomDuration() }));
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

  const addTaskToAllJobs = () => {
    const updatedJobs = jobs.map(job => [...job, { machine: String(job.length), duration: getRandomDuration() }]);
    setJobs(updatedJobs);
    setMachineNames([...machineNames, `Machine ${machineNames.length}`]);
  };

  const removeTaskFromAllJobs = () => {
    if (jobs[0].length > 1) {
      const updatedJobs = jobs.map(job => job.slice(0, -1));
      setJobs(updatedJobs);
      setMachineNames(machineNames.slice(0, -1));
    }
  };

  const handleCompareAlgorithms = async () => {
    setError(null);
    setResults(null);
    setGanttUrls({});

    try {
      const algorithmsToCompare = compatibleAlgorithms;
      if (algorithmsToCompare.length === 0) {
        setError("Aucun algorithme compatible avec cette configuration.");
        return;
      }

      const compareResults = {};
      const compareGanttUrls = {};

      // Préparer les données selon le format requis par chaque algorithme
      for (const algorithm of algorithmsToCompare) {
        try {
          let payload;
          let endpoint;
          let ganttEndpoint;

          if (algorithm === "Johnson") {
            // Johnson utilise un format simplifié [durée1, durée2]
            payload = {
              jobs_data: jobs.map(job => job.map(op => parseFloat(op.duration.replace(",", ".")))),
              due_dates: dueDates.map(d => parseFloat(d.replace(",", "."))),
              unite,
              job_names: jobNames,
              machine_names: machineNames
            };
            endpoint = "/johnson";
            ganttEndpoint = "/johnson/gantt";
          } else if (algorithm === "Johnson modifié") {
            // Johnson modifié utilise le format standard [machine, durée]
            payload = {
              jobs_data: jobs.map(job =>
                job.map(op => [parseInt(op.machine, 10), parseFloat(op.duration.replace(",", "."))])
              ),
              due_dates: dueDates.map(d => parseFloat(d.replace(",", "."))),
              unite,
              job_names: jobNames,
              machine_names: machineNames
            };
            endpoint = "/johnson_modifie";
            ganttEndpoint = "/johnson_modifie/gantt";
          } else if (algorithm === "Smith") {
            // Smith utilise un format spécial avec seulement les durées
            payload = {
              jobs: jobs.map(job => job.map(op => parseFloat(op.duration.replace(",", ".")))),
              unite,
              job_names: jobNames
            };
            endpoint = "/smith";
            ganttEndpoint = "/smith/gantt";
          } else {
            // SPT, EDD, Contraintes utilisent le format standard
            payload = {
              jobs_data: jobs.map(job =>
                job.map(op => [parseInt(op.machine, 10), parseFloat(op.duration.replace(",", "."))])
              ),
              due_dates: dueDates.map(d => parseFloat(d.replace(",", "."))),
              unite,
              job_names: jobNames,
              machine_names: machineNames
            };
            endpoint = `/${algorithm.toLowerCase()}`;
            ganttEndpoint = `/${algorithm.toLowerCase()}/gantt`;
          }

          // Appeler l'API pour les résultats
          const resAlgo = await fetch(`${API_URL}${endpoint}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
          });

          if (!resAlgo.ok) {
            throw new Error(`Erreur API pour ${algorithm}`);
          }

          const data = await resAlgo.json();
          compareResults[algorithm] = data;

          // Générer le diagramme de Gantt
          const resGantt = await fetch(`${API_URL}${ganttEndpoint}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
          });

          if (resGantt.ok) {
            const blob = await resGantt.blob();
            const url = URL.createObjectURL(blob);
            compareGanttUrls[algorithm] = url;
          }

        } catch (e) {
          console.error(`Erreur pour ${algorithm}:`, e);
          compareResults[algorithm] = { error: e.message };
        }
      }

      setResults(compareResults);
      setGanttUrls(compareGanttUrls);

    } catch (e) {
      setError(e.message || "Erreur lors de la comparaison des algorithmes.");
    }
  };

  const handleExcelImport = async (formData, fileName) => {
    setIsImporting(true);
    setError(null);
    setImportSuccess(null);
    setResults(null);
    setGanttUrls({});

    try {
      const response = await fetch(`${API_URL}/spt/import-excel`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Erreur lors de l\'import');
      }

      const data = await response.json();
      const importedData = data.imported_data;
      
      setJobNames(importedData.job_names || []);
      setMachineNames(importedData.machine_names || []);
      setUnite(importedData.unite || 'heures');
      
      if (importedData.jobs_data && importedData.jobs_data.length > 0) {
        setJobs(importedData.jobs_data.map(job => 
          job.map((task, index) => ({
            machine: String(index),
            duration: parseFloat(task[1]).toString()
          }))
        ));
      }
      
      if (importedData.due_dates && importedData.due_dates.length > 0) {
        setDueDates(importedData.due_dates.map(date => String(date)));
      }
      
      setImportSuccess(`Fichier "${fileName}" importé avec succès! Vous pouvez maintenant comparer les algorithmes.`);
      
    } catch (error) {
      setError(error.message);
    } finally {
      setIsImporting(false);
    }
  };

  const getBestAlgorithm = (results, criteria) => {
    if (!results || Object.keys(results).length === 0) return null;

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
        <h2 className={styles.title}>🔄 Comparaison des algorithmes Flowshop</h2>
        <p className={styles.subtitle}>
          Comparez automatiquement tous les algorithmes compatibles avec vos données
        </p>
      </div>

      {/* Section Import Excel */}
      <ExcelImportSection 
        onImport={handleExcelImport}
        isImporting={isImporting}
        templateType="flowshop"
        API_URL={API_URL}
      />

      {importSuccess && (
        <div className={styles.successMessage}>
          ✅ {importSuccess}
        </div>
      )}

      {/* Formulaire de saisie */}
      <div className={styles.formSection}>
        <div className={styles.inputGroup}>
          <label className={styles.label}>Unité de temps</label>
          <select value={unite} onChange={(e) => setUnite(e.target.value)} className={styles.select}>
            <option value="minutes">Minutes</option>
            <option value="heures">Heures</option>
            <option value="jours">Jours</option>
          </select>
        </div>

        <div className={styles.buttonGroup}>
          <button onClick={addJob} className={styles.button}>➕ Ajouter un job</button>
          <button onClick={removeJob} className={styles.button} disabled={jobs.length <= 1}>
            ➖ Supprimer un job
          </button>
          <button onClick={addTaskToAllJobs} className={styles.button}>
            ➕ Ajouter une machine
          </button>
          <button onClick={removeTaskFromAllJobs} className={styles.button} disabled={jobs[0]?.length <= 1}>
            ➖ Supprimer une machine
          </button>
        </div>

        {/* Tableau de saisie */}
        <div className={styles.tableContainer}>
          <table className={styles.dataTable}>
            <thead>
              <tr>
                <th>Job</th>
                {machineNames.map((machineName, index) => (
                  <th key={index}>
                    <input
                      type="text"
                      value={machineName}
                      onChange={(e) => {
                        const newNames = [...machineNames];
                        newNames[index] = e.target.value;
                        setMachineNames(newNames);
                      }}
                      className={styles.headerInput}
                    />
                  </th>
                ))}
                <th>Date due</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job, jobIndex) => (
                <tr key={jobIndex}>
                  <td>
                    <input
                      type="text"
                      value={jobNames[jobIndex]}
                      onChange={(e) => {
                        const newNames = [...jobNames];
                        newNames[jobIndex] = e.target.value;
                        setJobNames(newNames);
                      }}
                      className={styles.input}
                    />
                  </td>
                  {job.map((task, taskIndex) => (
                    <td key={taskIndex}>
                      <input
                        type="number"
                        value={task.duration}
                        onChange={(e) => {
                          const newJobs = [...jobs];
                          newJobs[jobIndex][taskIndex].duration = e.target.value;
                          setJobs(newJobs);
                        }}
                        className={styles.input}
                        step="0.1"
                      />
                    </td>
                  ))}
                  <td>
                    <input
                      type="number"
                      value={dueDates[jobIndex]}
                      onChange={(e) => {
                        const newDueDates = [...dueDates];
                        newDueDates[jobIndex] = e.target.value;
                        setDueDates(newDueDates);
                      }}
                      className={styles.input}
                      step="0.1"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Informations sur la compatibilité */}
        <div className={styles.compatibilityInfo} style={{margin: "20px 0", padding: "15px", backgroundColor: "#f8f9fa", borderRadius: "8px"}}>
          <div>
            <h3 style={{color: "#28a745", marginBottom: "10px"}}>✅ Algorithmes compatibles ({compatibleAlgorithms.length})</h3>
            <div style={{display: "flex", flexWrap: "wrap", gap: "8px"}}>
              {compatibleAlgorithms.map(algo => (
                <span key={algo} style={{backgroundColor: "#d4edda", color: "#155724", padding: "4px 8px", borderRadius: "4px", fontSize: "0.9em"}}>{algo}</span>
              ))}
            </div>
          </div>

          {excludedAlgorithms.length > 0 && (
            <div style={{marginTop: "15px"}}>
              <h3 style={{color: "#dc3545", marginBottom: "10px"}}>❌ Algorithmes exclus ({excludedAlgorithms.length})</h3>
              <div>
                {excludedAlgorithms.map(algo => (
                  <div key={algo.name} style={{backgroundColor: "#f8d7da", color: "#721c24", padding: "8px", borderRadius: "4px", marginBottom: "5px"}}>
                    <strong>{algo.name}</strong>: {algo.reason}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <button 
          onClick={handleCompareAlgorithms} 
          className={styles.submitButton}
          disabled={compatibleAlgorithms.length === 0}
        >
          🔄 Comparer les algorithmes
        </button>
      </div>

      {error && <div className={styles.error}>❌ {error}</div>}

      {/* Résultats de comparaison */}
      {results && (
        <div className={styles.resultsSection}>
          <h3>📊 Résultats de comparaison</h3>
          
          {/* Tableau comparatif */}
          <div style={{overflowX: "auto", marginBottom: "20px"}}>
            <table className={styles.dataTable}>
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
                  <tr key={algorithm} style={{backgroundColor: result.error ? "#f8d7da" : "#d4edda"}}>
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

          {/* Meilleurs algorithmes par critère */}
          <div style={{marginBottom: "20px"}}>
            <h4>🏆 Meilleurs algorithmes par critère</h4>
            <div style={{display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "15px"}}>
              {["makespan", "flowtime", "retard_cumule"].map(criteria => {
                const best = getBestAlgorithm(results, criteria);
                const criteriaNames = {
                  makespan: "Makespan",
                  flowtime: "Flowtime moyen", 
                  retard_cumule: "Retard cumulé"
                };
                return best ? (
                  <div key={criteria} style={{backgroundColor: "#fff3cd", padding: "15px", borderRadius: "8px", textAlign: "center"}}>
                    <strong>{criteriaNames[criteria]}</strong><br/>
                    {best[0]}: {best[1][criteria]?.toFixed(2)} {unite}
                  </div>
                ) : null;
              })}
            </div>
          </div>

          {/* Diagrammes de Gantt */}
          <div>
            <h4>📈 Diagrammes de Gantt</h4>
            {Object.entries(ganttUrls).map(([algorithm, url]) => (
              <div key={algorithm} style={{marginBottom: "30px", border: "1px solid #dee2e6", borderRadius: "8px", padding: "15px"}}>
                <h5 style={{marginBottom: "10px"}}>{algorithm}</h5>
                <img src={url} alt={`Diagramme de Gantt - ${algorithm}`} style={{maxWidth: "100%", height: "auto"}} />
                <button 
                  onClick={() => {
                    const link = document.createElement("a");
                    link.href = url;
                    link.download = `gantt_${algorithm.toLowerCase().replace(/\s+/g, '_')}.png`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                  className={styles.button}
                  style={{marginTop: "10px"}}
                >
                  💾 Télécharger
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section Export Excel */}
      {results && (
        <ExcelExportSection 
          jobsData={jobs.map(job => job.map(op => parseFloat(op.duration)))}
          dueDates={dueDates.map(d => parseFloat(d))}
          jobNames={jobNames}
          machineNames={machineNames}
          unite={unite}
          apiEndpoint="/spt/export-excel"
          API_URL={API_URL}
        />
      )}
    </div>
  );
}

export default FlowshopCompareForm; 