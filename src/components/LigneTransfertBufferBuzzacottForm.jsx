import React, { useState } from "react";
import styles from "./LigneTransfertBufferBuzzacottForm.module.css";

export default function LigneTransfertBufferBuzzacottForm() {
  // Paramètres de panne et réparation
  const [alpha1, setAlpha1] = useState("0.0003623188406");
  const [alpha2, setAlpha2] = useState("0.0002536231884");
  const [bInv1, setBInv1] = useState("1605.8");
  const [bInv2, setBInv2] = useState("30");

  // Paramètres de buffer et production
  const [bufferSize, setBufferSize] = useState("320");
  const [production, setProduction] = useState("1100");
  const [joursAnnee, setJoursAnnee] = useState("250");
  const [profitUnitaire, setProfitUnitaire] = useState("20");
  const [timeUnit, setTimeUnit] = useState("cycles");

  // États pour les résultats
  const [result, setResult] = useState(null);
  const [chartUrl, setChartUrl] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState("");

  const API_URL = "https://interface-backend-1jgi.onrender.com";

  const calculateOptimization = async () => {
    setError("");
    setChartUrl(null);
    setIsCalculating(true);

    try {
      // Validation des données
      const alpha1Value = parseFloat(alpha1);
      const alpha2Value = parseFloat(alpha2);
      const bInv1Value = parseFloat(bInv1);
      const bInv2Value = parseFloat(bInv2);
      const bufferSizeValue = parseInt(bufferSize);
      const productionValue = parseFloat(production);
      const joursAnneeValue = parseInt(joursAnnee);
      const profitUnitaireValue = parseFloat(profitUnitaire);

      if (isNaN(alpha1Value) || isNaN(alpha2Value) || isNaN(bInv1Value) || isNaN(bInv2Value) ||
          isNaN(bufferSizeValue) || isNaN(productionValue) || isNaN(joursAnneeValue) || isNaN(profitUnitaireValue)) {
        throw new Error("Tous les champs doivent être des nombres valides.");
      }

      if (alpha1Value <= 0 || alpha2Value <= 0 || bInv1Value <= 0 || bInv2Value <= 0 ||
          bufferSizeValue < 0 || productionValue <= 0 || joursAnneeValue <= 0 || profitUnitaireValue <= 0) {
        throw new Error("Tous les paramètres doivent être positifs (buffer peut être 0).");
      }

      const requestData = {
        alpha1: alpha1Value,
        alpha2: alpha2Value,
        b_inv_1: bInv1Value,
        b_inv_2: bInv2Value,
        buffer_size: bufferSizeValue,
        production: productionValue,
        jours_annee: joursAnneeValue,
        profit_unitaire: profitUnitaireValue
      };

      console.log("Données envoyées:", requestData);

      // Appel API pour les résultats
      const response = await fetch(`${API_URL}/ligne_transfert/buffer_buzzacott`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
        const chartResponse = await fetch(`${API_URL}/ligne_transfert/buffer_buzzacott/chart`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
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
      const link = document.createElement("a");
      link.href = chartUrl;
      link.download = "buffer_buzzacott_analysis.png";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const resetForm = () => {
    setAlpha1("0.0003623188406");
    setAlpha2("0.0002536231884");
    setBInv1("1605.8");
    setBInv2("30");
    setBufferSize("320");
    setProduction("1100");
    setJoursAnnee("250");
    setProfitUnitaire("20");
    setTimeUnit("cycles");
    setResult(null);
    setChartUrl(null);
    setError("");
  };

  const loadExample = (exampleType) => {
    switch(exampleType) {
      case 'automotive':
        setAlpha1("0.0001");
        setAlpha2("0.00015");
        setBInv1("2000");
        setBInv2("1500");
        setBufferSize("500");
        setProduction("1500");
        setJoursAnnee("250");
        setProfitUnitaire("25");
        break;
      case 'electronics':
        setAlpha1("0.0005");
        setAlpha2("0.0003");
        setBInv1("800");
        setBInv2("1200");
        setBufferSize("200");
        setProduction("800");
        setJoursAnnee("260");
        setProfitUnitaire("15");
        break;
      case 'textile':
        setAlpha1("0.0002");
        setAlpha2("0.0004");
        setBInv1("1200");
        setBInv2("900");
        setBufferSize("300");
        setProduction("2000");
        setJoursAnnee("240");
        setProfitUnitaire("8");
        break;
    }
    setResult(null);
    setChartUrl(null);
    setError("");
  };

  return (
    <div className="algorithmContent">
      <div className={styles.algorithmContainer}>
        {/* Header */}
        <div className={styles.header}>
          <h1 className={styles.title}>Ligne de transfert - Analyse Buffer Buzzacott</h1>
          <p className={styles.subtitle}>
            Optimisation du dimensionnement de buffer inter-stations selon le modèle de Buzzacott
          </p>
        </div>

        {/* Configuration principale */}
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
                <option value="cycles">Cycles</option>
                <option value="minutes">Minutes</option>
                <option value="heures">Heures</option>
              </select>
            </div>
            
            <div className={styles.actionButtons}>
              <button className={styles.exampleButton} onClick={() => loadExample('automotive')} title="Exemple industrie automobile">
                🚗 Automobile
              </button>
              <button className={styles.exampleButton} onClick={() => loadExample('electronics')} title="Exemple industrie électronique">
                🔌 Électronique
              </button>
              <button className={styles.exampleButton} onClick={() => loadExample('textile')} title="Exemple industrie textile">
                🧵 Textile
              </button>
              <button className={styles.resetButton} onClick={resetForm} title="Réinitialiser tous les paramètres">
                ↻ Réinitialiser
              </button>
            </div>
          </div>
        </div>

        {/* Paramètres organisés en grille */}
        <div className={styles.parametersGrid}>
          {/* Paramètres de panne */}
          <div className={styles.parameterGroup}>
            <h3 className={styles.parameterGroupTitle}>⚡ Paramètres de panne</h3>
            
            <div className={styles.parameterRow}>
              <label className={styles.parameterLabel}>Taux de panne Station 1 (α₁)</label>
              <input
                type="text"
                inputMode="decimal"
                value={alpha1}
                onChange={(e) => setAlpha1(e.target.value)}
                className={styles.parameterInput}
                placeholder="0.0003623188406"
              />
              <span className={styles.helpText}>Probabilité de panne par {timeUnit}</span>
            </div>

            <div className={styles.parameterRow}>
              <label className={styles.parameterLabel}>Taux de panne Station 2 (α₂)</label>
              <input
                type="text"
                inputMode="decimal"
                value={alpha2}
                onChange={(e) => setAlpha2(e.target.value)}
                className={styles.parameterInput}
                placeholder="0.0002536231884"
              />
              <span className={styles.helpText}>Probabilité de panne par {timeUnit}</span>
            </div>
          </div>

          {/* Paramètres de réparation */}
          <div className={styles.parameterGroup}>
            <h3 className={styles.parameterGroupTitle}>🔧 Paramètres de réparation</h3>
            
            <div className={styles.parameterRow}>
              <label className={styles.parameterLabel}>Temps de réparation Station 1 (b₁⁻¹)</label>
              <input
                type="text"
                inputMode="decimal"
                value={bInv1}
                onChange={(e) => setBInv1(e.target.value)}
                className={styles.parameterInput}
                placeholder="1605.8"
              />
              <span className={styles.helpText}>Nombre de {timeUnit} avant réparation</span>
            </div>

            <div className={styles.parameterRow}>
              <label className={styles.parameterLabel}>Temps de réparation Station 2 (b₂⁻¹)</label>
              <input
                type="text"
                inputMode="decimal"
                value={bInv2}
                onChange={(e) => setBInv2(e.target.value)}
                className={styles.parameterInput}
                placeholder="30"
              />
              <span className={styles.helpText}>Nombre de {timeUnit} avant réparation</span>
            </div>
          </div>

          {/* Paramètres de production */}
          <div className={styles.parameterGroup}>
            <h3 className={styles.parameterGroupTitle}>🏭 Paramètres de production</h3>
            
            <div className={styles.parameterRow}>
              <label className={styles.parameterLabel}>Taille du buffer (Z)</label>
              <input
                type="number"
                min="0"
                value={bufferSize}
                onChange={(e) => setBufferSize(e.target.value)}
                className={styles.parameterInput}
                placeholder="320"
              />
              <span className={styles.helpText}>Nombre de pièces stockables</span>
            </div>

            <div className={styles.parameterRow}>
              <label className={styles.parameterLabel}>Production nominale</label>
              <input
                type="number"
                min="1"
                value={production}
                onChange={(e) => setProduction(e.target.value)}
                className={styles.parameterInput}
                placeholder="1100"
              />
              <span className={styles.helpText}>Pièces par jour</span>
            </div>
          </div>

          {/* Paramètres économiques */}
          <div className={styles.parameterGroup}>
            <h3 className={styles.parameterGroupTitle}>💰 Paramètres économiques</h3>
            
            <div className={styles.parameterRow}>
              <label className={styles.parameterLabel}>Jours travaillés par année</label>
              <input
                type="number"
                min="1"
                max="365"
                value={joursAnnee}
                onChange={(e) => setJoursAnnee(e.target.value)}
                className={styles.parameterInput}
                placeholder="250"
              />
              <span className={styles.helpText}>Jours ouvrés annuels</span>
            </div>

            <div className={styles.parameterRow}>
              <label className={styles.parameterLabel}>Profit unitaire</label>
              <input
                type="text"
                inputMode="decimal"
                value={profitUnitaire}
                onChange={(e) => setProfitUnitaire(e.target.value)}
                className={styles.parameterInput}
                placeholder="20"
              />
              <span className={styles.helpText}>Profit par pièce (€ ou $)</span>
            </div>
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
          {isCalculating ? "🔄 Analyse en cours..." : "📊 Analyser l'efficacité du buffer"}
        </button>

        {/* Résultats */}
        {result && (
          <div className={`${styles.section} ${styles.resultsSection}`}>
            <h2 className={styles.resultsTitle}>📈 Résultats de l'analyse Buffer Buzzacott</h2>

            {/* Métriques principales */}
            <div className={styles.metricsGrid}>
              <div className={styles.metric}>
                <div className={styles.metricValue}>
                  {result.E_0?.toFixed(6)}
                </div>
                <div className={styles.metricLabel}>
                  Efficacité sans buffer E(0)
                </div>
              </div>
              
              <div className={styles.metric}>
                <div className={styles.metricValue}>
                  {result.E_Z?.toFixed(6)}
                </div>
                <div className={styles.metricLabel}>
                  Efficacité avec buffer E({result.buffer_size})
                </div>
              </div>
              
              <div className={styles.metric}>
                <div className={styles.metricValue}>
                  {result.production_sans_buffer?.toFixed(0)}
                </div>
                <div className={styles.metricLabel}>
                  Production actuelle (pièces/jour)
                </div>
              </div>

              <div className={styles.metric}>
                <div className={styles.metricValue}>
                  {result.production_avec_buffer?.toFixed(0)}
                </div>
                <div className={styles.metricLabel}>
                  Production avec buffer (pièces/jour)
                </div>
              </div>

              <div className={styles.metric}>
                <div className={styles.metricValue}>
                  +{result.gain_journalier?.toFixed(0)}
                </div>
                <div className={styles.metricLabel}>
                  Gain journalier (pièces/jour)
                </div>
              </div>

              <div className={styles.metric}>
                <div className={styles.metricValue}>
                  +{result.gain_annuel?.toFixed(0)}
                </div>
                <div className={styles.metricLabel}>
                  Gain annuel (pièces/an)
                </div>
              </div>
            </div>

            {/* Détails techniques */}
            <div className={styles.technicalDetails}>
              <h4>🔬 Paramètres calculés</h4>
              <div className={styles.technicalGrid}>
                <div className={styles.technicalItem}>
                  <strong>x₁:</strong> {result.x1?.toFixed(6)}
                </div>
                <div className={styles.technicalItem}>
                  <strong>x₂:</strong> {result.x2?.toFixed(6)}
                </div>
                <div className={styles.technicalItem}>
                  <strong>s:</strong> {result.s?.toFixed(6)}
                </div>
                <div className={styles.technicalItem}>
                  <strong>r:</strong> {result.r?.toFixed(6)}
                </div>
              </div>
            </div>

            {/* ROI mis en avant */}
            <div className={styles.roiHighlight}>
              💰 Retour sur investissement: {result.profit_annuel_supplementaire?.toFixed(0)} {result.devise || '€'}/an
            </div>
          </div>
        )}

        {/* Graphiques */}
        {chartUrl && (
          <div className={`${styles.section} ${styles.chartSection}`}>
            <div className={styles.chartHeader}>
              <h3>📊 Graphique d'analyse du buffer</h3>
            </div>
            <div className={styles.chartContainer}>
              <img
                src={chartUrl}
                alt="Graphique d'analyse du buffer Buzzacott"
                className={styles.chart}
              />
              <button
                onClick={downloadChart}
                className={styles.downloadButton}
                type="button"
              >
                📥 Télécharger le graphique
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 