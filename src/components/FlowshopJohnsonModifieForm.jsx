import { useState } from "react";
import styles from "./FlowshopJohnsonModifieForm.module.css";
import ExcelImportSection from "./ExcelImportSection";
import ExcelExportSection from "./ExcelExportSection";

function FlowshopJohnsonModifieForm() {
  const [jobs, setJobs] = useState([
    ["3", "2", "1"],
    ["2", "4", "3"]
  ]);
  const [dueDates, setDueDates] = useState(["10", "9"]);
  const [jobNames, setJobNames] = useState(["Job 0", "Job 1"]);
  const [machineNames, setMachineNames] = useState(["Machine 0", "Machine 1", "Machine 2"]);
  const [unite, setUnite] = useState("heures");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [ganttUrl, setGanttUrl] = useState(null);
  
  // États pour l'import Excel
  const [isImporting, setIsImporting] = useState(false);
  const [importSuccess, setImportSuccess] = useState(null);

  const API_URL = "/api";

  // Fonction utilitaire pour générer des valeurs aléatoirement entre 1 et 9
  const getRandomDuration = () => String(Math.floor(Math.random() * 9) + 1);
  const getRandomDueDate = () => String(Math.floor(Math.random() * 9) + 10); // Entre 10 et 18

  const addJob = () => {
    const newJob = Array.from({ length: machineNames.length }, () => getRandomDuration());
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
    const updatedJobs = jobs.map(job => [...job, getRandomDuration()]);
    setJobs(updatedJobs);
    setMachineNames([...machineNames, `Machine ${machineNames.length}`]);
  };

  const removeTaskFromAllJobs = () => {
    if (machineNames.length > 3) { // Minimum 3 machines pour Johnson modifié
      const updatedJobs = jobs.map(job => job.slice(0, -1));
      setJobs(updatedJobs);
      setMachineNames(machineNames.slice(0, -1));
    }
  };

  const handleSubmit = () => {
    setError(null);
    setResult(null);
    setGanttUrl(null);

    try {
      const formattedJobs = jobs.map(job =>
        job.map((duration, i) => [i, parseFloat(duration.replace(",", "."))])
      );
      const formattedDueDates = dueDates.map(d => parseFloat(d.replace(",", ".")));

      const payload = {
        jobs_data: formattedJobs,
        due_dates: formattedDueDates,
        unite,
        job_names: jobNames,
        machine_names: machineNames
      };

      fetch(`${API_URL}/johnson_modifie`, {
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
          return fetch(`${API_URL}/johnson_modifie/gantt`, {
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
    link.download = "diagramme_gantt_johnson_modifie.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const updateJobDuration = (jobIdx, machineIdx, value) => {
    const newJobs = [...jobs];
    newJobs[jobIdx][machineIdx] = value;
    setJobs(newJobs);
  };

  const updateJobName = (jobIdx, value) => {
    const newNames = [...jobNames];
    newNames[jobIdx] = value;
    setJobNames(newNames);
  };

  const updateDueDate = (jobIdx, value) => {
    const newDates = [...dueDates];
    newDates[jobIdx] = value;
    setDueDates(newDates);
  };

  const updateMachineName = (machineIdx, value) => {
    const newNames = [...machineNames];
    newNames[machineIdx] = value;
    setMachineNames(newNames);
  };

  // Fonction d'import Excel
  const handleExcelImport = async (formData, fileName) => {
    setIsImporting(true);
    setError(null);
    setImportSuccess(null);
    setResult(null);
    setGanttUrl(null);

    try {
      const response = await fetch(`${API_URL}/johnson_modifie/import-excel`, {
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
        setJobs(importedData.jobs_data.map(job => job.map(task => String(task[1]))));
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
        jobs_data: data.imported_data.jobs_data,
        due_dates: data.imported_data.due_dates,
        unite: data.imported_data.unite,
        job_names: data.imported_data.job_names,
        machine_names: data.imported_data.machine_names
      };

      const ganttResponse = await fetch(`${API_URL}/johnson_modifie/gantt`, {
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
        {/* ===== HEADER ===== */}
        <div className={styles.header}>
          <h1 className={styles.title}>Algorithme de Johnson Modifié</h1>
          <p className={styles.subtitle}>
            Extension de l'algorithme de Johnson pour flowshops avec plus de 2 machines
          </p>
        </div>

        {/* ===== EXPORT EXCEL - Placé tout en haut ===== */}
        <ExcelExportSection
          jobs={jobs}
          dueDates={dueDates}
          jobNames={jobNames}
          machineNames={machineNames}
          unite={unite}
          algorithmName="Johnson Modifié"
          API_URL={API_URL}
          algorithmEndpoint="johnson_modifie"
        />

        {/* ===== IMPORT EXCEL ===== */}
        <ExcelImportSection
          onImport={handleExcelImport}
          isImporting={isImporting}
          importSuccess={importSuccess}
          error={error}
          algorithmName="Johnson Modifié"
          API_URL={API_URL}
        />

        {/* ===== CONFIGURATION ===== */}
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
                disabled={machineNames.length <= 3}
              >
                - Supprimer une machine
              </button>
            </div>
          </div>
        </div>

        {/* ===== IMPORT EXCEL ===== */}
        <ExcelImportSection
          onImport={handleExcelImport}
          isImporting={isImporting}
          importSuccess={importSuccess}
          error={error}
          algorithmName="Johnson Modifié"
          API_URL={API_URL}
        />

        {/* ===== CONFIGURATION MACHINES ===== */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Configuration des machines</h3>
          <div className={`${styles.machinesTable} ${styles.tableRow}`}>
            {machineNames.map((name, i) => (
              <div key={i} className={styles.machineInput}>
                <label>{`Machine ${i}`}</label>
                <input
                  type="text"
                  className={styles.input}
                  value={name}
                  onChange={(e) => updateMachineName(i, e.target.value)}
                  placeholder={`Machine ${i}`}
                />
              </div>
            ))}
          </div>
        </div>

        {/* ===== TABLEAU PRINCIPAL ===== */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Matrice des temps de traitement</h3>
          <div className={styles.dataTable}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.jobNameHeader}>Nom du Job</th>
                  {machineNames.map((name, i) => (
                    <th key={i} className={styles.machineHeader}>
                      Durée sur {name} ({unite})
                    </th>
                  ))}
                  <th className={styles.dueDateHeader}>
                    Date due ({unite})
                  </th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job, jobIdx) => (
                  <tr key={jobIdx} className={styles.jobRow}>
                    <td className={styles.jobNameCell}>
                      <input
                        type="text"
                        className={styles.jobNameInput}
                        value={jobNames[jobIdx]}
                        onChange={(e) => updateJobName(jobIdx, e.target.value)}
                        placeholder={`Job ${jobIdx}`}
                      />
                    </td>
                    {job.map((duration, machineIdx) => (
                      <td key={machineIdx}>
                        <input
                          type="text"
                          inputMode="decimal"
                          className={styles.durationInput}
                          value={duration}
                          onChange={(e) => updateJobDuration(jobIdx, machineIdx, e.target.value)}
                          placeholder="0"
                        />
                      </td>
                    ))}
                    <td className={styles.dueDateCell}>
                      <input
                        type="text"
                        inputMode="decimal"
                        className={styles.dueDateInput}
                        value={dueDates[jobIdx]}
                        onChange={(e) => updateDueDate(jobIdx, e.target.value)}
                        placeholder="0"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ===== BOUTON CALCUL ===== */}
        <div className={styles.section}>
          <button className={styles.calculateButton} onClick={handleSubmit}>
            Calculer l'ordonnancement Johnson Modifié
          </button>
        </div>

        {/* ===== GESTION ERREURS ===== */}
        {error && (
          <div className={styles.errorSection}>
            <div className={styles.errorBox}>
              <span className={styles.errorIcon}>⚠️</span>
              <span className={styles.errorText}>{error}</span>
            </div>
          </div>
        )}

        {/* ===== RÉSULTATS ===== */}
        {result && (
          <div className={`${styles.section} ${styles.resultsSection}`}>
            <h3 className={styles.resultsTitle}>Résultats de l'optimisation</h3>
            
            {/* Séquence optimale */}
            <div className={styles.sequenceSection}>
              <div className={styles.sequenceTitle}>Séquence calculée par l'algo</div>
              <div className={styles.sequenceValue}>
                {result.sequence.join(" → ")}
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

        {/* ===== DIAGRAMME DE GANTT ===== */}
        {ganttUrl && (
          <div className={`${styles.section} ${styles.chartSection}`}>
            <div className={styles.chartHeader}>
              <h3>Diagramme de Gantt</h3>
            </div>
            <div className={styles.chartContainer}>
              <img
                src={ganttUrl}
                alt="Diagramme de Gantt - Johnson Modifié"
                className={styles.chart}
              />
              <button className={styles.downloadButton} onClick={handleDownloadGantt}>
                Télécharger le gantt
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default FlowshopJohnsonModifieForm;



