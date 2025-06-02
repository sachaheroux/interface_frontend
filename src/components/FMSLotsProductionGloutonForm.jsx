import { useState } from "react";
import styles from "./FlowshopSPTForm.module.css";

export default function FMSLotsProductionGloutonForm() {
  const [produits, setProduits] = useState([
    { nom: "Produit 1", grandeurCommande: 5, tempsOpA: 0.1, tempsOpB: 0.3, outilA: "A1", outilB: "B1", dateDue: 0 },
    { nom: "Produit 2", grandeurCommande: 10, tempsOpA: 1.2, tempsOpB: 0.0, outilA: "A2", outilB: "", dateDue: 1 },
    { nom: "Produit 3", grandeurCommande: 25, tempsOpA: 0.7, tempsOpB: 0.4, outilA: "A3", outilB: "B3", dateDue: 1 },
    { nom: "Produit 4", grandeurCommande: 10, tempsOpA: 0.1, tempsOpB: 0.2, outilA: "A1", outilB: "B1", dateDue: 1 },
    { nom: "Produit 5", grandeurCommande: 4, tempsOpA: 0.3, tempsOpB: 0.2, outilA: "A4", outilB: "B2", dateDue: 2 },
    { nom: "Produit 6", grandeurCommande: 10, tempsOpA: 0.1, tempsOpB: 0.3, outilA: "A1", outilB: "B1", dateDue: 4 }
  ]);

  const [tempsDisponibleJour, setTempsDisponibleJour] = useState("12");
  const [nbMachinesA, setNbMachinesA] = useState("3");
  const [nbMachinesB, setNbMachinesB] = useState("1");
  const [capaciteOutilsA, setCapaciteOutilsA] = useState("2");
  const [capaciteOutilsB, setCapaciteOutilsB] = useState("2");
  const [uniteTemps, setUniteTemps] = useState("heures");
  
  const [result, setResult] = useState(null);
  const [chartUrl, setChartUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_URL = "/api";

  const addProduit = () => {
    setProduits([...produits, { 
      nom: `Produit ${produits.length + 1}`, 
      grandeurCommande: 10, 
      tempsOpA: 0.5, 
      tempsOpB: 0.5, 
      outilA: "A1", 
      outilB: "B1", 
      dateDue: 1 
    }]);
  };

  const removeProduit = () => {
    if (produits.length > 1) {
      setProduits(produits.slice(0, -1));
    }
  };

  const handleProduitChange = (index, field, value) => {
    const newProduits = [...produits];
    if (field === 'nom' || field === 'outilA' || field === 'outilB') {
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
      const tempsValue = parseFloat(tempsDisponibleJour);
      const machinesAValue = parseInt(nbMachinesA);
      const machinesBValue = parseInt(nbMachinesB);
      const capaciteAValue = parseInt(capaciteOutilsA);
      const capaciteBValue = parseInt(capaciteOutilsB);

      if (isNaN(tempsValue) || tempsValue <= 0) {
        setError("Le temps disponible par jour doit être un nombre positif.");
        setIsLoading(false);
        return;
      }

      if (isNaN(machinesAValue) || machinesAValue <= 0 || isNaN(machinesBValue) || machinesBValue <= 0) {
        setError("Le nombre de machines doit être un entier positif.");
        setIsLoading(false);
        return;
      }

      if (isNaN(capaciteAValue) || capaciteAValue <= 0 || isNaN(capaciteBValue) || capaciteBValue <= 0) {
        setError("La capacité d'outils doit être un entier positif.");
        setIsLoading(false);
        return;
      }

      // Validation des produits
      for (let i = 0; i < produits.length; i++) {
        const p = produits[i];
        if (p.grandeurCommande <= 0 || p.tempsOpA < 0 || p.tempsOpB < 0 || p.dateDue < 0) {
          setError(`Produit ${i + 1}: Les valeurs doivent être positives ou nulles.`);
          setIsLoading(false);
          return;
        }
      }

      const requestData = {
        noms_produits: produits.map(p => p.nom),
        grandeurs_commande: produits.map(p => p.grandeurCommande),
        temps_operation_machine_a: produits.map(p => p.tempsOpA),
        temps_operation_machine_b: produits.map(p => p.tempsOpB),
        outils_machine_a: produits.map(p => p.outilA || null),
        outils_machine_b: produits.map(p => p.outilB || null),
        dates_dues: produits.map(p => p.dateDue),
        temps_disponible_jour: tempsValue,
        nb_machines_a: machinesAValue,
        nb_machines_b: machinesBValue,
        capacite_outils_a: capaciteAValue,
        capacite_outils_b: capaciteBValue,
        unite_temps: uniteTemps
      };

      console.log("Sending data to API:", JSON.stringify(requestData, null, 2));

      // Appel API pour les résultats
      fetch(`${API_URL}/fms/lots_production_glouton`, {
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
          return fetch(`${API_URL}/fms/lots_production_glouton/chart`, {
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
    link.download = "fms_lots_production_glouton.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const calculateCapaciteTotaleA = () => {
    return parseFloat(tempsDisponibleJour || 0) * parseInt(nbMachinesA || 0);
  };

  const calculateCapaciteTotaleB = () => {
    return parseFloat(tempsDisponibleJour || 0) * parseInt(nbMachinesB || 0);
  };

  const calculateTempsRequisProduit = (produit) => {
    return produit.tempsOpA * produit.grandeurCommande + produit.tempsOpB * produit.grandeurCommande;
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>FMS - Lots de Production (Glouton)</h2>
      
      <div className={styles.unitSelector}>
        <label>Unité de temps :</label>
        <select value={uniteTemps} onChange={(e) => setUniteTemps(e.target.value)} className={styles.select}>
          <option value="heures">heures</option>
          <option value="minutes">minutes</option>
          <option value="jours">jours</option>
        </select>
      </div>

      {/* Configuration système */}
      <div className={styles.tasksContainer}>
        <h4 className={styles.subtitle}>Configuration du système</h4>
        
        <div className={styles.jobBlock}>
          <h4>Ressources disponibles</h4>
          
          <div className={styles.taskRow}>
            <label>Temps disponible par jour ({uniteTemps}) :</label>
            <input
              type="number"
              step="0.1"
              min="0"
              value={tempsDisponibleJour}
              onChange={e => setTempsDisponibleJour(e.target.value)}
              className={styles.input}
              placeholder="12"
            />
          </div>

          <div className={styles.taskRow}>
            <label>Nombre de machines de type A :</label>
            <input
              type="number"
              min="1"
              value={nbMachinesA}
              onChange={e => setNbMachinesA(e.target.value)}
              className={styles.input}
              placeholder="3"
            />
          </div>

          <div className={styles.taskRow}>
            <label>Nombre de machines de type B :</label>
            <input
              type="number"
              min="1"
              value={nbMachinesB}
              onChange={e => setNbMachinesB(e.target.value)}
              className={styles.input}
              placeholder="1"
            />
          </div>

          <div className={styles.taskRow}>
            <label>Capacité d'outils machine A :</label>
            <input
              type="number"
              min="1"
              value={capaciteOutilsA}
              onChange={e => setCapaciteOutilsA(e.target.value)}
              className={styles.input}
              placeholder="2"
            />
          </div>

          <div className={styles.taskRow}>
            <label>Capacité d'outils machine B :</label>
            <input
              type="number"
              min="1"
              value={capaciteOutilsB}
              onChange={e => setCapaciteOutilsB(e.target.value)}
              className={styles.input}
              placeholder="2"
            />
          </div>

          <small className={styles.helpText}>
            <strong>Capacité totale Machine A :</strong> {calculateCapaciteTotaleA().toFixed(1)} {uniteTemps} | 
            <strong> Capacité totale Machine B :</strong> {calculateCapaciteTotaleB().toFixed(1)} {uniteTemps}
          </small>
        </div>
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
            <h4>{produit.nom}</h4>
            
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
              <label>Grandeur de commande (unités) :</label>
              <input
                type="number"
                min="1"
                value={produit.grandeurCommande}
                onChange={(e) => handleProduitChange(index, "grandeurCommande", e.target.value)}
                className={styles.input}
              />
            </div>

            <div className={styles.taskRow}>
              <label>Temps opération Machine A ({uniteTemps}/unité) :</label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={produit.tempsOpA}
                onChange={(e) => handleProduitChange(index, "tempsOpA", e.target.value)}
                className={styles.input}
              />
            </div>

            <div className={styles.taskRow}>
              <label>Temps opération Machine B ({uniteTemps}/unité) :</label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={produit.tempsOpB}
                onChange={(e) => handleProduitChange(index, "tempsOpB", e.target.value)}
                className={styles.input}
              />
            </div>

            <div className={styles.taskRow}>
              <label>Outil requis Machine A :</label>
              <input
                type="text"
                value={produit.outilA}
                onChange={(e) => handleProduitChange(index, "outilA", e.target.value)}
                className={styles.input}
                placeholder="A1"
              />
            </div>

            <div className={styles.taskRow}>
              <label>Outil requis Machine B :</label>
              <input
                type="text"
                value={produit.outilB}
                onChange={(e) => handleProduitChange(index, "outilB", e.target.value)}
                className={styles.input}
                placeholder="B1"
              />
            </div>

            <div className={styles.taskRow}>
              <label>Date d'échéance (jours) :</label>
              <input
                type="number"
                min="0"
                value={produit.dateDue}
                onChange={(e) => handleProduitChange(index, "dateDue", e.target.value)}
                className={styles.input}
              />
            </div>

            <small className={styles.helpText}>
              <strong>Temps total requis :</strong> {calculateTempsRequisProduit(produit).toFixed(2)} {uniteTemps} | 
              <strong> A:</strong> {(produit.tempsOpA * produit.grandeurCommande).toFixed(2)}h |
              <strong> B:</strong> {(produit.tempsOpB * produit.grandeurCommande).toFixed(2)}h
            </small>
          </div>
        ))}
      </div>

      <button 
        onClick={handleSubmit} 
        disabled={isLoading}
        className={styles.submitButton}
      >
        {isLoading ? "Optimisation en cours..." : "Résoudre avec l'algorithme glouton"}
      </button>

      {error && <div className={styles.error}>{error}</div>}

      {result && (
        <div className={styles.results}>
          <h3>Résultats de l'algorithme glouton - Lots de production</h3>
          
          <div className={styles.metricsGrid}>
            <div>
              <strong>Statut :</strong> 
              <span style={{ color: result.status === 'Optimal' ? '#10b981' : '#f59e0b' }}>
                {result.status}
              </span>
            </div>
            <div>
              <strong>Méthode :</strong> {result.methode}
            </div>
            <div>
              <strong>Critère :</strong> {result.critere_selection}
            </div>
            <div>
              <strong>Machine A :</strong> {result.temps_utilise_a}h / {result.temps_disponible_total_a}h ({result.utilisation_machine_a}%)
            </div>
            <div>
              <strong>Machine B :</strong> {result.temps_utilise_b}h / {result.temps_disponible_total_b}h ({result.utilisation_machine_b}%)
            </div>
            <div>
              <strong>Efficacité globale :</strong> {result.efficacite_globale}%
            </div>
            <div>
              <strong>Produits assignés :</strong> {result.nombre_produits_assignes}
            </div>
            <div>
              <strong>Produits non assignés :</strong> {result.nombre_produits_non_assignes}
            </div>
          </div>

          {/* Produits assignés */}
          {result.produits_assignes && result.produits_assignes.length > 0 && (
            <div className={styles.stationsSection}>
              <h4>Produits assignés pour la production :</h4>
              {result.produits_assignes.map((produit, index) => (
                <div key={index} className={styles.stationBlock}>
                  <strong>{produit.nom}</strong> (Date due: Jour {produit.date_due})
                  <br />
                  Quantité assignée : {produit.quantite_assignee}/{produit.quantite_totale} unités ({produit.pourcentage_assigne}%)
                  <br />
                  Temps Machine A : {produit.temps_machine_a}h | Machine B : {produit.temps_machine_b}h
                  <br />
                  <small className={styles.helpText}>
                    Outils : A({produit.outils_machine_a || 'Aucun'}) | B({produit.outils_machine_b || 'Aucun'})
                  </small>
                </div>
              ))}
            </div>
          )}

          {/* Produits non assignés */}
          {result.produits_non_assignes && result.produits_non_assignes.length > 0 && (
            <div className={styles.stationsSection}>
              <h4>Produits non assignés :</h4>
              {result.produits_non_assignes.map((produit, index) => (
                <div key={index} style={{ 
                  padding: "0.5rem", 
                  margin: "0.5rem 0", 
                  border: "1px solid #fecaca", 
                  borderRadius: "0.375rem", 
                  backgroundColor: "#fef2f2" 
                }}>
                  <strong>{produit.nom}</strong> - Commande: {produit.grandeur_commande} unités
                  <br />
                  <small className={styles.helpText}>
                    Date due: Jour {produit.date_due} | Raison : {produit.raison}
                  </small>
                </div>
              ))}
            </div>
          )}

          {/* Utilisation des outils */}
          <div className={styles.stationsSection}>
            <h4>Utilisation des outils :</h4>
            <div className={styles.stationBlock}>
              <strong>Machine A :</strong> {result.outils_utilises_a.join(", ") || "Aucun"} 
              ({result.outils_utilises_a.length}/{result.capacite_outils_a})
              <br />
              <strong>Machine B :</strong> {result.outils_utilises_b.join(", ") || "Aucun"} 
              ({result.outils_utilises_b.length}/{result.capacite_outils_b})
            </div>
          </div>

          {chartUrl && (
            <div className={styles.ganttContainer}>
              <h4>Analyse graphique des lots de production</h4>
              <img 
                src={chartUrl} 
                alt="Graphiques FMS Lots de Production Glouton" 
                className={styles.gantt}
                style={{ width: "100%", maxWidth: "800px" }}
              />
              <button 
                onClick={handleDownloadChart}
                className={styles.button}
                style={{ marginTop: "1rem" }}
              >
                Télécharger le graphique
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 