import React, { useState } from "react";
import styles from "./FMSSacADosForm.module.css";

export default function FMSSacADosPLForm() {
  const [capacite, setCapacite] = useState("50");
  const [nbObjets, setNbObjets] = useState("4");
  const [devise, setDevise] = useState("CAD");
  const [objets, setObjets] = useState([
    { nom: "Objet 1", poids: "10", valeur: "60" },
    { nom: "Objet 2", poids: "20", valeur: "100" },
    { nom: "Objet 3", poids: "30", valeur: "120" },
    { nom: "Objet 4", poids: "15", valeur: "80" }
  ]);
  const [resultats, setResultats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [erreur, setErreur] = useState("");

  const devises = {
    "CAD": { symbole: "$", nom: "Dollar Canadien" },
    "USD": { symbole: "$", nom: "Dollar Américain" },
    "EUR": { symbole: "€", nom: "Euro" },
    "GBP": { symbole: "£", nom: "Livre Sterling" },
    "JPY": { symbole: "¥", nom: "Yen Japonais" }
  };

  const ajusterNombreObjets = (nouveauNombre) => {
    const nb = parseInt(nouveauNombre);
    if (isNaN(nb) || nb < 1) return;
    
    setNbObjets(nouveauNombre);
    
    const nouveauxObjets = [...objets];
    
    if (nb > objets.length) {
      for (let i = objets.length; i < nb; i++) {
        nouveauxObjets.push({
          nom: `Objet ${i + 1}`,
          poids: "10",
          valeur: "50"
        });
      }
    } else {
      nouveauxObjets.splice(nb);
    }
    
    setObjets(nouveauxObjets);
  };

  const modifierObjet = (index, champ, valeur) => {
    const nouveauxObjets = [...objets];
    nouveauxObjets[index][champ] = valeur;
    setObjets(nouveauxObjets);
  };

  const calculerMetriques = () => {
    const poidsTotal = objets.reduce((sum, obj) => sum + parseFloat(obj.poids || 0), 0);
    const valeurTotale = objets.reduce((sum, obj) => sum + parseFloat(obj.valeur || 0), 0);

    return { poidsTotal, valeurTotale };
  };

  const { poidsTotal, valeurTotale } = calculerMetriques();

  const calculerSacADos = async () => {
    setLoading(true);
    setErreur("");
    
    try {
      // Conversion du format classique vers le format FMS attendu par le backend
      const donnees = {
        vente_unite: objets.map(obj => parseFloat(obj.valeur)),
        cout_mp_unite: objets.map(() => 0),
        demande_periode: objets.map(() => 1),
        temps_fabrication_unite: objets.map(obj => parseFloat(obj.poids)),
        cout_op: 0,
        capacite_max: parseInt(capacite),
        noms_produits: objets.map(obj => obj.nom),
        unite: "unités"
      };
      
      const response = await fetch("http://localhost:8000/fms/sac_a_dos_pl", {
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

  return (
    <div className={styles.algorithmContainer}>
      <div className={styles.header}>
        <h1 className={styles.title}>Problème du Sac à Dos - Programmation Linéaire</h1>
        <p className={styles.subtitle}>
          Résolution par programmation linéaire avec PuLP
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
        <h2 className={styles.sectionTitle}>Configuration</h2>
        
        <div className={styles.configRow}>
          <div className={styles.inputGroup}>
            <label>Capacité du sac à dos</label>
            <input
              type="number"
              value={capacite}
              onChange={(e) => setCapacite(e.target.value)}
              className={styles.input}
              min="1"
            />
          </div>
          
          <div className={styles.inputGroup}>
            <label>Nombre d'objets</label>
            <input
              type="number"
              value={nbObjets}
              onChange={(e) => ajusterNombreObjets(e.target.value)}
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
        <h2 className={styles.sectionTitle}>Objets à considérer</h2>
        
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Nom de l'objet</th>
                <th>Poids</th>
                <th>Valeur ({devises[devise].symbole})</th>
                <th>Ratio Valeur/Poids</th>
              </tr>
            </thead>
            <tbody>
              {objets.map((objet, index) => (
                <tr key={index}>
                  <td>
                    <input
                      type="text"
                      value={objet.nom}
                      onChange={(e) => modifierObjet(index, "nom", e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={objet.poids}
                      onChange={(e) => modifierObjet(index, "poids", e.target.value)}
                      min="1"
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={objet.valeur}
                      onChange={(e) => modifierObjet(index, "valeur", e.target.value)}
                      min="0"
                    />
                  </td>
                  <td>
                    <div className={styles.metricCell}>
                      {(parseFloat(objet.poids) > 0 ? 
                        (parseFloat(objet.valeur) / parseFloat(objet.poids)).toFixed(2) : 
                        "0.00"
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ background: "#f8fafc", fontWeight: "bold" }}>
                <td></td>
                <td style={{ textAlign: "center", color: "#3b82f6" }}>
                  Total: {poidsTotal.toFixed(1)}
                </td>
                <td style={{ textAlign: "center", color: "#3b82f6" }}>
                  Total: {devises[devise].symbole}{valeurTotale.toFixed(2)}
                </td>
                <td></td>
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
        {loading ? "Calcul en cours..." : "Calculer avec Programmation Linéaire"}
      </button>

      {resultats && (
        <div className={`${styles.section} ${styles.resultsSection}`}>
          <h2 className={styles.resultsTitle}>Résultats de l'optimisation</h2>
          
          <div className={styles.resultsGrid}>
            <div className={styles.resultMetric}>
              <div className={styles.metricValue}>
                {devises[devise].symbole}{resultats.profit_maximal}
              </div>
              <div className={styles.metricLabel}>Valeur optimale</div>
            </div>
            
            <div className={styles.resultMetric}>
              <div className={styles.metricValue}>
                {resultats.capacite_utilisee}
              </div>
              <div className={styles.metricLabel}>Poids utilisé / {capacite}</div>
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
              <div className={styles.metricLabel}>Objets sélectionnés</div>
            </div>
          </div>
          
          {resultats.produits_selectionnes && resultats.produits_selectionnes.length > 0 && (
            <div>
              <h3 style={{ marginBottom: "1rem", color: "#3b82f6" }}>
                Objets dans la solution optimale
              </h3>
              <div className={styles.tableContainer}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Nom</th>
                      <th>Poids</th>
                      <th>Valeur ({devises[devise].symbole})</th>
                      <th>Ratio</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resultats.produits_selectionnes.map((objet, index) => (
                      <tr key={index}>
                        <td>{objet.nom}</td>
                        <td>{objet.temps_requis}</td>
                        <td>{devises[devise].symbole}{objet.prix_vente}</td>
                        <td>{objet.profit_unitaire.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {resultats.produits_non_selectionnes && resultats.produits_non_selectionnes.length > 0 && (
            <div>
              <h3 style={{ marginBottom: "1rem", color: "#ef4444" }}>
                Objets non sélectionnés
              </h3>
              <div className={styles.tableContainer}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Nom</th>
                      <th>Poids</th>
                      <th>Valeur ({devises[devise].symbole})</th>
                      <th>Raison</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resultats.produits_non_selectionnes.map((objet, index) => (
                      <tr key={index}>
                        <td>{objet.nom}</td>
                        <td>{objet.temps_requis || 'N/A'}</td>
                        <td>{devises[devise].symbole}{objet.prix_vente || objet.profit_total}</td>
                        <td>{objet.raison_exclusion}</td>
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