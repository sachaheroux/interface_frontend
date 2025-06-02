import { useState } from "react";
import styles from "./FlowshopSPTForm.module.css";

function FlowshopEDDForm() {
  const [jobs, setJobs] = useState([
    [{ duration: "3" }, { duration: "2" }],
    [{ duration: "2" }, { duration: "4" }]
  ]);
  const [dueDates, setDueDates] = useState(["10", "9"]);
  const [jobNames, setJobNames] = useState(["Job 0", "Job 1"]);
  const [machineNames, setMachineNames] = useState(["Machine 0", "Machine 1"]);
  const [unite, setUnite] = useState("heures");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [ganttUrl, setGanttUrl] = useState(null);

  const API_URL = "https://interface-backend-1jgi.onrender.com";

  const addJob = () => {
    const machineCount = jobs[0].length;
    const newJob = Array.from({ length: machineCount }, () => ({ duration: "1" }));
    setJobs([...jobs, newJob]);
    setDueDates([...dueDates, "10"]);
    setJobNames([...jobNames, `Job ${jobs.length}`]);
  };

  const removeJob = () => {
    if (jobs.length > 1) {
      setJobs(jobs.slice(0, -1));
      setDueDates(dueDates.slice(0, -1));
      setJobNames(jobNames.slice(0, -1));
    }
  };

  const addTaskToAllJobs = () => {
    const updatedJobs = jobs.map(job => [...job, { duration: "1" }]);
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

  const handleSubmit = () => {
    setError(null);
    setGanttUrl(null);

    try {
      const formattedJobs = jobs.map(job =>
        job.map((op, i) => [i, parseFloat(op.duration.replace(",", "."))])
      );
      const formattedDueDates = dueDates.map(d => parseFloat(d.replace(",", ".")));

      const payload = {
        jobs_data: formattedJobs,
        due_dates: formattedDueDates,
        unite,
        job_names: jobNames,
        machine_names: machineNames
      };

      fetch(`${API_URL}/edd`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })
        .then(res => {
          if (!res.ok) throw new Error("Erreur API");
          return res.json();
        })
        .then(data => {
          setResult(data);
          return fetch(`${API_URL}/edd/gantt`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
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
      <h2 className={styles.title}>Planification Flowshop - EDD</h2>

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
        <button className={styles.button} onClick={addTaskToAllJobs}>+ Ajouter une tâche</button>
        <button className={styles.button} onClick={removeTaskFromAllJobs}>- Supprimer une tâche</button>
      </div>

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
              {machineNames[opIdx] || `Machine ${opIdx}`} - Durée ({unite}) :
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

      <button className={styles.submitButton} onClick={handleSubmit}>Lancer l'algorithme</button>

      {error && <p className={styles.error}>{error}</p>}

      {result && (
        <div className={styles.results}>
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
            <div className={styles.ganttContainer}>
              <h4>Diagramme de Gantt</h4>
              <img
                src={ganttUrl}
                alt="Gantt"
                className={styles.gantt}
              />
              <button className={styles.downloadButton} onClick={handleDownloadGantt}>
                Télécharger le diagramme de Gantt
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default FlowshopEDDForm;




