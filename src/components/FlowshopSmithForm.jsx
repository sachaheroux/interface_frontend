import { useState } from "react";
import styles from "./FlowshopSPTForm.module.css";

function FlowshopSmithForm() {
  const [jobs, setJobs] = useState([
    [10, 25],
    [8, 20]
  ]);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [ganttUrl, setGanttUrl] = useState(null);

  const API_URL = "https://interface-backend-1jgi.onrender.com";

  const addJob = () => {
    setJobs([...jobs, [1, 10]]);
  };

  const removeJob = () => {
    if (jobs.length > 1) {
      setJobs(jobs.slice(0, -1));
    }
  };

  const handleSubmit = () => {
    setError(null);
    setResult(null);
    setGanttUrl(null);

    fetch(`${API_URL}/smith`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobs })
    })
      .then(res => {
        if (!res.ok) return res.json().then(err => { throw new Error(err.detail); });
        return res.json();
      })
      .then(data => {
        setResult(data);
        return fetch(`${API_URL}/smith/gantt`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ jobs })
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
      <h2 className={styles.title}>Planification Flowshop - Smith</h2>

      <div className={styles.buttonGroup}>
        <button className={styles.button} onClick={addJob}>+ Ajouter un job</button>
        <button className={styles.button} onClick={removeJob}>- Supprimer un job</button>
      </div>

      <h4 className={styles.subtitle}>Jobs</h4>
      {jobs.map((job, idx) => (
        <div key={idx} className={styles.taskRow}>
          Job {idx} :
          Durée :
          <input
            type="number"
            value={job[0]}
            onChange={e => {
              const updated = [...jobs];
              updated[idx][0] = parseFloat(e.target.value);
              setJobs(updated);
            }}
          />
          Date due :
          <input
            type="number"
            value={job[1]}
            onChange={e => {
              const updated = [...jobs];
              updated[idx][1] = parseFloat(e.target.value);
              setJobs(updated);
            }}
          />
        </div>
      ))}

      <button className={styles.submitButton} onClick={handleSubmit}>Lancer l'algorithme</button>

      {error && <p className={styles.error}>{error}</p>}

      {result && (
        <div className={styles.resultBlock}>
          <h3>Résultats</h3>
          <div><strong>Séquence :</strong> {JSON.stringify(result.sequence)}</div>
          <div><strong>Flowtime :</strong> {result.flowtime}</div>
          <div><strong>Nombre moyen de jobs (N) :</strong> {result.N}</div>
          <div><strong>Retard cumulé :</strong> {result.cumulative_delay}</div>

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
