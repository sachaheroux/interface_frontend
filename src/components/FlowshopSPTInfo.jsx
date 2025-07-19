import React, { useState } from "react";
import "./FlowshopSPTInfo.css";

function FlowshopSPTInfo() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="modern-info-panel">
      {/* Header avec navigation par onglets */}
      <div className="info-header">
        <div className="algorithm-badge">
          <span className="algorithm-icon">⚡</span>
          <span className="algorithm-name">SPT</span>
        </div>
        <div className="tab-navigation">
          <button 
            className={`tab-button ${activeTab === "overview" ? "active" : ""}`}
            onClick={() => setActiveTab("overview")}
          >
            Vue d'ensemble
          </button>
          <button 
            className={`tab-button ${activeTab === "details" ? "active" : ""}`}
            onClick={() => setActiveTab("details")}
          >
            Détails
          </button>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="info-content">
        {activeTab === "overview" && (
          <div className="overview-tab">
            {/* Section Objectif */}
            <div className="info-section">
              <h4 className="section-title">
                <span className="section-icon">🎯</span>
                Objectif
              </h4>
              <p className="section-text">
                Minimiser le temps moyen de passage (flowtime) en priorisant les jobs les plus courts.
              </p>
            </div>

            {/* Section Performance */}
            <div className="info-section">
              <h4 className="section-title">
                <span className="section-icon">📊</span>
                Performance
              </h4>
              <div className="performance-metrics">
                <div className="metric-item">
                  <span className="metric-label">Complexité</span>
                  <span className="metric-value">O(n log n)</span>
                </div>
                <div className="metric-item">
                  <span className="metric-label">Efficacité</span>
                  <div className="efficiency-bar">
                    <div className="efficiency-fill" style={{width: "85%"}}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Section Cas d'usage */}
            <div className="info-section">
              <h4 className="section-title">
                <span className="section-icon">💡</span>
                Cas d'usage
              </h4>
              <ul className="usage-list">
                <li>Flowshops avec temps variables</li>
                <li>Minimisation des délais</li>
                <li>Production à la demande</li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === "details" && (
          <div className="details-tab">
            {/* Section Principe */}
            <div className="info-section">
              <h4 className="section-title">
                <span className="section-icon">🔬</span>
                Principe
              </h4>
              <p className="section-text">
                SPT (Shortest Processing Time) trie les jobs par durée totale croissante. 
                Les jobs les plus courts sont traités en premier pour réduire l'attente moyenne.
              </p>
            </div>

            {/* Section Avantages/Inconvénients */}
            <div className="info-section">
              <h4 className="section-title">
                <span className="section-icon">⚖️</span>
                Analyse
              </h4>
              <div className="analysis-grid">
                <div className="pros">
                  <h5>✅ Avantages</h5>
                  <ul>
                    <li>Simple à implémenter</li>
                    <li>Efficace sur flowtime</li>
                    <li>Réduit les délais</li>
                  </ul>
                </div>
                <div className="cons">
                  <h5>⚠️ Inconvénients</h5>
                  <ul>
                    <li>Peut négliger les dates dues</li>
                    <li>Pas optimal pour makespan</li>
                    <li>Risque de starvation</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Section Algorithmes liés */}
            <div className="info-section">
              <h4 className="section-title">
                <span className="section-icon">🔗</span>
                Algorithmes liés
              </h4>
              <div className="related-algorithms">
                <span className="algorithm-tag">EDD</span>
                <span className="algorithm-tag">Johnson</span>
                <span className="algorithm-tag">LPT</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer avec actions rapides */}
      <div className="info-footer">
        <button className="action-button primary">
          <span className="action-icon">📖</span>
          Voir la théorie
        </button>
        <button className="action-button secondary">
          <span className="action-icon">⚖️</span>
          Comparer
        </button>
      </div>
    </div>
  );
}

export default FlowshopSPTInfo;