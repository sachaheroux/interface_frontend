import React, { useState } from 'react';
import styles from './LigneAssemblageCOMSOALForm.module.css';

const LigneAssemblageCOMSOALForm = () => {
  const [tasks, setTasks] = useState([
    { id: 1, name: 'Tâche 1', predecessors: '', duration: 20 },
    { id: 2, name: 'Tâche 2', predecessors: '1', duration: 6 },
    { id: 3, name: 'Tâche 3', predecessors: '2', duration: 5 },
    { id: 4, name: 'Tâche 4', predecessors: '', duration: 21 },
    { id: 5, name: 'Tâche 5', predecessors: '', duration: 8 },
    { id: 6, name: 'Tâche 6', predecessors: '', duration: 35 },
    { id: 7, name: 'Tâche 7', predecessors: '3,4', duration: 15 },
    { id: 8, name: 'Tâche 8', predecessors: '7', duration: 10 },
    { id: 9, name: 'Tâche 9', predecessors: '5,8', duration: 15 },
    { id: 10, name: 'Tâche 10', predecessors: '3', duration: 5 },
    { id: 11, name: 'Tâche 11', predecessors: '6,10', duration: 46 },
    { id: 12, name: 'Tâche 12', predecessors: '10,11', duration: 16 }
  ]);
  const [cycleTime, setCycleTime] = useState(70);
  const [seed, setSeed] = useState('');
  const [timeUnit, setTimeUnit] = useState('minutes');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [isCalculating, setIsCalculating] = useState(false);
  const [chartUrl, setChartUrl] = useState(null);

  const API_URL = "https://interface-backend-1jgi.onrender.com";

  // Gestion des tâches
  const addTask = () => {
    const newId = Math.max(...tasks.map(t => t.id)) + 1;
    setTasks([...tasks, {
      id: newId,
      name: `Tâche ${newId}`,
      predecessors: '',
      duration: 10
    }]);
  };

  const removeTask = () => {
    if (tasks.length > 1) {
      const taskToRemove = tasks[tasks.length - 1];
      // Supprimer les références dans les prédécesseurs
      const updatedTasks = tasks.slice(0, -1).map(task => {
        if (!task.predecessors) return task;
        
        const predecessorIds = task.predecessors.split(',').map(p => p.trim()).filter(p => p !== '');
        const filteredIds = predecessorIds.filter(p => parseInt(p) !== taskToRemove.id);
        
        return {
          ...task,
          predecessors: filteredIds.join(',')
        };
      });
      setTasks(updatedTasks);
    }
  };

  const updateTask = (taskIndex, field, value) => {
    const newTasks = [...tasks];
    if (field === 'duration') {
      newTasks[taskIndex].duration = parseFloat(value) || 0;
    } else if (field === 'predecessors') {
      newTasks[taskIndex].predecessors = value;
    } else if (field === 'name') {
      newTasks[taskIndex].name = value;
    }
    setTasks(newTasks);
  };

  const getAvailablePredecessors = (currentTaskId) => {
    return tasks
      .filter(t => t.id < currentTaskId)
      .map(t => t.id)
      .join(', ');
  };

  const validatePredecessors = (predecessors, taskId) => {
    if (!predecessors || predecessors.trim() === '') return true;
    
    const predecessorIds = predecessors.split(',').map(p => p.trim()).filter(p => p !== '');
    return predecessorIds.every(id => {
      const numId = parseInt(id);
      return !isNaN(numId) && numId < taskId && tasks.some(t => t.id === numId);
    });
  };

  const calculateOptimization = async () => {
    setIsCalculating(true);
    setError('');
    setResult(null);
    setChartUrl(null);

    try {
      // Validation
      if (cycleTime <= 0) {
        throw new Error("Le temps de cycle doit être un nombre positif.");
      }

      // Validation de la graine
      if (seed !== '' && (isNaN(parseInt(seed)) || parseInt(seed) < 0)) {
        throw new Error("La graine aléatoire doit être un nombre entier positif ou vide.");
      }

      // Validation des prédécesseurs
      for (const task of tasks) {
        if (!validatePredecessors(task.predecessors, task.id)) {
          throw new Error(`Prédécesseurs invalides pour la tâche ${task.id}. Utilisez uniquement des IDs de tâches antérieures séparés par des virgules.`);
        }
      }

      // Format des données pour l'API
      const tasksData = tasks.map(task => {
        let predecessors = null;
        if (task.predecessors && task.predecessors.trim() !== '') {
          const predecessorIds = task.predecessors.split(',')
            .map(p => parseInt(p.trim()))
            .filter(p => !isNaN(p));
          
          if (predecessorIds.length === 1) {
            predecessors = predecessorIds[0];
          } else if (predecessorIds.length > 1) {
            predecessors = predecessorIds;
          }
        }

        return {
          id: task.id,
          name: task.name,
          predecessors: predecessors,
          duration: task.duration
        };
      });

      const requestData = {
        tasks_data: tasksData,
        cycle_time: cycleTime,
        unite: timeUnit,
        seed: seed === '' ? null : parseInt(seed)
      };

      console.log("Données envoyées:", requestData);

      const response = await fetch(`${API_URL}/ligne_assemblage/comsoal`, {
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
        const chartResponse = await fetch(`${API_URL}/ligne_assemblage/comsoal/chart`, {
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
      link.download = 'equilibrage_comsoal.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Fonction helper pour récupérer le nom d'une tâche par son ID
  const getTaskNameById = (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    return task ? task.name : `Tâche ${taskId}`;
  };

  return (
    <>
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>Ligne d'assemblage - COMSOAL</h1>
        <p className={styles.subtitle}>
          Équilibrage par algorithme métaheuristique COMSOAL (Computer Method of Sequencing Operations for Assembly Lines)
        </p>
      </div>

      {/* Configuration */}
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
              placeholder="70"
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="seed">Graine aléatoire (optionnel)</label>
            <input
              id="seed"
              type="number"
              value={seed}
              onChange={(e) => setSeed(e.target.value)}
              className={styles.input}
              min="0"
              step="1"
              placeholder="Aléatoire"
              title="Même graine = mêmes résultats"
            />
          </div>
          
          <div className={styles.actionButtons}>
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

      {/* Configuration des tâches - Vue compacte tabulaire */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Configuration des tâches ({tasks.length} tâches)</h2>
        
        <div className={styles.compactTasksContainer}>
          <div className={styles.tasksHeader}>
            <div className={styles.taskHeaderCell}>Tâche</div>
            <div className={styles.taskHeaderCell}>Durée<br/>({timeUnit})</div>
            <div className={styles.taskHeaderCell}>Prédécesseurs</div>
            <div className={styles.taskHeaderCell}>Disponibles</div>
          </div>
          
          {tasks.map((task, taskIndex) => (
            <div key={task.id} className={styles.compactTaskRow}>
              <div className={styles.taskCell}>
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
              
              <div className={styles.taskCell}>
                <input
                  type="number"
                  value={task.duration}
                  onChange={(e) => updateTask(taskIndex, 'duration', e.target.value)}
                  className={styles.durationInput}
                  min="0"
                  step="0.1"
                  placeholder="0"
                />
              </div>
              
              <div className={styles.taskCell}>
                <input
                  type="text"
                  value={task.predecessors}
                  onChange={(e) => updateTask(taskIndex, 'predecessors', e.target.value)}
                  className={styles.predecessorsInput}
                  placeholder="Ex: 1,2"
                  title="IDs des tâches prédécesseurs séparés par des virgules"
                />
              </div>
              
              <div className={styles.taskCell}>
                <div className={styles.availablePredecessors}>
                  {getAvailablePredecessors(task.id) || "Aucun"}
                </div>
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
        {isCalculating ? 'Calcul en cours...' : 'Calculer l\'équilibrage COMSOAL'}
      </button>

      {/* Résultats */}
      {result && (
        <div className={`${styles.section} ${styles.resultsSection}`}>
          <h2 className={styles.resultsTitle}>Résultats de l'équilibrage COMSOAL</h2>

          {/* Métriques */}
          <div className={styles.metricsGrid}>
            <div className={styles.metric}>
              <div className={styles.metricValue}>
                {result.metrics?.nombre_stations || result.nombre_stations || 0}
              </div>
              <div className={styles.metricLabel}>
                Nombre de stations
              </div>
            </div>
            
            <div className={styles.metric}>
              <div className={styles.metricValue}>
                {result.metrics?.stations_theoriques_min || result.stations_theoriques_min || 0}
              </div>
              <div className={styles.metricLabel}>
                Stations théoriques min
              </div>
            </div>
            
            <div className={styles.metric}>
              <div className={styles.metricValue}>
                {result.metrics?.efficacite || result.efficacite || 0}%
              </div>
              <div className={styles.metricLabel}>
                Efficacité
              </div>
            </div>

            <div className={styles.metric}>
              <div className={styles.metricValue}>
                {cycleTime} {timeUnit}
              </div>
              <div className={styles.metricLabel}>
                Temps de cycle
              </div>
            </div>
          </div>

          {/* Configuration des stations */}
          <div className={styles.stationsDetails}>
            <h4>Configuration des stations par COMSOAL</h4>
            <div className={styles.stationsList}>
              {result.stations && result.stations.length > 0 ? (
                result.stations.map(station => (
                  <div key={station.id} className={styles.stationCard}>
                    <div className={styles.stationHeader}>
                      <strong>Station {station.id}</strong>
                      <span className={styles.stationUtilization}>
                        {station.utilization?.toFixed(1) || 0}% d'utilisation
                      </span>
                    </div>
                    <div className={styles.stationTasks}>
                      Tâches assignées : {Array.isArray(station.tasks) ? station.tasks.map(getTaskNameById).join(', ') : 'Aucune'}
                    </div>
                  </div>
                ))
              ) : (
                <div className={styles.noStations}>Aucune station configurée</div>
              )}
            </div>
          </div>

          {/* Informations sur la graine */}
          {seed && (
            <div className={styles.seedInfo}>
              <h4>Paramètres de calcul</h4>
              <p>Graine aléatoire utilisée : <strong>{seed}</strong></p>
              <p className={styles.seedNote}>
                💡 Utilisez la même graine pour reproduire exactement ces résultats
              </p>
            </div>
          )}
        </div>
      )}

      {/* Graphiques */}
      {chartUrl && (
        <div className={`${styles.section} ${styles.chartSection}`}>
          <div className={styles.chartHeader}>
            <h3>Graphiques d'analyse COMSOAL</h3>
          </div>
          <div className={styles.chartContainer}>
            <img
              src={chartUrl}
              alt="Graphiques COMSOAL"
              className={styles.chart}
            />
            <button
              onClick={downloadChart}
              className={styles.downloadButton}
              type="button"
            >
              Télécharger les graphiques
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default LigneAssemblageCOMSOALForm; 