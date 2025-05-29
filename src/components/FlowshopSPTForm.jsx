import { useState } from "react";
import styles from "./FlowshopSPTForm.module.css";
import AgendaTimeline from "./AgendaTimeline";

function FlowshopSPTForm() {
  // Etats principaux
  const [jobs, setJobs] = useState([
    [{ machine: "0", duration: "3" }, { machine: "1", duration: "2" }],
    [{ machine: "0", duration: "2" }, { machine: "1", duration: "4" }]
  ]);
  const [dueDates, setDueDates] = useState(["10", "9"]);
  const [jobNames, setJobNames] = useState(["Job 0", "Job 1"]);
  const [machineNames, setMachineNames] = useState(["Machine 0", "Machine 1"]);
  const [unite, setUnite] = useState("heures");

  // Résultats / erreurs
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [ganttUrl, setGanttUrl] = useState(null);

  // Saisie avancée
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [startDateTime, setStartDateTime] = useState("");
  const [openingHours, setOpeningHours] = useState({ start: "08:00", end: "17:00" });
  const [weekendDays, setWeekendDays] = useState({ samedi: false, dimanche: false });
  const [feries, setFeries] = useState([""]);
  const [dueDateTimes, setDueDateTimes] = useState(["", ""]);
  const [agendaData, setAgendaData] = useState(null);

  const API_URL = "https://interface-backend-1jgi.onrender.com";

  // --- Gestion dynamique des jobs/tâches/machines/noms ---
  const addJob = () => {
    const machineCount = jobs[0].length;
    const newJob = Array.from({ length: machineCount }, (_, i) => ({ machine: String(i), duration: "1" }));
    setJobs([...jobs, newJob]);
    setDueDates([...dueDates, "10"]);
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
    const updatedJobs = jobs.map(job => [...job, { machine: String(job.length), duration: "1" }]);
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

  // --- Soumission de l'algorithme ---
  const handleSubmit = async () => {
    setError(null);
    setGanttUrl(null);
    setResult(null);
    setAgendaData(null);

    try {
      // Construction du payload général
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

      // Ajout des champs avancés si activé
      if (showAdvanced) {
        payload.agenda_start_datetime = startDateTime;
        payload.opening_hours = openingHours;
        payload.weekend_days = Object.entries(weekendDays).filter(([_, v]) => v).map(([k]) => k);
        payload.jours_feries = feries.filter(f => f);
        payload.due_date_times = dueDateTimes;
      }

      // 1. Requête principale (toujours /spt)
      const resAlgo = await fetch(`${API_URL}/spt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!resAlgo.ok) throw new Error("Erreur API");
      const data = await resAlgo.json();
      setResult(data);

      // 2. Requête visuelle (Gantt ou Agenda)
      if (showAdvanced) {
        // Mode Agenda
        const resAgenda = await fetch(`${API_URL}/spt/agenda`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        if (!resAgenda.ok) throw new Error("Erreur génération de l'agenda");
        const agendaJson = await resAgenda.json();
        setAgendaData(agendaJson);
        setGanttUrl(null); // pas de diagramme Gantt en mode avancé
      } else {
        // Mode Gantt classique (PNG)
        const resGantt = await fetch(`${API_URL}/spt/gantt`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        if (!resGantt.ok) throw new Error("Erreur génération du diagramme de Gantt");
        const blob = await resGantt.blob();
        const url = URL.createObjectURL(blob);
        setGanttUrl(url);
        setAgendaData(null); // pas d'agenda en mode normal
      }
    } catch (e) {
      setError(e.message || "Erreur dans les données saisies.");
    }
  };

  // --- Télécharger le Gantt (mode normal) ---
  const handleDownloadGantt = () => {
    if (!ganttUrl) return;
    const link = document.createElement("a");
    link.href = ganttUrl;
    link.download = "diagramme_gantt.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Planification Flowshop - SPT</h2>

      {/* Unité de temps */}
      <div className={styles.unitSelector}>
        <label>Unité de temps :</label>
        <select value={unite} onChange={e => setUnite(e.target.value)} className={styles.select}>
          <option value="minutes">minutes</option>
          <option value="heures">heures</option>
          <option value="jours">jours</option>
        </select>
      </div>

      {/* Gestion dynamique jobs/machines */}
      <div className={styles.buttonGroup}>
        <button className={styles.button} onClick={addJob}>+ Ajouter un job</button>
        <button className={styles.button} onClick={removeJob}>- Supprimer un job</button>
        <button className={styles.button} onClick={addTaskToAllJobs}>+ Ajouter une tâche</button>
        <button className={styles.button} onClick={removeTaskFromAllJobs}>- Supprimer une tâche</button>
      </div>

      {/* Saisie des noms de machines */}
      <h4 className={styles.subtitle}>Noms des machines</h4>
      {machineNames.map((name, i) => (
        <div key={i} className={styles.taskRow}>
          Machine {i} :
          <input
            type="text"
            value={name}
            onChange={e => {
              const newNames = [...machineNames];
              newNames[i] = e.target.value;
              setMachineNames(newNames);
            }}
          />
        </div>
      ))}

      {/* Saisie des jobs/tâches */}
      {jobs.map((job, jobIdx) => (
        <div key={jobIdx} className={styles.jobBlock}>
          <h4>Job {jobIdx}</h4>
          <div className={styles.taskRow}>
            Nom du job :
            <input
              type="text"
              value={jobNames[jobIdx]}
              onChange={e => {
                const newNames = [...jobNames];
                newNames[jobIdx] = e.target.value;
                setJobNames(newNames);
              }}
            />
          </div>
          {job.map((op, opIdx) => (
            <div key={opIdx} className={styles.taskRow}>
              Machine :
              <input
                type="number"
                value={op.machine}
                onChange={e => {
                  const newJobs = [...jobs];
                  newJobs[jobIdx][opIdx].machine = e.target.value;
                  setJobs(newJobs);
                }}
              />
              Durée ({unite}) :
              <input
                type="text"
                inputMode="decimal"
                value={op.duration}
                onChange={e => {
                  const newJobs = [...jobs];
                  newJobs[jobIdx][opIdx].duration = e.target.value;
                  setJobs(newJobs);
                }}
              />
            </div>
          ))}
        </div>
      ))}

      {/* Saisie dates dues (mode normal seulement) */}
      {!showAdvanced && (
        <>
          <h4 className={styles.subtitle}>Dates dues ({unite})</h4>
          {dueDates.map((d, i) => (
            <div key={i} className={styles.taskRow}>
              Job {i} :
              <input
                type="text"
                inputMode="decimal"
                value={d}
                onChange={e => {
                  const newDates = [...dueDates];
                  newDates[i] = e.target.value;
                  setDueDates(newDates);
                }}
              />
            </div>
          ))}
        </>
      )}

      {/* Toggle saisie avancée */}
      <div className={styles.advancedToggle}>
        <label>
          <input type="checkbox" checked={showAdvanced} onChange={() => setShowAdvanced(!showAdvanced)} />
          Saisies avancées
        </label>
      </div>

      {/* Champs avancés */}
      {showAdvanced && (
        <div className={styles.advancedSection}>
          <h4 className={styles.subtitle}>Horaire réel de l’usine</h4>
          <div className={styles.taskRow}>
            Début de l’agenda (date + heure) :
            <input
              type="datetime-local"
              value={startDateTime}
              onChange={e => setStartDateTime(e.target.value)}
            />
          </div>
          <div className={styles.taskRow}>
            Heures d’ouverture :
            <input type="time" value={openingHours.start} onChange={e => setOpeningHours({ ...openingHours, start: e.target.value })} />
            à
            <input type="time" value={openingHours.end} onChange={e => setOpeningHours({ ...openingHours, end: e.target.value })} />
          </div>
          <div className={styles.taskRow}>
            Jours de congé :
            {Object.keys(weekendDays).map(day => (
              <label key={day} style={{ marginLeft: "10px" }}>
                <input
                  type="checkbox"
                  checked={weekendDays[day]}
                  onChange={() => setWeekendDays({ ...weekendDays, [day]: !weekendDays[day] })}
                />
                {day.charAt(0).toUpperCase() + day.slice(1)}
              </label>
            ))}
          </div>
          <div className={styles.taskRow}>
            Jours fériés :
            {feries.map((date, i) => (
              <div key={i}>
                <input
                  type="date"
                  value={date}
                  onChange={e => {
                    const updated = [...feries];
                    updated[i] = e.target.value;
                    setFeries(updated);
                  }}
                />
              </div>
            ))}
            <button className={styles.button} type="button" onClick={() => setFeries([...feries, ""])}>
              + Ajouter un jour férié
            </button>
          </div>
          <h4 className={styles.subtitle}>Dates dues avec heure (par job)</h4>
          {jobs.map((_, jobIdx) => (
            <div key={jobIdx} className={styles.taskRow}>
              {jobNames[jobIdx] || `Job ${jobIdx}`} :
              <input
                type="datetime-local"
                value={dueDateTimes[jobIdx]}
                onChange={e => {
                  const newTimes = [...dueDateTimes];
                  newTimes[jobIdx] = e.target.value;
                  setDueDateTimes(newTimes);
                }}
              />
            </div>
          ))}
        </div>
      )}

      {/* Soumettre */}
      <button className={styles.submitButton} onClick={handleSubmit}>Lancer l'algorithme</button>

      {/* Erreur */}
      {error && <p className={styles.error}>{error}</p>}

      {/* Résultats */}
      {result && (
        <div className={styles.resultBlock}>
          <h3>Résultats</h3>
          <div><strong>Makespan :</strong> {result.makespan}</div>
          <div><strong>Flowtime :</strong> {result.flowtime}</div>
          <div><strong>Retard cumulé :</strong> {result.retard_cumule}</div>

          <h4>Temps de complétion</h4>
          <ul>
            {Object.entries(result.completion_times).map(([job, time]) => (
              <li key={job}>{job} : {time}</li>
            ))}
          </ul>

          <h4>Planification</h4>
          <ul>
            {Object.entries(result.planification).map(([machine, tasks]) => (
              <li key={machine}>
                <strong>{machine}</strong>
                <ul>
                  {tasks.map((t, i) => (
                    <li key={i}>Job {t.job} - Tâche {t.task} : {t.start} → {t.start + t.duration}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>

          {/* Diagramme de Gantt (mode normal) */}
          {ganttUrl && !showAdvanced && (
            <>
              <h4>Diagramme de Gantt</h4>
              <img
                src={ganttUrl}
                alt="Gantt"
                style={{ width: "100%", maxWidth: "700px", marginTop: "1rem", borderRadius: "0.5rem" }}
              />
              <button className={styles.downloadButton} onClick={handleDownloadGantt}>
                Télécharger le diagramme de Gantt
              </button>
            </>
          )}

          {/* Agenda interactif (mode avancé) */}
          {agendaData && showAdvanced && (
            <>
              <h4>Agenda réel</h4>
              <AgendaTimeline agendaData={agendaData} />
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default FlowshopSPTForm;
















