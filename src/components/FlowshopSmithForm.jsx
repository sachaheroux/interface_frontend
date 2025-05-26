import { useState } from "react";
import styles from "./FlowshopSPTForm.module.css";

function FlowshopSmithForm() {
  const [jobs, setJobs] = useState([
    ["10", "25"],
    ["8", "20"]
  ]);
  const [unite, setUnite] = useState("heures");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [ganttUrl, setGanttUrl] = useState(null);

  const API_URL = "https://interface-backend-1jgi.onrender.com";

  const addJob = () => {
    setJobs([...jobs, ["1", "10"]]);
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

    try {
      const formattedJobs = jobs.map(([duration, due]) => [
        parseFloat(duration.replace(",", ".")),
        parseFloat(due.replace(",", "."))
      ]);

      fetch(`${API_URL}/smith`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobs: formattedJobs, unite })
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
            body: JSON.stringify({ jobs: formattedJobs, unite })
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
    link.download = "diagramme_gantt.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Planification Flowshop - Smith</h2>

      <div className={styles.unitSelector}>
        <label>Unité de temps :</label>
        <select value={unite} onChange={(e) => setUnite(e.target.value)} className={styles.select}>
          <option value="minutes">minutes</option>
          <option value="heures">heures</option>
          <option value="jours">jours</option>
        </select>
      </div>

      <div className={styles.buttonGroup}>
        <button className={styles.button} onClick={addJob}>+ Ajouter un job</button>
        <button className={styles.button} onClick={removeJob}>- Supprimer un job</button>
      </div>

      <h4 className={styles.subtitle}>Jobs</h4>
      {jobs.map((job, idx) => (
        <div key={idx} className={styles.taskRow}>
          Job {idx} :
          Durée ({unite}) :
          <input
            type="text"
            inputMode="decimal"
            value={job[0]}
            onChange={e => {
              const newJobs = [...jobs];
              newJobs[idx][0] = e.target.value;
              setJobs(newJobs);
            }}
          />
          Date due ({unite}) :
          <input
            type="text"
            inputMode="decimal"
            value={job[1]}
            onChange={e => {
              const newJobs = [...jobs];
              newJobs[idx][1] = e.target.value;
              setJobs(newJobs);
            }}
          />
        </div>
      ))}

      <button className={styles.submitButton} onClick={handleSubmit}>Lancer l'algorithme</button>

      {error && <p className={styles.error}>{error}</p>}

      {result && (
        <div className={styles.resultBlock}>
          <h3>Résultats</h3>
          <div><strong>Séquence :</strong> {result.sequence.join(" → ")}</div>
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
              <button className={styles.downloadButton} onClick={handleDownloadGantt}>
                Télécharger le diagramme de Gantt
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default FlowshopSmithForm;




