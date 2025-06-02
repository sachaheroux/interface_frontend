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
        { predecessors: [3], time: 4 },
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
  const [result, setResult] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const addTask = () => {
    const newId = Math.max(...tasks.map(t => t.id)) + 1;
    setTasks([...tasks, { 
      id: newId, 
      models: [
        { predecessors: null, time: 0 },
        { predecessors: null, time: 0 }
      ] 
    }]);
  };

  const removeTask = (id) => {
    if (tasks.length > 1) {
      setTasks(tasks.filter(t => t.id !== id));
    }
  };

  const updateTask = (id, modelIndex, field, value) => {
    setTasks(tasks.map(task => 
      task.id === id 
        ? {
            ...task, 
            models: task.models.map((model, idx) => 
              idx === modelIndex 
                ? { ...model, [field]: field === 'predecessors' && value ? value.split(',').map(x => parseInt(x.trim())).filter(x => !isNaN(x)) : (field === 'time' ? parseFloat(value) || 0 : value) }
                : model
            )
          }
        : task
    ));
  };

  const updateModel = (index, value) => {
    const newModels = [...models];
    newModels[index] = parseInt(value) || 0;
    setModels(newModels);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Transformer les données au format attendu par le backend
      const tasksData = tasks.map(task => {
        const formatted = [task.id];
        task.models.forEach(model => {
          formatted.push([
            model.predecessors === null ? null : (Array.isArray(model.predecessors) ? model.predecessors : [model.predecessors]),
            model.time
          ]);
        });
        return formatted;
      });

      const requestData = {
        models: models,
        tasks_data: tasksData,
        cycle_time: cycleTime
      };

      // Appel API pour les résultats
      const response = await fetch("http://localhost:8000/ligne_assemblage_mixte/equilibrage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();
      setResult(data);

      // Appel API pour le graphique
      const chartResponse = await fetch("http://localhost:8000/ligne_assemblage_mixte/equilibrage/chart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData)
      });

      if (chartResponse.ok) {
        const chartBlob = await chartResponse.blob();
        const chartUrl = URL.createObjectURL(chartBlob);
        setChartData(chartUrl);
      }

    } catch (error) {
      console.error("Erreur:", error);
      alert("Erreur lors du calcul: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>🏭 Équilibrage de Ligne d'Assemblage Mixte</h2>
      
      <form onSubmit={handleSubmit}>
        {/* Section des modèles */}
        <div className={styles.modelsSection}>
          <h3>Configuration des modèles</h3>
          <div className={styles.modelsGrid}>
            {models.map((demand, index) => (
              <div key={index} className={styles.modelInput}>
                <label>Modèle {index + 1} :</label>
                <input
                  type="number"
                  value={demand}
                  onChange={(e) => updateModel(index, e.target.value)}
                  min="0"
                  step="1"
                  placeholder="Demande"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Section du temps de cycle */}
        <div className={styles.inputGroup}>
          <label htmlFor="cycleTime">
            ⏱️ Temps de cycle (minutes)
          </label>
          <input
            id="cycleTime"
            type="number"
            value={cycleTime}
            onChange={(e) => setCycleTime(parseFloat(e.target.value) || 0)}
            min="0"
            step="0.1"
            placeholder="Temps de cycle"
          />
        </div>

        {/* Section des tâches */}
        <div className={styles.tasksSection}>
          <h3>Configuration des tâches</h3>
          <div className={styles.tasksGrid}>
            <div className={styles.taskHeader}>
              <div>Tâche</div>
              {models.map((_, idx) => (
                <div key={idx}>Modèle {idx + 1}</div>
              ))}
              <div>Action</div>
            </div>
            
            {tasks.map((task) => (
              <div key={task.id} className={styles.taskRow}>
                <input
                  type="number"
                  value={task.id}
                  readOnly
                  className={styles.taskIdInput}
                />
                
                {task.models.map((model, modelIndex) => (
                  <div key={modelIndex} className={styles.modelData}>
                    <div className={styles.modelField}>
                      <label>Prédécesseurs</label>
                      <input
                        type="text"
                        value={model.predecessors === null ? "" : (Array.isArray(model.predecessors) ? model.predecessors.join(", ") : model.predecessors)}
                        onChange={(e) => updateTask(task.id, modelIndex, 'predecessors', e.target.value || null)}
                        placeholder="Ex: 1, 2"
                      />
                    </div>
                    <div className={styles.modelField}>
                      <label>Temps (min)</label>
                      <input
                        type="number"
                        value={model.time}
                        onChange={(e) => updateTask(task.id, modelIndex, 'time', e.target.value)}
                        min="0"
                        step="0.1"
                        placeholder="Temps"
                      />
                    </div>
                  </div>
                ))}
                
                <button
                  type="button"
                  onClick={() => removeTask(task.id)}
                  disabled={tasks.length <= 1}
                  className={styles.removeBtn}
                  title="Supprimer la tâche"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          
          <button
            type="button"
            onClick={addTask}
            className={styles.addBtn}
          >
            ➕ Ajouter une tâche
          </button>
        </div>

        <button 
          type="submit" 
          disabled={isLoading}
          className={styles.submitBtn}
        >
          {isLoading ? "Optimisation en cours..." : "🚀 Calculer l'équilibrage optimal"}
        </button>
      </form>

      {/* Affichage des résultats */}
      {result && (
        <div className={styles.resultBlock}>
          <h3>📊 Résultats de l'optimisation</h3>
          
          <div className={styles.metricsGrid}>
            <div className={styles.metric}>
              <span className={styles.metricLabel}>Stations utilisées</span>
              <div className={styles.metricValue}>{result.stations_used}</div>
            </div>
            <div className={styles.metric}>
              <span className={styles.metricLabel}>Minimum théorique</span>
              <div className={styles.metricValue}>{result.theoretical_minimum.toFixed(2)}</div>
            </div>
            <div className={styles.metric}>
              <span className={styles.metricLabel}>Efficacité</span>
              <div className={`${styles.metricValue} ${result.efficiency >= 90 ? styles.optimal : styles.suboptimal}`}>
                {result.efficiency.toFixed(1)}%
              </div>
            </div>
            <div className={styles.metric}>
              <span className={styles.metricLabel}>Statut</span>
              <div className={`${styles.metricValue} ${result.status === "Optimal" ? styles.optimal : styles.suboptimal}`}>
                {result.status}
              </div>
            </div>
            <div className={styles.metric}>
              <span className={styles.metricLabel}>Utilisation moyenne</span>
              <div className={styles.metricValue}>{result.average_utilization.toFixed(1)}%</div>
            </div>
            <div className={styles.metric}>
              <span className={styles.metricLabel}>Variance utilisation</span>
              <div className={styles.metricValue}>{result.utilization_variance.toFixed(2)}</div>
            </div>
          </div>

          {/* Affichage de l'assignation des tâches */}
          <div className={styles.stationsSection}>
            <h4>Assignation des tâches aux stations</h4>
            {Object.entries(result.station_assignments).map(([station, data]) => (
              <div key={station} className={styles.stationBlock}>
                <strong>Station {station}</strong>
                <div>Tâches : {data.tasks.join(", ")}</div>
                <div>Charge : {data.load.toFixed(1)} min</div>
                <div>Utilisation : {data.utilization.toFixed(1)}%</div>
              </div>
            ))}
          </div>

          {/* Affichage du graphique */}
          {chartData && (
            <div className={styles.chartSection}>
              <h4>Graphique d'utilisation des stations</h4>
              <img 
                src={chartData} 
                alt="Graphique d'utilisation des stations" 
                className={styles.chart}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
} 