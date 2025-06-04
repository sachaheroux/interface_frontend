import React, { useState } from 'react';
import styles from './LigneAssemblageMixteEquilibrageForm.module.css';

const LigneAssemblageMixteEquilibrageForm = () => {
  const [tasks, setTasks] = useState([
    { 
      id: 1, 
      name: 'Tâche 1',
      models: [
        { predecessors: null, time: 3 },
        { predecessors: null, time: 3 }
      ] 
    },
    { 
      id: 2, 
      name: 'Tâche 2',
      models: [
        { predecessors: "1", time: 4 },
        { predecessors: "1", time: 4 }
      ] 
    },
    { 
      id: 3, 
      name: 'Tâche 3',
      models: [
        { predecessors: "2", time: 2 },
        { predecessors: "2", time: 3 }
      ] 
    }
  ]);

  const [models, setModels] = useState([4, 6]); // Demande par modèle
  const [cycleTime, setCycleTime] = useState(50);
  const [timeUnit, setTimeUnit] = useState('minutes');
  const [result, setResult] = useState(null);
  const [chartUrl, setChartUrl] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState('');

  const API_URL = "https://interface-backend-1jgi.onrender.com";

  // Gestion des tâches
  const addTask = () => {
    const newId = Math.max(...tasks.map(t => t.id)) + 1;
    setTasks([...tasks, { 
      id: newId, 
      name: `Tâche ${newId}`,
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

  // Gestion des modèles
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

  const updateTask = (taskIndex, field, value) => {
    const newTasks = [...tasks];
    if (field === 'name') {
      newTasks[taskIndex].name = value;
    }
    setTasks(newTasks);
  };

  const updateTaskModel = (taskIndex, modelIndex, field, value) => {
    const newTasks = [...tasks];
    if (field === 'predecessors') {
      newTasks[taskIndex].models[modelIndex][field] = value === '' ? null : value;
    } else if (field === 'time') {
      newTasks[taskIndex].models[modelIndex][field] = parseFloat(value) || 0;
    }
    setTasks(newTasks);
  };

  const updateModelDemand = (index, value) => {
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

  const calculateOptimization = async () => {
    setError('');
    setChartUrl(null);
    setIsCalculating(true);

    try {
      // Validation du temps de cycle
      if (cycleTime <= 0) {
        throw new Error("Le temps de cycle doit être un nombre positif.");
      }

      // Validation des demandes
      if (models.some(demand => demand <= 0)) {
        throw new Error("Les demandes par modèle doivent être positives.");
      }

      // Validation des temps
      for (const task of tasks) {
        for (const model of task.models) {
          if (model.time <= 0) {
            throw new Error(`Le temps de traitement doit être positif pour la tâche ${task.id}.`);
          }
        }
      }

      // Transformer les données au format attendu par le backend
      const tasksData = tasks.map(task => {
        return {
          id: task.id,
          models: task.models.map(model => {
            let predecessors = null;
            if (model.predecessors) {
              if (typeof model.predecessors === 'string') {
                const predecessorIds = model.predecessors.split(',').map(p => parseInt(p.trim())).filter(p => !isNaN(p));
                predecessors = predecessorIds.length === 1 ? predecessorIds[0] : predecessorIds;
              } else {
                predecessors = model.predecessors;
              }
            }
            return {
              predecessors: predecessors,
              time: model.time
            };
          })
        };
      });

      const requestData = {
        models: models,
        tasks_data: tasksData,
        cycle_time: cycleTime,
        unite: timeUnit
      };

      console.log("Données envoyées:", requestData);

      const response = await fetch(`${API_URL}/ligne_assemblage_mixte/equilibrage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Données reçues:", data);
      setResult(data);

      // Récupération du graphique
      try {
        const chartResponse = await fetch(`${API_URL}/ligne_assemblage_mixte/equilibrage/chart`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestData)
        });

        if (chartResponse.ok) {
          const blob = await chartResponse.blob();
          const url = URL.createObjectURL(blob);
          setChartUrl(url);
        }
      } catch (chartError) {
        console.log("Pas de graphique disponible");
      }

    } catch (err) {
      console.error('Erreur:', err);
      setError(`Erreur lors du calcul: ${err.message}`);
    } finally {
      setIsCalculating(false);
    }
  };

  const downloadChart = () => {
    if (chartUrl) {
      const link = document.createElement('a');
      link.href = chartUrl;
      link.download = 'equilibrage_ligne_mixte.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <>
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>Ligne d'assemblage mixte - Équilibrage</h1>
        <p className={styles.subtitle}>
          Équilibrage optimal multi-modèles avec contraintes de précédence spécifiques par modèle
        </p>
      </div>

      {/* Configuration générale */}
      <div className={`${styles.section} ${styles.configSection}`}>
        <div className={styles.configRow}>
          <div className={styles.inputGroup}>
            <label htmlFor="timeUnit">Unité de temps</label>
            <select
              id="timeUnit"
              value={timeUnit}
              onChange={(e) => setTimeUnit(e.target.value)}
              className={styles.select}
            >
              <option value="minutes">Minutes</option>
              <option value="heures">Heures</option>
              <option value="jours">Jours</option>
            </select>
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="cycleTime">Temps de cycle ({timeUnit})</label>
            <input
              id="cycleTime"
              type="number"
              value={cycleTime}
              onChange={(e) => setCycleTime(parseFloat(e.target.value) || 0)}
              className={styles.input}
              min="0"
              step="0.1"
              placeholder="50"
            />
          </div>
          
          <div className={styles.actionButtons}>
            <button
              onClick={addModel}
              className={styles.addButton}
              type="button"
            >
              + Ajouter un modèle
            </button>
            
            <button
              onClick={removeModel}
              disabled={models.length <= 2}
              className={styles.removeButton}
              type="button"
            >
              - Supprimer un modèle
            </button>

            <button
              onClick={addTask}
              className={styles.addButton}
              type="button"
            >
              + Ajouter une tâche
            </button>
            
            <button
              onClick={removeTask}
              disabled={tasks.length <= 1}
              className={styles.removeButton}
              type="button"
            >
              - Supprimer une tâche
            </button>
          </div>
        </div>
      </div>

      {/* Configuration des demandes par modèle */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Demande par modèle ({models.length} modèles)</h2>
        
        <div className={styles.demandContainer}>
          <div className={styles.demandHeader}>
            {models.map((_, index) => (
              <div key={index} className={styles.demandHeaderCell}>
                <div className={styles.modelBadge}>M{index + 1}</div>
                <div className={styles.demandLabel}>Demande</div>
              </div>
            ))}
          </div>
          
          <div className={styles.demandRow}>
            {models.map((demand, index) => (
              <div key={index} className={styles.demandCell}>
                <input
                  type="number"
                  value={demand}
                  onChange={(e) => updateModelDemand(index, e.target.value)}
                  className={styles.demandInput}
                  min="1"
                  placeholder="0"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Configuration des tâches avec modèles */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Configuration des tâches ({tasks.length} tâches)</h2>
        
        <div className={styles.tasksContainer}>
          {tasks.map((task, taskIndex) => (
            <div key={task.id} className={styles.taskBlock}>
              <div className={styles.taskHeader}>
                <div className={styles.taskNameContainer}>
                  <div className={styles.taskNumber}>T{task.id}</div>
                  <input
                    type="text"
                    value={task.name}
                    onChange={(e) => updateTask(taskIndex, 'name', e.target.value)}
                    className={styles.taskNameInput}
                    placeholder={`Tâche ${task.id}`}
                  />
                </div>
              </div>
              
              <div className={styles.modelsGrid}>
                {task.models.map((model, modelIndex) => (
                  <div key={modelIndex} className={styles.modelBlock}>
                    <div className={styles.modelHeader}>
                      <div className={styles.modelBadge}>Modèle {modelIndex + 1}</div>
                    </div>
                    
                    <div className={styles.modelFields}>
                      <div className={styles.fieldGroup}>
                        <label>Temps ({timeUnit})</label>
                        <input
                          type="number"
                          value={model.time}
                          onChange={(e) => updateTaskModel(taskIndex, modelIndex, 'time', e.target.value)}
                          className={styles.timeInput}
                          min="0"
                          step="0.1"
                          placeholder="0"
                        />
                      </div>
                      
                      <div className={styles.fieldGroup}>
                        <label>Prédécesseurs</label>
                        <input
                          type="text"
                          value={formatPredecessors(model.predecessors)}
                          onChange={(e) => updateTaskModel(taskIndex, modelIndex, 'predecessors', e.target.value)}
                          className={styles.predecessorsInput}
                          placeholder="Ex: 1,2"
                          title="IDs des tâches prédécesseurs séparés par des virgules"
                        />
                        <div className={styles.availableText}>
                          Disponibles: {getAvailablePredecessors(task.id) || "Aucun"}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Gestion d'erreur */}
      {error && (
        <div className={styles.errorSection}>
          <div className={styles.errorBox}>
            <span className={styles.errorIcon}>⚠️</span>
            <span className={styles.errorText}>{error}</span>
          </div>
        </div>
      )}

      {/* Bouton de calcul */}
      <button
        onClick={calculateOptimization}
        disabled={isCalculating}
        className={styles.calculateButton}
        type="button"
      >
        {isCalculating ? 'Calcul en cours...' : 'Lancer l\'équilibrage mixte'}
      </button>

      {/* Résultats */}
      {result && (
        <div className={`${styles.section} ${styles.resultsSection}`}>
          <h2 className={styles.resultsTitle}>Résultats de l'équilibrage mixte</h2>

          {/* Métriques */}
          <div className={styles.metricsGrid}>
            <div className={styles.metric}>
              <div className={styles.metricValue}>
                {result.status || 'Inconnu'}
              </div>
              <div className={styles.metricLabel}>
                Statut
              </div>
            </div>
            
            <div className={styles.metric}>
              <div className={styles.metricValue}>
                {result.stations_used || 0}
              </div>
              <div className={styles.metricLabel}>
                Stations utilisées
              </div>
            </div>
            
            <div className={styles.metric}>
              <div className={styles.metricValue}>
                {result.theoretical_minimum?.toFixed(2) || 0}
              </div>
              <div className={styles.metricLabel}>
                Minimum théorique
              </div>
            </div>

            <div className={styles.metric}>
              <div className={styles.metricValue}>
                {result.efficiency?.toFixed(1) || 0}%
              </div>
              <div className={styles.metricLabel}>
                Efficacité
              </div>
            </div>

            <div className={styles.metric}>
              <div className={styles.metricValue}>
                {result.average_utilization?.toFixed(1) || 0}%
              </div>
              <div className={styles.metricLabel}>
                Utilisation moyenne
              </div>
            </div>

            <div className={styles.metric}>
              <div className={styles.metricValue}>
                {result.utilization_variance?.toFixed(2) || 0}
              </div>
              <div className={styles.metricLabel}>
                Variance utilisation
              </div>
            </div>
          </div>

          {/* Configuration des stations */}
          <div className={styles.stationsDetails}>
            <h4>Configuration des stations</h4>
            <div className={styles.stationsList}>
              {result.station_assignments && Object.entries(result.station_assignments).map(([station, data]) => (
                <div key={station} className={styles.stationCard}>
                  <div className={styles.stationHeader}>
                    <strong>Station {station}</strong>
                    <span className={styles.stationUtilization}>
                      {data.utilization?.toFixed(1) || 0}% d'utilisation
                    </span>
                  </div>
                  <div className={styles.stationTasks}>
                    Tâches assignées : {Array.isArray(data.tasks) ? data.tasks.join(', ') : 'Aucune'}
                  </div>
                  <div className={styles.stationLoad}>
                    Charge : {data.load?.toFixed(1) || 0} {timeUnit}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Graphiques */}
      {chartUrl && (
        <div className={`${styles.section} ${styles.chartSection}`}>
          <div className={styles.chartHeader}>
            <h3>Graphique d'utilisation des stations</h3>
          </div>
          <div className={styles.chartContainer}>
            <img
              src={chartUrl}
              alt="Graphique d'utilisation des stations"
              className={styles.chart}
            />
            <button
              onClick={downloadChart}
              className={styles.downloadButton}
              type="button"
            >
              Télécharger le graphique
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default LigneAssemblageMixteEquilibrageForm; 