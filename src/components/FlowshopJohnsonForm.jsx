import { useState } from "react";
import styles from "./FlowshopSPTForm.module.css";

function JohnsonForm() {
  const [jobs, setJobs] = useState([
    [3, 2],
    [2, 4]
  ]);
  const [dueDates, setDueDates] = useState(["10", "9"]);
  const [jobNames, setJobNames] = useState(["Job 1", "Job 2"]);
  const [machineNames, setMachineNames] = useState(["Machine 1", "Machine 2"]);
  const [unit, setUnit] = useState("heures");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [ganttUrl, setGanttUrl] = useState(null);

  const API_URL = "https://interface-backend-1jgi.onrender.com";

  const handleSubmit = () => {
    setError(null);
    setGanttUrl(null);

    try {
      const formattedJobs = jobs.map(job =>
        job.map(d => parseFloat(d.toString().replace(",", ".")))
      );
      const formattedDueDates = dueDates.map(d => parseFloat(d.replace(",", ".")));

      fetch(`${API_URL}/johnson`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobs_data: formattedJobs,
          due_dates: formattedDueDates,
          unite: unit,
          job_names: jobNames,
          machine_names: machineNames
        })
      })
        .then(res => {
          if (!res.ok) return res.json().then(err => { throw new Error(err.detail); });
          return res.json();
        })
        .then(data => {
          setResult(data);
          return fetch(`${API_URL}/johnson/gantt`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              jobs_data: formattedJobs,
              due_dates: formattedDueDates,
              unite: unit,
              job_names: jobNames,
              machine_names: machineNames
            })
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

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Planification Flowshop - Johnson</h2>

      <div className={styles.dropdownGroup}>
        <label>Unité de temps :</label>
        <select
          className={styles.dropdown}
          value={unit}
          onChange={(e) => setUnit(e.target.value)}
        >
          <option value="heures">heures</option>
          <option value="minutes">minutes</option>
          <option value="jours">jours</option>
        </select>
      </div>

      {jobs.map((job, jobIdx) => (
        <div key={jobIdx} className={styles.jobBlock}>
          <h4>Job {jobIdx + 1}</h4>
          <input
            type="text"
            value={jobNames[jobIdx]}
            onChange={e => {
              const newNames = [...jobNames];
              newNames[jobIdx] = e.target.value;
              setJobNames(newNames);
            }}
            placeholder="Nom du job"
            className={styles.nameInput}
          />
          {job.map((duration, mIdx) => (
            <div key={mIdx} className={styles.taskRow}>
              Machine {mIdx + 1} :
              <input
                type="text"
                value={duration}
                inputMode="decimal"
                onChange={e => {
                  const newJobs = [...jobs];
                  newJobs[jobIdx][mIdx] = e.target.value;
                  setJobs(newJobs);
                }}
              />
              {jobIdx === 0 && (
                <input
                  type="text"
                  value={machineNames[mIdx]}
                  onChange={e => {
                    const newNames = [...machineNames];
                    newNames[mIdx] = e.target.value;
                    setMachineNames(newNames);
                  }}
                  placeholder="Nom machine"
                  className={styles.nameInput}
                />
              )}
            </div>
          ))}
        </div>
      ))}

      <h4 className={styles.subtitle}>Dates dues</h4>
      {dueDates.map((d, i) => (
        <div key={i} className={styles.taskRow}>
          {jobNames[i] || `Job ${i + 1}`} :
          <input
            type="text"
            value={d}
            inputMode="decimal"
            onChange={e => {
              const newDates = [...dueDates];
              newDates[i] = e.target.value;
              setDueDates(newDates);
            }}
          />
        </div>
      ))}

      <button className={styles.submitButton} onClick={handleSubmit}>Lancer l'algorithme</button>

      {error && <p className={styles.error}>{error}</p>}

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
                    <li key={i}>{jobNames[t.job] || `Job ${t.job}`} - Tâche {t.task} : {t.start} → {t.start + t.duration}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>

          {ganttUrl && (
            <>
              <h4>Diagramme de Gantt</h4>
              <img
                src={ganttUrl}
                alt="Gantt"
                style={{ width: "100%", maxWidth: "700px", marginTop: "1rem", borderRadius: "0.5rem" }}
              />
              <a href={ganttUrl} download="gantt.png">
                <button className={styles.downloadButton}>📥 Télécharger le Gantt</button>
              </a>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default JohnsonForm;





