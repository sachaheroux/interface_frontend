import React, { useState } from "react";
import styles from "./FMSSacADosForm.module.css";
import config from "../config.js";

export default function FMSLotsProductionMIPForm() {
  // Configuration système
  const [tempsDisponibleJour, setTempsDisponibleJour] = useState("420");
  const [uniteTemps, setUniteTemps] = useState("minutes");
  const [devise, setDevise] = useState("CAD");
  
  // État des machines avec données par défaut du collègue (avec gestion d'espace)
  const [machines, setMachines] = useState([
    { nom: "Machine A", nombre: 1, capaciteOutils: 5, outilsDisponibles: ["A1", "A2", "A3"], espaceOutils: [1, 2, 3] },
    { nom: "Machine B", nombre: 1, capaciteOutils: 4, outilsDisponibles: ["B1", "B2"], espaceOutils: [2, 2] }
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
      capaciteOutils: 5, 
      outilsDisponibles: [`${nouveauNom.slice(-1)}1`, `${nouveauNom.slice(-1)}2`], 
      espaceOutils: [2, 2] 
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

  // Fonctions pour gérer les outils de machines (style JobShop)
  const addOutilToMachine = (machineIndex) => {
    const nouvellesMachines = [...machines];
    const machine = nouvellesMachines[machineIndex];
    const nouveauNom = `${machine.nom.slice(-1)}${(machine.outilsDisponibles.length + 1)}`;
    machine.outilsDisponibles.push(nouveauNom);
    machine.espaceOutils.push(1);
    setMachines(nouvellesMachines);
  };

  const removeOutilFromMachine = (machineIndex, outilIndex) => {
    const nouvellesMachines = [...machines];
    const machine = nouvellesMachines[machineIndex];
    if (machine.outilsDisponibles.length > 1) {
      machine.outilsDisponibles.splice(outilIndex, 1);
      machine.espaceOutils.splice(outilIndex, 1);
      setMachines(nouvellesMachines);
      
      // Nettoyer les références à cet outil dans les produits
      const nouveauxProduits = produits.map(p => ({
        ...p,
        outils: p.outils.map((outil, index) => 
          index === machineIndex && !machine.outilsDisponibles.includes(outil) ? "" : outil
        )
      }));
      setProduits(nouveauxProduits);
    }
  };

  const updateOutilNom = (machineIndex, outilIndex, nouveauNom) => {
    const nouvellesMachines = [...machines];
    const ancienNom = nouvellesMachines[machineIndex].outilsDisponibles[outilIndex];
    nouvellesMachines[machineIndex].outilsDisponibles[outilIndex] = nouveauNom;
    setMachines(nouvellesMachines);
    
    // Mettre à jour les références dans les produits
    const nouveauxProduits = produits.map(p => ({
      ...p,
      outils: p.outils.map((outil, index) => 
        index === machineIndex && outil === ancienNom ? nouveauNom : outil
      )
    }));
    setProduits(nouveauxProduits);
  };

  const updateOutilEspace = (machineIndex, outilIndex, nouvelEspace) => {
    const nouvellesMachines = [...machines];
    nouvellesMachines[machineIndex].espaceOutils[outilIndex] = parseInt(nouvelEspace) || 1;
    setMachines(nouvellesMachines);
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
        const espaceTotal = m.espaceOutils.reduce((sum, espace) => sum + espace, 0);
        if (espaceTotal > m.capaciteOutils) {
          setError(`Machine ${m.nom}: L'espace total des outils (${espaceTotal}) dépasse la capacité (${m.capaciteOutils}).`);
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
    if (!produits_assignes || produits_assignes.length === 0) {
      return <p style={{ color: "#6b7280", fontStyle: "italic" }}>Aucun produit assigné</p>;
    }
    
    return produits_assignes.map((produit, index) => (
      <div key={index} className={styles.solutionDetails} style={{ marginBottom: "1rem" }}>
        <strong>{produit.nom}</strong> (Date due: Jour {produit.date_due || produit.dateDue})
        <br />
        Quantité assignée : {produit.quantite_assignee || produit.quantiteAssignee || produit.grandeurCommande}/{produit.quantite_totale || produit.grandeurCommande} unités
        {produit.pourcentage_assigne && <span> ({produit.pourcentage_assigne}%)</span>}
        <br />
        Coût d'inventaire : {devises[devise].symbole}{produit.cout_inventaire_total || produit.coutInventaire || 0}
        <br />
        {machines.map((machine, machineIndex) => {
          const machine_key = machine.nom.toLowerCase().replace(' ', '_');
          const temps = produit[`temps_${machine_key}`] || produit.tempsOperations?.[machineIndex] || 0;
          const outil = produit[`outil_${machine_key}`] || produit.outils?.[machineIndex] || '';
          return (
            <span key={machineIndex}>
              {machine.nom}: {temps}{uniteTemps}{outil ? ` (${outil})` : ''} | 
            </span>
          );
        })}
        <br />
        <small style={{ color: "#6b7280", fontStyle: "italic" }}>
          Temps de traitement par machine {outil ? 'et outils utilisés' : ''}
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
        <div className={styles.configInfo} style={{ marginBottom: "1rem", padding: "1rem", backgroundColor: "#f0f9ff", borderLeft: "4px solid #0ea5e9", fontSize: "0.9rem" }}>
          <strong>💡 Contrainte d'Espace Outil :</strong> Chaque machine a une capacité limitée d'espace pour les outils. 
          L'algorithme MIP optimise le choix des outils selon leur espace requis.
          <br/>
          <strong>Exemple :</strong> Machine avec capacité 5, outils A1(1), A2(2), A3(3) → ne peut pas tout avoir simultanément.
        </div>
        
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Nom de la Machine</th>
                <th>Nombre d'Unités</th>
                <th>Capacité Espace<br/><small>(unités d'espace)</small></th>
                <th>Outils Disponibles</th>
                <th>Actions</th>
                <th>Capacité Temps<br/>({uniteTemps})</th>
                <th>Validation Espace</th>
              </tr>
            </thead>
            <tbody>
              {machines.map((machine, index) => {
                const espaceTotal = machine.espaceOutils ? machine.espaceOutils.reduce((sum, espace) => sum + espace, 0) : 0;
                const isEspaceValid = espaceTotal <= machine.capaciteOutils;
                return (
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
                      <div className={styles.outilsCompact}>
                        {machine.outilsDisponibles.map((outil, outilIndex) => (
                          <div key={outilIndex} className={styles.outilCompact}>
                            <div className={styles.outilNumber}>{outilIndex + 1}</div>
                            <input
                              type="text"
                              value={outil}
                              onChange={(e) => updateOutilNom(index, outilIndex, e.target.value)}
                              className={styles.compactInput}
                              placeholder={`${machine.nom.slice(-1)}${outilIndex + 1}`}
                              title={`Nom de l'outil ${outilIndex + 1}`}
                            />
                            <input
                              type="number"
                              value={machine.espaceOutils[outilIndex]}
                              onChange={(e) => updateOutilEspace(index, outilIndex, e.target.value)}
                              className={styles.compactNumberInput}
                              min="1"
                              placeholder="1"
                              title={`Espace requis (unités)`}
                            />
                            <button
                              onClick={() => removeOutilFromMachine(index, outilIndex)}
                              disabled={machine.outilsDisponibles.length <= 1}
                              className={styles.miniButton}
                              type="button"
                              title="Supprimer cet outil"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td>
                      <div className={styles.machineActionsCompact}>
                        <button
                          onClick={() => addOutilToMachine(index)}
                          className={styles.miniButton}
                          type="button"
                          title="Ajouter un outil"
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td>
                      <div className={styles.metricCell} style={{ 
                        color: "#2563eb",
                        fontWeight: "bold"
                      }}>
                        {calculateCapaciteTotale(index).toFixed(1)}
                      </div>
                    </td>
                    <td>
                      <div className={styles.metricCell} style={{ 
                        color: isEspaceValid ? "#10b981" : "#ef4444",
                        fontWeight: "bold",
                        fontSize: "0.8rem"
                      }}>
                        {espaceTotal}/{machine.capaciteOutils}
                        <br/>
                        {isEspaceValid ? "✓ OK" : "⚠️ Trop"}
                      </div>
                    </td>
                  </tr>
                );
              })}
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
                          {machine.outilsDisponibles.map((outil, outilIndex) => {
                            const espaceOutil = machine.espaceOutils[outilIndex] || 1;
                            return (
                              <option key={outilIndex} value={outil}>
                                {outil} (espace: {espaceOutil})
                              </option>
                            );
                          })}
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
                {result.status || 'Non défini'}
              </div>
              <div className={styles.metricLabel}>Statut de la Solution</div>
            </div>
            
            <div className={styles.resultMetric}>
              <div className={styles.metricValue}>
                {devises[devise].symbole}{result.cout_total_inventaire || result.cout_inventaire_total || 0}
              </div>
              <div className={styles.metricLabel}>Coût Total d'Inventaire</div>
            </div>
            
            <div className={styles.resultMetric}>
              <div className={styles.metricValue}>
                {result.efficacite_globale || '0'}%
              </div>
              <div className={styles.metricLabel}>Efficacité Globale</div>
            </div>
            
            <div className={styles.resultMetric}>
              <div className={styles.metricValue}>
                {result.nombre_produits_assignes || (result.produits_assignes ? result.produits_assignes.length : 0)}
              </div>
              <div className={styles.metricLabel}>Produits Assignés</div>
            </div>
            
            <div className={styles.resultMetric}>
              <div className={styles.metricValue}>
                {result.nombre_produits_rejetes || (result.produits_non_assignes ? result.produits_non_assignes.length : 0)}
              </div>
              <div className={styles.metricLabel}>Produits Rejetés</div>
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
                    <th>Espace Utilisé</th>
                  </tr>
                </thead>
                <tbody>
                  {machines.map((machine, index) => {
                    const machine_key = machine.nom.toLowerCase().replace(' ', '_');
                    const temps_utilise = result[`temps_utilise_${machine_key}`] || 0;
                    const temps_total = result[`temps_disponible_total_${machine_key}`] || 0;
                    const utilisation = result[`utilisation_${machine_key}`] || 0;
                    const outils_utilises = result[`outils_utilises_${machine_key}`] || [];
                    const espace_utilise = result[`espace_utilise_${machine_key}`] || 0;
                    const capacite = result[`capacite_outils_${machine_key}`] || machine.capaciteOutils;
                    
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
                          {outils_utilises.join(", ") || "Aucun"} 
                          <br/>
                          <small style={{ color: "#6b7280" }}>({outils_utilises.length} outils)</small>
                        </td>
                        <td style={{ 
                          color: espace_utilise <= capacite ? "#10b981" : "#ef4444",
                          fontWeight: "bold"
                        }}>
                          {espace_utilise}/{capacite}
                          <br/>
                          <small style={{ color: "#6b7280" }}>unités</small>
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