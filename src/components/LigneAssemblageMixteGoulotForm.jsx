import React, { useState } from 'react';
import styles from './LigneAssemblageMixteGoulotForm.module.css';
import ExcelExportSectionLigneAssemblageMixte from './ExcelExportSectionLigneAssemblageMixte';
import ExcelImportSectionLigneAssemblageMixte from './ExcelImportSectionLigneAssemblageMixte';

const LigneAssemblageMixteGoulotForm = () => {
  const [products, setProducts] = useState([
    { name: 'Produit 1', demand: 4 },
    { name: 'Produit 2', demand: 6 }
  ]);
  
  const [tasks, setTasks] = useState([
    { 
      id: 1, 
      name: 'Tâche 1',
      times: [3, 3]  // temps pour chaque produit
    },
    { 
      id: 2, 
      name: 'Tâche 2',
      times: [2, 3]  // temps pour chaque produit
    }
  ]);

  const [s1, setS1] = useState(0.5);
  const [s2, setS2] = useState(0.5);
  const [timeUnit, setTimeUnit] = useState('minutes');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [isCalculating, setIsCalculating] = useState(false);
  const [chartUrl, setChartUrl] = useState(null);

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
          times: t.times || []
        })));
      }

      if (data.unite) {
        setTimeUnit(data.unite);
      }

      if (data.s1 !== undefined) {
        setS1(data.s1);
      }

      if (data.s2 !== undefined) {
        setS2(data.s2);
      }

      console.log("Données importées et appliquées:", { products, tasks, timeUnit, s1, s2 });
    } catch (error) {
      console.error("Erreur lors de l'application des données importées:", error);
      setError("Erreur lors de l'application des données importées");
    }
  };

  // Gestion des produits
  const addProduct = () => {
    const newProduct = { name: `Produit ${products.length + 1}`, demand: 4 };
    setProducts([...products, newProduct]);
    
    // Ajouter une colonne aux temps de tâches
    const newTasks = tasks.map(task => ({
      ...task,
      times: [...task.times, 3]
    }));
    setTasks(newTasks);
  };

  const removeProduct = () => {
    if (products.length > 2) {
      setProducts(products.slice(0, -1));
      
      // Supprimer la dernière colonne des temps de tâches
      const newTasks = tasks.map(task => ({
        ...task,
        times: task.times.slice(0, -1)
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
      times: new Array(products.length).fill(3)
    }]);
  };

  const removeTask = () => {
    if (tasks.length > 1) {
      setTasks(tasks.slice(0, -1));
    }
  };

  const updateTask = (taskIndex, field, value) => {
    const newTasks = [...tasks];
    if (field === 'name') {
      newTasks[taskIndex].name = value;
    }
    setTasks(newTasks);
  };

  const updateTaskTime = (taskIndex, productIndex, value) => {
    const newTasks = [...tasks];
    newTasks[taskIndex].times[productIndex] = parseFloat(value) || 0;
    setTasks(newTasks);
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
      if (products.some(product => product.demand <= 0)) {
        throw new Error("Les demandes par produit doivent être positives.");
      }

      // Validation des temps (accepter les zéros pour les produits qui ne passent pas sur cette tâche)
      if (tasks.some(task => task.times.some(time => time < 0))) {
        throw new Error("Les temps de traitement doivent être positifs ou nuls.");
      }

      const requestData = {
        models_demand: products.map(p => p.demand),
        task_times: tasks.map(task => task.times),
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
        <h1 className={styles.title}>Ligne d'assemblage mixte - Goulot</h1>
        <p className={styles.subtitle}>
          Optimisation de la séquence de production multi-produits
        </p>
      </div>

      {/* Export Excel - Placé tout en haut */}
      <ExcelExportSectionLigneAssemblageMixte
        products={products}
        tasks={tasks}
        timeUnit={timeUnit}
        algorithmName="Goulot Mixte"
        API_URL={API_URL}
        algorithmEndpoint="ligne_assemblage_mixte/goulot"
        additionalParams={{ s1, s2 }}
      />

      {/* Import Excel - Placé juste après l'export */}
      <ExcelImportSectionLigneAssemblageMixte
        onImportSuccess={handleImportSuccess}
        API_URL={API_URL}
        algorithmName="Goulot Mixte"
        algorithmEndpoint="ligne_assemblage_mixte/goulot"
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

          <div className={styles.paramRow}>
            <div className={styles.inputGroup}>
              <label htmlFor="s1">Paramètre s1 (lissage produits)</label>
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
              title="Ajouter une nouvelle tâche au poste goulot"
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
            <div className={styles.productHeaderCell}>Demande</div>
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

      {/* Configuration des temps de traitement */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>
          Temps de traitement au poste goulot ({tasks.length} tâches)
        </h2>
        
        <div className={styles.timesContainer}>
          <div className={styles.timesHeader} style={{'--products-count': products.length}}>
            <div className={styles.timeHeaderCell}>Tâche</div>
            {products.map((product, index) => (
              <div key={index} className={styles.timeHeaderCell}>
                {product.name}<br/>
                <span className={styles.timeUnit}>({timeUnit})</span>
              </div>
            ))}
          </div>
          
          {tasks.map((task, taskIndex) => (
            <div key={task.id} className={styles.timeRow} style={{'--products-count': products.length}}>
              <div className={styles.timeCell}>
                <div className={styles.taskBadgeContainer}>
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
              
              {task.times.map((time, productIndex) => (
                <div key={productIndex} className={styles.timeCell}>
                  <input
                    type="number"
                    value={time}
                    onChange={(e) => updateTaskTime(taskIndex, productIndex, e.target.value)}
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
              {result.sequence && result.sequence.map((productIndex, index) => (
                <div key={index} className={styles.sequenceItem}>
                  <div className={`${styles.productBadge} ${styles[`product${productIndex}`]}`}>
                    P{productIndex}
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