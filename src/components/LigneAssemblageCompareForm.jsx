import React, { useState } from 'react';
import styles from './LigneAssemblagePLForm.module.css';
import ExcelImportSectionLigneAssemblage from './ExcelImportSectionLigneAssemblage';
import ExcelExportSectionLigneAssemblage from './ExcelExportSectionLigneAssemblage';

const LigneAssemblageCompareForm = () => {
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
  const [timeUnit, setTimeUnit] = useState('minutes');
  const [results, setResults] = useState({});
  const [error, setError] = useState('');
  const [isCalculating, setIsCalculating] = useState(false);
  const [chartUrls, setChartUrls] = useState({});
  const [isImporting, setIsImporting] = useState(false);
  const [importSuccess, setImportSuccess] = useState(null);
  const [importError, setImportError] = useState(null);

  const API_URL = "https://interface-backend-1jgi.onrender.com";

  // Algorithmes à comparer (sauf précédences)
  const algorithms = [
    { key: 'pl', name: 'Programmation Linéaire (PL)', endpoint: '/ligne_assemblage/pl' },
    { key: 'lpt', name: 'Longest Processing Time (LPT)', endpoint: '/ligne_assemblage/lpt' },
    { key: 'comsoal', name: 'COMSOAL', endpoint: '/ligne_assemblage/comsoal' }
  ];

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

  const formatTasksData = () => {
    return tasks.map(task => {
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
  };

  const calculateComparison = async () => {
    setIsCalculating(true);
    setError('');
    setResults({});
    setChartUrls({});

    try {
      // Validation
      if (cycleTime <= 0) {
        throw new Error("Le temps de cycle doit être un nombre positif.");
      }

      // Validation des prédécesseurs
      for (const task of tasks) {
        if (!validatePredecessors(task.predecessors, task.id)) {
          throw new Error(`Prédécesseurs invalides pour la tâche ${task.id}. Utilisez uniquement des IDs de tâches antérieures séparés par des virgules.`);
        }
      }

      const tasksData = formatTasksData();
      const requestData = {
        tasks_data: tasksData,
        cycle_time: cycleTime,
        unite: timeUnit
      };

      console.log("Données envoyées:", requestData);

      // Lancer tous les algorithmes en parallèle
      const algorithmPromises = algorithms.map(async (algorithm) => {
        try {
          const response = await fetch(`${API_URL}${algorithm.endpoint}`, {
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
          
          // Récupération du graphique
          let chartUrl = null;
          try {
            const chartResponse = await fetch(`${API_URL}${algorithm.endpoint}/chart`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(requestData)
            });

            if (chartResponse.ok) {
              const blob = await chartResponse.blob();
              chartUrl = URL.createObjectURL(blob);
            }
          } catch (chartError) {
            console.log(`Pas de graphique disponible pour ${algorithm.name}`);
          }

          return {
            algorithm: algorithm.key,
            name: algorithm.name,
            data,
            chartUrl
          };
        } catch (err) {
          console.error(`Erreur pour ${algorithm.name}:`, err);
          return {
            algorithm: algorithm.key,
            name: algorithm.name,
            error: err.message,
            data: null,
            chartUrl: null
          };
        }
      });

      const algorithmResults = await Promise.all(algorithmPromises);
      
      // Organiser les résultats
      const newResults = {};
      const newChartUrls = {};
      
      algorithmResults.forEach(result => {
        newResults[result.algorithm] = {
          name: result.name,
          data: result.data,
          error: result.error
        };
        if (result.chartUrl) {
          newChartUrls[result.algorithm] = result.chartUrl;
        }
      });

      setResults(newResults);
      setChartUrls(newChartUrls);

    } catch (err) {
      console.error('Erreur:', err);
      setError(`Erreur lors du calcul: ${err.message}`);
    } finally {
      setIsCalculating(false);
    }
  };

  const downloadChart = (algorithm) => {
    if (chartUrls[algorithm]) {
      const link = document.createElement('a');
      link.href = chartUrls[algorithm];
      link.download = `equilibrage_${algorithm}.png`;
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

  // Fonction d'import Excel
  const handleImportExcel = async (formData, fileName) => {
    setIsImporting(true);
    setImportSuccess(null);
    setImportError(null);

    try {
      // Ajouter le format type pour indiquer au backend le format ligne d'assemblage
      formData.append('format_type', 'ligne_assemblage');
      
      // Utiliser l'endpoint PL pour l'import (format identique)
      const response = await fetch(`${API_URL}/ligne_assemblage/pl/import-excel`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Erreur lors de l\'import');
      }

      const data = await response.json();
      console.log("Données importées:", data);

      // Mettre à jour les données du formulaire
      if (data.tasks_data && Array.isArray(data.tasks_data)) {
        const importedTasks = data.tasks_data.map((task, index) => ({
          id: task.id || (index + 1),
          name: task.name || `Tâche ${task.id || (index + 1)}`,
          predecessors: task.predecessors ? 
            (Array.isArray(task.predecessors) ? task.predecessors.join(',') : task.predecessors.toString()) : '',
          duration: parseFloat(task.duration) || 0
        }));
        setTasks(importedTasks);
      }

      if (data.cycle_time) {
        setCycleTime(parseFloat(data.cycle_time));
      }

      if (data.unite) {
        setTimeUnit(data.unite);
      }

      setImportSuccess(`✅ Import réussi ! ${data.tasks_data?.length || 0} tâches importées depuis ${fileName}`);
      
      // Effacer les messages après 3 secondes
      setTimeout(() => setImportSuccess(null), 3000);

    } catch (error) {
      console.error('Erreur import Excel:', error);
      setImportError(`❌ Erreur import: ${error.message}`);
      
      // Effacer les messages après 5 secondes
      setTimeout(() => setImportError(null), 5000);
    } finally {
      setIsImporting(false);
    }
  };

  // Fonction pour déterminer le meilleur algorithme
  const getBestAlgorithm = () => {
    const validResults = Object.entries(results).filter(([key, result]) => 
      result.data && !result.error && result.data.metrics
    );

    if (validResults.length === 0) return null;

    // Critères de comparaison (par ordre de priorité) :
    // 1. Nombre de stations (plus petit = mieux)
    // 2. Efficacité (plus grand = mieux)
    
    let bestAlgorithm = null;
    let bestScore = null;

    validResults.forEach(([key, result]) => {
      const metrics = result.data.metrics;
      const stations = metrics.nombre_stations || Infinity;
      const efficacite = metrics.efficacite || 0;

      // Score composite : priorité au nombre de stations, puis efficacité
      const score = {
        stations,
        efficacite,
        key
      };

      if (!bestScore || 
          stations < bestScore.stations || 
          (stations === bestScore.stations && efficacite > bestScore.efficacite)) {
        bestScore = score;
        bestAlgorithm = key;
      }
    });

    return bestAlgorithm;
  };

  const bestAlgorithm = getBestAlgorithm();

  return (
    <>
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>Ligne d'assemblage - Comparaison d'algorithmes</h1>
        <p className={styles.subtitle}>
          Comparaison automatique des algorithmes d'équilibrage : PL, LPT et COMSOAL
        </p>
      </div>

      {/* Export Excel - Placé tout en haut */}
      <ExcelExportSectionLigneAssemblage
        tasks={tasks}
        cycleTime={cycleTime}
        timeUnit={timeUnit}
        algorithmName="Comparaison"
        API_URL={API_URL}
        algorithmEndpoint="ligne_assemblage/pl"
      />

      {/* Import Excel - Placé juste après l'export */}
      <ExcelImportSectionLigneAssemblage
        onImport={handleImportExcel}
        isImporting={isImporting}
        importSuccess={importSuccess}
        error={importError}
        algorithmName="Comparaison"
        API_URL={API_URL}
      />

      {/* Informations sur les algorithmes */}
      <div className={`${styles.section} ${styles.algorithmsInfo}`}>
        <h2 className={styles.sectionTitle}>Algorithmes comparés</h2>
        <div className={styles.algorithmsList}>
          {algorithms.map(algorithm => (
            <div key={algorithm.key} className={styles.algorithmBadge}>
              {algorithm.name}
            </div>
          ))}
        </div>
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
        onClick={calculateComparison}
        disabled={isCalculating}
        className={styles.calculateButton}
        type="button"
      >
        {isCalculating ? 'Comparaison en cours...' : 'Comparer les algorithmes'}
      </button>

      {/* Tableau de comparaison */}
      {Object.keys(results).length > 0 && (
        <div className={`${styles.section} ${styles.comparisonTableSection}`}>
          <h2 className={styles.resultsTitle}>Tableau de comparaison</h2>
          
          <div className={styles.table}>
            <div className={styles.tableHeader}>
              <div className={styles.tableHeaderCell}>Algorithme</div>
              <div className={styles.tableHeaderCell}>Stations</div>
              <div className={styles.tableHeaderCell}>Efficacité</div>
              <div className={styles.tableHeaderCell}>Statut</div>
            </div>
            
            {Object.entries(results).map(([key, result]) => (
              <div 
                key={key} 
                className={`${styles.tableRow} ${result.error ? styles.errorRow : styles.successRow} ${key === bestAlgorithm ? styles.bestRow : ''}`}
              >
                <div className={styles.tableCell}>
                  <strong>{result.name}</strong>
                  {key === bestAlgorithm && <span className={styles.bestBadge}>🏆 MEILLEUR</span>}
                </div>
                <div className={styles.tableCell}>
                  {result.error ? 'Erreur' : (result.data?.metrics?.nombre_stations || 'N/A')}
                </div>
                <div className={styles.tableCell}>
                  {result.error ? 'Erreur' : `${result.data?.metrics?.efficacite || 0}%`}
                </div>
                <div className={styles.tableCell}>
                  {result.error ? (
                    <span className={styles.statusError}>❌ Erreur</span>
                  ) : (
                    <span className={styles.statusSuccess}>✅ Succès</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Meilleur algorithme */}
      {bestAlgorithm && results[bestAlgorithm] && (
        <div className={`${styles.section} ${styles.bestAlgorithmsSection}`}>
          <h2 className={styles.resultsTitle}>🏆 Meilleur algorithme : {results[bestAlgorithm].name}</h2>
          
          <div className={styles.metricsGrid}>
            <div className={styles.metric}>
              <div className={styles.metricValue}>
                {results[bestAlgorithm].data?.metrics?.nombre_stations || 0}
              </div>
              <div className={styles.metricLabel}>
                Nombre de stations
              </div>
            </div>
            
            <div className={styles.metric}>
              <div className={styles.metricValue}>
                {results[bestAlgorithm].data?.metrics?.stations_theoriques_min || 0}
              </div>
              <div className={styles.metricLabel}>
                Stations théoriques min
              </div>
            </div>
            
            <div className={styles.metric}>
              <div className={styles.metricValue}>
                {results[bestAlgorithm].data?.metrics?.efficacite || 0}%
              </div>
              <div className={styles.metricLabel}>
                Efficacité
              </div>
            </div>
          </div>

          {/* Configuration des stations du meilleur algorithme */}
          <div className={styles.stationsDetails}>
            <h4>Configuration optimale des stations</h4>
            <div className={styles.stationsList}>
              {results[bestAlgorithm].data?.stations && results[bestAlgorithm].data.stations.length > 0 ? (
                results[bestAlgorithm].data.stations.map(station => (
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
        </div>
      )}

      {/* Graphiques pour chaque algorithme */}
      {Object.keys(chartUrls).length > 0 && (
        <div className={`${styles.section} ${styles.chartSection}`}>
          <div className={styles.chartHeader}>
            <h3>Graphiques d'analyse par algorithme</h3>
          </div>
          
          {Object.entries(chartUrls).map(([algorithm, chartUrl]) => (
            <div key={algorithm} className={styles.algorithmChart}>
              <h4>{results[algorithm]?.name}</h4>
              <div className={styles.chartContainer}>
                <img
                  src={chartUrl}
                  alt={`Graphique ${results[algorithm]?.name}`}
                  className={styles.chart}
                />
                <button
                  onClick={() => downloadChart(algorithm)}
                  className={styles.downloadButton}
                  type="button"
                >
                  Télécharger le graphique {results[algorithm]?.name}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default LigneAssemblageCompareForm; 