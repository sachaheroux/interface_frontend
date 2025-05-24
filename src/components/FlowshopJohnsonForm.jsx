import { useState } from "react";
import styles from "./FlowshopSPTForm.module.css";

function FlowshopJohnsonForm() {
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
    const newJob = [
      { machine: 0, duration: 1 },
      { machine: 1, duration: 1 }
    ];
    setJobs([...jobs, newJob]);
    setDueDates([...dueDates, 10]);
  };

  const removeJob = () => {
    if (jobs.length > 1) {
      setJobs(jobs.slice(0, -1));
      setDueDates(dueDates.slice(0, -1));
    }
  };

  const handleSubmit = () => {
    setError(null);
    setGanttUrl(null);

    const formattedJobs = jobs.map(job => [
      job[0].duration,
      job[1].duration
    ]);

    fetch(`${API_URL}/johnson`, {
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
        return fetch(`${API_URL}/johnson/gantt`, {
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
      <h2 className={styles.title}>Planification Flowshop - Johnson</h2>

      <div className={styles.buttonGroup}>
        <button className={styles.button} onClick={addJob}>+ Ajouter un job</button>
        <button className={styles.button} onClick={removeJob}>- Supprimer un job</button>
      </div>

      {jobs.map((job, jobIdx) => (
        <div key={jobIdx} className={styles.jobBlock}>
          <h4>Job {jobIdx}</h4>
          {job.map((op, opIdx) => (
            <div key={opIdx} className={styles.taskRow}>
              Machine {op.machine + 1} : 
              <input
                type="number"
                value={op.duration}
                onChange={e => {
                  const newJobs = [...jobs];
                  newJobs[jobIdx][opIdx].duration = parseInt(e.target.value);
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
            value={d}
            onChange={e => {
              const newDates = [...dueDates];
              newDates[i] = parseInt(e.target.value);
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

          <h4>Séquence optimale</h4>
          <div>{result.sequence.join(" → ")}</div>

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

export default FlowshopJohnsonForm;
