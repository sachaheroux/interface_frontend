import React, { useState } from 'react';
import styles from './LigneAssemblagePrecedenceForm.module.css';
import ExcelImportSectionPrecedence from './ExcelImportSectionPrecedence';
import ExcelExportSectionPrecedence from './ExcelExportSectionPrecedence';

const LigneAssemblagePrecedenceForm = () => {
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
  const [timeUnit, setTimeUnit] = useState('minutes');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [isCalculating, setIsCalculating] = useState(false);
  const [diagramUrl, setDiagramUrl] = useState(null);

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

  const validatePredecessors = (predecessors, taskId) => {
    if (!predecessors || predecessors.trim() === '') return true;
    
    const predecessorIds = predecessors.split(',').map(p => p.trim()).filter(p => p !== '');
    return predecessorIds.every(id => {
      const numId = parseInt(id);
      return !isNaN(numId) && numId < taskId && tasks.some(t => t.id === numId);
    });
  };

  const calculatePrecedence = async () => {
    setIsCalculating(true);
    setError('');
    setResult(null);
    setDiagramUrl(null);

    try {
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
          predecessors: predecessors,
          duration: task.duration
        };
      });

      const requestData = {
        tasks_data: tasksData,
        unite: timeUnit
      };

      console.log("Données envoyées:", requestData);

      const response = await fetch(`${API_URL}/ligne_assemblage/precedence`, {
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

      // Récupération du diagramme
      try {
        const diagramResponse = await fetch(`${API_URL}/ligne_assemblage/precedence/diagram`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestData)
        });

        if (diagramResponse.ok) {
          const blob = await diagramResponse.blob();
          const url = URL.createObjectURL(blob);
          setDiagramUrl(url);
        }
      } catch (diagramError) {
        console.log("Pas de diagramme disponible");
      }

    } catch (err) {
      console.error('Erreur:', err);
      setError(`Erreur lors du calcul: ${err.message}`);
    } finally {
      setIsCalculating(false);
    }
  };

  const downloadDiagram = () => {
    if (diagramUrl) {
      const link = document.createElement('a');
      link.href = diagramUrl;
      link.download = 'diagramme_precedence.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Fonction d'import Excel
  const handleImportSuccess = (importedData) => {
    try {
      console.log("Données importées:", importedData);
      
      // Vérifier la structure des données
      if (!importedData.tasks_data || !Array.isArray(importedData.tasks_data)) {
        throw new Error("Format de données invalide");
      }

      // Convertir les données importées au format du formulaire
      const importedTasks = importedData.tasks_data.map(task => ({
        id: task.id,
        name: task.name || `Tâche ${task.id}`,
        predecessors: task.predecessors ? 
          (Array.isArray(task.predecessors) ? 
            task.predecessors.join(',') : 
            task.predecessors.toString()) : '',
        duration: task.duration || 0
      }));

      // Mettre à jour les tâches
      setTasks(importedTasks);
      
      // Mettre à jour l'unité de temps si fournie
      if (importedData.unite) {
        setTimeUnit(importedData.unite);
      }

      // Réinitialiser les résultats
      setResult(null);
      setError('');
      setDiagramUrl(null);

      console.log("Import réussi, tâches mises à jour:", importedTasks);
    } catch (error) {
      console.error("Erreur lors du traitement des données importées:", error);
      setError(`Erreur lors de l'import: ${error.message}`);
    }
  };

  return (
    <>
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>Ligne d'assemblage - Diagramme de précédence</h1>
        <p className={styles.subtitle}>
          Analyse des relations de précédence et calcul des temps de réalisation
        </p>
      </div>

      {/* Export Excel - Placé tout en haut */}
      <ExcelExportSectionPrecedence
        tasks={tasks}
        timeUnit={timeUnit}
        algorithmName="Précédences"
        API_URL={API_URL}
      />

      {/* Import Excel - Placé juste après l'export */}
      <ExcelImportSectionPrecedence
        onImportSuccess={handleImportSuccess}
        API_URL={API_URL}
        algorithmName="Précédences"
      />

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
        onClick={calculatePrecedence}
        disabled={isCalculating}
        className={styles.calculateButton}
        type="button"
      >
        {isCalculating ? 'Calcul en cours...' : 'Analyser les précédences'}
      </button>

      {/* Résultats */}
      {result && (
        <div className={`${styles.section} ${styles.resultsSection}`}>
          <h2 className={styles.resultsTitle}>Analyse des précédences</h2>

          {/* Métriques principales */}
          <div className={styles.metricsGrid}>
            <div className={styles.metric}>
              <div className={styles.metricValue}>
                {result.temps_total_minimal || 0}
              </div>
              <div className={styles.metricLabel}>
                Temps total minimal ({timeUnit})
              </div>
            </div>
            
            <div className={styles.metric}>
              <div className={styles.metricValue}>
                {result.nombre_taches || tasks.length}
              </div>
              <div className={styles.metricLabel}>
                Nombre de tâches
              </div>
            </div>
            
            <div className={styles.metric}>
              <div className={styles.metricValue}>
                {result.chemin_critique?.length || 0}
              </div>
              <div className={styles.metricLabel}>
                Tâches critiques
              </div>
            </div>

            <div className={styles.metric}>
              <div className={styles.metricValue}>
                {result.niveau_parallelisme_max || 1}
              </div>
              <div className={styles.metricLabel}>
                Parallélisme max
              </div>
            </div>
          </div>

          {/* Détails des tâches */}
          {result.taches_details && result.taches_details.length > 0 && (
            <div className={styles.taskDetails}>
              <h4>Détails par tâche</h4>
              <div className={styles.taskDetailsList}>
                {result.taches_details.map(task => (
                  <div key={task.id} className={styles.taskDetailCard}>
                    <div className={styles.taskDetailHeader}>
                      <strong>Tâche {task.id}</strong>
                      <span className={styles.taskDuration}>
                        {task.duration} {timeUnit}
                      </span>
                    </div>
                    <div className={styles.taskDetailInfo}>
                      <div>Début au plus tôt : {task.temps_debut_tot || 0} {timeUnit}</div>
                      <div>Fin au plus tard : {task.temps_fin_tard || 0} {timeUnit}</div>
                      <div>Marge libre : {task.marge_libre || 0} {timeUnit}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Chemin critique */}
          {result.chemin_critique && result.chemin_critique.length > 0 && (
            <div className={styles.criticalPath}>
              <h4>Chemin critique</h4>
              <div className={styles.criticalPathInfo}>
                <div className={styles.criticalTasks}>
                  Tâches critiques : {result.chemin_critique.join(' → ')}
                </div>
                <div className={styles.criticalNote}>
                  Ces tâches déterminent la durée minimale du projet. Tout retard sur ces tâches 
                  retardera l'ensemble du projet.
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Diagramme */}
      {diagramUrl && (
        <div className={`${styles.section} ${styles.chartSection}`}>
          <div className={styles.chartHeader}>
            <h3>Diagramme de précédence</h3>
          </div>
          <div className={styles.chartContainer}>
            <img
              src={diagramUrl}
              alt="Diagramme de précédence"
              className={styles.chart}
            />
            <button
              onClick={downloadDiagram}
              className={styles.downloadButton}
              type="button"
            >
              Télécharger le diagramme
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default LigneAssemblagePrecedenceForm; 