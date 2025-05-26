import { useState } from "react";
import styles from "./FlowshopSPTForm.module.css";

function FlowshopSPTForm() {
  const [jobs, setJobs] = useState([
    [{ machine: 0, duration: 3 }, { machine: 1, duration: 2 }],
    [{ machine: 0, duration: 2 }, { machine: 1, duration: 4 }]
  ]);
  const [dueDates, setDueDates] = useState([10, 9]);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [ganttUrl, setGanttUrl] = useState(null);

  const API_URL = "https://interface-backend-1jgi.onrender.com";

  const addJob = () => {
    const machineCount = jobs[0].length;
    const newJob = Array.from({ length: machineCount }, (_, i) => ({ machine: i, duration: 1 }));
    setJobs([...jobs, newJob]);
    setDueDates([...dueDates, 10]);
  };

  const removeJob = () => {
    if (jobs.length > 1) {
      setJobs(jobs.slice(0, -1));
      setDueDates(dueDates.slice(0, -1));
    }
  };

  const addTaskToAllJobs = () => {
    const updatedJobs = jobs.map(job => [...job, { machine: job.length, duration: 1 }]);
    setJobs(updatedJobs);
  };

  const removeTaskFromAllJobs = () => {
    const updatedJobs = jobs.map(job => job.length > 1 ? job.slice(0, -1) : job);
    setJobs(updatedJobs);
  };

  const handleSubmit = () => {
    setError(null);
    setGanttUrl(null);
    const formattedJobs = jobs.map(job => job.map(op => [op.machine, op.duration]));

    fetch(`${API_URL}/spt`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobs_data: formattedJobs, due_dates: dueDates })
    })
      .then(res => {
        if (!res.ok) throw new Error("Erreur API");
        return res.json();
      })
      .then(data => {
        setResult(data);
        return fetch(`${API_URL}/spt/gantt`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ jobs_data: formattedJobs, due_dates: dueDates })
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
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Planification Flowshop - SPT</h2>

      <div className={styles.buttonGroup}>
        <button className={styles.button} onClick={addJob}>+ Ajouter un job</button>
        <button className={styles.button} onClick={removeJob}>- Supprimer un job</button>
        <button className={styles.button} onClick={addTaskToAllJobs}>+ Ajouter une tâche</button>
        <button className={styles.button} onClick={removeTaskFromAllJobs}>- Supprimer une tâche</button>
      </div>

      {jobs.map((job, jobIdx) => (
        <div key={jobIdx} className={styles.jobBlock}>
          <h4>Job {jobIdx}</h4>
          {job.map((op, opIdx) => (
            <div key={opIdx} className={styles.taskRow}>
              Machine :
              <input
                type="number"
                value={op.machine}
                onChange={e => {
                  const newJobs = [...jobs];
                  newJobs[jobIdx][opIdx].machine = parseInt(e.target.value, 10);
                  setJobs(newJobs);
                }}
              />
              Durée :
              <input
                type="number"
                step="any"
                value={op.duration}
                onChange={e => {
                  const val = parseFloat(e.target.value.replace(",", "."));
                  const newJobs = [...jobs];
                  newJobs[jobIdx][opIdx].duration = isNaN(val) ? 0 : val;
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
            type="number"
            step="any"
            value={d}
            onChange={e => {
              const val = parseFloat(e.target.value.replace(",", "."));
              const newDates = [...dueDates];
              newDates[i] = isNaN(val) ? 0 : val;
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

export default FlowshopSPTForm;









