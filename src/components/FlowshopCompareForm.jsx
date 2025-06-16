import { useState, useEffect } from "react";
import styles from "./FlowshopSPTForm.module.css";
import AgendaGrid from "./AgendaGrid";
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
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [startDateTime, setStartDateTime] = useState("");
  const [openingHours, setOpeningHours] = useState({ start: "08:00", end: "17:00" });
  const [weekendDays, setWeekendDays] = useState({ samedi: false, dimanche: false });
  const [feries, setFeries] = useState([""]);
  const [dueDateTimes, setDueDateTimes] = useState(["", ""]);
  const [agendaData, setAgendaData] = useState(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importSuccess, setImportSuccess] = useState(null);
  const [compatibleAlgorithms, setCompatibleAlgorithms] = useState([]);
  const [excludedAlgorithms, setExcludedAlgorithms] = useState([]);

  const API_URL = "/api";

  // Fonction utilitaire pour générer des valeurs aléatoirement entre 1 et 9
  const getRandomDuration = () => String(Math.floor(Math.random() * 9) + 1);
  const getRandomDueDate = () => String(Math.floor(Math.random() * 9) + 10); // Entre 10 et 18

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
    
    // Mettre à jour dueDateTimes
    if (dueDateTimes.length !== jobs.length) {
      setDueDateTimes(Array(jobs.length).fill(""));
    }
  }, [jobs]);

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
    setGanttUrls({});
    setResults(null);
    setAgendaData(null);

    try {
      const algorithmsToCompare = compatibleAlgorithms;
      if (algorithmsToCompare.length === 0) {
        setError("Aucun algorithme compatible avec cette configuration.");
        return;
      }

      const compareResults = {};
      const compareGanttUrls = {};

      const formattedJobs = jobs.map(job =>
        job.map(op => [parseInt(op.machine, 10), parseFloat(op.duration.replace(",", "."))])
      );
      const formattedDueDates = dueDates.map(d => {
        const parsed = parseFloat(d.replace(",", "."));
        if (isNaN(parsed)) throw new Error("Date due invalide");
        return parsed;
      });

      const basePayload = {
        jobs_data: formattedJobs,
        due_dates: formattedDueDates,
        unite,
        job_names: jobNames,
        machine_names: machineNames,
      };

      if (showAdvanced) {
        basePayload.agenda_start_datetime = startDateTime;
        basePayload.opening_hours = openingHours;
        basePayload.weekend_days = Object.entries(weekendDays).filter(([_, v]) => v).map(([k]) => k);
        basePayload.jours_feries = feries.filter(f => f);
        basePayload.due_date_times = dueDateTimes;
      }

      // Préparer les données selon le format requis par chaque algorithme
      for (const algorithm of algorithmsToCompare) {
        try {
          let payload;
          let endpoint;
          let ganttEndpoint;
          let agendaEndpoint;

          if (algorithm === "Johnson") {
            payload = {
              jobs_data: jobs.map(job => job.map(op => parseFloat(op.duration.replace(",", ".")))),
              due_dates: formattedDueDates,
              unite,
              job_names: jobNames,
              machine_names: machineNames
            };
            endpoint = "/johnson";
            ganttEndpoint = "/johnson/gantt";
          } else if (algorithm === "Johnson modifié") {
            payload = basePayload;
            endpoint = "/johnson_modifie";
            ganttEndpoint = "/johnson_modifie/gantt";
          } else if (algorithm === "Smith") {
            payload = {
              jobs: jobs.map(job => job.map(op => parseFloat(op.duration.replace(",", ".")))),
              unite,
              job_names: jobNames
            };
            endpoint = "/smith";
            ganttEndpoint = "/smith/gantt";
          } else {
            payload = basePayload;
            endpoint = `/${algorithm.toLowerCase()}`;
            ganttEndpoint = `/${algorithm.toLowerCase()}/gantt`;
            agendaEndpoint = `/${algorithm.toLowerCase()}/agenda`;
          }

          const resAlgo = await fetch(`${API_URL}${endpoint}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
          });
          if (!resAlgo.ok) throw new Error("Erreur API");
          const data = await resAlgo.json();
          compareResults[algorithm] = data;

          if (showAdvanced && agendaEndpoint && algorithm === "SPT") {
            const resAgenda = await fetch(`${API_URL}${agendaEndpoint}`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload)
            });
            if (!resAgenda.ok) throw new Error("Erreur génération de l'agenda");
            const agendaJson = await resAgenda.json();
            setAgendaData(agendaJson);
          } else {
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
          }

        } catch (e) {
          console.error(`Erreur pour ${algorithm}:`, e);
          compareResults[algorithm] = { error: e.message };
        }
      }

      setResults(compareResults);
      setGanttUrls(compareGanttUrls);

    } catch (e) {
      setError(e.message || "Erreur dans les données saisies.");
    }
  };

  const handleDownloadGantt = (algorithm) => {
    const url = ganttUrls[algorithm];
    if (!url) return;
    const link = document.createElement("a");
    link.href = url;
    link.download = `diagramme_gantt_${algorithm.toLowerCase().replace(/\s+/g, '_')}.png`;
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
    setResults(null);
    setGanttUrls({});
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
      setResults({ "Import Excel": data.results });
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
            setGanttUrls({ "Import Excel": url });
          }
        } catch (ganttError) {
          console.error('Erreur génération Gantt:', ganttError);
        }
      }
      
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
        <h1 className={styles.title}>Comparaison des algorithmes Flowshop</h1>
        <p className={styles.subtitle}>Comparez automatiquement tous les algorithmes compatibles</p>
      </div>

      <div className={styles.content}>
        {/* Section Import Excel */}
        <ExcelImportSection 
          onImport={handleExcelImport}
          isImporting={isImporting}
          templateType="flowshop"
          API_URL={API_URL}
        />

        {/* Section Export Excel */}
        <ExcelExportSection 
          jobsData={jobs.map(job => job.map(op => parseFloat(op.duration)))}
          dueDates={dueDates.map(d => parseFloat(d))}
          jobNames={jobNames}
          machineNames={machineNames}
          unite={unite}
          apiEndpoint="/spt/export-excel"
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

        {/* Configuration générale */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Configuration</h3>
          <div className={styles.configGrid}>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Unité de temps</label>
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

        {/* Algorithmes compatibles et exclus */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Compatibilité des algorithmes</h3>
          <div className={styles.compatibilityGrid}>
            <div className={styles.compatibleSection}>
              <h4 className={styles.compatibleTitle}>✅ Algorithmes compatibles ({compatibleAlgorithms.length})</h4>
              <div className={styles.algoTags}>
                {compatibleAlgorithms.map(algo => (
                  <span key={algo} className={styles.compatibleTag}>{algo}</span>
                ))}
              </div>
            </div>

            {excludedAlgorithms.length > 0 && (
              <div className={styles.excludedSection}>
                <h4 className={styles.excludedTitle}>❌ Algorithmes exclus ({excludedAlgorithms.length})</h4>
                <div className={styles.excludedList}>
                  {excludedAlgorithms.map(algo => (
                    <div key={algo.name} className={styles.excludedItem}>
                      <strong>{algo.name}</strong>: {algo.reason}
                    </div>
                  ))}
                </div>
              </div>
            )}
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
            disabled={compatibleAlgorithms.length === 0}
          >
            Comparer les algorithmes ({compatibleAlgorithms.length})
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

        {/* Agenda réel */}
        {agendaData && (
          <div className={styles.agendaSection}>
            <h3 className={styles.agendaTitle}>Agenda réel de l'usine (SPT)</h3>
            <AgendaGrid agendaData={agendaData} />
          </div>
        )}


      </div>
    </div>
  );
}

export default FlowshopCompareForm; 