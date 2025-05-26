import { useState } from "react";
import styles from "./JohnsonForm.module.css";

function JohnsonForm() {
  const [jobs, setJobs] = useState([
    ["3", "2"],
    ["2", "4"]
  ]);
  const [dueDates, setDueDates] = useState(["10", "9"]);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [ganttUrl, setGanttUrl] = useState(null);

  const API_URL = "https://interface-backend-1jgi.onrender.com";

  const addJob = () => {
    const taskCount = jobs[0].length;
    const newJob = Array.from({ length: taskCount }, () => "1");
    setJobs([...jobs, newJob]);
    setDueDates([...dueDates, "10"]);
  };

  const removeJob = () => {
    if (jobs.length > 1) {
      setJobs(jobs.slice(0, -1));
      setDueDates(dueDates.slice(0, -1));
    }
  };

  const addTask = () => {
    const updatedJobs = jobs.map(job => [...job, "1"]);
    setJobs(updatedJobs);
  };

  const removeTask = () => {
    const updatedJobs = jobs.map(job => job.length > 1 ? job.slice(0, -1) : job);
    setJobs(updatedJobs);
  };

  const handleSubmit = () => {
    setError(null);
    setGanttUrl(null);

    try {
      const formattedJobs = jobs.map(job =>
        job.map(value => parseFloat(value.replace(",", ".")))
      );
      const formattedDueDates = dueDates.map(d => parseFloat(d.replace(",", ".")));

      fetch(`${API_URL}/johnson`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobs_data: formattedJobs, due_dates: formattedDueDates })
      })
        .then(res => {
          if (!res.ok) throw new Error("Erreur API");
          return res.json();
        })
        .then(data => {
          setResult(data);
          return fetch(`${API_URL}/johnson/gantt`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ jobs_data: formattedJobs, due_dates: formattedDueDates })
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
      <h2 className={styles.title}>Planification Johnson</h2>

      <div className={styles.buttonGroup}>
        <button className={styles.button} onClick={addJob}>+ Ajouter un job</button>
        <button className={styles.button} onClick={removeJob}>- Supprimer un job</button>
        <button className={styles.button} onClick={addTask}>+ Ajouter une tâche</button>
        <button className={styles.button} onClick={removeTask}>- Supprimer une tâche</button>
      </div>

      {jobs.map((job, jobIdx) => (
        <div key={jobIdx} className={styles.jobBlock}>
          <h4>Job {jobIdx}</h4>
          {job.map((value, idx) => (
            <div key={idx} className={styles.taskRow}>
              Tâche {idx} :
              <input
                type="text"
                inputMode="decimal"
                value={value}
                onChange={e => {
                  const newJobs = [...jobs];
                  newJobs[jobIdx][idx] = e.target.value;
                  setJobs(newJobs);
                }}
              />
            </div>
          ))}
        </div>
      ))}

      <h4 className={styles.subtitle}>Dates dues</h4>
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

      <button className={styles.submitButton} onClick={handleSubmit}>Lancer l'algorithme</button>

      {error && <p className={styles.error}>{error}</p>}

      {result && (
        <div className={styles.resultBlock}>
          <h3>Résultats</h3>
          <div><strong>Ordre :</strong> {result.sequence.join(" → ")}</div>
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

          {ganttUrl && (
            <>
              <h4>Diagramme de Gantt</h4>
              <img
                src={ganttUrl}
                alt="Gantt"
                style={{ width: "100%", maxWidth: "700px", marginTop: "1rem", borderRadius: "0.5rem" }}
              />
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default JohnsonForm;

