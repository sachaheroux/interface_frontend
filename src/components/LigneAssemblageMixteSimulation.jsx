import React, { useState, useEffect } from 'react';
import './LigneAssemblageMixteSimulation.css';
import { API_URL } from '../config/api';

const LigneAssemblageMixteSimulation = () => {
  // Configuration des produits
  const PRODUCTS = [
    { id: 'A', name: 'Vélo de Route Pro', color: '#3b82f6', demand: 30 },
    { id: 'B', name: 'Vélo de Ville Standard', color: '#10b981', demand: 70 }
  ];

  // Tâches du poste goulot (4 tâches spécifiques, mêmes tâches mais temps différents)
  const TASKS = [
    { id: 1, name: 'Montage roue avant', productA: 14, productB: 10 },
    { id: 2, name: 'Installation freins', productA: 12, productB: 8 },
    { id: 3, name: 'Réglage dérailleur', productA: 16, productB: 12 },
    { id: 4, name: 'Test transmission', productA: 11, productB: 9 }
  ];

  const [sequence, setSequence] = useState([]);
  const [results, setResults] = useState(null);
  const [showGraph, setShowGraph] = useState(false);

  // Calculer les temps de cycle pour chaque produit
  const calculateCycleTimes = () => {
    const cycleTimes = {};
    PRODUCTS.forEach(product => {
      cycleTimes[product.id] = TASKS.reduce((total, task) => {
        return total + (product.id === 'A' ? task.productA : task.productB);
      }, 0);
    });
    return cycleTimes;
  };

  // Calculer les variations de temps selon l'algorithme du goulot
  const calculateTimeVariations = (sequence) => {
    if (sequence.length === 0) return { variations: [], totalVariation: 0, avgVariation: 0 };

    const cycleTimes = calculateCycleTimes();
    
    // Calculer le temps de cycle moyen du goulot (C_k)
    const totalTime = Object.values(cycleTimes).reduce((sum, time) => sum + time, 0);
    const C_k = totalTime / sequence.length;
    
    // Calculer les temps cumulés réels
    const cumulativeTimes = [];
    let cumulativeTime = 0;
    
    for (const productId of sequence) {
      const cycleTime = cycleTimes[productId];
      cumulativeTime += cycleTime;
      cumulativeTimes.push(cumulativeTime);
    }
    
    // Calculer les temps théoriques idéaux
    const theoreticalIdeal = [];
    for (let i = 0; i < sequence.length; i++) {
      theoreticalIdeal.push(C_k * (i + 1));
    }
    
    // Calculer les déviations (variations)
    const variations = [];
    let totalDeviation = 0;
    
    for (let i = 0; i < sequence.length; i++) {
      const deviation = Math.abs(cumulativeTimes[i] - theoreticalIdeal[i]);
      variations.push({
        position: i + 1,
        product: sequence[i],
        cumulativeTime: cumulativeTimes[i],
        theoreticalTime: theoreticalIdeal[i],
        deviation: deviation
      });
      
      totalDeviation += deviation;
    }
    
    const maxVariation = Math.max(...variations.map(v => v.deviation));
    const avgDeviation = totalDeviation / sequence.length;
    
    return {
      variations,
      totalVariation: totalDeviation,
      avgVariation: avgDeviation,
      maxVariation: maxVariation,
      C_k: C_k,
      cumulativeTimes: cumulativeTimes,
      theoreticalIdeal: theoreticalIdeal
    };
  };

  // Calculer le temps cumulé au poste goulot
  const calculateCumulativeTime = (sequence) => {
    if (sequence.length === 0) return [];

    const cycleTimes = calculateCycleTimes();
    const cumulativeTimes = [];
    let cumulativeTime = 0;

    for (let i = 0; i < sequence.length; i++) {
      const product = sequence[i];
      const cycleTime = cycleTimes[product];
      cumulativeTime += cycleTime;
      
      cumulativeTimes.push({
        position: i + 1,
        product: product,
        cycleTime: cycleTime,
        cumulativeTime: cumulativeTime
      });
    }

    return cumulativeTimes;
  };

  // Ajouter un produit à la séquence
  const addProduct = (productId) => {
    // Vérifier si on peut ajouter ce produit
    const currentCountA = sequence.filter(id => id === 'A').length;
    const currentCountB = sequence.filter(id => id === 'B').length;
    
    if (productId === 'A' && currentCountA >= 3) {
      alert('Vous ne pouvez pas ajouter plus de 3 Vélo de Route Pro.');
      return;
    }
    
    if (productId === 'B' && currentCountB >= 7) {
      alert('Vous ne pouvez pas ajouter plus de 7 Vélo de Ville Standard.');
      return;
    }
    
    if (sequence.length >= 10) {
      alert('La séquence ne peut pas dépasser 10 produits.');
      return;
    }
    
    setSequence(prev => [...prev, productId]);
    setResults(null);
    setShowGraph(false);
  };

  // Retirer le dernier produit
  const removeLastProduct = () => {
    setSequence(prev => prev.slice(0, -1));
    setResults(null);
    setShowGraph(false);
  };

  // Réinitialiser la séquence
  const resetSequence = () => {
    setSequence([]);
    setResults(null);
    setShowGraph(false);
  };

  // Évaluer la séquence
  const evaluateSequence = async () => {
    if (sequence.length !== 10) {
      alert('La séquence doit contenir exactement 10 produits pour être évaluée.');
      return;
    }

    // Vérifier la proportion correcte : 3 produits A et 7 produits B
    const countA = sequence.filter(productId => productId === 'A').length;
    const countB = sequence.filter(productId => productId === 'B').length;
    
    if (countA !== 3 || countB !== 7) {
      alert(`La séquence doit contenir exactement 3 Vélo de Route Pro et 7 Vélo de Ville Standard.\nActuellement : ${countA} Vélo de Route Pro et ${countB} Vélo de Ville Standard.`);
      return;
    }

    try {
      // Préparer les données pour l'algorithme backend
      const taskTimes = [
        [14, 10], // Montage roue avant: A=14, B=10
        [12, 8],  // Installation freins: A=12, B=8
        [16, 12], // Réglage dérailleur: A=16, B=12
        [11, 9]   // Test transmission: A=11, B=9
      ];

      const requestData = {
        sequence: sequence,
        models_demand: [3, 7], // 3 Vélo de Route Pro, 7 Vélo de Ville Standard
        task_times: taskTimes
      };

      // Appeler l'algorithme backend
      const response = await fetch(`${API_URL}/goulot-variation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'évaluation de la séquence');
      }

      const result = await response.json();
      setResults(result);
      setShowGraph(true);
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de l\'évaluation de la séquence: ' + error.message);
    }
  };



  return (
    <div className="lam-sequencage">
      {/* Contexte */}
      <div className="lam-sequencage-context">
        <div className="lam-sequencage-context-block">
          <h2>🚴 Séquençage Mixte - Poste Goulot Critique</h2>
          <div className="lam-sequencage-context-mission">
            <strong>Contexte de production :</strong> Notre usine produit deux types de vélos sur une ligne d'assemblage mixte. Nous devons optimiser le séquençage de production en fonction de notre demande client et des temps de production de chaque modèle. Le défi principal réside dans l'équilibrage du poste goulot, qui est le poste le plus critique de notre ligne.
          </div>
          <div className="lam-sequencage-context-ressources">
            <strong>Notre stratégie de séquençage :</strong>
            <ul>
              <li><strong>Demande client :</strong> Vélo de Route Pro (30 unités) et Vélo de Ville Standard (70 unités)</li>
              <li><strong>Séquence minimale :</strong> 10 positions (3 Vélo de Route Pro + 7 Vélo de Ville Standard)</li>
              <li><strong>Poste goulot :</strong> Ce poste effectue 4 tâches spécifiques sur chaque vélo avec des temps variables</li>
              <li><strong>Complexité des modèles :</strong> Le Vélo de Route Pro (53 min) est plus complexe que le Vélo de Ville Standard (39 min)</li>
              <li><strong>Objectif critique :</strong> Minimiser les variations de temps entre vélos consécutifs au poste goulot</li>
              <li><strong>Impact du goulot :</strong> Ce poste limite le débit de toute la ligne d'assemblage</li>
            </ul>
          </div>
          <div className="lam-sequencage-context-note">
            <strong>Pourquoi le poste goulot ?</strong> Dans le séquençage mixte, nous nous concentrons uniquement sur les tâches du poste goulot car c'est ce poste qui détermine la capacité de production de toute la ligne. Les variations de temps à ce poste créent des déséquilibres qui impactent directement notre efficacité globale.
          </div>
        </div>
      </div>

      {/* Contenu de simulation */}
      <div className="lam-sequencage-content">
        {/* Zone des produits */}
        <div className="lam-products-zone">
          <h3>Produits disponibles</h3>
          <div className="lam-products-container">
            {PRODUCTS.map(product => (
              <div key={product.id} className="lam-product-block">
                <div className="lam-product-header">
                  <div 
                    className="lam-product-color" 
                    style={{ backgroundColor: product.color }}
                  ></div>
                  <div className="lam-product-info">
                    <div className="lam-product-name">{product.name}</div>
                    <div className="lam-product-demand">Demande: {product.demand} unités</div>
                  </div>
                </div>
                <div className="lam-product-times">
                  <h4>Temps par tâche:</h4>
                  <div className="lam-product-tasks">
                    {TASKS.map(task => (
                      <div key={task.id} className="lam-product-task">
                        <span className="lam-task-name">{task.name}:</span>
                        <span className="lam-task-time">
                          {product.id === 'A' ? task.productA : task.productB} min
                        </span>
                      </div>
                    ))}
                  </div>
                  <div 
                    className="lam-product-total"
                    style={{ backgroundColor: product.color }}
                  >
                    <strong>Temps total: {TASKS.reduce((sum, task) => 
                      sum + (product.id === 'A' ? task.productA : task.productB), 0
                    )} min</strong>
                  </div>
                </div>
                <button 
                  className="lam-add-product-btn"
                  onClick={() => addProduct(product.id)}
                  style={{ backgroundColor: product.color }}
                  disabled={
                    (product.id === 'A' && sequence.filter(id => id === 'A').length >= 3) ||
                    (product.id === 'B' && sequence.filter(id => id === 'B').length >= 7) ||
                    sequence.length >= 10
                  }
                >
                  Ajouter {product.name}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Zone de séquence */}
        <div className="lam-sequence-zone">
          <div className="lam-sequence-header">
            <h3>Séquence de production (10 positions requises)</h3>
            <div className="lam-sequence-controls">
              <button 
                className="lam-sequence-btn lam-remove-btn"
                onClick={removeLastProduct}
                disabled={sequence.length === 0}
              >
                Retirer dernier
              </button>
              <span className="lam-sequence-count">
                {sequence.length}/10 produits 
                ({sequence.filter(id => id === 'A').length}/3 Route Pro, {sequence.filter(id => id === 'B').length}/7 Ville Standard)
              </span>
              <button 
                className="lam-sequence-btn lam-reset-btn"
                onClick={resetSequence}
                disabled={sequence.length === 0}
              >
                Réinitialiser
              </button>
            </div>
          </div>
          
          <div className="lam-sequence-container">
            {sequence.length === 0 ? (
              <div className="lam-sequence-empty">
                <p>Aucun produit dans la séquence</p>
                <p>Objectif : Créer une séquence de 10 positions</p>
                <p>Répartition requise : 3 Vélo de Route Pro + 7 Vélo de Ville Standard</p>
                <p>Cliquez sur "Ajouter Produit" pour commencer</p>
              </div>
            ) : (
              <div className="lam-sequence-items">
                {sequence.map((productId, index) => {
                  const product = PRODUCTS.find(p => p.id === productId);
                  return (
                    <div 
                      key={index}
                      className="lam-sequence-item"
                      style={{ borderColor: product.color }}
                    >
                      <div className="lam-sequence-item-color" style={{ backgroundColor: product.color }}></div>
                      <div className="lam-sequence-item-info">
                        <span className="lam-sequence-item-name">{product.name}</span>
                        <span className="lam-sequence-item-position">#{index + 1}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Zone de validation */}
        <div className="lam-sequencage-validation-zone">
          <h3>Évaluation</h3>
          <div className="lam-sequencage-validation-buttons">
            <button 
              className="lam-sequencage-evaluate-btn" 
              onClick={evaluateSequence}
              disabled={sequence.length !== 10}
            >
              Évaluer la séquence
            </button>
          </div>
        </div>

        {/* Zone des résultats */}
        {results && (
          <div className="lam-sequencage-results-zone">
            <h3>Résultats du séquençage</h3>
            <div className="lam-sequencage-results-grid">
              <div className="lam-sequencage-result-card">
                <h4>Métriques globales</h4>
                <div className="lam-sequencage-metrics">
                  <div className="lam-sequencage-metric">
                    <span className="lam-sequencage-metric-label">Nombre total d'unités:</span>
                    <span className="lam-sequencage-metric-value">{sequence.length}</span>
                  </div>
                  <div className="lam-sequencage-metric">
                    <span className="lam-sequencage-metric-label">Répartition modèles:</span>
                    <span className="lam-sequencage-metric-value">3 Route Pro, 7 Ville Standard</span>
                  </div>
                  <div className="lam-sequencage-metric">
                    <span className="lam-sequencage-metric-label">Variation maximale:</span>
                    <span className="lam-sequencage-metric-value">{results.metrics.variation_maximale} min</span>
                  </div>
                  <div className="lam-sequencage-metric">
                    <span className="lam-sequencage-metric-label">Temps de cycle goulot:</span>
                    <span className="lam-sequencage-metric-value">{results.metrics.temps_cycle_goulot} min</span>
                  </div>
                  <div className="lam-sequencage-metric">
                    <span className="lam-sequencage-metric-label">Déviation moyenne:</span>
                    <span className="lam-sequencage-metric-value">{results.metrics.deviation_moyenne} min</span>
                  </div>
                  <div className="lam-sequencage-metric">
                    <span className="lam-sequencage-metric-label">Efficacité de lissage:</span>
                    <span className="lam-sequencage-metric-value">{results.metrics.efficacite_lissage}%</span>
                  </div>
                </div>
              </div>
              
              <div className="lam-sequencage-result-card">
                <h4>Détail des variations</h4>
                <div className="lam-sequencage-variations">
                  {results.cumulative_times && results.cumulative_times.map((cumulativeTime, index) => (
                    <div key={index} className="lam-sequencage-variation">
                      <div className="lam-sequencage-variation-header">
                        <strong>Position {index + 1}:</strong>
                        <span className="lam-sequencage-variation-value">
                          {Math.abs(cumulativeTime - results.theoretical_ideal[index]).toFixed(3)} min
                        </span>
                      </div>
                      <div className="lam-sequencage-variation-detail">
                        <span>Temps cumulé: {cumulativeTime}min | Temps théorique: {results.theoretical_ideal[index].toFixed(1)}min</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Graphique du temps cumulé au poste goulot */}
            {showGraph && (
              <div className="lam-sequencage-graph-zone">
                <h4>Variation du temps cumulé au poste goulot</h4>
                <div className="lam-sequencage-graph">
                  <svg width="100%" height="200" style={{ background: 'white', borderRadius: '8px' }}>
                    {/* Axes */}
                    <line x1="50" y1="180" x2="750" y2="180" stroke="#ccc" strokeWidth="1" />
                    <line x1="50" y1="20" x2="50" y2="180" stroke="#ccc" strokeWidth="1" />
                    
                    {/* Points et lignes pour le temps cumulé */}
                    {results.cumulative_times && results.cumulative_times.map((cumulativeTime, index) => {
                      const x = 50 + (index * 70);
                      const maxTime = Math.max(...results.cumulative_times);
                      const y = 180 - ((cumulativeTime / maxTime) * 160);
                      
                      return (
                        <g key={index}>
                          {/* Ligne entre les points */}
                          {index > 0 && (
                            <line 
                              x1={50 + ((index - 1) * 70)} 
                              y1={180 - ((results.cumulative_times[index - 1] / maxTime) * 160)}
                              x2={x} 
                              y2={y} 
                              stroke="#3b82f6" 
                              strokeWidth="2" 
                            />
                          )}
                          {/* Point */}
                          <circle 
                            cx={x} 
                            cy={y} 
                            r="4" 
                            fill={sequence[index] === 'A' ? '#3b82f6' : '#10b981'} 
                            stroke="white" 
                            strokeWidth="2"
                          />
                          {/* Label du produit */}
                          <text x={x} y="195" textAnchor="middle" fontSize="10" fill="#666">
                            {sequence[index]}
                          </text>
                          {/* Temps cumulé */}
                          <text x={x} y={y - 10} textAnchor="middle" fontSize="8" fill="#666">
                            {cumulativeTime}min
                          </text>
                        </g>
                      );
                    })}
                    
                    {/* Ligne théorique idéale */}
                    {results.theoretical_ideal && results.theoretical_ideal.map((theoreticalTime, index) => {
                      const x = 50 + (index * 70);
                      const maxTime = Math.max(...results.cumulative_times);
                      const y = 180 - ((theoreticalTime / maxTime) * 160);
                      
                      return (
                        <g key={`theoretical-${index}`}>
                          {/* Ligne entre les points théoriques */}
                          {index > 0 && (
                            <line 
                              x1={50 + ((index - 1) * 70)} 
                              y1={180 - ((results.theoretical_ideal[index - 1] / maxTime) * 160)}
                              x2={x} 
                              y2={y} 
                              stroke="#10b981" 
                              strokeWidth="2" 
                              strokeDasharray="5,5"
                            />
                          )}
                          {/* Point théorique */}
                          <circle 
                            cx={x} 
                            cy={y} 
                            r="3" 
                            fill="#10b981" 
                            stroke="white" 
                            strokeWidth="1"
                          />
                        </g>
                      );
                    })}
                  </svg>
                </div>
                <div className="lam-sequencage-graph-legend">
                  <div className="lam-sequencage-graph-legend-item">
                    <div className="lam-sequencage-graph-legend-color" style={{ backgroundColor: '#3b82f6' }}></div>
                    <span>Vélo de Route Pro</span>
                  </div>
                  <div className="lam-sequencage-graph-legend-item">
                    <div className="lam-sequencage-graph-legend-color" style={{ backgroundColor: '#10b981' }}></div>
                    <span>Vélo de Ville Standard</span>
                  </div>
                  <div className="lam-sequencage-graph-legend-item">
                    <div className="lam-sequencage-graph-legend-color" style={{ backgroundColor: '#10b981', border: '2px dashed #10b981' }}></div>
                    <span>Temps théorique idéal</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LigneAssemblageMixteSimulation; 