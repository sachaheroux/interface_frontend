import React, { useState, useEffect } from 'react';
import './LigneAssemblageMixteSimulation.css';

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

  // Calculer les variations de temps
  const calculateTimeVariations = (sequence) => {
    if (sequence.length === 0) return { variations: [], totalVariation: 0, avgVariation: 0 };

    const cycleTimes = calculateCycleTimes();
    const variations = [];
    let totalVariation = 0;

    for (let i = 1; i < sequence.length; i++) {
      const currentProduct = sequence[i];
      const previousProduct = sequence[i - 1];
      
      const currentTime = cycleTimes[currentProduct];
      const previousTime = cycleTimes[previousProduct];
      
      const variation = Math.abs(currentTime - previousTime);
      variations.push({
        position: i,
        current: currentProduct,
        previous: previousProduct,
        currentTime,
        previousTime,
        variation
      });
      
      totalVariation += variation;
    }

    return {
      variations,
      totalVariation,
      avgVariation: totalVariation / (sequence.length - 1)
    };
  };

  // Ajouter un produit à la séquence
  const addProduct = (productId) => {
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
  const evaluateSequence = () => {
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

    const variations = calculateTimeVariations(sequence);
    setResults(variations);
    setShowGraph(true);
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
                    <span className="lam-sequencage-metric-label">Variation totale:</span>
                    <span className="lam-sequencage-metric-value">{results.totalVariation} min</span>
                  </div>
                  <div className="lam-sequencage-metric">
                    <span className="lam-sequencage-metric-label">Variation moyenne:</span>
                    <span className="lam-sequencage-metric-value">{results.avgVariation.toFixed(1)} min</span>
                  </div>
                  <div className="lam-sequencage-metric">
                    <span className="lam-sequencage-metric-label">Nombre de transitions:</span>
                    <span className="lam-sequencage-metric-value">{results.variations.length}</span>
                  </div>
                  <div className="lam-sequencage-metric">
                    <span className="lam-sequencage-metric-label">Longueur séquence:</span>
                    <span className="lam-sequencage-metric-value">{sequence.length}</span>
                  </div>
                </div>
              </div>
              
              <div className="lam-sequencage-result-card">
                <h4>Détail des variations</h4>
                <div className="lam-sequencage-variations">
                  {results.variations.map((variation, index) => (
                    <div key={index} className="lam-sequencage-variation">
                      <div className="lam-sequencage-variation-header">
                        <strong>Position {variation.position}:</strong>
                        <span className="lam-sequencage-variation-value">{variation.variation} min</span>
                      </div>
                      <div className="lam-sequencage-variation-detail">
                        <span>{variation.previous} ({variation.previousTime}min) → {variation.current} ({variation.currentTime}min)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Graphique des variations */}
            {showGraph && (
              <div className="lam-sequencage-graph-zone">
                <h4>Graphique des variations</h4>
                <div className="lam-sequencage-graph">
                  {results.variations.map((variation, index) => (
                    <div key={index} className="lam-sequencage-graph-bar">
                      <div 
                        className="lam-sequencage-graph-bar-fill"
                        style={{ 
                          height: `${(variation.variation / Math.max(...results.variations.map(v => v.variation))) * 100}%`,
                          backgroundColor: variation.variation > results.avgVariation ? '#ef4444' : '#10b981'
                        }}
                      ></div>
                      <div className="lam-sequencage-graph-bar-label">
                        {variation.variation}min
                      </div>
                    </div>
                  ))}
                </div>
                <div className="lam-sequencage-graph-legend">
                  <div className="lam-sequencage-graph-legend-item">
                    <div className="lam-sequencage-graph-legend-color" style={{ backgroundColor: '#10b981' }}></div>
                    <span>Variation faible</span>
                  </div>
                  <div className="lam-sequencage-graph-legend-item">
                    <div className="lam-sequencage-graph-legend-color" style={{ backgroundColor: '#ef4444' }}></div>
                    <span>Variation élevée</span>
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