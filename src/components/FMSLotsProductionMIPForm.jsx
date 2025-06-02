import { useState } from "react";
import styles from "./FlowshopSPTForm.module.css";

export default function FMSLotsProductionMIPForm() {
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

  const [tempsDisponibleJour, setTempsDisponibleJour] = useState("420");
  const [uniteTemps, setUniteTemps] = useState("minutes");
  
  const [result, setResult] = useState(null);
  const [chartUrl, setChartUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_URL = "/api";

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

      console.log("Sending data to API:", JSON.stringify(requestData, null, 2));

      // Appel API pour les résultats
      fetch(`${API_URL}/fms/lots_production_mip`, {
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
          return fetch(`${API_URL}/fms/lots_production_mip/chart`, {
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
    link.download = "fms_lots_production_mip.png";
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
    
    return `${temps_utilise}min / ${temps_total}min (${utilisation}%)`;
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>FMS - Lots de Production (MIP)</h2>
      
      <div className={styles.unitSelector}>
        <label>Unité de temps :</label>
        <select value={uniteTemps} onChange={(e) => setUniteTemps(e.target.value)} className={styles.select}>
          <option value="minutes">minutes</option>
          <option value="heures">heures</option>
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
              step="1"
              min="1"
              value={tempsDisponibleJour}
              onChange={e => setTempsDisponibleJour(e.target.value)}
              className={styles.input}
              placeholder="420"
            />
          </div>

          <small className={styles.helpText}>
            <strong>Capacité totale :</strong> {machines.map((machine, index) => 
              `${machine.nom}: ${calculateCapaciteTotale(index).toFixed(0)} ${uniteTemps}`
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

            <div className={styles.taskRow}>
              <label>Outils disponibles (séparés par virgule) :</label>
              <input
                type="text"
                value={(machine.outilsDisponibles || []).join(", ")}
                onChange={(e) => handleMachineChange(index, "outilsDisponibles", e.target.value)}
                className={styles.input}
                placeholder="A1, A2, A3"
              />
            </div>

            <div className={styles.taskRow}>
              <label>Espace requis par outil (séparés par virgule) :</label>
              <input
                type="text"
                value={(machine.espaceOutils || []).join(", ")}
                onChange={(e) => handleMachineChange(index, "espaceOutils", e.target.value)}
                className={styles.input}
                placeholder="1, 1, 1"
              />
            </div>

            <small className={styles.helpText}>
              <strong>Capacité totale :</strong> {calculateCapaciteTotale(index).toFixed(0)} {uniteTemps} | 
              <strong> Outils:</strong> {(machine.outilsDisponibles || []).length} définis
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

            <div className={styles.taskRow}>
              <label>Date d'échéance (jours) :</label>
              <input
                type="number"
                min="1"
                value={produit.dateDue}
                onChange={(e) => handleProduitChange(produitIndex, "dateDue", e.target.value)}
                className={styles.input}
              />
            </div>

            <div className={styles.taskRow}>
              <label>Coût d'inventaire (par unité) :</label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={produit.coutInventaire}
                onChange={(e) => handleProduitChange(produitIndex, "coutInventaire", e.target.value)}
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
                  <select
                    value={produit.outils[machineIndex] || ""}
                    onChange={(e) => handleProduitChange(produitIndex, "outil", e.target.value, machineIndex)}
                    className={styles.select}
                  >
                    <option value="">-- Aucun outil --</option>
                    {(machine.outilsDisponibles || []).map((outil, outilIndex) => (
                      <option key={outilIndex} value={outil}>{outil}</option>
                    ))}
                  </select>
                </div>
              </div>
            ))}

            <small className={styles.helpText}>
              <strong>Temps total requis :</strong> {calculateTempsRequisProduit(produit).toFixed(2)} {uniteTemps} | 
              <strong> Coût total inventaire max :</strong> {(produit.coutInventaire * produit.grandeurCommande * produit.dateDue).toFixed(2)}
            </small>
          </div>
        ))}
      </div>

      <button 
        onClick={handleSubmit} 
        disabled={isLoading}
        className={styles.submitButton}
      >
        {isLoading ? "Optimisation MIP en cours..." : "Résoudre avec l'algorithme MIP"}
      </button>

      {error && <div className={styles.error}>{error}</div>}

      {result && (
        <div className={styles.results}>
          <h3>Résultats de l'algorithme MIP - Lots de production</h3>
          
          <div className={styles.metricsGrid}>
            <div>
              <strong>Statut :</strong> 
              <span style={{ color: result.statut_optimal ? '#10b981' : '#f59e0b' }}>
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
              <strong>Coût total inventaire :</strong> {result.cout_total_inventaire}
            </div>
            <div>
              <strong>Horizon planification :</strong> {result.horizon_planification} périodes
            </div>
            {machines.map((machine, index) => (
              <div key={index}>
                <strong>{machine.nom} :</strong> {renderResultsForMachine(machine.nom, result)}
              </div>
            ))}
            <div>
              <strong>Efficacité globale :</strong> {result.efficacite_globale}%
            </div>
          </div>

          {/* Planification par période */}
          {result.planification_periodes && result.planification_periodes.length > 0 && (
            <div className={styles.stationsSection}>
              <h4>Planification par période :</h4>
              {result.planification_periodes.map((periode, index) => (
                <div key={index} className={styles.stationBlock}>
                  <strong>Période {periode.numero}</strong>
                  {periode.produits.length > 0 ? (
                    <div>
                      {periode.produits.map((produit, prodIndex) => (
                        <div key={prodIndex} style={{ marginLeft: "1rem", marginTop: "0.5rem" }}>
                          • <strong>{produit.nom}:</strong> {produit.quantite} unités 
                          ({produit.pourcentage}% de {produit.quantite_totale}) 
                          - Due: Jour {produit.date_due}
                        </div>
                      ))}
                      <div style={{ marginTop: "0.5rem" }}>
                        <strong>Outils utilisés:</strong>
                        {Object.entries(periode.outils_utilises).map(([machine, outils]) => (
                          <span key={machine} style={{ marginLeft: "1rem" }}>
                            {machine}: {outils.length > 0 ? outils.join(", ") : "Aucun"}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div style={{ marginLeft: "1rem", color: "#6b7280" }}>
                      Aucune production planifiée
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {chartUrl && (
            <div className={styles.ganttContainer}>
              <h4>Analyse graphique de la planification MIP</h4>
              <img 
                src={chartUrl} 
                alt="Graphiques FMS Lots de Production MIP" 
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