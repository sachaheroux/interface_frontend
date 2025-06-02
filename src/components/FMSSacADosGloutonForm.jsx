import { useState } from "react";
import styles from "./FlowshopSPTForm.module.css";

export default function FMSSacADosGloutonForm() {
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
      fetch(`${API_URL}/fms/sac_a_dos_glouton`, {
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
          return fetch(`${API_URL}/fms/sac_a_dos_glouton/chart`, {
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
    link.download = "fms_sac_a_dos_glouton.png";
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
      <h2 className={styles.title}>FMS - Algorithme Glouton</h2>
      
      <div className={styles.unitSelector}>
        <label>Unité de temps :</label>
        <select value={unite} onChange={(e) => setUnite(e.target.value)} className={styles.select}>
          <option value="heures">heures</option>
          <option value="minutes">minutes</option>
          <option value="jours">jours</option>
        </select>
      </div>

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
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Nom</th>
                <th>Prix vente ($/unité)</th>
                <th>Coût MP ($/unité)</th>
                <th>Demande (unités)</th>
                <th>Temps fab. ({unite}/unité)</th>
                <th>Profit unitaire ($)</th>
                <th>Temps requis ({unite})</th>
              </tr>
            </thead>
            <tbody>
              {produits.map((produit, index) => (
                <tr key={index}>
                  <td>
                    <input
                      type="text"
                      value={produit.nom}
                      onChange={e => handleProduitChange(index, 'nom', e.target.value)}
                      className={styles.tableInput}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      step="0.01"
                      value={produit.venteUnite}
                      onChange={e => handleProduitChange(index, 'venteUnite', e.target.value)}
                      className={styles.tableInput}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      step="0.01"
                      value={produit.coutMPUnite}
                      onChange={e => handleProduitChange(index, 'coutMPUnite', e.target.value)}
                      className={styles.tableInput}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      min="1"
                      value={produit.demandePeriode}
                      onChange={e => handleProduitChange(index, 'demandePeriode', e.target.value)}
                      className={styles.tableInput}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      step="0.1"
                      min="0.1"
                      value={produit.tempsFabrication}
                      onChange={e => handleProduitChange(index, 'tempsFabrication', e.target.value)}
                      className={styles.tableInput}
                    />
                  </td>
                  <td className={styles.calculatedValue}>
                    {calculateProfitUnitaire(produit).toFixed(2)}
                  </td>
                  <td className={styles.calculatedValue}>
                    {calculateTempsRequis(produit).toFixed(1)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className={styles.submitContainer}>
        <button className={styles.submitButton} onClick={handleSubmit} disabled={isLoading}>
          {isLoading ? "Calcul en cours..." : "Lancer l'algorithme glouton"}
        </button>
      </div>

      {error && (
        <div className={styles.error}>
          {error}
        </div>
      )}

      {result && (
        <div className={styles.resultsContainer}>
          <h3 className={styles.resultsTitle}>Résultats de l'algorithme glouton</h3>
          
          <div className={styles.metricsGrid}>
            <div className={styles.metricCard}>
              <h4>Performance</h4>
              <p><strong>Statut :</strong> {result.status}</p>
              <p><strong>Méthode :</strong> {result.methode}</p>
              <p><strong>Critère :</strong> {result.critere_selection}</p>
              <p><strong>Profit maximal :</strong> ${result.profit_maximal}</p>
              <p><strong>Efficacité :</strong> {result.efficacite}%</p>
            </div>

            <div className={styles.metricCard}>
              <h4>Utilisation des ressources</h4>
              <p><strong>Capacité utilisée :</strong> {result.capacite_utilisee}/{result.capacite_totale} {result.unite}</p>
              <p><strong>Utilisation :</strong> {result.utilisation_capacite}%</p>
              <p><strong>Produits sélectionnés :</strong> {result.nombre_produits_selectionnes}</p>
              <p><strong>Coût opération :</strong> ${result.cout_operation_horaire}/{result.unite}</p>
            </div>
          </div>

          {result.produits_selectionnes && result.produits_selectionnes.length > 0 && (
            <div className={styles.selectedProductsContainer}>
              <h4>Produits sélectionnés ({result.produits_selectionnes.length})</h4>
              <div className={styles.tableContainer}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Produit</th>
                      <th>Profit total ($)</th>
                      <th>Désirabilité ($/h)</th>
                      <th>Temps requis ({result.unite})</th>
                      <th>Demande</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.produits_selectionnes.map((produit, index) => (
                      <tr key={index}>
                        <td><strong>{produit.nom}</strong></td>
                        <td>{produit.profit_total}</td>
                        <td>{produit.desirabilite}</td>
                        <td>{produit.temps_requis}</td>
                        <td>{produit.demande}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {result.produits_non_selectionnes && result.produits_non_selectionnes.length > 0 && (
            <div className={styles.rejectedProductsContainer}>
              <h4>Produits non sélectionnés ({result.produits_non_selectionnes.length})</h4>
              <div className={styles.tableContainer}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Produit</th>
                      <th>Raison d'exclusion</th>
                      <th>Désirabilité ($/h)</th>
                      <th>Profit total ($)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.produits_non_selectionnes.map((produit, index) => (
                      <tr key={index}>
                        <td><strong>{produit.nom}</strong></td>
                        <td>{produit.raison_exclusion}</td>
                        <td>{produit.desirabilite}</td>
                        <td>{produit.profit_total}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {chartUrl && (
            <div className={styles.chartContainer}>
              <div className={styles.chartHeader}>
                <h4>Analyse graphique</h4>
                <button onClick={handleDownloadChart} className={styles.downloadButton}>
                  Télécharger le graphique
                </button>
              </div>
              <img src={chartUrl} alt="Analyse FMS Glouton" className={styles.chart} />
            </div>
          )}
        </div>
      )}
    </div>
  );
} 