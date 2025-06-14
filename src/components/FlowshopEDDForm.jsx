import { useState } from "react";
import styles from "./FlowshopEDDForm.module.css";
import config from "../config";
import ExcelImportSection from "./ExcelImportSection";

function FlowshopEDDForm() {
  const [jobs, setJobs] = useState([
    [{ duration: "3" }, { duration: "2" }],
    [{ duration: "2" }, { duration: "4" }]
  ]);
  const [dueDates, setDueDates] = useState(["10", "9"]);
  const [jobNames, setJobNames] = useState(["Job 0", "Job 1"]);
  const [machineNames, setMachineNames] = useState(["Machine 0", "Machine 1"]);
  const [unite, setUnite] = useState("heures");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [ganttUrl, setGanttUrl] = useState(null);
  
  // États pour l'import Excel
  const [isImporting, setIsImporting] = useState(false);
  const [importSuccess, setImportSuccess] = useState(null);

  const API_URL = "https://interface-backend-1jgi.onrender.com";

  const addJob = () => {
    const machineCount = jobs[0].length;
    const newJob = Array.from({ length: machineCount }, () => ({ duration: "1" }));
    setJobs([...jobs, newJob]);
    setDueDates([...dueDates, "10"]);
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
    const updatedJobs = jobs.map(job => [...job, { duration: "1" }]);
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

  const handleSubmit = () => {
    setError(null);
    setGanttUrl(null);

    try {
      const formattedJobs = jobs.map(job =>
        job.map((op, i) => [i, parseFloat(op.duration.replace(",", "."))])
      );
      const formattedDueDates = dueDates.map(d => parseFloat(d.replace(",", ".")));

      const payload = {
        jobs_data: formattedJobs,
        due_dates: formattedDueDates,
        unite,
        job_names: jobNames,
        machine_names: machineNames
      };

      fetch(`${API_URL}/edd`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })
        .then(res => {
          if (!res.ok) throw new Error("Erreur API");
          return res.json();
        })
        .then(data => {
          setResult(data);
          return fetch(`${API_URL}/edd/gantt`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
          });
        })
        .then(res => {
          if (!res.ok) throw new Error("Erreur Gantt API");
          return res.blob();
        })
        .then(blob => {
          const url = URL.createObjectURL(blob);
          setGanttUrl(url);
        })
        .catch(err => setError(err.message));
    } catch (e) {
      setError("Erreur dans les données saisies.");
    }
  };

  const handleDownloadGantt = () => {
    if (!ganttUrl) return;
    const link = document.createElement("a");
    link.href = ganttUrl;
    link.download = "diagramme_gantt.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Fonction d'import Excel
  const handleExcelImport = async (formData, fileName) => {
    setIsImporting(true);
    setError(null);
    setImportSuccess(null);
    setResult(null);
    setGanttUrl(null);

    try {
      const response = await fetch(`${API_URL}/edd/import-excel`, {
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
        // Convertir au format EDD (avec objets { duration: "valeur" })
        const newJobs = importedData.jobs_data.map(job => 
          job.map(duration => ({ duration: String(duration) }))
        );
        setJobs(newJobs);
        setDueDates(importedData.due_dates.map(String));
        setJobNames(importedData.job_names);
        setMachineNames(importedData.machine_names);
        setUnite(importedData.unite);
      }
      
      // Afficher les résultats
      setResult(data.results);
      setImportSuccess(`Fichier "${fileName}" importé et traité avec succès ! ${data.imported_data.jobs_count} jobs et ${data.imported_data.machines_count} machines détectés.`);
      
      // Générer le diagramme de Gantt
      const payload = {
        jobs_data: data.imported_data.jobs_data.map(job =>
          job.map((duration, i) => [i, duration])
        ),
        due_dates: data.imported_data.due_dates,
        unite: data.imported_data.unite,
        job_names: data.imported_data.job_names,
        machine_names: data.imported_data.machine_names
      };

      const ganttResponse = await fetch(`${API_URL}/edd/gantt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (ganttResponse.ok) {
        const blob = await ganttResponse.blob();
        const url = URL.createObjectURL(blob);
        setGanttUrl(url);
      }

    } catch (error) {
      console.error('Erreur import Excel:', error);
      setError(error.message);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="algorithmContent">
      <div className={styles.algorithmContainer}>
        {/* Header */}
        <div className={styles.header}>
          <h1 className={styles.title}>Planification Flowshop - EDD</h1>
          <p className={styles.subtitle}>
            Algorithme EDD (Earliest Due Date) pour l'ordonnancement en flowshop avec dates d'échéance
          </p>
        </div>

        {/* Section Configuration */}
        <div className={`${styles.section} ${styles.configSection}`}>
          <div className={styles.configRow}>
            <div className={styles.inputGroup}>
              <label htmlFor="unite">Unité de temps</label>
              <select 
                id="unite"
                value={unite} 
                onChange={(e) => setUnite(e.target.value)} 
                className={styles.select}
              >
                <option value="minutes">Minutes</option>
                <option value="heures">Heures</option>
                <option value="jours">Jours</option>
              </select>
            </div>

            <div className={styles.actionButtons}>
              <button className={styles.addButton} onClick={addJob}>
                + Ajouter un job
              </button>
              <button 
                className={styles.removeButton} 
                onClick={removeJob}
                disabled={jobs.length <= 1}
              >
                - Supprimer un job
              </button>
              <button className={styles.addButton} onClick={addTaskToAllJobs}>
                + Ajouter une machine
              </button>
              <button 
                className={styles.removeButton} 
                onClick={removeTaskFromAllJobs}
                disabled={jobs[0].length <= 1}
              >
                - Supprimer une machine
              </button>
            </div>
          </div>
        </div>

        {/* Import Excel */}
        <ExcelImportSection
          onImport={handleExcelImport}
          isImporting={isImporting}
          importSuccess={importSuccess}
          error={error}
          algorithmName="EDD"
          API_URL={API_URL}
        />

        {/* Configuration des machines */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Configuration des machines</h2>
          <div className={styles.machinesTable}>
            <div className={styles.tableRow}>
              {machineNames.map((name, i) => (
                <div key={i} className={styles.machineInput}>
                  <label htmlFor={`machine-${i}`}>Machine {i}</label>
                  <input
                    id={`machine-${i}`}
                    type="text"
                    value={name}
                    onChange={e => {
                      const newNames = [...machineNames];
                      newNames[i] = e.target.value;
                      setMachineNames(newNames);
                    }}
                    className={styles.input}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tableau principal des données */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Matrice des temps de traitement</h2>
          <div className={styles.dataTable}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.jobNameHeader}>Job</th>
                  {machineNames.map((name, i) => (
                    <th key={i} className={styles.machineHeader}>
                      Durée sur {name} ({unite})
                    </th>
                  ))}
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
                      />
                    </td>
                    {job.map((op, opIdx) => (
                      <td key={opIdx}>
                        <input
                          type="text"
                          inputMode="decimal"
                          value={op.duration}
                          onChange={e => {
                            const newJobs = [...jobs];
                            newJobs[jobIdx][opIdx].duration = e.target.value;
                            setJobs(newJobs);
                          }}
                          className={styles.durationInput}
                        />
                      </td>
                    ))}
                    <td className={styles.dueDateCell}>
                      <input
                        type="text"
                        inputMode="decimal"
                        value={dueDates[jobIdx]}
                        onChange={e => {
                          const newDates = [...dueDates];
                          newDates[jobIdx] = e.target.value;
                          setDueDates(newDates);
                        }}
                        className={styles.dueDateInput}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bouton de calcul */}
        <button className={styles.calculateButton} onClick={handleSubmit}>
          Calculer l'ordonnancement EDD
        </button>

        {/* Gestion des erreurs */}
        {error && (
          <div className={styles.errorSection}>
            <div className={styles.errorBox}>
              <span className={styles.errorIcon}>⚠️</span>
              <span className={styles.errorText}>{error}</span>
            </div>
          </div>
        )}

        {/* Résultats */}
        {result && (
          <div className={`${styles.section} ${styles.resultsSection}`}>
            <h2 className={styles.resultsTitle}>Résultats de l'optimisation</h2>
            
            {/* Séquence optimale */}
            <div className={styles.sequenceSection}>
              <div className={styles.sequenceTitle}>Séquence calculée par l'algo</div>
              <div className={styles.sequenceValue}>
                {(() => {
                  // Extraire la séquence à partir de la première machine
                  const firstMachine = Object.keys(result.planification)[0];
                  const sequence = result.planification[firstMachine]
                    .sort((a, b) => a.start - b.start)
                    .map(task => task.job + 1);
                  return sequence.join(" → ");
                })()}
              </div>
            </div>
            
            {/* Métriques principales */}
            <div className={styles.metricsGrid}>
              <div className={styles.metric}>
                <div className={styles.metricValue}>{result.makespan}</div>
                <div className={styles.metricLabel}>Makespan ({unite})</div>
              </div>
              <div className={styles.metric}>
                <div className={styles.metricValue}>{result.flowtime}</div>
                <div className={styles.metricLabel}>Flowtime ({unite})</div>
              </div>
              <div className={styles.metric}>
                <div className={styles.metricValue}>{result.retard_cumule}</div>
                <div className={styles.metricLabel}>Retard cumulé ({unite})</div>
              </div>
            </div>

            {/* Détails de planification */}
            <div className={styles.planificationDetails}>
              <h4>Temps de complétion</h4>
              <div className={styles.tasksList}>
                {Object.entries(result.completion_times).map(([job, time]) => (
                  <div key={job} className={styles.taskBadge}>
                    {job}: {time} {unite}
                  </div>
                ))}
              </div>

              <h4 style={{ marginTop: '1.5rem' }}>Planification détaillée</h4>
              {Object.entries(result.planification).map(([machine, tasks]) => (
                <div key={machine} className={styles.machineDetail}>
                  <strong>{machine}</strong>
                  <div className={styles.tasksList}>
                    {tasks.map((t, i) => (
                      <div key={i} className={styles.taskBadge}>
                        {jobNames[t.job] || `Job ${t.job}`}: {t.start} → {t.start + t.duration}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
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
            </div>
            <button className={styles.downloadButton} onClick={handleDownloadGantt}>
              Télécharger le gantt
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default FlowshopEDDForm;




