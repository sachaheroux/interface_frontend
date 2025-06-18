import React, { useState, Fragment } from 'react';
import styles from './LigneAssemblageMixteEquilibrageForm.module.css';
import ExcelExportSectionLigneAssemblageMixte from './ExcelExportSectionLigneAssemblageMixte';
import ExcelImportSectionLigneAssemblageMixte from './ExcelImportSectionLigneAssemblageMixte';

const LigneAssemblageMixteEquilibragePlusPlusForm = () => {
  const [products, setProducts] = useState([
    { name: 'Produit 1', demand: 4 },
    { name: 'Produit 2', demand: 6 }
  ]);
  
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

  const [cycleTime, setCycleTime] = useState(50);
  const [timeUnit, setTimeUnit] = useState('minutes');
  const [result, setResult] = useState(null);
  const [chartUrl, setChartUrl] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState('');
  const [optimizeBalance, setOptimizeBalance] = useState(true);

  const API_URL = "https://interface-backend-1jgi.onrender.com";

  // Fonction pour gérer l'import Excel
  const handleImportSuccess = (data) => {
    try {
      if (data.products_data && Array.isArray(data.products_data)) {
        setProducts(data.products_data.map(p => ({
          name: p.name || `Produit ${p.product_id}`,
          demand: p.demand || 1
        })));
      }

      if (data.tasks_data && Array.isArray(data.tasks_data)) {
        setTasks(data.tasks_data.map(t => ({
          id: t.task_id || t.id,
          name: t.name || `Tâche ${t.task_id || t.id}`,
          models: t.models || t.times?.map((time, index) => ({
            predecessors: null,
            time: time || 0
          })) || []
        })));
      }

      if (data.unite) {
        setTimeUnit(data.unite);
      }

      if (data.cycle_time !== undefined) {
        setCycleTime(data.cycle_time);
      }

      console.log("Données importées et appliquées:", { products, tasks, timeUnit, cycleTime });
    } catch (error) {
      console.error("Erreur lors de l'application des données importées:", error);
      setError("Erreur lors de l'application des données importées");
    }
  };

  // Gestion des produits
  const addProduct = () => {
    const newProduct = { name: `Produit ${products.length + 1}`, demand: 1 };
    setProducts([...products, newProduct]);
    
    const newTasks = tasks.map(task => ({
      ...task, 
      models: [...task.models, { predecessors: null, time: 1 }]
    }));
    setTasks(newTasks);
  };

  const removeProduct = () => {
    if (products.length > 2) {
      setProducts(products.slice(0, -1));
      const newTasks = tasks.map(task => ({
        ...task,
        models: task.models.slice(0, -1)
      }));
      setTasks(newTasks);
    }
  };

  const updateProduct = (index, field, value) => {
    const newProducts = [...products];
    if (field === 'name') {
      newProducts[index].name = value;
    } else if (field === 'demand') {
      newProducts[index].demand = parseInt(value) || 0;
    }
    setProducts(newProducts);
  };

  // Gestion des tâches
  const addTask = () => {
    const newId = Math.max(...tasks.map(t => t.id)) + 1;
    setTasks([...tasks, { 
      id: newId, 
      name: `Tâche ${newId}`,
      models: products.map(() => ({ predecessors: null, time: 1 }))
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
      // Accepter les valeurs zéro
      const numValue = value === '' ? 0 : parseFloat(value);
      newTasks[taskIndex].models[modelIndex][field] = isNaN(numValue) ? 0 : numValue;
    }
    setTasks(newTasks);
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
      // Validation de la durée de la période
      if (cycleTime <= 0) {
        throw new Error("La durée de la période doit être un nombre positif.");
      }

      // Validation des demandes pour la période
      if (products.some(product => product.demand <= 0)) {
        throw new Error("Les demandes pour la période par produit doivent être positives.");
      }

      // Validation des temps (permettre zéro)
      for (const task of tasks) {
        for (const model of task.models) {
          if (model.time < 0) {
            throw new Error(`Le temps de traitement ne peut pas être négatif pour la tâche ${task.id}.`);
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
                const predecessorIds = model.predecessors.split(',')
                  .map(p => parseInt(p.trim()))
                  .filter(p => !isNaN(p) && p > 0);
                predecessors = predecessorIds.length === 1 ? predecessorIds[0] : 
                              predecessorIds.length > 1 ? predecessorIds : null;
              } else {
                predecessors = model.predecessors;
              }
            }
            return {
              predecessors: predecessors,
              time: Math.max(0, parseFloat(model.time) || 0) // Assurer des valeurs numériques valides
            };
          })
        };
      });

      const requestData = {
        models: products.map(p => p.demand),
        tasks_data: tasksData,
        cycle_time: cycleTime,
        unite: timeUnit,
        optimize_balance: optimizeBalance
      };

      console.log("Données envoyées:", requestData);

      const response = await fetch(`${API_URL}/ligne_assemblage_mixte/equilibrage_plus_plus`, {
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
        const chartResponse = await fetch(`${API_URL}/ligne_assemblage_mixte/equilibrage_plus_plus/chart`, {
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
    <div className="algorithmContent">
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <h1 className={styles.title}>Ligne d'assemblage mixte - Équilibrage ++</h1>
          <p className={styles.subtitle}>
            Équilibrage optimal multi-produits avec contraintes de précédence (version améliorée)
          </p>
        </div>

        {/* Export Excel - Placé tout en haut */}
        <ExcelExportSectionLigneAssemblageMixte
          products={products}
          tasks={tasks}
          timeUnit={timeUnit}
          algorithmName="Équilibrage Mixte ++"
          API_URL={API_URL}
          algorithmEndpoint="ligne_assemblage_mixte/equilibrage_plus_plus"
          additionalParams={{ cycle_time: cycleTime }}
        />

        {/* Import Excel - Placé juste après l'export */}
        <ExcelImportSectionLigneAssemblageMixte
          onImportSuccess={handleImportSuccess}
          API_URL={API_URL}
          algorithmName="Équilibrage Mixte ++"
          algorithmEndpoint="ligne_assemblage_mixte/equilibrage_plus_plus"
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

          <div className={styles.inputGroup}>
                            <label htmlFor="cycleTime">Durée de la période ({timeUnit})</label>
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
              onClick={addProduct}
              disabled={products.length >= 5}
              className={styles.addButton}
              type="button"
              title={products.length >= 5 ? "Maximum 5 produits autorisés pour cet algorithme" : "Ajouter un nouveau produit à optimiser"}
            >
              + Ajouter un produit
            </button>
            
            <button
              onClick={removeProduct}
              disabled={products.length <= 2}
              className={styles.removeButton}
              type="button"
              title={products.length <= 2 ? "Minimum 2 produits requis" : "Supprimer le dernier produit"}
            >
              - Supprimer un produit
            </button>

            <button
              onClick={addTask}
              className={styles.addButton}
              type="button"
              title="Ajouter une nouvelle tâche à équilibrer"
            >
              + Ajouter une tâche
            </button>
            
            <button
              onClick={removeTask}
              disabled={tasks.length <= 1}
              className={styles.removeButton}
              type="button"
              title={tasks.length <= 1 ? "Minimum 1 tâche requise" : "Supprimer la dernière tâche"}
            >
              - Supprimer une tâche
            </button>
          </div>
        </div>
      </div>

      {/* Configuration des produits */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Configuration des produits ({products.length} produits)</h2>
        
        <div className={styles.productsContainer}>
          <div className={styles.productsHeader}>
            <div className={styles.productHeaderCell}>Produit</div>
            <div className={styles.productHeaderCell}>Demande pour la période</div>
          </div>
          
          {products.map((product, index) => (
            <div key={index} className={styles.productRow}>
              <div className={styles.productCell}>
                <div className={styles.productBadgeContainer}>
                  <div className={styles.productBadge}>P{index + 1}</div>
                  <input
                    type="text"
                    value={product.name}
                    onChange={(e) => updateProduct(index, 'name', e.target.value)}
                    className={styles.productNameInput}
                    placeholder={`Produit ${index + 1}`}
                  />
                </div>
              </div>
              
              <div className={styles.productCell}>
                <input
                  type="number"
                  value={product.demand}
                  onChange={(e) => updateProduct(index, 'demand', e.target.value)}
                  className={styles.demandInput}
                  min="1"
                  placeholder="4"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tableau des tâches */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>
          Configuration des tâches ({tasks.length} tâches × {products.length} produits)
        </h2>
        
        <div className={styles.tableContainer}>
          <table 
            className={styles.table} 
            style={{ minWidth: `${280 + (products.length * 280)}px` }}
          >
            <thead>
              <tr>
                <th rowSpan="2">Tâche</th>
                <th rowSpan="2">Nom de la tâche</th>
                {products.map((product, index) => (
                  <th key={index} colSpan="2" className={styles.productHeader}>
                    {product.name}
                  </th>
                ))}
              </tr>
              <tr>
                {products.map((product, index) => (
                  <React.Fragment key={index}>
                    <th className={styles.subHeader}>Temps ({timeUnit})</th>
                    <th className={styles.subHeader}>Prédécesseurs</th>
                  </React.Fragment>
                ))}
              </tr>
            </thead>
            <tbody>
              {tasks.map((task, taskIndex) => (
                <tr key={task.id}>
                  <td className={styles.taskCell}>
                    <div className={styles.taskNumber}>T{task.id}</div>
                  </td>
                  <td>
                    <input
                      type="text"
                      value={task.name}
                      onChange={(e) => updateTask(taskIndex, 'name', e.target.value)}
                      className={styles.input}
                      placeholder={`Tâche ${task.id}`}
                    />
                  </td>
                  {task.models.map((model, productIndex) => (
                    <React.Fragment key={productIndex}>
                      <td>
                        <input
                          type="number"
                          value={model.time}
                          onChange={(e) => updateTaskModel(taskIndex, productIndex, 'time', e.target.value)}
                          className={styles.input}
                          min="0"
                          step="0.1"
                          placeholder="0"
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          value={formatPredecessors(model.predecessors)}
                          onChange={(e) => updateTaskModel(taskIndex, productIndex, 'predecessors', e.target.value)}
                          className={styles.input}
                          placeholder=""
                          title="IDs des tâches prédécesseurs séparés par des virgules"
                        />
                      </td>
                    </React.Fragment>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Aide */}
        <div className={styles.helpText}>
          <p><strong>Aide :</strong> Pour les prédécesseurs, utilisez les numéros de tâches séparés par des virgules (ex: 1,2). Laissez vide si aucun prédécesseur.</p>
          <p><strong>Temps :</strong> Mettez 0 si un produit ne passe pas par cette tâche.</p>
        </div>
      </div>

      {/* Options d'optimisation */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Options d'optimisation avancée</h3>
        <div className={styles.optimizationOptions}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={optimizeBalance}
              onChange={(e) => setOptimizeBalance(e.target.checked)}
              className={styles.checkbox}
            />
            <span className={styles.checkboxText}>
              Optimiser l'équilibrage des stations
            </span>
            <span className={styles.checkboxDescription}>
              Active l'algorithme bi-objectif : minimise le nombre de stations puis l'écart des taux d'utilisation avec possibilité de doubler la capacité
            </span>
          </label>
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
        {isCalculating ? 'Calcul en cours...' : 'Lancer l\'équilibrage mixte ++'}
      </button>

      {/* Résultats */}
      {result && (
        <div className={`${styles.section} ${styles.resultsSection}`}>
          <h2 className={styles.resultsTitle}>Résultats de l'équilibrage mixte ++</h2>

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

            {result.balance_optimized && (
              <>
                <div className={styles.metric}>
                  <div className={styles.metricValue}>
                    {result.utilization_gap?.toFixed(2) || 0}%
                  </div>
                  <div className={styles.metricLabel}>
                    Écart min-max optimisé
                  </div>
                </div>

                <div className={styles.metric}>
                  <div className={styles.metricValue}>
                    {result.doubled_stations?.length || 0}
                  </div>
                  <div className={styles.metricLabel}>
                    Stations doublées
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Configuration des stations */}
          <div className={styles.stationsDetails}>
            <h4>Configuration des stations</h4>
            {result.doubled_stations && result.doubled_stations.length > 0 && (
              <div className={styles.doubledStationsInfo}>
                <div className={styles.doubledStationsAlert}>
                  <span className={styles.doubledStationsIcon}>🔧</span>
                  <strong>Optimisation appliquée :</strong> {result.doubled_stations.length} station(s) avec capacité doublée pour améliorer l'équilibrage
                  <div className={styles.doubledStationsList}>
                    Stations optimisées : {result.doubled_stations.map(s => `Station ${s}`).join(', ')}
                  </div>
                </div>
              </div>
            )}
            <div className={styles.stationsList}>
              {result.station_assignments && result.station_assignments.map((station, index) => (
                <div key={index} className={`${styles.stationCard} ${station.doubled_capacity ? styles.doubledStation : ''}`}>
                  <div className={styles.stationHeader}>
                    <div className={styles.stationTitle}>
                      {station.doubled_capacity && (
                        <span className={styles.doubledIcon}>⚡</span>
                      )}
                      <strong>Station {station.station}</strong>
                      {station.doubled_capacity && (
                        <span className={styles.doubledBadge}>CAPACITÉ x2</span>
                      )}
                    </div>
                    <span className={styles.stationUtilization}>
                      {station.utilization?.toFixed(1) || 0}% d'utilisation
                    </span>
                  </div>
                  <div className={styles.stationTasks}>
                    <strong>Tâches assignées :</strong> {Array.isArray(station.tasks) ? station.tasks.join(', ') : 'Aucune'}
                  </div>
                  <div className={styles.stationCapacityInfo}>
                    <div className={styles.stationLoad}>
                      <strong>Charge :</strong> {station.load?.toFixed(1) || 0} {timeUnit}
                    </div>
                    <div className={styles.stationCapacity}>
                      <strong>Capacité :</strong> 
                      {station.doubled_capacity ? (
                        <span className={styles.doubledCapacityText}>
                          {(cycleTime * 2).toFixed(1)} {timeUnit} 
                          <span className={styles.capacityExplanation}>
                            (doublée de {cycleTime} → {(cycleTime * 2).toFixed(1)} {timeUnit})
                          </span>
                        </span>
                      ) : (
                        <span>{cycleTime} {timeUnit} (normale)</span>
                      )}
                    </div>
                  </div>
                  {station.doubled_capacity && (
                    <div className={styles.optimizationNote}>
                      💡 <strong>Optimisation :</strong> Cette station a été optimisée avec une capacité doublée pour améliorer l'équilibrage global de la ligne
                    </div>
                  )}
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
      </div>
    </div>
  );
};

export default LigneAssemblageMixteEquilibragePlusPlusForm; 