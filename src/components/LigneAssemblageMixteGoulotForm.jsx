import React, { useState } from 'react';
import styles from './LigneAssemblageMixteGoulotForm.module.css';

const LigneAssemblageMixteGoulotForm = () => {
  const [modelsDemand, setModelsDemand] = useState([4, 6]);
  const [taskTimes, setTaskTimes] = useState([
    [3, 3],  // Tâche 1: [temps modèle 1, temps modèle 2]
    [2, 3]   // Tâche 2: [temps modèle 1, temps modèle 2]
  ]);
  const [s1, setS1] = useState(0.5);
  const [s2, setS2] = useState(0.5);
  const [timeUnit, setTimeUnit] = useState('minutes');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [isCalculating, setIsCalculating] = useState(false);
  const [chartUrl, setChartUrl] = useState(null);

  const API_URL = "https://interface-backend-1jgi.onrender.com";

  // Gestion des modèles
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

  const updateModelDemand = (index, value) => {
    const newModelsDemand = [...modelsDemand];
    newModelsDemand[index] = parseInt(value) || 0;
    setModelsDemand(newModelsDemand);
  };

  // Gestion des tâches
  const addTask = () => {
    const newTask = new Array(modelsDemand.length).fill(3);
    setTaskTimes([...taskTimes, newTask]);
  };

  const removeTask = () => {
    if (taskTimes.length > 1) {
      setTaskTimes(taskTimes.slice(0, -1));
    }
  };

  const updateTaskTime = (taskIndex, modelIndex, value) => {
    const newTaskTimes = [...taskTimes];
    newTaskTimes[taskIndex][modelIndex] = parseFloat(value) || 0;
    setTaskTimes(newTaskTimes);
  };

  const calculateOptimization = async () => {
    setIsCalculating(true);
    setError('');
    setResult(null);
    setChartUrl(null);

    try {
      // Validation
      if (s1 < 0 || s1 > 1) {
        throw new Error("Le paramètre s1 doit être entre 0 et 1.");
      }
      
      if (s2 < 0 || s2 > 1) {
        throw new Error("Le paramètre s2 doit être entre 0 et 1.");
      }

      // Validation des demandes
      if (modelsDemand.some(demand => demand <= 0)) {
        throw new Error("Les demandes par modèle doivent être positives.");
      }

      // Validation des temps
      if (taskTimes.some(task => task.some(time => time <= 0))) {
        throw new Error("Les temps de traitement doivent être positifs.");
      }

      const requestData = {
        models_demand: modelsDemand,
        task_times: taskTimes,
        s1: s1,
        s2: s2,
        unite: timeUnit
      };

      console.log("Données envoyées:", requestData);

      const response = await fetch(`${API_URL}/ligne_assemblage_mixte/goulot`, {
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
        const chartResponse = await fetch(`${API_URL}/ligne_assemblage_mixte/goulot/chart`, {
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
      link.download = 'variation_goulot_mixte.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <>
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>Ligne d'assemblage mixte - Variation du goulot</h1>
        <p className={styles.subtitle}>
          Optimisation de la séquence de production multi-modèles pour minimiser la variation du goulot
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
            <label htmlFor="s1">Paramètre s1 (lissage modèles)</label>
            <input
              id="s1"
              type="number"
              value={s1}
              onChange={(e) => setS1(parseFloat(e.target.value) || 0)}
              className={styles.input}
              min="0"
              max="1"
              step="0.1"
              placeholder="0.5"
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="s2">Paramètre s2 (lissage capacité)</label>
            <input
              id="s2"
              type="number"
              value={s2}
              onChange={(e) => setS2(parseFloat(e.target.value) || 0)}
              className={styles.input}
              min="0"
              max="1"
              step="0.1"
              placeholder="0.5"
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
              disabled={modelsDemand.length <= 2}
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
              disabled={taskTimes.length <= 1}
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
        <h2 className={styles.sectionTitle}>Demande par modèle ({modelsDemand.length} modèles)</h2>
        
        <div className={styles.demandContainer}>
          <div className={styles.demandHeader}>
            {modelsDemand.map((_, index) => (
              <div key={index} className={styles.demandHeaderCell}>
                <div className={styles.modelBadge}>M{index + 1}</div>
                <div className={styles.demandLabel}>Demande</div>
              </div>
            ))}
          </div>
          
          <div className={styles.demandRow}>
            {modelsDemand.map((demand, index) => (
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

      {/* Matrice des temps de traitement */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>
          Temps de traitement au poste goulot ({taskTimes.length} tâches)
        </h2>
        
        <div className={styles.matrixContainer}>
          <div className={styles.matrixHeader}>
            <div className={styles.matrixCorner}>Tâche</div>
            {modelsDemand.map((_, index) => (
              <div key={index} className={styles.matrixHeaderCell}>
                <div className={styles.modelBadge}>M{index + 1}</div>
                <div className={styles.timeLabel}>Temps ({timeUnit})</div>
              </div>
            ))}
          </div>
          
          {taskTimes.map((task, taskIndex) => (
            <div key={taskIndex} className={styles.matrixRow}>
              <div className={styles.taskLabelCell}>
                <div className={styles.taskNumber}>T{taskIndex + 1}</div>
              </div>
              {task.map((time, modelIndex) => (
                <div key={modelIndex} className={styles.matrixCell}>
                  <input
                    type="number"
                    value={time}
                    onChange={(e) => updateTaskTime(taskIndex, modelIndex, e.target.value)}
                    className={styles.timeInput}
                    min="0"
                    step="0.1"
                    placeholder="0"
                  />
                </div>
              ))}
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
        {isCalculating ? 'Optimisation en cours...' : 'Optimiser la séquence mixte'}
      </button>

      {/* Résultats */}
      {result && (
        <div className={`${styles.section} ${styles.resultsSection}`}>
          <h2 className={styles.resultsTitle}>Résultats de l'optimisation goulot</h2>

          {/* Statut d'optimisation */}
          <div className={styles.optimizationStatus}>
            <h3 className={styles.statusTitle}>Statut d'optimisation</h3>
            <div className={`${styles.statusValue} ${result.optimization_status === 'Optimal' ? styles.statusOptimal : styles.statusSuboptimal}`}>
              {result.optimization_status || 'Inconnu'}
            </div>
          </div>

          {/* Séquence optimale */}
          <div className={styles.sequenceSection}>
            <h4>Séquence optimale de production</h4>
            <div className={styles.sequenceContainer}>
              {result.sequence && result.sequence.map((model, index) => (
                <div key={index} className={styles.sequenceItem}>
                  <div className={`${styles.modelBadge} ${styles[`model${model}`]}`}>
                    M{model}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Métriques */}
          <div className={styles.metricsGrid}>
            <div className={styles.metric}>
              <div className={styles.metricValue}>
                {result.metrics?.nombre_total_unites || 0}
              </div>
              <div className={styles.metricLabel}>
                Nombre total d'unités
              </div>
            </div>
            
            <div className={styles.metric}>
              <div className={styles.metricValue}>
                {result.metrics?.variation_maximale || 0}
              </div>
              <div className={styles.metricLabel}>
                Variation maximale ({timeUnit})
              </div>
            </div>
            
            <div className={styles.metric}>
              <div className={styles.metricValue}>
                {result.metrics?.temps_cycle_goulot || 0}
              </div>
              <div className={styles.metricLabel}>
                Temps cycle goulot ({timeUnit})
              </div>
            </div>

            <div className={styles.metric}>
              <div className={styles.metricValue}>
                {result.metrics?.deviation_moyenne || 0}
              </div>
              <div className={styles.metricLabel}>
                Déviation moyenne ({timeUnit})
              </div>
            </div>

            <div className={styles.metric}>
              <div className={styles.metricValue}>
                {result.metrics?.efficacite_lissage || 0}%
              </div>
              <div className={styles.metricLabel}>
                Efficacité lissage
              </div>
            </div>

            <div className={styles.metric}>
              <div className={styles.metricValue}>
                s1={result.parameters?.s1 || s1}, s2={result.parameters?.s2 || s2}
              </div>
              <div className={styles.metricLabel}>
                Paramètres utilisés
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Graphiques */}
      {chartUrl && (
        <div className={`${styles.section} ${styles.chartSection}`}>
          <div className={styles.chartHeader}>
            <h3>Analyse de la variation du goulot</h3>
          </div>
          <div className={styles.chartContainer}>
            <img
              src={chartUrl}
              alt="Graphiques Variation Goulot"
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

export default LigneAssemblageMixteGoulotForm; 