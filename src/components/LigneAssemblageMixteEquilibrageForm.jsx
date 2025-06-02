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
        { predecessors: [1], time: 4 },
        { predecessors: [1], time: 4 }
      ] 
    },
    { 
      id: 3, 
      models: [
        { predecessors: [1], time: 2 },
        { predecessors: [1], time: 3 }
      ] 
    },
    { 
      id: 4, 
      models: [
        { predecessors: [1], time: 6 },
        { predecessors: [1], time: 5 }
      ] 
    },
    { 
      id: 5, 
      models: [
        { predecessors: [2], time: 3 },
        { predecessors: [2], time: 0 }
      ] 
    },
    { 
      id: 6, 
      models: [
        { predecessors: [3, 4], time: 4 },
        { predecessors: [3], time: 2 }
      ] 
    },
    { 
      id: 7, 
      models: [
        { predecessors: null, time: 0 },
        { predecessors: [4], time: 4 }
      ] 
    },
    { 
      id: 8, 
      models: [
        { predecessors: [5, 6], time: 5 },
        { predecessors: [7], time: 4 }
      ] 
    }
  ]);

  const [models, setModels] = useState([4, 6]);
  const [cycleTime, setCycleTime] = useState(60);
  const [unite, setUnite] = useState("minutes");
  const [results, setResults] = useState(null);
  const [chartUrl, setChartUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleTaskChange = (taskIndex, modelIndex, field, value) => {
    const newTasks = [...tasks];
    if (field === "id") {
      newTasks[taskIndex].id = parseInt(value) || 1;
    } else if (field === "predecessors") {
      // Traitement intelligent de la saisie des prédécesseurs
      let processedValue = null;
      if (value && value.trim() !== "") {
        if (value.includes(",")) {
          // Plusieurs prédécesseurs séparés par des virgules
          processedValue = value.split(",").map(p => parseInt(p.trim())).filter(p => !isNaN(p));
        } else {
          // Un seul prédécesseur
          const singlePred = parseInt(value.trim());
          if (!isNaN(singlePred)) {
            processedValue = [singlePred];
          }
        }
      }
      newTasks[taskIndex].models[modelIndex].predecessors = processedValue;
    } else if (field === "time") {
      newTasks[taskIndex].models[modelIndex].time = parseInt(value) || 0;
    }
    setTasks(newTasks);
  };

  const handleModelDemandChange = (index, value) => {
    const newModels = [...models];
    newModels[index] = parseInt(value) || 0;
    setModels(newModels);
  };

  const addTask = () => {
    const newTask = {
      id: tasks.length + 1,
      models: models.map(() => ({ predecessors: null, time: 1 }))
    };
    setTasks([...tasks, newTask]);
  };

  const removeTask = (index) => {
    if (tasks.length > 1) {
      setTasks(tasks.filter((_, i) => i !== index));
    }
  };

  const addModel = () => {
    setModels([...models, 1]);
    const newTasks = tasks.map(task => ({
      ...task,
      models: [...task.models, { predecessors: null, time: 1 }]
    }));
    setTasks(newTasks);
  };

  const removeModel = (modelIndex) => {
    if (models.length > 2) {
      setModels(models.filter((_, i) => i !== modelIndex));
      const newTasks = tasks.map(task => ({
        ...task,
        models: task.models.filter((_, i) => i !== modelIndex)
      }));
      setTasks(newTasks);
    }
  };

  const formatPredecessors = (predecessors) => {
    if (!predecessors || predecessors.length === 0) return "";
    return predecessors.join(", ");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResults(null);
    setChartUrl(null);

    try {
      const requestData = {
        models: models,
        tasks_data: tasks,
        cycle_time: cycleTime,
        unite: unite
      };

      // Requête pour les résultats
      const response = await fetch("http://localhost:8000/ligne_assemblage_mixte/equilibrage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();
      setResults(data);

      // Requête pour le graphique
      const chartResponse = await fetch("http://localhost:8000/ligne_assemblage_mixte/equilibrage/chart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData),
      });

      if (chartResponse.ok) {
        const chartBlob = await chartResponse.blob();
        const chartUrl = URL.createObjectURL(chartBlob);
        setChartUrl(chartUrl);
      }
    } catch (err) {
      setError(`Erreur lors du calcul: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h2>Équilibrage de Ligne d'Assemblage Mixte</h2>
      
      <form onSubmit={handleSubmit} className={styles.form}>
        {/* Configuration des modèles */}
        <div className={styles.modelsSection}>
          <h3>Demande par Modèle</h3>
          <div className={styles.modelsGrid}>
            {models.map((demand, index) => (
              <div key={index} className={styles.modelInput}>
                <label>Modèle {index + 1}:</label>
                <input
                  type="number"
                  value={demand}
                  onChange={(e) => handleModelDemandChange(index, e.target.value)}
                  min="1"
                />
                {models.length > 2 && (
                  <button type="button" onClick={() => removeModel(index)} className={styles.removeBtn}>
                    ✕
                  </button>
                )}
              </div>
            ))}
            <button type="button" onClick={addModel} className={styles.addBtn}>
              + Ajouter Modèle
            </button>
          </div>
        </div>

        {/* Configuration des tâches */}
        <div className={styles.tasksSection}>
          <h3>Configuration des Tâches</h3>
          <div className={styles.tasksGrid}>
            <div className={styles.taskHeader}>
              <span>Tâche</span>
              {models.map((_, index) => (
                <span key={index}>Modèle {index + 1}</span>
              ))}
              <span>Actions</span>
            </div>
            
            {tasks.map((task, taskIndex) => (
              <div key={taskIndex} className={styles.taskRow}>
                <input
                  type="number"
                  value={task.id}
                  onChange={(e) => handleTaskChange(taskIndex, 0, "id", e.target.value)}
                  min="1"
                  className={styles.taskIdInput}
                />
                
                {task.models.map((model, modelIndex) => (
                  <div key={modelIndex} className={styles.modelData}>
                    <div className={styles.modelField}>
                      <label>Prédécesseurs:</label>
                      <input
                        type="text"
                        value={formatPredecessors(model.predecessors)}
                        onChange={(e) => handleTaskChange(taskIndex, modelIndex, "predecessors", e.target.value)}
                        placeholder="Ex: 1, 2"
                      />
                    </div>
                    <div className={styles.modelField}>
                      <label>Temps:</label>
                      <input
                        type="number"
                        value={model.time}
                        onChange={(e) => handleTaskChange(taskIndex, modelIndex, "time", e.target.value)}
                        min="0"
                      />
                    </div>
                  </div>
                ))}
                
                <button 
                  type="button" 
                  onClick={() => removeTask(taskIndex)}
                  disabled={tasks.length <= 1}
                  className={styles.removeBtn}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          
          <button type="button" onClick={addTask} className={styles.addBtn}>
            + Ajouter Tâche
          </button>
        </div>

        {/* Paramètres globaux */}
        <div className={styles.inputGroup}>
          <label>Temps de cycle:</label>
          <input
            type="number"
            value={cycleTime}
            onChange={(e) => setCycleTime(parseInt(e.target.value) || 60)}
            min="1"
          />
        </div>

        <div className={styles.inputGroup}>
          <label>Unité de temps:</label>
          <select value={unite} onChange={(e) => setUnite(e.target.value)}>
            <option value="minutes">Minutes</option>
            <option value="heures">Heures</option>
            <option value="secondes">Secondes</option>
          </select>
        </div>

        <button type="submit" disabled={loading} className={styles.submitBtn}>
          {loading ? "Optimisation en cours..." : "Lancer l'équilibrage"}
        </button>
      </form>

      {error && <div className={styles.error}>{error}</div>}

      {results && (
        <div className={styles.results}>
          <h3>Résultats de l'Équilibrage</h3>
          
          <div className={styles.metricsGrid}>
            <div className={styles.metric}>
              <span className={styles.metricLabel}>Statut:</span>
              <span className={`${styles.metricValue} ${results.optimal ? styles.optimal : styles.suboptimal}`}>
                {results.status}
              </span>
            </div>
            
            <div className={styles.metric}>
              <span className={styles.metricLabel}>Stations utilisées:</span>
              <span className={styles.metricValue}>{results.used_stations}</span>
            </div>
            
            <div className={styles.metric}>
              <span className={styles.metricLabel}>Minimum théorique:</span>
              <span className={styles.metricValue}>{results.theoretical_min_stations}</span>
            </div>
            
            <div className={styles.metric}>
              <span className={styles.metricLabel}>Efficacité:</span>
              <span className={styles.metricValue}>{results.efficiency}%</span>
            </div>
            
            <div className={styles.metric}>
              <span className={styles.metricLabel}>Utilisation moyenne:</span>
              <span className={styles.metricValue}>{results.avg_utilization}%</span>
            </div>
            
            <div className={styles.metric}>
              <span className={styles.metricLabel}>Utilisation max:</span>
              <span className={styles.metricValue}>{results.max_utilization}%</span>
            </div>
            
            <div className={styles.metric}>
              <span className={styles.metricLabel}>Variance utilisation:</span>
              <span className={styles.metricValue}>{results.utilization_variance}</span>
            </div>
          </div>

          <h4>Détail des Stations</h4>
          <div className={styles.stationsSection}>
            {results.stations.map((station, index) => (
              <div key={index} className={styles.stationBlock}>
                <h5>Station {station.station}</h5>
                <p><strong>Tâches:</strong> {station.tasks.join(", ")}</p>
                <p><strong>Charge:</strong> {station.load} {unite}</p>
                <p><strong>Utilisation:</strong> {station.utilization}%</p>
              </div>
            ))}
          </div>

          {chartUrl && (
            <div className={styles.chartSection}>
              <h4>Visualisation de l'Équilibrage</h4>
              <img src={chartUrl} alt="Graphique d'équilibrage" className={styles.chart} />
            </div>
          )}
        </div>
      )}
    </div>
  );
} 