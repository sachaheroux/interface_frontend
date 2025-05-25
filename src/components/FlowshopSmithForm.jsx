import { useState } from "react";
import styles from "./FlowshopSPTForm.module.css";

function FlowshopSmithForm() {
  const [jobs, setJobs] = useState([
    { duration: 10, dueDate: 15 },
    { duration: 5, dueDate: 12 }
  ]);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [ganttUrl, setGanttUrl] = useState(null);

  const API_URL = "https://interface-backend-1jgi.onrender.com";

  const addJob = () => {
    setJobs([...jobs, { duration: 1, dueDate: 10 }]);
  };

  const removeJob = () => {
    if (jobs.length > 1) {
      setJobs(jobs.slice(0, -1));
    }
  };

  const handleSubmit = () => {
    setError(null);
    setGanttUrl(null);

    const formattedJobs = jobs.map(job => [job.duration, job.dueDate]);
console.log("Jobs envoyés à /smith :", formattedJobs);

    fetch(`${API_URL}/smith`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobs: formattedJobs })
    })
      .then(res => {
        if (!res.ok) throw new Error("Erreur API");
        return res.json();
      })
      .then(data => {
        setResult(data);
        return fetch(`${API_URL}/smith/gantt`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ jobs: formattedJobs })
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
      <h2 className={styles.title}>Planification - Règle de Smith</h2>

      <div className={styles.buttonGroup}>
        <button className={styles.button} onClick={addJob}>+ Ajouter un job</button>
        <button className={styles.button} onClick={removeJob}>- Supprimer un job</button>
      </div>

      {jobs.map((job, idx) => (
        <div key={idx} className={styles.taskRow}>
          Job {idx} :
          Durée :
          <input
            type="number"
            value={job.duration}
            onChange={e => {
              const updatedJobs = [...jobs];
              updatedJobs[idx].duration = parseInt(e.target.value);
              setJobs(updatedJobs);
            }}
          />
          Date due :
          <input
            type="number"
            value={job.dueDate}
            onChange={e => {
              const updatedJobs = [...jobs];
              updatedJobs[idx].dueDate = parseInt(e.target.value);
              setJobs(updatedJobs);
            }}
          />
        </div>
      ))}

      <button className={styles.submitButton} onClick={handleSubmit}>Lancer l'algorithme</button>

      {error && <p className={styles.error}>{error}</p>}

      {result && (
        <div className={styles.resultBlock}>
          <h3>Résultats</h3>
          <div><strong>Flowtime :</strong> {result.flowtime}</div>
          <div><strong>Nombre de jobs (N) :</strong> {result.N}</div>
          <div><strong>Retard cumulé :</strong> {result.cumulative_delay}</div>

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

export default FlowshopSmithForm;