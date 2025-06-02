import { useState } from "react";
import styles from "./FlowshopSPTForm.module.css";

export default function LigneAssemblageMixteEquilibrageForm() {
  const [tasks, setTasks] = useState([
    { 
      id: 1, 
      models: [
        { predecessors: null, time: 3 },
        { predecessors: null, time: 3 }
      ] 
    },
    { 
      id: 2, 
      models: [
        { predecessors: "1", time: 4 },
        { predecessors: "1", time: 4 }
      ] 
    },
    { 
      id: 3, 
      models: [
        { predecessors: "1", time: 2 },
        { predecessors: "1", time: 3 }
      ] 
    },
    { 
      id: 4, 
      models: [
        { predecessors: "1", time: 6 },
        { predecessors: "1", time: 5 }
      ] 
    },
    { 
      id: 5, 
      models: [
        { predecessors: "2", time: 3 },
        { predecessors: "2", time: 0 }
      ] 
    },
    { 
      id: 6, 
      models: [
        { predecessors: "3", time: 4 },
        { predecessors: "3", time: 2 }
      ] 
    },
    { 
      id: 7, 
      models: [
        { predecessors: null, time: 0 },
        { predecessors: "4", time: 4 }
      ] 
    },
    { 
      id: 8, 
      models: [
        { predecessors: "5, 6", time: 5 },
        { predecessors: "7", time: 4 }
      ] 
    }
  ]);

  const [models, setModels] = useState([4, 6]); // Demande par modèle
  const [cycleTime, setCycleTime] = useState("60");
  const [unite, setUnite] = useState("minutes");
  const [result, setResult] = useState(null);
  const [chartUrl, setChartUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_URL = "http://localhost:8000";

  const addTask = () => {
    const newId = Math.max(...tasks.map(t => t.id)) + 1;
    setTasks([...tasks, { 
      id: newId, 
      models: models.map(() => ({ predecessors: null, time: 0 }))
    }]);
  };

  const removeTask = () => {
    if (tasks.length > 1) {
      const taskToRemove = tasks[tasks.length - 1];
      // Supprimer toutes les références à cette tâche dans les prédécesseurs
      const updatedTasks = tasks.slice(0, -1).map(task => {
        return {
          ...task,
          models: task.models.map(model => {
            if (!model.predecessors) return model;
            
            let updatedPredecessors = model.predecessors;
            if (typeof model.predecessors === 'string') {
              const predecessorIds = model.predecessors.split(',').map(p => parseInt(p.trim())).filter(p => !isNaN(p));
              const filteredIds = predecessorIds.filter(p => p !== taskToRemove.id);
              updatedPredecessors = filteredIds.length === 0 ? null : filteredIds.join(', ');
            }
            
            return { ...model, predecessors: updatedPredecessors };
          })
        };
      });
      setTasks(updatedTasks);
    }
  };

  const addModel = () => {
    setModels([...models, 1]);
    const newTasks = tasks.map(task => ({
      ...task, 
      models: [...task.models, { predecessors: null, time: 0 }]
    }));
    setTasks(newTasks);
  };

  const removeModel = () => {
    if (models.length > 2) {
      setModels(models.slice(0, -1));
      const newTasks = tasks.map(task => ({
        ...task,
        models: task.models.slice(0, -1)
      }));
      setTasks(newTasks);
    }
  };

  const handleTaskChange = (taskIndex, modelIndex, field, value) => {
    const newTasks = [...tasks];
    if (field === 'predecessors') {
      newTasks[taskIndex].models[modelIndex][field] = value === '' ? null : value;
    } else if (field === 'time') {
      newTasks[taskIndex].models[modelIndex][field] = parseFloat(value) || 0;
    }
    setTasks(newTasks);
  };

  const handleModelDemandChange = (index, value) => {
    const newModels = [...models];
    newModels[index] = parseInt(value) || 0;
    setModels(newModels);
  };

  const formatPredecessors = (predecessors) => {
    if (!predecessors || predecessors.length === 0) return "";
    if (Array.isArray(predecessors)) return predecessors.join(", ");
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
    setChartUrl(null);
    setIsLoading(true);

    try {
      // Validation du temps de cycle
      const cycleTimeValue = parseFloat(cycleTime.replace(",", "."));
      if (isNaN(cycleTimeValue) || cycleTimeValue <= 0) {
        setError("Le temps de cycle doit être un nombre positif.");
        setIsLoading(false);
        return;
      }

      // Transformer les données au format attendu par le backend
      const tasksData = tasks.map(task => {
        const formatted = [task.id];
        task.models.forEach(model => {
          let predecessors = null;
          if (model.predecessors) {
            if (typeof model.predecessors === 'string') {
              const predecessorIds = model.predecessors.split(',').map(p => parseInt(p.trim())).filter(p => !isNaN(p));
              predecessors = predecessorIds.length === 1 ? predecessorIds[0] : predecessorIds;
            } else {
              predecessors = model.predecessors;
            }
          }
          formatted.push([predecessors, model.time]);
        });
        return formatted;
      });

      const requestData = {
        models: models,
        tasks_data: tasksData,
        cycle_time: cycleTimeValue,
        unite
      };

      // Appel API pour les résultats
      fetch(`${API_URL}/ligne_assemblage_mixte/equilibrage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData)
      })
        .then(res => {
          if (!res.ok) throw new Error("Erreur API");
          return res.json();
        })
        .then(data => {
          setResult(data);
          // Récupérer le graphique
          return fetch(`${API_URL}/ligne_assemblage_mixte/equilibrage/chart`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestData)
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
        .catch(err => setError(err.message))
        .finally(() => setIsLoading(false));
    } catch (e) {
      setError("Erreur dans les données saisies.");
      setIsLoading(false);
    }
  };

  const handleDownloadChart = () => {
    if (!chartUrl) return;
    const link = document.createElement("a");
    link.href = chartUrl;
    link.download = "equilibrage_ligne_mixte.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Ligne d'assemblage mixte - Équilibrage</h2>
      
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
          placeholder="60"
        />
      </div>

      {/* Configuration des modèles - Style variation du goulot */}
      <div className={styles.tasksContainer}>
        <h4 className={styles.subtitle}>Demande par modèle (par période/cycle)</h4>
        <div className={styles.buttonGroup}>
          <button className={styles.button} onClick={addModel}>+ Ajouter un modèle</button>
          <button className={styles.button} onClick={removeModel}>- Supprimer un modèle</button>
        </div>
        
        <div className={styles.modelDemandsContainer}>
          {models.map((demand, index) => (
            <div key={index} className={styles.taskRow}>
              <label>Modèle {index + 1} :</label>
              <input
                type="number"
                min="1"
                value={demand}
                onChange={e => handleModelDemandChange(index, e.target.value)}
                className={styles.input}
              />
            </div>
          ))}
        </div>
      </div>

      <div className={styles.buttonGroup}>
        <button className={styles.button} onClick={addTask}>+ Ajouter une tâche</button>
        <button className={styles.button} onClick={removeTask}>- Supprimer une tâche</button>
      </div>

      {/* Configuration des tâches - Style LPT */}
      <div className={styles.tasksContainer}>
        <h4 className={styles.subtitle}>Configuration des tâches</h4>
        
        {tasks.map((task, taskIndex) => (
          <div key={task.id} className={styles.jobBlock}>
            <h4>Tâche {task.id}</h4>
            
            {task.models.map((model, modelIndex) => (
              <div key={modelIndex} style={{ marginBottom: "1rem" }}>
                <h5 style={{ margin: "0 0 0.5rem 0", color: "#1e40af" }}>Modèle {modelIndex + 1}</h5>
                
                <div className={styles.taskRow}>
                  <label>Temps ({unite}) :</label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={model.time}
                    onChange={(e) => handleTaskChange(taskIndex, modelIndex, "time", e.target.value)}
                    className={styles.input}
                  />
                </div>
                
                <div className={styles.taskRow}>
                  <label>Prédécesseurs immédiats :</label>
                  <input
                    type="text"
                    value={formatPredecessors(model.predecessors)}
                    onChange={(e) => handleTaskChange(taskIndex, modelIndex, "predecessors", e.target.value)}
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
        ))}
      </div>

      <button 
        onClick={handleSubmit} 
        disabled={isLoading}
        className={styles.submitButton}
      >
        {isLoading ? "Optimisation en cours..." : "Lancer l'équilibrage"}
      </button>

      {error && <div className={styles.error}>{error}</div>}

      {result && (
        <div className={styles.results}>
          <h3>Résultats de l'équilibrage</h3>
          
          <div className={styles.metricsGrid}>
            <div>
              <strong>Statut :</strong> {result.status}
            </div>
            <div>
              <strong>Stations utilisées :</strong> {result.stations_used}
            </div>
            <div>
              <strong>Minimum théorique :</strong> {result.theoretical_minimum?.toFixed(2)}
            </div>
            <div>
              <strong>Efficacité :</strong> {result.efficiency?.toFixed(1)}%
            </div>
            <div>
              <strong>Utilisation moyenne :</strong> {result.average_utilization?.toFixed(1)}%
            </div>
            <div>
              <strong>Variance utilisation :</strong> {result.utilization_variance?.toFixed(2)}
            </div>
          </div>

          {/* Affichage de l'assignation des tâches */}
          <div className={styles.stationsSection}>
            <h4>Configuration des stations :</h4>
            {result.station_assignments && Object.entries(result.station_assignments).map(([station, data]) => (
              <div key={station} className={styles.stationBlock}>
                <strong>Station {station}</strong> - Utilisation : {data.utilization?.toFixed(1)}%
                <br />
                Tâches : {data.tasks.join(", ")} - Charge : {data.load?.toFixed(1)} {unite}
              </div>
            ))}
          </div>

          {chartUrl && (
            <div className={styles.ganttContainer}>
              <h4>Graphique d'utilisation des stations</h4>
              <img 
                src={chartUrl} 
                alt="Graphique d'utilisation des stations" 
                className={styles.gantt}
              />
              <button onClick={handleDownloadChart} className={styles.downloadButton}>
                Télécharger le graphique
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 