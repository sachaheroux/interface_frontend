import React, { useState } from "react";
import styles from "./FMSSacADosForm.module.css";

export default function FMSSacADosForm() {
  const [vente_unite, setVenteUnite] = useState([100, 80, 120, 90, 110]);
  const [cout_mp_unite, setCoutMpUnite] = useState([30, 25, 40, 35, 28]);
  const [demande_periode, setDemandePeriode] = useState([50, 60, 40, 45, 55]);
  const [temps_fabrication_unite, setTempsFabricationUnite] = useState([2, 1.5, 2.5, 2, 1.8]);
  const [cout_op, setCoutOp] = useState(15);
  const [capacite_max, setCapaciteMax] = useState(200);
  const [noms_produits, setNomsProduitsValue] = useState(["Produit A", "Produit B", "Produit C", "Produit D", "Produit E"]);
  const [nbProduits, setNbProduits] = useState(5);
  const [devise, setDevise] = useState("CAD");
  const [unite, setUnite] = useState("heures");
  const [resultats, setResultats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [erreur, setErreur] = useState("");

  const devises = {
    CAD: { symbole: "CAD$", nom: "Dollar Canadien" },
    USD: { symbole: "US$", nom: "Dollar Américain" },
    EUR: { symbole: "€", nom: "Euro" },
    GBP: { symbole: "£", nom: "Livre Sterling" },
    JPY: { symbole: "¥", nom: "Yen Japonais" }
  };

  const ajusterNombreProduits = (nouveauNombre) => {
    const nombre = Math.max(1, Math.min(20, parseInt(nouveauNombre) || 1));
    setNbProduits(nombre);
    
    const ajusterArray = (array, setterFunction) => {
      const nouveauArray = [...array];
      while (nouveauArray.length < nombre) {
        nouveauArray.push(array[array.length - 1] || 0);
      }
      nouveauArray.splice(nombre);
      setterFunction(nouveauArray);
    };
    
    ajusterArray(vente_unite, setVenteUnite);
    ajusterArray(cout_mp_unite, setCoutMpUnite);
    ajusterArray(demande_periode, setDemandePeriode);
    ajusterArray(temps_fabrication_unite, setTempsFabricationUnite);
    
    const nouveauxNoms = [...noms_produits];
    while (nouveauxNoms.length < nombre) {
      nouveauxNoms.push(`Produit ${String.fromCharCode(65 + nouveauxNoms.length)}`);
    }
    nouveauxNoms.splice(nombre);
    setNomsProduitsValue(nouveauxNoms);
  };

  const modifierValeur = (index, champ, valeur) => {
    const nouvelleValeur = parseFloat(valeur) || 0;
    switch(champ) {
      case 'vente_unite':
        const newVente = [...vente_unite];
        newVente[index] = nouvelleValeur;
        setVenteUnite(newVente);
        break;
      case 'cout_mp_unite':
        const newCout = [...cout_mp_unite];
        newCout[index] = nouvelleValeur;
        setCoutMpUnite(newCout);
        break;
      case 'demande_periode':
        const newDemande = [...demande_periode];
        newDemande[index] = parseInt(valeur) || 0;
        setDemandePeriode(newDemande);
        break;
      case 'temps_fabrication_unite':
        const newTemps = [...temps_fabrication_unite];
        newTemps[index] = nouvelleValeur;
        setTempsFabricationUnite(newTemps);
        break;
      case 'nom':
        const newNoms = [...noms_produits];
        newNoms[index] = valeur;
        setNomsProduitsValue(newNoms);
        break;
    }
  };

  const calculerMetriques = () => {
    const profits_unitaires = vente_unite.map((vente, i) => 
      vente - (cout_op * temps_fabrication_unite[i] + cout_mp_unite[i])
    );
    const temps_requis_total = demande_periode.reduce((total, demande, i) => 
      total + (demande * temps_fabrication_unite[i]), 0
    );
    const profit_potentiel_total = profits_unitaires.reduce((total, profit, i) => 
      total + (profit * demande_periode[i]), 0
    );
    
    return { profits_unitaires, temps_requis_total, profit_potentiel_total };
  };

  const calculerSacADos = async () => {
    setLoading(true);
    setErreur("");
    
    try {
      const donnees = {
        vente_unite: vente_unite,
        cout_mp_unite: cout_mp_unite,
        demande_periode: demande_periode,
        temps_fabrication_unite: temps_fabrication_unite,
        cout_op: cout_op,
        capacite_max: capacite_max,
        noms_produits: noms_produits,
        unite: unite
      };
      
      const response = await fetch("http://localhost:8000/fms/sac_a_dos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(donnees)
      });
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      const resultats = await response.json();
      setResultats(resultats);
    } catch (error) {
      console.error("Erreur:", error);
      setErreur(`Erreur lors du calcul: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const { profits_unitaires, temps_requis_total, profit_potentiel_total } = calculerMetriques();

  return (
    <div className={styles.algorithmContainer}>
      <div className={styles.header}>
        <h1 className={styles.title}>FMS - Sac à Dos Optimal</h1>
        <p className={styles.subtitle}>
          Optimisation de la production par programmation dynamique
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
        <h2 className={styles.sectionTitle}>Configuration Système FMS</h2>
        
        <div className={styles.configRow}>
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
            <label>Capacité maximale ({unite})</label>
            <input
              type="number"
              value={capacite_max}
              onChange={(e) => setCapaciteMax(parseInt(e.target.value) || 200)}
              className={styles.input}
              min="1"
            />
          </div>
          
          <div className={styles.inputGroup}>
            <label>Coût opérationnel ($/heure)</label>
            <input
              type="number"
              value={cout_op}
              onChange={(e) => setCoutOp(parseFloat(e.target.value) || 15)}
              className={styles.input}
              min="0"
              step="0.1"
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
        <h2 className={styles.sectionTitle}>Produits à considérer</h2>
        
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Nom du produit</th>
                <th>Prix de vente unitaire ({devises[devise].symbole})</th>
                <th>Coût matériel unitaire ({devises[devise].symbole})</th>
                <th>Demande de période</th>
                <th>Temps de fabrication unitaire ({unite})</th>
                <th>Profit unitaire ({devises[devise].symbole})</th>
              </tr>
            </thead>
            <tbody>
              {noms_produits.map((nom, index) => (
                <tr key={index}>
                  <td>
                    <input
                      type="text"
                      value={nom}
                      onChange={(e) => modifierValeur(index, "nom", e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={vente_unite[index]}
                      onChange={(e) => modifierValeur(index, "vente_unite", e.target.value)}
                      min="0"
                      step="0.01"
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={cout_mp_unite[index]}
                      onChange={(e) => modifierValeur(index, "cout_mp_unite", e.target.value)}
                      min="0"
                      step="0.01"
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={demande_periode[index]}
                      onChange={(e) => modifierValeur(index, "demande_periode", e.target.value)}
                      min="0"
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={temps_fabrication_unite[index]}
                      onChange={(e) => modifierValeur(index, "temps_fabrication_unite", e.target.value)}
                      min="0"
                      step="0.1"
                    />
                  </td>
                  <td>
                    <div className={styles.metricCell}>
                      {profits_unitaires[index]?.toFixed(2) || "0.00"}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ background: "#f8fafc", fontWeight: "bold" }}>
                <td></td>
                <td style={{ textAlign: "center", color: "#3b82f6" }}>
                  Total: {devises[devise].symbole}{vente_unite.reduce((sum, vente) => sum + vente, 0).toFixed(2)}
                </td>
                <td style={{ textAlign: "center", color: "#3b82f6" }}>
                  Total: {devises[devise].symbole}{cout_mp_unite.reduce((sum, cout) => sum + cout, 0).toFixed(2)}
                </td>
                <td style={{ textAlign: "center", color: "#3b82f6" }}>
                  Total: {demande_periode.reduce((sum, demande) => sum + demande, 0)}
                </td>
                <td style={{ textAlign: "center", color: "#3b82f6" }}>
                  Total: {temps_requis_total.toFixed(2)} {unite}
                </td>
                <td style={{ textAlign: "center", color: "#3b82f6" }}>
                  Total: {devises[devise].symbole}{profit_potentiel_total.toFixed(2)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <button
        onClick={calculerSacADos}
        disabled={loading}
        className={styles.calculateButton}
      >
        {loading ? "Optimisation en cours..." : "Calculer la solution optimale"}
      </button>

      {resultats && (
        <div className={`${styles.section} ${styles.resultsSection}`}>
          <h2 className={styles.resultsTitle}>Résultats de l'optimisation FMS</h2>
          
          <div className={styles.resultsGrid}>
            <div className={styles.resultMetric}>
              <div className={styles.metricValue}>
                {devises[devise].symbole}{resultats.profit_maximal}
              </div>
              <div className={styles.metricLabel}>Profit maximal</div>
            </div>
            
            <div className={styles.resultMetric}>
              <div className={styles.metricValue}>
                {resultats.capacite_utilisee}
              </div>
              <div className={styles.metricLabel}>Capacité utilisée / {capacite_max} {unite}</div>
            </div>
            
            <div className={styles.resultMetric}>
              <div className={styles.metricValue}>
                {resultats.utilisation_capacite}%
              </div>
              <div className={styles.metricLabel}>Utilisation capacité</div>
            </div>
            
            <div className={styles.resultMetric}>
              <div className={styles.metricValue}>
                {resultats.nombre_produits_selectionnes}
              </div>
              <div className={styles.metricLabel}>Produits sélectionnés</div>
            </div>
          </div>
          
          {resultats.produits_selectionnes && resultats.produits_selectionnes.length > 0 && (
            <div>
              <h3 style={{ marginBottom: "1rem", color: "#3b82f6" }}>
                Produits dans la solution optimale
              </h3>
              <div className={styles.tableContainer}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Nom</th>
                      <th>Profit unitaire</th>
                      <th>Profit total</th>
                      <th>Temps requis</th>
                      <th>Demande</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resultats.produits_selectionnes.map((produit, index) => (
                      <tr key={index}>
                        <td>{produit.nom}</td>
                        <td>{devises[devise].symbole}{produit.profit_unitaire}</td>
                        <td>{devises[devise].symbole}{produit.profit_total}</td>
                        <td>{produit.temps_requis} {unite}</td>
                        <td>{produit.demande}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          {resultats.produits_non_selectionnes && resultats.produits_non_selectionnes.length > 0 && (
            <div style={{ marginTop: "2rem" }}>
              <h3 style={{ marginBottom: "1rem", color: "#ef4444" }}>
                Produits non sélectionnés
              </h3>
              <div className={styles.tableContainer}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Nom</th>
                      <th>Profit unitaire</th>
                      <th>Profit total</th>
                      <th>Temps requis</th>
                      <th>Raison exclusion</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resultats.produits_non_selectionnes.map((produit, index) => (
                      <tr key={index}>
                        <td>{produit.nom}</td>
                        <td>{devises[devise].symbole}{produit.profit_unitaire}</td>
                        <td>{devises[devise].symbole}{produit.profit_total}</td>
                        <td>{produit.temps_requis} {unite}</td>
                        <td>{produit.raison_exclusion}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 