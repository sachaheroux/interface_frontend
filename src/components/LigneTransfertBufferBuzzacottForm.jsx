import { useState } from "react";
import styles from "./FlowshopSPTForm.module.css";

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

  // États pour les résultats
  const [result, setResult] = useState(null);
  const [chartUrl, setChartUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_URL = "/api";

  const handleSubmit = () => {
    setError(null);
    setChartUrl(null);
    setIsLoading(true);

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
        setError("Tous les champs doivent être des nombres valides.");
        setIsLoading(false);
        return;
      }

      if (alpha1Value <= 0 || alpha2Value <= 0 || bInv1Value <= 0 || bInv2Value <= 0 ||
          bufferSizeValue < 0 || productionValue <= 0 || joursAnneeValue <= 0 || profitUnitaireValue <= 0) {
        setError("Tous les paramètres doivent être positifs (buffer peut être 0).");
        setIsLoading(false);
        return;
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

      console.log("Sending data to API:", JSON.stringify(requestData, null, 2));

      // Appel API pour les résultats
      fetch(`${API_URL}/ligne_transfert/buffer_buzzacott`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData)
      })
        .then(res => {
          console.log("Response status:", res.status);
          if (!res.ok) {
            return res.text().then(text => {
              console.error("Error response:", text);
              throw new Error(`Erreur API: ${res.status} - ${text}`);
            });
          }
          return res.json();
        })
        .then(data => {
          setResult(data);
          // Récupérer le graphique
          return fetch(`${API_URL}/ligne_transfert/buffer_buzzacott/chart`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestData)
          });
        })
        .then(res => {
          if (!res.ok) throw new Error("Erreur Graphique API");
          return res.blob();
        })
        .then(blob => {
          const url = URL.createObjectURL(blob);
          setChartUrl(url);
        })
        .catch(err => setError(err.message))
        .finally(() => setIsLoading(false));
    } catch (e) {
      setError("Erreur dans les données saisies.");
      setIsLoading(false);
    }
  };

  const handleDownloadChart = () => {
    if (!chartUrl) return;
    const link = document.createElement("a");
    link.href = chartUrl;
    link.download = "buffer_buzzacott_analysis.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Ligne de Transfert - Buffer Buzzacott</h2>
      
      {/* Paramètres de panne */}
      <div className={styles.tasksContainer}>
        <h4 className={styles.subtitle}>Paramètres de Panne des Stations</h4>
        
        <div className={styles.taskRow}>
          <label><strong>Taux de panne Station 1 (α₁) :</strong></label>
          <input
            type="text"
            inputMode="decimal"
            value={alpha1}
            onChange={e => setAlpha1(e.target.value)}
            className={styles.input}
            placeholder="0.0003623188406"
          />
          <small className={styles.helpText}>Probabilité de panne par cycle</small>
        </div>

        <div className={styles.taskRow}>
          <label><strong>Taux de panne Station 2 (α₂) :</strong></label>
          <input
            type="text"
            inputMode="decimal"
            value={alpha2}
            onChange={e => setAlpha2(e.target.value)}
            className={styles.input}
            placeholder="0.0002536231884"
          />
          <small className={styles.helpText}>Probabilité de panne par cycle</small>
        </div>
      </div>

      {/* Paramètres de réparation */}
      <div className={styles.tasksContainer}>
        <h4 className={styles.subtitle}>Paramètres de Réparation</h4>
        
        <div className={styles.taskRow}>
          <label><strong>Temps de réparation Station 1 (b₁⁻¹) :</strong></label>
          <input
            type="text"
            inputMode="decimal"
            value={bInv1}
            onChange={e => setBInv1(e.target.value)}
            className={styles.input}
            placeholder="1605.8"
          />
          <small className={styles.helpText}>Nombre de cycles avant réparation</small>
        </div>

        <div className={styles.taskRow}>
          <label><strong>Temps de réparation Station 2 (b₂⁻¹) :</strong></label>
          <input
            type="text"
            inputMode="decimal"
            value={bInv2}
            onChange={e => setBInv2(e.target.value)}
            className={styles.input}
            placeholder="30"
          />
          <small className={styles.helpText}>Nombre de cycles avant réparation</small>
        </div>
      </div>

      {/* Paramètres de production */}
      <div className={styles.tasksContainer}>
        <h4 className={styles.subtitle}>Paramètres de Production</h4>
        
        <div className={styles.taskRow}>
          <label><strong>Taille du buffer (Z) :</strong></label>
          <input
            type="number"
            min="0"
            value={bufferSize}
            onChange={e => setBufferSize(e.target.value)}
            className={styles.input}
            placeholder="320"
          />
          <small className={styles.helpText}>Nombre de pièces stockables</small>
        </div>

        <div className={styles.taskRow}>
          <label><strong>Production nominale :</strong></label>
          <input
            type="number"
            min="1"
            value={production}
            onChange={e => setProduction(e.target.value)}
            className={styles.input}
            placeholder="1100"
          />
          <small className={styles.helpText">Pièces par jour</small>
        </div>

        <div className={styles.taskRow}>
          <label><strong>Jours travaillés par année :</strong></label>
          <input
            type="number"
            min="1"
            max="365"
            value={joursAnnee}
            onChange={e => setJoursAnnee(e.target.value)}
            className={styles.input}
            placeholder="250"
          />
          <small className={styles.helpText">Jours ouvrés annuels</small>
        </div>

        <div className={styles.taskRow}>
          <label><strong>Profit unitaire :</strong></label>
          <input
            type="text"
            inputMode="decimal"
            value={profitUnitaire}
            onChange={e => setProfitUnitaire(e.target.value)}
            className={styles.input}
            placeholder="20"
          />
          <small className={styles.helpText}>Profit par pièce (€ ou $)</small>
        </div>
      </div>

      <button 
        onClick={handleSubmit} 
        disabled={isLoading}
        className={styles.submitButton}
      >
        {isLoading ? "Calcul en cours..." : "Analyser l'efficacité du buffer"}
      </button>

      {error && <div className={styles.error}>{error}</div>}

      {result && (
        <div className={styles.results}>
          <h3>Résultats de l'analyse Buffer Buzzacott</h3>
          
          <div className={styles.metricsGrid}>
            <div>
              <strong>Efficacité sans buffer E(0) :</strong> {result.E_0?.toFixed(10)}
            </div>
            <div>
              <strong>Efficacité avec buffer E({result.buffer_size}) :</strong> {result.E_Z?.toFixed(10)}
            </div>
            <div>
              <strong>Production actuelle :</strong> {result.production_sans_buffer?.toFixed(2)} pièces/jour
            </div>
            <div>
              <strong>Production avec buffer :</strong> {result.production_avec_buffer?.toFixed(2)} pièces/jour
            </div>
            <div>
              <strong>Gain journalier :</strong> +{result.gain_journalier?.toFixed(2)} pièces/jour
            </div>
            <div>
              <strong>Gain annuel :</strong> +{result.gain_annuel?.toFixed(2)} pièces/an
            </div>
          </div>

          <div className={styles.metricsGrid}>
            <div>
              <strong>Paramètres calculés :</strong>
              <br />x₁ = {result.x1?.toFixed(6)}<br />
              x₂ = {result.x2?.toFixed(6)}<br />
              s = {result.s?.toFixed(6)}<br />
              r = {result.r?.toFixed(6)}
            </div>
            <div>
              <strong>Retour sur investissement :</strong>
              <br /><span style={{color: "#059669", fontSize: "1.2rem", fontWeight: "bold"}}>
                {result.profit_annuel_supplementaire?.toFixed(2)} {result.devise || '€'}/an
              </span>
            </div>
          </div>

          {chartUrl && (
            <div className={styles.ganttContainer}>
              <h4>Graphique d'analyse du buffer</h4>
              <img 
                src={chartUrl} 
                alt="Graphique d'analyse du buffer Buzzacott" 
                className={styles.gantt}
              />
              <button onClick={handleDownloadChart} className={styles.downloadButton}>
                Télécharger le graphique
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 