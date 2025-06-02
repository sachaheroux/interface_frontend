import { useState } from "react";
import styles from "./FlowshopSPTForm.module.css";

function LigneAssemblageMixteGoulotForm() {
  const [modelsDemand, setModelsDemand] = useState([4, 6]);
  const [taskTimes, setTaskTimes] = useState([
    [3, 3],  // Tâche 1: [temps modèle 1, temps modèle 2]
    [2, 3]   // Tâche 2: [temps modèle 1, temps modèle 2]
  ]);
  const [s1, setS1] = useState("0.5");
  const [s2, setS2] = useState("0.5");
  const [unite, setUnite] = useState("minutes");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [chartUrl, setChartUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const API_URL = "https://interface-backend-1jgi.onrender.com";

  const addModel = () => {
    const newModelsDemand = [...modelsDemand, 4];
    setModelsDemand(newModelsDemand);
    
    // Ajouter une colonne aux temps de tâches
    const newTaskTimes = taskTimes.map(task => [...task, 3]);
    setTaskTimes(newTaskTimes);
  };

  const removeModel = () => {
    if (modelsDemand.length > 2) {
      const newModelsDemand = modelsDemand.slice(0, -1);
      setModelsDemand(newModelsDemand);
      
      // Supprimer la dernière colonne des temps de tâches
      const newTaskTimes = taskTimes.map(task => task.slice(0, -1));
      setTaskTimes(newTaskTimes);
    }
  };

  const addTask = () => {
    const newTask = new Array(modelsDemand.length).fill(3);
    setTaskTimes([...taskTimes, newTask]);
  };

  const removeTask = () => {
    if (taskTimes.length > 1) {
      setTaskTimes(taskTimes.slice(0, -1));
    }
  };

  const handleModelDemandChange = (index, value) => {
    const newModelsDemand = [...modelsDemand];
    newModelsDemand[index] = parseInt(value) || 0;
    setModelsDemand(newModelsDemand);
  };

  const handleTaskTimeChange = (taskIndex, modelIndex, value) => {
    const newTaskTimes = [...taskTimes];
    newTaskTimes[taskIndex][modelIndex] = parseFloat(value.replace(",", ".")) || 0;
    setTaskTimes(newTaskTimes);
  };

  const handleSubmit = () => {
    setError(null);
    setChartUrl(null);
    setIsLoading(true);

    try {
      // Validation
      const s1Value = parseFloat(s1.replace(",", "."));
      const s2Value = parseFloat(s2.replace(",", "."));
      
      if (isNaN(s1Value) || s1Value < 0) {
        setError("Le paramètre s1 doit être un nombre positif.");
        setIsLoading(false);
        return;
      }
      
      if (isNaN(s2Value) || s2Value < 0) {
        setError("Le paramètre s2 doit être un nombre positif.");
        setIsLoading(false);
        return;
      }

      const payload = {
        models_demand: modelsDemand,
        task_times: taskTimes,
        s1: s1Value,
        s2: s2Value,
        unite
      };

      fetch(`${API_URL}/ligne_assemblage_mixte/goulot`, {
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
          return fetch(`${API_URL}/ligne_assemblage_mixte/goulot/chart`, {
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
    link.download = "variation_goulot_mixte.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Ligne d'assemblage mixte - Variation du goulot</h2>

      <div className={styles.unitSelector}>
        <label>Unité de temps :</label>
        <select value={unite} onChange={(e) => setUnite(e.target.value)} className={styles.select}>
          <option value="minutes">minutes</option>
          <option value="heures">heures</option>
          <option value="jours">jours</option>
        </select>
      </div>

      {/* Configuration des modèles */}
      <div className={styles.tasksContainer}>
        <h4 className={styles.subtitle}>Demande par modèle (par période/cycle)</h4>
        <div className={styles.buttonGroup}>
          <button className={styles.button} onClick={addModel}>+ Ajouter un modèle</button>
          <button className={styles.button} onClick={removeModel}>- Supprimer un modèle</button>
        </div>
        
        <div className={styles.modelDemandsContainer}>
          {modelsDemand.map((demand, index) => (
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

      {/* Configuration des temps de tâches */}
      <div className={styles.tasksContainer}>
        <h4 className={styles.subtitle}>Temps de traitement au poste goulot ({unite})</h4>
        <div className={styles.buttonGroup}>
          <button className={styles.button} onClick={addTask}>+ Ajouter une tâche</button>
          <button className={styles.button} onClick={removeTask}>- Supprimer une tâche</button>
        </div>

        <div className={styles.taskTimesGrid}>
          <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "1rem" }}>
            <thead>
              <tr>
                <th style={{ padding: "0.5rem", border: "1px solid #ccc", background: "#f5f5f5" }}>Tâche</th>
                {modelsDemand.map((_, index) => (
                  <th key={index} style={{ padding: "0.5rem", border: "1px solid #ccc", background: "#f5f5f5" }}>
                    Modèle {index + 1}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {taskTimes.map((task, taskIndex) => (
                <tr key={taskIndex}>
                  <td style={{ padding: "0.5rem", border: "1px solid #ccc", textAlign: "center", fontWeight: "bold" }}>
                    Tâche {taskIndex + 1}
                  </td>
                  {task.map((time, modelIndex) => (
                    <td key={modelIndex} style={{ padding: "0.5rem", border: "1px solid #ccc" }}>
                      <input
                        type="text"
                        inputMode="decimal"
                        value={time}
                        onChange={e => handleTaskTimeChange(taskIndex, modelIndex, e.target.value)}
                        className={styles.input}
                        style={{ width: "100%", margin: 0 }}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Paramètres de lissage */}
      <div className={styles.tasksContainer}>
        <h4 className={styles.subtitle}>Paramètres de lissage</h4>
        <div className={styles.taskRow}>
          <label>s1 (lissage modèles) :</label>
          <input
            type="text"
            inputMode="decimal"
            value={s1}
            onChange={e => setS1(e.target.value)}
            className={styles.input}
            placeholder="0.5"
          />
        </div>
        <div className={styles.taskRow}>
          <label>s2 (lissage capacité) :</label>
          <input
            type="text"
            inputMode="decimal"
            value={s2}
            onChange={e => setS2(e.target.value)}
            className={styles.input}
            placeholder="0.5"
          />
        </div>
      </div>

      <button 
        className={styles.submitButton} 
        onClick={handleSubmit}
        disabled={isLoading}
      >
        {isLoading ? "Optimisation en cours..." : "Optimiser la séquence mixte"}
      </button>

      {error && <p className={styles.error}>{error}</p>}

      {result && (
        <div className={styles.results}>
          <h3>Résultats de l'optimisation goulot</h3>
          
          <div className={styles.optimizationStatus}>
            <strong>Statut d'optimisation :</strong> 
            <span style={{ 
              color: result.optimization_status === 'Optimal' ? '#10b981' : '#f59e0b',
              fontWeight: 'bold',
              marginLeft: '0.5rem'
            }}>
              {result.optimization_status}
            </span>
          </div>

          <div className={styles.sequenceContainer}>
            <h4>Séquence optimale de production :</h4>
            <div style={{ 
              background: "#f8f9fa", 
              padding: "1rem", 
              borderRadius: "0.5rem", 
              fontFamily: "monospace",
              fontSize: "1.1rem",
              fontWeight: "bold"
            }}>
              {result.sequence.map((model, index) => (
                <span key={index} style={{ 
                  color: model === 1 ? '#3b82f6' : model === 2 ? '#ef4444' : '#10b981',
                  marginRight: '0.5rem'
                }}>
                  M{model}
                </span>
              ))}
            </div>
          </div>
          
          <div className={styles.metricsGrid}>
            <div><strong>Nombre total d'unités :</strong> {result.metrics.nombre_total_unites}</div>
            <div><strong>Variation maximale :</strong> {result.metrics.variation_maximale} {result.unite}</div>
            <div><strong>Temps cycle goulot :</strong> {result.metrics.temps_cycle_goulot} {result.unite}</div>
            <div><strong>Déviation moyenne :</strong> {result.metrics.deviation_moyenne} {result.unite}</div>
            <div><strong>Efficacité lissage :</strong> {result.metrics.efficacite_lissage}%</div>
            <div><strong>Paramètres :</strong> s1={result.parameters.s1}, s2={result.parameters.s2}</div>
          </div>

          {chartUrl && (
            <div className={styles.ganttContainer}>
              <h4>Analyse de la variation du goulot</h4>
              <img
                src={chartUrl}
                alt="Graphiques Variation Goulot"
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

export default LigneAssemblageMixteGoulotForm; 