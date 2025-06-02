import { useState } from "react";
import styles from "./FlowshopSPTForm.module.css";

function LigneAssemblagePrecedenceForm() {
  const [tasks, setTasks] = useState([
    { id: 1, predecessors: null, duration: "20" },
    { id: 2, predecessors: [1], duration: "6" },
    { id: 3, predecessors: [2], duration: "5" },
    { id: 4, predecessors: null, duration: "21" },
    { id: 5, predecessors: null, duration: "8" },
    { id: 6, predecessors: null, duration: "35" },
    { id: 7, predecessors: [3, 4], duration: "15" },
    { id: 8, predecessors: [7], duration: "10" },
    { id: 9, predecessors: [5, 8], duration: "15" },
    { id: 10, predecessors: [3], duration: "5" },
    { id: 11, predecessors: [6, 10], duration: "46" },
    { id: 12, predecessors: [10, 11], duration: "16" }
  ]);
  const [unite, setUnite] = useState("minutes");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [diagramUrl, setDiagramUrl] = useState(null);

  const API_URL = "https://interface-backend-1jgi.onrender.com";

  const addTask = () => {
    const newId = Math.max(...tasks.map(t => t.id)) + 1;
    setTasks([...tasks, { id: newId, predecessors: null, duration: "10" }]);
  };

  const removeTask = () => {
    if (tasks.length > 1) {
      const taskToRemove = tasks[tasks.length - 1];
      // Supprimer toutes les références à cette tâche dans les prédécesseurs
      const updatedTasks = tasks.slice(0, -1).map(task => ({
        ...task,
        predecessors: task.predecessors 
          ? (Array.isArray(task.predecessors) 
              ? task.predecessors.filter(p => p !== taskToRemove.id)
              : (task.predecessors === taskToRemove.id ? null : task.predecessors))
          : null
      }));
      setTasks(updatedTasks);
    }
  };

  const handleTaskChange = (index, field, value) => {
    const newTasks = [...tasks];
    if (field === 'predecessors') {
      if (value === '' || value === null) {
        newTasks[index][field] = null;
      } else {
        // Convertir en array d'entiers
        const predecessorIds = value.split(',').map(p => parseInt(p.trim())).filter(p => !isNaN(p));
        newTasks[index][field] = predecessorIds.length === 0 ? null : predecessorIds;
      }
    } else if (field === 'duration') {
      newTasks[index][field] = value;
    }
    setTasks(newTasks);
  };

  const formatPredecessorsForDisplay = (predecessors) => {
    if (!predecessors) return '';
    if (Array.isArray(predecessors)) return predecessors.join(', ');
    return predecessors.toString();
  };

  const getAvailablePredecessors = (currentTaskId) => {
    return tasks
      .filter(t => t.id < currentTaskId)
      .map(t => t.id)
      .join(', ');
  };

  const handleSubmit = () => {
    setError(null);
    setDiagramUrl(null);

    try {
      // Préparer les données pour l'API
      const tasksData = tasks.map(task => ({
        id: task.id,
        predecessors: task.predecessors,
        duration: parseFloat(task.duration.replace(",", "."))
      }));

      const payload = {
        tasks_data: tasksData,
        unite
      };

      fetch(`${API_URL}/ligne_assemblage/precedence`, {
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
          // Récupérer le diagramme
          return fetch(`${API_URL}/ligne_assemblage/precedence/diagram`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
          });
        })
        .then(res => {
          if (!res.ok) throw new Error("Erreur Diagramme API");
          return res.blob();
        })
        .then(blob => {
          const url = URL.createObjectURL(blob);
          setDiagramUrl(url);
        })
        .catch(err => setError(err.message));
    } catch (e) {
      setError("Erreur dans les données saisies.");
    }
  };

  const handleDownloadDiagram = () => {
    if (!diagramUrl) return;
    const link = document.createElement("a");
    link.href = diagramUrl;
    link.download = "diagramme_precedence.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Ligne d'assemblage - Diagramme de Précédence</h2>

      <div className={styles.unitSelector}>
        <label>Unité de temps :</label>
        <select value={unite} onChange={(e) => setUnite(e.target.value)} className={styles.select}>
          <option value="minutes">minutes</option>
          <option value="heures">heures</option>
          <option value="jours">jours</option>
        </select>
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
        Générer le diagramme de précédence
      </button>

      {error && <p className={styles.error}>{error}</p>}

      {result && (
        <div className={styles.results}>
          <h3>Analyse du diagramme de précédence</h3>
          
          <div className={styles.metricsGrid}>
            <div><strong>Nombre de tâches :</strong> {result.nombre_taches}</div>
            <div><strong>Nombre de relations :</strong> {result.nombre_relations}</div>
            <div><strong>Durée critique :</strong> {result.metrics.duree_critique} {unite}</div>
            <div><strong>Durée totale :</strong> {result.metrics.duree_totale} {unite}</div>
            <div><strong>Nombre de niveaux :</strong> {result.metrics.nombre_niveaux}</div>
            <div><strong>Taux de parallélisme :</strong> {result.metrics.taux_parallelisme}</div>
          </div>

          <div className={styles.criticalPath}>
            <h4>Chemin critique :</h4>
            <p>{result.metrics.chemin_critique}</p>
          </div>

          {diagramUrl && (
            <div className={styles.ganttContainer}>
              <h4>Diagramme de Précédence</h4>
              <img
                src={diagramUrl}
                alt="Diagramme de Précédence"
                className={styles.gantt}
              />
              <button className={styles.downloadButton} onClick={handleDownloadDiagram}>
                Télécharger le diagramme
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default LigneAssemblagePrecedenceForm; 