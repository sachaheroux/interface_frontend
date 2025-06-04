import React, { useState } from "react";
import styles from "./FMSSacADosForm.module.css";
import config from "../config.js";

export default function FMSLotsProductionMIPForm() {
  // Configuration système
  const [tempsDisponibleJour, setTempsDisponibleJour] = useState("420");
  const [uniteTemps, setUniteTemps] = useState("minutes");
  const [devise, setDevise] = useState("CAD");
  
  // État des machines avec données par défaut du collègue
  const [machines, setMachines] = useState([
    { nom: "Machine A", nombre: 1, capaciteOutils: 2, outilsDisponibles: ["A1", "A2", "A3"], espaceOutils: [1, 1, 1] },
    { nom: "Machine B", nombre: 1, capaciteOutils: 2, outilsDisponibles: ["B1", "B2"], espaceOutils: [1, 1] }
  ]);

  const [produits, setProduits] = useState([
    { 
      nom: "Produit 1", 
      grandeurCommande: 60, 
      tempsOperations: [5, 1], 
      outils: ["A1", "B1"], 
      dateDue: 3,
      coutInventaire: 100
    },
    { 
      nom: "Produit 2", 
      grandeurCommande: 175, 
      tempsOperations: [2, 2.5], 
      outils: ["A2", "B1"], 
      dateDue: 2,
      coutInventaire: 50
    },
    { 
      nom: "Produit 3", 
      grandeurCommande: 45, 
      tempsOperations: [2.5, 2.5], 
      outils: ["A3", "B2"], 
      dateDue: 2,
      coutInventaire: 150
    }
  ]);
  
  const [result, setResult] = useState(null);
  const [chartUrl, setChartUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const devises = {
    "CAD": { symbole: "$", nom: "Dollar Canadien" },
    "USD": { symbole: "$", nom: "Dollar Américain" },
    "EUR": { symbole: "€", nom: "Euro" },
    "GBP": { symbole: "£", nom: "Livre Sterling" },
    "JPY": { symbole: "¥", nom: "Yen Japonais" }
  };

  // Fonctions pour gérer les machines
  const addMachine = () => {
    const nouveauNom = `Machine ${String.fromCharCode(65 + machines.length)}`; // A, B, C, D...
    const nouvelleMachine = { 
      nom: nouveauNom, 
      nombre: 1, 
      capaciteOutils: 2, 
      outilsDisponibles: [`${nouveauNom.slice(-1)}1`, `${nouveauNom.slice(-1)}2`], 
      espaceOutils: [1, 1] 
    };
    setMachines([...machines, nouvelleMachine]);
    
    // Ajouter une colonne à tous les produits
    const nouveauxProduits = produits.map(p => ({
      ...p,
      tempsOperations: [...p.tempsOperations, 1.0],
      outils: [...p.outils, (nouvelleMachine.outilsDisponibles || [])[0] || ""]
    }));
    setProduits(nouveauxProduits);
  };

  const removeMachine = () => {
    if (machines.length > 1) {
      setMachines(machines.slice(0, -1));
      
      // Supprimer la dernière colonne de tous les produits
      const nouveauxProduits = produits.map(p => ({
        ...p,
        tempsOperations: p.tempsOperations.slice(0, -1),
        outils: p.outils.slice(0, -1)
      }));
      setProduits(nouveauxProduits);
    }
  };

  const handleMachineChange = (index, field, value) => {
    const nouvellesMachines = [...machines];
    if (field === 'nom') {
      nouvellesMachines[index][field] = value;
    } else if (field === 'outilsDisponibles') {
      nouvellesMachines[index][field] = value.split(',').map(s => s.trim()).filter(s => s);
    } else if (field === 'espaceOutils') {
      nouvellesMachines[index][field] = value.split(',').map(s => parseInt(s.trim()) || 1);
    } else {
      nouvellesMachines[index][field] = parseInt(value) || 0;
    }
    setMachines(nouvellesMachines);
  };

  // Fonctions pour gérer les produits
  const addProduit = () => {
    const nouveauProduit = { 
      nom: `Produit ${produits.length + 1}`, 
      grandeurCommande: 50, 
      tempsOperations: new Array(machines.length).fill(2.0), 
      outils: machines.map((machine, index) => (machine.outilsDisponibles || [])[0] || ""), 
      dateDue: 2,
      coutInventaire: 100
    };
    setProduits([...produits, nouveauProduit]);
  };

  const removeProduit = () => {
    if (produits.length > 1) {
      setProduits(produits.slice(0, -1));
    }
  };

  const handleProduitChange = (produitIndex, field, value, machineIndex = null) => {
    const nouveauxProduits = [...produits];
    
    if (field === 'tempsOperation') {
      nouveauxProduits[produitIndex].tempsOperations[machineIndex] = parseFloat(value) || 0;
    } else if (field === 'outil') {
      nouveauxProduits[produitIndex].outils[machineIndex] = value;
    } else if (field === 'nom') {
      nouveauxProduits[produitIndex][field] = value;
    } else if (field === 'coutInventaire') {
      nouveauxProduits[produitIndex][field] = parseFloat(value) || 0;
    } else {
      nouveauxProduits[produitIndex][field] = parseFloat(value) || 0;
    }
    
    setProduits(nouveauxProduits);
  };

  const calculateCapaciteTotale = (machineIndex) => {
    return parseFloat(tempsDisponibleJour || 0) * machines[machineIndex].nombre;
  };

  const calculateTempsRequisProduit = (produit) => {
    return produit.tempsOperations.reduce((total, temps, index) => 
      total + (temps * produit.grandeurCommande), 0
    );
  };

  const handleSubmit = () => {
    setError(null);
    setChartUrl(null);
    setIsLoading(true);

    try {
      // Validation
      const tempsValue = parseFloat(tempsDisponibleJour);

      if (isNaN(tempsValue) || tempsValue <= 0) {
        setError("Le temps disponible par jour doit être un nombre positif.");
        setIsLoading(false);
        return;
      }

      // Validation des machines
      for (let i = 0; i < machines.length; i++) {
        const m = machines[i];
        if (m.nombre <= 0 || m.capaciteOutils <= 0) {
          setError(`Machine ${m.nom}: Le nombre de machines et la capacité d'outils doivent être positifs.`);
          setIsLoading(false);
          return;
        }
        if (!m.outilsDisponibles || m.outilsDisponibles.length === 0) {
          setError(`Machine ${m.nom}: Au moins un outil doit être disponible.`);
          setIsLoading(false);
          return;
        }
        if (m.espaceOutils.length !== m.outilsDisponibles.length) {
          setError(`Machine ${m.nom}: Le nombre d'espaces outils doit correspondre au nombre d'outils.`);
          setIsLoading(false);
          return;
        }
      }

      // Validation des produits
      for (let i = 0; i < produits.length; i++) {
        const p = produits[i];
        if (p.grandeurCommande <= 0 || p.dateDue <= 0 || p.coutInventaire < 0) {
          setError(`Produit ${i + 1}: Les valeurs doivent être positives (coût inventaire peut être nul).`);
          setIsLoading(false);
          return;
        }
        
        for (let j = 0; j < p.tempsOperations.length; j++) {
          if (p.tempsOperations[j] < 0) {
            setError(`Produit ${i + 1}, ${machines[j].nom}: Le temps d'opération doit être positif ou nul.`);
            setIsLoading(false);
            return;
          }
        }
      }

      const requestData = {
        noms_produits: produits.map(p => p.nom),
        grandeurs_commande: produits.map(p => p.grandeurCommande),
        temps_operation_machines: produits.map(p => p.tempsOperations),
        outils_machines: produits.map(p => p.outils.map(outil => outil || null)),
        dates_dues: produits.map(p => p.dateDue),
        couts_inventaire: produits.map(p => p.coutInventaire),
        temps_disponible_jour: tempsValue,
        noms_machines: machines.map(m => m.nom),
        nb_machines: machines.map(m => m.nombre),
        capacite_outils: machines.map(m => m.capaciteOutils),
        outils_disponibles: machines.map(m => m.outilsDisponibles),
        espace_outils: machines.map(m => m.espaceOutils),
        unite_temps: uniteTemps
      };

      console.log("Données envoyées au backend:", requestData);

      // Appel API pour les résultats
      fetch(`${config.API_URL}/fms/lots_production_mip`, {
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
          console.log("Résultats reçus:", data);
          setResult(data);
          // Récupérer le graphique
          return fetch(`${config.API_URL}/fms/lots_production_mip/chart`, {
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

  const renderResultsForMachine = (nom_machine, result) => {
    const machine_key = nom_machine.toLowerCase().replace(' ', '_');
    const temps_utilise = result[`temps_utilise_${machine_key}`] || 0;
    const temps_total = result[`temps_disponible_total_${machine_key}`] || 0;
    const utilisation = result[`utilisation_${machine_key}`] || 0;
    
    return `${temps_utilise}${uniteTemps} / ${temps_total}${uniteTemps} (${utilisation}%)`;
  };

  const renderProduitsAssignes = (produits_assignes) => {
    return produits_assignes.map((produit, index) => (
      <div key={index} className={styles.solutionDetails} style={{ marginBottom: "1rem" }}>
        <strong>{produit.nom}</strong> (Date due: Jour {produit.date_due})
        <br />
        Quantité assignée : {produit.quantite_assignee}/{produit.quantite_totale} unités ({produit.pourcentage_assigne}%)
        <br />
        Coût d'inventaire : {devises[devise].symbole}{produit.cout_inventaire_total || 0}
        <br />
        {machines.map((machine, machineIndex) => {
          const machine_key = machine.nom.toLowerCase().replace(' ', '_');
          const temps = produit[`temps_${machine_key}`];
          const outil = produit[`outil_${machine_key}`];
          return (
            <span key={machineIndex}>
              {machine.nom}: {temps || 0}{uniteTemps}{outil ? ` (${outil})` : ''} | 
            </span>
          );
        })}
        <br />
        <small style={{ color: "#6b7280", fontStyle: "italic" }}>
          Outils utilisés par machine
        </small>
      </div>
    ));
  };

  return (
    <div className={styles.algorithmContainer}>
      <div className={styles.header}>
        <h1 className={styles.title}>FMS - Lots de Production avec Programmation Linéaire Mixte (MIP)</h1>
        <p className={styles.subtitle}>
          Optimisation exacte par programmation mathématique avec contraintes d'outils et d'inventaire
        </p>
      </div>

      {error && (
        <div className={styles.errorSection}>
          <div className={styles.errorBox}>
            <span className={styles.errorIcon}>⚠️</span>
            <span className={styles.errorText}>{error}</span>
          </div>
        </div>
      )}

      <div className={`${styles.section} ${styles.configSection}`}>
        <h2 className={styles.sectionTitle}>Paramètres du Système</h2>
        
        <div className={styles.configRow}>
          <div className={styles.inputGroup}>
            <label>Unité de temps</label>
            <select
              value={uniteTemps}
              onChange={(e) => setUniteTemps(e.target.value)}
              className={styles.select}
            >
              <option value="minutes">Minutes</option>
              <option value="heures">Heures</option>
              <option value="jours">Jours</option>
            </select>
          </div>
          
          <div className={styles.inputGroup}>
            <label>Temps disponible/jour<br/><span style={{fontSize: "0.8em", color: "#6b7280"}}>({uniteTemps})</span></label>
            <input
              type="number"
              step="1"
              min="0"
              value={tempsDisponibleJour}
              onChange={e => setTempsDisponibleJour(e.target.value)}
              className={styles.input}
              placeholder="420"
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
        
        <div className={styles.actionButtons}>
          <button className={styles.addButton} onClick={addMachine}>
            + Ajouter une machine
          </button>
          <button className={styles.removeButton} onClick={removeMachine} disabled={machines.length <= 1}>
            - Supprimer une machine
          </button>
          <button className={styles.addButton} onClick={addProduit}>
            + Ajouter un produit
          </button>
          <button className={styles.removeButton} onClick={removeProduit} disabled={produits.length <= 1}>
            - Supprimer un produit
          </button>
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Configuration des Machines</h2>
        
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Nom de la Machine</th>
                <th>Nombre d'Unités</th>
                <th>Capacité d'Outils</th>
                <th>Outils Disponibles</th>
                <th>Espace par Outil</th>
                <th>Capacité Totale<br/>({uniteTemps})</th>
              </tr>
            </thead>
            <tbody>
              {machines.map((machine, index) => (
                <tr key={index}>
                  <td>
                    <input
                      type="text"
                      value={machine.nom}
                      onChange={(e) => handleMachineChange(index, "nom", e.target.value)}
                      className={styles.input}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      min="1"
                      value={machine.nombre}
                      onChange={(e) => handleMachineChange(index, "nombre", e.target.value)}
                      className={styles.input}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      min="1"
                      value={machine.capaciteOutils}
                      onChange={(e) => handleMachineChange(index, "capaciteOutils", e.target.value)}
                      className={styles.input}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={machine.outilsDisponibles.join(', ')}
                      onChange={(e) => handleMachineChange(index, "outilsDisponibles", e.target.value)}
                      className={styles.input}
                      placeholder="A1, A2, A3"
                      title="Séparez les outils par des virgules"
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={machine.espaceOutils.join(', ')}
                      onChange={(e) => handleMachineChange(index, "espaceOutils", e.target.value)}
                      className={styles.input}
                      placeholder="1, 1, 1"
                      title="Espace requis pour chaque outil (séparez par des virgules)"
                    />
                  </td>
                  <td>
                    <div className={styles.metricCell} style={{ 
                      color: "#2563eb",
                      fontWeight: "bold"
                    }}>
                      {calculateCapaciteTotale(index).toFixed(1)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Configuration des Produits</h2>
        
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Nom du Produit</th>
                <th>Grandeur Commande<br/>(unités)</th>
                <th>Date d'Échéance<br/>(jours)</th>
                <th>Coût Inventaire<br/>({devises[devise].symbole}/unité)</th>
                {machines.map((machine, index) => (
                  <th key={index} colSpan="2" style={{ backgroundColor: "#1e40af" }}>
                    {machine.nom}
                    <br/>
                    <small style={{ fontWeight: "normal", opacity: "0.9" }}>
                      Temps ({uniteTemps}/u) | Outil requis
                    </small>
                  </th>
                ))}
                <th>Temps Total<br/>({uniteTemps})</th>
              </tr>
            </thead>
            <tbody>
              {produits.map((produit, produitIndex) => (
                <tr key={produitIndex}>
                  <td>
                    <input
                      type="text"
                      value={produit.nom}
                      onChange={(e) => handleProduitChange(produitIndex, "nom", e.target.value)}
                      className={styles.input}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      min="1"
                      value={produit.grandeurCommande}
                      onChange={(e) => handleProduitChange(produitIndex, "grandeurCommande", e.target.value)}
                      className={styles.input}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      min="1"
                      value={produit.dateDue}
                      onChange={(e) => handleProduitChange(produitIndex, "dateDue", e.target.value)}
                      className={styles.input}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={produit.coutInventaire}
                      onChange={(e) => handleProduitChange(produitIndex, "coutInventaire", e.target.value)}
                      className={styles.input}
                    />
                  </td>
                  {machines.map((machine, machineIndex) => (
                    <React.Fragment key={machineIndex}>
                      <td style={{ backgroundColor: "#f8fafc" }}>
                        <input
                          type="number"
                          min="0"
                          step="0.1"
                          value={produit.tempsOperations[machineIndex] || 0}
                          onChange={(e) => handleProduitChange(produitIndex, "tempsOperation", e.target.value, machineIndex)}
                          className={styles.input}
                          placeholder="0.0"
                        />
                      </td>
                      <td style={{ backgroundColor: "#f1f5f9" }}>
                        <select
                          value={produit.outils[machineIndex] || ""}
                          onChange={(e) => handleProduitChange(produitIndex, "outil", e.target.value, machineIndex)}
                          className={styles.select}
                        >
                          <option value="">Aucun outil</option>
                          {machine.outilsDisponibles.map((outil, outilIndex) => (
                            <option key={outilIndex} value={outil}>
                              {outil}
                            </option>
                          ))}
                        </select>
                        <small style={{ 
                          display: "block", 
                          fontSize: "0.7rem", 
                          color: "#6b7280", 
                          marginTop: "2px",
                          textAlign: "center"
                        }}>
                          {produit.outils[machineIndex] ? '✓ Sélectionné' : 'Choisir un outil'}
                        </small>
                      </td>
                    </React.Fragment>
                  ))}
                  <td>
                    <div className={styles.metricCell} style={{ 
                      color: "#10b981",
                      fontWeight: "bold"
                    }}>
                      {calculateTempsRequisProduit(produit).toFixed(2)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <button 
        onClick={handleSubmit} 
        disabled={isLoading}
        className={styles.calculateButton}
      >
        {isLoading ? "Optimisation en cours..." : "Optimiser avec Programmation Linéaire Mixte"}
      </button>

      {result && (
        <div className={`${styles.section} ${styles.resultsSection}`}>
          <h2 className={styles.resultsTitle}>Résultats de l'optimisation</h2>
          
          <div className={styles.resultsGrid}>
            <div className={styles.resultMetric}>
              <div className={styles.metricValue} style={{ 
                color: result.status === 'Optimal' ? '#10b981' : '#f59e0b' 
              }}>
                {result.status}
              </div>
              <div className={styles.metricLabel}>Statut de la Solution</div>
            </div>
            
            <div className={styles.resultMetric}>
              <div className={styles.metricValue}>
                {devises[devise].symbole}{result.cout_total_inventaire || 0}
              </div>
              <div className={styles.metricLabel}>Coût Total d'Inventaire</div>
            </div>
            
            <div className={styles.resultMetric}>
              <div className={styles.metricValue}>
                {result.efficacite_globale}%
              </div>
              <div className={styles.metricLabel}>Efficacité Globale</div>
            </div>
            
            <div className={styles.resultMetric}>
              <div className={styles.metricValue}>
                {result.nombre_produits_assignes}
              </div>
              <div className={styles.metricLabel}>Produits Assignés</div>
            </div>
          </div>

          <div className={styles.solutionDetails}>
            <h3>Utilisation des machines</h3>
            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Machine</th>
                    <th>Temps Utilisé</th>
                    <th>Temps Total</th>
                    <th>Utilisation (%)</th>
                    <th>Outils Utilisés</th>
                  </tr>
                </thead>
                <tbody>
                  {machines.map((machine, index) => {
                    const machine_key = machine.nom.toLowerCase().replace(' ', '_');
                    const temps_utilise = result[`temps_utilise_${machine_key}`] || 0;
                    const temps_total = result[`temps_disponible_total_${machine_key}`] || 0;
                    const utilisation = result[`utilisation_${machine_key}`] || 0;
                    const outils_utilises = result[`outils_utilises_${machine_key}`] || [];
                    const capacite = result[`capacite_outils_${machine_key}`] || 0;
                    
                    return (
                      <tr key={index}>
                        <td><strong>{machine.nom}</strong></td>
                        <td>{temps_utilise}{uniteTemps}</td>
                        <td>{temps_total}{uniteTemps}</td>
                        <td style={{ 
                          color: utilisation >= 80 ? "#10b981" : utilisation >= 50 ? "#f59e0b" : "#ef4444",
                          fontWeight: "bold"
                        }}>
                          {utilisation}%
                        </td>
                        <td>
                          {outils_utilises.join(", ") || "Aucun"} ({outils_utilises.length}/{capacite})
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {result.produits_assignes && result.produits_assignes.length > 0 && (
            <div className={styles.solutionDetails}>
              <h3>Produits assignés pour la production</h3>
              {renderProduitsAssignes(result.produits_assignes)}
            </div>
          )}

          {result.produits_non_assignes && result.produits_non_assignes.length > 0 && (
            <div className={styles.solutionDetails}>
              <h3>Produits non assignés</h3>
              <div className={styles.tableContainer}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Produit</th>
                      <th>Commande (unités)</th>
                      <th>Date Due (jours)</th>
                      <th>Coût Inventaire ({devises[devise].symbole})</th>
                      <th>Raison d'exclusion</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.produits_non_assignes.map((produit, index) => (
                      <tr key={index}>
                        <td><strong>{produit.nom}</strong></td>
                        <td>{produit.grandeur_commande}</td>
                        <td>{produit.date_due}</td>
                        <td>{devises[devise].symbole}{produit.cout_inventaire}</td>
                        <td style={{ color: "#6b7280", fontStyle: "italic" }}>
                          {produit.raison}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          {chartUrl && (
            <div className={styles.solutionDetails}>
              <h3>Analyse graphique</h3>
              <div className={styles.chartContainer}>
                <img 
                  src={chartUrl} 
                  alt="Graphique d'analyse FMS Lots de Production MIP" 
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