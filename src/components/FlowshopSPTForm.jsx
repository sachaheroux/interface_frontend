import { useState, useEffect } from "react";
import styles from "./FlowshopSPTForm.module.css";
import AgendaGrid from "./AgendaGrid";
import ExcelImportSection from "./ExcelImportSection";
import ExcelExportSection from "./ExcelExportSection";

function FlowshopSPTForm() {
  const [jobs, setJobs] = useState([
    [{ machine: "0", duration: "3" }, { machine: "1", duration: "2" }],
    [{ machine: "0", duration: "2" }, { machine: "1", duration: "4" }]
  ]);
  const [dueDates, setDueDates] = useState(["10", "9"]);
  const [jobNames, setJobNames] = useState(["Job 0", "Job 1"]);
  const [machineNames, setMachineNames] = useState(["Machine 0", "Machine 1"]);
  const [unite, setUnite] = useState("heures");

  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [ganttUrl, setGanttUrl] = useState(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [startDateTime, setStartDateTime] = useState("");
  const [openingHours, setOpeningHours] = useState({ start: "08:00", end: "17:00" });
  const [weekendDays, setWeekendDays] = useState({ samedi: false, dimanche: false });
  const [feries, setFeries] = useState([""]);
  const [dueDateTimes, setDueDateTimes] = useState(["", ""]);
  const [agendaData, setAgendaData] = useState(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importSuccess, setImportSuccess] = useState(null);

  const API_URL = "/api";

  // Fonction utilitaire pour générer des valeurs aléatoirement entre 1 et 9
  const getRandomDuration = () => String(Math.floor(Math.random() * 9) + 1);
  const getRandomDueDate = () => String(Math.floor(Math.random() * 9) + 10); // Entre 10 et 18

  const addJob = () => {
    const machineCount = jobs[0].length;
    const newJob = Array.from({ length: machineCount }, (_, i) => ({ machine: String(i), duration: getRandomDuration() }));
    setJobs([...jobs, newJob]);
    setDueDates([...dueDates, getRandomDueDate()]);
    setDueDateTimes([...dueDateTimes, ""]);
    setJobNames([...jobNames, `Job ${jobs.length}`]);
  };

  const removeJob = () => {
    if (jobs.length > 1) {
      setJobs(jobs.slice(0, -1));
      setDueDates(dueDates.slice(0, -1));
      setDueDateTimes(dueDateTimes.slice(0, -1));
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

  const handleSubmit = async () => {
    setError(null);
    setGanttUrl(null);
    setResult(null);
    setAgendaData(null);

    try {
      const formattedJobs = jobs.map(job =>
        job.map(op => [parseInt(op.machine, 10), parseFloat(op.duration.replace(",", "."))])
      );
      const formattedDueDates = dueDates.map(d => {
        const parsed = parseFloat(d.replace(",", "."));
        if (isNaN(parsed)) throw new Error("Date due invalide");
        return parsed;
      });

      const payload = {
        jobs_data: formattedJobs,
        due_dates: formattedDueDates,
        unite,
        job_names: jobNames,
        machine_names: machineNames,
      };

      if (showAdvanced) {
        payload.agenda_start_datetime = startDateTime;
        payload.opening_hours = openingHours;
        payload.weekend_days = Object.entries(weekendDays).filter(([_, v]) => v).map(([k]) => k);
        payload.jours_feries = feries.filter(f => f);
        payload.due_date_times = dueDateTimes;
      }

      const resAlgo = await fetch(`${API_URL}/spt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!resAlgo.ok) throw new Error("Erreur API");
      const data = await resAlgo.json();
      setResult(data);

      if (showAdvanced) {
        const resAgenda = await fetch(`${API_URL}/spt/agenda`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        if (!resAgenda.ok) throw new Error("Erreur génération de l'agenda");
        const agendaJson = await resAgenda.json();
        setAgendaData(agendaJson);
        setGanttUrl(null);
      } else {
        const resGantt = await fetch(`${API_URL}/spt/gantt`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        if (!resGantt.ok) throw new Error("Erreur génération du diagramme de Gantt");
        const blob = await resGantt.blob();
        const url = URL.createObjectURL(blob);
        setGanttUrl(url);
        setAgendaData(null);
      }
    } catch (e) {
      setError(e.message || "Erreur dans les données saisies.");
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

  // Fonction pour l'import Excel

  const handleExcelImport = async (formData, fileName) => {
    setIsImporting(true);
    setError(null);
    setImportSuccess(null);
    
    // Réinitialiser les résultats précédents
    setResult(null);
    setGanttUrl(null);
    setAgendaData(null);

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
      
      // Remplacer complètement les données du formulaire avec les données importées
      const importedData = data.imported_data;
      
      // Mettre à jour tous les états avec les données importées uniquement
      setJobNames(importedData.job_names || []);
      setMachineNames(importedData.machine_names || []);
      setUnite(importedData.unite || 'heures');
      
      // Reconstruire les jobs à partir des données importées
      if (importedData.jobs_data && importedData.jobs_data.length > 0) {
        setJobs(importedData.jobs_data.map(job => 
          job.map((task, index) => ({
            machine: String(index),
            duration: parseFloat(task[1]).toString()  // task[1] est la durée, comme dans EDD
          }))
        ));
      }
      
      // Mettre à jour les dates d'échéance
      if (importedData.due_dates && importedData.due_dates.length > 0) {
        setDueDates(importedData.due_dates.map(date => String(date)));
      }
      
      // Afficher les résultats directement
      setResult(data.results);
      setImportSuccess(`Fichier "${fileName}" importé et traité avec succès! Les données du formulaire ont été remplacées par celles du fichier.`);
      
      // Générer le diagramme de Gantt si pas en mode avancé
      if (!showAdvanced) {
        try {
          const ganttResponse = await fetch(`${API_URL}/spt/import-excel-gantt`, {
            method: 'POST',
            body: formData
          });
          
          if (ganttResponse.ok) {
            const blob = await ganttResponse.blob();
            const url = URL.createObjectURL(blob);
            setGanttUrl(url);
          }
        } catch (ganttError) {
          console.log("Diagramme de Gantt non disponible pour l'import Excel");
        }
      }

    } catch (error) {
      setError(`Erreur import: ${error.message}`);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="algorithmContent">
      <div className={styles.algorithmContainer}>
        <div className={styles.header}>
          <h1 className={styles.title}>Flowshop - Algorithme SPT</h1>
          <p className={styles.subtitle}>
            Ordonnancement par temps de traitement le plus court (Shortest Processing Time)
          </p>
        </div>

        {/* Export Excel - Placé tout en haut */}
        <ExcelExportSection
          jobs={jobs}
          dueDates={dueDates}
          jobNames={jobNames}
          machineNames={machineNames}
          unite={unite}
          algorithmName="SPT"
          API_URL={API_URL}
          algorithmEndpoint="spt"
        />

        {/* Import Excel - Placé juste après l'export */}
        <ExcelImportSection
          onImport={handleExcelImport}
          isImporting={isImporting}
          importSuccess={importSuccess}
          error={error}
          algorithmName="SPT"
          API_URL={API_URL}
        />

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
              <button className={styles.addButton} onClick={addTaskToAllJobs}>
                + Ajouter une machine
              </button>
              <button className={styles.removeButton} onClick={removeTaskFromAllJobs} disabled={jobs[0].length <= 1}>
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
          <h3 className={styles.sectionTitle}>Matrice des temps de traitement</h3>
          <div className={styles.dataTable}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.jobNameHeader}>Job</th>
                  {machineNames.map((name, i) => (
                    <th key={i} className={styles.machineHeader}>
                      Durée sur {name || `Machine ${i}`} ({unite})
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
                        placeholder={`Job ${jobIdx}`}
                      />
                    </td>
                    {job.map((op, opIdx) => (
                      <td key={opIdx} className={styles.durationCell}>
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          value={op.duration}
                          onChange={e => {
                            const newJobs = [...jobs];
                            newJobs[jobIdx][opIdx].duration = e.target.value;
                            setJobs(newJobs);
                          }}
                          className={styles.durationInput}
                          placeholder="0"
                        />
                      </td>
                    ))}
                    <td className={styles.dueDateCell}>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        value={dueDates[jobIdx]}
                        onChange={e => {
                          const newDates = [...dueDates];
                          newDates[jobIdx] = e.target.value;
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

        {/* Options avancées */}
        <div className={styles.section}>
          <div className={styles.advancedToggle}>
            <label className={styles.toggleLabel}>
              <input 
                type="checkbox" 
                checked={showAdvanced} 
                onChange={() => setShowAdvanced(!showAdvanced)}
                className={styles.checkbox}
              />
              <span className={styles.checkboxCustom}></span>
              Options avancées (horaires réels d'usine)
            </label>
          </div>

          {showAdvanced && (
            <div className={styles.advancedSection}>
              <h4 className={styles.advancedTitle}>Paramètres temporels</h4>
              <div className={styles.advancedGrid}>
                <div className={styles.inputGroup}>
                  <label>Début de l'agenda</label>
                  <input
                    type="datetime-local"
                    value={startDateTime}
                    onChange={e => setStartDateTime(e.target.value)}
                    className={styles.input}
                  />
                </div>
                
                <div className={styles.inputGroup}>
                  <label>Heures d'ouverture</label>
                  <div className={styles.timeRange}>
                    <input 
                      type="time" 
                      value={openingHours.start} 
                      onChange={e => setOpeningHours({ ...openingHours, start: e.target.value })}
                      className={styles.timeInput}
                    />
                    <span>à</span>
                    <input 
                      type="time" 
                      value={openingHours.end} 
                      onChange={e => setOpeningHours({ ...openingHours, end: e.target.value })}
                      className={styles.timeInput}
                    />
                  </div>
                </div>
              </div>

              <div className={styles.weekendSection}>
                <label>Jours de fermeture :</label>
                <div className={styles.checkboxGroup}>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={weekendDays.samedi}
                      onChange={e => setWeekendDays({ ...weekendDays, samedi: e.target.checked })}
                    />
                    Samedi
                  </label>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={weekendDays.dimanche}
                      onChange={e => setWeekendDays({ ...weekendDays, dimanche: e.target.checked })}
                    />
                    Dimanche
                  </label>
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label>Jours fériés (dates)</label>
                {feries.map((ferie, i) => (
                  <div key={i} className={styles.ferieRow}>
                    <input
                      type="date"
                      value={ferie}
                      onChange={e => {
                        const newFeries = [...feries];
                        newFeries[i] = e.target.value;
                        setFeries(newFeries);
                      }}
                      className={styles.input}
                    />
                    <button
                      onClick={() => setFeries(feries.filter((_, idx) => idx !== i))}
                      className={styles.removeButton}
                    >
                      ×
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => setFeries([...feries, ""])}
                  className={styles.addButton}
                >
                  + Ajouter un jour férié
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Bouton de calcul */}
        <div className={styles.section}>
          <button 
            onClick={handleSubmit} 
            className={styles.calculateButton}
          >
            Calculer l'ordonnancement SPT
          </button>
        </div>

        {/* Affichage des erreurs */}
        {error && (
          <div className={styles.errorSection}>
            <div className={styles.errorBox}>
              <span className={styles.errorIcon}>!</span>
              <span className={styles.errorText}>{error}</span>
            </div>
          </div>
        )}

        {/* Résultats */}
        {result && (
          <div className={styles.resultsSection}>
            <h3 className={styles.resultsTitle}>Résultats de l'optimisation</h3>
            
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
            
            <div className={styles.metricsGrid}>
              <div className={styles.metric}>
                <div className={styles.metricValue}>{result.makespan}</div>
                <div className={styles.metricLabel}>Makespan ({unite})</div>
              </div>
              <div className={styles.metric}>
                <div className={styles.metricValue}>{result.flowtime.toFixed(2)}</div>
                <div className={styles.metricLabel}>Temps de cycle moyen ({unite})</div>
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
                {result.completion_times && Object.entries(result.completion_times).map(([job, time]) => (
                  <div key={job} className={styles.taskBadge}>
                    {job}: {time} {unite}
                  </div>
                ))}
              </div>

              <h4 style={{ marginTop: '1.5rem' }}>Planification détaillée</h4>
              {Object.entries(result.planification).map(([machine, tasks]) => (
                <div key={machine} className={styles.machineDetail}>
                  <strong>{machine} :</strong>
                  <div className={styles.tasksList}>
                    {tasks.map((task, i) => (
                      <span key={i} className={styles.taskBadge}>
                        {jobNames[task.job]} ({task.start}-{task.start + task.duration})
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Diagramme de Gantt */}
        {ganttUrl && (
          <div className={styles.chartSection}>
            <div className={styles.chartHeader}>
              <h3>Diagramme de Gantt</h3>
            </div>
            <div className={styles.chartContainer}>
              <img src={ganttUrl} alt="Diagramme de Gantt" className={styles.chart} />
              <button onClick={handleDownloadGantt} className={styles.downloadButton}>
                Télécharger le diagramme
              </button>
            </div>
          </div>
        )}

        {/* Agenda réel */}
        {agendaData && (
          <div className={styles.agendaSection}>
            <h3 className={styles.agendaTitle}>Agenda réel de l'usine</h3>
            <AgendaGrid agendaData={agendaData} />
          </div>
        )}
      </div>
    </div>
  );
}

export default FlowshopSPTForm;


















