import { useState } from "react";
import styles from "./FlowshopSPTForm.module.css";

export default function FMSLotsProductionGloutonForm() {
  // État des machines
  const [machines, setMachines] = useState([
    { nom: "Machine A", nombre: 3, capaciteOutils: 2 },
    { nom: "Machine B", nombre: 1, capaciteOutils: 2 }
  ]);

  const [produits, setProduits] = useState([
    { 
      nom: "Produit 1", 
      grandeurCommande: 5, 
      tempsOperations: [0.1, 0.3], 
      outils: ["A1", "B1"], 
      dateDue: 0 
    },
    { 
      nom: "Produit 2", 
      grandeurCommande: 10, 
      tempsOperations: [1.2, 0.0], 
      outils: ["A2", ""], 
      dateDue: 1 
    },
    { 
      nom: "Produit 3", 
      grandeurCommande: 25, 
      tempsOperations: [0.7, 0.4], 
      outils: ["A3", "B3"], 
      dateDue: 1 
    },
    { 
      nom: "Produit 4", 
      grandeurCommande: 10, 
      tempsOperations: [0.1, 0.2], 
      outils: ["A1", "B1"], 
      dateDue: 1 
    },
    { 
      nom: "Produit 5", 
      grandeurCommande: 4, 
      tempsOperations: [0.3, 0.2], 
      outils: ["A4", "B2"], 
      dateDue: 2 
    },
    { 
      nom: "Produit 6", 
      grandeurCommande: 10, 
      tempsOperations: [0.1, 0.3], 
      outils: ["A1", "B1"], 
      dateDue: 4 
    }
  ]);

  const [tempsDisponibleJour, setTempsDisponibleJour] = useState("12");
  const [uniteTemps, setUniteTemps] = useState("heures");
  
  const [result, setResult] = useState(null);
  const [chartUrl, setChartUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_URL = "/api";

  // Fonctions pour gérer les machines
  const addMachine = () => {
    const nouveauNom = `Machine ${String.fromCharCode(65 + machines.length)}`; // A, B, C, D...
    setMachines([...machines, { nom: nouveauNom, nombre: 1, capaciteOutils: 2 }]);
    
    // Ajouter une colonne à tous les produits
    const nouveauxProduits = produits.map(p => ({
      ...p,
      tempsOperations: [...p.tempsOperations, 0.5],
      outils: [...p.outils, ""]
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
    } else {
      nouvellesMachines[index][field] = parseInt(value) || 0;
    }
    setMachines(nouvellesMachines);
  };

  // Fonctions pour gérer les produits
  const addProduit = () => {
    const nouveauProduit = { 
      nom: `Produit ${produits.length + 1}`, 
      grandeurCommande: 10, 
      tempsOperations: new Array(machines.length).fill(0.5), 
      outils: new Array(machines.length).fill(""), 
      dateDue: 1 
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
    } else {
      nouveauxProduits[produitIndex][field] = parseFloat(value) || 0;
    }
    
    setProduits(nouveauxProduits);
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
      }

      // Validation des produits
      for (let i = 0; i < produits.length; i++) {
        const p = produits[i];
        if (p.grandeurCommande <= 0 || p.dateDue < 0) {
          setError(`Produit ${i + 1}: Les valeurs doivent être positives.`);
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
        temps_disponible_jour: tempsValue,
        noms_machines: machines.map(m => m.nom),
        nb_machines: machines.map(m => m.nombre),
        capacite_outils: machines.map(m => m.capaciteOutils),
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

  const calculateCapaciteTotale = (machineIndex) => {
    return parseFloat(tempsDisponibleJour || 0) * machines[machineIndex].nombre;
  };

  const calculateTempsRequisProduit = (produit) => {
    return produit.tempsOperations.reduce((total, temps, index) => 
      total + (temps * produit.grandeurCommande), 0
    );
  };

  const renderResultsForMachine = (nom_machine, result) => {
    const machine_key = nom_machine.toLowerCase().replace(' ', '_');
    const temps_utilise = result[`temps_utilise_${machine_key}`] || 0;
    const temps_total = result[`temps_disponible_total_${machine_key}`] || 0;
    const utilisation = result[`utilisation_${machine_key}`] || 0;
    
    return `${temps_utilise}h / ${temps_total}h (${utilisation}%)`;
  };

  const renderProduitsAssignes = (produits_assignes) => {
    return produits_assignes.map((produit, index) => (
      <div key={index} className={styles.stationBlock}>
        <strong>{produit.nom}</strong> (Date due: Jour {produit.date_due})
        <br />
        Quantité assignée : {produit.quantite_assignee}/{produit.quantite_totale} unités ({produit.pourcentage_assigne}%)
        <br />
        {machines.map((machine, machineIndex) => {
          const machine_key = machine.nom.toLowerCase().replace(' ', '_');
          const temps = produit[`temps_${machine_key}`];
          const outil = produit[`outil_${machine_key}`];
          return (
            <span key={machineIndex}>
              {machine.nom}: {temps || 0}h{outil ? ` (${outil})` : ''} | 
            </span>
          );
        })}
        <br />
        <small className={styles.helpText}>
          Outils utilisés par machine
        </small>
      </div>
    ));
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

          <small className={styles.helpText}>
            <strong>Capacité totale :</strong> {machines.map((machine, index) => 
              `${machine.nom}: ${calculateCapaciteTotale(index).toFixed(1)} ${uniteTemps}`
            ).join(' | ')}
          </small>
        </div>

        <div className={styles.buttonGroup}>
          <button className={styles.button} onClick={addMachine}>+ Ajouter un type de machine</button>
          <button className={styles.button} onClick={removeMachine}>- Supprimer un type de machine</button>
        </div>

        {/* Configuration des machines */}
        {machines.map((machine, index) => (
          <div key={index} className={styles.jobBlock}>
            <h4>{machine.nom}</h4>
            
            <div className={styles.taskRow}>
              <label>Nom de la machine :</label>
              <input
                type="text"
                value={machine.nom}
                onChange={(e) => handleMachineChange(index, "nom", e.target.value)}
                className={styles.input}
              />
            </div>

            <div className={styles.taskRow}>
              <label>Nombre de machines :</label>
              <input
                type="number"
                min="1"
                value={machine.nombre}
                onChange={(e) => handleMachineChange(index, "nombre", e.target.value)}
                className={styles.input}
              />
            </div>

            <div className={styles.taskRow}>
              <label>Capacité d'outils :</label>
              <input
                type="number"
                min="1"
                value={machine.capaciteOutils}
                onChange={(e) => handleMachineChange(index, "capaciteOutils", e.target.value)}
                className={styles.input}
              />
            </div>

            <small className={styles.helpText}>
              <strong>Capacité totale :</strong> {calculateCapaciteTotale(index).toFixed(1)} {uniteTemps}
            </small>
          </div>
        ))}
      </div>

      <div className={styles.buttonGroup}>
        <button className={styles.button} onClick={addProduit}>+ Ajouter un produit</button>
        <button className={styles.button} onClick={removeProduit}>- Supprimer un produit</button>
      </div>

      {/* Configuration des produits */}
      <div className={styles.tasksContainer}>
        <h4 className={styles.subtitle}>Configuration des produits</h4>
        
        {produits.map((produit, produitIndex) => (
          <div key={produitIndex} className={styles.jobBlock}>
            <h4>{produit.nom}</h4>
            
            <div className={styles.taskRow}>
              <label>Nom du produit :</label>
              <input
                type="text"
                value={produit.nom}
                onChange={(e) => handleProduitChange(produitIndex, "nom", e.target.value)}
                className={styles.input}
              />
            </div>

            <div className={styles.taskRow}>
              <label>Grandeur de commande (unités) :</label>
              <input
                type="number"
                min="1"
                value={produit.grandeurCommande}
                onChange={(e) => handleProduitChange(produitIndex, "grandeurCommande", e.target.value)}
                className={styles.input}
              />
            </div>

            {/* Temps d'opération et outils pour chaque machine */}
            {machines.map((machine, machineIndex) => (
              <div key={machineIndex}>
                <div className={styles.taskRow}>
                  <label>Temps opération {machine.nom} ({uniteTemps}/unité) :</label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={produit.tempsOperations[machineIndex] || 0}
                    onChange={(e) => handleProduitChange(produitIndex, "tempsOperation", e.target.value, machineIndex)}
                    className={styles.input}
                  />
                </div>

                <div className={styles.taskRow}>
                  <label>Outil requis {machine.nom} :</label>
                  <input
                    type="text"
                    value={produit.outils[machineIndex] || ""}
                    onChange={(e) => handleProduitChange(produitIndex, "outil", e.target.value, machineIndex)}
                    className={styles.input}
                    placeholder={`Outil ${machine.nom.slice(-1)}1`}
                  />
                </div>
              </div>
            ))}

            <div className={styles.taskRow}>
              <label>Date d'échéance (jours) :</label>
              <input
                type="number"
                min="0"
                value={produit.dateDue}
                onChange={(e) => handleProduitChange(produitIndex, "dateDue", e.target.value)}
                className={styles.input}
              />
            </div>

            <small className={styles.helpText}>
              <strong>Temps total requis :</strong> {calculateTempsRequisProduit(produit).toFixed(2)} {uniteTemps} | 
              {machines.map((machine, machineIndex) => 
                ` ${machine.nom}: ${(produit.tempsOperations[machineIndex] * produit.grandeurCommande).toFixed(2)}h`
              ).join(' |')}
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
            {machines.map((machine, index) => (
              <div key={index}>
                <strong>{machine.nom} :</strong> {renderResultsForMachine(machine.nom, result)}
              </div>
            ))}
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
              {renderProduitsAssignes(result.produits_assignes)}
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
              {machines.map((machine, index) => {
                const machine_key = machine.nom.toLowerCase().replace(' ', '_');
                const outils_utilises = result[`outils_utilises_${machine_key}`] || [];
                const capacite = result[`capacite_outils_${machine_key}`] || 0;
                return (
                  <div key={index}>
                    <strong>{machine.nom} :</strong> {outils_utilises.join(", ") || "Aucun"} 
                    ({outils_utilises.length}/{capacite})
                    <br />
                  </div>
                );
              })}
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