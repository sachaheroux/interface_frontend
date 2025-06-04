import React, { useState } from "react";
import styles from "./FMSSacADosForm.module.css";
import config from "../config.js";

export default function FMSSacADosPLForm() {
  const [capaciteMax, setCapaciteMax] = useState("100");
  const [coutOp, setCoutOp] = useState("25");
  const [unite, setUnite] = useState("heures");
  const [nbProduits, setNbProduits] = useState("4");
  const [devise, setDevise] = useState("CAD");
  
  const [produits, setProduits] = useState([
    { 
      nom: "Produit A", 
      venteUnite: "120", 
      coutMpUnite: "30", 
      demandePeriode: "10", 
      tempsFabricationUnite: "2.5" 
    },
    { 
      nom: "Produit B", 
      venteUnite: "80", 
      coutMpUnite: "20", 
      demandePeriode: "15", 
      tempsFabricationUnite: "1.8" 
    },
    { 
      nom: "Produit C", 
      venteUnite: "200", 
      coutMpUnite: "50", 
      demandePeriode: "8", 
      tempsFabricationUnite: "4.0" 
    },
    { 
      nom: "Produit D", 
      venteUnite: "150", 
      coutMpUnite: "40", 
      demandePeriode: "12", 
      tempsFabricationUnite: "3.2" 
    }
  ]);
  
  const [resultats, setResultats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [erreur, setErreur] = useState("");
  const [graphique, setGraphique] = useState(null);

  const devises = {
    "CAD": { symbole: "$", nom: "Dollar Canadien" },
    "USD": { symbole: "$", nom: "Dollar Américain" },
    "EUR": { symbole: "€", nom: "Euro" },
    "GBP": { symbole: "£", nom: "Livre Sterling" },
    "JPY": { symbole: "¥", nom: "Yen Japonais" }
  };

  const ajusterNombreProduits = (nouveauNombre) => {
    const nb = parseInt(nouveauNombre);
    if (isNaN(nb) || nb < 1) return;
    
    setNbProduits(nouveauNombre);
    
    const nouveauxProduits = [...produits];
    
    if (nb > produits.length) {
      for (let i = produits.length; i < nb; i++) {
        nouveauxProduits.push({
          nom: `Produit ${String.fromCharCode(65 + i)}`,
          venteUnite: "100",
          coutMpUnite: "25",
          demandePeriode: "10",
          tempsFabricationUnite: "2.0"
        });
      }
    } else {
      nouveauxProduits.splice(nb);
    }
    
    setProduits(nouveauxProduits);
  };

  const modifierProduit = (index, champ, valeur) => {
    const nouveauxProduits = [...produits];
    nouveauxProduits[index][champ] = valeur;
    setProduits(nouveauxProduits);
  };

  const calculerMetriques = () => {
    let profitUnitaireTotal = 0;
    let tempsRequis = 0;
    let chiffreAffaires = 0;

    produits.forEach(produit => {
      const vente = parseFloat(produit.venteUnite || 0);
      const coutMp = parseFloat(produit.coutMpUnite || 0);
      const demande = parseInt(produit.demandePeriode || 0);
      const tempsFab = parseFloat(produit.tempsFabricationUnite || 0);
      const coutOperation = parseFloat(coutOp || 0);

      const profitUnitaire = vente - coutMp - (coutOperation * tempsFab);
      profitUnitaireTotal += profitUnitaire * demande;
      tempsRequis += demande * tempsFab;
      chiffreAffaires += vente * demande;
    });

    return { profitUnitaireTotal, tempsRequis, chiffreAffaires };
  };

  const { profitUnitaireTotal, tempsRequis, chiffreAffaires } = calculerMetriques();

  const calculerSacADos = async () => {
    setLoading(true);
    setErreur("");
    
    try {
      // Format exact attendu par le backend
      const donnees = {
        vente_unite: produits.map(p => parseFloat(p.venteUnite)),
        cout_mp_unite: produits.map(p => parseFloat(p.coutMpUnite)),
        demande_periode: produits.map(p => parseInt(p.demandePeriode)),
        temps_fabrication_unite: produits.map(p => parseFloat(p.tempsFabricationUnite)),
        cout_op: parseFloat(coutOp),
        capacite_max: parseInt(capaciteMax),
        noms_produits: produits.map(p => p.nom),
        unite: unite
      };
      
      console.log("Données envoyées au backend:", donnees);
      
      const response = await fetch(`${config.API_URL}/fms/sac_a_dos_pl`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(donnees)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erreur HTTP ${response.status}: ${errorText}`);
      }
      
      const resultats = await response.json();
      console.log("Résultats reçus:", resultats);
      setResultats(resultats);
      
      // Récupération du graphique
      try {
        const chartResponse = await fetch(`${config.API_URL}/fms/sac_a_dos_pl/chart`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(donnees)
        });
        
        if (chartResponse.ok) {
          const chartBlob = await chartResponse.blob();
          const chartUrl = URL.createObjectURL(chartBlob);
          setGraphique(chartUrl);
        } else {
          console.warn("Impossible de charger le graphique");
        }
      } catch (chartError) {
        console.warn("Erreur lors du chargement du graphique:", chartError);
      }
    } catch (error) {
      console.error("Erreur:", error);
      setErreur(`Erreur lors du calcul: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.algorithmContainer}>
      <div className={styles.header}>
        <h1 className={styles.title}>FMS - Sac à Dos avec Programmation Linéaire</h1>
        <p className={styles.subtitle}>
          Optimisation de production par solveur PuLP/CBC (solution optimale)
        </p>
      </div>

      {erreur && (
        <div className={styles.errorSection}>
          <div className={styles.errorBox}>
            <span className={styles.errorIcon}>⚠️</span>
            <span className={styles.errorText}>{erreur}</span>
          </div>
        </div>
      )}

      <div className={`${styles.section} ${styles.configSection}`}>
        <h2 className={styles.sectionTitle}>Paramètres de Production</h2>
        
        <div className={styles.configRow}>
          <div className={styles.inputGroup}>
            <label>Unité de temps</label>
            <select
              value={unite}
              onChange={(e) => setUnite(e.target.value)}
              className={styles.select}
            >
              <option value="heures">Heures</option>
              <option value="minutes">Minutes</option>
              <option value="jours">Jours</option>
            </select>
          </div>
        </div>
        
        <div className={styles.configRow}>
          <div className={styles.inputGroup}>
            <label>Capacité maximale<br/><span style={{fontSize: "0.8em", color: "#6b7280"}}>({unite})</span></label>
            <input
              type="number"
              value={capaciteMax}
              onChange={(e) => setCapaciteMax(e.target.value)}
              className={styles.input}
              min="1"
              step="1"
            />
          </div>
          
          <div className={styles.inputGroup}>
            <label>Coût d'opération<br/><span style={{fontSize: "0.8em", color: "#6b7280"}}>({devises[devise].symbole}/{unite})</span></label>
            <input
              type="number"
              value={coutOp}
              onChange={(e) => setCoutOp(e.target.value)}
              className={styles.input}
              min="0"
              step="0.01"
            />
          </div>
          
          <div className={styles.inputGroup}>
            <label>Nombre de produits</label>
            <input
              type="number"
              value={nbProduits}
              onChange={(e) => ajusterNombreProduits(e.target.value)}
              className={styles.input}
              min="1"
              max="20"
            />
          </div>
          
          <div className={styles.inputGroup}>
            <label>Devise</label>
            <select
              value={devise}
              onChange={(e) => setDevise(e.target.value)}
              className={styles.select}
            >
              {Object.entries(devises).map(([code, info]) => (
                <option key={code} value={code}>
                  {info.symbole} {info.nom}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Configuration des Produits</h2>
        
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Nom du Produit</th>
                <th>Prix de Vente<br/>({devises[devise].symbole}/unité)</th>
                <th>Coût Matière Première<br/>({devises[devise].symbole}/unité)</th>
                <th>Demande<br/>(unités/période)</th>
                <th>Temps de Fabrication<br/>(heures/unité)</th>
                <th>Profit Unitaire<br/>({devises[devise].symbole})</th>
              </tr>
            </thead>
            <tbody>
              {produits.map((produit, index) => {
                const vente = parseFloat(produit.venteUnite || 0);
                const coutMp = parseFloat(produit.coutMpUnite || 0);
                const tempsFab = parseFloat(produit.tempsFabricationUnite || 0);
                const coutOperation = parseFloat(coutOp || 0);
                const profitUnitaire = vente - coutMp - (coutOperation * tempsFab);
                
                return (
                  <tr key={index}>
                    <td>
                      <input
                        type="text"
                        value={produit.nom}
                        onChange={(e) => modifierProduit(index, "nom", e.target.value)}
                        className={styles.input}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={produit.venteUnite}
                        onChange={(e) => modifierProduit(index, "venteUnite", e.target.value)}
                        className={styles.input}
                        min="0"
                        step="0.01"
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={produit.coutMpUnite}
                        onChange={(e) => modifierProduit(index, "coutMpUnite", e.target.value)}
                        className={styles.input}
                        min="0"
                        step="0.01"
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={produit.demandePeriode}
                        onChange={(e) => modifierProduit(index, "demandePeriode", e.target.value)}
                        className={styles.input}
                        min="1"
                        step="1"
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={produit.tempsFabricationUnite}
                        onChange={(e) => modifierProduit(index, "tempsFabricationUnite", e.target.value)}
                        className={styles.input}
                        min="0.1"
                        step="0.1"
                      />
                    </td>
                    <td>
                      <div className={styles.metricCell} style={{ 
                        color: profitUnitaire >= 0 ? "#10b981" : "#ef4444",
                        fontWeight: "bold"
                      }}>
                        {devises[devise].symbole}{profitUnitaire.toFixed(2)}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <button
        onClick={calculerSacADos}
        disabled={loading}
        className={styles.calculateButton}
      >
        {loading ? "Calcul en cours..." : "Optimiser avec Programmation Linéaire"}
      </button>

      {resultats && (
        <div className={`${styles.section} ${styles.resultsSection}`}>
          <h2 className={styles.resultsTitle}>Résultats de l'optimisation</h2>
          
          <div className={styles.resultsGrid}>
            <div className={styles.resultMetric}>
              <div className={styles.metricValue}>
                {devises[devise].symbole}{resultats.profit_maximal}
              </div>
              <div className={styles.metricLabel}>Profit Maximal (Optimal)</div>
            </div>
            
            <div className={styles.resultMetric}>
              <div className={styles.metricValue}>
                {resultats.capacite_utilisee}
              </div>
              <div className={styles.metricLabel}>Capacité utilisée / {capaciteMax} h</div>
            </div>
            
            <div className={styles.resultMetric}>
              <div className={styles.metricValue}>
                {resultats.utilisation_capacite}%
              </div>
              <div className={styles.metricLabel}>Taux d'utilisation</div>
            </div>
            
            <div className={styles.resultMetric}>
              <div className={styles.metricValue}>
                {resultats.nombre_produits_selectionnes}
              </div>
              <div className={styles.metricLabel}>Produits sélectionnés</div>
            </div>
          </div>

          {resultats.produits_selectionnes && resultats.produits_selectionnes.length > 0 && (
            <div className={styles.solutionDetails}>
              <h3>Produits sélectionnés (solution optimale)</h3>
              <div className={styles.tableContainer}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Produit</th>
                      <th>Demande</th>
                      <th>Temps requis (h)</th>
                      <th>Profit unitaire</th>
                      <th>Profit total</th>
                      <th>Statut PL</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resultats.produits_selectionnes.map((produit, index) => (
                      <tr key={index}>
                        <td>{produit.nom}</td>
                        <td>{produit.demande}</td>
                        <td>{produit.temps_requis}</td>
                        <td>{devises[devise].symbole}{produit.profit_unitaire}</td>
                        <td>{devises[devise].symbole}{produit.profit_total}</td>
                        <td style={{ fontWeight: "bold", color: "#10b981" }}>
                          Optimal
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {resultats.produits_non_selectionnes && resultats.produits_non_selectionnes.length > 0 && (
            <div className={styles.solutionDetails}>
              <h3>Produits non sélectionnés</h3>
              <div className={styles.tableContainer}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Produit</th>
                      <th>Demande</th>
                      <th>Temps requis (h)</th>
                      <th>Profit total</th>
                      <th>Raison d'exclusion</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resultats.produits_non_selectionnes.map((produit, index) => (
                      <tr key={index}>
                        <td>{produit.nom}</td>
                        <td>{produit.demande}</td>
                        <td>{produit.temps_requis}</td>
                        <td>{devises[devise].symbole}{produit.profit_total}</td>
                        <td style={{ color: "#6b7280", fontStyle: "italic" }}>
                          {produit.raison_exclusion || "Non optimal"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          {graphique && (
            <div className={styles.solutionDetails}>
              <h3>Analyse graphique</h3>
              <div className={styles.chartContainer}>
                <img 
                  src={graphique} 
                  alt="Graphique d'analyse FMS Sac à Dos Programmation Linéaire" 
                  style={{ width: "100%", height: "auto", borderRadius: "0.5rem", border: "1px solid #e5e7eb" }}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 