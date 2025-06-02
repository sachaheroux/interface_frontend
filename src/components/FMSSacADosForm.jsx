import { useState } from "react";
import styles from "./FlowshopSPTForm.module.css";

export default function FMSSacADosForm() {
  const [produits, setProduits] = useState([
    { nom: "Produit 1", venteUnite: 200, coutMPUnite: 45, demandePeriode: 100, tempsFabrication: 1 },
    { nom: "Produit 2", venteUnite: 155, coutMPUnite: 35, demandePeriode: 50, tempsFabrication: 2 },
    { nom: "Produit 3", venteUnite: 300, coutMPUnite: 124, demandePeriode: 50, tempsFabrication: 4 },
    { nom: "Produit 4", venteUnite: 125, coutMPUnite: 50, demandePeriode: 75, tempsFabrication: 1 },
    { nom: "Produit 5", venteUnite: 280, coutMPUnite: 120, demandePeriode: 60, tempsFabrication: 2 },
    { nom: "Produit 6", venteUnite: 86, coutMPUnite: 34, demandePeriode: 30, tempsFabrication: 1 },
    { nom: "Produit 7", venteUnite: 93, coutMPUnite: 36, demandePeriode: 50, tempsFabrication: 1 },
    { nom: "Produit 8", venteUnite: 165, coutMPUnite: 114, demandePeriode: 600, tempsFabrication: 0.5 }
  ]);

  const [coutOp, setCoutOp] = useState("50");
  const [capaciteMax, setCapaciteMax] = useState("250");
  const [unite, setUnite] = useState("heures");
  const [result, setResult] = useState(null);
  const [chartUrl, setChartUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_URL = "/api";

  const addProduit = () => {
    setProduits([...produits, { 
      nom: `Produit ${produits.length + 1}`, 
      venteUnite: 100, 
      coutMPUnite: 30, 
      demandePeriode: 50, 
      tempsFabrication: 1 
    }]);
  };

  const removeProduit = () => {
    if (produits.length > 1) {
      setProduits(produits.slice(0, -1));
    }
  };

  const handleProduitChange = (index, field, value) => {
    const newProduits = [...produits];
    if (field === 'nom') {
      newProduits[index][field] = value;
    } else {
      newProduits[index][field] = parseFloat(value) || 0;
    }
    setProduits(newProduits);
  };

  const handleSubmit = () => {
    setError(null);
    setChartUrl(null);
    setIsLoading(true);

    try {
      // Validation
      const coutOpValue = parseFloat(coutOp.replace(",", "."));
      const capaciteMaxValue = parseInt(capaciteMax);

      if (isNaN(coutOpValue) || coutOpValue < 0) {
        setError("Le coût d'opération doit être un nombre positif.");
        setIsLoading(false);
        return;
      }

      if (isNaN(capaciteMaxValue) || capaciteMaxValue <= 0) {
        setError("La capacité maximale doit être un nombre entier positif.");
        setIsLoading(false);
        return;
      }

      // Validation des produits
      for (let i = 0; i < produits.length; i++) {
        const p = produits[i];
        if (p.venteUnite <= 0 || p.coutMPUnite < 0 || p.demandePeriode <= 0 || p.tempsFabrication <= 0) {
          setError(`Produit ${i + 1}: Toutes les valeurs doivent être positives.`);
          setIsLoading(false);
          return;
        }
      }

      const requestData = {
        vente_unite: produits.map(p => p.venteUnite),
        cout_mp_unite: produits.map(p => p.coutMPUnite),
        demande_periode: produits.map(p => p.demandePeriode),
        temps_fabrication_unite: produits.map(p => p.tempsFabrication),
        cout_op: coutOpValue,
        capacite_max: capaciteMaxValue,
        noms_produits: produits.map(p => p.nom),
        unite: unite
      };

      console.log("Sending data to API:", JSON.stringify(requestData, null, 2));

      // Appel API pour les résultats
      fetch(`${API_URL}/fms/sac_a_dos`, {
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
          return fetch(`${API_URL}/fms/sac_a_dos/chart`, {
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
    link.download = "fms_sac_a_dos.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const calculateProfitUnitaire = (produit) => {
    return produit.venteUnite - (parseFloat(coutOp.replace(",", ".")) * produit.tempsFabrication + produit.coutMPUnite);
  };

  const calculateTempsRequis = (produit) => {
    return produit.tempsFabrication * produit.demandePeriode;
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>FMS - Algorithme du Sac à Dos</h2>
      
      <div className={styles.unitSelector}>
        <label>Unité de temps :</label>
        <select value={unite} onChange={(e) => setUnite(e.target.value)} className={styles.select}>
          <option value="heures">heures</option>
          <option value="minutes">minutes</option>
          <option value="jours">jours</option>
        </select>
      </div>

      {/* Paramètres globaux */}
      <div className={styles.taskRow}>
        <label><strong>Coût d'opération ($/heure) :</strong></label>
        <input
          type="text"
          inputMode="decimal"
          value={coutOp}
          onChange={e => setCoutOp(e.target.value)}
          className={styles.input}
          placeholder="50"
        />
      </div>

      <div className={styles.taskRow}>
        <label><strong>Capacité maximale ({unite}) :</strong></label>
        <input
          type="number"
          min="1"
          value={capaciteMax}
          onChange={e => setCapaciteMax(e.target.value)}
          className={styles.input}
          placeholder="250"
        />
      </div>

      <div className={styles.buttonGroup}>
        <button className={styles.button} onClick={addProduit}>+ Ajouter un produit</button>
        <button className={styles.button} onClick={removeProduit}>- Supprimer un produit</button>
      </div>

      {/* Configuration des produits */}
      <div className={styles.tasksContainer}>
        <h4 className={styles.subtitle}>Configuration des produits</h4>
        
        {produits.map((produit, index) => (
          <div key={index} className={styles.jobBlock}>
            <h4>Produit {index + 1}</h4>
            
            <div className={styles.taskRow}>
              <label>Nom du produit :</label>
              <input
                type="text"
                value={produit.nom}
                onChange={(e) => handleProduitChange(index, "nom", e.target.value)}
                className={styles.input}
              />
            </div>

            <div className={styles.taskRow}>
              <label>Prix de vente ($/unité) :</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={produit.venteUnite}
                onChange={(e) => handleProduitChange(index, "venteUnite", e.target.value)}
                className={styles.input}
              />
            </div>

            <div className={styles.taskRow}>
              <label>Coût matière première ($/unité) :</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={produit.coutMPUnite}
                onChange={(e) => handleProduitChange(index, "coutMPUnite", e.target.value)}
                className={styles.input}
              />
            </div>

            <div className={styles.taskRow}>
              <label>Demande (unités) :</label>
              <input
                type="number"
                min="1"
                value={produit.demandePeriode}
                onChange={(e) => handleProduitChange(index, "demandePeriode", e.target.value)}
                className={styles.input}
              />
            </div>

            <div className={styles.taskRow}>
              <label>Temps de fabrication ({unite}/unité) :</label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={produit.tempsFabrication}
                onChange={(e) => handleProduitChange(index, "tempsFabrication", e.target.value)}
                className={styles.input}
              />
            </div>

            {/* Calculs automatiques */}
            <div className={styles.helpText} style={{ 
              marginTop: "0.5rem", 
              padding: "0.5rem", 
              background: "#f0f9ff", 
              borderRadius: "0.25rem",
              fontSize: "0.85rem"
            }}>
              <strong>Profit unitaire :</strong> ${calculateProfitUnitaire(produit).toFixed(2)} | 
              <strong> Temps requis total :</strong> {calculateTempsRequis(produit).toFixed(1)} {unite} |
              <strong> Profit total potentiel :</strong> ${(calculateProfitUnitaire(produit) * produit.demandePeriode).toFixed(2)}
            </div>
          </div>
        ))}
      </div>

      <button 
        onClick={handleSubmit} 
        disabled={isLoading}
        className={styles.submitButton}
      >
        {isLoading ? "Optimisation en cours..." : "Résoudre le problème du sac à dos"}
      </button>

      {error && <div className={styles.error}>{error}</div>}

      {result && (
        <div className={styles.results}>
          <h3>Résultats de l'optimisation</h3>
          
          <div className={styles.metricsGrid}>
            <div>
              <strong>Statut :</strong> 
              <span style={{ color: result.status === 'Optimal' ? '#10b981' : '#f59e0b' }}>
                {result.status}
              </span>
            </div>
            <div>
              <strong>Profit maximal :</strong> ${result.profit_maximal}
            </div>
            <div>
              <strong>Capacité utilisée :</strong> {result.capacite_utilisee}/{result.capacite_totale} {result.unite}
            </div>
            <div>
              <strong>Utilisation :</strong> {result.utilisation_capacite}%
            </div>
            <div>
              <strong>Efficacité :</strong> {result.efficacite}%
            </div>
            <div>
              <strong>Produits sélectionnés :</strong> {result.nombre_produits_selectionnes}
            </div>
          </div>

          {/* Produits sélectionnés */}
          {result.produits_selectionnes && result.produits_selectionnes.length > 0 && (
            <div className={styles.stationsSection}>
              <h4>Produits sélectionnés pour la production :</h4>
              {result.produits_selectionnes.map((produit, index) => (
                <div key={index} className={styles.stationBlock}>
                  <strong>{produit.nom}</strong>
                  <br />
                  Profit unitaire : ${produit.profit_unitaire} | 
                  Profit total : ${produit.profit_total} | 
                  Temps requis : {produit.temps_requis} {result.unite}
                  <br />
                  <small className={styles.helpText}>
                    Demande : {produit.demande} unités | 
                    Prix vente : ${produit.prix_vente} | 
                    Coût MP : ${produit.cout_mp} | 
                    Temps fab. : {produit.temps_fabrication} {result.unite}/unité
                  </small>
                </div>
              ))}
            </div>
          )}

          {/* Produits non sélectionnés */}
          {result.produits_non_selectionnes && result.produits_non_selectionnes.length > 0 && (
            <div className={styles.stationsSection}>
              <h4>Produits non sélectionnés :</h4>
              {result.produits_non_selectionnes.map((produit, index) => (
                <div key={index} style={{ 
                  padding: "0.5rem", 
                  margin: "0.5rem 0", 
                  border: "1px solid #fecaca", 
                  borderRadius: "0.375rem", 
                  backgroundColor: "#fef2f2" 
                }}>
                  <strong>{produit.nom}</strong> - Profit unitaire : ${produit.profit_unitaire}
                  <br />
                  <small className={styles.helpText}>Raison : {produit.raison_exclusion}</small>
                </div>
              ))}
            </div>
          )}

          {chartUrl && (
            <div className={styles.ganttContainer}>
              <h4>Analyse graphique du sac à dos</h4>
              <img 
                src={chartUrl} 
                alt="Graphiques FMS Sac à Dos" 
                className={styles.gantt}
              />
              <button onClick={handleDownloadChart} className={styles.downloadButton}>
                Télécharger les graphiques
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 