import { useState } from "react";
import styles from "./FlowshopSPTForm.module.css";

function LigneAssemblageCOMSOALForm() {
  const [tasks, setTasks] = useState([
    { id: 1, predecessors: null, duration: "20" },
    { id: 2, predecessors: "1", duration: "6" },
    { id: 3, predecessors: "2", duration: "5" },
    { id: 4, predecessors: null, duration: "21" },
    { id: 5, predecessors: null, duration: "8" },
    { id: 6, predecessors: null, duration: "35" },
    { id: 7, predecessors: "3, 4", duration: "15" },
    { id: 8, predecessors: "7", duration: "10" },
    { id: 9, predecessors: "5, 8", duration: "15" },
    { id: 10, predecessors: "3", duration: "5" },
    { id: 11, predecessors: "6, 10", duration: "46" },
    { id: 12, predecessors: "10, 11", duration: "16" }
  ]);
  const [cycleTime, setCycleTime] = useState("70");
  const [seed, setSeed] = useState("");
  const [unite, setUnite] = useState("minutes");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [chartUrl, setChartUrl] = useState(null);

  const API_URL = "https://interface-backend-1jgi.onrender.com";

  const addTask = () => {
    const newId = Math.max(...tasks.map(t => t.id)) + 1;
    setTasks([...tasks, { id: newId, predecessors: null, duration: "10" }]);
  };

  const removeTask = () => {
    if (tasks.length > 1) {
      const taskToRemove = tasks[tasks.length - 1];
      // Supprimer toutes les références à cette tâche dans les prédécesseurs
      const updatedTasks = tasks.slice(0, -1).map(task => {
        if (!task.predecessors) return task;
        
        let updatedPredecessors = task.predecessors;
        
        if (typeof task.predecessors === 'string') {
          const predecessorIds = task.predecessors.split(',').map(p => parseInt(p.trim())).filter(p => !isNaN(p));
          const filteredIds = predecessorIds.filter(p => p !== taskToRemove.id);
          updatedPredecessors = filteredIds.length === 0 ? null : filteredIds.join(', ');
        } else if (Array.isArray(task.predecessors)) {
          const filteredIds = task.predecessors.filter(p => p !== taskToRemove.id);
          updatedPredecessors = filteredIds.length === 0 ? null : filteredIds.join(', ');
        } else if (task.predecessors === taskToRemove.id) {
          updatedPredecessors = null;
        }
        
        return { ...task, predecessors: updatedPredecessors };
      });
      setTasks(updatedTasks);
    }
  };

  const handleTaskChange = (index, field, value) => {
    const newTasks = [...tasks];
    if (field === 'predecessors') {
      newTasks[index][field] = value === '' ? null : value;
    } else if (field === 'duration') {
      newTasks[index][field] = value;
    }
    setTasks(newTasks);
  };

  const formatPredecessorsForDisplay = (predecessors) => {
    if (!predecessors) return '';
    if (Array.isArray(predecessors)) return predecessors.join(', ');
    if (typeof predecessors === 'string') return predecessors;
    return predecessors.toString();
  };

  const parsePredecessors = (predecessorsValue) => {
    if (!predecessorsValue || predecessorsValue === '') return null;
    if (typeof predecessorsValue === 'string') {
      const predecessorIds = predecessorsValue.split(',').map(p => parseInt(p.trim())).filter(p => !isNaN(p));
      return predecessorIds.length === 0 ? null : (predecessorIds.length === 1 ? predecessorIds[0] : predecessorIds);
    }
    return predecessorsValue;
  };

  const getAvailablePredecessors = (currentTaskId) => {
    return tasks
      .filter(t => t.id < currentTaskId)
      .map(t => t.id)
      .join(', ');
  };

  const handleSubmit = () => {
    setError(null);
    setChartUrl(null);

    try {
      // Validation du temps de cycle
      const cycleTimeValue = parseFloat(cycleTime.replace(",", "."));
      if (isNaN(cycleTimeValue) || cycleTimeValue <= 0) {
        setError("Le temps de cycle doit être un nombre positif.");
        return;
      }

      // Préparer les données pour l'API
      const tasksData = tasks.map(task => ({
        id: task.id,
        predecessors: parsePredecessors(task.predecessors),
        duration: parseFloat(task.duration.replace(",", "."))
      }));

      const payload = {
        tasks_data: tasksData,
        cycle_time: cycleTimeValue,
        unite,
        seed: seed === '' ? null : parseInt(seed)
      };

      fetch(`${API_URL}/ligne_assemblage/comsoal`, {
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
          // Récupérer le graphique
          return fetch(`${API_URL}/ligne_assemblage/comsoal/chart`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
          });
        })
        .then(res => {
          if (!res.ok) throw new Error("Erreur Graphique API");
          return res.blob();
        })
        .then(blob => {
          const url = URL.createObjectURL(blob);
          setChartUrl(url);
        })
        .catch(err => setError(err.message));
    } catch (e) {
      setError("Erreur dans les données saisies.");
    }
  };

  const handleDownloadChart = () => {
    if (!chartUrl) return;
    const link = document.createElement("a");
    link.href = chartUrl;
    link.download = "equilibrage_comsoal.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Ligne d'assemblage - COMSOAL (Équilibrage)</h2>

      <div className={styles.unitSelector}>
        <label>Unité de temps :</label>
        <select value={unite} onChange={(e) => setUnite(e.target.value)} className={styles.select}>
          <option value="minutes">minutes</option>
          <option value="heures">heures</option>
          <option value="jours">jours</option>
        </select>
      </div>

      <div className={styles.taskRow}>
        <label><strong>Temps de cycle ({unite}) :</strong></label>
        <input
          type="text"
          inputMode="decimal"
          value={cycleTime}
          onChange={e => setCycleTime(e.target.value)}
          className={styles.input}
          placeholder="70"
        />
      </div>

      <div className={styles.taskRow}>
        <label>Graine aléatoire (optionnel) :</label>
        <input
          type="text"
          inputMode="numeric"
          value={seed}
          onChange={e => setSeed(e.target.value)}
          className={styles.input}
          placeholder="Laissez vide pour aléatoire"
        />
        <small className={styles.helpText}>
          Même graine = mêmes résultats
        </small>
      </div>

      <div className={styles.buttonGroup}>
        <button className={styles.button} onClick={addTask}>+ Ajouter une tâche</button>
        <button className={styles.button} onClick={removeTask}>- Supprimer une tâche</button>
      </div>

      <div className={styles.tasksContainer}>
        <h4 className={styles.subtitle}>Configuration des tâches</h4>
        
        {tasks.map((task, index) => (
          <div key={task.id} className={styles.jobBlock}>
            <h4>Tâche {task.id}</h4>
            
            <div className={styles.taskRow}>
              <label>Durée ({unite}) :</label>
              <input
                type="text"
                inputMode="decimal"
                value={task.duration}
                onChange={e => handleTaskChange(index, 'duration', e.target.value)}
                className={styles.input}
              />
            </div>

            <div className={styles.taskRow}>
              <label>Prédécesseurs immédiats :</label>
              <input
                type="text"
                value={formatPredecessorsForDisplay(task.predecessors)}
                onChange={e => handleTaskChange(index, 'predecessors', e.target.value)}
                placeholder="Ex: 1, 2 ou laissez vide si aucun"
                className={styles.input}
              />
              <small className={styles.helpText}>
                Disponibles: {getAvailablePredecessors(task.id) || "Aucun"}
              </small>
            </div>
          </div>
        ))}
      </div>

      <button className={styles.submitButton} onClick={handleSubmit}>
        Lancer l'équilibrage COMSOAL
      </button>

      {error && <p className={styles.error}>{error}</p>}

      {result && (
        <div className={styles.results}>
          <h3>Résultats de l'équilibrage COMSOAL</h3>
          
          <div className={styles.metricsGrid}>
            <div><strong>Nombre de stations :</strong> {result.metrics.nombre_stations}</div>
            <div><strong>Stations théoriques min :</strong> {result.metrics.stations_theoriques_min}</div>
            <div><strong>Efficacité :</strong> {result.metrics.efficacite}%</div>
            <div><strong>Utilisation moyenne :</strong> {result.metrics.utilisation_moyenne}%</div>
            <div><strong>Taux d'équilibrage :</strong> {result.metrics.taux_equilibrage}%</div>
            <div><strong>Temps de cycle :</strong> {result.cycle_time} {result.unite}</div>
          </div>

          <div className={styles.stationsSection}>
            <h4>Configuration des stations :</h4>
            {result.stations.map(station => (
              <div key={station.id} className={styles.stationBlock}>
                <strong>Station {station.id}</strong> - Utilisation : {station.utilization.toFixed(1)}%
                <br />
                Tâches : {station.tasks.join(", ")}
              </div>
            ))}
          </div>

          {chartUrl && (
            <div className={styles.ganttContainer}>
              <h4>Graphiques d'analyse</h4>
              <img
                src={chartUrl}
                alt="Graphiques COMSOAL"
                className={styles.gantt}
              />
              <button className={styles.downloadButton} onClick={handleDownloadChart}>
                Télécharger les graphiques
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default LigneAssemblageCOMSOALForm; 