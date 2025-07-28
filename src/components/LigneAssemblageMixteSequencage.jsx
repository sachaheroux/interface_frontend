import React, { useState, useEffect } from 'react';
import './LigneAssemblageMixteSequencage.css';

const LigneAssemblageMixteSequencage = () => {
  // Configuration des produits
  const PRODUCTS = [
    { id: 'A', name: 'Smartphone Alpha', color: '#3b82f6', demand: 40 },
    { id: 'B', name: 'Smartphone Beta', color: '#10b981', demand: 60 }
  ];

  // Tâches du poste goulot (4 tâches par produit, mêmes tâches mais temps différents)
  const TASKS = [
    { id: 1, name: 'Installation processeur', productA: 12, productB: 9 },
    { id: 2, name: 'Montage carte mémoire', productA: 8, productB: 10 },
    { id: 3, name: 'Connexion écran tactile', productA: 15, productB: 12 },
    { id: 4, name: 'Test fonctionnel', productA: 10, productB: 8 }
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
    if (sequence.length < 2) {
      alert('La séquence doit contenir au moins 2 produits pour évaluer les variations.');
      return;
    }

    const variations = calculateTimeVariations(sequence);
    setResults(variations);
    setShowGraph(true);
  };

  // Générer une séquence optimale (exemple simple)
  const generateOptimalSequence = () => {
    const cycleTimes = calculateCycleTimes();
    const productA = { id: 'A', time: cycleTimes.A };
    const productB = { id: 'B', time: cycleTimes.B };
    
    // Séquence qui alterne les produits pour minimiser les variations
    const optimalSequence = [];
    const totalDemand = PRODUCTS.reduce((sum, p) => sum + p.demand, 0);
    
    for (let i = 0; i < totalDemand; i++) {
      if (i % 2 === 0) {
        optimalSequence.push('A');
      } else {
        optimalSequence.push('B');
      }
    }
    
    setSequence(optimalSequence);
    setResults(null);
    setShowGraph(false);
  };

  return (
    <div className="lam-sequencage">
      {/* Contexte */}
      <div className="lam-sequencage-context">
        <div className="lam-sequencage-context-block">
          <h2>📊 Poste Goulot - Séquençage Mixte</h2>
          <div className="lam-sequencage-context-mission">
            <strong>Contexte :</strong> Vous gérez le poste goulot d'une ligne d'assemblage mixte de smartphones. Ce poste effectue 4 tâches spécifiques sur chaque produit, mais avec des temps d'exécution différents selon le modèle.
          </div>
          <div className="lam-sequencage-context-ressources">
            <strong>Problème du poste goulot :</strong>
            <ul>
              <li>Le poste goulot limite le débit de toute la ligne</li>
              <li>Les variations de temps entre produits créent des déséquilibres</li>
              <li>Smartphone Alpha : 45 min total (25% plus long que Beta)</li>
              <li>Smartphone Beta : 36 min total (plus rapide à assembler)</li>
              <li>Objectif : Minimiser les variations de temps entre produits consécutifs</li>
            </ul>
          </div>
          <div className="lam-sequencage-context-note">
            <strong>Note :</strong> Les 4 tâches sont identiques pour les deux produits, mais les temps d'exécution diffèrent de 25% en moyenne.
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
                  <div className="lam-product-total">
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
            <h3>Séquence de production</h3>
            <div className="lam-sequence-controls">
              <button 
                className="lam-sequence-btn lam-remove-btn"
                onClick={removeLastProduct}
                disabled={sequence.length === 0}
              >
                Retirer dernier
              </button>
              <span className="lam-sequence-count">{sequence.length} produits</span>
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
              disabled={sequence.length < 2}
            >
              Évaluer la séquence
            </button>
            <button 
              className="lam-sequencage-optimal-btn"
              onClick={generateOptimalSequence}
            >
              Séquence optimale
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

export default LigneAssemblageMixteSequencage; 