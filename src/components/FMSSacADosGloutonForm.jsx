import { useState } from 'react';
import axios from 'axios';
import styles from './AlgorithmForm.module.css';

export default function FMSSacADosGloutonForm() {
  // Données par défaut (mêmes que les autres algorithmes)
  const [vente_unite, setVenteUnite] = useState([200, 155, 300, 125, 280, 86, 93, 165]);
  const [cout_mp_unite, setCoutMPUnite] = useState([45, 35, 124, 50, 120, 34, 36, 114]);
  const [demande_periode, setDemandePeriode] = useState([100, 50, 50, 75, 60, 30, 50, 600]);
  const [temps_fabrication_unite, setTempsFabricationUnite] = useState([1, 2, 4, 1, 2, 1, 1, 0.5]);
  const [cout_op, setCoutOp] = useState(50);
  const [capacite_max, setCapaciteMax] = useState(250);
  const [noms_produits] = useState(['Produit 1', 'Produit 2', 'Produit 3', 'Produit 4', 'Produit 5', 'Produit 6', 'Produit 7', 'Produit 8']);
  const [unite] = useState('heures');
  
  const [result, setResult] = useState(null);
  const [chartUrl, setChartUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    setChartUrl(null);

    try {
      const data = {
        vente_unite,
        cout_mp_unite,
        demande_periode,
        temps_fabrication_unite,
        cout_op,
        capacite_max,
        noms_produits,
        unite
      };

      // Appel pour les résultats
      const response = await axios.post('http://localhost:8001/fms/sac_a_dos_glouton', data);
      setResult(response.data);

      // Appel pour le graphique
      const chartResponse = await axios.post('http://localhost:8001/fms/sac_a_dos_glouton/chart', data, {
        responseType: 'blob'
      });
      const chartUrl = URL.createObjectURL(chartResponse.data);
      setChartUrl(chartUrl);

    } catch (err) {
      setError(err.response?.data?.detail || err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderArrayInput = (value, setter, label, type = "number", step = "1") => (
    <div className={styles.jobBlock}>
      <label className={styles.jobLabel}>{label} :</label>
      <div className={styles.timesContainer}>
        {value.map((val, index) => (
          <input
            key={index}
            type={type}
            value={val}
            step={step}
            onChange={(e) => {
              const newValue = [...value];
              newValue[index] = type === "number" ? parseFloat(e.target.value) || 0 : e.target.value;
              setter(newValue);
            }}
            className={styles.timeInput}
          />
        ))}
      </div>
    </div>
  );

  return (
    <div className={styles.container}>
      <div className={styles.formSection}>
        <h2 className={styles.title}>FMS - Algorithme Glouton</h2>
        
        <form onSubmit={handleSubmit} className={styles.form}>
          {renderArrayInput(vente_unite, setVenteUnite, "Prix de vente par unité ($)", "number", "0.01")}
          {renderArrayInput(cout_mp_unite, setCoutMPUnite, "Coût matière première par unité ($)", "number", "0.01")}
          {renderArrayInput(demande_periode, setDemandePeriode, "Demande par période (unités)", "number", "1")}
          {renderArrayInput(temps_fabrication_unite, setTempsFabricationUnite, "Temps de fabrication par unité (h)", "number", "0.1")}
          
          <div className={styles.jobBlock}>
            <label className={styles.jobLabel}>Coût d'opération par heure ($) :</label>
            <input
              type="number"
              value={cout_op}
              onChange={(e) => setCoutOp(parseFloat(e.target.value) || 0)}
              className={styles.timeInput}
              step="0.01"
            />
          </div>

          <div className={styles.jobBlock}>
            <label className={styles.jobLabel}>Capacité maximale ({unite}) :</label>
            <input
              type="number"
              value={capacite_max}
              onChange={(e) => setCapaciteMax(parseInt(e.target.value) || 0)}
              className={styles.timeInput}
              step="1"
            />
          </div>

          <button 
            type="submit" 
            className={styles.submitButton} 
            disabled={loading}
          >
            {loading ? 'Calcul en cours...' : 'Lancer l\'algorithme glouton'}
          </button>
        </form>

        {error && (
          <div className={styles.error}>
            Erreur : {error}
          </div>
        )}
      </div>

      {result && (
        <div className={styles.resultSection}>
          <h3 className={styles.resultTitle}>Résultats de l'algorithme glouton</h3>
          
          <div className={styles.resultGrid}>
            <div className={styles.resultCard}>
              <h4>Métriques générales</h4>
              <p><strong>Statut :</strong> {result.status}</p>
              <p><strong>Profit maximal :</strong> ${result.profit_maximal}</p>
              <p><strong>Méthode :</strong> {result.methode}</p>
              <p><strong>Critère :</strong> {result.critere_selection}</p>
              <p><strong>Capacité utilisée :</strong> {result.capacite_utilisee}/{result.capacite_totale} {result.unite}</p>
              <p><strong>Utilisation :</strong> {result.utilisation_capacite}%</p>
              <p><strong>Efficacité :</strong> {result.efficacite}%</p>
            </div>

            <div className={styles.resultCard}>
              <h4>Produits sélectionnés ({result.nombre_produits_selectionnes})</h4>
              {result.produits_selectionnes.length > 0 ? (
                <div className={styles.productList}>
                  {result.produits_selectionnes.map(produit => (
                    <div key={produit.index} className={styles.productItem}>
                      <strong>{produit.nom}</strong>
                      <span>Profit total: ${produit.profit_total}</span>
                      <span>Désirabilité: {produit.desirabilite} $/h</span>
                      <span>Temps requis: {produit.temps_requis}h</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p>Aucun produit sélectionné</p>
              )}
            </div>

            <div className={styles.resultCard}>
              <h4>Produits non sélectionnés</h4>
              {result.produits_non_selectionnes.length > 0 ? (
                <div className={styles.productList}>
                  {result.produits_non_selectionnes.map(produit => (
                    <div key={produit.index} className={styles.productItem}>
                      <strong>{produit.nom}</strong>
                      <span>Raison: {produit.raison_exclusion}</span>
                      <span>Désirabilité: {produit.desirabilite} $/h</span>
                      <span>Profit total: ${produit.profit_total}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p>Tous les produits ont été sélectionnés</p>
              )}
            </div>
          </div>

          {chartUrl && (
            <div className={styles.chartSection}>
              <h4>Analyse graphique</h4>
              <img src={chartUrl} alt="Analyse FMS Glouton" className={styles.chart} />
            </div>
          )}
        </div>
      )}
    </div>
  );
} 